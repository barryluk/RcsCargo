using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using DbUtils;
using Newtonsoft.Json;
using DbUtils.Models.Air;
using System.ComponentModel.Design;
using System.Web.Configuration;

namespace RcsCargoWeb.Air.Controllers
{

    [RoutePrefix("Air/Invoice")]
    public class InvoiceController : Controller
    {
        DbUtils.Air air = new DbUtils.Air();

        [Route("GridInvoice_Read")]
        public ActionResult GridInvoice_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "INV_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetInvoices(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetInvoice")]
        public ActionResult GetInvoice(string id, string companyId, string frtMode)
        {
            var hawb = air.GetInvoice(id, companyId, frtMode);
            return Json(hawb, JsonRequestBehavior.AllowGet);
        }

        [Route("IsExistingInvNo")]
        public ActionResult IsExistingInvNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExistingInvNo(id, companyId, frtMode).ToString());
        }
    }
}