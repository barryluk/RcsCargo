using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Sea
{
    [Table("S_BOOKING")]
    public class SeaBooking
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
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string SHIPPER_BRANCH { get; set; }
        public string SHIPPER_SHORT_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string CONSIGNEE_BRANCH { get; set; }
        public string CONSIGNEE_SHORT_DESC { get; set; }
        public string NOTIFY_CODE { get; set; }
        public string NOTIFY_DESC { get; set; }
        public string NOTIFY_BRANCH { get; set; }
        public string NOTIFY_SHORT_DESC { get; set; }
        public string AGENT_CODE { get; set; }
        public string AGENT_DESC { get; set; }
        public string AGENT_BRANCH { get; set; }
        public string AGENT_SHORT_DESC { get; set; }
        public string INIT_VES_CODE { get; set; }
        public string INIT_VOYAGE { get; set; }
        public string VES_CODE { get; set; }
        public string VOYAGE { get; set; }
        public string RECEIPT_PORT { get; set; }
        public string LOADING_PORT { get; set; }
        public string DISCHARGE_PORT { get; set; }
        public string DELIVERY_PORT { get; set; }
        public string DEST_PORT { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public DateTime DISCHARGE_PORT_DATE { get; set; }
        public DateTime? DELIVERY_PORT_DATE { get; set; }
        public DateTime? CARGO_READY_DATE { get; set; }
        public string LINER_CODE { get; set; }
        public string LINER_DESC { get; set; }
        public string COLOADER_CODE { get; set; }
        public string COLOADER_DESC { get; set; }
        public string DEL_AGENT_CODE { get; set; }
        public string DEL_AGENT_DESC { get; set; }
        public string FRT_TERM { get; set; }
        public string FRT_PAYABLE_AT { get; set; }
        public string COMMODITY { get; set; }
        public string SERVICE { get; set; }
        public string IS_CONSOL { get; set; }
        public decimal? C20F { get; set; }
        public decimal? C40F { get; set; }
        public decimal? C40HQ { get; set; }
        public decimal? C45F { get; set; }
        public string WH_CODE { get; set; }
        public DateTime? CY_CLOSING_DATE { get; set; }
        public DateTime? CFS_CLOSING_DATE { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public string IS_VOIDED { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string VOIDED_USER { get; set; }
        public string NOTIFY2_CODE { get; set; }
        public string NOTIFY2_DESC { get; set; }
        public string NOTIFY2_BRANCH { get; set; }
        public string NOTIFY2_SHORT_DESC { get; set; }
        public string NOTIFY3_CODE { get; set; }
        public string NOTIFY3_DESC { get; set; }
        public string NOTIFY3_BRANCH { get; set; }
        public string NOTIFY3_SHORT_DESC { get; set; }
        public string SR { get; set; }
        public string REMARKS { get; set; }
        [NotMapped]
        public List<SeaBookingCargo> SeaBookingCargos { get; set; }
        [NotMapped]
        public List<SeaBookingPo> SeaBookingPos { get; set; }
        [NotMapped]
        public List<SeaBookingSo> SeaBookingSos { get; set; }

        public SeaBooking()
        {
            SeaBookingCargos = new List<SeaBookingCargo>();
            SeaBookingPos = new List<SeaBookingPo>();
            SeaBookingSos = new List<SeaBookingSo>();
        }
    }

    [Table("S_BOOKING_CARGO")]
    public class SeaBookingCargo
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
        public string MARKS_NO { get; set; }
        public string GOODS_DESC { get; set; }
        public decimal QTY { get; set; }
        public string UNIT { get; set; }
        public decimal KGS { get; set; }
        public decimal CBM { get; set; }
    }

    [Table("S_BOOKING_PO")]
    public class SeaBookingPo
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
        public decimal? CTN_FROM { get; set; }
        public decimal? CTN_TO { get; set; }
        public string PO_NO { get; set; }
        public string SI_NO { get; set; }
        public string ITEM_NO { get; set; }
        public string STYLE_NO { get; set; }
        public decimal QTY { get; set; }
        public decimal KGS { get; set; }
        public double CBM { get; set; }     //decimal will only have 2 decimals, use double for more decimals
    }

    [Table("S_BOOKING_SO")]
    public class SeaBookingSo
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
        public string SO_NO { get; set; }
    }

    public class BookingView
    {
        public string BOOKING_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
        public string VOYAGE { get; set; }
        public string LOADING_PORT { get; set; }
        public string DISCHARGE_PORT { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public DateTime? DISCHARGE_PORT_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
    }
}
