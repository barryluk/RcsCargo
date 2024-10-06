
using DbUtils;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using System.Xml.Linq;

namespace RcsCargoWeb.Controllers
{
    public class HomeController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public ActionResult Test()
        {
            DbUtils.RcsFreightDBContext db = new RcsFreightDBContext();
            var items = "";

            Hawb result = DbUtils.Utils.GetSqlQueryResult<Hawb>("a_hawb", "hawb_no", "WFF74277000").FirstOrDefault();
            foreach (var prop in result.GetType().GetProperties())
            {
                if (prop.GetValue(result) != null)
                    items += prop.GetValue(result).ToString() + ",";
            }
            return Content(items);

            //string ipList = Request.UserHostAddress;
            //var userAgent = HttpContext.Request.UserAgent;
            //return Content(userAgent + " ; " + ipList);
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Dashboard()
        {
            return PartialView();
        }

        public ActionResult Login()
        {
            return View();
        }

        #region Master Records, Utils

        public ActionResult GetSysCompanies()
        {
            var admin = new DbUtils.Admin();
            return Json(admin.GetSysCompanies(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetSysModules()
        {
            var admin = new DbUtils.Admin();
            return Json(admin.GetSysModules(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCountriesView()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetCountriesView(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetPortsView()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetPortsView(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetPorts(string searchValue = "", int take = 50)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (string.IsNullOrEmpty(searchValue))
                return Json(new List<DbUtils.Models.MasterRecords.Port>(), JsonRequestBehavior.AllowGet);

            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetPorts(searchValue).Take(take), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetAirlinesView()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetAirlinesView(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetAirlines(string searchValue = "", int take = 50)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (string.IsNullOrEmpty(searchValue))
                return Json(new List<DbUtils.Models.MasterRecords.Airline>(), JsonRequestBehavior.AllowGet);

            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetAirlines(searchValue).Take(take), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetChargesView()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetChargesView(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCharges(string searchValue = "", int take = 50)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (string.IsNullOrEmpty(searchValue))
                return Json(new List<DbUtils.Models.MasterRecords.Charge>(), JsonRequestBehavior.AllowGet);

            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetCharges(searchValue).Take(take), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCurrencies()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetCurrencies("RCSHKG"), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCustomers(string searchValue = "", int take = 50)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (string.IsNullOrEmpty(searchValue))
                return Json(new List<DbUtils.Models.MasterRecords.Customer>(), JsonRequestBehavior.AllowGet);

            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetCustomerViews(searchValue).Take(take), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetRecentCustomers()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetRecentCustomers(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetChargeTemplates(string companyId = "RCSHKG")
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetChargeTemplates(companyId), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetChargeTemplate(string templateName, string companyId = "RCSHKG")
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetChargeTemplate(templateName, companyId), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetEquipCodes()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetEquipCodes(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetGroupCodes()
        {
            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetGroupCodes(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetOffShoreOrigins()
        {
            var air = new DbUtils.Air();
            return Json(air.GetOffShoreOrigins(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetReportData(string reportName)
        {
            var admin = new DbUtils.Admin();
            return Content(admin.GetReportData(reportName).DATA, "JSON");
        }

        public ActionResult EncryptString(string value)
        {
            return Content(DbUtils.Utils.DESEncrypt(value), "text/plain");
        }

        public ActionResult GetSeqNo(string seqType, string companyId, string origin, string dest, int? seqNoCount, DateTime? date)
        {
            var admin = new DbUtils.Admin();
            return Content(admin.GetSequenceNumber(seqType, companyId, origin, dest, date ?? DateTime.Now, seqNoCount ?? 1), "text/plain");
        }

        public ActionResult GetScriptVersion()
        {
            return Content(AppUtils.scriptVersion, "text/plain");
        }

        #endregion

    }
}
