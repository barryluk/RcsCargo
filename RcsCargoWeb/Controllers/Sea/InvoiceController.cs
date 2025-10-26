using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using DbUtils;
using Newtonsoft.Json;
using DbUtils.Models.Sea;
using System.ComponentModel.Design;
using System.Web.Configuration;

namespace RcsCargoWeb.Sea.Controllers
{
    [CheckToken]
    [RoutePrefix("Sea/Invoice")]
    public class InvoiceController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Sea sea = new DbUtils.Sea();
        DbUtils.Admin admin = new DbUtils.Admin();

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

            var results = sea.GetInvoices(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetJobNos")]
        public ActionResult GetJobNos(string searchValue, string companyId, string frtMode, DateTime? startDate, DateTime? endDate)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!startDate.HasValue)
                startDate = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!endDate.HasValue)
                endDate = DateTime.Now.AddMonths(3);

            return Json(sea.GetJobNos(startDate.Value.ToMinTime(), endDate.Value.ToMaxTime(), companyId, frtMode, searchValue).Take(AppUtils.takeRecords), JsonRequestBehavior.AllowGet);
        }

        [Route("GetInvoice")]
        public ActionResult GetInvoice(string id, string companyId, string frtMode)
        {
            var invoice = sea.GetInvoice(id, companyId, frtMode);
            return Json(invoice, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateInvoice")]
        public ActionResult UpdateInvoice(SeaInvoice model, string mode)
        {
            if (string.IsNullOrEmpty(model.INV_NO))
            {
                //Special case for RCSCFSLAX
                if (model.COMPANY_ID == "RCSCFSLAX")
                    model.INV_NO = admin.GetSequenceNumber("RCSCFSLAX_InvoiceNo", model.COMPANY_ID, model.JOB_NO, string.Empty, model.CREATE_DATE);
                else
                    model.INV_NO = admin.GetSequenceNumber("SE_INVOICE", model.COMPANY_ID, string.Empty, string.Empty, model.CREATE_DATE);

                foreach (var item in model.SeaInvoiceRefNos)
                    item.INV_NO = model.INV_NO;
                foreach (var item in model.SeaInvoiceItems)
                    item.INV_NO = model.INV_NO;
            }

            //Make sure the amount is correct
            model.AMOUNT = model.SeaInvoiceItems.Sum(item => item.AMOUNT_HOME);
            model.AMOUNT_HOME = Math.Round(model.AMOUNT * model.EX_RATE, 2);

            if (mode == "edit")
                sea.UpdateInvoice(model);
            else if (mode == "create")
                sea.AddInvoice(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("VoidInvoice")]
        public ActionResult VoidInvoice(string id, SeaInvoice model)
        {
            model.INV_NO = id;
            sea.VoidInvoice(model);
            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingInvNo")]
        public ActionResult IsExistingInvNo(string id, string companyId, string frtMode)
        {
            return Content(sea.IsExistingInvNo(id, companyId, frtMode).ToString());
        }
    }
}