using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using Reporting;
using DbUtils;
using DbUtils.Models.Admin;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace RcsCargoWeb
{
    public static class NetworkFolderManager
    {
        public static string remoteUser = @"fs2020\administrator";
        public static string remotePass = "Admin8rcs";

        // 方案 1：引入 Windows 網路連線 API (mpr.dll)
        [DllImport("mpr.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern int WNetAddConnection2(
            NETRESOURCE lpNetResource,
            string lpPassword,
            string lpUsername,
            int dwFlags);

        [DllImport("mpr.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern int WNetCancelConnection2(
            string lpName,
            int dwFlags,
            bool fForce);

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private class NETRESOURCE
        {
            public int dwScope;
            public int dwType;
            public int dwDisplayType;
            public int dwUsage;
            public string lpLocalName;
            public string lpRemoteName;
            public string lpComment;
            public string lpProvider;
        }

        public static void CreateDirectory(string uncPath)
        {
            if (string.IsNullOrEmpty(uncPath) || !uncPath.StartsWith(@"\\"))
            {
                throw new ArgumentException("路徑必須是合法的 UNC 網路路徑 (以 \\\\ 開頭)。");
            }
            CreateDirectoryWithCredentials(uncPath, remoteUser, remotePass);
        }

        /// <summary>
        /// 在 IIS 中使用獨立的遠端帳密建立資料夾（支援 Workgroup 不同密碼環境）
        /// </summary>
        /// <param name="uncPath">完整的遠端目標路徑，例如：\\192.168.1.50\Share\Folder1\SubFolder</param>
        /// <param name="username">遠端網路磁碟的本機帳號</param>
        /// <param name="password">遠端網路磁碟的本機密碼</param>
        public static void CreateDirectoryWithCredentials(string uncPath, string username, string password)
        {
            if (string.IsNullOrEmpty(uncPath) || !uncPath.StartsWith(@"\\"))
            {
                throw new ArgumentException("路徑必須是合法的 UNC 網路路徑 (以 \\\\ 開頭)。");
            }

            // 自動解析出網路根共用路徑 (例如從 \\192.168.1.50\Share\Dir 解析出 \\192.168.1.50\Share)
            string rootShare = GetRootShare(uncPath);

            NETRESOURCE nr = new NETRESOURCE
            {
                dwType = 1, // RESOURCETYPE_DISK
                lpRemoteName = rootShare
            };

            // 嘗試建立與遠端伺服器的驗證連線
            int result = WNetAddConnection2(nr, password, username, 0);

            // 錯誤代碼 1219：代表目前已經有其他相同路徑的舊連線阻礙中
            if (result == 1219)
            {
                // 先強制中斷舊連線，再重新嘗試連接一次
                WNetCancelConnection2(rootShare, 0, true);
                result = WNetAddConnection2(nr, password, username, 0);
            }

            // 0 代表 Windows 網路通道驗證成功
            if (result != 0)
            {
                throw new Win32Exception(result, $"IIS 無法使用指定的憑證連接至遠端網路磁碟。錯誤代碼: {result}。");
            }

            try
            {
                // 通道建立完成後，直接調用 Pri.LongPath 建立資料夾
                Pri.LongPath.Directory.CreateDirectory(uncPath);
            }
            finally
            {
                // 安全起見，執行完畢後立即將暫時的連線通道中斷
                WNetCancelConnection2(rootShare, 0, true);
            }
        }

        /// <summary>
        /// 協助工具：從完整路徑擷取最上層的 \\伺服器\共用名稱
        /// </summary>
        private static string GetRootShare(string uncPath)
        {
            Uri uri = new Uri(uncPath);
            string[] segments = uri.PathAndQuery.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length > 0)
            {
                return $@"\\{uri.Host}\{segments[0]}";
            }
            return $@"\\{uri.Host}";
        }
    }


    public class CheckTokenAttribute : AuthorizeAttribute
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private static string[] bypassUrls = { "/", "/Home/Test", "/Home/Index", "/Home/Dashboard", "/Home/Login", "/Home/GetScriptVersion",
            "/FileStation/TestUpload", "/FileStation/GetShaFileTransferList", "/FileStation/UploadShaFile",
            "/FileStation/UploadShaFileFailed", "/FileStationAddShaFileTransfer", "/FileStation/Test", "/Air/Pv/ImportExcel" };
        private static DbUtils.Admin admin = new Admin();

        protected override bool AuthorizeCore(HttpContextBase context)
        {
            //return true;
            var filePath = HttpContext.Current.Request.FilePath;    //e.g. /Home/Test
            //log.Debug(filePath);
            if (bypassUrls.Contains(filePath))
                return true;

            var token = HttpContext.Current.Request.Headers["token"];
            if (!string.IsNullOrEmpty(token))
            {
                return AppUtils.userLogs.Count(a => a.SESSION_ID.Equals(token)) == 1 ? true : false;
            }
            else
                return false;
        }

        public CheckTokenAttribute()
        {
        }
    }

    public static class AppUtils
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public static readonly int takeRecords = 25;
        public static readonly string logPath = new System.Configuration.AppSettingsReader().GetValue("LogPath", typeof(string)).ToString();
        public static string scriptVersion = string.Empty;
        public static List<UserLog> userLogs = new List<UserLog>();

        public static string FormatText(this string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;
            else
                return input.Trim().ToUpper();
        }

        public static ContentResult JsonContentResult(IEnumerable<object> obj, int skip = 0, int take = 0)
        {
            string jsonString = string.Empty;
            if (take == 0)
                jsonString = "{\"Data\":" + JsonConvert.SerializeObject(obj) + ",\"Total\":" + obj.Count().ToString() + "}";
            else
                jsonString = "{\"Data\":" + JsonConvert.SerializeObject(obj.Skip(skip).Take(take)) + ",\"Total\":" + obj.Count().ToString() + "}";

            ContentResult result = new ContentResult();
            result.Content = jsonString;
            result.ContentType = "application/json";
            return result;
        }

        public static byte[] GetExcelReport(Dictionary<string, object> para, ReportName Reportname, string companyId)
        {
            try
            {
                log.Debug("GetExcelReport: " + Reportname.ToString());
                PrepareReportData d = new PrepareReportData(companyId);
                d.PrepareReportDataSource(Reportname, para);
                string fileName = Reportname.ToString() + ".xlsx";
                string filePath = System.Web.HttpContext.Current.Server.MapPath("~/Downloads/" + fileName);
                FileStream fs = new FileStream(filePath, FileMode.OpenOrCreate);
                byte[] bytes = new byte[(int)fs.Length];
                fs.Read(bytes, 0, bytes.Length);
                fs.Close();
                fs.Dispose();
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);

                return bytes;
            }
            catch (Exception ex)
            {
                log.Error(DbUtils.Utils.FormatErrorMessage(ex));
            }
            return null;
        }
    }
}