
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
            //return Json(db.SysModules.ToList(), JsonRequestBehavior.AllowGet);
            //db.Database.Exists();
            //var result = db.Database.SqlQuery<string>("select display_name from sys_module").ToList();
            var items = "";

            //foreach (var item in result)
            //    items += item + ",";
            //return Content(items);

            //var hawb = db.Database.SqlQuery<Hawb>("select * from a_hawb where hawb_no = 'WFF74277000'").FirstOrDefault();
            //hawb.MODIFY_DATE = DateTime.Now;
            //db.Entry(hawb).State = System.Data.Entity.EntityState.Modified;
            //db.SaveChanges();

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

        [HttpGet]
        public ActionResult GetPdf() 
        {
            if (Request.Url.GetString().Contains("favicon"))
                return null;

            string info = string.Empty;
            string url = "http://gemini.rcs-asia.com:9010/FileDownload?id=8BCDC04165C3FC5800DA28027C7A13B2EE32D9391FCAD5AEC550568E393390402AF2CE03C2A33ADEFF42DD069D5BFC96A89B8A73B8BD6972B1EB456932DB948C9203AF22DB43650EAA03226FAB29519012D99664C465F64F46D4A9714AA9604152353053FA000038E7D6123CAA1D6115";
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            //request.ContentType = "application/pdf";
            //request.Accept = "application/pdf";

            try
            {
                WebResponse response = request.GetResponse();
                var fileBytes = new byte[response.ContentLength];
                var respStream = response.GetResponseStream();
                System.Threading.Thread.Sleep(1000);
                respStream.Read(fileBytes, 0, fileBytes.Length);
                System.Threading.Thread.Sleep(1000);
                respStream.Close();
                System.Threading.Thread.Sleep(1000);
                respStream.Flush();
                log.Info(fileBytes.Length);

                return File(fileBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                info = ex.Message;
                log.Debug(info);
            }

            return null;
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

        public ActionResult GetReportData(string reportName)
        {
            var admin = new DbUtils.Admin();
            return Content(admin.GetReportData(reportName).DATA, "JSON");
        }

        public ActionResult EncryptString(string value)
        {
            return Content(DbUtils.Utils.DESEncrypt(value), "text/plain");
        }
    }
}
