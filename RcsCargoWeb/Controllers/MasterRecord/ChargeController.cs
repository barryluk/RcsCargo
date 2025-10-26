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
    [CheckToken]
    [RoutePrefix("MasterRecord/Charge")]
    public class ChargeController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridCharge_Read")]
        public ActionResult GridCharge_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetCharges(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetCharge")]
        public ActionResult GetCharge(string id)
        {
            var Charge = masterRecord.GetCharge(id);
            return Json(Charge, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateCharge")]
        public ActionResult UpdateCharge(Charge model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdateCharge(model);
            else if (mode == "create")
                masterRecord.AddCharge(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteCharge")]
        public ActionResult DeleteCharge(string id)
        {   
            masterRecord.DeleteCharge(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingChargeCode")]
        public ActionResult IsExistingChargeCode(string id)
        {
            return Content(masterRecord.IsExistingChargeCode(id).ToString());
        }
    }
}