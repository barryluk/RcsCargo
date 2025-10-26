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
    [RoutePrefix("Accounting/Report")]
    public class AcReportController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Accounting accounting = new DbUtils.Accounting();

        [Route("GetLedgerAccountSummary")]
        public ActionResult GetLedgerAccountSummary(int year, int period)
        {
            var results = accounting.GetLedgerAccountSummary(year, period);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetLedgerAccountBegEndAmount")]
        public ActionResult GetLedgerAccountBegEndAmount(int year, int period, bool isYearStart)
        {
            var results = accounting.GetLedgerAccountBegEndAmount(year, period, isYearStart);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetProfitLossSummary")]
        public ActionResult GetProfitLossSummary(int year, int period)
        {
            var results = accounting.GetProfitLossSummary(year, period);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        //For re-calculation purpose
        [Route("CalcAccountSummary")]
        public ActionResult CalcAccountSummary(int year, int period)
        {
            accounting.CalcAccountSummary(year, period);
            return Content("success");
        }

        //For re-calculation purpose
        [Route("CalcAccountAssist")]
        public ActionResult CalcAccountAssist(int year, int period)
        {
            accounting.CalcAccountAssist(year, period);
            return Content("success");
        }

        [Route("GetBankTransaction")]
        public ActionResult GetBankTransaction(int year, int period)
        {
            var results = accounting.GetBankTransaction(year, period);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("GetAgingReport")]
        public ActionResult GetAgingReport(int year, int period)
        {
            var results = accounting.GetAgingReport(year, period, 3, "AR");
            return Json(results, JsonRequestBehavior.AllowGet);
        }

    }
}