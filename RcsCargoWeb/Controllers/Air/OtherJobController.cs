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

namespace RcsCargoWeb.Air.Controllers
{

    [RoutePrefix("Air/OtherJob")]
    public class OtherJobController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridOtherJob_Read")]
        public ActionResult GridOtherJob_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "FLIGHT_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetOtherJobs(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetOtherJob")]
        public ActionResult GetOtherJob(string id, string companyId, string frtMode)
        {
            var job = air.GetOtherJob(id, companyId, frtMode);
            return Json(job, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateOtherJob")]
        public ActionResult UpdateOtherJob(OtherJob model, string mode)
        {
            if (string.IsNullOrEmpty(model.JOB_NO) || mode == "create")
            {
                model.JOB_NO = admin.GetSequenceNumber("AE_OTHER_JOB", model.COMPANY_ID, model.ORIGIN_CODE, model.DEST_CODE, model.CREATE_DATE);
                foreach (var item in model.OtherJobChargesPrepaid)
                    item.JOB_NO = model.JOB_NO; 
                foreach (var item in model.OtherJobChargesCollect)
                    item.JOB_NO = model.JOB_NO;
            }

            if (mode == "edit")
                air.UpdateOtherJob(model);
            else if (mode == "create")
                air.AddOtherJob(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingOtherJobNo")]
        public ActionResult IsExistingOtherJobNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExistingOtherJobNo(id, companyId, frtMode).ToString());
        }
    }
}