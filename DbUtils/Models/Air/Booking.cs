using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_BOOKING")]
    public class Booking
    {
        [Key]
        [Column(Order = 1)]
        public string BOOKING_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string BOOKING_TYPE { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string SHIPPER_BRANCH { get; set; }
        public string SHIPPER_SHORT_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string CONSIGNEE_BRANCH { get; set; }
        public string CONSIGNEE_SHORT_DESC { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string FDEST_CODE { get; set; }
        public string IS_DOC_REC { get; set; }
        public string IS_BOOKING_APP { get; set; }
        public string SERVICE_TYPE { get; set; }
        public decimal VWTS_FACTOR { get; set; }
        public decimal? PACKAGE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? PACKAGE2 { get; set; }
        public string PACKAGE_UNIT2 { get; set; }
        public string ROUTING_ORDER { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? GWTS2 { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? VWTS2 { get; set; }
        public decimal? CUFT { get; set; }
        public string COLOADER_HAWB { get; set; }
        public DateTime? CARGO_READY_DATE { get; set; }
        public DateTime? CARGO_REC_DATE { get; set; }
        public DateTime? DOC_REC_DATE { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string OTHER_PAYMENT_PC { get; set; }
        public string SHIPMENT_REF_NO { get; set; }
        public string NOTIFY1_CODE { get; set; }
        public string NOTIFY1_DESC { get; set; }
        public string NOTIFY1_BRANCH { get; set; }
        public string NOTIFY1_SHORT_DESC { get; set; }
        public string NOTIFY2_CODE { get; set; }
        public string NOTIFY2_DESC { get; set; }
        public string NOTIFY2_BRANCH { get; set; }
        public string NOTIFY2_SHORT_DESC { get; set; }
        public string RELATED_CODE { get; set; }
        public string RELATED_DESC { get; set; }
        public string HANDLE_INFO { get; set; }
        public string MARKS_NO { get; set; }
        public string GOOD_DESC_OLD { get; set; }
        public string REMARKS { get; set; }
        public string SR { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public string IS_VOIDED { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string VOIDED_USER { get; set; }
        public string EBOOKING_NO { get; set; }
        public string STYLE { get; set; }
        public DateTime? NDC_DATE { get; set; }
        public decimal? CBM { get; set; }
        public string DN_NO { get; set; }
        public decimal? SEC_PACKAGE { get; set; }
        public string SEC_PACKAGE_UNIT { get; set; }
        public decimal? TRANSIT_DAYS { get; set; }
        public string APPLE_DEST { get; set; }
        public decimal? FRT_P_RATE { get; set; }
        public decimal? FRT_C_RATE { get; set; }
        public string DELIVERY_ADDR { get; set; }
        public string DC_CODE { get; set; }
        public string DC_ADDR { get; set; }
        public DateTime? PLAN_FLIGHT_DATE { get; set; }
        public string PLAN_MAWB_NO { get; set; }
        public string PLAN_FLIGHT_NO { get; set; }
        public string IS_NIKE { get; set; }
        public string APPROVAL_NO { get; set; }
        public string INCOTERM { get; set; }
        public string NIKE_SHIP_TO_ID { get; set; }
        public DateTime? BOOKING_REC_DATE { get; set; }
        public string IS_SPECIAL { get; set; }
        public string INCOTERM_2012 { get; set; }
        public string INCOTERM_2012_PORT { get; set; }
        public string P_CURR_CODE { get; set; }
        public decimal? P_EX_RATE { get; set; }
        public string C_CURR_CODE { get; set; }
        public decimal? C_EX_RATE { get; set; }
        public DateTime? PACKAGE_MODIFY_DATE { get; set; }
        public DateTime? SHIP_CANCEL_DATE { get; set; }
        public string PO { get; set; }
        public string GOOD_DESC { get; set; }
        [NotMapped]
        public List<BookingPo> BookingPos { get; set; }
        [NotMapped]
        public List<WarehouseHistory> WarehouseHistories { get; set; }
        public Booking()
        {
            BookingPos = new List<BookingPo>();
            WarehouseHistories = new List<WarehouseHistory>();
        }
    }

    [Table("A_BOOKING_PO")]
    public class BookingPo
    {
        [Key]
        [Column(Order = 1)]
        public string BOOKING_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public decimal LINE_NO { get; set; }
        public decimal? CARTON_START { get; set; }
        public decimal? CARTON_END { get; set; }
        public string PO_NO { get; set; }
        public string INV_NO { get; set; }
        public string STYLE_NO { get; set; }
        public decimal? QTY { get; set; }
        public string UNIT { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
        public decimal? CUFT { get; set; }
        public decimal? PCS { get; set; }
        public string MATERIAL_NO { get; set; }
        public string SKU { get; set; }

    }

    [Table("A_WH_HIST")]
    public class WarehouseHistory
    {
        [Key]
        [Column(Order = 1)]
        public string BOOKING_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public decimal SEQ { get; set; }
        public decimal? CTNS { get; set; }
        public string PACKAGE_TYPE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? LENGTH { get; set; }
        public decimal? WIDTH { get; set; }
        public decimal? HEIGHT { get; set; }
        public string MEASURE_UNIT { get; set; }
        public string DIMENSION { get; set; }
        public string IS_PICKUP { get; set; }
        public string IS_DEL { get; set; }
        public string IS_DAM { get; set; }
        public string DESCRIPTION { get; set; }
        public DateTime? PICKUP_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
    }

    public class BookingView
    {
        public string BOOKING_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CBM { get; set; }
        public DateTime? CARGO_READY_DATE { get; set; }
        public DateTime? CARGO_REC_DATE { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
    }

}
