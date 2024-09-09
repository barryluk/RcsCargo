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

    [RoutePrefix("Air/Mawb")]
    public class MawbController : Controller
    {

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();

        [Route("GridMawb_Read")]
        public ActionResult GridMawb_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper();
            var sortField = "FLIGHT_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetMawbs(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetMawb")]
        public ActionResult GetMawb(string id, string companyId, string frtMode, string changedJobType = "")
        {
            if (id == "NEW")
            {
                return Json(new Mawb 
                {
                    COMPANY_ID = companyId,
                    FRT_MODE = frtMode,
                    JOB_TYPE = string.IsNullOrEmpty(changedJobType) ? "C" : changedJobType,
                    VWTS_FACTOR = 6000,
                    FLIGHT_DATE = DateTime.Now,
                    CREATE_DATE = DateTime.Now,
                    MODIFY_DATE = DateTime.Now,
                }, JsonRequestBehavior.AllowGet);
            }

            var mawb = air.GetMawb(id, companyId, frtMode);
            if (!string.IsNullOrEmpty(mawb.JOB))
            {
                mawb.LoadplanBookingListViews = air.GetLoadplanBookingListView(mawb.JOB, mawb.COMPANY_ID);
                mawb.LoadplanHawbListViews = air.GetLoadplanHawbListView(mawb.JOB, mawb.COMPANY_ID, mawb.FRT_MODE);
                mawb.LoadplanHawbEquips = air.GetLoadplanHawbEquipList(mawb.JOB, mawb.COMPANY_ID, mawb.FRT_MODE);
            }
            if (string.IsNullOrEmpty(mawb.JOB_TYPE))
                mawb.JOB_TYPE = "C";

            //Handling events for changing job type
            if (!string.IsNullOrEmpty(changedJobType))
                mawb.JOB_TYPE = changedJobType;

            return Json(mawb, JsonRequestBehavior.AllowGet);
        }

        [Route("IsExistingMawbNo")]
        public ActionResult IsExistingMawbNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExisitingMawbNo(id, companyId, frtMode).ToString());
        }

        [Route("IsExistingJobNo")]
        public ActionResult IsExistingJobNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExistingJobNo(id, companyId, frtMode).ToString());
        }

        [Route("GetFlightNos")]
        public ActionResult GetFlightNos(string companyId, DateTime startDate, DateTime endDate)
        {
            return Json(air.GetFlightNos(startDate.ToMinTime(), endDate.ToMaxTime(), companyId), JsonRequestBehavior.AllowGet);
        }

        [Route("GetMawbInfoByFlightNo")]
        public ActionResult GetMawbInfoByFlightNo(string flightNo, string companyId, DateTime flightDate)
        {
            return Json(air.GetMawbInfoByFlightNo(flightNo, flightDate, companyId), JsonRequestBehavior.AllowGet);
        }

        [Route("SearchBooking")]
        public ActionResult SearchBookingsForLoadplan(string dest, string companyId)
        {
            return Json(air.SearchBookingsForLoadplan(dest, companyId), JsonRequestBehavior.AllowGet);
        }

        [Route("GetLoadplanBookingList")]
        public ActionResult GetLoadplanBookingList(string jobNo, string companyId)
        {
            return Json(air.GetLoadplanBookingListView(jobNo, companyId), JsonRequestBehavior.AllowGet);
        }

        [Route("GetLotNos")]
        public ActionResult GetLotNos(string searchValue, string companyId, string frtMode, DateTime? startDate, DateTime? endDate)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!startDate.HasValue)
                startDate = searchValue.Trim().Length > 1 ? DateTime.Now.AddYears(-5) : DateTime.Now.AddDays(-90);
            if (!endDate.HasValue)
                endDate = DateTime.Now;

            return Json(air.GetLotNos(startDate.Value.ToMinTime(), endDate.Value.ToMaxTime(), companyId, frtMode, searchValue).Take(AppUtils.takeRecords), JsonRequestBehavior.AllowGet);
        }

        [Route("GetLotDetail")]
        public ActionResult GetLotDetail(string lotNo, string companyId, string frtMode)
        {
            return Json(air.GetLotDetail(lotNo, companyId, frtMode), JsonRequestBehavior.AllowGet);
        }

        [Route("TestModel")]
        public ActionResult TestModel(Mawb model)
        {
            model.MODIFY_USER = "BARRY.LUK";
            model.MODIFY_DATE = DateTime.Now;
            return Json(model, JsonRequestBehavior.AllowGet);
        }
    }
}