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
using Kendo.Mvc.Infrastructure;
using DbUtils.Models.Admin;

namespace RcsCargoWeb.Air.Controllers
{

    [CheckToken]
    [RoutePrefix("Air/Transfer")]
    public class TransferController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Air air = new DbUtils.Air();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridTransferList_Read")]
        public ActionResult GridTransferList_Read(string hawbNo, string mawbNo, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            hawbNo = hawbNo.Trim().ToUpper() + "%";
            mawbNo = mawbNo.Trim().ToUpper() + "%";
            var sortField = "FLIGHT_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = air.GetTransferList(dateFrom, dateTo, companyId, frtMode, hawbNo, mawbNo);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("TransferShipments")]
        public ActionResult TransferShipments(string userId, List<string> hawbNos, string companyId, string targetCompanyId, bool transferOffshore)
        {
            var sysCompany = admin.GetSysCompany(companyId);
            var hawbs = new List<Hawb>();
            var offshoreCompanyId = "RCSHKG_OFF";

            try
            {
                foreach (var hawbNo in hawbNos)
                    hawbs.Add(air.GetHawb(hawbNo, companyId, "AE"));

                //MAWB
                foreach (var mawbNo in hawbs.Select(a => a.MAWB_NO).Distinct())
                {
                    var mawb = air.GetMawb(mawbNo, companyId, "AE");
                    var exportJobNo = mawb.JOB;
                    var importJobNo = string.Empty;
                    if (air.IsExisitingMawbNo(mawbNo, targetCompanyId, "AI"))
                        importJobNo = air.GetMawb(mawbNo, targetCompanyId, "AI").JOB;
                    else
                        importJobNo = admin.GetSequenceNumber("AI_JOB", targetCompanyId, mawb.ORIGIN_CODE, mawb.DEST_CODE, mawb.FLIGHT_DATE);

                    //Offshore
                    if (transferOffshore && !air.IsExisitingMawbNo(mawbNo, offshoreCompanyId, "AE"))
                    {
                        var newMawb = new Mawb();
                        foreach (var property in typeof(Mawb).GetProperties())
                            property.SetValue(newMawb, property.GetValue(mawb));

                        newMawb.COMPANY_ID = offshoreCompanyId;
                        newMawb.CONSIGNEE_CODE = mawb.AGENT_CODE;
                        newMawb.CONSIGNEE_DESC = mawb.AGENT_DESC;
                        newMawb.CONSIGNEE_BRANCH = mawb.AGENT_BRANCH;
                        newMawb.CONSIGNEE_SHORT_DESC = mawb.AGENT_SHORT_DESC;
                        newMawb.AGENT_CODE = sysCompany.CUSTOMER_CODE;
                        newMawb.AGENT_DESC = sysCompany.CUSTOMER_DESC;
                        newMawb.AGENT_BRANCH = sysCompany.CUSTOMER_BRANCH;
                        newMawb.AGENT_SHORT_DESC = sysCompany.CUSTOMER_SHORT_DESC;
                        newMawb.CREATE_USER = userId;
                        newMawb.CREATE_DATE = DateTime.Now;
                        newMawb.MODIFY_USER = userId;
                        newMawb.MODIFY_DATE = DateTime.Now;

                        newMawb.MawbDims = new List<MawbDim>();
                        foreach (var item in mawb.MawbDims)
                        {
                            var dim = new MawbDim();
                            foreach (var property in typeof(MawbDim).GetProperties())
                                property.SetValue(dim, property.GetValue(item));

                            dim.COMPANY_ID = offshoreCompanyId;
                            newMawb.MawbDims.Add(dim);
                        }
                        newMawb.MawbChargesPrepaid = new List<MawbCharge>();
                        foreach (var item in mawb.MawbChargesPrepaid)
                        {
                            var charge = new MawbCharge();
                            foreach (var property in typeof(MawbCharge).GetProperties())
                                property.SetValue(charge, property.GetValue(item));

                            charge.COMPANY_ID = offshoreCompanyId;
                            newMawb.MawbChargesPrepaid.Add(charge);
                        }
                        newMawb.MawbChargesCollect = new List<MawbCharge>();
                        foreach (var item in mawb.MawbChargesCollect)
                        {
                            var charge = new MawbCharge();
                            foreach (var property in typeof(MawbCharge).GetProperties())
                                property.SetValue(charge, property.GetValue(item));

                            charge.COMPANY_ID = offshoreCompanyId;
                            newMawb.MawbChargesCollect.Add(charge);
                        }

                        air.AddMawb(newMawb);
                    }

                    //Normal branches
                    if (!air.IsExisitingMawbNo(mawbNo, targetCompanyId, "AI"))
                    {
                        var newMawb = new Mawb();
                        foreach (var property in typeof(Mawb).GetProperties())
                            property.SetValue(newMawb, property.GetValue(mawb));

                        newMawb.MawbDims.Clear();
                        newMawb.MawbChargesPrepaid.Clear();
                        newMawb.MawbChargesCollect.Clear();
                        newMawb.CONSIGNEE_CODE = mawb.AGENT_CODE;
                        newMawb.CONSIGNEE_DESC = mawb.AGENT_DESC;
                        newMawb.CONSIGNEE_BRANCH = mawb.AGENT_BRANCH;
                        newMawb.CONSIGNEE_SHORT_DESC = mawb.AGENT_SHORT_DESC;
                        newMawb.AGENT_CODE = sysCompany.CUSTOMER_CODE;
                        newMawb.AGENT_DESC = sysCompany.CUSTOMER_DESC;
                        newMawb.AGENT_BRANCH = sysCompany.CUSTOMER_BRANCH;
                        newMawb.AGENT_SHORT_DESC = sysCompany.CUSTOMER_SHORT_DESC;
                        newMawb.COMPANY_ID = targetCompanyId;
                        newMawb.FRT_MODE = "AI";
                        newMawb.JOB = importJobNo;
                        newMawb.CREATE_USER = userId;
                        newMawb.CREATE_DATE = DateTime.Now;
                        newMawb.MODIFY_USER = userId;
                        newMawb.MODIFY_DATE = DateTime.Now;
                        air.AddMawb(newMawb);
                    }

                    //HAWB
                    foreach (var hawb in hawbs.Where(a => a.MAWB_NO == mawbNo))
                    {

                        //Offshore
                        if (transferOffshore && !air.IsExisitingHawbNo(hawb.HAWB_NO, offshoreCompanyId, "AE"))
                        {
                            var newHawb = new Hawb();
                            foreach (var property in typeof(Hawb).GetProperties())
                                property.SetValue(newHawb, property.GetValue(hawb));

                            newHawb.HawbDocs.Clear();
                            newHawb.HawbChargesPrepaid.Clear();
                            newHawb.HawbChargesCollect.Clear();
                            newHawb.HawbEquips.Clear();
                            newHawb.HawbStatuses.Clear();
                            newHawb.COMPANY_ID = offshoreCompanyId;
                            newHawb.CREATE_USER = userId;
                            newHawb.CREATE_DATE = DateTime.Now;
                            newHawb.MODIFY_USER = userId;
                            newHawb.MODIFY_DATE = DateTime.Now;

                            newHawb.HawbDims = new List<HawbDim>();
                            foreach (var item in hawb.HawbDims)
                            {
                                var dim = new HawbDim();
                                foreach (var property in typeof(HawbDim).GetProperties())
                                    property.SetValue(dim, property.GetValue(item));

                                dim.COMPANY_ID = offshoreCompanyId;
                                newHawb.HawbDims.Add(dim);
                            }
                            newHawb.HawbLics = new List<HawbLic>();
                            foreach (var item in hawb.HawbLics)
                            {
                                var lic = new HawbLic();
                                foreach (var property in typeof(HawbLic).GetProperties())
                                    property.SetValue(lic, property.GetValue(item));

                                lic.COMPANY_ID = offshoreCompanyId;
                                newHawb.HawbLics.Add(lic);
                            }
                            newHawb.HawbPos = new List<HawbPo>();
                            foreach (var item in hawb.HawbPos)
                            {
                                var po = new HawbPo();
                                foreach (var property in typeof(HawbPo).GetProperties())
                                    property.SetValue(po, property.GetValue(item));

                                po.COMPANY_ID = offshoreCompanyId;
                                newHawb.HawbPos.Add(po);
                            }

                            air.AddHawb(newHawb);

                            var booking = air.GetBooking(hawb.BOOKING_NO, companyId, "AE");
                            var newBooking = new Booking();

                            foreach (var property in typeof(Booking).GetProperties())
                                property.SetValue(newBooking, property.GetValue(booking));

                            newBooking.COMPANY_ID = offshoreCompanyId;
                            newBooking.CREATE_USER = userId;
                            newBooking.CREATE_DATE = DateTime.Now;
                            newBooking.MODIFY_USER = userId;
                            newBooking.MODIFY_DATE = DateTime.Now;

                            newBooking.BookingPos = new List<BookingPo>();
                            foreach (var item in booking.BookingPos)
                            {
                                var po = new BookingPo();
                                foreach (var property in typeof(BookingPo).GetProperties())
                                    property.SetValue(po, property.GetValue(item));

                                po.COMPANY_ID = offshoreCompanyId;
                                newBooking.BookingPos.Add(po);
                            }

                            air.AddBooking(newBooking);
                        }

                        //Normal branches
                        if (!air.IsExisitingHawbNo(hawb.HAWB_NO, targetCompanyId, "AI"))
                        {
                            var newHawb = new Hawb();
                            foreach (var property in typeof(Hawb).GetProperties())
                                property.SetValue(newHawb, property.GetValue(hawb));

                            newHawb.COMPANY_ID = targetCompanyId;
                            newHawb.FRT_MODE = "AI";
                            newHawb.JOB_NO = importJobNo;
                            newHawb.CREATE_USER = userId;
                            newHawb.CREATE_DATE = DateTime.Now;
                            newHawb.MODIFY_USER = userId;
                            newHawb.MODIFY_DATE = DateTime.Now;

                            newHawb.HawbDims = new List<HawbDim>();
                            foreach (var item in hawb.HawbDims)
                            {
                                var dim = new HawbDim();
                                foreach (var property in typeof(HawbDim).GetProperties())
                                    property.SetValue(dim, property.GetValue(item));

                                dim.COMPANY_ID = targetCompanyId;
                                dim.FRT_MODE = "AI";
                                newHawb.HawbDims.Add(dim);
                            }
                            newHawb.HawbLics = new List<HawbLic>();
                            foreach (var item in hawb.HawbLics)
                            {
                                var lic = new HawbLic();
                                foreach (var property in typeof(HawbLic).GetProperties())
                                    property.SetValue(lic, property.GetValue(item));

                                lic.COMPANY_ID = targetCompanyId;
                                lic.FRT_MODE = "AI";
                                newHawb.HawbLics.Add(lic);
                            }
                            newHawb.HawbPos = new List<HawbPo>();
                            foreach (var item in hawb.HawbPos)
                            {
                                var po = new HawbPo();
                                foreach (var property in typeof(HawbPo).GetProperties())
                                    property.SetValue(po, property.GetValue(item));

                                po.COMPANY_ID = targetCompanyId;
                                po.FRT_MODE = "AI";
                                newHawb.HawbPos.Add(po);
                            }

                            air.AddHawb(newHawb);
                        }

                        //Transfer Log
                        var log = new TransferHawbLog
                        {
                            ID = Utils.NewGuid(),
                            COMPANY_ID = companyId,
                            HAWB_NO = hawb.HAWB_NO,
                            MAWB_NO = hawb.MAWB_NO,
                            JOB_NO = exportJobNo,
                            NEW_JOB_NO = importJobNo,
                            NEW_COMPANY_ID = targetCompanyId,
                            TRANSFER_USER = userId,
                            TRANSFER_DATE = DateTime.Now,
                        };
                        air.AddTransferHawbLog(log);
                    }
                }
            }
            catch (Exception ex)
            {
                return Content(ex.Message);
            }
            return Content("success");
        }
    }
}