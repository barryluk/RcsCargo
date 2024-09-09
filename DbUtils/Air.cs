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
using System.IO;

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

        public List<MawbView> GetLotNos(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue) 
        {
            var selectCmd = @"distinct lot_no, origin_code, dest_code, flight_no, airline_code, trunc(flight_date) as flight_date";
            var fromCmd = "a_mawb where lot_no is not null";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "lot_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "flight_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "origin_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "dest_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "flight_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "flight_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<MawbView>(fromCmd, selectCmd, dbParas);

            return result.OrderByDescending(a => a.FLIGHT_DATE).ToList();
        }

        public LotDetailView GetLotDetail(string lotNo, string companyId, string frtMode)
        {
            var selectCmd = @"distinct m.lot_no, m.company_id, m.frt_mode, m.origin_code, m.dest_code, m.flight_date, 
                m.flight_no, m.airline_code, v.package, v.gwts, v.vwts, v.cwts, m.package_unit, m.frt_payment_pc";
            var fromCmd = @"a_mawb m, v_a_lot_wt_new v
                where m.lot_no = v.lot_no and m.company_id = v.company_id and m.frt_mode = v.frt_mode and rownum = 1";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "m.lot_no", ParaName = "lot_no", ParaCompareType = DbParameter.CompareType.equals, Value = lotNo },
                new DbParameter { FieldName = "m.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "m.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };

            var result = Utils.GetSqlQueryResult<LotDetailView>(fromCmd, selectCmd, dbParas);

            return result.FirstOrDefault();
        }

        public List<MawbView> GetMawbs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            return db.Mawbs.Where(a => (a.MAWB.StartsWith(searchValue)
                || a.JOB.StartsWith(searchValue)
                || a.AIRLINE_CODE.StartsWith(searchValue)
                || a.FLIGHT_NO.StartsWith(searchValue))
                && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode
                && a.FLIGHT_DATE >= startDate && a.FLIGHT_DATE <= endDate)
                .Select(a => new MawbView
                {
                    MAWB = a.MAWB,
                    MAWB_NO = a.MAWB,
                    COMPANY_ID = a.COMPANY_ID,
                    FRT_MODE = a.FRT_MODE,
                    AIRLINE_CODE = a.AIRLINE_CODE,
                    FLIGHT_DATE = a.FLIGHT_DATE,
                    FLIGHT_NO = a.FLIGHT_NO,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                    JOB = a.JOB,
                    JOB_NO = a.JOB,
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
                mawb.MAWB_NO = mawb.MAWB;
                mawb.JOB_NO = mawb.JOB;
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

        public bool IsExisitingMawbNo(string mawbNo, string companyId, string frtMode)
        {
            return db.Mawbs.Count(a => a.MAWB == mawbNo && 
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        public bool IsExistingJobNo(string jobNo, string companyId, string frtMode)
        {
            return db.Mawbs.Count(a => a.JOB == jobNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
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

        public List<BookingView> GetUnusedBookings(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"booking_no, company_id, frt_mode, origin_code, dest_code,
                shipper_code, shipper_desc, consignee_code, consignee_desc,
                package, gwts, vwts, create_user, create_date";
            var fromCmd = "a_booking where booking_no not in (select booking_no from a_hawb where company_id = a_booking.company_id and booking_no is not null)";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "booking_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "create_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "create_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<BookingView>(fromCmd, selectCmd, dbParas);

            return result;
        }

        public List<BookingView> GetBookings(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"booking_no, company_id, frt_mode, origin_code, dest_code,
                shipper_code, shipper_desc, consignee_code, consignee_desc,
                package, gwts, vwts, create_user, create_date";
            var fromCmd = "a_booking";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "booking_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "create_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "create_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<BookingView>(fromCmd, selectCmd, dbParas).Take(Utils.DefaultMaxQueryRows).ToList();

            return result;
            //return db.Bookings.Where(a => 
            //    (a.BOOKING_NO.StartsWith(searchValue) || a.SHIPPER_CODE.StartsWith(searchValue) || a.SHIPPER_DESC.StartsWith(searchValue)
            //     || a.CONSIGNEE_CODE.StartsWith(searchValue) || a.CONSIGNEE_DESC.StartsWith(searchValue))
            //    && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode
            //    && a.CREATE_DATE >= startDate && a.CREATE_DATE <= endDate)
            //    .Select(a => new BookingView
            //    {
            //        BOOKING_NO = a.BOOKING_NO,
            //        COMPANY_ID = a.COMPANY_ID,
            //        FRT_MODE = a.FRT_MODE,
            //        SHIPPER_DESC = a.SHIPPER_DESC,
            //        CONSIGNEE_DESC = a.CONSIGNEE_DESC,
            //        ORIGIN_CODE = a.ORIGIN_CODE,
            //        DEST_CODE = a.DEST_CODE,
            //        PACKAGE = a.PACKAGE,
            //        GWTS = a.GWTS,
            //        VWTS = a.VWTS,
            //        CARGO_READY_DATE = a.CARGO_READY_DATE,
            //        CARGO_REC_DATE = a.CARGO_REC_DATE,
            //        CBM = a.CBM,
            //        CREATE_USER = a.CREATE_USER,
            //        CREATE_DATE = a.CREATE_DATE,
            //    }).Take(Utils.DefaultMaxQueryRows).ToList();
        }
         
        public Booking GetBooking(string bookingNo, string companyId, string frtMode)
        {
            var booking = db.Bookings.FirstOrDefault(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode);
            if (booking != null)
            {
                booking.BookingPos = db.BookingPos.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                booking.WarehouseHistories = this.GetWarehouseHistory(bookingNo, companyId, frtMode);
            }

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

        public bool IsExisitingBookingNo(string bookingNo, string companyId, string frtMode)
        {
            return db.Bookings.Count(a => a.BOOKING_NO == bookingNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region HAWB

        public List<string> GetHawbNos(string id, string companyId, string frtMode)
        {
            return db.Hawbs.Where(a => (a.MAWB_NO == id || a.JOB_NO == id)
                && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).Select(a => a.HAWB_NO).ToList();
        }

        public List<HawbView> GetHawbs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"h.hawb_no, h.company_id, h.frt_mode, h.job_no, h.mawb_no,
                m.airline_code, m.flight_no, m.flight_date, h.origin_code, h.dest_code,
                h.shipper_code, h.shipper_desc, h.consignee_code, h.consignee_desc, h.frt_payment_pc,
                case when h.gwts > h.vwts then h.gwts else h.vwts end as cwts,
                h.package, h.gwts, h.vwts, h.cbm, h.create_user, h.create_date";
            var fromCmd = "a_hawb h left outer join a_mawb m on h.mawb_no = m.mawb and h.company_id = m.company_id and h.frt_mode = m.frt_mode";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "h.hawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.mawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "nvl(m.flight_date, h.create_date)", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "nvl(m.flight_date, h.create_date)", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "h.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "h.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<HawbView>(fromCmd, selectCmd, dbParas);

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

        public bool IsExisitingHawbNo(string hawbNo, string companyId, string frtMode)
        {
            return db.Hawbs.Count(a => a.HAWB_NO == hawbNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        public List<HawbDoc> GetHawbDocs(string hawbNo)
        {
            return db.HawbDocs.Where(a => a.HAWB_NO == hawbNo).ToList();
        }

        public HawbDoc GetHawbDocByDocId(string docId)
        {
            return db.HawbDocs.Where(a => a.DOC_ID == docId).FirstOrDefault();
        }

        public void AddHawbDoc(HawbDoc hawbDoc)
        {
            db.HawbDocs.Add(hawbDoc);
            db.SaveChanges();
        }

        public void UpdateHawbDoc(HawbDoc hawbDoc)
        {
            db.Entry(hawbDoc).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();
        }

        public void DeleteHawbDoc(string docId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var record = db.HawbDocs.Where(a => a.DOC_ID == docId).FirstOrDefault();
            if (record != null)
            {
                try
                {
                    System.IO.File.Delete(Path.Combine(path, record.DOC_PATH, record.DOC_ID));
                    db.HawbDocs.Remove(record);
                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    log.Error(ex);
                }
            }
        }

        #endregion

        #region Invoice

        public List<InvoiceView> GetInvoices(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>
            { 
                new DbParameter { FieldName = "inv_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "mawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "hawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "inv_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "inv_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<InvoiceView>("a_invoice", "*", dbParas);

            return result;
        }

        public List<InvoiceView> GetHawbInvoices(string hawbNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter> 
            {
                new DbParameter { FieldName = "hawb_no", ParaName = "hawb_no", ParaCompareType = DbParameter.CompareType.equals, Value = hawbNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<InvoiceView>("a_invoice", "*", dbParas);

            return result;
        }

        public Invoice GetInvoice(string invNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "inv_no", ParaName = "inv_no", ParaCompareType = DbParameter.CompareType.equals, Value = invNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var invoice = Utils.GetSqlQueryResult<Invoice>("a_invoice", "*", dbParas).FirstOrDefault();
            if (invoice != null)
            {
                invoice.InvoiceHawbs = Utils.GetSqlQueryResult<InvoiceHawb>("a_invoice_hawb", "*", dbParas);
                invoice.InvoiceItems = Utils.GetSqlQueryResult<InvoiceItem>("a_invoice_item", "*", dbParas);
            }

            if (invoice == null)
                return new Invoice();
            else
                return invoice;
        }

        public bool IsExistingInvNo(string invNo, string companyId, string frtMode)
        {
            return db.Invoices.Count(a => a.INV_NO == invNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

    }
}
