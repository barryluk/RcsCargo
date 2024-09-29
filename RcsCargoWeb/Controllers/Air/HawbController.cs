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
using System.IO;
using System.Web.Services;

namespace RcsCargoWeb.Air.Controllers
{

    [RoutePrefix("Air/Hawb")]
    public class HawbController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridHawb_Read")]
        public ActionResult GridHawb_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "CREATE_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetHawbs(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetUnusedBooking")]
        public ActionResult GetUnusedBooking(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var result = air.GetUnusedBookings(dateFrom.Value, dateTo.Value, companyId, frtMode, searchValue).Take(AppUtils.takeRecords);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [Route("GetHawbNos")]
        public ActionResult GetHawbNos(string id, string companyId, string frtMode)
        {
            var result = air.GetHawbNos(id, companyId, frtMode);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [Route("GetHawbs")]
        public ActionResult GetHawbs(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var result = air.GetHawbs(dateFrom.Value, dateTo.Value, companyId, frtMode, searchValue).Take(AppUtils.takeRecords);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [Route("GetMawbs")]
        public ActionResult GetMawbs(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var result = air.GetMawbs(dateFrom.Value, dateTo.Value, companyId, frtMode, searchValue).Take(AppUtils.takeRecords);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [Route("GetHawb")]
        public ActionResult GetHawb(string id, string companyId, string frtMode)
        {
            var hawb = air.GetHawb(id, companyId, frtMode);
            return Json(hawb, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateHawb")]
        public ActionResult UpdateHawb(Hawb model, string mode)
        {
            if (string.IsNullOrEmpty(model.HAWB_NO))
            {
                model.HAWB_NO = admin.GetSequenceNumber("AE_HAWB", model.COMPANY_ID, model.ORIGIN_CODE, model.DEST_CODE, model.CREATE_DATE);

                foreach (var item in model.HawbPos)
                    item.HAWB_NO = model.HAWB_NO;
                foreach (var item in model.HawbDims)
                    item.HAWB_NO = model.HAWB_NO;
                foreach (var item in model.HawbLics)
                    item.HAWB_NO = model.HAWB_NO;
                foreach (var item in model.HawbChargesPrepaid)
                    item.HAWB_NO = model.HAWB_NO;
                foreach (var item in model.HawbChargesCollect)
                    item.HAWB_NO = model.HAWB_NO;
                foreach (var item in model.HawbStatuses)
                    item.HAWB_NO = model.HAWB_NO;
            }

            if (mode == "edit")
                air.UpdateHawb(model);
            else if (mode == "create")
                air.AddHawb(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingHawbNo")]
        public ActionResult IsExistingHawbNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExisitingHawbNo(id, companyId, frtMode).ToString());
        }

        [Route("GetHawbDocs")]
        public ActionResult GetHawbDocs(string id)
        {
            var docs = air.GetHawbDocs(id);
            return Json(docs, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Route("UploadFiles")]
        public ActionResult UploadFiles(IEnumerable<HttpPostedFileBase> postedFiles, string hawbNo, string userId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var datePath = DateTime.Now.ToString("yyyyMM");
            int count = 0;
            foreach (var postedFile in postedFiles)
            {
                if (postedFile.ContentLength > 0)
                {
                    count++;
                    HawbDoc doc = new HawbDoc
                    {
                        DOC_ID = Utils.NewGuid(),
                        DOC_NAME = postedFile.FileName,
                        DOC_SIZE = Math.Round((decimal)postedFile.ContentLength / (decimal)1024, 2),     //(KB)
                        DOC_PATH = datePath,
                        HAWB_NO = hawbNo,
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
                    air.AddHawbDoc(doc);
                }
            }
            return Content(count.ToString());
        }


        [Route("DownloadFile")]
        public ActionResult DownloadFile(string docId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var doc = air.GetHawbDocByDocId(docId);
            FileStream fs = new FileStream(Path.Combine(path, doc.DOC_PATH, doc.DOC_ID), FileMode.Open, FileAccess.Read);

            byte[] fileByte = new byte[fs.Length];
            fs.Read(fileByte, 0, (int)fs.Length);
            fs.Flush();
            fs.Close();

            Response.AppendHeader("Content-Disposition", $"attachment;filename={doc.DOC_NAME}");
            return File(fileByte, $"application/{doc.DOC_NAME.Substring(doc.DOC_NAME.LastIndexOf(".") + 1)}");
        }

        [Route("UpdateHawbDocs")]
        public ActionResult UpdateHawbDocs([Bind(Prefix = "docs")] List<HawbDoc> docs, List<string> deleteDocIds, string id, string userId)
        {
            if (deleteDocIds != null)
            {
                foreach (var docId in deleteDocIds)
                {
                    air.DeleteHawbDoc(docId);
                }
            }
            if (docs != null)
            {
                foreach (var doc in docs)
                {
                    doc.MODIFY_USER = userId;
                    doc.MODIFY_DATE = DateTime.Now;
                    air.UpdateHawbDoc(doc);
                }
            }

            docs = air.GetHawbDocs(id);
            return Json(docs, JsonRequestBehavior.AllowGet);
        }

        [Route("DeleteHawbDoc")]
        public ActionResult DeleteHawbDoc(string docId, string hawbNo)
        {
            air.DeleteHawbDoc(docId);
            return GetHawbDocs(hawbNo);
        }
    }
}