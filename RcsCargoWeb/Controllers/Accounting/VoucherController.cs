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
            var results = accounting.GetVouchers(dateFrom, dateTo);
            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetVoucher")]
        public ActionResult GetVoucher(int year, int period, int voucherNo)
        {
            return Json(accounting.GetVoucher(year, period, voucherNo), JsonRequestBehavior.AllowGet);
        }

        [Route("GetVoucherNo")]
        public ActionResult GetVoucherNo(DateTime voucherDate)
        {
            return Content(accounting.GetVoucherNo(voucherDate).ToString());
        }

        [Route("SaveVoucher")]
        public ActionResult SaveVoucher(VoucherModel voucherModel)
        {
            foreach (var voucher in voucherModel.Vouchers)
            {
                voucher.VOUCHER_TYPE = "记";
                voucher.YEAR = voucherModel.YEAR;
                voucher.PERIOD = voucherModel.PERIOD;
                voucher.VOUCHER_NO = voucherModel.VOUCHER_NO;
                voucher.VOUCHER_DATE = voucherModel.VOUCHER_DATE;
                voucher.CBILL = voucherModel.CBILL;
                voucher.CCHECK = string.Empty;
                voucher.IBOOK = 0;
            }
            accounting.SaveVoucher(voucherModel);
            return Json(voucherModel.Vouchers, JsonRequestBehavior.AllowGet);
        }

        [Route("DeleteVoucher")]
        public ActionResult DeleteVoucher(int year, int period, int voucherNo)
        {
            accounting.DeleteVoucher(year, period, voucherNo);
            return Content("success");
        }

        [Route("ApproveVouchers")]
        public ActionResult ApproveVouchers(GLVoucher[] vouchers)
        {
            accounting.ApproveVouchers(vouchers);
            accounting.CalcAccountSummary(vouchers.Select(a => a.YEAR).First(), vouchers.Select(a => a.PERIOD).Min());
            return Content("success");
        }

        [Route("GetProfitLossVouchers")]
        public ActionResult GetProfitLossVouchers(int year, int period)
        {
            var vouchers = accounting.GetProfitLossVouchers(year, period);
            return Json(vouchers, JsonRequestBehavior.AllowGet);
        }
    }
}