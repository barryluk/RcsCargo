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
        DbUtils.Air air = new DbUtils.Air();

        [Route("GridMawb_Read")]
        public ActionResult GridMawb_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
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
            var mawb = air.GetMawb(id, companyId, frtMode);
            mawb.LoadplanBookingListViews = air.GetLoadplanBookingListView(mawb.JOB, mawb.COMPANY_ID);

            //Handling events for changing job type
            if (!string.IsNullOrEmpty(changedJobType))
                mawb.JOB_TYPE = changedJobType;

            return Json(mawb, JsonRequestBehavior.AllowGet);
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

        [Route("GetLoadplanBookingList")]
        public ActionResult GetLoadplanBookingList(string jobNo, string companyId)
        {
            return Json(air.GetLoadplanBookingListView(jobNo, companyId), JsonRequestBehavior.AllowGet);
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