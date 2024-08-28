using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using System.Security.Cryptography;
using System.Data.SqlTypes;

namespace DbUtils
{
    public class Air
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        RcsFreightDBContext db;
        public Air() 
        {
            db = new RcsFreightDBContext();
        }

        #region MAWB, Loadplan

        public List<MawbView> GetMawbs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            return db.Mawbs.Where(a => (a.MAWB.StartsWith(searchValue) 
                || a.AIRLINE_CODE.StartsWith(searchValue)
                || a.FLIGHT_NO.StartsWith(searchValue))
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
            var mawb = Utils.GetSqlQueryResult<Mawb>("a_mawb", "mawb", mawbNo, companyId, frtMode).FirstOrDefault();
            if (mawb != null)
            {
                var charges = Utils.GetSqlQueryResult<MawbCharge>("a_mawb_chg", "mawb_no", mawbNo, companyId, frtMode);
                mawb.MawbChargesPrepaid = charges.Where(a => a.PAYMENT_TYPE == "P").ToList();
                mawb.MawbChargesCollect = charges.Where(a => a.PAYMENT_TYPE == "C").ToList();
                mawb.MawbDims = Utils.GetSqlQueryResult<MawbDim>("a_mawb_dim", "mawb_no", mawbNo, companyId, frtMode);
            }

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
        
        public List<LoadplanBookingListView> SearchBookingsForLoadplan(string dest, string companyId)
        {
            string sqlCmd = @"select booking_no, company_id, frt_mode, null as job_no,
                shipper_desc, consignee_desc, package, gwts, vwts, 
                is_doc_rec, is_booking_app, null as is_received, origin_code, dest_code
                from a_booking
                where (booking_no, company_id, frt_mode) not in (select booking_no, company_id, frt_mode from a_loadplan_booking_list)
                and dest_code = :dest
                and company_id = :companyId";

            var loadplanView = db.Database.SqlQuery<LoadplanBookingListView>(sqlCmd, new[] { 
                new OracleParameter("dest", dest), new OracleParameter("companyId", companyId) }).ToList();
            var bookingNos = loadplanView.Select(a => a.BOOKING_NO).ToList();
            var warehouseRecords = db.WarehouseHistories.Where(a => bookingNos.Contains(a.BOOKING_NO) && a.COMPANY_ID.Equals(companyId)).ToList();

            foreach (var loadplan in loadplanView)
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

        public List<LoadplanBookingListView> GetLoadplanBookingListView(string jobNo, string companyId)
        {
            var bookingNos = db.LoadplanBookingLists.Where(a => a.JOB_NO.Equals(jobNo) && a.COMPANY_ID.Equals(companyId)).Select(a => a.BOOKING_NO).ToList();
            var warehouseRecords = db.WarehouseHistories.Where(a => bookingNos.Contains(a.BOOKING_NO) && a.COMPANY_ID.Equals(companyId)).ToList();
            string sqlCmd = @"select a.job_no, a.company_id, a.frt_mode, a.booking_no,
                b.shipper_desc, b.consignee_desc, b.package, b.gwts, b.vwts, 
                b.is_doc_rec, b.is_booking_app, b.origin_code, b.dest_code
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

        public List<HawbView> GetLoadplanHawbListView(string jobNo, string companyId, string frtMode)
        {
            var sqlCmd = @"select hawb_no, company_id, frt_mode, shipper_code, shipper_desc, 
                consignee_code, consignee_desc, package, gwts, vwts, cbm,
                case when gwts > vwts then gwts else vwts end as cwts
                from a_hawb where job_no = :jobNo and company_id = :companyId and frt_mode = :frtMode";

            var loadplanView = db.Database.SqlQuery<HawbView>(sqlCmd, new[] {
                new OracleParameter("jobNo", jobNo),
                new OracleParameter("companyId", companyId),
                new OracleParameter("frtMode", frtMode), }).ToList();

            return loadplanView;
        }

        public List<HawbEquip> GetLoadplanHawbEquipList(string jobNo, string companyId, string frtMode)
        {
            var hawbNos = db.Database.SqlQuery<string>(
                "select hawb_no from a_hawb where job_no = :jobNo and company_id = :companyId and frt_mode = :frtMode", new[] {
                new OracleParameter("jobNo", jobNo),
                new OracleParameter("companyId", companyId),
                new OracleParameter("frtMode", frtMode), }).ToList();
            var hawbEquips = db.HawbEquips.Where(a => hawbNos.Contains(a.HAWB_NO)).ToList();

            return hawbEquips;
        }

        #endregion

        #region Booking, Warehouse

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
            booking.WarehouseHistories = this.GetWarehouseHistory(bookingNo, companyId, frtMode);

            if (booking == null)
                return new Booking();
            else
                return booking;
        }

        public List<WarehouseHistory> GetWarehouseHistory(string bookingNo, string companyId, string frtMode)
        {
            var records = db.WarehouseHistories.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
            return records;
        }

        #endregion

        #region HAWB

        public List<HawbView> GetHawbs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var sqlCmd = @"select h.hawb_no, h.company_id, h.frt_mode, h.job_no, h.mawb_no,
                m.airline_code, m.flight_no, m.flight_date, h.origin_code, h.dest_code,
                h.shipper_code, h.shipper_desc, h.consignee_code, h.consignee_desc,
                case when h.gwts > h.vwts then h.gwts else h.vwts end as cwts,
                h.package, h.gwts, h.vwts, h.cbm, h.create_user, h.create_date
                from a_hawb h left outer join a_mawb m on h.mawb_no = m.mawb and h.company_id = m.company_id and h.frt_mode = m.frt_mode
                where m.flight_date >= :startDate
                and m.flight_date <= :endDate
                and h.company_id = :companyId and h.frt_mode = :frtMode
                and (h.hawb_no like :searchValue or h.mawb_no like :searchValue or h.job_no like :searchValue
                or h.shipper_code like :searchValue or h.shipper_desc like :searchValue 
                or h.consignee_code like :searchValue or h.consignee_desc like :searchValue)";

            var result = db.Database.SqlQuery<HawbView>(sqlCmd, new[]
            {
                new OracleParameter("startDate", startDate),
                new OracleParameter("endDate", endDate),
                new OracleParameter("companyId", companyId),
                new OracleParameter("frtMode", frtMode),
                new OracleParameter("searchValue", searchValue),
            }).Take(Utils.DefaultMaxQueryRows).ToList();

            return result;
        }

        public Hawb GetHawb(string hawbNo, string companyId, string frtMode)
        {
            var hawb = Utils.GetSqlQueryResult<Hawb>("a_hawb", "hawb_no", hawbNo, companyId, frtMode).FirstOrDefault();
            if (hawb != null)
            {
                var charges = Utils.GetSqlQueryResult<HawbCharge>("a_hawb_chg", "hawb_no", hawbNo, companyId, frtMode);
                hawb.HawbChargesPrepaid = charges.Where(a => a.PAYMENT_TYPE == "P").ToList();
                hawb.HawbChargesCollect = charges.Where(a => a.PAYMENT_TYPE == "C").ToList();
                hawb.HawbPos = Utils.GetSqlQueryResult<HawbPo>("a_hawb_po", "hawb_no", hawbNo, companyId, frtMode);
                hawb.HawbDims = Utils.GetSqlQueryResult<HawbDim>("a_hawb_dim", "hawb_no", hawbNo, companyId, frtMode);
                hawb.HawbLics = Utils.GetSqlQueryResult<HawbLic>("a_hawb_lic", "hawb_no", hawbNo, companyId, frtMode);
                hawb.HawbStatuses = Utils.GetSqlQueryResult<HawbStatus>("a_hawb_status", "hawb_no", hawbNo);
                hawb.HawbDocs = Utils.GetSqlQueryResult<HawbDoc>("a_hawb_doc", "hawb_no", hawbNo);
                hawb.Invoices = this.GetHawbInvoices(hawbNo, companyId, frtMode);
                if (!string.IsNullOrEmpty(hawb.MAWB_NO))
                {
                    var mawb = Utils.GetSqlQueryResult<MawbView>("a_mawb", "airline_code,flight_no,flight_date", "mawb", hawb.MAWB_NO, companyId, frtMode).FirstOrDefault();
                    if (mawb != null)
                    {
                        hawb.AIRLINE_CODE = mawb.AIRLINE_CODE;
                        hawb.FLIGHT_NO = mawb.FLIGHT_NO;
                        hawb.FLIGHT_DATE = mawb.FLIGHT_DATE;
                    }
                }
            }

            if (hawb == null)
                return new Hawb();
            else
                return hawb;
        }

        #endregion

        #region Invoice

        public List<InvoiceView> GetInvoices(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>();
            dbParas.Add(new DbParameter { FieldName = "inv_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue });
            dbParas.Add(new DbParameter { FieldName = "inv_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate });
            dbParas.Add(new DbParameter { FieldName = "inv_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate });
            dbParas.Add(new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId });
            dbParas.Add(new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode });
            var result = Utils.GetSqlQueryResult<InvoiceView>("a_invoice", "*", dbParas);

            return result;
        }

        public List<InvoiceView> GetHawbInvoices(string hawbNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>();
            dbParas.Add(new DbParameter { FieldName = "hawb_no", ParaName = "hawb_no", ParaCompareType = DbParameter.CompareType.equals, Value = hawbNo });
            dbParas.Add(new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId });
            dbParas.Add(new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode });
            var result = Utils.GetSqlQueryResult<InvoiceView>("a_invoice", "*", dbParas);

            return result;
        }

        #endregion

    }
}
