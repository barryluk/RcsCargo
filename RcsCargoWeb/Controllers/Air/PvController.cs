using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using DbUtils;
using Newtonsoft.Json;
using DbUtils.Models.Air;
using System.ComponentModel.Design;
using System.Web.Configuration;
using Reporting.DataService.AirFreightReport;
using Reporting.ReportReference.AirFreight;
using System.IO;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace RcsCargoWeb.Air.Controllers
{
    public class ImportExcelResult
    {
        public string PvNo { get; set; }
        public DateTime PvDate { get; set; }
        public string VendorInvNo { get; set; }
        public string CustomerCode { get; set; }
        public string LinkupField { get; set; }
        public string FrtChargePC { get; set; }
        public string CurrCode { get; set; }
        public string ChargeCode { get; set; }
        public decimal Price { get; set; }
        public decimal Qty { get; set; }
        public string QtyUnit { get; set; }
    }

    [RoutePrefix("Air/Pv")]
    public class PvController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecords = new DbUtils.MasterRecords();
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridPv_Read")]
        public ActionResult GridPv_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "PV_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetPvs(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetPv")]
        public ActionResult GetPv(string id, string companyId, string frtMode)
        {
            var pv = air.GetPv(id, companyId, frtMode);
            return Json(pv, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdatePv")]
        public ActionResult UpdatePv(Pv model, string mode)
        {
            if (string.IsNullOrEmpty(model.PV_NO))
            {
                model.PV_NO = admin.GetSequenceNumber("AE_PV", model.COMPANY_ID, model.ORIGIN, model.DEST, model.CREATE_DATE);
                foreach (var item in model.PvItems)
                    item.PV_NO = model.PV_NO;
            }

            if (mode == "edit")
                air.UpdatePv(model);
            else if (mode == "create")
                air.AddPv(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("UpdateBatchPv")]
        public ActionResult UpdateBatchPv(Pv model, string[] hawbNos)
        {
            var models = new List<Pv>();
            foreach (var hawbNo in hawbNos)
            {
                var newPv = new Pv();
                foreach (var property in typeof(Pv).GetProperties())
                    property.SetValue(newPv, property.GetValue(model));

                var hawb = air.GetHawb(hawbNo, model.COMPANY_ID, model.FRT_MODE);
                var mawb = air.GetMawb(hawb.MAWB_NO, model.COMPANY_ID, model.FRT_MODE);
                newPv.PV_NO = admin.GetSequenceNumber("AE_PV", model.COMPANY_ID, model.ORIGIN, model.DEST, model.CREATE_DATE);
                newPv.PV_CATEGORY = "H";
                newPv.MAWB_NO = hawb.MAWB_NO;
                newPv.HAWB_NO = hawb.HAWB_NO;
                newPv.JOB_NO = hawb.JOB_NO;
                newPv.FLIGHT_DATE = mawb.FLIGHT_DATE;
                newPv.FLIGHT_NO = mawb.FLIGHT_NO;
                newPv.AIRLINE_CODE = mawb.AIRLINE_CODE;
                newPv.ORIGIN = hawb.ORIGIN_CODE;
                newPv.DEST = hawb.DEST_CODE;
                newPv.FRT_PAYMENT_PC = hawb.FRT_PAYMENT_PC;
                newPv.PACKAGE = hawb.PACKAGE;
                newPv.PACKAGE_UNIT = hawb.PACKAGE_UNIT;
                newPv.GWTS = hawb.GWTS;
                newPv.VWTS = hawb.VWTS;
                newPv.CWTS = hawb.GWTS > hawb.VWTS ? hawb.GWTS : hawb.VWTS;

                newPv.PvItems = new List<PvItem>();
                foreach (var item in model.PvItems)
                {
                    var pvItem = new PvItem();
                    foreach (var property in typeof(PvItem).GetProperties())
                        property.SetValue(pvItem, property.GetValue(item));

                    pvItem.PV_NO = newPv.PV_NO;
                    newPv.PvItems.Add(pvItem);
                }
                air.AddPv(newPv);
                models.Add(newPv);
            }
            return Json(models, JsonRequestBehavior.DenyGet);
        }

        [Route("VoidPv")]
        public ActionResult VoidPv(string id, Pv model)
        {
            model.PV_NO = id;
            air.VoidPv(model);
            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingPvNo")]
        public ActionResult IsExistingPvNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExistingPvNo(id, companyId, frtMode).ToString());
        }

        [Route("GetPvDocs")]
        public ActionResult GetPvDocs(string id)
        {
            var docs = air.GetPvDocs(id);
            return Json(docs, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Route("ImportExcel")]
        public ActionResult ImportExcel(IEnumerable<HttpPostedFileBase> postedFiles, string requestId)
        {
            if (postedFiles != null)
            {
                var ms = postedFiles.First().InputStream;
                byte[] fileContent = new byte[ms.Length];
                ms.Read(fileContent, 0, fileContent.Length);
                ms.Close();
                Session[requestId] = fileContent;
            }
            return Content("1");
        }

        [Route("GetImportExcelResult")]
        public ActionResult GetImportExcelResult(string requestId, string pvCategory, string companyId, string frtMode)
        {
            if (Session[requestId] != null)
            {
                var excelResults = new List<ImportExcelResult>();
                var pvModels = new List<Pv>();
                byte[] fileContent = Session[requestId] as byte[];
                XSSFWorkbook wb = new XSSFWorkbook(new MemoryStream(fileContent));
                ISheet sheet = wb.GetSheetAt(0);
                IRow row = sheet.GetRow(0);

                for (int i = 1; i <= sheet.LastRowNum; i++)
                {
                    row = sheet.GetRow(i);
                    if (row != null)
                    {
                        if (row.Cells.Count >= 10)
                        {
                            excelResults.Add(new ImportExcelResult
                            {
                                PvNo = row.Cells[0].ToString().FormatText(),
                                PvDate = Utils.ParseDateTime(row.Cells[1].ToString().Trim(), "M/d/yyyy") ?? DateTime.Now,
                                VendorInvNo = row.Cells[2].ToString().FormatText(),
                                CustomerCode = row.Cells[3].ToString().FormatText(),
                                LinkupField = row.Cells[4].ToString().FormatText(),
                                FrtChargePC = row.Cells[5].ToString().FormatText(),
                                CurrCode = row.Cells[6].ToString().FormatText(),
                                ChargeCode = row.Cells[7].ToString().FormatText(),
                                Price = Utils.ParseDecimal(row.Cells[8].ToString().Trim()) ?? 0,
                                Qty = Utils.ParseDecimal(row.Cells[9].ToString().Trim()) ?? 1,
                                QtyUnit = row.Cells[10].ToString().FormatText(),
                            });
                        }
                    }
                }

                foreach (var pvNo in excelResults.Select(a => a.PvNo).Distinct())
                {
                    var pvRecords = excelResults.Where(a => a.PvNo == pvNo).ToList();
                    var customer = masterRecords.GetCustomerViews(pvRecords.First().CustomerCode).FirstOrDefault();
                    if (customer == null)
                        customer = new DbUtils.Models.MasterRecords.CustomerView();

                    var pvModel = new Pv();
                    pvModel.PV_NO = pvNo;
                    pvModel.PV_DATE = pvRecords.First().PvDate;
                    pvModel.VENDOR_INV_NO = pvRecords.First().VendorInvNo;
                    pvModel.CUSTOMER_CODE = customer.CUSTOMER_CODE;
                    pvModel.CUSTOMER_DESC = customer.CUSTOMER_DESC;
                    pvModel.CUSTOMER_BRANCH = customer.BRANCH_CODE;
                    pvModel.CUSTOMER_SHORT_DESC = customer.SHORT_DESC;
                    pvModel.CURR_CODE = pvRecords.First().CurrCode;
                    pvModel.COMPANY_ID = companyId;
                    pvModel.FRT_MODE = frtMode;
                    pvModel.EX_RATE = masterRecords.GetCurrencies(companyId).First(a => a.CURR_CODE == pvRecords.First().CurrCode).EX_RATE;
                    pvModel.IS_POSTED = "N";
                    pvModel.IS_PRINTED = "N";
                    pvModel.IS_VOIDED = "N";

                    if (pvCategory == "containerNo")
                    {
                        var otherJob = air.GetOtherJobByContainer(pvRecords.First().LinkupField, companyId, frtMode);
                        pvModel.PV_TYPE = "P";
                        pvModel.PV_CATEGORY = "J";
                        pvModel.JOB_NO = otherJob.JOB_NO;
                        pvModel.FLIGHT_DATE = otherJob.FLIGHT_DATE ?? pvRecords.First().PvDate;
                        pvModel.ORIGIN = otherJob.ORIGIN_CODE;
                        pvModel.DEST = otherJob.DEST_CODE;
                        pvModel.FRT_PAYMENT_PC = pvRecords.First().FrtChargePC;
                        pvModel.PACKAGE = otherJob.PACKAGE;
                        pvModel.PACKAGE_UNIT = otherJob.PACKAGE_UNIT;
                        pvModel.GWTS = otherJob.GWTS;
                        pvModel.VWTS = otherJob.VWTS;
                        pvModel.CWTS = otherJob.GWTS > otherJob.VWTS ? otherJob.GWTS : otherJob.VWTS;
                    }

                    pvModel.PvItems = new List<PvItem>();
                    foreach (var chargeItem in pvRecords)
                    {
                        var charge = masterRecords.GetCharge(chargeItem.ChargeCode);
                        pvModel.PvItems.Add(new PvItem
                        {
                            PV_NO = pvNo,
                            COMPANY_ID = companyId,
                            FRT_MODE = frtMode,
                            LINE_NO = pvRecords.IndexOf(chargeItem) + 1,
                            CHARGE_CODE = charge.CHARGE_CODE,
                            CHARGE_DESC = charge.CHARGE_DESC,
                            CURR_CODE = pvModel.CURR_CODE,
                            EX_RATE = pvModel.EX_RATE,
                            PRICE = chargeItem.Price,
                            QTY = chargeItem.Qty,
                            QTY_UNIT = chargeItem.QtyUnit,
                            AMOUNT = Math.Round(chargeItem.Qty * chargeItem.Price, 2),
                            AMOUNT_HOME = Math.Round(chargeItem.Qty * chargeItem.Price, 2),
                        });
                    }
                    pvModel.AMOUNT = pvModel.PvItems.Sum(a => a.AMOUNT);
                    pvModel.AMOUNT_HOME = Math.Round(pvModel.AMOUNT * pvModel.EX_RATE);
                    pvModels.Add(pvModel);
                }

                return Json(pvModels, JsonRequestBehavior.AllowGet);
            }
            else
                return Content($"Failed to get file content from request ID: {requestId}");
        }

        [HttpPost]
        [Route("UploadFiles")]
        public ActionResult UploadFiles(IEnumerable<HttpPostedFileBase> postedFiles, string pvNo, string userId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var datePath = DateTime.Now.ToString("yyyyMM");
            int count = 0;
            foreach (var postedFile in postedFiles)
            {
                if (postedFile.ContentLength > 0)
                {
                    count++;
                    PvDoc doc = new PvDoc
                    {
                        DOC_ID = Utils.NewGuid(),
                        DOC_NAME = postedFile.FileName,
                        DOC_SIZE = Math.Round((decimal)postedFile.ContentLength / (decimal)1024, 2),     //(KB)
                        DOC_PATH = datePath,
                        PV_NO = pvNo,
                        CREATE_USER = userId,
                        MODIFY_USER = userId,
                        CREATE_DATE = DateTime.Now,
                        MODIFY_DATE = DateTime.Now,
                    };

                    //Create the folder if does not exist
                    if (!Directory.Exists(Path.Combine(path, datePath)))
                        Directory.CreateDirectory(Path.Combine(path, datePath));

                    //Save the posted file
                    postedFile.SaveAs(Path.Combine(path, datePath, doc.DOC_ID));

                    //Save the file information to database
                    air.AddPvDoc(doc);
                }
            }
            return Content(count.ToString());
        }


        [Route("DownloadFile")]
        public ActionResult DownloadFile(string docId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var doc = air.GetPvDocByDocId(docId);
            FileStream fs = new FileStream(Path.Combine(path, doc.DOC_PATH, doc.DOC_ID), FileMode.Open, FileAccess.Read);

            byte[] fileByte = new byte[fs.Length];
            fs.Read(fileByte, 0, (int)fs.Length);
            fs.Flush();
            fs.Close();

            Response.AppendHeader("Content-Disposition", $"attachment;filename={doc.DOC_NAME}");
            return File(fileByte, $"application/{doc.DOC_NAME.Substring(doc.DOC_NAME.LastIndexOf(".") + 1)}");
        }

        [Route("UpdatePvDocs")]
        public ActionResult UpdatePvDocs([Bind(Prefix = "docs")] List<PvDoc> docs, List<string> deleteDocIds, string id, string userId)
        {
            if (deleteDocIds != null)
            {
                foreach (var docId in deleteDocIds)
                {
                    air.DeletePvDoc(docId);
                }
            }
            if (docs != null)
            {
                foreach (var doc in docs)
                {
                    doc.MODIFY_USER = userId;
                    doc.MODIFY_DATE = DateTime.Now;
                    air.UpdatePvDoc(doc);
                }
            }

            docs = air.GetPvDocs(id);
            return Json(docs, JsonRequestBehavior.AllowGet);
        }

        [Route("DeletePvDoc")]
        public ActionResult DeletePvDoc(string docId, string hawbNo)
        {
            air.DeletePvDoc(docId);
            return GetPvDocs(hawbNo);
        }
    }
}