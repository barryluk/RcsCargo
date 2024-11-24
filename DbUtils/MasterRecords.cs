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
using System.ComponentModel.Design;
using System.Web.Configuration;

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
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "country_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "country_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Country>("country", "*", dbParas);
            return result.ToList();
        }

        public Country GetCountry(string countryCode)
        {
            var country = db.Countries.FirstOrDefault(a => a.COUNTRY_CODE == countryCode);
            if (country == null)
                return new Country();
            else
                return country;
        }

        public void AddCountry(Country country)
        {
            try
            {
                db.Countries.Add(country);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCountry(Country country)
        {
            try
            {
                db.Entry(country).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteCountry(string countryCode)
        {
            try
            {
                var country = db.Countries.FirstOrDefault(a => a.COUNTRY_CODE.Equals(countryCode));
                if (country != null)
                {
                    db.Countries.Remove(country);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingCountryCode(string countryCode)
        {
            return db.Countries.Count(a => a.COUNTRY_CODE == countryCode) == 1 ? true : false;
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
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "port_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "port_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Port>("port", "*", dbParas);
            return result.ToList();
        }

        public Port GetPort(string portCode)
        {
            var port = db.Ports.FirstOrDefault(a => a.PORT_CODE == portCode);
            if (port == null)
                return new Port();
            else
                return port;
        }

        public void AddPort(Port port)
        {
            try
            {
                db.Ports.Add(port);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdatePort(Port port)
        {
            try
            {
                db.Entry(port).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeletePort(string portCode)
        {
            try
            {
                var port = db.Ports.FirstOrDefault(a => a.PORT_CODE.Equals(portCode));
                if (port != null)
                {
                    db.Ports.Remove(port);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingPortCode(string portCode)
        {
            return db.Ports.Count(a => a.PORT_CODE == portCode) == 1 ? true : false;
        }

        #endregion

        #region Sea Port

        public List<SeaPortView> GetSeaPortsView()
        {
            var sqlCmd = @"select a.port_code, b.port_desc, b.country_code from
                (select port_code from sea_port where modify_date > sysdate - 30
                union select port_code from s_voyage_detail where nvl(arrival_date, departure_date) > sysdate - 730) a, port b
                where a.port_code = b.port_code";
            return db.Database.SqlQuery<SeaPortView>(sqlCmd).ToList();
        }

        public List<SeaPort> GetSeaPorts(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "port_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "port_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<SeaPort>("sea_port", "*", dbParas);
            return result.ToList();
        }

        public SeaPort GetSeaPort(string portCode)
        {
            var port = db.SeaPorts.FirstOrDefault(a => a.PORT_CODE == portCode);
            if (port == null)
                return new SeaPort();
            else
                return port;
        }

        public void AddSeaPort(SeaPort port)
        {
            try
            {
                db.SeaPorts.Add(port);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateSeaPort(SeaPort port)
        {
            try
            {
                db.Entry(port).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteSeaPort(string portCode)
        {
            try
            {
                var port = db.SeaPorts.FirstOrDefault(a => a.PORT_CODE.Equals(portCode));
                if (port != null)
                {
                    db.SeaPorts.Remove(port);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingSeaPortCode(string portCode)
        {
            return db.SeaPorts.Count(a => a.PORT_CODE == portCode) == 1 ? true : false;
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
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "airline_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "airline_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Airline>("airline", "*", dbParas);
            foreach(var item in result)
            {
                item.CUSTOMER_BRANCH = item.BRANCH_CODE;
                item.CUSTOMER_SHORT_DESC = item.SHORT_DESC;
            }
            return result.ToList();
        }

        public Airline GetAirline(string airlineCode)
        {
            var airline = db.Airlines.FirstOrDefault(a => a.AIRLINE_CODE == airlineCode);
            if (airline == null)
                return new Airline();
            else
                return airline;
        }

        public void AddAirline(Airline airline)
        {
            try
            {
                db.Airlines.Add(airline);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateAirline(Airline airline)
        {
            try
            {
                db.Entry(airline).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteAirline(string airlineCode)
        {
            try
            {
                var airline = db.Airlines.FirstOrDefault(a => a.AIRLINE_CODE.Equals(airlineCode));
                if (airline != null)
                {
                    db.Airlines.Remove(airline);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingAirlineCode(string airlineCode)
        {
            return db.Airlines.Count(a => a.AIRLINE_CODE == airlineCode) == 1 ? true : false;
        }

        #endregion

        #region Carrier, Carrier Contract

        public List<CarrierView> GetCarriersView()
        {
            return db.Database.SqlQuery<CarrierView>("select carrier_code, carrier_desc from carrier").ToList();
        }

        public List<Carrier> GetCarriers(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "carrier_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "carrier_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Carrier>("carrier", "*", dbParas);
            return result.ToList();
        }

        public Carrier GetCarrier(string carrierCode)
        {
            var carrier = db.Carriers.FirstOrDefault(a => a.CARRIER_CODE == carrierCode);
            if (carrier == null)
                return new Carrier();
            else
                return carrier;
        }

        public void AddCarrier(Carrier carrier)
        {
            try
            {
                db.Carriers.Add(carrier);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCarrier(Carrier carrier)
        {
            try
            {
                db.Entry(carrier).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteCarrier(string carrierCode)
        {
            try
            {
                var carrier = db.Carriers.FirstOrDefault(a => a.CARRIER_CODE.Equals(carrierCode));
                if (carrier != null)
                {
                    db.Carriers.Remove(carrier);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingCarrierCode(string carrierCode)
        {
            return db.Carriers.Count(a => a.CARRIER_CODE == carrierCode) == 1 ? true : false;
        }

        public List<CarrierContract> GetCarrierContracts()
        {
            return db.CarrierContracts.OrderBy(a => a.CARRIER).ToList();
        }

        #endregion

        #region Vessel

        public List<VesselView> GetVesselsView()
        {
            var sqlCmd = @"select a.ves_code, b.ves_desc from
                (select ves_code from vessel where modify_date > sysdate - 30
                union select ves_code from s_voyage where create_date > sysdate - 730) a, vessel b
                where a.ves_code = b.ves_code";
            return db.Database.SqlQuery<VesselView>(sqlCmd).ToList();
        }

        public List<Vessel> GetVessels(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "ves_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "ves_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Vessel>("vessel", "*", dbParas);
            return result.ToList();
        }

        public Vessel GetVessel(string vesselCode)
        {
            var vessel = db.Vessels.FirstOrDefault(a => a.VES_CODE == vesselCode);
            if (vessel == null)
                return new Vessel();
            else
                return vessel;
        }

        public void AddVessel(Vessel vessel)
        {
            try
            {
                db.Vessels.Add(vessel);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateVessel(Vessel vessel)
        {
            try
            {
                db.Entry(vessel).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteVessel(string vesselCode)
        {
            try
            {
                var vessel = db.Vessels.FirstOrDefault(a => a.VES_CODE.Equals(vesselCode));
                if (vessel != null)
                {
                    db.Vessels.Remove(vessel);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingVesselCode(string vesselCode)
        {
            return db.Vessels.Count(a => a.VES_CODE == vesselCode) == 1 ? true : false;
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
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "charge_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "charge_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Charge>("charge", "*", dbParas);
            return result.ToList();
        }

        public Charge GetCharge(string chargeCode)
        {
            var charge = db.Charges.FirstOrDefault(a => a.CHARGE_CODE == chargeCode);
            if (charge == null)
                return new Charge();
            else
                return charge;
        }

        public void AddCharge(Charge charge)
        {
            try
            {
                db.Charges.Add(charge);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCharge(Charge charge)
        {
            try
            {
                db.Entry(charge).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteCharge(string chargeCode)
        {
            try
            {
                var charge = db.Charges.FirstOrDefault(a => a.CHARGE_CODE.Equals(chargeCode));
                if (charge != null)
                {
                    db.Charges.Remove(charge);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingChargeCode(string chargeCode)
        {
            return db.Charges.Count(a => a.CHARGE_CODE == chargeCode) == 1 ? true : false;
        }

        public List<string> GetChargeTemplates(string companyId)
        {
            return db.ChargeTemplates.Where(a => a.COMPANY_ID.Equals(companyId))
                    .Select(a => a.TEMPLATE_NAME).Distinct().ToList();
        }

        public List<ChargeTemplateView> GetChargeTemplates(string searchValue, string companyId)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "template_name", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "company_id", ParaName = "companyId", ParaCompareType = DbParameter.CompareType.equals, Value = companyId },
            };
            var query = Utils.GetSqlQueryResult<ChargeTemplateView>("charge_template", "template_name, charge_code", dbParas);
            var result = new List<ChargeTemplateView>();
            foreach(var templateName in query.Select(a => a.TEMPLATE_NAME).Distinct())
            {
                result.Add(new ChargeTemplateView
                {
                    TEMPLATE_NAME = templateName,
                    CHARGE_CODES = query.Where(a => a.TEMPLATE_NAME.Equals(templateName)).Select(a => a.CHARGE_CODE).JustifyString(),
                });
            }
            return result.ToList();
        }

        public ChargeTemplateView GetChargeTemplate(string templateName, string companyId)
        {
            var result = db.ChargeTemplates.Where(a => a.COMPANY_ID.Equals(companyId) && a.TEMPLATE_NAME == templateName).ToList();
            var template = new ChargeTemplateView();
            if (result.Count > 0)
            {
                template.TEMPLATE_NAME = result.First().TEMPLATE_NAME;
                template.COMPANY_ID = companyId;
                template.Charges = result;
            }
            return template;
        }

        public void AddChargeTemplate(ChargeTemplateView chargeTemplate)
        {
            try
            {
                db.ChargeTemplates.AddRange(chargeTemplate.Charges);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateChargeTemplate(ChargeTemplateView chargeTemplate)
        {
            try
            {
                var records = db.ChargeTemplates.Where(a => 
                    a.COMPANY_ID == chargeTemplate.COMPANY_ID && a.TEMPLATE_NAME == chargeTemplate.TEMPLATE_NAME);
                db.ChargeTemplates.RemoveRange(records);
                db.ChargeTemplates.AddRange(chargeTemplate.Charges);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteChargeTemplate(string chargeCode, string companyId)
        {
            try
            {
                var records = db.ChargeTemplates.Where(a =>
                    a.COMPANY_ID == companyId && a.TEMPLATE_NAME == chargeCode);
                if (records != null)
                {
                    db.ChargeTemplates.RemoveRange(records);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingChargeTemplateName(string templateName)
        {
            return db.ChargeTemplates.Count(a => a.TEMPLATE_NAME == templateName) > 0 ? true : false;
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

        public void AddCurrency(Currency currency)
        {
            try
            {
                db.Currencies.Add(currency);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCurrency(Currency currency)
        {
            try
            {
                db.Entry(currency).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteCurrency(string currencyCode, string companyId)
        {
            try
            {
                var currency = db.Currencies.FirstOrDefault(a => a.CURR_CODE.Equals(currencyCode) && a.COMPANY_ID == companyId);
                if (currency != null)
                {
                    db.Currencies.Remove(currency);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingCurrencyCode(string currencyCode, string companyId)
        {
            return db.Currencies.Count(a => a.CURR_CODE == currencyCode && a.COMPANY_ID == companyId) == 1 ? true : false;
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
            //string sqlCmd = @"select shipper_code customer_code, shipper_desc customer_desc, shipper_branch branch_code, shipper_short_desc short_desc,
            //    shipper_addr1 addr1, shipper_addr2 addr2, shipper_addr3 addr3, shipper_addr4 addr4
            //    from a_hawb
            //    where create_date > sysdate - 60 and frt_mode = 'AE'
            //    union
            //    select consignee_code customer_code, consignee_desc customer_desc, consignee_branch branch_code, consignee_short_desc short_desc,
            //    consignee_addr1 addr1, consignee_addr2 addr2, consignee_addr3 addr3, consignee_addr4 addr4
            //    from a_hawb
            //    where create_date > sysdate - 60 and frt_mode = 'AE'
            //    union
            //    select agent_code customer_code, agent_desc customer_desc, agent_branch branch_code, agent_short_desc short_desc,
            //    agent_addr1 addr1, agent_addr2 addr2, agent_addr3 addr3, agent_addr4 addr4
            //    from a_hawb
            //    where create_date > sysdate - 60 and frt_mode = 'AE'
            //    union
            //    select n.customer_code, n.customer_desc, n.branch_code, n.short_desc, 
            //    c.addr1, c.addr2, c.addr3, c.addr4
            //    from customer
            //    left outer join customer_name n on customer.customer_code = n.customer_code
            //    left outer join customer_contact c on n.customer_code = c.customer_code and n.branch_code = c.branch_code and c.addr_type = 'D'
            //    where modify_date > sysdate - 30";

            string sqlCmd = @"select customer.customer_code, n.customer_desc, n.branch_code, c.short_desc, c.addr1, c.addr2, c.addr3, c.addr4
                from (select shipper_code customer_code from a_hawb where create_date > sysdate - 60 and frt_mode = 'AE'
                union
                select consignee_code customer_code from a_hawb where create_date > sysdate - 60 and frt_mode = 'AE'
                union
                select agent_code customer_code from a_hawb where create_date > sysdate - 60 and frt_mode = 'AE'
                union
                select customer_code from customer where modify_date > sysdate - 30) customer
                join customer_name n on customer.customer_code = n.customer_code
                join customer_contact c on n.customer_code = c.customer_code and n.branch_code = c.branch_code and c.addr_type = 'D'";

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

        #region HAWB Equip

        public List<string> GetEquipCodes()
        {
            return db.HawbEquips.Select(a => a.EQUIP_CODE).Distinct().ToList();
        }

        #endregion

        #region Cargo Unit / Container Size / Sea Charge Qty Unit

        public List<string> GetCargoUnits()
        {
            var sqlCmd = @"select distinct unit from s_booking_cargo where unit in (select base_code from base)";
            return db.Database.SqlQuery<string>(sqlCmd).ToList();
        }

        public List<string> GetContainerSize()
        {
            var sqlCmd = @"select distinct container_size from s_hbl_container where container_size in (select base_code from base)";
            return db.Database.SqlQuery<string>(sqlCmd).ToList();
        }

        public List<string> GetSeaChargeQtyUnit()
        {
            var sqlCmd = @"select distinct qty_unit from s_invoice_item where qty_unit in (select base_code from base)";
            return db.Database.SqlQuery<string>(sqlCmd).ToList();
        }

        #endregion

        #region Commodity

        public List<CommodityView> GetCommoditiesView()
        {
            var sqlCmd = @"select commodity_code, commodity_desc from commodity";
            return db.Database.SqlQuery<CommodityView>(sqlCmd).ToList();
        }

        public List<Commodity> GetCommodities(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "commodity_code", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "commodity_desc", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<Commodity>("commodity", "*", dbParas);
            return result.ToList();
        }

        public Commodity GetCommodity(string commodityCode)
        {
            var commodity = db.Commodities.FirstOrDefault(a => a.COMMODITY_CODE == commodityCode);
            if (commodity == null)
                return new Commodity();
            else
                return commodity;
        }

        public void AddCommodity(Commodity commodity)
        {
            try
            {
                db.Commodities.Add(commodity);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateCommodity(Commodity commodity)
        {
            try
            {
                db.Entry(commodity).State = EntityState.Modified;
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteCommodity(string commodityCode)
        {
            try
            {
                var commodity = db.Commodities.FirstOrDefault(a => a.COMMODITY_CODE.Equals(commodityCode));
                if (commodity != null)
                {
                    db.Commodities.Remove(commodity);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExisitingCommodityCode(string commodityCode)
        {
            return db.Commodities.Count(a => a.COMMODITY_CODE == commodityCode) == 1 ? true : false;
        }

        #endregion

        #region Power Search Setting

        public List<PowerSearchSetting> GetPowerSearchSettings()
        {
            return db.PowerSearchSettings.ToList();
        }

        public List<PowerSearchTemplate> GetPowerSearchTemplates()
        {
            return db.PowerSearchTemplates.ToList();
        }

        #endregion
    }
}
