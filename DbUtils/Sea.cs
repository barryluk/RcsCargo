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
                voyage.VoyageDetails = db.VoyageDetails.Where(a => a.VES_CODE == vesCode && a.VOYAGE == voy && a.COMPANY_ID == companyId && a.FRT_MODE == frtMode).ToList();

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
                db.VoyageDetails.AddRange(voyage.VoyageDetails);
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
                    db.VoyageDetails.AddRange(voyage.VoyageDetails);
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

    }
}
