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

    [RoutePrefix("MasterRecord/SeaPort")]
    public class SeaPortController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridSeaPort_Read")]
        public ActionResult GridSeaPort_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetSeaPorts(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetSeaPort")]
        public ActionResult GetSeaPort(string id)
        {
            var SeaPort = masterRecord.GetSeaPort(id);
            return Json(SeaPort, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateSeaPort")]
        public ActionResult UpdateSeaPort(SeaPort model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdateSeaPort(model);
            else if (mode == "create")
                masterRecord.AddSeaPort(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteSeaPort")]
        public ActionResult DeleteSeaPort(string id)
        {   
            masterRecord.DeleteSeaPort(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingSeaPortCode")]
        public ActionResult IsExistingSeaPortCode(string id)
        {
            return Content(masterRecord.IsExistingSeaPortCode(id).ToString());
        }
    }
}