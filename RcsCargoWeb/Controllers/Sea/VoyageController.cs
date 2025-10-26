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
using System.Web.UI;

namespace RcsCargoWeb.Sea.Controllers
{
    [CheckToken]
    [RoutePrefix("Sea/Voyage")]
    public class VoyageController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Sea sea = new DbUtils.Sea();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridVoyage_Read")]
        public ActionResult GridVoyage_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
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

            var results = sea.GetVoyages(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetVoyages")]
        public ActionResult GetVoyages(string searchValue, string companyId, string frtMode, DateTime? startDate, DateTime? endDate)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!startDate.HasValue)
                startDate = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!endDate.HasValue)
                endDate = DateTime.Now.AddMonths(3);

            var voyages = sea.GetVoyages(startDate.Value.ToMinTime(), endDate.Value.ToMaxTime(), companyId, frtMode, searchValue).Take(AppUtils.takeRecords).ToList();

            //Special case for RCSCFSLAX
            if (companyId == "RCSCFSLAX")
            {
                var result2 = sea.GetVoyages(startDate.Value.ToMinTime(), endDate.Value.ToMaxTime(), "RCSJFK", frtMode, searchValue).Take(AppUtils.takeRecords);
                foreach (var item in result2)
                    voyages.Add(item);
            }

            return Json(voyages, JsonRequestBehavior.AllowGet);
        }

        [Route("GetVoyage")]
        public ActionResult GetVoyage(string vesCode, string voy, string companyId, string frtMode)
        {
            var voyage = sea.GetVoyage(vesCode, voy, companyId, frtMode);
            return Json(voyage, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateVoyage")]
        public ActionResult UpdateVoyage(Voyage model, string mode)
        {
            foreach(var item in model.LoadingPorts)
            {
                item.VES_CODE = model.VES_CODE;
                item.VOYAGE = model.VOYAGE;
            }
            foreach (var item in model.DischargePorts)
            {
                item.VES_CODE = model.VES_CODE;
                item.VOYAGE = model.VOYAGE;
            }

            if (mode == "edit")
                sea.UpdateVoyage(model);
            else if (mode == "create")
                sea.AddVoyage(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingVesselVoyage")]
        public ActionResult IsExistingVesselVoyage(string vesCode, string voy, string companyId, string frtMode)
        {
            return Content(sea.IsExisitingVesselVoyage(vesCode, voy, companyId, frtMode).ToString());
        }
    }
}