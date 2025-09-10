using DbUtils.Models.Accounting;
using DbUtils.Models.Admin;
using DbUtils.Models.Air;
using Newtonsoft.Json;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data;
using System.Data.Common;
using System.Data.Entity;
using System.Data.SqlTypes;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.UI.WebControls.WebParts;

namespace DbUtils
{
    public class Accounting
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        RcsFreightDBContext db;
        public Accounting()
        {
            db = new RcsFreightDBContext();
        }

        #region System Settings

        public List<PersonView> GetPersons()
        {
            var selectCmd = @"p.*, dep.dep_name";
            var fromCmd = $@"ac_person p left outer join ac_department dep on p.dep_code = dep.dep_code";
            var result = Utils.GetSqlQueryResult<PersonView>(fromCmd, selectCmd, new List<DbParameter>());
            return result.ToList();
        }

        public List<Department> GetDepartments()
        {
            var result = Utils.GetSqlQueryResult<Department>("ac_department", "*", new List<DbParameter>());
            return result.ToList();
        }

        public List<VoucherDesc> GetVoucherDesc()
        {
            return db.VoucherDesc.ToList();
        }

        public List<AcCustomerView> GetCustomers(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "c.customer_name", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "c.customer_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var selectCmd = @"c.*, r.region_name";
            var fromCmd = $@"ac_customer c left outer join ac_customer_region r on c.region_code = r.region_code";
            var result = Utils.GetSqlQueryResult<AcCustomerView>(fromCmd, selectCmd, dbParas);
            return result.ToList();
        }

        public List<VendorView> GetVendors(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "v.vendor_name", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "v.vendor_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var selectCmd = @"v.*, r.region_name";
            var fromCmd = $@"ac_vendor v left outer join ac_vendor_region r on v.region_code = r.region_code";
            var result = Utils.GetSqlQueryResult<VendorView>(fromCmd, selectCmd, dbParas);
            return result.ToList();
        }

        public List<AcCustomerRegion> GetCustomerRegions()
        {
            var result = Utils.GetSqlQueryResult<AcCustomerRegion>("ac_customer_region", "*", new List<DbParameter>());
            return result.ToList();
        }

        public List<AcCustomerRegion> GetVendorRegions()
        {
            var result = Utils.GetSqlQueryResult<AcCustomerRegion>("ac_vendor_region", "*", new List<DbParameter>());
            return result.ToList();
        }

        #endregion

        #region General Ledger

        public List<LedgerAccount> GetLedgerAccounts()
        {
            var result = Utils.GetSqlQueryResult<LedgerAccount>("ac_ledger_account", "*", new List<DbParameter>());
            return result.OrderBy(a => a.AC_CODE).ToList();
        }

        public List<LedgerAccountView> GetLedgerAccountSummary(int year, int period)
        {
            var selectCmd = @"ac.*,
                case sum.beg_ind when 'Dr' then sum.amt_beg else 0 end as open_dr,
                case sum.beg_ind when 'Cr' then sum.amt_beg else 0 end as open_cr,
                nvl(sum.amt_dr, 0) current_dr, nvl(sum.amt_cr, 0) current_cr,
                case sum.end_ind when 'Dr' then sum.amt_beg else 0 end as close_dr,
                case sum.end_ind when 'Cr' then sum.amt_beg else 0 end as close_cr";
            var fromCmd = $@"ac_ledger_account ac left outer join ac_gl_accsum sum on ac.ac_code = sum.ac_code and sum.year = {year} and sum.period = {period}";
            var result = Utils.GetSqlQueryResult<LedgerAccountView>(fromCmd, selectCmd, new List<DbParameter>());
            return result.OrderBy(a => a.AC_CODE).ToList();
        }

        #endregion

        #region Voucher

        public List<int> GetVoucherAccountYears()
        {
            return db.GLVouchers.Select(a => a.YEAR).Distinct().ToList();
        }

        public List<VoucherView> GetVouchers(DateTime dateFrom, DateTime dateTo)
        {
            var vouchers = db.GLVouchers.Where(a => a.VOUCHER_DATE >= dateFrom && a.VOUCHER_DATE <= dateTo).ToList();
            var results = new List<VoucherView>();

            foreach (var year in vouchers.Select(a => a.YEAR).Distinct())
            {
                foreach (var period in vouchers.Where(a => a.YEAR.Equals(year)).Select(a => a.PERIOD).Distinct())
                {
                    foreach (var voucherNo in vouchers.Where(a => a.YEAR.Equals(year) && a.PERIOD.Equals(period)).Select(a => a.VOUCHER_NO).Distinct())
                    {
                        var voucherRecord = vouchers.Where(a => a.YEAR.Equals(year) && a.PERIOD.Equals(period) && a.VOUCHER_NO.Equals(voucherNo));
                        results.Add(new VoucherView
                        {
                            YEAR = year,
                            PERIOD = period,
                            VOUCHER_NO = $"{voucherRecord.First().VOUCHER_TYPE} - {voucherNo.ToString().PadLeft(4, '0')}",
                            VOUCHER_DATE = voucherRecord.First().VOUCHER_DATE,
                            DESC_TEXT = voucherRecord.First().DESC_TEXT,
                            DR_AMT = voucherRecord.Sum(a => a.DR_AMT),
                            CR_AMT = voucherRecord.Sum(a => a.CR_AMT),
                            CBILL = voucherRecord.First().CBILL,
                            CCHECK = voucherRecord.First().CCHECK,
                            IBOOK = voucherRecord.First().IBOOK,
                        });
                    }
                }
            }

            return results.OrderBy(a => a.VOUCHER_DATE).ThenBy(a => a.VOUCHER_NO).ToList();
        }

        public List<GLVoucher> GetVoucher(int year, int period, int voucherNo)
        {
            var accounts = db.LedgerAccounts.ToList();
            var vouchers = db.GLVouchers.Where(a => a.YEAR == year && a.PERIOD == period && a.VOUCHER_NO == voucherNo);
            foreach (var voucher in vouchers)
                voucher.AC_NAME = accounts.Where(a => a.AC_CODE == voucher.AC_CODE).FirstOrDefault().AC_NAME;

            return vouchers.ToList();
        }

        #endregion

    }
}
