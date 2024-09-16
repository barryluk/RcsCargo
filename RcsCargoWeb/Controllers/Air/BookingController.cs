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

    [RoutePrefix("Air/Booking")]
    public class BookingController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridBooking_Read")]
        public ActionResult GridBooking_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
            var sortField = "CREATE_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetBookings(dateFrom, dateTo, companyId, frtMode, searchValue);

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
            var booking = air.GetBooking(id, companyId, frtMode);
            return Json(booking, JsonRequestBehavior.AllowGet);
        }

        [Route("UpdateBooking")]
        public ActionResult UpdateBooking(Booking model, string mode)
        {
            if (string.IsNullOrEmpty(model.BOOKING_NO))
            {
                model.BOOKING_NO = admin.GetSequenceNumber("AE_HAWB", model.COMPANY_ID, model.ORIGIN_CODE, model.DEST_CODE, model.CREATE_DATE);
                foreach(var po in model.BookingPos)
                    po.BOOKING_NO = model.BOOKING_NO;
            }

            if (string.IsNullOrEmpty(model.FRT_PAYMENT_PC))
                model.FRT_PAYMENT_PC = "P";
            if (string.IsNullOrEmpty(model.OTHER_PAYMENT_PC))
                model.OTHER_PAYMENT_PC = "P";

            if (mode == "edit")
                air.UpdateBooking(model);
            else if (mode == "create")
                air.AddBooking(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("GetWarehouseHistory")]
        public ActionResult GetWarehouseHistory(string id, string companyId, string frtMode)
        {
            var warehouseHistories = air.GetWarehouseHistory(id, companyId, frtMode);
            return Json(warehouseHistories, JsonRequestBehavior.AllowGet);
        }

        [Route("IsExistingBookingNo")]
        public ActionResult IsExistingBookingNo(string id, string companyId, string frtMode)
        {
            return Content(air.IsExisitingBookingNo(id, companyId, frtMode).ToString());
        }
    }
}