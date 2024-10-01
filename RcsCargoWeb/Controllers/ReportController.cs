
using DbUtils;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using Newtonsoft.Json;
using Reporting;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using System.Web.UI;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

namespace RcsCargoWeb.Controllers
{
    public class ReportController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public ActionResult GetExcelReport(List<ReportParameter> paras, string reportName, string companyId)
        {
            //var jsonList = JsonConvert.DeserializeObject<List<ReportParameter>>(paras);
            var reportParas = new Dictionary<string, object>();
            foreach (var item in paras)
            {
                object paraValue = null;
                if (item.name.ToLower().Contains("date"))
                    paraValue = DateTime.Parse((item.value as Array).GetValue(0).ToString());
                else
                    paraValue = (item.value as Array).GetValue(0);

                reportParas.Add(item.name, paraValue);
            }

            var id = DbUtils.Utils.NewGuid();
            Session[id] = AppUtils.GetExcelReport(reportParas, GetReportName(reportName), companyId);

            return Content(id, "text/plain");
        }

        public ActionResult GetRdlcExcelReport(List<ReportParameter> paras, string reportName)
        {
            if (Request.Url.GetString().Contains("favicon"))
                return null;

            string info = string.Empty;
            var paraValue = $"reportName={reportName};";
            paras.ForEach(a => { paraValue += $"{a.name}={(a.value as Array).GetValue(0)};"; });
            string url = $"http://gemini.rcs-asia.com:9010/FileDownload?id={DbUtils.Utils.DESEncrypt(paraValue)}";
            
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";

            try
            {
                log.Debug(url);
                WebResponse response = request.GetResponse();
                var resultStream = new MemoryStream();
                var respStream = response.GetResponseStream();
                respStream.CopyTo(resultStream);
                respStream.Close();
                respStream.Flush();
                log.Debug("Bytes Length: " + resultStream.Length);

                var id = DbUtils.Utils.NewGuid();
                Session[id] = resultStream.ToArray();

                return Content(id, "text/plain");
            }
            catch (Exception ex)
            {
                log.Error(DbUtils.Utils.FormatErrorMessage(ex));
            }

            return null;
        }

        public ActionResult DownloadExcelReport(string id, string downloadFilename)
        {
            if (Session[id] != null)
            {
                var fileByte = Session[id] as byte[];
                Session[id] = null;

                Response.AppendHeader("Content-Disposition", $"attachment;filename={downloadFilename}");
                return File(fileByte, "application/xlsx");
            }
            return null;
        }

        private ReportName GetReportName(string value)
        {
            var reportName = new ReportName();
            switch (value)
            {
                case "SecurityScreeningReceipt":
                    reportName = ReportName.SecurityScreeningReceipt; break;
                case "AirBookingDSR":
                    reportName = ReportName.AirBookingDSR; break;
            }
            return reportName;
        }

        public class ReportParameter
        {
            public string name { get; set; }
            public object value { get; set; }
        }
    }
}
