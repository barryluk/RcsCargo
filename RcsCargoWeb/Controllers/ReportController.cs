
using DbUtils;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using ICSharpCode.SharpZipLib.Zip;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Reporting;
using Reporting.DataService.AirFreightReport;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
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
    public class ReportController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        [HttpGet]
        public ActionResult GetPdf()
        {
            string info = string.Empty;
            var para = "reportName=AirHawbPreview;CompanyId=RCSHKG;HawbNo=WFF74094171;FrtMode=AE;ShowDim=True;CustomerType=Shipper;";
            string url = $"http://gemini.rcs-asia.com:9010/FileDownload?id={DbUtils.Utils.DESEncrypt(para)}";
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

                Response.AppendHeader("Content-Disposition", $"attachment;filename=report.pdf");
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

        private byte[] GetRdlcReport(List<ReportParameter> paras, string reportName)
        {
            if (Request.Url.GetString().Contains("favicon"))
                return null;

            var paraValue = $"reportName={reportName};";
            paras.ForEach(a => { paraValue += $"{a.name}={(a.value as Array).GetValue(0)};"; });
            string url = $"http://gemini.rcs-asia.com:9010/FileDownload?id={DbUtils.Utils.DESEncrypt(paraValue)}";

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";

            try
            {
                WebResponse response = request.GetResponse();
                var resultStream = new MemoryStream();
                var respStream = response.GetResponseStream();
                respStream.CopyTo(resultStream);
                respStream.Close();
                respStream.Flush();
                log.Debug("RDLC bytes length: " + resultStream.Length);
                return resultStream.ToArray();
            }
            catch (Exception ex)
            {
                log.Error(DbUtils.Utils.FormatErrorMessage(ex));
                return null;
            }
        }

        public ActionResult GetMultipleRdlcReports(List<MultipleReport> reports)
        {
            var id = DbUtils.Utils.NewGuid();
            MemoryStream ms = new MemoryStream();
            ZipOutputStream zipStream = new ZipOutputStream(ms);
            zipStream.SetLevel(6);

            foreach (var report in reports)
            {
                var rdlcReport = GetRdlcReport(report.reportParas, report.ReportName);
                ZipEntry entry = new ZipEntry(report.FileName);
                entry.DateTime = DateTime.Now;
                zipStream.PutNextEntry(entry);
                zipStream.Write(rdlcReport, 0, rdlcReport.Length);
                zipStream.CloseEntry();
            }
            zipStream.Finish();
            zipStream.Close();
            Session[id] = ms.ToArray();

            return Content(id, "text/plain");
        }

        public ActionResult GetRdlcExcelReport(List<ReportParameter> paras, string reportName)
        {
            var id = DbUtils.Utils.NewGuid();
            Session[id] = GetRdlcReport(paras, reportName);

            return Content(id, "text/plain");
        }

        public ActionResult DownloadReport(string id, string downloadFilename)
        {
            if (Session[id] != null)
            {
                var fileByte = Session[id] as byte[];
                Session[id] = null;

                Response.AppendHeader("Content-Disposition", $"attachment;filename={downloadFilename}");
                var contentType = "application/xlsx";
                if (downloadFilename.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                    contentType = "application/pdf";
                else if (downloadFilename.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                    contentType = "application/x-zip";

                return File(fileByte, contentType);
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

                case "AirAutoReport_MissingInvoiceReport_Origin": reportName = ReportName.AirAutoReport_MissingInvoiceReport_Origin; break;
                case "AirInvoiceReport": reportName = ReportName.AirInvoiceReport; break;
                case "AirInvoiceReportVat": reportName = ReportName.AirInvoiceReportVat; break;
                case "AirInvoiceReport_HKG_Summary": reportName = ReportName.AirInvoiceReport_HKG_Summary; break;
                case "AirInvoiceReport_SHA_Account": reportName = ReportName.AirInvoiceReport_SHA_Account; break;               //出口开票明细
                case "AirInvoiceReport_SHA_Account_Import": reportName = ReportName.AirInvoiceReport_SHA_Account_Import; break; //进口开票明细
                case "AirPaymentReport_SHA_Account": reportName = ReportName.AirPaymentReport_SHA_Account; break;               //付款账单明细
                case "AirInvoiceReport_SHA_DN": reportName = ReportName.AirInvoiceReport_SHA_DN; break;                         //account statement (对账单)
                case "AirOtherJobInvoiceReport": reportName = ReportName.AirOtherJobInvoiceReport; break;
                case "AirPVReport": reportName = ReportName.AirPVReport; break;
                case "AirPvTypeReport": reportName = ReportName.AirPvTypeReport; break;
            }
            return reportName;
        }

        public class MultipleReport
        {
            public string ReportName { get; set; }
            public string FileName { get; set; }
            public List<ReportParameter> reportParas { get; set; }
        }

        public class ReportParameter
        {
            public string name { get; set; }
            public object value { get; set; }
        }
    }
}
