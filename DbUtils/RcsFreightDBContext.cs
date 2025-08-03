using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using DbUtils.Models.Admin;
using DbUtils.Models.Air;
using DbUtils.Models.MasterRecords;
using DbUtils.Models.Sea;

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
        public DbSet<CarrierContract> CarrierContracts { get; set; }
        public DbSet<Vessel> Vessels { get; set; }
        public DbSet<Charge> Charges { get; set; }
        public DbSet<ChargeTemplate> ChargeTemplates { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerName> CustomerNames { get; set; }
        public DbSet<CustomerContact> CustomerContacts { get; set; }
        public DbSet<Commodity> Commodities { get; set; }
        public DbSet<FileStationLog> FileStationLogs { get; set; }
        public DbSet<FileStationAccessRight> FileStationAccessRights { get; set; }
        public DbSet<ShaFileTransfer> ShaFileTransfers { get; set; }

        public DbSet<Mawb> Mawbs { get; set; }
        public DbSet<MawbCharge> MawbCharges { get; set; }
        public DbSet<MawbDim> MawbDims { get; set; }
        public DbSet<LoadplanBookingList> LoadplanBookingLists { get; set; }
        public DbSet<DbUtils.Models.Air.Booking> Bookings { get; set; }
        public DbSet<DbUtils.Models.Air.BookingPo> BookingPos { get; set; }
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
        public DbSet<PvDoc> PvDocs { get; set; }
        public DbSet<OtherJob> OtherJobs { get; set; }
        public DbSet<OtherJobCharge> OtherJobCharges { get; set; }
        public DbSet<TransferHawbLog> TransferHawbLogs { get; set; }
        public DbSet<TransferInvoiceLog> TransferInvoiceLogs { get; set; }

        public DbSet<Voyage> Voyages { get; set; }
        public DbSet<VoyageDetail> VoyageDetails { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaBooking> SeaBookings { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaBookingCargo> SeaBookingCargos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaBookingPo> SeaBookingPos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaBookingSo> SeaBookingSos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHbl> SeaHbls { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblCargo> SeaHblCargos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblContainer> SeaHblContainers { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblPo> SeaHblPos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblSo> SeaHblSos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblCharge> SeaHblCharges { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblDoc> SeaHblDocs { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaHblStatus> SeaHblStatuses { get; set; }
        public DbSet<DbUtils.Models.Sea.Sob> Sobs { get; set; }
        public DbSet<DbUtils.Models.Sea.SobCargo> SobCargos { get; set; }
        public DbSet<DbUtils.Models.Sea.SobContainer> SobContainers { get; set; }
        public DbSet<DbUtils.Models.Sea.SobSo> SobSos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaInvoice> SeaInvoices { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaInvoiceRefNo> SeaInvoiceRefNos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaInvoiceItem> SeaInvoiceItems { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaPv> SeaPvs { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaPvRefNo> SeaPvRefNos { get; set; }
        public DbSet<DbUtils.Models.Sea.SeaPvItem> SeaPvItems { get; set; }
        public DbSet<TransferHblLog> TransferHblLogs { get; set; }

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
