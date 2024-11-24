using DbUtils.Models.Sea;
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
    public class Sea
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        RcsFreightDBContext db;
        public Sea()
        {
            db = new RcsFreightDBContext();
        }

        #region Voyage

        public List<VoyageView> GetVoyages(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "ves_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "loading_port_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "loading_port_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<VoyageView>("v_s_voyage", "*", dbParas);

            return result.OrderByDescending(a => a.LOADING_PORT_DATE).ToList();
        }

        public Voyage GetVoyage(string vesCode, string voy, string companyId, string frtMode)
        {
            var voyage = db.Voyages.Where(a => a.VES_CODE == vesCode && a.VOYAGE == voy && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).FirstOrDefault();
            if (voyage != null)
            {
                voyage.LoadingPorts = db.VoyageDetails.Where(a => a.VES_CODE == vesCode && a.VOYAGE == voy 
                    && a.ORIGIN_DEST == "O" && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();

                voyage.DischargePorts = db.VoyageDetails.Where(a => a.VES_CODE == vesCode && a.VOYAGE == voy
                    && a.ORIGIN_DEST == "D" && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
            }

            if (voyage == null)
                return new Voyage();
            else
                return voyage;
        }

        public void AddVoyage(Voyage voyage)
        {
            try
            {
                db.Voyages.Add(voyage);
                db.VoyageDetails.AddRange(voyage.LoadingPorts);
                db.VoyageDetails.AddRange(voyage.DischargePorts);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateVoyage(Voyage voyage)
        {
            try
            {
                db.Entry(voyage).State = EntityState.Modified;
                var voyageDetails = db.VoyageDetails.Where(a => a.VES_CODE == voyage.VES_CODE && a.VOYAGE == voyage.VOYAGE && a.COMPANY_ID == voyage.COMPANY_ID && a.FRT_MODE == voyage.FRT_MODE);

                if (voyageDetails != null)
                {
                    db.VoyageDetails.RemoveRange(voyageDetails);
                    db.VoyageDetails.AddRange(voyage.LoadingPorts);
                    db.VoyageDetails.AddRange(voyage.DischargePorts);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingVesselVoyage(string vesCode, string voy, string companyId, string frtMode)
        {
            return db.Voyages.Count(a => a.VES_CODE == vesCode && a.VOYAGE == voy && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region Booking

        public List<BookingView> GetBookings(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"b.booking_no, b.company_id, b.frt_mode, b.shipper_code, b.shipper_desc, b.consignee_code, b.consignee_desc,
                b.loading_port, b.loading_port_date, b.discharge_port, b.discharge_port_date, b.ves_code, v.ves_desc, b.voyage, b.create_date, b.create_user";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "b.booking_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "v.ves_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.loading_port_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "b.loading_port_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "b.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "b.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<BookingView>("s_booking b join vessel v on b.ves_code = v.ves_code", selectCmd, dbParas);

            return result.OrderByDescending(a => a.LOADING_PORT_DATE).ToList();
        }

        public List<BookingView> GetUnusedBooking(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"b.booking_no, b.company_id, b.frt_mode, b.shipper_code, b.shipper_desc, b.consignee_code, b.consignee_desc,
                b.loading_port, b.loading_port_date, b.discharge_port, b.discharge_port_date, b.ves_code, v.ves_desc, b.voyage, b.create_date, b.create_user";
            var fromCmd = "s_booking b join vessel v on b.ves_code = v.ves_code where b.booking_no not in (select booking_no from s_hbl where booking_no is not null)";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "b.booking_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "v.ves_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "b.loading_port_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "b.loading_port_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "b.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "b.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<BookingView>(fromCmd, selectCmd, dbParas);

            return result.OrderByDescending(a => a.LOADING_PORT_DATE).ToList();
        }

        public SeaBooking GetBooking(string bookingNo, string companyId, string frtMode)
        {
            var booking = db.SeaBookings.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).FirstOrDefault();
            if (booking != null)
            {
                booking.SeaBookingCargos = db.SeaBookingCargos.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                booking.SeaBookingPos = db.SeaBookingPos.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                booking.SeaBookingSos = db.SeaBookingSos.Where(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
            }

            if (booking == null)
                return new SeaBooking();
            else
                return booking;
        }

        public void AddBooking(SeaBooking booking)
        {
            try
            {
                db.SeaBookings.Add(booking);
                db.SeaBookingCargos.AddRange(booking.SeaBookingCargos);
                db.SeaBookingPos.AddRange(booking.SeaBookingPos);
                db.SeaBookingSos.AddRange(booking.SeaBookingSos);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateBooking(SeaBooking booking)
        {
            try
            {
                db.Entry(booking).State = EntityState.Modified;
                var bookingCargos = db.SeaBookingCargos.Where(a => a.BOOKING_NO == booking.BOOKING_NO && a.COMPANY_ID == booking.COMPANY_ID && a.FRT_MODE == booking.FRT_MODE).ToList();
                var bookingPos = db.SeaBookingPos.Where(a => a.BOOKING_NO == booking.BOOKING_NO && a.COMPANY_ID == booking.COMPANY_ID && a.FRT_MODE == booking.FRT_MODE).ToList();
                var bookingSos = db.SeaBookingSos.Where(a => a.BOOKING_NO == booking.BOOKING_NO && a.COMPANY_ID == booking.COMPANY_ID && a.FRT_MODE == booking.FRT_MODE).ToList();

                if (bookingCargos != null)
                {
                    db.SeaBookingCargos.RemoveRange(bookingCargos);
                    db.SeaBookingCargos.AddRange(booking.SeaBookingCargos);
                }
                if (bookingPos != null)
                {
                    db.SeaBookingPos.RemoveRange(bookingPos);
                    db.SeaBookingPos.AddRange(booking.SeaBookingPos);
                }
                if (bookingSos != null)
                {
                    db.SeaBookingSos.RemoveRange(bookingSos);
                    db.SeaBookingSos.AddRange(booking.SeaBookingSos);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingBookingNo(string bookingNo, string companyId, string frtMode)
        {
            return db.SeaBookings.Count(a => a.BOOKING_NO == bookingNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region Hbl

        public List<HblView> GetHbls(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"h.hbl_no, h.booking_no, h.company_id, h.frt_mode, h.shipper_code, h.shipper_desc, h.consignee_code, h.consignee_desc,
                h.loading_port, h.loading_port_date, h.discharge_port, h.discharge_port_date, h.ves_code, v.ves_desc, h.voyage, h.create_date, h.create_user";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "h.hbl_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.booking_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "v.ves_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.shipper_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.consignee_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.loading_port_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "h.loading_port_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "h.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "h.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<HblView>("s_hbl h join vessel v on h.ves_code = v.ves_code", selectCmd, dbParas);

            return result.OrderByDescending(a => a.LOADING_PORT_DATE).ToList();
        }

        public List<JobView> GetJobNos(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var selectCmd = @"distinct h.job_no, h.company_id, h.frt_mode, h.ves_code, v.ves_desc, h.voyage, h.loading_port, h.loading_port_date";
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "h.job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "v.ves_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "h.loading_port_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "h.loading_port_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "h.company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "h.frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<JobView>("s_hbl h join vessel v on h.ves_code = v.ves_code", selectCmd, dbParas);

            return result.OrderByDescending(a => a.LOADING_PORT_DATE).ToList();
        }

        public SeaHbl GetHbl(string hblNo, string companyId, string frtMode)
        {
            var hbl = db.SeaHbls.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).FirstOrDefault();
            if (hbl != null)
            {
                hbl.SeaHblCargos = db.SeaHblCargos.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                hbl.SeaHblContainers = db.SeaHblContainers.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                hbl.SeaHblPos = db.SeaHblPos.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                hbl.SeaHblSos = db.SeaHblSos.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();
                hbl.SeaHblChargesPrepaid = db.SeaHblCharges.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode && a.PAYMENT_TYPE == "P").ToList();
                hbl.SeaHblChargesCollect = db.SeaHblCharges.Where(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode && a.PAYMENT_TYPE == "C").ToList();
                hbl.SeaHblDocs = db.SeaHblDocs.Where(a => a.HBL_NO == hblNo).ToList();
                hbl.SeaHblStatuses = db.SeaHblStatuses.Where(a => a.HBL_NO == hblNo).ToList();
            }

            if (hbl == null)
                return new SeaHbl();
            else
                return hbl;
        }

        public void AddHbl(SeaHbl hbl)
        {
            try
            {
                db.SeaHbls.Add(hbl);
                db.SeaHblContainers.AddRange(hbl.SeaHblContainers);
                db.SeaHblCargos.AddRange(hbl.SeaHblCargos);
                db.SeaHblPos.AddRange(hbl.SeaHblPos);
                db.SeaHblSos.AddRange(hbl.SeaHblSos);
                db.SeaHblCharges.AddRange(hbl.SeaHblChargesPrepaid);
                db.SeaHblCharges.AddRange(hbl.SeaHblChargesCollect);
                db.SeaHblStatuses.AddRange(hbl.SeaHblStatuses);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateHbl(SeaHbl hbl)
        {
            try
            {
                db.Entry(hbl).State = EntityState.Modified;
                var hblContainers = db.SeaHblContainers.Where(a => a.HBL_NO == hbl.HBL_NO && a.COMPANY_ID == hbl.COMPANY_ID && a.FRT_MODE == hbl.FRT_MODE).ToList();
                var hblCargos = db.SeaHblCargos.Where(a => a.HBL_NO == hbl.HBL_NO && a.COMPANY_ID == hbl.COMPANY_ID && a.FRT_MODE == hbl.FRT_MODE).ToList();
                var hblPos = db.SeaHblPos.Where(a => a.HBL_NO == hbl.HBL_NO && a.COMPANY_ID == hbl.COMPANY_ID && a.FRT_MODE == hbl.FRT_MODE).ToList();
                var hblSos = db.SeaHblSos.Where(a => a.HBL_NO == hbl.HBL_NO && a.COMPANY_ID == hbl.COMPANY_ID && a.FRT_MODE == hbl.FRT_MODE).ToList();
                var hblPrepaidCharges = db.SeaHblCharges.Where(a => a.HBL_NO == hbl.HBL_NO && a.COMPANY_ID == hbl.COMPANY_ID && a.FRT_MODE == hbl.FRT_MODE && a.PAYMENT_TYPE == "P").ToList();
                var hblCollectCharges = db.SeaHblCharges.Where(a => a.HBL_NO == hbl.HBL_NO && a.COMPANY_ID == hbl.COMPANY_ID && a.FRT_MODE == hbl.FRT_MODE && a.PAYMENT_TYPE == "C").ToList();
                var hblStatuses = db.SeaHblStatuses.Where(a => a.HBL_NO == hbl.HBL_NO).ToList();

                if (hblContainers != null)
                {
                    db.SeaHblContainers.RemoveRange(hblContainers);
                    db.SeaHblContainers.AddRange(hbl.SeaHblContainers);
                }
                if (hblCargos != null)
                {
                    db.SeaHblCargos.RemoveRange(hblCargos);
                    db.SeaHblCargos.AddRange(hbl.SeaHblCargos);
                }
                if (hblPos != null)
                {
                    db.SeaHblPos.RemoveRange(hblPos);
                    db.SeaHblPos.AddRange(hbl.SeaHblPos);
                }
                if (hblSos != null)
                {
                    db.SeaHblSos.RemoveRange(hblSos);
                    db.SeaHblSos.AddRange(hbl.SeaHblSos);
                }
                if (hblPrepaidCharges != null)
                {
                    db.SeaHblCharges.RemoveRange(hblPrepaidCharges);
                    db.SeaHblCharges.AddRange(hbl.SeaHblChargesPrepaid);
                }
                if (hblCollectCharges != null)
                {
                    db.SeaHblCharges.RemoveRange(hblCollectCharges);
                    db.SeaHblCharges.AddRange(hbl.SeaHblChargesCollect);
                }
                if (hblStatuses != null)
                {
                    db.SeaHblStatuses.RemoveRange(hblStatuses);
                    db.SeaHblStatuses.AddRange(hbl.SeaHblStatuses);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingHblNo(string hblNo, string companyId, string frtMode)
        {
            return db.SeaHbls.Count(a => a.HBL_NO == hblNo && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        public List<SeaHblDoc> GetSeaHblDocs(string hblNo)
        {
            return db.SeaHblDocs.Where(a => a.HBL_NO == hblNo).ToList();
        }

        public SeaHblDoc GetSeaHblDocByDocId(string docId)
        {
            return db.SeaHblDocs.Where(a => a.DOC_ID == docId).FirstOrDefault();
        }

        public void AddSeaHblDoc(SeaHblDoc hblDoc)
        {
            db.SeaHblDocs.Add(hblDoc);
            db.SaveChanges();
        }

        public void UpdateSeaHblDoc(SeaHblDoc hblDoc)
        {
            db.Entry(hblDoc).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();
        }

        public void DeleteSeaHblDoc(string docId)
        {
            var path = new System.Configuration.AppSettingsReader().GetValue("FilePath", typeof(string)).ToString();
            var record = db.SeaHblDocs.Where(a => a.DOC_ID == docId).FirstOrDefault();
            if (record != null)
            {
                try
                {
                    System.IO.File.Delete(Path.Combine(path, record.DOC_PATH, record.DOC_ID));
                    db.SeaHblDocs.Remove(record);
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

        public List<SeaInvoiceView> GetInvoices(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "inv_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "inv_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "inv_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<SeaInvoiceView>("s_invoice", "*", dbParas);

            return result;
        }

        public SeaInvoice GetInvoice(string invNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "inv_no", ParaName = "inv_no", ParaCompareType = DbParameter.CompareType.equals, Value = invNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var invoice = Utils.GetSqlQueryResult<SeaInvoice>("s_invoice", "*", dbParas).FirstOrDefault();
            if (invoice != null)
            {
                invoice.SeaInvoiceRefNos = Utils.GetSqlQueryResult<SeaInvoiceRefNo>("s_invoice_ref_no", "*", dbParas);
                invoice.SeaInvoiceItems = Utils.GetSqlQueryResult<SeaInvoiceItem>("s_invoice_item", "*", dbParas);
            }

            if (invoice == null)
                return new SeaInvoice();
            else
                return invoice;
        }

        public void AddInvoice(SeaInvoice invoice)
        {
            try
            {
                db.SeaInvoices.Add(invoice);
                db.SeaInvoiceRefNos.AddRange(invoice.SeaInvoiceRefNos);
                db.SeaInvoiceItems.AddRange(invoice.SeaInvoiceItems);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateInvoice(SeaInvoice invoice)
        {
            try
            {
                db.Entry(invoice).State = EntityState.Modified;
                var refNos = db.SeaInvoiceRefNos.Where(a => a.INV_NO == invoice.INV_NO && a.COMPANY_ID == invoice.COMPANY_ID && a.FRT_MODE == invoice.FRT_MODE);
                var items = db.SeaInvoiceItems.Where(a => a.INV_NO == invoice.INV_NO && a.COMPANY_ID == invoice.COMPANY_ID && a.FRT_MODE == invoice.FRT_MODE);

                if (refNos != null)
                {
                    db.SeaInvoiceRefNos.RemoveRange(refNos);
                    db.SeaInvoiceRefNos.AddRange(invoice.SeaInvoiceRefNos);
                }
                if (items != null)
                {
                    db.SeaInvoiceItems.RemoveRange(items);
                    db.SeaInvoiceItems.AddRange(invoice.SeaInvoiceItems);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidInvoice(SeaInvoice invoice)
        {
            var invoiceModel = db.SeaInvoices.Where(a => a.INV_NO == invoice.INV_NO && a.COMPANY_ID == invoice.COMPANY_ID && a.FRT_MODE == invoice.FRT_MODE).FirstOrDefault();
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
            return db.SeaInvoices.Count(a => a.INV_NO == invNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion

        #region Pv

        public List<SeaPvView> GetPvs(DateTime startDate, DateTime endDate, string companyId, string frtMode, string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "pv_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "job_no", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "voyage", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "customer_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "pv_date", ParaName = "startDate", ParaCompareType = DbParameter.CompareType.greaterEquals, Value = startDate },
                new DbParameter { FieldName = "pv_date", ParaName = "endDate", ParaCompareType = DbParameter.CompareType.lessEquals, Value = endDate },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var result = Utils.GetSqlQueryResult<SeaPvView>("s_pv", "*", dbParas);

            return result;
        }

        public SeaPv GetPv(string pvNo, string companyId, string frtMode)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "pv_no", ParaName = "pv_no", ParaCompareType = DbParameter.CompareType.equals, Value = pvNo },
                new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
                new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode },
            };
            var pv = Utils.GetSqlQueryResult<SeaPv>("s_pv", "*", dbParas).FirstOrDefault();
            if (pv != null)
            {
                pv.SeaPvRefNos = Utils.GetSqlQueryResult<SeaPvRefNo>("s_pv_ref_no", "*", dbParas);
                pv.SeaPvItems = Utils.GetSqlQueryResult<SeaPvItem>("s_pv_item", "*", dbParas);
            }

            if (pv == null)
                return new SeaPv();
            else
                return pv;
        }

        public void AddPv(SeaPv pv)
        {
            try
            {
                db.SeaPvs.Add(pv);
                db.SeaPvRefNos.AddRange(pv.SeaPvRefNos);
                db.SeaPvItems.AddRange(pv.SeaPvItems);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdatePv(SeaPv pv)
        {
            try
            {
                db.Entry(pv).State = EntityState.Modified;
                var refNos = db.SeaPvRefNos.Where(a => a.PV_NO == pv.PV_NO && a.COMPANY_ID == pv.COMPANY_ID && a.FRT_MODE == pv.FRT_MODE);
                var items = db.SeaPvItems.Where(a => a.PV_NO == pv.PV_NO && a.COMPANY_ID == pv.COMPANY_ID && a.FRT_MODE == pv.FRT_MODE);

                if (refNos != null)
                {
                    db.SeaPvRefNos.RemoveRange(refNos);
                    db.SeaPvRefNos.AddRange(pv.SeaPvRefNos);
                }
                if (items != null)
                {
                    db.SeaPvItems.RemoveRange(items);
                    db.SeaPvItems.AddRange(pv.SeaPvItems);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void VoidPv(SeaPv pv)
        {
            var pvModel = db.SeaPvs.Where(a => a.PV_NO == pv.PV_NO && a.COMPANY_ID == pv.COMPANY_ID && a.FRT_MODE == pv.FRT_MODE).FirstOrDefault();
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
            return db.SeaPvs.Count(a => a.PV_NO == pvNo &&
                a.COMPANY_ID == companyId && a.FRT_MODE == frtMode) == 1 ? true : false;
        }

        #endregion
    }
}
