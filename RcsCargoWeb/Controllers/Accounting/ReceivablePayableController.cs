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

    [RoutePrefix("Accounting/ReceivablePayable")]
    public class ReceivablePayableController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Accounting accounting = new DbUtils.Accounting();

        [Route("GridReceivablePayable_Read")]
        public ActionResult GridReceivablePayable_Read(DateTime dateFrom, DateTime dateTo, string vouchType, [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 40, int skip = 0)
        {
            var sortField = "VOUCH_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = accounting.GetInvoices(dateFrom, dateTo, vouchType);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetArApInvoices")]
        public ActionResult GetArApInvoices(DateTime dateFrom, DateTime dateTo, string vouchType)
        {
            var results = accounting.GetInvoices(dateFrom, dateTo, vouchType);
            return Json(results.OrderByDescending(a => a.VOUCH_DATE), JsonRequestBehavior.AllowGet);
        }

        [Route("GetArApInvoice")]
        public ActionResult GetArApInvoice(string id)
        {
            var result = accounting.GetArApInvoice(id);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [Route("SaveArApInvoice")]
        public ActionResult SaveArApInvoice(AcArApInvoice model)
        {
            if (string.IsNullOrEmpty(model.ID))
                model.ID = Utils.NewGuid();

            accounting.SaveArApInvoice(model);
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        [Route("DeleteArApInvoice")]
        public ActionResult DeleteArApInvoice(string id)
        {
            accounting.DeleteArApInvoice(id);
            return Content("success");
        }

        [Route("IsExistingArApInvoiceNo")]
        public ActionResult IsExistingArApInvoiceNo(string invNo, string vouchType)
        {
            return Content(accounting.IsExistingArApInvoiceNo(invNo, vouchType).ToString());
        }
    }
}