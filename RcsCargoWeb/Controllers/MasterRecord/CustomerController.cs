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

namespace RcsCargoWeb.MasterRecord.Controllers
{

    [RoutePrefix("MasterRecord/Customer")]
    public class CustomerController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.MasterRecords masterRecord = new DbUtils.MasterRecords();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridCustomer_Read")]
        public ActionResult GridCustomer_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "MODIFY_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = masterRecord.GetCustomerViews(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetCustomer")]
        public ActionResult GetCustomer(string id)
        {
            var customer = masterRecord.GetCustomer(id);
            return Json(customer, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateCustomer")]
        public ActionResult UpdateCustomer(Customer model, string mode)
        {
            if (string.IsNullOrEmpty(model.CUSTOMER_CODE))
            {
                model.CUSTOMER_CODE = masterRecord.GetNewCustomerCode(model.CustomerNames.First().CUSTOMER_DESC);
                foreach (var item in model.CustomerNames)
                    item.CUSTOMER_CODE = model.CUSTOMER_CODE;
                foreach (var item in model.CustomerContacts)
                    item.CUSTOMER_CODE = model.CUSTOMER_CODE;
            }

            if (mode == "edit")
                masterRecord.UpdateCustomer(model);
            else if (mode == "create")
                masterRecord.AddCustomer(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }
    }
}