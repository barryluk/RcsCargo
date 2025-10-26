
using DbUtils;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using ICSharpCode.SharpZipLib.Zip;
using Kendo.Mvc.Infrastructure;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Reporting.DataService.AirFreightReport;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data.Entity.Infrastructure;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Security.Policy;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using System.Xml.Linq;

namespace RcsCargoWeb.Controllers
{
    public class FileManagerData
    {
        public string name { get; set; }
        public bool isDirectory { get; set; }
        public bool hasDirectories { get; set; }
        public string path { get; set; }
        public string extension { get; set; }
        public long size { get; set; }
        public DateTime created { get; set; }
        public DateTime createdUtc { get; set; }
        public DateTime modified { get; set; }
        public DateTime modifiedUtc { get; set; }
        public string userId { get; set; }
        public string modifiedUserId { get; set; }
    }

    public class CamRecordFile
    {
        public string FileName { get; set; }
        public string CamId { get; set; }
        public string DateFolder { get; set; }
        public long Size { get; set; }
        public DateTime CreateDate { get; set; }
    }

    [CheckToken]
    public class FileStationController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        string[] camIds = { "78DF723EB876", "78DF723EAC16" };
        DbUtils.Admin admin = new DbUtils.Admin();
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();

        public ActionResult GetDirectories(string target, string userId)
        {
            var fsData = new List<FileManagerData>();
            var fsPath = string.Empty;
            if (string.IsNullOrEmpty(target))
                fsPath = Path.Combine(new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString(), "FileStation");
            else
                fsPath = target;

            DirectoryInfo dirInfo = new DirectoryInfo(fsPath);
            foreach (var dir in dirInfo.GetDirectories("*.*", SearchOption.TopDirectoryOnly))
            {
                if (HasAccessRight(dir.FullName, "READ", userId))
                {
                    fsData.Add(new FileManagerData
                    {
                        name = dir.Name,
                        path = dir.FullName,
                        isDirectory = true,
                        extension = string.Empty,
                        created = dir.CreationTime,
                        createdUtc = dir.CreationTimeUtc,
                        modified = dir.LastWriteTime,
                        modifiedUtc = dir.LastWriteTimeUtc,
                        size = 0,
                    });
                }
            }

            if (HasAccessRight(fsPath, "READ", userId))
            {
                foreach (var file in dirInfo.GetFiles("*.*", SearchOption.TopDirectoryOnly))
                {
                    fsData.Add(new FileManagerData
                    {
                        name = file.Name.Replace(file.Extension, string.Empty),
                        path = file.FullName,
                        isDirectory = false,
                        extension = file.Extension,
                        created = file.CreationTime,
                        createdUtc = file.CreationTimeUtc,
                        modified = file.LastWriteTime,
                        modifiedUtc = file.LastWriteTimeUtc,
                        size = file.Length,
                    });
                }
            }

            return Json(fsData, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetAccessRight(string path, string accessType)
        {
            return Json(masterRecord.GetFileStationAccessRight(path, accessType), JsonRequestBehavior.AllowGet);
        }

        public bool HasAccessRight(string path, string accessType, string userId)
        {
            var accessRight = masterRecord.GetFileStationAccessRight(path, accessType);
            if (admin.GetUser(userId).USER_TYPE == "A")
                return true;

            if (accessRight == null)
                return false;
            else
                return accessRight.USERS.Split(',').Contains(userId) ? true : false;
        }

        public ActionResult GetRecentFiles(string userId)
        {
            var serverPath = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            //var recentFiles = masterRecord.GetRecentFiles();
            //foreach (var file in recentFiles)
            //    file.PATH = file.PATH.Replace(serverPath, string.Empty);
            var recentFiles = new DirectoryInfo(Path.Combine(serverPath, "FileStation")).GetFiles("*.*", SearchOption.AllDirectories)
                .OrderByDescending(a => a.CreationTime).Take(20);
            var logs = masterRecord.GetRecentFileLogs(100);
            var fmData = new List<FileManagerData>();
            foreach (var file in recentFiles)
            {
                var createLog = logs.Where(a => a.PATH == file.FullName).OrderBy(a => a.LOG_TIME).FirstOrDefault();
                var modifyLog = logs.Where(a => a.PATH == file.FullName).OrderBy(a => a.LOG_TIME).LastOrDefault();

                if (createLog == null)
                    createLog = logs.Where(a => a.LOG_TIME.ToString("yyyyMMddHHmmss") == file.CreationTime.ToString("yyyyMMddHHmmss")).FirstOrDefault();
                if (modifyLog == null)
                    modifyLog = logs.Where(a => a.LOG_TIME.ToString("yyyyMMddHHmmss") == file.LastWriteTime.ToString("yyyyMMddHHmmss")).LastOrDefault();

                //var uploadUser = string.Empty;
                //if (logs.Count(a => a.PATH == file.FullName) > 0)
                //    uploadUser = logs.Where(a => a.PATH == file.FullName).OrderByDescending(a => a.LOG_TIME).FirstOrDefault().USER_ID;
                //else
                //{
                //    if (logs.Count(a => a.LOG_TIME.ToString("yyyyMMddHHmmss") == file.CreationTime.ToString("yyyyMMddHHmmss")) > 0)
                //        uploadUser = logs.Where(a => a.LOG_TIME.ToString("yyyyMMddHHmmss") == file.CreationTime.ToString("yyyyMMddHHmmss")).FirstOrDefault().USER_ID;
                //}

                if (HasAccessRight(file.FullName, "READ", userId))
                {
                    fmData.Add(new FileManagerData
                    {
                        name = file.Name,
                        path = file.FullName,
                        isDirectory = false,
                        extension = file.Extension,
                        created = file.CreationTime,
                        createdUtc = file.CreationTimeUtc,
                        modified = file.LastWriteTime,
                        modifiedUtc = file.LastWriteTimeUtc,
                        size = file.Length,
                        userId = createLog == null ? string.Empty : createLog.USER_ID,
                        modifiedUserId = modifyLog == null ? string.Empty : modifyLog.USER_ID,
                    });
                }
            }

            return Json(fmData, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Create(string name, string extension, bool isDirectory, string path, string target)
        {
            var userId = HttpContext.Request.QueryString["userId"].Trim();
            if (HasAccessRight(target, "ADD", userId))
            {
                if (isDirectory)
                    Directory.CreateDirectory(Path.Combine(target, name));
                else
                    System.IO.File.Copy(path, Path.Combine(target, name + extension));

                return Json(new FileManagerData
                {
                    name = name,
                    path = Path.Combine(target, name),
                    isDirectory = isDirectory,
                    extension = extension,
                    created = DateTime.Now,
                    createdUtc = DateTime.Now,
                    modified = DateTime.Now,
                    modifiedUtc = DateTime.Now,
                    size = 0,
                });
            }

            return null;
        }

        public ActionResult Rename(string name, string path, string extension, bool isDirectory)
        {
            var userId = HttpContext.Request.QueryString["userId"].Trim();
            if (HasAccessRight(path, "MODIFY", userId))
            {
                try
                {
                    var dir = new DirectoryInfo(path);
                    if (isDirectory)
                        Directory.Move(path, path.Replace(dir.Name, name));
                    else
                        System.IO.File.Move(path, path.Replace(dir.Name, name) + extension);

                    var newDir = new DirectoryInfo(path.Replace(dir.Name, name));

                    return Json(new FileManagerData
                    {
                        name = name,
                        path = newDir.FullName,
                        isDirectory = isDirectory,
                        extension = extension,
                        created = newDir.CreationTime,
                        createdUtc = newDir.CreationTimeUtc,
                        modified = newDir.LastWriteTime,
                        modifiedUtc = newDir.LastWriteTimeUtc,
                        size = 0,
                    });
                }
                catch (Exception ex)
                {
                    log.Error(ex);
                }
            }

            return null;
        }

        public ActionResult Delete(string name, string path, bool isDirectory)
        {
            var userId = HttpContext.Request.QueryString["userId"].Trim();
            if (HasAccessRight(path, "DELETE", userId))
            {
                if (isDirectory)
                    Directory.Delete(path, true);
                else
                    System.IO.File.Delete(path);

                return Json(new FileManagerData
                {
                    name = name,
                    path = path,
                    isDirectory = isDirectory,
                });
            }

            return null;
        }

        [HttpPost]
        public ActionResult UploadFiles(HttpPostedFileBase file, string path, string userId)
        {
            if (HasAccessRight(path, "ADD", userId))
            {
                file.SaveAs(Path.Combine(path, file.FileName));
                var fileInfo = new FileInfo(Path.Combine(path, file.FileName));
                masterRecord.AddFileStationLog(new FileStationLog
                {
                    ID = DbUtils.Utils.NewGuid(),
                    LOG_TIME = DateTime.Now,
                    USER_ID = userId,
                    NAME = fileInfo.Name.Replace(fileInfo.Extension, string.Empty),
                    PATH = fileInfo.FullName,
                    EXTENSION = fileInfo.Extension,
                });

                return Json(new FileManagerData
                {
                    name = fileInfo.Name.Replace(fileInfo.Extension, string.Empty),
                    path = fileInfo.FullName,
                    isDirectory = false,
                    extension = fileInfo.Extension,
                    created = fileInfo.CreationTime,
                    createdUtc = fileInfo.CreationTimeUtc,
                    modified = fileInfo.LastWriteTime,
                    modifiedUtc = fileInfo.LastWriteTimeUtc,
                    size = fileInfo.Length,
                });
            }
            return null;
        }

        public ActionResult DownloadFile(string path, string name)
        {
            //var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            //var doc = air.GetHawbDocByDocId(docId);
            FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read);

            byte[] fileByte = new byte[fs.Length];
            fs.Read(fileByte, 0, (int)fs.Length);
            fs.Flush();
            fs.Close();

            Response.AppendHeader("Content-Disposition", $"attachment;filename={name}");
            return File(fileByte, $"application/{name.Substring(name.LastIndexOf(".") + 1)}");
        }

        public ActionResult GetRecentCamRecords()
        {
            var camRecordsPath = Path.Combine(new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString(), "CamRecords");
            var camRecords = string.Empty;

            foreach (var camId in camIds)
            {
                if (Directory.Exists(Path.Combine(camRecordsPath, camId, DateTime.Now.ToString("yyyyMMdd"))))
                {
                    var recentFiles = new DirectoryInfo(Path.Combine(camRecordsPath, camId, DateTime.Now.ToString("yyyyMMdd"))).GetFiles();
                    foreach (var file in recentFiles)
                        camRecords += $"{file.Name.Substring(0, file.Name.IndexOf('-'))}.mp4;";
                }
            }

            return Content(camRecords.Length > 0 ? camRecords.Substring(0, camRecords.Length - 1) : string.Empty, "text/plain");
        }

        public ActionResult GetCamRecordDateFolders(string camId)
        {
            var path = Path.Combine(new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString(), "CamRecords", camId);
            var folders = new DirectoryInfo(path).GetDirectories();
            List<string> folderName = new List<string>();
            foreach (var folder in folders)
                folderName.Add(folder.Name);

            return Json(folderName.OrderByDescending(a => a), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCamRecordFiles(string camId, string dateFolder)
        {
            var path = Path.Combine(new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString(), "CamRecords", camId, dateFolder);
            var files = new DirectoryInfo(path).GetFiles();
            List<CamRecordFile> recordFiles = new List<CamRecordFile>();
            foreach (var file in files)
            {
                recordFiles.Add(new CamRecordFile
                {
                    FileName = file.Name,
                    DateFolder = dateFolder,
                    CamId = camId,
                    Size = file.Length,
                    CreateDate = DateTime.ParseExact($"{dateFolder}{file.Name.Substring(file.Name.IndexOf('-') + 1, 6)}", "yyyyMMddHHmmss", null)
                });
            }

            return Json(recordFiles.OrderByDescending(a => a.CreateDate), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UploadCamFile()
        {
            try
            {
                var camRecordsPath = Path.Combine(new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString(), "CamRecords");
                var request = HttpContext.Request;
                var file = request.InputStream;
                var fileByte = new byte[file.Length];
                file.Read(fileByte, 0, fileByte.Length);
                file.Close();

                var dateFolder = DateTime.Now.ToString("yyyyMMdd");
                var fileName = request.Headers["filename"];
                var camId = request.Headers["camId"];
                var time = request.Headers["time"];

                if (!Directory.Exists(Path.Combine(camRecordsPath, camId, dateFolder, fileName)))
                    Directory.CreateDirectory(Path.Combine(camRecordsPath, camId, dateFolder));

                var fs = new FileStream(Path.Combine(camRecordsPath, camId, dateFolder,
                    $"{fileName.Substring(0, fileName.IndexOf('.'))}-{time}.mp4"), FileMode.Create, FileAccess.Write);
                fs.Write(fileByte, 0, fileByte.Length);
                fs.Close();

                return Content($"{fileName.Substring(0, fileName.IndexOf('.'))}-{time}.mp4");
            }
            catch (Exception ex)
            {
                log.Error(ex);
                return Content(ex.Message);
            }
        }

        public ActionResult GetCamRecord(string camId, string dateFolder, string filename)
        {
            var camRecordsPath = Path.Combine(new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString(), "CamRecords", camId, dateFolder);
            FileStream fs = new FileStream(Path.Combine(camRecordsPath, filename), FileMode.Open, FileAccess.Read);

            byte[] fileByte = new byte[fs.Length];
            fs.Read(fileByte, 0, (int)fs.Length);
            fs.Flush();
            fs.Close();

            Response.AppendHeader("Content-Type", "video/mp4");
            return File(fileByte, "video/mp4");
        }

        public ActionResult TestUpload()
        {
            //var camFileContent = new ByteArrayContent(System.IO.File.ReadAllBytes(@"C:\Users\daydr\Downloads\07M50S_1752228470.mp4"));
            //camFileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("video/mp4");

            //HttpClient client = new HttpClient();
            //var form = new MultipartFormDataContent();
            //form.Add(new StringContent("07M50S_1752228470.mp4"), "fileName");
            //form.Add(new StringContent("CAM01"), "camId");
            //form.Add(camFileContent, "camFile");

            //client.PostAsync("http://localhost:53696/FileStation/UploadCamFile", form);

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://localhost:53696/FileStation/UploadCamFile");
            request.ContentType = "multipart/form-data;";
            request.Method = "POST";
            request.KeepAlive = true;
            request.Headers.Add("filename: 07M50S_1752228470.mp4");

            //string headerTemplate = @"Content-Disposition: form-data; 07M50S_1752228470.mp4; Content-Type: video/mp4";
            var requestStream = request.GetRequestStream();
            byte[] fileBytes = System.IO.File.ReadAllBytes(@"C:\Users\daydr\Downloads\07M50S_1752228470.mp4");
            requestStream.Write(fileBytes, 0, fileBytes.Length);

            var response = request.GetResponse();

            Stream stream2 = response.GetResponseStream();
            StreamReader reader2 = new StreamReader(stream2);
            return Content(reader2.ReadToEnd());

        }

        public ActionResult GetShaFileTransferList()
        {
            var files = masterRecord.GetShaFileTransferList();
            var fileNames = string.Empty;
            foreach (var file in files)
            {
                fileNames += file.FILE_ID + "|" + file.FILE_PATH + "\r\n";
            }

            return Content(fileNames.Trim(), "text/plain");
        }

        [HttpPost]
        public ActionResult UploadShaFile()
        {
            try
            {
                var fileServerPath = @"\\fs2020\FileSharing\SHA";
                var request = HttpContext.Request;
                var file = request.InputStream;
                var fileByte = new byte[file.Length];
                file.Read(fileByte, 0, fileByte.Length);
                file.Close();

                //Http headers / form body data need to UrlDecode
                var fileId = HttpUtility.UrlDecode(request.Headers["fileId"]);
                var fileName = HttpUtility.UrlDecode(request.Headers["filename"]);
                var path = HttpUtility.UrlDecode(request.Headers["path"]);
                path = path.Substring(3);       //remove the driver letter from the path e.g.: E:\rcs-account\01.txt  => rcs-account\01.txt

                //Create directory if not exist
                if (!Pri.LongPath.Directory.Exists(Path.Combine(fileServerPath, path)))
                    Pri.LongPath.Directory.CreateDirectory(Path.Combine(fileServerPath, path));
                
                //Handle long path exception
                if (Path.Combine(fileServerPath, path, fileName).Length > 220)
                {
                    var fs = new FileStream(Path.Combine(fileServerPath, "temp", fileName), FileMode.Create, FileAccess.Write);
                    fs.Write(fileByte, 0, fileByte.Length);
                    fs.Close();

                    Pri.LongPath.File.Move(Path.Combine(fileServerPath, "temp", fileName), Path.Combine(fileServerPath, path, fileName));
                }
                else
                {
                    var fs = new FileStream(Path.Combine(fileServerPath, path, fileName), FileMode.Create, FileAccess.Write);
                    fs.Write(fileByte, 0, fileByte.Length);
                    fs.Close();
                }

                //log.Debug(Path.Combine(HttpUtility.UrlDecode(request.Headers["path"]), fileName));
                masterRecord.UpdateShaFileTransferStatus(Path.Combine(HttpUtility.UrlDecode(request.Headers["path"]), fileName), "SUCCESS", string.Empty);

                return Content(Path.Combine(fileServerPath, path, fileName));
            }
            catch (Exception ex)
            {
                log.Error(ex);
                var request = HttpContext.Request;
                masterRecord.UpdateShaFileTransferStatus(Path.Combine(HttpUtility.UrlDecode(request.Headers["path"]), HttpUtility.UrlDecode(request.Headers["filename"])), "FAILED", ex.Message);
                return Content(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult UploadShaChunkFile()
        {
            try
            {
                var fileServerPath = @"\\fs2020\FileSharing\SHA\temp";
                var request = HttpContext.Request;
                var file = request.InputStream;
                var fileByte = new byte[file.Length];
                file.Read(fileByte, 0, fileByte.Length);
                file.Close();

                //Http headers / form body data need to UrlDecode
                var fileId = HttpUtility.UrlDecode(request.Headers["fileId"]);
                var chunkIndex = Convert.ToDecimal(request.Headers["chunkIndex"]);
                var chunkSize = Convert.ToDecimal(request.Headers["chunkSize"]);
                var fileLength = Convert.ToDecimal(request.Headers["fileLength"]);

                var fs = new FileStream(Path.Combine(fileServerPath, HttpUtility.UrlEncode(fileId) + "_" + chunkIndex.ToString()), FileMode.Create, FileAccess.Write);
                fs.Write(fileByte, 0, fileByte.Length);
                fs.Close();

                masterRecord.UpdateShaFileTransferStatusByFileId(fileId, "CHUNK", $"{chunkSize}:{fileLength}-{chunkIndex + 1}/{Math.Ceiling(fileLength/chunkSize)}");

                if (chunkIndex + 1 == Math.Ceiling(fileLength / chunkSize))
                {
                    var serverPath = @"\\fs2020\FileSharing\SHA";
                    var fileTransfer = masterRecord.GetShaFileTransfer(fileId);
                    var newFileBytes = new byte[Convert.ToInt32(fileLength)];
                    log.Info($"Starting to combine chunked files: {fileId} ::: {Path.Combine(serverPath, fileTransfer.FILE_PATH.Substring(3))}");

                    //Read all chunk file contents into newFileBytes
                    for (int index = 0; index < Math.Ceiling(fileLength / chunkSize); index++)
                    {
                        var chunkFile = new FileInfo(Path.Combine(fileServerPath, HttpUtility.UrlEncode(fileId) + "_" + index.ToString()));
                        var fs1 = new FileStream(chunkFile.FullName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                        fs1.Read(newFileBytes, index * Convert.ToInt32(chunkSize), Convert.ToInt32(fs1.Length));
                        fs1.Close();
                    }

                    //Create directory if not exist
                    var newPath = Path.Combine(serverPath, fileTransfer.FILE_PATH.Substring(3, fileTransfer.FILE_PATH.LastIndexOf("\\") - 3));
                    if (!Pri.LongPath.Directory.Exists(newPath))
                        Pri.LongPath.Directory.CreateDirectory(newPath);

                    //Convert newFileBytes to File
                    var newFs = new FileStream(Path.Combine(serverPath, fileTransfer.FILE_PATH.Substring(3)), FileMode.Create, FileAccess.Write);
                    newFs.Write(newFileBytes, 0, newFileBytes.Length);
                    newFs.Close();

                    masterRecord.UpdateShaFileTransferStatusByFileId(fileId, "CHUNK_SUCCESS", $"{chunkSize}:{fileLength}-{Math.Ceiling(fileLength / chunkSize)}/{Math.Ceiling(fileLength / chunkSize)}");
                    log.Info($"Combine chunked files success: {fileId} Size {Math.Round(fileLength / 1024 / 1024, 2)} MB ::: {Path.Combine(serverPath, fileTransfer.FILE_PATH.Substring(3))}");

                    //Delete chunk files
                    for (int index = 0; index < Math.Ceiling(fileLength / chunkSize); index++)
                    {
                        System.IO.File.Delete(Path.Combine(fileServerPath, HttpUtility.UrlEncode(fileId) + "_" + index.ToString()));
                    }
                }

                return Content(Path.Combine(fileServerPath, HttpUtility.UrlEncode(fileId) + "_" + chunkIndex.ToString()));
            }
            catch (Exception ex)
            {
                log.Error(ex);
                var request = HttpContext.Request;
                masterRecord.UpdateShaFileTransferStatusByFileId(HttpUtility.UrlDecode(request.Headers["fileId"]), "FAILED", ex.Message);
                return Content(ex.Message);
            }
        }

        //Url parameters will be auto UrlDecode, don't run the UrlDecode again ("+" will be replaced to space)
        public ActionResult UploadShaFileFailed(string fileId, string message)
        {
            log.Error($"{fileId}: {message}");
            masterRecord.UpdateShaFileTransferStatus(fileId, "FAILED", message);
            return Content("DONE");
        }

        public ActionResult AddShaFileTransfer(string path)
        {
            log.Info($"New file: {path}");
            masterRecord.AddShaFileTransfer(path);
            return Content("DONE");
        }

        public ActionResult RequestShaFileWatcherLog()
        {
            var logPath = @"D:\FileWatcher\log";
            log.Info($"Request SHA log files: {Path.Combine(logPath, "FileWatcher.log")}");
            masterRecord.AddShaFileTransfer(Path.Combine(logPath, "FileWatcher.log"));
            masterRecord.AddShaFileTransfer(Path.Combine(logPath, "FileWatcher.log.1"));
            masterRecord.AddShaFileTransfer(Path.Combine(logPath, "FileWatcher.log.2"));
            masterRecord.AddShaFileTransfer(Path.Combine(logPath, "FileWatcher.log.3"));
            masterRecord.AddShaFileTransfer(Path.Combine(logPath, "FileWatcher.log.4"));
            return Content("DONE");
        }

        public ActionResult Test(string testValue)
        {
            var FILE_PATH = @"e:\rcs-air\CUSTOMER\PVH\ELLEN\Foxmail 7.0\Data\Indexes\msgBody\bodytxt_txt.rec0";
            var serverPath = @"\\fs2020\FileSharing\SHA";
            var newPath = Path.Combine(serverPath, FILE_PATH.Substring(3, FILE_PATH.LastIndexOf("\\") - 3));
            return Content(newPath);

            var msg = string.Empty;
            try
            {
                var filePath = @"D:\SHA\TestLongPath\SAVEURS.tif";
                var newFilePath = @"D:\SHA\TestLongPath\NEW_SAVEURS.tif";
                decimal chunkSize = 5 * 1024 * 1024;    //5MB
                var fileLength = new FileInfo(filePath).Length;

                var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                byte[] fileBytes = new byte[fileLength];
                byte[] newFileBytes = new byte[fileLength];
                //IEnumerable<byte> concatBytes;

                fs.Read(fileBytes, 0, fileBytes.Length);
                fs.Close();

                var offset = 0;
                for (int chunkIndex = 0; chunkIndex < Math.Ceiling(fileLength / chunkSize); chunkIndex++)
                {

                    byte[] chunkByte = new byte[(chunkIndex < Math.Ceiling(fileLength / chunkSize) - 1) ?
                        Convert.ToInt32(chunkSize) : Convert.ToInt32(fileLength - (chunkIndex * chunkSize))];

                    msg += $"{chunkIndex} / {offset} / {chunkByte.Length}<br>";
                    var fsWriter = new FileStream($"{filePath}_{chunkIndex.ToString()}", FileMode.Create, FileAccess.Write);
                    fsWriter.Write(fileBytes, offset, chunkByte.Length);
                    fsWriter.Close();

                    offset += chunkByte.Length;
                }

                msg += "<br>";
                for (int chunkIndex = 0; chunkIndex < Math.Ceiling(fileLength / chunkSize); chunkIndex++)
                {
                    var file = new FileInfo(filePath + "_" + chunkIndex);
                    var fs1 = new FileStream(file.FullName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    fs1.Read(newFileBytes, chunkIndex * Convert.ToInt32(chunkSize), Convert.ToInt32(fs1.Length));

                    msg += $"{file.Name} / {chunkIndex} / {chunkIndex * Convert.ToInt32(chunkSize)} / {newFileBytes.Length}<br>";
                    fs1.Close();
                }

                var newFs = new FileStream(newFilePath, FileMode.Create, FileAccess.Write);
                newFs.Write(newFileBytes, 0, newFileBytes.Length);
                newFs.Close();

                return Content(msg);
            }
            catch (Exception ex)
            {
                return Content(msg + " < br>" + ex.ToString());
            }
        }
    }
}
