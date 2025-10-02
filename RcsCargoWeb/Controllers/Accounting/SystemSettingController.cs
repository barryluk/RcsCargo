using DbUtils;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using DbUtils.Models.Accounting;

namespace RcsCargoWeb.Controllers.Accounting
{

    [RoutePrefix("Accounting/SystemSetting")]
    public class SystemSettingController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Accounting accounting = new DbUtils.Accounting();

        [Route("GridPerson_Read")]
        public ActionResult GridPerson_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "PERSON_CODE";
            var sortDir = "asc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = accounting.GetPersons();

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GridCustomer_Read")]
        public ActionResult GridCustomer_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            if (string.IsNullOrEmpty(searchValue))
                searchValue = string.Empty;

            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "CUSTOMER_CODE";
            var sortDir = "asc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = accounting.GetCustomers(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetAccountingYears")]
        public ActionResult GetAccountingYears()
        {
            return Json(accounting.GetVoucherAccountYears(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetCustomers")]
        public ActionResult GetCustomers(string searchValue = "")
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var results = accounting.GetCustomers(searchValue);
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GridVendor_Read")]
        public ActionResult GridVendor_Read(string searchValue, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "VENDOR_CODE";
            var sortDir = "asc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = accounting.GetVendors(searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetVendors")]
        public ActionResult GetVendors(string searchValue)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var results = accounting.GetVendors(searchValue);
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetVoucherDesc")]
        public ActionResult GetVoucherDesc()
        {
            var results = accounting.GetVoucherDesc();
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetCustomerMappings")]
        public ActionResult GetCustomerMappings(string searchValue = "")
        {
            var results = accounting.GetCustomerMappings(searchValue.Trim().ToUpper());
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetVendorMappings")]
        public ActionResult GetVendorMappings(string searchValue = "")
        {
            var results = accounting.GetVendorMappings(searchValue.Trim().ToUpper());
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetPersonMappings")]
        public ActionResult GetPersonMappings()
        {
            return Json(accounting.GetPersonMappings(), JsonRequestBehavior.AllowGet);
        }

    }
}