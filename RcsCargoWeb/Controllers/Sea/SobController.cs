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
    [CheckToken]
    [RoutePrefix("Sea/Sob")]
    public class SobController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Sea sea = new DbUtils.Sea();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridSob_Read")]
        public ActionResult GridSob_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
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

            var results = sea.GetSobs(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetSobNos")]
        public ActionResult GetSobNos(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var results = sea.GetSobs(dateFrom.Value.ToMinTime(), dateTo.Value.ToMaxTime(), companyId, frtMode, searchValue);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetSob")]
        public ActionResult GetSob(string id, string companyId, string frtMode)
        {
            var booking = sea.GetSob(id, companyId, frtMode);
            return Json(booking, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateSob")]
        public ActionResult UpdateSob(Sob model, string mode)
        {
            if (string.IsNullOrEmpty(model.SOB_NO))
                model.SOB_NO = admin.GetSequenceNumber("SE_SOB", model.COMPANY_ID, model.LOADING_PORT, model.DISCHARGE_PORT, model.CREATE_DATE);

            foreach (var item in model.SobCargos)
            {
                item.SOB_NO = model.SOB_NO;
                item.HBL_NO = model.HBL_NO;
            }
            foreach (var item in model.SobContainers)
            {
                item.SOB_NO = model.SOB_NO;
                item.HBL_NO = model.HBL_NO;
            }
            foreach (var item in model.SobSos)
            {
                item.SOB_NO = model.SOB_NO;
                item.HBL_NO = model.HBL_NO;
            }

            if (mode == "edit")
                sea.UpdateSob(model);
            else if (mode == "create")
                sea.AddSob(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingSobNo")]
        public ActionResult IsExistingSobNo(string id, string companyId, string frtMode)
        {
            return Content(sea.IsExisitingSobNo(id, companyId, frtMode).ToString());
        }
    }
}