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

    [RoutePrefix("MasterRecord/PowerSearch")]
    public class PowerSearchController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GetPowerSearchSettings")]
        public ActionResult GetPowerSearchSettings()
        {
            var settings = masterRecord.GetPowerSearchSettings();
            return Json(settings, JsonRequestBehavior.AllowGet);
        }

        [Route("GetPowerSearchTemplates")]
        public ActionResult GetPowerSearchTemplates()
        {
            var settings = masterRecord.GetPowerSearchTemplates();
            return Json(settings, JsonRequestBehavior.AllowGet);
        }

        [Route("Search")]
        public ActionResult Search(string searchValue, string companyId, int days = 90)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var results = air.PowerSearch(searchValue, companyId, days, 10);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetSearchResultDetail")]
        public ActionResult GetSearchResultDetail(string tableName, string id, string idFieldName, string companyId, string frtMode)
        {
            var resultDetail = air.GetPowerSearchDetails(tableName, id, idFieldName, companyId, frtMode);
            return Json(JsonConvert.SerializeObject(resultDetail), JsonRequestBehavior.AllowGet);
        }
    }
}