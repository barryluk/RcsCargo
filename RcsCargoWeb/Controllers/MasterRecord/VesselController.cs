using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using DbUtils;
using Newtonsoft.Json;
using DbUtils.Models.MasterRecords;
using System.ComponentModel.Design;
using System.Web.Configuration;
using System.Web.UI;

namespace RcsCargoWeb.MasterRecord.Controllers
{

    [RoutePrefix("MasterRecord/Vessel")]
    public class VesselController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridVessel_Read")]
        public ActionResult GridVessel_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetVessels(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetVessel")]
        public ActionResult GetVessel(string id)
        {
            var Vessel = masterRecord.GetVessel(id);
            return Json(Vessel, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateVessel")]
        public ActionResult UpdateVessel(Vessel model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdateVessel(model);
            else if (mode == "create")
                masterRecord.AddVessel(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteVessel")]
        public ActionResult DeleteVessel(string id)
        {   
            masterRecord.DeleteVessel(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingVesselCode")]
        public ActionResult IsExistingVesselCode(string id)
        {
            return Content(masterRecord.IsExistingVesselCode(id).ToString());
        }
    }
}