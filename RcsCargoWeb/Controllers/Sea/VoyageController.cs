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

namespace RcsCargoWeb.Sea.Controllers
{

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