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

        public DbSet<Airline> Airlines { get; set; }
        public DbSet<Currency> Currencies { get; set; }
        public DbSet<Port> Ports { get; set; }
        public DbSet<Charge> Charges { get; set; }
        public DbSet<ChargeTemplate> ChargeTemplates { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerName> CustomerNames { get; set; }
        public DbSet<CustomerContact> CustomersContacts { get; set; }

        public DbSet<Mawb> Mawbs { get; set; }
        public DbSet<MawbCharge> MawbCharges { get; set; }
        public DbSet<MawbDim> MawbDims { get; set; }
        public DbSet<Hawb> Hawbs { get; set; }
        public DbSet<HawbPo> HawbPos { get; set; }
        public DbSet<HawbStatus> HawbStatuses { get; set; }
        
        public DbSet<ReportData> ReportDatas { get; set; }
        public DbSet<SysModule> SysModules { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("RCS_FREIGHT");
        }
    }
}
