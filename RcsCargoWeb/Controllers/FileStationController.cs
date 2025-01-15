
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
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
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
    }

    public class FileStationController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
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
            var fmData = new List<FileManagerData>();
            foreach (var file in recentFiles)
            {
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
                    });
                }
            }

            return Json(fmData, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Create(string name, string extension, bool isDirectory, string path, string target, string userId)
        {
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

        public ActionResult Rename(string name, string path, string extension, bool isDirectory, string userId)
        {
            if (HasAccessRight(path, "MODIFY", userId))
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

            return null;
        }

        public ActionResult Delete(string name, string path, bool isDirectory, string userId)
        {
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
    }
}
