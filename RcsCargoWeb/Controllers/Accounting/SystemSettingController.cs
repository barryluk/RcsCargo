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
    [CheckToken]
    [RoutePrefix("Accounting/SystemSetting")]
    public class SystemSettingController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Accounting accounting = new DbUtils.Accounting();

        [Route("GetAccountingYears")]
        public ActionResult GetAccountingYears()
        {
            return Json(accounting.GetVoucherAccountYears(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetVoucherDesc")]
        public ActionResult GetVoucherDesc()
        {
            var results = accounting.GetVoucherDesc();
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        #region Person

        [Route("GridPerson_Read")]
        public ActionResult GridPerson_Read([Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
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

        [Route("GetPersons")]
        public ActionResult GetPersons()
        {
            return Json(accounting.GetPersons(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetPersonDepartments")]
        public ActionResult GetPersonDepartments()
        {
            return Json(accounting.GetDepartments(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetPersonMappings")]
        public ActionResult GetPersonMappings()
        {
            return Json(accounting.GetPersonMappings(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetPerson")]
        public ActionResult GetPerson(string id)
        {
            var person = accounting.GetPerson(id);
            return Json(person, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdatePerson")]
        public ActionResult UpdatePerson(Person model, string mode)
        {
            if (mode == "edit")
                accounting.UpdatePerson(model);
            else if (mode == "create")
                accounting.AddPerson(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeletePerson")]
        public ActionResult DeletePerson(string id)
        {
            accounting.DeletePerson(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingPersonCode")]
        public ActionResult IsExistingPersonCode(string id)
        {
            return Content(accounting.IsExistingPersonCode(id).ToString());
        }

        #endregion

        #region Customer

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

        [Route("GetCustomers")]
        public ActionResult GetCustomers(string searchValue = "")
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var results = accounting.GetCustomers(searchValue);
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetCustomerMappings")]
        public ActionResult GetCustomerMappings(string searchValue = "")
        {
            var results = accounting.GetCustomerMappings(searchValue.Trim().ToUpper());
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetCustomerRegions")]
        public ActionResult GetCustomerRegions()
        {
            return Json(accounting.GetCustomerRegions(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetCustomer")]
        public ActionResult GetCustomer(string id)
        {
            var customer = accounting.GetCustomer(id);
            return Json(customer, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateCustomer")]
        public ActionResult UpdateCustomer(AcCustomer model, string mode)
        {
            if (mode == "edit")
                accounting.UpdateCustomer(model);
            else if (mode == "create")
                accounting.AddCustomer(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteCustomer")]
        public ActionResult DeleteCustomer(string id)
        {
            accounting.DeleteCustomer(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingCustomerCode")]
        public ActionResult IsExistingCustomerCode(string id)
        {
            return Content(accounting.IsExistingCustomerCode(id).ToString());
        }

        #endregion

        #region Vendor

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

        [Route("GetVendorMappings")]
        public ActionResult GetVendorMappings(string searchValue = "")
        {
            var results = accounting.GetVendorMappings(searchValue.Trim().ToUpper());
            return Json(results.Take(50).ToList(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetVendorRegions")]
        public ActionResult GetVendorRegions()
        {
            return Json(accounting.GetVendorRegions(), JsonRequestBehavior.AllowGet);
        }

        [Route("GetVendor")]
        public ActionResult GetVendor(string id)
        {
            var vendor = accounting.GetVendor(id);
            return Json(vendor, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateVendor")]
        public ActionResult UpdateVendor(AcVendor model, string mode)
        {
            if (mode == "edit")
                accounting.UpdateVendor(model);
            else if (mode == "create")
                accounting.AddVendor(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("DeleteVendor")]
        public ActionResult DeleteVendor(string id)
        {
            accounting.DeleteVendor(id);
            return Content(id, "text/plain");
        }

        [Route("IsExistingVendorCode")]
        public ActionResult IsExistingVendorCode(string id)
        {
            return Content(accounting.IsExistingVendorCode(id).ToString());
        }

        #endregion

    }
}