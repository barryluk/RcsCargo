using DbUtils.Models.Accounting;
using DbUtils.Models.Admin;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
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
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.UI.WebControls.WebParts;

namespace DbUtils
{
    public class Accounting
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        //private string[] assAccounts = { "212101", "550207", "550210", "113305", "550231", "550218", "550201", "550205", "550209", "550225", "550227", "550206", "113102", "212102", "550202", "113101", "550208" };

        RcsFreightDBContext db;
        public Accounting()
        {
            db = new RcsFreightDBContext();
        }

        public List<VoucherDesc> GetVoucherDesc()
        {
            return db.VoucherDesc.ToList();
        }

        #region Person

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

        public List<AcPersonMapping> GetPersonMappings()
        {
            return db.AcPersonMappings.ToList();
        }

        public Person GetPerson(string personCode)
        {
            var person = db.Persons.FirstOrDefault(a => a.PERSON_CODE == personCode);
            if (person == null)
                return new Person();
            else
                return person;
        }

        public void AddPerson(Person person)
        {
            try
            {
                db.Persons.Add(person);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdatePerson(Person person)
        {
            try
            {
                db.Entry(person).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeletePerson(string personCode)
        {
            try
            {
                var person = db.Persons.FirstOrDefault(a => a.PERSON_CODE.Equals(personCode));
                if (person != null)
                {
                    db.Persons.Remove(person);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExistingPersonCode(string personCode)
        {
            return db.Persons.Count(a => a.PERSON_CODE == personCode) == 1 ? true : false;
        }

        #endregion

        #region Customer

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

        public List<AcCustomerMapping> GetCustomerMappings(string searchValue)
        {
            return db.AcCustomerMappings.Where(a => a.CUSTOMER_CODE.Contains(searchValue) || a.CUSTOMER_NAME.Contains(searchValue)).ToList();
        }

        public List<AcCustomerRegion> GetCustomerRegions()
        {
            var result = Utils.GetSqlQueryResult<AcCustomerRegion>("ac_customer_region", "*", new List<DbParameter>());
            return result.ToList();
        }

        public AcCustomer GetCustomer(string customerCode)
        {
            var customer = db.AcCustomers.FirstOrDefault(a => a.CUSTOMER_CODE == customerCode);
            if (customer == null)
                return new AcCustomer();
            else
                return customer;
        }

        public void AddCustomer(AcCustomer customer)
        {
            try
            {
                db.AcCustomers.Add(customer);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCustomer(AcCustomer customer)
        {
            try
            {
                db.Entry(customer).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteCustomer(string customerCode)
        {
            try
            {
                var customer = db.AcCustomers.FirstOrDefault(a => a.CUSTOMER_CODE.Equals(customerCode));
                if (customer != null)
                {
                    db.AcCustomers.Remove(customer);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExistingCustomerCode(string customerCode)
        {
            return db.AcCustomers.Count(a => a.CUSTOMER_CODE == customerCode) == 1 ? true : false;
        }

        #endregion

        #region Vendor

        public List<AcVendorView> GetVendors(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "v.vendor_name", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "v.vendor_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var selectCmd = @"v.*, r.region_name";
            var fromCmd = $@"ac_vendor v left outer join ac_vendor_region r on v.region_code = r.region_code";
            var result = Utils.GetSqlQueryResult<AcVendorView>(fromCmd, selectCmd, dbParas);
            return result.ToList();
        }

        public List<AcVendorMapping> GetVendorMappings(string searchValue)
        {
            return db.AcVendorMappings.Where(a => a.VENDOR_CODE.Contains(searchValue) || a.VENDOR_NAME.Contains(searchValue)).ToList();
        }

        public List<AcVendorRegion> GetVendorRegions()
        {
            var result = Utils.GetSqlQueryResult<AcVendorRegion>("ac_vendor_region", "*", new List<DbParameter>());
            return result.ToList();
        }

        public AcVendor GetVendor(string vendorCode)
        {
            var vendor = db.AcVendors.FirstOrDefault(a => a.VENDOR_CODE == vendorCode);
            if (vendor == null)
                return new AcVendor();
            else
                return vendor;
        }

        public void AddVendor(AcVendor vendor)
        {
            try
            {
                db.AcVendors.Add(vendor);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateVendor(AcVendor vendor)
        {
            try
            {
                db.Entry(vendor).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteVendor(string vendorCode)
        {
            try
            {
                var vendor = db.AcVendors.FirstOrDefault(a => a.VENDOR_CODE.Equals(vendorCode));
                if (vendor != null)
                {
                    db.AcVendors.Remove(vendor);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExistingVendorCode(string vendorCode)
        {
            return db.AcVendors.Count(a => a.VENDOR_CODE == vendorCode) == 1 ? true : false;
        }

        #endregion

        #region Ledger Account / GL_ACCSUM / GL_ACCASSS

        public List<LedgerAccount> GetLedgerAccounts()
        {
            var result = Utils.GetSqlQueryResult<LedgerAccount>("ac_ledger_account", "*", new List<DbParameter>());
            return result.OrderBy(a => a.AC_CODE).ToList();
        }

        public List<LedgerAccount> GetLedgerAccounts(string searchValue)
        {
            var result = Utils.GetSqlQueryResult<LedgerAccount>("ac_ledger_account", "*", new List<DbParameter>
            {
                new DbParameter { FieldName = "ac_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "ac_name", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            });
            return result.OrderBy(a => a.AC_CODE).ToList();
        }

        public void CalcAccountSummary(int year, int period)
        {
            var accounts = db.LedgerAccounts.ToList();
            var lastPeriods = new List<GLAccsum>();
            var results = new List<GLAccsum>();
            if (period == 1)
                lastPeriods = db.GLAccsums.Where(a => a.YEAR == year - 1 && a.PERIOD == 12).ToList();
            else
                lastPeriods = db.GLAccsums.Where(a => a.YEAR == year && a.PERIOD == period - 1).ToList();

            var id = lastPeriods.Select(a => a.ID).Max() + 1;
            var vouchers = db.GLVouchers.Where(a => a.YEAR == year && a.PERIOD >= period && a.IBOOK == 1).ToList();

            foreach (var lastPeriod in lastPeriods)
            {
                var account = accounts.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString()).FirstOrDefault();
                int currentPeriod = period;
                decimal amt = lastPeriod.AMT_END;
                while (currentPeriod <= 12)
                {
                    var amtDr = vouchers.Where(a => a.AC_CODE.StartsWith(lastPeriod.AC_CODE.ToString()) && a.PERIOD == currentPeriod).Sum(a => a.DR_AMT);
                    var amtCr = vouchers.Where(a => a.AC_CODE.StartsWith(lastPeriod.AC_CODE.ToString()) && a.PERIOD == currentPeriod).Sum(a => a.CR_AMT);
                    var amtEnd = account.CRDR_BALANCE == "Dr" ? amt + (amtDr - amtCr) : amt + (amtCr - amtDr);
                    //special case for profit & loss account 3131
                    if (account.AC_CODE == "3131")
                        amtEnd = amt + (amtDr - amtCr);

                    results.Add(new GLAccsum
                    {
                        ID = id,
                        YEAR = year,
                        PERIOD = currentPeriod,
                        AC_CODE = lastPeriod.AC_CODE,
                        CURRENCY = lastPeriod.CURRENCY,
                        AMT_BEG = amt,
                        AMT_DR = amtDr,
                        AMT_CR = amtCr,
                        AMT_END = amtEnd,
                        AMT_BEG_F = 0,
                        AMT_DR_F = 0,
                        AMT_CR_F = 0,
                        AMT_END_F = 0,
                        END_IND = amtEnd == 0 ? "-" : amtEnd > 0 ? "Dr" : "Cr",
                        BEG_IND = amt == 0 ? "-" : amt > 0 ? "Dr" : "Cr",
                    });
                    amt = amtEnd;
                    id++;
                    currentPeriod++;
                }
            }

            foreach (var record in results.Where(a => a.AMT_BEG < 0 || a.AMT_END < 0))
            {
                if (record.AMT_BEG < 0)
                {
                    record.AMT_BEG = record.AMT_BEG * -1;
                    record.BEG_IND = record.BEG_IND == "Dr" ? "Cr" : "Dr";
                }
                if (record.AMT_END < 0)
                {
                    record.AMT_END = record.AMT_END * -1;
                    record.END_IND = record.END_IND == "Dr" ? "Cr" : "Dr";
                }
            }
            db.Database.ExecuteSqlCommand($"delete from ac_gl_accsum where year = {year} and period >= {period}");
            db.GLAccsums.AddRange(results);
            db.SaveChanges();
        }

        //assistType: person / customer / vendor
        private GLAccass GetAccountAssist(List<GLVoucher> vouchers, string crDrBalance, decimal amtEnd, string assistId, string assistType)
        {
            var result = new GLAccass();
            if (assistType == "customer" || assistType == "vendor")
            {
                decimal amtDr = 0;
                decimal amtCr = 0;
                if (assistType == "customer")
                {
                    amtDr = vouchers.Where(a => a.CUSTOMER_CODE == assistId).Sum(a => a.DR_AMT);
                    amtCr = vouchers.Where(a => a.CUSTOMER_CODE == assistId).Sum(a => a.CR_AMT);
                }
                else if (assistType == "vendor")
                {
                    amtDr = vouchers.Where(a => a.VENDOR_CODE == assistId).Sum(a => a.DR_AMT);
                    amtCr = vouchers.Where(a => a.VENDOR_CODE == assistId).Sum(a => a.CR_AMT);
                }
                else
                {
                    amtDr = vouchers.Sum(a => a.DR_AMT);
                    amtCr = vouchers.Sum(a => a.CR_AMT);
                }
                var amtEnd2 = crDrBalance == "Dr" ? amtEnd + (amtDr - amtCr) : amtEnd + (amtCr - amtDr);

                result.VENDOR_ID = assistType == "vendor" ? assistId : "";
                result.CUSTOMER_ID = assistType == "customer" ? assistId : "";
                result.AMT_BEG = amtEnd;
                result.AMT_DR = amtDr;
                result.AMT_CR = amtCr;
                result.AMT_END = amtEnd2;
                result.BEG_IND = amtEnd == 0 ? "-" : amtEnd > 0 ? "Dr" : "Cr";
                result.END_IND = amtEnd2 == 0 ? "-" : amtEnd2 > 0 ? "Dr" : "Cr";
            }
            return result;
        }

        private class AccountAssist
        {
            public string AC_CODE { get; set; }
            public string PERSON_CODE { get; set; }
            public string CUSTOMER_CODE { get; set; }
            public string VENDOR_CODE { get; set; }
        }

        private void AddNewAccountAssist(int year)
        {
            var selectCmd = @"distinct ac_code, person_code, customer_code, vendor_code";
            var fromCmd = $@"ac_gl_voucher where year = {year} and ac_code not like '1002%' and
                (person_code is not null or customer_code is not null or vendor_code is not null)";
            var vouchers = Utils.GetSqlQueryResult<AccountAssist>(fromCmd, selectCmd, new List<DbParameter>());
            var records = new List<GLAccass>();
            var id = db.GLAccasses.Where(a => a.YEAR == year).Select(a => a.ID).Max() + 1;

            foreach (var voucher in vouchers)
            {
                selectCmd = "ac_code";
                fromCmd = $@"ac_gl_accass where year = {year} and ac_code = '{voucher.AC_CODE}' and 
                    (person_id = '{voucher.PERSON_CODE}' or customer_id = '{voucher.CUSTOMER_CODE}' or vendor_id = '{voucher.VENDOR_CODE}')";
                if (Utils.GetSqlQueryResult<string>(fromCmd, selectCmd, new List<DbParameter>()).Count() == 0)
                {
                    var period = 1;
                    while (period <= 12)
                    {
                        records.Add(new GLAccass
                        {
                            ID = id,
                            YEAR = year,
                            PERIOD = period,
                            AC_CODE = int.Parse(voucher.AC_CODE),
                            CURRENCY = "",
                            DEPT_ID = "",
                            PERSON_ID = voucher.PERSON_CODE,
                            CUSTOMER_ID = voucher.CUSTOMER_CODE,
                            VENDOR_ID = voucher.VENDOR_CODE,
                            AMT_BEG = 0,
                            AMT_DR = 0,
                            AMT_CR = 0,
                            AMT_END = 0,
                            BEG_IND = "-",
                            END_IND = "-",
                        });
                        id++; period++;
                    }
                }
            }

            if (records.Count > 0)
            {
                db.GLAccasses.AddRange(records);
                db.SaveChanges();
            }
        }

        public void CalcAccountAssist(int year, int period)
        {
            //Add records to table AC_GL_ACCASS if not exist
            AddNewAccountAssist(year);
            var accounts = db.LedgerAccounts.ToList();
            var lastPeriods = new List<GLAccass>();
            var results = new List<GLAccass>();
            if (period == 1)
                lastPeriods = db.GLAccasses.Where(a => a.YEAR == year - 1 && a.PERIOD == 12).ToList();
            else
                lastPeriods = db.GLAccasses.Where(a => a.YEAR == year && a.PERIOD == period - 1).ToList();

            var id = db.GLAccasses.Where(a => a.YEAR == year).Select(a => a.ID).Max() + 1;
            var fromCmd = $@"ac_gl_voucher where year = {year} and period >= {period} and ibook = 1 and ac_code not like '1002%' and
                (person_code is not null or customer_code is not null or vendor_code is not null)";
            var vouchers = Utils.GetSqlQueryResult<GLVoucher>(fromCmd, "*", new List<DbParameter>());

            var customerIds = vouchers.Where(a => !string.IsNullOrEmpty(a.CUSTOMER_CODE)).Select(a => a.CUSTOMER_CODE).Distinct().ToList();
            var vendorIds = vouchers.Where(a => !string.IsNullOrEmpty(a.VENDOR_CODE)).Select(a => a.VENDOR_CODE).Distinct().ToList();

            foreach (var lastPeriod in lastPeriods)
            {
                var account = accounts.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString()).FirstOrDefault();
                int currentPeriod = period;
                decimal amt = lastPeriod.AMT_END;
                var perviousPeriod = lastPeriod;
                while (currentPeriod <= 12)
                {
                    var record = new GLAccass();
                    decimal amtDr = 0;
                    decimal amtCr = 0;
                    if (!string.IsNullOrEmpty(lastPeriod.CUSTOMER_ID))
                    {
                        amtDr = vouchers.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString() && a.PERIOD == currentPeriod && a.CUSTOMER_CODE == lastPeriod.CUSTOMER_ID).Sum(a => a.DR_AMT);
                        amtCr = vouchers.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString() && a.PERIOD == currentPeriod && a.CUSTOMER_CODE == lastPeriod.CUSTOMER_ID).Sum(a => a.CR_AMT);
                    }
                    else if (!string.IsNullOrEmpty(lastPeriod.VENDOR_ID))
                    {
                        amtDr = vouchers.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString() && a.PERIOD == currentPeriod && a.VENDOR_CODE == lastPeriod.VENDOR_ID).Sum(a => a.DR_AMT);
                        amtCr = vouchers.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString() && a.PERIOD == currentPeriod && a.VENDOR_CODE == lastPeriod.VENDOR_ID).Sum(a => a.CR_AMT);
                    }
                    else
                    {
                        amtDr = vouchers.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString() && a.PERIOD == currentPeriod && a.PERSON_CODE == lastPeriod.PERSON_ID).Sum(a => a.DR_AMT);
                        amtCr = vouchers.Where(a => a.AC_CODE == lastPeriod.AC_CODE.ToString() && a.PERIOD == currentPeriod && a.PERSON_CODE == lastPeriod.PERSON_ID).Sum(a => a.CR_AMT);
                    }
                    //decimal amtEnd = account.CRDR_BALANCE == "Dr" ? amt + (amtDr - amtCr) : amt + (amtCr - amtDr);

                    //log.Debug($"ID: {id}, {currentPeriod}, {lastPeriod.AC_CODE}, {lastPeriod.PERSON_ID}, {lastPeriod.CUSTOMER_ID}, {lastPeriod.VENDOR_ID}, DR: {amtDr} CR: {amtCr} END: {amtEnd}");

                    record.ID = id;
                    record.YEAR = year;
                    record.PERIOD = currentPeriod;
                    record.AC_CODE = lastPeriod.AC_CODE;
                    record.CURRENCY = lastPeriod.CURRENCY;
                    record.DEPT_ID = lastPeriod.DEPT_ID;
                    record.PERSON_ID = lastPeriod.PERSON_ID;
                    record.CUSTOMER_ID = lastPeriod.CUSTOMER_ID;
                    record.VENDOR_ID = lastPeriod.VENDOR_ID;
                    record.AMT_BEG = perviousPeriod.END_IND == "Cr" ? amt * -1 : amt;
                    record.AMT_DR = amtDr;
                    record.AMT_CR = amtCr;
                    record.AMT_END = record.AMT_BEG + (amtDr - amtCr);
                    //record.BEG_IND = amt == 0 ? "-" : amt > 0 ? "Dr" : "Cr";
                    //record.END_IND = amtEnd == 0 ? "-" : amtEnd > 0 ? "Dr" : "Cr";
                    results.Add(record);

                    amt = record.AMT_END;
                    id++; currentPeriod++;
                    perviousPeriod = record;
                }
            }

            foreach (var record in results)
            {
                if (record.AMT_BEG < 0)
                {
                    record.AMT_BEG = record.AMT_BEG * -1;
                    record.BEG_IND = "Cr";
                }
                else
                {
                    if (record.AMT_BEG == 0)
                        record.BEG_IND = "-";
                    else
                        record.BEG_IND = "Dr";
                }

                if (record.AMT_END < 0)
                {
                    record.AMT_END = record.AMT_END * -1;
                    record.END_IND = "Cr";
                }
                else
                {
                    if (record.AMT_BEG == 0)
                        record.END_IND = "-";
                    else
                        record.END_IND = "Dr";
                }
            }
            db.Database.ExecuteSqlCommand($"delete from ac_gl_accass where year = {year} and period >= {period}");
            db.GLAccasses.AddRange(results);
            db.SaveChanges();
        }

        #endregion

        #region Receivable / Payable

        public List<AcArApInvoice> GetInvoices(DateTime dateFrom, DateTime dateTo, string vouchType)
        {
            var invoices = db.AcArApInvoices.Where(a => a.VOUCH_DATE >= dateFrom && a.VOUCH_DATE <= dateTo && a.VOUCH_TYPE == vouchType).ToList();
            var customers = db.AcCustomerMappings.ToList();
            var vendors = db.AcVendorMappings.ToList();
            var persons = db.AcPersonMappings.ToList();
            foreach (var invoice in invoices)
            {
                if (vouchType == "AR")
                {
                    var customer = customers.Where(a => a.CUSTOMER_CODE == invoice.CUSTOMER_CODE).FirstOrDefault();
                    if (customer != null)
                    {
                        invoice.CUSTOMER_NAME = customer.CUSTOMER_NAME;
                        invoice.CUSTOMER_CODE_MAPPING = customer.CODE;
                    }
                }
                else if (vouchType == "AP")
                {
                    var vendor = vendors.Where(a => a.VENDOR_CODE == invoice.CUSTOMER_CODE).FirstOrDefault();
                    if (vendor != null)
                    {
                        invoice.CUSTOMER_NAME = vendor.VENDOR_NAME;
                        invoice.CUSTOMER_CODE_MAPPING = vendor.CODE;
                    }
                }
                var person = persons.Where(a => a.PERSON_CODE == invoice.PERSON_CODE).FirstOrDefault();
                if (person != null)
                    invoice.PERSON_NAME = person.PERSON_NAME;
            }

            return invoices;
        }

        public AcArApInvoice GetArApInvoice(string id)
        {
            return db.AcArApInvoices.Find(id);
        }

        public void SaveArApInvoice(AcArApInvoice model)
        {
            if (db.AcArApInvoices.Count(a => a.ID == model.ID) > 0)
            {
                model.MODIFY_DATE = DateTime.Now;
                db.Entry(model).State = EntityState.Modified;
            }
            else
            {
                model.CREATE_DATE = DateTime.Now;
                model.MODIFY_DATE = DateTime.Now;
                db.AcArApInvoices.Add(model);
            }

            db.SaveChanges();
        }

        public void DeleteArApInvoice(string id)
        {
            var record = db.AcArApInvoices.Find(id);
            db.AcArApInvoices.Remove(record);
            db.SaveChanges();
        }

        public bool IsExistingArApInvoiceNo(string invNo, string vouchType)
        {
            return db.AcArApInvoices.Count(a => a.INV_NO == invNo && a.VOUCH_TYPE == vouchType) > 0;
        }

        #endregion

        #region Voucher

        public List<int> GetVoucherAccountYears()
        {
            return db.GLVouchers.Select(a => a.YEAR).Distinct().OrderByDescending(a => a).ToList();
        }

        public List<VoucherView> GetVouchers(DateTime dateFrom, DateTime dateTo)
        {
            var vouchers = db.GLVouchers.Where(a => a.VOUCHER_DATE >= dateFrom && a.VOUCHER_DATE <= dateTo && a.PERIOD >= 1 && a.PERIOD <= 12).ToList();
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
                            DESC_TEXT = voucherRecord.Select(a => a.DESC_TEXT).ToList().FormatString("/"),
                            DR_AMT = voucherRecord.Sum(a => a.DR_AMT),
                            CR_AMT = voucherRecord.Sum(a => a.CR_AMT),
                            CBILL = voucherRecord.First().CBILL,
                            CCHECK = voucherRecord.First().CCHECK,
                            IBOOK = voucherRecord.First().IBOOK,
                        });
                    }
                }
            }

            return results.OrderByDescending(a => a.VOUCHER_DATE).ThenByDescending(a => a.VOUCHER_NO).ToList();
        }

        public List<Voucher> GetVoucher(int year, int period, int voucherNo)
        {
            var selectCmd = "ac.ac_name, ac.ac_code, v.id, v.year, v.period, v.voucher_no, v.voucher_type, v.line_no, v.desc_text," +
                "v.dr_amt, v.cr_amt, v.inv_no, v.inv_date, v.customer_code, v.vendor_code, v.dep_code, v.person_code, v.voucher_date," +
                "v.related_ac, v.cbill, v.ccheck, v.ccashier, v.ibook";
            var fromCmd = $"ac_gl_voucher v left outer join ac_ledger_account ac on v.ac_code = ac.ac_code " +
                $"where v.year = {year} and v.period = {period} and v.voucher_no = {voucherNo}";

            var vouchers = Utils.GetSqlQueryResult<Voucher>(fromCmd, selectCmd, new List<DbParameter>());
            //var accounts = db.LedgerAccounts.ToList();
            //var vouchers = db.GLVouchers.Where(a => a.YEAR == year && a.PERIOD == period && a.VOUCHER_NO == voucherNo).ToList();
            //foreach (var voucher in vouchers)
            //    voucher.AC_NAME = accounts.Where(a => a.AC_CODE == voucher.AC_CODE).FirstOrDefault().AC_NAME;

            return vouchers.OrderBy(a => a.LINE_NO).ToList();
        }

        public int GetVoucherNo(DateTime voucherDate)
        {
            if (db.GLVouchers.Count(a => a.YEAR == voucherDate.Year && a.PERIOD == voucherDate.Month) > 0)
                return db.GLVouchers.Where(a => a.YEAR == voucherDate.Year && a.PERIOD == voucherDate.Month)
                    .Select(a => a.VOUCHER_NO ?? 0).Max() + 1;
            else
                return 1;
        }

        public void SaveVoucher(VoucherModel model)
        {
            var records = db.GLVouchers.Where(a => a.YEAR == model.YEAR && a.PERIOD == model.PERIOD && a.VOUCHER_NO == model.VOUCHER_NO);
            if (records.Count() > 0)
                db.GLVouchers.RemoveRange(records);

            var ID = db.GLVouchers.Select(a => a.ID).Max() + 1;
            foreach (var voucher in model.Vouchers)
            {
                voucher.ID = ID;
                db.GLVouchers.Add(voucher);
                ID++;
                //log.Debug(voucher.ID);
            }

            db.SaveChanges();
        }

        public void DeleteVoucher(int year, int period, int voucherNo)
        {
            var vouchers = db.GLVouchers.Where(a => a.YEAR == year && a.PERIOD == period && a.VOUCHER_NO == voucherNo);
            if (vouchers.Count() > 0)
                db.GLVouchers.RemoveRange(vouchers);

            db.SaveChanges();
        }

        public void ApproveVouchers(GLVoucher[] vouchers)
        {
            foreach (var voucher in vouchers)
            {
                var records = db.GLVouchers.Where(a => a.YEAR == voucher.YEAR && a.PERIOD == voucher.PERIOD && a.VOUCHER_NO == voucher.VOUCHER_NO);
                foreach (var record in records)
                {
                    record.CCHECK = voucher.CCHECK;
                    record.IBOOK = 1;
                    db.Entry(record).State = EntityState.Modified;
                }
            }
            db.SaveChanges();
        }

        public List<GLVoucher> GetProfitLossVouchers(int year, int period)
        {
            var accounts = db.LedgerAccounts.ToList();
            var vouchers = db.GLVouchers.Where(a => a.YEAR == year && a.PERIOD == period && a.AC_CODE.StartsWith("5")).ToList();
            var plVouchers = new List<GLVoucher>();

            foreach (var acCode in vouchers.Select(a => a.AC_CODE).Distinct().OrderBy(a => a))
            {
                var account = accounts.Where(a => a.AC_CODE == acCode).FirstOrDefault();
                var voucher = vouchers.Where(a => a.AC_CODE == acCode).ToList();

                plVouchers.Add(new GLVoucher
                {
                    AC_CODE = acCode,
                    AC_NAME = account.AC_NAME,
                    YEAR = year,
                    PERIOD = period,
                    DR_AMT = voucher.Sum(a => a.CR_AMT),
                    CR_AMT = voucher.Sum(a => a.DR_AMT),
                    DEP_CODE = voucher.FirstOrDefault().DEP_CODE,
                    PERSON_CODE = voucher.FirstOrDefault().PERSON_CODE,
                    CUSTOMER_CODE = voucher.FirstOrDefault().CUSTOMER_CODE,
                    VENDOR_CODE = voucher.FirstOrDefault().VENDOR_CODE,
                    INV_DATE = voucher.FirstOrDefault().INV_DATE,
                    INV_NO = voucher.FirstOrDefault().INV_NO,
                });
            }
            return plVouchers;
        }

        #endregion

        #region Reports

        public List<LedgerAccountView> GetLedgerAccountSummary(int year, int period)
        {
            var selectCmd = @"ac.*,
                case ac.crdr_balance when 'Dr' then nvl(sum.amt_beg, 0) else 0 end as open_dr,
                case ac.crdr_balance when 'Cr' then nvl(sum.amt_beg, 0) else 0 end as open_cr,
                nvl(sum.amt_dr, 0) current_dr, nvl(sum.amt_cr, 0) current_cr,
                0 as close_dr, 0 as close_cr";
            var fromCmd = $@"ac_ledger_account ac left outer join ac_gl_accsum sum on ac.ac_code = sum.ac_code and sum.year = {year} and sum.period = {period}";
            var result = Utils.GetSqlQueryResult<LedgerAccountView>(fromCmd, selectCmd, new List<DbParameter>());
            result = result.Where(a =>
                a.OPEN_DR != 0 || a.OPEN_CR != 0 ||
                a.CURRENT_DR != 0 || a.CURRENT_CR != 0 ||
                a.CLOSE_DR != 0 || a.CLOSE_CR != 0)
                .OrderBy(a => a.AC_CODE).ToList();

            //special case for 3131 本年利润
            if (result.Count(a => a.AC_CODE == "3131") > 0)
            {
                var ac3131 = result.Where(a => a.AC_CODE == "3131").FirstOrDefault();
                var amtDr = ac3131.OPEN_DR;
                var amtCr = ac3131.OPEN_CR;
                ac3131.OPEN_DR = amtCr;
                ac3131.OPEN_CR = amtDr;
            }

            foreach (var item in result)
            {
                var amt = item.OPEN_DR - item.OPEN_CR + item.CURRENT_DR - item.CURRENT_CR;
                if (amt > 0)
                {
                    item.CLOSE_DR = amt;
                    item.CLOSE_CR = 0;
                }
                else
                {
                    item.CLOSE_DR = 0;
                    item.CLOSE_CR = amt * -1;
                }
            }

            return result;
        }

        public List<LedgerAccountBegEndAmount> GetLedgerAccountBegEndAmount(int year, int period, bool isYearStart = true)
        {
            var accounts = db.LedgerAccounts.ToList();
            var selectCmd = "ac_code, amt_beg, amt_end, beg_ind, end_ind";
            if (isYearStart)
            {
                var fromCmd = $"ac_gl_accsum where year = {year} and period = 1";
                var begResult = Utils.GetSqlQueryResult<LedgerAccountBegEndAmount>(fromCmd, selectCmd, new List<DbParameter>()).ToList();

                fromCmd = $"ac_gl_accsum where year = {year} and period = {period}";
                var endResult = Utils.GetSqlQueryResult<LedgerAccountBegEndAmount>(fromCmd, selectCmd, new List<DbParameter>()).ToList();

                foreach (var item in begResult)
                {
                    item.AMT_END = endResult.Where(a => a.AC_CODE == item.AC_CODE).Select(a => a.AMT_END).FirstOrDefault();

                    if (item.BEG_IND == "Cr")
                        item.AMT_BEG = item.AMT_BEG * -1;
                    if (item.END_IND == "Cr")
                        item.AMT_END = item.AMT_END * -1;

                    //if (accounts.Where(a => a.AC_CODE == item.AC_CODE.ToString()).FirstOrDefault().CRDR_BALANCE == "Cr")
                    //{
                    //    item.AMT_BEG = item.AMT_BEG * -1;
                    //    item.AMT_END = item.AMT_END * -1;
                    //}
                }
                return begResult;
            }
            else
            {
                var fromCmd = $"ac_gl_accsum where year = {year} and period = {period}";
                var result = Utils.GetSqlQueryResult<LedgerAccountBegEndAmount>(fromCmd, selectCmd, new List<DbParameter>()).ToList();
                return result;
            }
        }

        public List<LedgerAccountBegEndAmount> GetProfitLossSummary(int year, int period)
        {
            var results = new List<LedgerAccountBegEndAmount>();
            var gLAccsums = db.GLAccsums.Where(a => a.YEAR == year && a.PERIOD <= period && a.AC_CODE.ToString().StartsWith("5")).ToList();
            foreach (var acCode in gLAccsums.Select(a => a.AC_CODE).Distinct())
            {
                results.Add(new LedgerAccountBegEndAmount
                {
                    AC_CODE = acCode.ToString(),
                    AMT_BEG = gLAccsums.Where(a => a.AC_CODE == acCode && a.PERIOD == period).Select(a => a.AMT_DR).FirstOrDefault(),
                    AMT_END = gLAccsums.Where(a => a.AC_CODE == acCode).Sum(a => a.AMT_DR),
                });
            }
            return results;
        }

        public List<BankTransaction> GetBankTransaction(int year, int period)
        {
            var results = new List<BankTransaction>();
            var acCodes = db.Database.SqlQuery<string>("select distinct ac_code from ac_gl_accsum where ac_code like '10020%' " +
                $"and year = {year} and period <= {period} and (amt_beg <> 0 or amt_dr <> 0 or amt_cr <> 0 or amt_end <> 0)").ToList();
            var accounts = db.LedgerAccounts.Where(a => acCodes.Contains(a.AC_CODE)).ToList();

            foreach (var acCode in acCodes)
            {
                int code = int.Parse(acCode);
                var gLAccsums = db.GLAccsums.Where(a => a.YEAR == year && a.PERIOD <= period && a.AC_CODE == code).ToList();
                var vouchers = db.GLVouchers.Where(a => a.YEAR == year && a.PERIOD == period && a.AC_CODE == acCode).ToList();
                var account = accounts.Where(a => a.AC_CODE == acCode).FirstOrDefault();
                var openBalance = gLAccsums.Where(a => a.PERIOD == period).Select(a => a.AMT_BEG).First();
                var closeBalance = gLAccsums.Where(a => a.PERIOD == period).Select(a => a.AMT_END).First();
                results.Add(new BankTransaction
                {
                    AC_CODE = acCode,
                    AC_NAME = account.AC_NAME,
                    DrCr = account.CRDR_BALANCE,
                    DESC_TEXT = "月初余额",
                    DR_AMT = 0,
                    CR_AMT = 0,
                    BALANCE = openBalance
                });

                foreach (var voucher in vouchers.OrderBy(a => a.VOUCHER_DATE))
                {
                    openBalance = voucher.DR_AMT - voucher.CR_AMT + openBalance;

                    results.Add(new BankTransaction
                    {
                        AC_CODE = acCode,
                        AC_NAME = account.AC_NAME,
                        DrCr = account.CRDR_BALANCE,
                        YEAR = year,
                        PERIOD = period,
                        Day = voucher.VOUCHER_DATE.Day,
                        DESC_TEXT = voucher.DESC_TEXT,
                        VOUCHER_NO = voucher.VOUCHER_NO ?? 0,
                        DR_AMT = voucher.DR_AMT,
                        CR_AMT = voucher.CR_AMT,
                        BALANCE = openBalance
                    });
                }

                results.Add(new BankTransaction
                {
                    AC_CODE = acCode,
                    AC_NAME = account.AC_NAME,
                    DrCr = account.CRDR_BALANCE,
                    DESC_TEXT = "当前累计",
                    DR_AMT = gLAccsums.Sum(a => a.AMT_DR),
                    CR_AMT = gLAccsums.Sum(a => a.AMT_CR),
                    BALANCE = closeBalance
                });
            }
            return results;
        }

        public List<AgingReport> GetAgingReport(int year, int period, int periodCount, string reportType)
        {
            int fromYear = year;
            int fromPeriod = period - periodCount;
            if (fromPeriod < 1)
            {
                fromYear = year - 1;
                fromPeriod = 12 + fromPeriod;
            }

            string sqlQuery = $@"select YEAR, period, c.customer_code, c.customer_name, beg_ind, amt_beg, amt_dr, amt_cr, 
                case when end_ind in ('Dr', '-') then 'Dr' else 'Cr' end end_ind, amt_end
                from ac_gl_accass a join ac_customer c on a.customer_id = c.customer_code
                where (to_char(year) || lpad(to_char(period), 2, '0')) >= '{fromYear.ToString()}{fromPeriod.ToString().PadLeft(2, '0')}' 
                and (to_char(year) || lpad(to_char(period), 2, '0')) <= '{year.ToString()}{period.ToString().PadLeft(2, '0')}'
                and customer_id in (select customer_id from ac_gl_accass where year = {year} and period = {period} and amt_end <> 0)
                order by end_ind desc, customer_id, year desc, period desc";
            var results = db.Database.SqlQuery<AgingReport>(sqlQuery).ToList();
            return results;
        }

        #endregion

    }
}
