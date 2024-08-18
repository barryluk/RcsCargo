using DbUtils.Models.Air;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;

namespace DbUtils
{
    public class Air
    {
        RcsFreightDBContext db;
        public Air() 
        {
            db = new RcsFreightDBContext();
        }

        public List<MawbView> GetMawbs(DateTime dateFrom, DateTime dateTo, string companyId, string frtMode, string searchValue)
        {
            return db.Mawbs.Where(a => a.MAWB.StartsWith(searchValue) 
                && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode
                && a.FLIGHT_DATE >= dateFrom && a.FLIGHT_DATE <= dateTo)
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

            if (mawb == null)
                return new Mawb();
            else
                return mawb;
        }

        public List<MawbView> GetFlightNos(DateTime startDate, DateTime endDate, string companyId)
        {
            return db.Mawbs.Where(a => a.COMPANY_ID == companyId && a.FLIGHT_DATE >= startDate && a.FLIGHT_DATE <= endDate)
                .Select(a => new MawbView 
                { 
                    FLIGHT_DATE = a.FLIGHT_DATE,
                    FLIGHT_NO = a.FLIGHT_NO,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                }).Distinct().ToList();
        }

        public List<MawbView> GetMawbInfoByFlightNo(string flightNo, DateTime flightDate, string companyId) 
        {
            return db.Mawbs.Where(a => a.COMPANY_ID == companyId && a.FLIGHT_DATE == flightDate && a.FLIGHT_NO == flightNo)
                .Select(a => new MawbView
                {
                    MAWB = a.MAWB,
                    JOB = a.JOB,
                    ORIGIN_CODE = a.ORIGIN_CODE,
                    DEST_CODE = a.DEST_CODE,
                }).ToList();
        }

    }
}
