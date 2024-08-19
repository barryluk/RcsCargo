using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;

namespace DbUtils
{
    public class Air
    {
        RcsFreightDBContext db;
        public Air() 
        {
            db = new RcsFreightDBContext();
        }

        public List<MawbView> GetMawbs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            return db.Mawbs.Where(a => a.MAWB.StartsWith(searchValue) 
                && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode
                && a.FLIGHT_DATE >= startDate && a.FLIGHT_DATE <= endDate)
                .Select(a => new MawbView
                {
                    MAWB = a.MAWB,
                    COMPANY_ID = a.COMPANY_ID,
                    FRT_MODE = a.FRT_MODE,
                    AIRLINE_CODE = a.AIRLINE_CODE,
                    FLIGHT_DATE = a.FLIGHT_DATE,
                    FLIGHT_NO = a.FLIGHT_NO,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                    JOB = a.JOB,
                    JOB_TYPE = a.JOB_TYPE,
                    LOT_NO = a.LOT_NO,
                    ETA = a.ETA,
                    SHIPPER_DESC = a.SHIPPER_DESC,
                    AGENT_DESC = a.AGENT_DESC,
                    CREATE_USER = a.CREATE_USER,
                    CREATE_DATE = a.CREATE_DATE,
                }).Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public Mawb GetMawb(string mawbNo, string companyId, string frtMode)
        {
            var mawb = db.Mawbs.FirstOrDefault(a => a.MAWB == mawbNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode);
            mawb.MawbChargesPrepaid = db.MawbCharges.Where(a => a.MAWB_NO == mawbNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode && a.PAYMENT_TYPE == "P").ToList();
            mawb.MawbChargesCollect = db.MawbCharges.Where(a => a.MAWB_NO == mawbNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode && a.PAYMENT_TYPE == "C").ToList();
            mawb.MawbDims = db.MawbDims.Where(a => a.MAWB_NO == mawbNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();

            if (mawb == null)
                return new Mawb();
            else
                return mawb;
        }

        public List<MawbView> GetFlightNos(DateTime startDate, DateTime endDate, string companyId)
        {
            var records = db.Mawbs.Where(a => a.COMPANY_ID == companyId && a.FLIGHT_DATE >= startDate && a.FLIGHT_DATE <= endDate)
                .Select(a => new MawbView
                {
                    FLIGHT_DATE = a.FLIGHT_DATE,
                    FLIGHT_NO = a.FLIGHT_NO,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                }).Distinct().ToList();

            //Dictionary<string, DateTime> flightDates = new Dictionary<string, DateTime>();
            var newItems = new List<MawbView>();
            foreach (var record in records)
            {
                var flightDate = records.Where(a => a.FLIGHT_NO.Equals(record.FLIGHT_NO) &&
                    a.FLIGHT_DATE.DayOfYear == record.FLIGHT_DATE.DayOfYear).Select(a => a.FLIGHT_DATE).Min();

                if (newItems.Count(a => a.FLIGHT_NO == record.FLIGHT_NO && a.FLIGHT_DATE == flightDate) == 0)
                    newItems.Add(new MawbView {
                        FLIGHT_DATE = flightDate,
                        FLIGHT_NO = record.FLIGHT_NO,
                        ORIGIN_CODE = record.ORIGIN_CODE,
                        DEST_CODE = record.DEST_CODE,
                    });
            }

            return newItems;
        }

        public List<MawbView> GetMawbInfoByFlightNo(string flightNo, DateTime flightDate, string companyId) 
        {
            var records = db.Mawbs.Where(a => a.COMPANY_ID == companyId && a.FLIGHT_NO == flightNo)
                .Select(a => new MawbView
                {
                    MAWB = a.MAWB,
                    JOB = a.JOB,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                    FLIGHT_DATE = a.FLIGHT_DATE,
                }).ToList();

            return records.Where(a => a.FLIGHT_DATE.DayOfYear == flightDate.DayOfYear).ToList();
        }

        public List<BookingView> GetBookings(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            return db.Bookings.Where(a => 
                (a.BOOKING_NO.StartsWith(searchValue) || a.SHIPPER_CODE.StartsWith(searchValue) || a.SHIPPER_DESC.StartsWith(searchValue)
                 || a.CONSIGNEE_CODE.StartsWith(searchValue) || a.CONSIGNEE_DESC.StartsWith(searchValue))
                && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode
                && a.CREATE_DATE >= startDate && a.CREATE_DATE <= endDate)
                .Select(a => new BookingView
                {
                    BOOKING_NO = a.BOOKING_NO,
                    COMPANY_ID = a.COMPANY_ID,
                    FRT_MODE = a.FRT_MODE,
                    SHIPPER_DESC = a.SHIPPER_DESC,
                    CONSIGNEE_DESC = a.CONSIGNEE_DESC,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                    PACKAGE = a.PACKAGE,
                    GWTS = a.GWTS,
                    VWTS = a.VWTS,
                    CARGO_READY_DATE = a.CARGO_READY_DATE,
                    CARGO_REC_DATE = a.CARGO_REC_DATE,
                    CBM = a.CBM,
                    CREATE_USER = a.CREATE_USER,
                    CREATE_DATE = a.CREATE_DATE,
                }).Take(Utils.DefaultMaxQueryRows).ToList();
        }
        
        public Booking GetBooking(string bookingNo, string companyId, string frtMode)
        {
            var booking = db.Bookings.FirstOrDefault(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode);
            booking.BookingPos = db.BookingPos.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();

            if (booking == null)
                return new Booking();
            else
                return booking;
        }

        public List<LoadplanBookingListView> GetLoadplanBookingListView(string jobNo, string companyId)
        {
            var bookingNos = db.LoadplanBookingLists.Where(a => a.JOB_NO.Equals(jobNo) && a.COMPANY_ID.Equals(companyId)).Select(a => a.BOOKING_NO).ToList();
            var warehouseRecords = db.WarehouseHistories.Where(a => bookingNos.Contains(a.BOOKING_NO) && a.COMPANY_ID.Equals(companyId)).ToList();
            string sqlCmd = @"select a.job_no, a.company_id, a.frt_mode, a.booking_no,
                b.shipper_desc, b.consignee_desc, b.package, b.gwts, b.vwts, b.is_doc_rec, b.is_booking_app
                from a_loadplan_booking_list a
                inner join a_booking b on a.booking_no = b.booking_no and a.company_id = b.company_id
                where job_no = :jobNo";

            var loadplanView = db.Database.SqlQuery<LoadplanBookingListView>(sqlCmd, new[] { new OracleParameter("jobNo", jobNo) }).ToList();
            foreach(var loadplan in loadplanView)
            {
                var warehouse = warehouseRecords.FirstOrDefault(a => a.BOOKING_NO.Equals(loadplan.BOOKING_NO) && a.COMPANY_ID.Equals(loadplan.COMPANY_ID));
                if (warehouse != null)
                {
                    loadplan.IS_RECEIVED = "Y";
                    loadplan.GWTS = warehouse.GWTS;
                    loadplan.VWTS = warehouse.VWTS;
                    loadplan.PACKAGE = warehouse.CTNS;
                }
                else
                    loadplan.IS_RECEIVED = "N";
            }

            return loadplanView;
        }
    }
}
