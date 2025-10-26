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
    [RoutePrefix("MasterRecord/ChargeTemplate")]
    public class ChargeTemplateController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridChargeTemplate_Read")]
        public ActionResult GridChargeTemplate_Read(string searchValue, string companyId, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "TEMPLATE_NAME";
            var sortDir = "asc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetChargeTemplates(searchValue, companyId);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetChargeTemplate")]
        public ActionResult GetChargeTemplate(string id, string companyId)
        {
            var ChargeTemplate = masterRecord.GetChargeTemplate(id, companyId);
            return Json(ChargeTemplate, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateChargeTemplate")]
        public ActionResult UpdateChargeTemplate(ChargeTemplateView model, string mode)
        {
            if (mode == "edit")
                masterRecord.UpdateChargeTemplate(model);
            else if (mode == "create")
                masterRecord.AddChargeTemplate(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteChargeTemplate")]
        public ActionResult DeleteChargeTemplate(string id, string companyId)
        {
            masterRecord.DeleteChargeTemplate(id, companyId);
            return Content(id, "text/plain");
        }

        [Route("IsExistingChargeTemplateName")]
        public ActionResult IsExistingChargeTemplateName(string id)
        {
            return Content(masterRecord.IsExistingChargeTemplateName(id).ToString());
        }
    }
}