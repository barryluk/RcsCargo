using DbUtils.Models.MasterRecords;
using System;
using System.Collections.Generic;
using Oracle.ManagedDataAccess.Client;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbUtils
{
    public class MasterRecords
    {
        RcsFreightDBContext db;
        public MasterRecords() 
        {
            db = new RcsFreightDBContext();
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

        public List<CustomerView> GetCustomerViews(string searchValue)
        {
            searchValue = searchValue + "%";
            string sqlCmd = @"select customer.group_code, customer.type, n.customer_code, n.customer_desc, n.branch_code, n.short_desc, 
                n.country_code, n.port_code, c.addr_type, c.addr1, c.addr2, c.addr3, c.addr4
                from customer
                left outer join customer_name n on customer.customer_code = n.customer_code
                left outer join customer_contact c on n.customer_code = c.customer_code and n.branch_code = c.branch_code and c.addr_type = 'D'
                where n.customer_code like :searchValue or n.customer_desc like :searchValue or n.short_desc like :searchValue";

            var customers = db.Database.SqlQuery<CustomerView>(sqlCmd, new[] { new OracleParameter("searchValue", searchValue) });
            return customers.Take(Utils.DefaultMaxQueryRows).ToList();
        }
    }
}
