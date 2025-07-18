using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using Reporting;

namespace RcsCargoWeb
{
    public static class AppUtils
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public static readonly int takeRecords = 25;
        public static readonly string logPath = new System.Configuration.AppSettingsReader().GetValue("LogPath", typeof(string)).ToString();
        public static string scriptVersion = string.Empty;

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
                jsonString =  "{\"Data\":" + JsonConvert.SerializeObject(obj) + ",\"Total\":" + obj.Count().ToString() + "}";
            else
                jsonString =  "{\"Data\":" + JsonConvert.SerializeObject(obj.Skip(skip).Take(take)) + ",\"Total\":" + obj.Count().ToString() + "}";

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