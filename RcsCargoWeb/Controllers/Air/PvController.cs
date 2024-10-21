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

    [RoutePrefix("Air/Pv")]
    public class PvController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
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
    }
}