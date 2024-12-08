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

    [RoutePrefix("MasterRecord/Airline")]
    public class AirlineController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridAirline_Read")]
        public ActionResult GridAirline_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetAirlines(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetAirline")]
        public ActionResult GetAirline(string id)
        {
            var Airline = masterRecord.GetAirline(id);
            return Json(Airline, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateAirline")]
        public ActionResult UpdateAirline(Airline model, string mode)
        {
            model.BRANCH_CODE = model.CUSTOMER_BRANCH;
            model.SHORT_DESC = model.CUSTOMER_SHORT_DESC;
            if (mode == "edit")
                masterRecord.UpdateAirline(model);
            else if (mode == "create")
                masterRecord.AddAirline(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteAirline")]
        public ActionResult DeleteAirline(string id)
        {   
            masterRecord.DeleteAirline(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingAirlineCode")]
        public ActionResult IsExistingAirlineCode(string id)
        {
            return Content(masterRecord.IsExistingAirlineCode(id).ToString());
        }
    }
}