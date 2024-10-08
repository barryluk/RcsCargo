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

    [RoutePrefix("MasterRecord/Currency")]
    public class CurrencyController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridCurrency_Read")]
        public ActionResult GridCurrency_Read(string companyId)
        {
            var results = masterRecord.GetCurrencies(companyId);
            return AppUtils.JsonContentResult(results);
        }

        [Route("GetCurrency")]
        public ActionResult GetCurrency(string id, string companyId)
        {
            var Currency = masterRecord.GetCurrency(id, companyId);
            return Json(Currency, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateCurrency")]
        public ActionResult UpdateCurrency(Currency model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdateCurrency(model);
            else if (mode == "create")
                masterRecord.AddCurrency(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteCurrency")]
        public ActionResult DeleteCurrency(string id, string companyId)
        {   
            masterRecord.DeleteCurrency(id, companyId);
            return Content(id, "text/plain");
        }

        [Route("IsExistingCurrencyCode")]
        public ActionResult IsExistingCurrencyCode(string id, string companyId)
        {
            return Content(masterRecord.IsExisitingCurrencyCode(id, companyId).ToString());
        }
    }
}