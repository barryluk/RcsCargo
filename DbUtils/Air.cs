using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using System;
using System.Data;
using System.Data.Entity;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using System.Security.Cryptography;
using System.Data.SqlTypes;
using System.IO;
using System.ComponentModel.Design;
using System.Web.Configuration;
using System.Reflection;
using Newtonsoft.Json.Linq;
using DbUtils.Models.Admin;
using Newtonsoft.Json;

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

        public List<string> GetMawbNosByLot(string lotNo, string companyId, string frtMode)
        {
            var selectCmd = "mawb as mawb_no";
            var fromCmd = "a_mawb";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "lot_no", ParaName = "lot_no", ParaCompareType = DbParameter.CompareType.equals, Value = lotNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<string>(fromCmd, selectCmd, dbParas);

            return result.ToList();
        }

        public List<JobDetailView> GetJobNos(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = "a.*";
            var fromCmd = @"(select job as job_no, mawb as mawb_no, origin_code, dest_code, trunc(flight_date) as flight_date, 
                    gwts, vwts, case when gwts > vwts then gwts else vwts end as cwts, ctns as package, package_unit, company_id, frt_mode from a_mawb
                    union select job_no, '' as mawb_no, origin_code, dest_code, trunc(flight_date) as flight_date, 
                    gwts, vwts, case when gwts > vwts then gwts else vwts end as cwts, package, package_unit, company_id, frt_mode from a_other_job) a";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "a.job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "a.origin_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "a.dest_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "a.flight_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "a.flight_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "a.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "a.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<JobDetailView>(fromCmd, selectCmd, dbParas);

            return result.OrderByDescending(a => a.FLIGHT_DATE).ToList();
        }

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
            var selectCmd = @"job, job as job_no, mawb, mawb as mawb_no, lot_no, origin_code, dest_code, flight_date, 
                    job_type, airline_code, flight_no, eta, shipper_desc, agent_desc, create_user, create_date,
                    gwts, vwts, case when gwts > vwts then gwts else vwts end as cwts, ctns as package, package_unit, company_id, frt_mode, is_voided";
            var fromCmd = "a_mawb";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "mawb", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "job", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "flight_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
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
                mawb.Invoices = Utils.GetSqlQueryResult<InvoiceView>("a_invoice", "mawb_no", mawbNo, companyId, frtMode);
            }

            if (mawb == null)
                return new Mawb();
            else
                return mawb;
        }

        public JobDetailView GetJob(string jobNo, string companyId, string frtMode)
        {
            var selectCmd = @"job as job_no, mawb as mawb_no, lot_no, company_id, frt_mode, origin_code, dest_code, flight_date, 
                flight_no, airline_code, ctns as package, gwts, vwts, cwts, package_unit, frt_payment_pc";
            var fromCmd = "a_mawb";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "job", ParaName = "job", ParaCompareType = DbParameter.CompareType.equals, Value = jobNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<JobDetailView>(fromCmd, selectCmd, dbParas);

            if (result.Count == 0)
            {
                selectCmd = @"job_no, lot_no, company_id, frt_mode, origin_code, dest_code, flight_date, package, gwts, vwts, 
                    case when gwts > vwts then gwts else vwts end as cwts, package_unit";
                fromCmd = "a_other_job";
                dbParas = new List<DbParameter>
                {
                    new DbParameter { FieldName = "job_no", ParaName = "job_no", ParaCompareType = DbParameter.CompareType.equals, Value = jobNo },
                    new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                    new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
                };
                result = Utils.GetSqlQueryResult<JobDetailView>(fromCmd, selectCmd, dbParas);
            }

            return result.FirstOrDefault();
        }

        public void AddMawb(Mawb mawb)
        {
            try
            {
                db.Mawbs.Add(mawb);
                db.MawbDims.AddRange(mawb.MawbDims);
                db.MawbCharges.AddRange(mawb.MawbChargesPrepaid);
                db.MawbCharges.AddRange(mawb.MawbChargesCollect);
                db.LoadplanBookingLists.AddRange(mawb.LoadplanBookingLists);
                db.HawbEquips.AddRange(mawb.LoadplanHawbEquips);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateLotNo(string lotNo, string companyId, string frtMode, List<string> mawbNos)
        {
            try
            {
                var sqlCmd = $"update a_mawb set lot_no = null where lot_no = '{lotNo}' and company_id = '{companyId}' and frt_mode = '{frtMode}'";
                db.Database.ExecuteSqlCommand(sqlCmd);
                db.SaveChanges();

                foreach (var mawbNo in mawbNos)
                {
                    sqlCmd = $"update a_mawb set lot_no = '{lotNo}' where mawb = '{mawbNo}' and company_id = '{companyId}' and frt_mode = '{frtMode}'";
                    db.Database.ExecuteSqlCommand(sqlCmd);
                }
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateMawb(Mawb mawb)
        {
            try
            {
                db.Entry(mawb).State = EntityState.Modified;
                var dims = db.MawbDims.Where(a => a.MAWB_NO == mawb.MAWB && a.COMPANY_ID == mawb.COMPANY_ID && a.FRT_MODE == mawb.FRT_MODE);
                var charges = db.MawbCharges.Where(a => a.MAWB_NO == mawb.MAWB && a.COMPANY_ID == mawb.COMPANY_ID && a.FRT_MODE == mawb.FRT_MODE);
                var bookingList = db.LoadplanBookingLists.Where(a => a.JOB_NO == mawb.JOB && a.COMPANY_ID == mawb.COMPANY_ID && a.FRT_MODE == mawb.FRT_MODE);
                
                var dbParas = new List<DbParameter>
                {
                    new DbParameter { FieldName = "job_no", ParaName = "job_no", ParaCompareType = DbParameter.CompareType.equals, Value = mawb.JOB },
                    new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = mawb.COMPANY_ID },
                    new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = mawb.FRT_MODE },
                };
                var hawbNos = Utils.GetSqlQueryResult<string>("a_hawb", "hawb_no", dbParas);
                var hawbEquips = db.HawbEquips.Where(a => hawbNos.Contains(a.HAWB_NO) && a.COMPANY_ID == mawb.COMPANY_ID && a.FRT_MODE == mawb.FRT_MODE);

                if (dims != null)
                {
                    db.MawbDims.RemoveRange(dims);
                    db.MawbDims.AddRange(mawb.MawbDims);
                }
                if (charges != null)
                {
                    db.MawbCharges.RemoveRange(charges);
                    db.MawbCharges.AddRange(mawb.MawbChargesPrepaid);
                    db.MawbCharges.AddRange(mawb.MawbChargesCollect);
                }
                if (bookingList != null)
                {
                    db.LoadplanBookingLists.RemoveRange(bookingList);
                    db.LoadplanBookingLists.AddRange(mawb.LoadplanBookingLists);
                }
                if (hawbEquips != null)
                {
                    db.HawbEquips.RemoveRange(hawbEquips);
                    db.HawbEquips.AddRange(mawb.LoadplanHawbEquips);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidMawb(Mawb mawb)
        {
            var mawbModel = db.Mawbs.Where(a => a.MAWB == mawb.MAWB && a.COMPANY_ID == mawb.COMPANY_ID && a.FRT_MODE == mawb.FRT_MODE).FirstOrDefault();
            if (mawbModel != null)
            {
                mawbModel.IS_VOIDED = "Y";
                mawbModel.VOIDED_DATE = mawb.VOIDED_DATE;
                mawbModel.VOIDED_USER = mawb.VOIDED_USER;
                db.Entry(mawbModel).State = EntityState.Modified;
                db.SaveChanges();
            }
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
                and company_id = :companyId
                and create_date >= sysdate - 180";

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

        public List<HawbEquip> GetLoadplanHawbEquipList(string id, string companyId, string frtMode)
        {
            var hawbNos = db.Database.SqlQuery<string>(
                "select hawb_no from a_hawb where (job_no = :jobNo or mawb_no = :mawbNo) and company_id = :companyId and frt_mode = :frtMode", new[] {
                new OracleParameter("jobNo", id),
                new OracleParameter("mawbNo", id),
                new OracleParameter("companyId", companyId),
                new OracleParameter("frtMode", frtMode), }).ToList();
            var hawbEquips = db.HawbEquips.Where(a => hawbNos.Contains(a.HAWB_NO)).ToList();

            return hawbEquips;
        }

        public List<string> GetOffShoreOrigins()
        {
            var origins = db.Database.SqlQuery<string>(@"SELECT DISTINCT SUBSTR(JOB,1,3) JOB_NO
                FROM A_MAWB WHERE FRT_MODE = 'AE' AND COMPANY_ID = 'RCSHKG_OFF'
                AND JOB IS NOT NULL AND JOB NOT LIKE 'AE%' AND FLIGHT_DATE >= SYSDATE - 540");

            return origins.ToList();
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
                shipper_code, shipper_desc, consignee_code, consignee_desc, cargo_ready_date, cargo_rec_date,
                package, gwts, vwts, create_user, create_date, is_voided";
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

        public void AddBooking(Booking booking)
        {
            try
            {
                db.Bookings.Add(booking);
                db.BookingPos.AddRange(booking.BookingPos);
                db.WarehouseHistories.AddRange(booking.WarehouseHistories);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateBooking(Booking booking)
        {
            try
            {
                db.Entry(booking).State = EntityState.Modified;
                var pos = db.BookingPos.Where(a => a.BOOKING_NO == booking.BOOKING_NO && a.COMPANY_ID == booking.COMPANY_ID && a.FRT_MODE == booking.FRT_MODE);
                var whHist = db.WarehouseHistories.Where(a => a.BOOKING_NO == booking.BOOKING_NO && a.COMPANY_ID == booking.COMPANY_ID && a.FRT_MODE == booking.FRT_MODE);

                if (pos != null)
                {
                    db.BookingPos.RemoveRange(pos);
                    db.BookingPos.AddRange(booking.BookingPos);
                }
                if (whHist != null)
                {
                    db.WarehouseHistories.RemoveRange(whHist);
                    db.WarehouseHistories.AddRange(booking.WarehouseHistories);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidBooking(Booking booking)
        {
            var bookingModel = db.Bookings.Where(a => a.BOOKING_NO == booking.BOOKING_NO && a.COMPANY_ID == booking.COMPANY_ID && a.FRT_MODE == booking.FRT_MODE).FirstOrDefault();
            if (bookingModel != null)
            {
                bookingModel.IS_VOIDED = "Y";
                bookingModel.VOIDED_DATE = booking.VOIDED_DATE;
                bookingModel.VOIDED_USER = booking.VOIDED_USER;
                db.Entry(bookingModel).State = EntityState.Modified;
                db.SaveChanges();
            }
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
            if (!string.IsNullOrEmpty(companyId))
                return Utils.GetSqlQueryResult<string>("a_hawb", "hawb_no", new List<DbParameter>
                {
                    new DbParameter { FieldName = "job_no", ParaName = "job_no", ParaCompareType = DbParameter.CompareType.equals, Value = id, OrGroupIndex = 1 },
                    new DbParameter { FieldName = "mawb_no", ParaName = "mawb_no", ParaCompareType = DbParameter.CompareType.equals, Value = id, OrGroupIndex = 1 },
                    new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                    new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
                });
            else
                return Utils.GetSqlQueryResult<string>("a_hawb", "hawb_no", new List<DbParameter>
                {
                    new DbParameter { FieldName = "job_no", ParaName = "job_no", ParaCompareType = DbParameter.CompareType.equals, Value = id, OrGroupIndex = 1 },
                    new DbParameter { FieldName = "mawb_no", ParaName = "mawb_no", ParaCompareType = DbParameter.CompareType.equals, Value = id, OrGroupIndex = 1 },
                    new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
                });

        }

        public List<HawbView> GetHawbs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"h.hawb_no, h.company_id, h.frt_mode, h.job_no, h.mawb_no,
                m.airline_code, m.flight_no, m.flight_date, h.origin_code, h.dest_code,
                h.shipper_code, h.shipper_desc, h.consignee_code, h.consignee_desc, h.frt_payment_pc,
                case when h.gwts > h.vwts then h.gwts else h.vwts end as cwts,
                h.package, h.gwts, h.vwts, h.cbm, h.package_unit, h.create_user, h.create_date, h.is_voided";
            var fromCmd = $@"a_hawb h left outer join a_mawb m on h.mawb_no = m.mawb and h.company_id = m.company_id and h.frt_mode = m.frt_mode
                where h.create_date >= to_date('{startDate.ToString("yyyyMMdd")}','YYYYMMDD') 
                and h.create_date <= to_date('{endDate.ToString("yyyyMMdd")}','YYYYMMDD') ";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "h.hawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.mawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                //new DbParameter { FieldName = "create_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                //new DbParameter { FieldName = "create_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "h.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "h.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<HawbView>(fromCmd, selectCmd, dbParas);

            return result;
        }

        public List<HawbView> GetHawbsAllOrigin(DateTime startDate, DateTime endDate, string frtMode, string searchValue)
        {
            var selectCmd = @"h.hawb_no, h.company_id, h.frt_mode, h.job_no, h.mawb_no,
                m.airline_code, m.flight_no, m.flight_date, h.origin_code, h.dest_code,
                h.shipper_code, h.shipper_desc, h.consignee_code, h.consignee_desc, h.frt_payment_pc,
                case when h.gwts > h.vwts then h.gwts else h.vwts end as cwts,
                h.package, h.gwts, h.vwts, h.cbm, h.package_unit, h.create_user, h.create_date";
            var fromCmd = $@"a_hawb h left outer join a_mawb m on h.mawb_no = m.mawb and h.company_id = m.company_id and h.frt_mode = m.frt_mode
                where h.create_date >= to_date('{startDate.ToString("yyyyMMdd")}','YYYYMMDD') 
                and h.create_date <= to_date('{endDate.ToString("yyyyMMdd")}','YYYYMMDD') ";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "h.hawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.mawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
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

        public void AddHawb(Hawb hawb)
        {
            try
            {
                db.Hawbs.Add(hawb);
                db.HawbPos.AddRange(hawb.HawbPos);
                db.HawbLics.AddRange(hawb.HawbLics);
                db.HawbDims.AddRange(hawb.HawbDims);
                db.HawbCharges.AddRange(hawb.HawbChargesPrepaid);
                db.HawbCharges.AddRange(hawb.HawbChargesCollect);
                db.HawbDocs.AddRange(hawb.HawbDocs);
                db.HawbStatuses.AddRange(hawb.HawbStatuses);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateHawb(Hawb hawb)
        {
            try
            {
                db.Entry(hawb).State = EntityState.Modified;
                var pos = db.HawbPos.Where(a => a.HAWB_NO == hawb.HAWB_NO && a.COMPANY_ID == hawb.COMPANY_ID && a.FRT_MODE == hawb.FRT_MODE);
                var lics = db.HawbLics.Where(a => a.HAWB_NO == hawb.HAWB_NO && a.COMPANY_ID == hawb.COMPANY_ID && a.FRT_MODE == hawb.FRT_MODE);
                var dims = db.HawbDims.Where(a => a.HAWB_NO == hawb.HAWB_NO && a.COMPANY_ID == hawb.COMPANY_ID && a.FRT_MODE == hawb.FRT_MODE);
                var charges = db.HawbCharges.Where(a => a.HAWB_NO == hawb.HAWB_NO && a.COMPANY_ID == hawb.COMPANY_ID && a.FRT_MODE == hawb.FRT_MODE);
                var docs = db.HawbDocs.Where(a => a.HAWB_NO == hawb.HAWB_NO);
                var statuses = db.HawbStatuses.Where(a => a.HAWB_NO == hawb.HAWB_NO);

                if (pos != null)
                {
                    db.HawbPos.RemoveRange(pos);
                    db.HawbPos.AddRange(hawb.HawbPos);
                }
                if (lics != null)
                {
                    db.HawbLics.RemoveRange(lics);
                    db.HawbLics.AddRange(hawb.HawbLics);
                }
                if (dims != null)
                {
                    db.HawbDims.RemoveRange(dims);
                    db.HawbDims.AddRange(hawb.HawbDims);
                }
                if (charges != null)
                {
                    db.HawbCharges.RemoveRange(charges);
                    db.HawbCharges.AddRange(hawb.HawbChargesPrepaid);
                    db.HawbCharges.AddRange(hawb.HawbChargesCollect);
                }
                if (docs != null)
                {
                    db.HawbDocs.RemoveRange(docs);
                    db.HawbDocs.AddRange(hawb.HawbDocs);
                }
                if (statuses != null)
                {
                    db.HawbStatuses.RemoveRange(statuses);
                    db.HawbStatuses.AddRange(hawb.HawbStatuses);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidHawb(Hawb hawb)
        {
            var hawbModel = db.Hawbs.Where(a => a.HAWB_NO == hawb.HAWB_NO && a.COMPANY_ID == hawb.COMPANY_ID && a.FRT_MODE == hawb.FRT_MODE).FirstOrDefault();
            if (hawbModel != null)
            {
                hawbModel.IS_VOIDED = "Y";
                hawbModel.VOIDED_DATE = hawb.VOIDED_DATE;
                hawbModel.VOIDED_USER = hawb.VOIDED_USER;
                db.Entry(hawbModel).State = EntityState.Modified;
                db.SaveChanges();
            }
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

        public List<InvoiceView> GetMawbInvoices(string mawbNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "mawb_no", ParaName = "mawb_no", ParaCompareType = DbParameter.CompareType.equals, Value = mawbNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<InvoiceView>("a_invoice", "*", dbParas);

            return result;
        }

        public List<InvoiceView> GetJobInvoices(string jobNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "job_no", ParaName = "job_no", ParaCompareType = DbParameter.CompareType.equals, Value = jobNo },
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

        public void AddInvoice(Invoice invoice)
        {
            try
            {
                db.Invoices.Add(invoice);
                db.InvoiceHawbs.AddRange(invoice.InvoiceHawbs);
                db.InvoiceItems.AddRange(invoice.InvoiceItems);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateInvoice(Invoice invoice)
        {
            try
            {
                db.Entry(invoice).State = EntityState.Modified;
                var hawbs = db.InvoiceHawbs.Where(a => a.INV_NO == invoice.INV_NO && a.COMPANY_ID == invoice.COMPANY_ID && a.FRT_MODE == invoice.FRT_MODE);
                var items = db.InvoiceItems.Where(a => a.INV_NO == invoice.INV_NO && a.COMPANY_ID == invoice.COMPANY_ID && a.FRT_MODE == invoice.FRT_MODE);

                if (hawbs != null)
                {
                    db.InvoiceHawbs.RemoveRange(hawbs);
                    db.InvoiceHawbs.AddRange(invoice.InvoiceHawbs);
                }
                if (items != null)
                {
                    db.InvoiceItems.RemoveRange(items);
                    db.InvoiceItems.AddRange(invoice.InvoiceItems);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidInvoice(Invoice invoice)
        {
            var invoiceModel = db.Invoices.Where(a => a.INV_NO == invoice.INV_NO && a.COMPANY_ID == invoice.COMPANY_ID && a.FRT_MODE == invoice.FRT_MODE).FirstOrDefault();
            if (invoiceModel != null)
            {
                invoiceModel.IS_VOIDED = "Y";
                invoiceModel.VOIDED_DATE = invoice.VOIDED_DATE;
                invoiceModel.VOIDED_USER = invoice.VOIDED_USER;
                db.Entry(invoiceModel).State = EntityState.Modified;
                db.SaveChanges();
            }
        }

        public bool IsExistingInvNo(string invNo, string companyId, string frtMode)
        {
            return db.Invoices.Count(a => a.INV_NO == invNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region Pv

        public List<PvView> GetPvs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "pv_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "mawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "hawb_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "pv_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "pv_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<PvView>("a_pv", "*", dbParas);

            return result;
        }

        public Pv GetPv(string pvNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "pv_no", ParaName = "pv_no", ParaCompareType = DbParameter.CompareType.equals, Value = pvNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var pv = Utils.GetSqlQueryResult<Pv>("a_pv", "*", dbParas).FirstOrDefault();
            if (pv != null)
            {
                pv.PvItems = Utils.GetSqlQueryResult<PvItem>("a_pv_item", "*", dbParas);
            }

            if (pv == null)
                return new Pv();
            else
                return pv;
        }

        public void AddPv(Pv pv)
        {
            try
            {
                db.Pvs.Add(pv);
                db.PvItems.AddRange(pv.PvItems);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdatePv(Pv pv)
        {
            try
            {
                db.Entry(pv).State = EntityState.Modified;
                var items = db.PvItems.Where(a => a.PV_NO == pv.PV_NO && a.COMPANY_ID == pv.COMPANY_ID && a.FRT_MODE == pv.FRT_MODE);

                if (items != null)
                {
                    db.PvItems.RemoveRange(items);
                    db.PvItems.AddRange(pv.PvItems);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidPv(Pv pv)
        {
            var pvModel = db.Pvs.Where(a => a.PV_NO == pv.PV_NO && a.COMPANY_ID == pv.COMPANY_ID && a.FRT_MODE == pv.FRT_MODE).FirstOrDefault();
            if (pvModel != null)
            {
                pvModel.IS_VOIDED = "Y";
                pvModel.VOIDED_DATE = pv.VOIDED_DATE;
                pvModel.VOIDED_USER = pv.VOIDED_USER;
                db.Entry(pvModel).State = EntityState.Modified;
                db.SaveChanges();
            }
        }

        public bool IsExistingPvNo(string pvNo, string companyId, string frtMode)
        {
            return db.Pvs.Count(a => a.PV_NO == pvNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region Other Job

        public List<OtherJobView> GetOtherJobs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "lot_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "flight_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "flight_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<OtherJobView>("a_other_job", "*", dbParas);

            return result;
        }

        public OtherJob GetOtherJob(string jobNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "job_no", ParaName = "job_no", ParaCompareType = DbParameter.CompareType.equals, Value = jobNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var otherJob = Utils.GetSqlQueryResult<OtherJob>("a_other_job", "*", dbParas).FirstOrDefault();
            if (otherJob != null)
            {
                var paraFrtMode = dbParas.Where(a => a.FieldName == "frt_mode").First();
                dbParas.Remove(paraFrtMode);

                var charges = Utils.GetSqlQueryResult<OtherJobCharge>("a_other_job_chg", "*", dbParas);
                otherJob.OtherJobChargesPrepaid = charges.Where(a => a.PAYMENT_TYPE == "P").ToList();
                otherJob.OtherJobChargesCollect = charges.Where(a => a.PAYMENT_TYPE == "C").ToList();
                otherJob.Invoices = this.GetJobInvoices(jobNo, companyId, frtMode);
            }

            if (otherJob == null)
                return new OtherJob();
            else
                return otherJob;
        }

        public void AddOtherJob(OtherJob otherJob)
        {
            try
            {
                db.OtherJobs.Add(otherJob);
                db.OtherJobCharges.AddRange(otherJob.OtherJobChargesPrepaid);
                db.OtherJobCharges.AddRange(otherJob.OtherJobChargesCollect);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateOtherJob(OtherJob otherJob)
        {
            try
            {
                db.Entry(otherJob).State = EntityState.Modified;
                var charges = db.OtherJobCharges.Where(a => a.JOB_NO == otherJob.JOB_NO && a.COMPANY_ID == otherJob.COMPANY_ID);

                if (charges != null)
                {
                    db.OtherJobCharges.RemoveRange(charges);
                    db.OtherJobCharges.AddRange(otherJob.OtherJobChargesPrepaid);
                    db.OtherJobCharges.AddRange(otherJob.OtherJobChargesCollect);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExistingOtherJobNo(string jobNo, string companyId, string frtMode)
        {
            return db.OtherJobs.Count(a => a.JOB_NO == jobNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region Power Search

        public List<PowerSearchResult> PowerSearch(string searchValue, string companyId, int days, int take)
        {
            var results = new List<PowerSearchResult>();
            var settings = db.PowerSearchSettings.ToList();
            foreach (var tableName in settings.Select(a => a.TABLE_NAME).Distinct())
            {
                var sqlCmd = $"select * from (select result.* from (";
                var filter = $"and company_id = '{companyId}' and modify_date > sysdate - {days}";
                var resultDateField = "modify_date";
                var frtModeField = "frt_mode";

                //special case for PDD_BOOKING_DETAIL
                if (tableName == "PDD_BOOKING_DETAIL")
                {
                    resultDateField = "process_date";
                    frtModeField = "'' frt_mode";
                    filter = string.Empty;
                }

                foreach (var setting in settings.Where(a => a.TABLE_NAME == tableName))
                {
                    sqlCmd += $"select {resultDateField} RESULT_DATE, {frtModeField}, {setting.ID_FIELD} ID, {setting.SEARCH_FIELD} RESULT_VALUE, " +
                        $"'{tableName}' TABLE_NAME, '{setting.ID_FIELD}' ID_FIELD from {setting.TABLE_NAME} where {setting.SEARCH_FIELD} like '{searchValue}' {filter} union ";
                }
                sqlCmd = sqlCmd.Substring(0, sqlCmd.LastIndexOf("union"));
                sqlCmd += $") result order by result_date desc) where rownum <= {take}";

                //log.Debug(sqlCmd);
                var result = db.Database.SqlQuery<PowerSearchResult>(sqlCmd).ToList();
                if (result.Count > 0)
                    results.AddRange(result);
            }
            return results.OrderByDescending(a => a.RESULT_DATE).ToList();
        }

        public PowerSearchTemplate GetPowerSearchTemplate(string tableName)
        {
            var template = db.PowerSearchTemplates.FirstOrDefault(a => a.TABLE_NAME == tableName);
            return template ?? new PowerSearchTemplate();
        }

        public DataTable GetPowerSearchDetails(string tableName, string id, string idFieldName, string companyId, string frtMode)
        {
            var template = GetPowerSearchTemplate(tableName);
            DataTable dt = new DataTable();
            OracleConnection conn = new OracleConnection(db.Database.Connection.ConnectionString + ";Password=RCSHKG");
            OracleCommand cmd = new OracleCommand();
            cmd.Connection = conn;
            cmd.CommandText = $"select {template.FIELDS} from {template.TABLE_NAME} " +
                $"where {idFieldName} = '{id}' and company_id = '{companyId}' and frt_mode = '{frtMode}'";

            if (tableName == "PDD_BOOKING_DETAIL")
                cmd.CommandText = $"select {template.FIELDS} from {template.TABLE_NAME} " +
                $"where {idFieldName} = '{id}'";

            OracleDataAdapter adapter = new OracleDataAdapter(cmd);
            //log.Debug(cmd.CommandText);
            try
            {
                if (conn.State != ConnectionState.Open)
                {
                    conn.Open();
                }
                adapter.Fill(dt);
            }
            catch (Exception ex)
            {
                dt.Columns.Add("Error");
                dt.Rows.Add(ex.Message);
            }
            finally
            {
                conn.Close();
                conn.Dispose();
            }
            return dt;
        }

        #endregion
    }
}
