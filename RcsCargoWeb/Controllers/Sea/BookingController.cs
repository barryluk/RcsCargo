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

    [RoutePrefix("Sea/Booking")]
    public class BookingController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Sea sea = new DbUtils.Sea();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridBooking_Read")]
        public ActionResult GridBooking_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "LOADING_PORT_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = sea.GetBookings(dateFrom, dateTo, companyId, frtMode, searchValue);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("GetBooking")]
        public ActionResult GetBooking(string id, string companyId, string frtMode)
        {
            var booking = sea.GetBooking(id, companyId, frtMode);
            return Json(booking, JsonRequestBehavior.AllowGet);
        }

        [Route("GetUnusedBooking")]
        public ActionResult GetUnusedBooking(string searchValue, string companyId, string frtMode, DateTime? dateFrom, DateTime? dateTo)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            if (!dateFrom.HasValue)
                dateFrom = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!dateTo.HasValue)
                dateTo = DateTime.Now.AddMonths(3);

            var results = sea.GetUnusedBooking(dateFrom.Value.ToMinTime(), dateTo.Value.ToMaxTime(), companyId, frtMode, searchValue);
            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateBooking")]
        public ActionResult UpdateBooking(SeaBooking model, string mode)
        {
            if (string.IsNullOrEmpty(model.BOOKING_NO))
                model.BOOKING_NO = admin.GetSequenceNumber("SE_BOOKING", model.COMPANY_ID, model.LOADING_PORT, model.DISCHARGE_PORT, model.CREATE_DATE);

            foreach (var item in model.SeaBookingCargos)
                item.BOOKING_NO = model.BOOKING_NO;
            foreach (var item in model.SeaBookingPos)
                item.BOOKING_NO = model.BOOKING_NO;
            foreach (var item in model.SeaBookingSos)
                item.BOOKING_NO = model.BOOKING_NO;

            if (mode == "edit")
                sea.UpdateBooking(model);
            else if (mode == "create")
                sea.AddBooking(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("IsExistingBookingNo")]
        public ActionResult IsExistingBookingNo(string id, string companyId, string frtMode)
        {
            return Content(sea.IsExisitingBookingNo(id, companyId, frtMode).ToString());
        }
    }
}