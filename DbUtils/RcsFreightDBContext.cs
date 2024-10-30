using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using DbUtils.Models.Admin;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;

namespace DbUtils
{
    public class RcsFreightDBContext : DbContext
    {
        public RcsFreightDBContext() : base("name=RcsFreightDbContext") { }

        public DbSet<PowerSearchSetting> PowerSearchSettings { get; set; }
        public DbSet<PowerSearchTemplate> PowerSearchTemplates { get; set; }
        public DbSet<Airline> Airlines { get; set; }
        public DbSet<Currency> Currencies { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Port> Ports { get; set; }
        public DbSet<SeaPort> SeaPorts { get; set; }
        public DbSet<Carrier> Carriers { get; set; }
        public DbSet<Vessel> Vessels { get; set; }
        public DbSet<Charge> Charges { get; set; }
        public DbSet<ChargeTemplate> ChargeTemplates { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerName> CustomerNames { get; set; }
        public DbSet<CustomerContact> CustomerContacts { get; set; }

        public DbSet<Mawb> Mawbs { get; set; }
        public DbSet<MawbCharge> MawbCharges { get; set; }
        public DbSet<MawbDim> MawbDims { get; set; }
        public DbSet<LoadplanBookingList> LoadplanBookingLists { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingPo> BookingPos { get; set; }
        public DbSet<WarehouseHistory> WarehouseHistories { get; set; }
        public DbSet<Hawb> Hawbs { get; set; }
        public DbSet<HawbPo> HawbPos { get; set; }
        public DbSet<HawbCharge> HawbCharges { get; set; }
        public DbSet<HawbDim> HawbDims { get; set; }
        public DbSet<HawbLic> HawbLics { get; set; }
        public DbSet<HawbEquip> HawbEquips { get; set; }
        public DbSet<HawbStatus> HawbStatuses { get; set; }
        public DbSet<HawbDoc> HawbDocs { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceHawb> InvoiceHawbs { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<Pv> Pvs { get; set; }
        public DbSet<PvItem> PvItems { get; set; }
        public DbSet<OtherJob> OtherJobs { get; set; }
        public DbSet<OtherJobCharge> OtherJobCharges { get; set; }

        public DbSet<User> Users { get; set; }
        public DbSet<UserCompany> UserCompanies { get; set; }
        public DbSet<UserGroup> UserGroups { get; set; }
        public DbSet<UserLog> UsersLogs { get; set; }
        public DbSet<SysCompany> SysCompanies { get; set; }
        public DbSet<ReportData> ReportDatas { get; set; }
        public DbSet<SysModule> SysModules { get; set; }
        public DbSet<SeqFormat> SeqFormats { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("RCS_FREIGHT");
        }
    }
}
