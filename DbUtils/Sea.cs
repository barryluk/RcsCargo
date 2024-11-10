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

    }
}
