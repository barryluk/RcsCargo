using DbUtils;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using DbUtils.Models.Admin;

namespace RcsCargoWeb.Controllers.Admin
{
    [RoutePrefix("Admin/System")]
    public class SystemController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Admin admin = new DbUtils.Admin();

        #region User

        [Route("GridUser_Read")]
        public ActionResult GridUser_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "USER_ID";
            var sortDir = "asc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = admin.GetUsers(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetUser")]
        public ActionResult GetUser(string id)
        {
            var user = admin.GetUser(id);
            return Json(user, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateUser")]
        public ActionResult UpdateUser(User model, string mode)
        {
            if (mode == "edit")
                admin.UpdateUser(model);
            else if (mode == "create")
                admin.AddUser(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteUser")]
        public ActionResult DeleteUser(string id)
        {
            admin.DeleteUser(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingUserId")]
        public ActionResult IsExistingUserId(string id)
        {
            return Content(admin.IsExistingUserId(id).ToString());
        }

        [Route("IsExistingUserEmail")]
        public ActionResult IsExistingUserEmail(string email)
        {
            return Content(admin.IsExistingUserEmail(email).ToString());
        }

        #endregion

        #region Log

        [Route("GetLogFiles")]
        public ActionResult GetLogFiles()
        {
            var files = new DirectoryInfo(AppUtils.logPath).GetFiles("*.*");
            return Json(files.OrderByDescending(a => a.LastWriteTime).Select(a => a.Name).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetLog")]
        public string GetLog(string fileName, string filter = "")
        {
            return GetLogContent(new FileInfo(Path.Combine(AppUtils.logPath, fileName)), filter);
        }

        private string GetLogContent(FileInfo file, string filter)
        {
            string logContent = string.Empty;
            //.log file is locked by log4net, so can only copy to another file and read the content
            if (file.Extension.Equals(".log"))
            {
                if (System.IO.File.Exists($"{file.FullName}1"))
                    System.IO.File.Delete($"{file.FullName}1");

                file.CopyTo($"{file.FullName}1");
                TextReader reader = new StreamReader($"{file.FullName}1");
                logContent = reader.ReadToEnd();
                reader.Close();

                System.IO.File.Delete($"{file.FullName}1");
            }
            else
            {
                TextReader reader = new StreamReader(file.FullName);
                logContent = reader.ReadToEnd();
                reader.Close();
            }

            var logLines = logContent.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries).ToList();

            StringBuilder sb = new StringBuilder();
            foreach (var line in logLines)
            {
                if (string.IsNullOrEmpty(filter))
                {
                    if (line.StartsWith("20") && line.Contains(" - "))
                    {
                        int i = line.IndexOf("] ") + 2;
                        int j = line.IndexOf(" - ");
                        string logLevel = line.Substring(i, j - i).Trim();
                        sb.AppendLine($"<span class='LOG_{logLevel}'>" + line.Substring(0, j) + "</span>" + line.Substring(j + 1));
                    }
                    else
                    {
                        if (line.StartsWith("   "))
                            sb.AppendLine(line.Replace("   ", "&nbsp;&nbsp;&nbsp;"));
                        else
                            sb.AppendLine(line);
                    }
                }
                else
                {
                    if (line.Contains($"] {filter} "))
                        sb.AppendLine($"<span class='LOG_{filter}'>" + line.Replace($"] {filter} ", $"] {filter}</span> "));

                    if (line.StartsWith("   ") && filter == "ERROR")
                        sb.AppendLine(line.Replace("   ", "&nbsp;&nbsp;&nbsp;"));
                }
            }
            logContent = sb.ToString();
            return logContent;
        }

        #endregion

        #region Sequence number

        [Route("GetSeqTypes")]
        public ActionResult GetSeqTypes()
        {
            var seqTypes = admin.GetSeqTypes();
            seqTypes.Add("RCSCFSLAX_InvoiceNo");
            return Json(seqTypes, JsonRequestBehavior.AllowGet);
        }

        [Route("GetSeqNo")]
        public ActionResult GetSeqNo(string seqType, string companyId, string origin, string dest, DateTime? date, int seqNoCount = 1)
        {
            return Content(admin.GetSequenceNumber(seqType, companyId, origin, dest, date, seqNoCount), "plain/text");
        }

        #endregion
    }
}