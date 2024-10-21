using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_MAWB")]
    public class Mawb
    {
        [Key]
        [Column(Order = 1)]
        public string MAWB { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string IS_CONTRACT { get; set; }
        public string JOB { get; set; }
        [NotMapped]
        public string MAWB_NO { get; set; }
        [NotMapped]
        public string JOB_NO { get; set; }
        public string JOB_TYPE { get; set; }
        public string LOT_NO { get; set; }
        public string AIRLINE_CODE { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public DateTime? ISSUE_DATE { get; set; }
        public string LOADER_TYPE { get; set; }
        public string COLOADER_CODE { get; set; }
        public string COLOADER_DESC { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string AIRLINE_CODE2 { get; set; }
        public string FLIGHT_NO2 { get; set; }
        public DateTime? FLIGHT_DATE2 { get; set; }
        public string DEST_CODE2 { get; set; }
        public string AIRLINE_CODE3 { get; set; }
        public string FLIGHT_NO3 { get; set; }
        public DateTime? FLIGHT_DATE3 { get; set; }
        public string DEST_CODE3 { get; set; }
        public DateTime? ETA { get; set; }
        public DateTime? ATA { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CUFT { get; set; }
        public decimal? VWTS_FACTOR { get; set; }
        public decimal? TOTAL_VOL { get; set; }
        public decimal? CTNS { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public string P_CURR_CODE { get; set; }
        public decimal? P_EX_RATE { get; set; }
        public string C_CURR_CODE { get; set; }
        public decimal? C_EX_RATE { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_BRANCH { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string SHIPPER_SHORT_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_BRANCH { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string CONSIGNEE_SHORT_DESC { get; set; }
        public string AGENT_CODE { get; set; }
        public string AGENT_BRANCH { get; set; }
        public string AGENT_DESC { get; set; }
        public string AGENT_SHORT_DESC { get; set; }
        public string NOTIFY_CODE { get; set; }
        public string NOTIFY_BRANCH { get; set; }
        public string NOTIFY_DESC { get; set; }
        public string NOTIFY_SHORT_DESC { get; set; }
        public string LOAD_INFO { get; set; }
        public string REMARKS { get; set; }
        public string WH_CODE { get; set; }
        public DateTime? STORAGE_DATE { get; set; }
        public string IS_PASSENGER_FLIGHT { get; set; }
        public string IS_X_RAY { get; set; }
        public string IS_SPLIT_SHIPMENT { get; set; }
        public string IS_CLOSED { get; set; }
        public string IS_VOIDED { get; set; }
        public string VOIDED_USER { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string HANDLE_INFO { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string OTHER_PAYMENT_PC { get; set; }
        public string SHOW_FRT_CHG { get; set; }
        public string SHOW_OTHER_CHG { get; set; }
        public string BLANK_CHG { get; set; }
        public string REPORT_REMARKS { get; set; }
        public DateTime? ATD { get; set; }
        public string ROUTE { get; set; }
        public string REMARKS_PRINT { get; set; }
        public string NATURE_GOODS { get; set; }
        public string AC_INFO { get; set; }
        public string RATE_CLASS { get; set; }
        public string TYPE { get; set; }
        public string ISSUE_CODE { get; set; }
        public string ISSUE_BRANCH { get; set; }
        public string ISSUE_SHORT_DESC { get; set; }
        public string ISSUE_DESC { get; set; }
        public DateTime? EX_DATE { get; set; }
        public string AGENT_IATA_CODE { get; set; }
        public decimal? CWTS { get; set; }
        public decimal? AIRLINE_CWTS { get; set; }
        public decimal? COST { get; set; }
        public decimal? TRUCK { get; set; }
        public string IS_TRUCKING_2 { get; set; }
        public string IS_TRUCKING_3 { get; set; }
        [NotMapped]
        public List<MawbCharge> MawbChargesPrepaid { get; set; }
        [NotMapped]
        public List<MawbCharge> MawbChargesCollect { get; set; }
        [NotMapped]
        public List<InvoiceView> Invoices { get; set; }
        [NotMapped]
        public List<MawbDim> MawbDims { get; set; }
        [NotMapped]
        public List<LoadplanBookingList> LoadplanBookingLists { get; set; }
        [NotMapped]
        public List<LoadplanBookingListView> LoadplanBookingListViews { get; set; }
        [NotMapped]
        public List<HawbView> LoadplanHawbListViews { get; set; }
        [NotMapped]
        public List<HawbEquip> LoadplanHawbEquips { get; set; }
        public Mawb()
        {
            MawbChargesPrepaid = new List<MawbCharge>();
            MawbChargesCollect = new List<MawbCharge>();
            Invoices = new List<InvoiceView>();
            MawbDims = new List<MawbDim>();
            LoadplanBookingLists = new List<LoadplanBookingList>();
            LoadplanBookingListViews = new List<LoadplanBookingListView>();
            LoadplanHawbListViews = new List<HawbView>();
            LoadplanHawbEquips = new List<HawbEquip>();
        }
    }

    [Table("A_MAWB_DIM")]
    public class MawbDim
    {
        [Key]
        [Column(Order = 1)]
        public string MAWB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public decimal LINE_NO { get; set; }
        public decimal CTNS { get; set; }
        public string PACKAGE_TYPE { get; set; }
        public decimal LENGTH { get; set; }
        public decimal WIDTH { get; set; }
        public decimal HEIGHT { get; set; }
        public decimal VWTS { get; set; }
        public string DIMENSION { get; set; }
    }

    [Table("A_MAWB_CHG")]
    public class MawbCharge
    {
        [Key]
        [Column(Order = 1)]
        public string MAWB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string PAYMENT_TYPE { get; set; }
        [Key]
        [Column(Order = 4)]
        public decimal LINE_NO { get; set; }
        public string CHARGE_CODE { get; set; }
        public string CHARGE_DESC { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal PRICE { get; set; }
        public decimal QTY { get; set; }
        public string QTY_UNIT { get; set; }
        public decimal MIN_CHARGE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
    }

    public class MawbView
    {
        public string MAWB { get; set; }
        public string MAWB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string JOB { get; set; }
        public string JOB_NO { get; set; }
        public string JOB_TYPE { get; set; }
        public string LOT_NO { get; set; }
        public string AIRLINE_CODE { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string AGENT_DESC { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
        public DateTime? ETA { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string IS_VOIDED { get; set; }
    }

    public class JobDetailView
    {
        public string JOB_NO { get; set; }
        public string MAWB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string AIRLINE_CODE { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
    }

    public class LotDetailView
    {
        public string LOT_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string AIRLINE_CODE { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
    }

    [Table("A_LOADPLAN_BOOKING_LIST")]
    public class LoadplanBookingList
    {
        [Key]
        [Column(Order = 1)]
        public string JOB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public string BOOKING_NO { get; set; }
    }

    public class LoadplanBookingListView
    {
        public string JOB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string BOOKING_NO { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public string IS_DOC_REC { get; set; }
        public string IS_BOOKING_APP { get; set; }
        public string IS_RECEIVED { get; set; }
    }
}
