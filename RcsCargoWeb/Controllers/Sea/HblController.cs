using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using DbUtils;
using Newtonsoft.Json;
using DbUtils.Models.Sea;
using System.ComponentModel.Design;
using System.Web.Configuration;
using DbUtils.Models.Air;
using System.IO;
using System.Web.UI;

namespace RcsCargoWeb.Sea.Controllers
{

    [RoutePrefix("Sea/Hbl")]
    public class HblController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Sea sea = new DbUtils.Sea();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridHbl_Read")]
        public ActionResult GridHbl_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "LOADING_PORT_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = sea.GetHbls(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetHblNos")]
        public ActionResult GetHblNos(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var results = sea.GetHbls(dateFrom.Value.ToMinTime(), dateTo.Value.ToMaxTime(), companyId, frtMode, searchValue);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetContainerNos")]
        public ActionResult GetContainerNos(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var results = sea.GetContainerNos(dateFrom.Value.ToMinTime(), dateTo.Value.ToMaxTime(), companyId, frtMode, searchValue);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetJobNos")]
        public ActionResult GetJobNos(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var results = sea.GetJobNos(dateFrom.Value.ToMinTime(), dateTo.Value.ToMaxTime(), companyId, frtMode, searchValue);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetHbl")]
        public ActionResult GetHbl(string id, string companyId, string frtMode, bool byJob = false)
        {
            var booking = sea.GetHbl(id, companyId, frtMode, byJob);
            return Json(booking, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateHbl")]
        public ActionResult UpdateHbl(SeaHbl model, string mode)
        {
            if (string.IsNullOrEmpty(model.HBL_NO))
                model.HBL_NO = admin.GetSequenceNumber("SE_HBL", model.COMPANY_ID, model.LOADING_PORT, model.DISCHARGE_PORT, model.CREATE_DATE);

            if (model.JOB_NO == "NEW JOB#")
            {
                if (model.FRT_MODE == "SE")
                    model.JOB_NO = admin.GetSequenceNumber("SE_JOB", model.COMPANY_ID, model.LOADING_PORT, model.DISCHARGE_PORT, model.LOADING_PORT_DATE);
                else
                    model.JOB_NO = admin.GetSequenceNumber("SI_JOB", model.COMPANY_ID, model.LOADING_PORT, model.DISCHARGE_PORT, model.LOADING_PORT_DATE);
            }

            foreach (var item in model.SeaHblCargos)
                item.HBL_NO = model.HBL_NO;
            foreach (var item in model.SeaHblContainers)
                item.HBL_NO = model.HBL_NO;
            foreach (var item in model.SeaHblPos)
                item.HBL_NO = model.HBL_NO;
            foreach (var item in model.SeaHblSos)
                item.HBL_NO = model.HBL_NO;
            foreach (var item in model.SeaHblChargesPrepaid)
                item.HBL_NO = model.HBL_NO;
            foreach (var item in model.SeaHblChargesCollect)
                item.HBL_NO = model.HBL_NO;
            foreach (var item in model.SeaHblStatuses)
                item.HBL_NO = model.HBL_NO;

            if (mode == "edit")
                sea.UpdateHbl(model);
            else if (mode == "create")
                sea.AddHbl(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingHblNo")]
        public ActionResult IsExistingHblNo(string id, string companyId, string frtMode)
        {
            return Content(sea.IsExisitingHblNo(id, companyId, frtMode).ToString());
        }

        [Route("GetHblDocs")]
        public ActionResult GetHblDocs(string id)
        {
            var docs = sea.GetSeaHblDocs(id);
            return Json(docs, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [Route("UploadFiles")]
        public ActionResult UploadFiles(IEnumerable<HttpPostedFileBase> postedFiles, string hblNo, string userId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var datePath = DateTime.Now.ToString("yyyyMM");
            int count = 0;
            foreach (var postedFile in postedFiles)
            {
                if (postedFile.ContentLength > 0)
                {
                    count++;
                    SeaHblDoc doc = new SeaHblDoc
                    {
                        DOC_ID = Utils.NewGuid(),
                        DOC_NAME = postedFile.FileName,
                        DOC_SIZE = Math.Round((decimal)postedFile.ContentLength / (decimal)1024, 2),     //(KB)
                        DOC_PATH = datePath,
                        HBL_NO = hblNo,
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
                    sea.AddSeaHblDoc(doc);
                }
            }
            return Content(count.ToString());
        }


        [Route("DownloadFile")]
        public ActionResult DownloadFile(string docId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var doc = sea.GetSeaHblDocByDocId(docId);
            FileStream fs = new FileStream(Path.Combine(path, doc.DOC_PATH, doc.DOC_ID), FileMode.Open, FileAccess.Read);

            byte[] fileByte = new byte[fs.Length];
            fs.Read(fileByte, 0, (int)fs.Length);
            fs.Flush();
            fs.Close();

            Response.AppendHeader("Content-Disposition", $"attachment;filename={doc.DOC_NAME}");
            return File(fileByte, $"application/{doc.DOC_NAME.Substring(doc.DOC_NAME.LastIndexOf(".") + 1)}");
        }

        [Route("UpdateSeaHblDocs")]
        public ActionResult UpdateSeaHblDocs([Bind(Prefix = "docs")] List<SeaHblDoc> docs, List<string> deleteDocIds, string id, string userId)
        {
            if (deleteDocIds != null)
            {
                foreach (var docId in deleteDocIds)
                {
                    sea.DeleteSeaHblDoc(docId);
                }
            }
            if (docs != null)
            {
                foreach (var doc in docs)
                {
                    doc.MODIFY_USER = userId;
                    doc.MODIFY_DATE = DateTime.Now;
                    sea.UpdateSeaHblDoc(doc);
                }
            }

            docs = sea.GetSeaHblDocs(id);
            return Json(docs, JsonRequestBehavior.AllowGet);
        }

        [Route("DeleteSeaHblDoc")]
        public ActionResult DeleteSeaHblDoc(string docId, string hblNo)
        {
            sea.DeleteSeaHblDoc(docId);
            return GetHblDocs(hblNo);
        }
    }
}