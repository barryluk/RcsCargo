
using DbUtils;
using DbUtils.Models.MasterRecords;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;

namespace RcsCargoWeb.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Message = "Welcome to ASP.NET MVC!";

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your app description page.";

            return PartialView();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Dashboard()
        { 
            return PartialView();
        }

        public ActionResult Performance()
        {
            return PartialView();
        }


        public ActionResult Products()
        {
            return PartialView();
        }

        public ActionResult Settings()
        {
            return PartialView();
        }

        public ActionResult Signin()
        {
            return PartialView();
        }

        public ActionResult Signup()
        {
            return PartialView();
        }

        public ActionResult GetSysModules()
        {
            var admin = new Admin();
            return Json(admin.GetSysModules(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetPorts(string searchValue = "", int take = 50)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (string.IsNullOrEmpty(searchValue))
                return Json(new List<DbUtils.Models.MasterRecords.Port>(), JsonRequestBehavior.AllowGet);

            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetPorts(searchValue).Take(take), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetAirlines(string searchValue = "", int take = 50)
        {
            searchValue = searchValue.Trim().ToUpper();
            if (string.IsNullOrEmpty(searchValue))
                return Json(new List<DbUtils.Models.MasterRecords.Airline>(), JsonRequestBehavior.AllowGet);

            var masterRecords = new MasterRecords();
            return Json(masterRecords.GetAirlines(searchValue).Take(take), JsonRequestBehavior.AllowGet);
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
    }
}
