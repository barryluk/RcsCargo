using DbUtils.Models.MasterRecords;
using System;
using System.Collections.Generic;
using Oracle.ManagedDataAccess.Client;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DbUtils.Models.Air;
using System.Data.Entity;
using System.Data.SqlTypes;

namespace DbUtils
{
    public class MasterRecords
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        RcsFreightDBContext db;
        public MasterRecords() 
        {
            db = new RcsFreightDBContext();
        }

        #region Country

        public List<CountryView> GetCountriesView()
        {
            var sqlCmd = @"select country_code, country_desc from country";
            return db.Database.SqlQuery<CountryView>(sqlCmd).ToList();
        }

        public List<Country> GetCountries(string searchValue)
        {
            return db.Countries.Where(a => a.COUNTRY_CODE.StartsWith(searchValue) || a.COUNTRY_DESC.StartsWith(searchValue))
                    .Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public Country GetCountry(string countryCode)
        {
            var country = db.Countries.FirstOrDefault(a => a.COUNTRY_CODE == countryCode);
            if (country == null)
                return new Country();
            else
                return country;
        }

        #endregion

        #region Port

        public List<PortView> GetPortsView()
        {
            var sqlCmd = @"select a.port_code, b.port_desc from
                (select port_code from port where modify_date > sysdate - 30
                union select dest_code from a_mawb where create_date > sysdate - 730
                union select origin_code from a_hawb where create_date > sysdate - 730
                union select dest_code from a_hawb where create_date > sysdate - 730) a, port b
                where a.port_code = b.port_code";
            return db.Database.SqlQuery<PortView>(sqlCmd).ToList();
        }

        public List<Port> GetPorts(string searchValue)
        {
            return db.Ports.Where(a => a.PORT_CODE.StartsWith(searchValue) || a.PORT_DESC.StartsWith(searchValue))
                    .Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public Port GetPort(string portCode)
        {
            var port = db.Ports.FirstOrDefault(a => a.PORT_CODE == portCode);
            if (port == null)
                return new Port();
            else
                return port;
        }

        #endregion

        #region Airline

        public List<AirlineView> GetAirlinesView()
        {
            var sqlCmd = @"select a.airline_code, b.airline_desc from
                (select airline_code from airline where modify_date > sysdate - 30
                union select airline_code from a_mawb) a, airline b
                where a.airline_code = b.airline_code";
            return db.Database.SqlQuery<AirlineView>(sqlCmd).ToList();
        }

        public List<Airline> GetAirlines(string searchValue)
        {
            return db.Airlines.Where(a => a.AIRLINE_CODE.StartsWith(searchValue) || a.AIRLINE_DESC.StartsWith(searchValue))
                    .Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public Airline GetAirline(string airlineCode)
        {
            var airline = db.Airlines.FirstOrDefault(a => a.AIRLINE_CODE == airlineCode);
            if (airline == null)
                return new Airline();
            else
                return airline;
        }

        #endregion

        #region Charges

        public List<ChargeView> GetChargesView()
        {
            var sqlCmd = @"select a.charge_code, b.charge_desc from 
                (select charge_code from a_invoice_item where inv_no in (select inv_no from a_invoice where create_date > sysdate - 730)
                union select charge_code from charge where modify_date > sysdate - 30)a, charge b
                where a.charge_code = b.charge_code";
            return db.Database.SqlQuery<ChargeView>(sqlCmd).ToList();
        }

        public List<Charge> GetCharges(string searchValue)
        {
            return db.Charges.Where(a => a.CHARGE_CODE.StartsWith(searchValue) || a.CHARGE_DESC.StartsWith(searchValue))
                    .Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public Charge GetCharge(string chargeCode)
        {
            var charge = db.Charges.FirstOrDefault(a => a.CHARGE_CODE == chargeCode);
            if (charge == null)
                return new Charge();
            else
                return charge;
        }

        public List<string> GetChargeTemplates(string companyId)
        {
            return db.ChargeTemplates.Where(a => a.COMPANY_ID.Equals(companyId))
                    .Select(a => a.TEMPLATE_NAME).Distinct().ToList();
        }

        public List<ChargeTemplate> GetChargeTemplate(string templateName, string companyId)
        {
            return db.ChargeTemplates.Where(a => a.COMPANY_ID.Equals(companyId) && a.TEMPLATE_NAME == templateName).ToList();
        }

        #endregion

        #region Currency

        public List<Currency> GetCurrencies(string companyId)
        {
            return db.Currencies.Where(a => a.COMPANY_ID == companyId).ToList();
        }

        public Currency GetCurrency(string currCode, string companyId)
        {
            var currency = db.Currencies.FirstOrDefault(a => a.CURR_CODE == currCode && a.COMPANY_ID == companyId);
            if (currency == null)
                return new Currency();
            else
                return currency;
        }

        #endregion

        #region Customer

        public string GetNewCustomerCode(string customerName)
        {
            string sqlCmd = $"select get_customer_code('{customerName}') from dual";
            return db.Database.SqlQuery<string>(sqlCmd).First();
        }

        public List<string> GetGroupCodes()
        {
            var groupCodes = db.Database.SqlQuery<string>("select distinct group_code from customer where group_code is not null order by group_code");
            return groupCodes.Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public List<CustomerView> GetCustomerViews(string searchValue)
        {
            searchValue = searchValue + "%";
            string sqlCmd = @"select customer.group_code, customer.type, n.customer_code, n.customer_desc, n.branch_code, n.short_desc, 
                n.country_code, n.port_code, c.addr_type, c.addr1, c.addr2, c.addr3, c.addr4, customer.CREATE_DATE, customer.MODIFY_DATE
                from customer
                left outer join customer_name n on customer.customer_code = n.customer_code
                left outer join customer_contact c on n.customer_code = c.customer_code and n.branch_code = c.branch_code and c.addr_type = 'D'
                where n.customer_code like :searchValue or n.customer_desc like :searchValue or n.short_desc like :searchValue";

            var customers = db.Database.SqlQuery<CustomerView>(sqlCmd, new[] { new OracleParameter("searchValue", searchValue) });
            return customers.OrderByDescending(a => a.MODIFY_DATE).Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public List<CustomerView> GetRecentCustomers()
        {
            string sqlCmd = @"select shipper_code customer_code, shipper_desc customer_desc, shipper_branch branch_code, shipper_short_desc short_desc,
                shipper_addr1 addr1, shipper_addr2 addr2, shipper_addr3 addr3, shipper_addr4 addr4
                from a_hawb
                where create_date > sysdate - 60 and frt_mode = 'AE'
                union
                select consignee_code customer_code, consignee_desc customer_desc, consignee_branch branch_code, consignee_short_desc short_desc,
                consignee_addr1 addr1, consignee_addr2 addr2, consignee_addr3 addr3, consignee_addr4 addr4
                from a_hawb
                where create_date > sysdate - 60 and frt_mode = 'AE'
                union
                select n.customer_code, n.customer_desc, n.branch_code, n.short_desc, 
                c.addr1, c.addr2, c.addr3, c.addr4
                from customer
                left outer join customer_name n on customer.customer_code = n.customer_code
                left outer join customer_contact c on n.customer_code = c.customer_code and n.branch_code = c.branch_code and c.addr_type = 'D'
                where modify_date > sysdate - 30";

            var customers = db.Database.SqlQuery<CustomerView>(sqlCmd);
            return customers.Take(Utils.DefaultMaxQueryRows).ToList();
        }

        public Customer GetCustomer(string customerCode)
        {
            var customer = db.Customers.FirstOrDefault(a => a.CUSTOMER_CODE == customerCode);
            if (customer != null)
            {
                customer.CustomerNames = db.CustomerNames.Where(a => a.CUSTOMER_CODE == customerCode).ToList();
                customer.CustomerContacts = db.CustomerContacts.Where(a => a.CUSTOMER_CODE == customerCode).ToList();
            }

            if (customer == null)
                return new Customer();
            else
                return customer;
        }

        public void AddCustomer(Customer customer)
        {
            try
            {
                db.Customers.Add(customer);
                db.CustomerNames.AddRange(customer.CustomerNames);
                db.CustomerContacts.AddRange(customer.CustomerContacts);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCustomer(Customer customer)
        {
            try
            {
                db.Entry(customer).State = EntityState.Modified;
                var customerNames = db.CustomerNames.Where(a => a.CUSTOMER_CODE == customer.CUSTOMER_CODE);
                var customerContacts = db.CustomerContacts.Where(a => a.CUSTOMER_CODE == customer.CUSTOMER_CODE);

                if (customerNames != null)
                {
                    db.CustomerNames.RemoveRange(customerNames);
                    db.CustomerNames.AddRange(customer.CustomerNames);
                }
                if (customerContacts != null)
                {
                    db.CustomerContacts.RemoveRange(customerContacts);
                    db.CustomerContacts.AddRange(customer.CustomerContacts);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        #endregion

        public List<string> GetEquipCodes()
        {
            return db.HawbEquips.Select(a => a.EQUIP_CODE).Distinct().ToList();
        }
    }
}
