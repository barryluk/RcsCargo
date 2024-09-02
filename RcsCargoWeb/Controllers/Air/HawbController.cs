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

namespace RcsCargoWeb.Air.Controllers
{

    [RoutePrefix("Air/Hawb")]
    public class HawbController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();

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

        [Route("GetHawb")]
        public ActionResult GetHawb(string id, string companyId, string frtMode)
        {
            var hawb = air.GetHawb(id, companyId, frtMode);
            return Json(hawb, JsonRequestBehavior.AllowGet);
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