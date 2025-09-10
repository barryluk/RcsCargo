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

    [RoutePrefix("Accounting/Voucher")]
    public class VoucherController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Accounting accounting = new DbUtils.Accounting();

        [Route("GridVoucher_Read")]
        public ActionResult GridVoucher_Read(DateTime dateFrom, DateTime dateTo, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            //var sortField = "VOUCHER_DATE";
            //var sortDir = "asc";

            //if (sortings != null)
            //{
            //    sortField = sortings.First().Single(a => a.Key == "field").Value;
            //    sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            //}

            var results = accounting.GetVouchers(dateFrom, dateTo);

            //if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            //{
            //    if (sortDir == "asc")
            //        results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            //    else
            //        results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            //}

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetVoucher")]
        public ActionResult GetVoucher(int year, int period, int voucherNo)
        {
            return Json(accounting.GetVoucher(year, period, voucherNo), JsonRequestBehavior.AllowGet);
        }
    }
}