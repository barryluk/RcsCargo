using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Air
{
    [Table("A_HAWB")]
    public class Hawb
    {
        [Key]
        [Column("HAWB_NO", Order = 1)]
        public string HAWB_NO { get; set; }

        [Key]
        [Column("COMPANY_ID", Order = 2)]
        public string COMPANY_ID { get; set; }

        [Key]
        [Column("FRT_MODE", Order = 3)]
        public string FRT_MODE { get; set; }

        public string MAWB_NO { get; set; }
        public string JOB_NO { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_BRANCH { get; set; }
        public string SHIPPER_SHORT_DESC { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string SHIPPER_ADDR1 { get; set; }
        public string SHIPPER_ADDR2 { get; set; }
        public string SHIPPER_ADDR3 { get; set; }
        public string SHIPPER_ADDR4 { get; set; }

        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_BRANCH { get; set; }
        public string CONSIGNEE_SHORT_DESC { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string CONSIGNEE_ADDR1 { get; set; }
        public string CONSIGNEE_ADDR2 { get; set; }
        public string CONSIGNEE_ADDR3 { get; set; }
        public string CONSIGNEE_ADDR4 { get; set; }

        public string AGENT_CODE { get; set; }
        public string AGENT_BRANCH { get; set; }
        public string AGENT_SHORT_DESC { get; set; }
        public string AGENT_DESC { get; set; }
        public string AGENT_ADDR1 { get; set; }
        public string AGENT_ADDR2 { get; set; }
        public string AGENT_ADDR3 { get; set; }
        public string AGENT_ADDR4 { get; set; }

        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }

        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? CBM { get; set; }
        public DateTime? CARGO_REC_DATE { get; set; }
        public DateTime? DOC_REC_DATE { get; set; }
        public DateTime? BOOKING_REC_DATE { get; set; }

        public string BOOKING_NO { get; set; }
        public string BOOKING_TYPE { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string SHIPMENT_REF_NO { get; set; }
        public string FLT_SERVICE_TYPE { get; set; }
        public DateTime? ONBOARD_DATE { get; set; }
        public DateTime? QUOTED_DATE { get; set; }

        public string ROUTING_ORDER { get; set; }
        public string P_CURR_CODE { get; set; }
        public decimal P_EX_RATE { get; set; }
        public string C_CURR_CODE { get; set; }
        public decimal C_EX_RATE { get; set; }
        public string OTHER_PAYMENT_PC { get; set; }
        public decimal FRT_P_RATE { get; set; }
        public decimal FRT_C_RATE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? TOTAL_VOL { get; set; }
        public decimal VWTS_FACTOR { get; set; }
        public string INCOTERM { get; set; }
        public string INCOTERM_2012 { get; set; }
        public string INCOTERM_2012_PORT { get; set; }
        public string IS_VOIDED { get; set; }
        public string VOIDED_USER { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string IS_SEA_AIR_JOB { get; set; }
        public string IS_MASTER_HAWB { get; set; }
        public string IS_PICKUP { get; set; }
        public string SHOW_LB { get; set; }
        public string SHOW_OZ { get; set; }
        [NotMapped]
        public List<HawbPo> HawbPos { get; set; }
        [NotMapped]
        public List<HawbStatus> HawbStatuses { get; set; }
        public Hawb()
        {
            HawbPos = new List<HawbPo>();
            HawbStatuses = new List<HawbStatus>();
        }
    }

    [Table("A_HAWB_PO")]
    public class HawbPo
    {
        [Key]
        [Column(Order = 1)]
        public string HAWB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public string PO_NO { get; set; }
        public string SKU { get; set; }
        [Key]
        [Column(Order = 5)]
        public int LINE_NO { get; set; }
        public string STYLE_NO { get; set; }
        public string MATERIAL_NO { get; set; }
        public DateTime? QTY_MODIFY_DATE { get; set; }
        public decimal? PCS { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? CWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CUFT { get; set; }
        public decimal? QTY { get; set; }
    }

    [Table("A_HAWB_STATUS")]
    public class HawbStatus
    {
        [Key]
        [Column(Order = 1)]
        public string HAWB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public int LINE_NO { get; set; }
        public string STATUS_CODE { get; set; }
        [NotMapped]
        public string STATUS_DESC { get; set; }
        public string REMARKS { get; set; }
        public string STATUS_TYPE { get; set; }
        public DateTime? STATUS_DATE { get; set; }
    }
}
