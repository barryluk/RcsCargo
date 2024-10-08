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

    [RoutePrefix("MasterRecord/Country")]
    public class CountryController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridCountry_Read")]
        public ActionResult GridCountry_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetCountries(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetCountry")]
        public ActionResult GetCountry(string id)
        {
            var Country = masterRecord.GetCountry(id);
            return Json(Country, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateCountry")]
        public ActionResult UpdateCountry(Country model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdateCountry(model);
            else if (mode == "create")
                masterRecord.AddCountry(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteCountry")]
        public ActionResult DeleteCountry(string id)
        {   
            masterRecord.DeleteCountry(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingCountryCode")]
        public ActionResult IsExistingCountryCode(string id)
        {
            return Content(masterRecord.IsExisitingCountryCode(id).ToString());
        }
    }
}