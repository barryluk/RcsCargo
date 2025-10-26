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
    [RoutePrefix("MasterRecord/Port")]
    public class PortController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridPort_Read")]
        public ActionResult GridPort_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetPorts(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetPort")]
        public ActionResult GetPort(string id)
        {
            var Port = masterRecord.GetPort(id);
            return Json(Port, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdatePort")]
        public ActionResult UpdatePort(Port model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdatePort(model);
            else if (mode == "create")
                masterRecord.AddPort(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeletePort")]
        public ActionResult DeletePort(string id)
        {   
            masterRecord.DeletePort(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingPortCode")]
        public ActionResult IsExistingPortCode(string id)
        {
            return Content(masterRecord.IsExistingPortCode(id).ToString());
        }
    }
}