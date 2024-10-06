
using DbUtils;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using Newtonsoft.Json;
using Reporting;
using Reporting.DataService.AirFreightReport;
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
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

namespace RcsCargoWeb.Controllers
{
    public class ReportController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        [HttpGet]
        public ActionResult GetPdf()
        {
            string info = string.Empty;
            string url = "http://gemini.rcs-asia.com:9010/FileDownload?id=8BCDC04165C3FC5800DA28027C7A13B2EE32D9391FCAD5AEC550568E393390402AF2CE03C2A33ADEFF42DD069D5BFC96A89B8A73B8BD6972B1EB456932DB948C9203AF22DB43650EAA03226FAB29519012D99664C465F64F46D4A9714AA9604152353053FA000038E7D6123CAA1D6115";
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";

            try
            {
                WebResponse response = request.GetResponse();
                var resultStream = new MemoryStream();
                var respStream = response.GetResponseStream();
                respStream.CopyTo(resultStream);
                respStream.Close();
                respStream.Flush();
                log.Debug("Bytes Length: " + resultStream.Length);

                return File(resultStream.ToArray(), "application/pdf");
            }
            catch (Exception ex)
            {
                info = ex.Message;
                log.Debug(info);
            }

            return null;
        }

        private string GetCustomizeShipmentReport(List<ReportParameter> paras, List<ReportParameter> selectedFields, string companyId)
        {
            try
            {
                ReportService reportService = new ReportService(Server.MapPath("~/Downloads/"));
                GenerateLocalReport report = new GenerateLocalReport(companyId);
                List<CustomizeReportFields> fields = new List<CustomizeReportFields>();
                foreach (var item in selectedFields)
                {
                    var itemValue = (item.value as Array).GetValue(0).ToString();
                    bool showSubTotal = false;
                    if (itemValue.Split('|')[1].Equals("Gwts") ||
                        itemValue.Split('|')[1].Equals("Vwts") ||
                        itemValue.Split('|')[1].Equals("Cwts") ||
                        itemValue.Split('|')[1].Equals("Cuft") ||
                        itemValue.Split('|')[1].Equals("Package") ||
                        itemValue.Split('|')[1].Equals("AmountHome"))
                        showSubTotal = true;

                    fields.Add(new CustomizeReportFields
                    {
                        FieldLabel = item.name,
                        DBFieldName = itemValue.Split('|')[0],
                        FieldName = itemValue.Split('|')[1],
                        ShowSubTotal = showSubTotal
                    });
                }

                Dictionary<string, object> para = new Dictionary<string, object>();
                para.Add("DateFrom", DateTime.Parse((paras.Single(a => a.name == "DateFrom").value as Array).GetValue(0).ToString()));
                para.Add("DateTo", DateTime.Parse((paras.Single(a => a.name == "DateTo").value as Array).GetValue(0).ToString()));
                para.Add("CompanyId", (paras.Single(a => a.name == "CompanyId").value as Array).GetValue(0));
                para.Add("FrtMode", (paras.Single(a => a.name == "FrtMode").value as Array).GetValue(0));
                para.Add("Fields", fields);
                para.Add("GroupCode", (paras.Single(a => a.name == "GroupCode").value as Array).GetValue(0));
                para.Add("ConsigneeCode", (paras.Single(a => a.name == "ConsigneeCode").value as Array).GetValue(0));
                para.Add("ShipperCode", (paras.Single(a => a.name == "ShipperCode").value as Array).GetValue(0));
                para.Add("AgentCode", (paras.Single(a => a.name == "AgentCode").value as Array).GetValue(0));
                para.Add("OrderBy", (paras.Single(a => a.name == "SortingOrder").value as Array).GetValue(0));

                report.ReportName = ReportName.AirCustomizeShipmentReport;
                report.ReportParameters = para;
                report.ReportPath = reportService.GetReportPath(ReportName.AirCustomizeShipmentReport);
                report.ReportFileFormat = GenerateLocalReport.FileFormat.Excel;

                var id = DbUtils.Utils.NewGuid();
                Session[id] = report.Render();

                return id;
            }
            catch (Exception ex)
            {
                log.Error(DbUtils.Utils.FormatErrorMessage(ex));
            }
            return string.Empty;
        }

        public ActionResult GetExcelReport(List<ReportParameter> paras, string reportName, string companyId, List<ReportParameter> extraParas)
        {
            if (reportName == "AirCustomizeShipmentReport")
                return Content(GetCustomizeShipmentReport(paras, extraParas, companyId), "text/plain");
            else
            {
                var reportParas = new Dictionary<string, object>();
                foreach (var item in paras)
                {
                    object paraValue = null;
                    if (item.name.ToLower().Contains("date"))
                        paraValue = DateTime.Parse((item.value as Array).GetValue(0).ToString());
                    else if (item.name.Equals("Origins"))
                    {
                        var origins = new List<string>();
                        foreach (var origin in (item.value as Array))
                            origins.Add(origin.ToString());

                        paraValue = origins;
                    }
                    else
                        paraValue = (item.value as Array).GetValue(0);

                    reportParas.Add(item.name, paraValue);
                }

                var id = DbUtils.Utils.NewGuid();
                Session[id] = AppUtils.GetExcelReport(reportParas, GetReportName(reportName), companyId);

                return Content(id, "text/plain");
            }
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
            request.Method = "GET";

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
                case "SecurityScreeningReceipt": reportName = ReportName.SecurityScreeningReceipt; break;
                case "AirBookingDSR": reportName = ReportName.AirBookingDSR; break;
                case "AirDailyBooking": reportName = ReportName.AirDailyBooking; break;
                case "AirDailyBooking_NoSR": reportName = ReportName.AirDailyBooking_NoSR; break;
                case "AirDailyBookingCBM": reportName = ReportName.AirDailyBookingCBM; break;
                case "AirDailyBookingExcel": reportName = ReportName.AirDailyBookingExcel; break;
                case "AirDailyBooking_Oversea": reportName = ReportName.AirDailyBooking_Oversea; break;
                case "AirShipmentReport": reportName = ReportName.AirShipmentReport; break;
                case "AirCustomizeShipmentReport": reportName = ReportName.AirCustomizeShipmentReport; break;
                case "AirShipmentTrackingReport": reportName = ReportName.AirShipmentTrackingReport; break;
                case "AirCustomerTonnageReport": reportName = ReportName.AirCustomerTonnageReport; break;

                case "AirProfitLoss": reportName = ReportName.AirProfitLoss; break;
                case "AirSummaryProfitLoss": reportName = ReportName.AirSummaryProfitLoss; break;
                case "AirSummaryAirlineProfitLoss": reportName = ReportName.AirSummaryAirlineProfitLoss; break;
                case "AirSummaryProfitLossBreakDown": reportName = ReportName.AirSummaryProfitLossBreakDown; break;
                case "AirOtherJobProfitLoss": reportName = ReportName.AirOtherJobProfitLoss; break;
                case "AirSummaryOtherJobProfitLoss": reportName = ReportName.AirSummaryOtherJobProfitLoss; break;
                case "AirProjectProfitLoss": reportName = ReportName.AirProjectProfitLoss; break;
                case "AirLotProfitLoss": reportName = ReportName.AirLotProfitLoss; break;
                case "AirCharterFltProfitLoss": reportName = ReportName.AirCharterFltProfitLoss; break;
                case "AirConsigneeProfitLoss": reportName = ReportName.AirConsigneeProfitLoss; break;
                case "AirDraftProfitLoss": reportName = ReportName.AirDraftProfitLoss; break;
                case "AirMawbShipperProfitLoss": reportName = ReportName.AirMawbShipperProfitLoss; break;
                case "AirOffshoreSummaryJobProfitLoss": reportName = ReportName.AirOffshoreSummaryJobProfitLoss; break;
                case "AirHKGSummaryJobProfitLoss": reportName = ReportName.AirHKGSummaryJobProfitLoss; break;
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
