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
using DbUtils.Models.MasterRecords;
using Kendo.Mvc.Infrastructure;

namespace RcsCargoWeb.Air.Controllers
{

    [RoutePrefix("Air/Mawb")]
    public class MawbController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridMawb_Read")]
        public ActionResult GridMawb_Read(string searchValue, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            searchValue = searchValue.Trim().ToUpper() + "%";
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
        public ActionResult GetMawb(string id, string companyId, string frtMode)
        {
            var mawb = air.GetMawb(id, companyId, frtMode);
            if (!string.IsNullOrEmpty(mawb.JOB))
            {
                mawb.LoadplanBookingListViews = air.GetLoadplanBookingListView(mawb.JOB, mawb.COMPANY_ID);
                mawb.LoadplanHawbListViews = air.GetLoadplanHawbListView(mawb.JOB, mawb.COMPANY_ID, mawb.FRT_MODE);
                mawb.LoadplanHawbEquips = air.GetLoadplanHawbEquipList(mawb.JOB, mawb.COMPANY_ID, mawb.FRT_MODE);
            }
            if (string.IsNullOrEmpty(mawb.JOB_TYPE))
                mawb.JOB_TYPE = "C";

            return Json(mawb, JsonRequestBehavior.AllowGet);
        }

        [Route("GetJob")]
        public ActionResult GetJob(string id, string companyId, string frtMode)
        {
            var job = air.GetJob(id, companyId, frtMode);
            return Json(job, JsonRequestBehavior.AllowGet);
        }

        [Route("GetMawbInvoices")]
        public ActionResult GetMawbInvoices(string id, string companyId, string frtMode)
        {
            var result = air.GetMawbInvoices(id, companyId, frtMode);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [Route("GetLoadplanHawbEquipList")]
        public ActionResult GetLoadplanHawbEquipList(string id, string companyId, string frtMode)
        {
            var result = air.GetLoadplanHawbEquipList(id, companyId, frtMode);
            return Content(result.Select(a => a.EQUIP_DESC).JustifyString(), "plain/text");
        }

        [Route("UpdateLotNo")]
        public ActionResult UpdateLotNo(string lotNo, string companyId, string frtMode, string[] mawbNos)
        {
            if (string.IsNullOrEmpty(lotNo))
                lotNo = admin.GetSequenceNumber("AE_LOT", companyId, "", "", DateTime.Now);

            air.UpdateLotNo(lotNo, companyId, frtMode, mawbNos.ToList());
            return Content(lotNo, "text/plain");
        }

        [Route("UpdateMawb")]
        public ActionResult UpdateMawb(Mawb model, string mode)
        {
            if (model.MAWB.Length > 11 && model.MAWB.Contains(",") && mode == "create")
            {
                var lastModel = this.AddBatchMawbs(model);
                return Json(lastModel, JsonRequestBehavior.DenyGet);
            }

            if (string.IsNullOrEmpty(model.JOB))
            {
                model.JOB = admin.GetSequenceNumber("AE_JOB", model.COMPANY_ID, model.ORIGIN_CODE, model.DEST_CODE, model.FLIGHT_DATE);
                model.JOB_NO = model.JOB;
            }

            foreach (var booking in model.LoadplanBookingListViews)
            {
                model.LoadplanBookingLists.Add(new LoadplanBookingList 
                {
                    JOB_NO = model.JOB,
                    BOOKING_NO = booking.BOOKING_NO,
                    COMPANY_ID = model.COMPANY_ID,
                    FRT_MODE = model.FRT_MODE,
                });
            }

            if (mode == "edit")
                air.UpdateMawb(model);
            else if (mode == "create")
                air.AddMawb(model);

            return Json(model, JsonRequestBehavior.DenyGet);
        }

        [Route("VoidMawb")]
        public ActionResult VoidMawb(string id, Mawb model)
        {
            model.MAWB = id;
            air.VoidMawb(model);
            return Json(model, JsonRequestBehavior.DenyGet);
        }

        private Mawb AddBatchMawbs(Mawb model)
        {
            var mawbNos = model.MAWB.Split(',');
            var jobNos = admin.GetSequenceNumber("AE_JOB", model.COMPANY_ID, model.ORIGIN_CODE, model.DEST_CODE, model.FLIGHT_DATE, mawbNos.Length).Split(',');
            
            foreach (var mawbNo in mawbNos)
            {
                var mawb = new Mawb();
                foreach (var property in typeof(Mawb).GetProperties())
                    property.SetValue(mawb, property.GetValue(model));

                mawb.MAWB = mawbNo;
                mawb.JOB = jobNos[Array.IndexOf(mawbNos, mawbNo)];

                mawb.MawbDims = new List<MawbDim>();
                foreach(var item in model.MawbDims)
                {
                    var dim = new MawbDim();
                    foreach (var property in typeof(MawbDim).GetProperties())
                        property.SetValue(dim, property.GetValue(item));

                    dim.MAWB_NO = mawbNo;
                    mawb.MawbDims.Add(dim);
                }
                mawb.MawbChargesPrepaid = new List<MawbCharge>();
                foreach (var item in model.MawbChargesPrepaid)
                {
                    var charge = new MawbCharge();
                    foreach (var property in typeof(MawbCharge).GetProperties())
                        property.SetValue(charge, property.GetValue(item));

                    charge.MAWB_NO = mawbNo;
                    mawb.MawbChargesPrepaid.Add(charge);
                }
                mawb.MawbChargesCollect = new List<MawbCharge>();
                foreach (var item in model.MawbChargesCollect)
                {
                    var charge = new MawbCharge();
                    foreach (var property in typeof(MawbCharge).GetProperties())
                        property.SetValue(charge, property.GetValue(item));

                    charge.MAWB_NO = mawbNo;
                    mawb.MawbChargesCollect.Add(charge);
                }

                air.AddMawb(mawb);
            }

            model.MAWB = mawbNos[mawbNos.Length - 1];
            return model;
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
                startDate = searchValue.Trim().Length > 1 ? DateTime.Now.AddMonths(-9) : DateTime.Now.AddDays(-90);
            if (!endDate.HasValue)
                endDate = DateTime.Now.AddMonths(3);

            return Json(air.GetLotNos(startDate.Value.ToMinTime(), endDate.Value.ToMaxTime(), companyId, frtMode, searchValue).Take(AppUtils.takeRecords), JsonRequestBehavior.AllowGet);
        }

        [Route("GetMawbNosByLot")]
        public ActionResult GetMawbNosByLot(string lotNo, string companyId, string frtMode)
        {
            return Json(air.GetMawbNosByLot(lotNo, companyId, frtMode), JsonRequestBehavior.AllowGet);
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