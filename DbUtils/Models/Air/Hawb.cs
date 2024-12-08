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

        public string IS_MASTER_HAWB { get; set; }
        public string IS_SEA_AIR_JOB { get; set; }
        public string MAWB_NO { get; set; }
        public string JOB_NO { get; set; }
        public string BOOKING_NO { get; set; }
        public string BOOKING_TYPE { get; set; }
        public string CL_HAWB_NO { get; set; }
        public string MASTER_HAWB_NO { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string SHIPPER_BRANCH { get; set; }
        public string SHIPPER_SHORT_DESC { get; set; }
        public string SHIPPER_ADDR1 { get; set; }
        public string SHIPPER_ADDR2 { get; set; }
        public string SHIPPER_ADDR3 { get; set; }
        public string SHIPPER_ADDR4 { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string CONSIGNEE_BRANCH { get; set; }
        public string CONSIGNEE_SHORT_DESC { get; set; }
        public string CONSIGNEE_ADDR1 { get; set; }
        public string CONSIGNEE_ADDR2 { get; set; }
        public string CONSIGNEE_ADDR3 { get; set; }
        public string CONSIGNEE_ADDR4 { get; set; }
        public string NOTIFY_CODE { get; set; }
        public string NOTIFY_DESC { get; set; }
        public string NOTIFY_BRANCH { get; set; }
        public string NOTIFY_SHORT_DESC { get; set; }
        public string NOTIFY_ADDR1 { get; set; }
        public string NOTIFY_ADDR2 { get; set; }
        public string NOTIFY_ADDR3 { get; set; }
        public string NOTIFY_ADDR4 { get; set; }
        public string AGENT_CODE { get; set; }
        public string AGENT_DESC { get; set; }
        public string AGENT_BRANCH { get; set; }
        public string AGENT_SHORT_DESC { get; set; }
        public string AGENT_ADDR1 { get; set; }
        public string AGENT_ADDR2 { get; set; }
        public string AGENT_ADDR3 { get; set; }
        public string AGENT_ADDR4 { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string INIT_CARRIER { get; set; }
        public DateTime? ONBOARD_DATE { get; set; }
        public DateTime? QUOTED_DATE { get; set; }
        public string ROUTING_ORDER { get; set; }
        public string P_CURR_CODE { get; set; }
        public decimal P_EX_RATE { get; set; }
        public string C_CURR_CODE { get; set; }
        public decimal C_EX_RATE { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string OTHER_PAYMENT_PC { get; set; }
        public decimal FRT_P_RATE { get; set; }
        public decimal FRT_C_RATE { get; set; }
        public string SHOW_FRT_CHG { get; set; }
        public string SHOW_OTHER_CHG { get; set; }
        public string IS_PICKUP { get; set; }
        public string DV_CUSTOM { get; set; }
        public string DV_CARRIAGE { get; set; }
        public string AMOUNT_OF_INS { get; set; }
        public DateTime? EX_DATE { get; set; }
        public decimal? SELLING_RATE { get; set; }
        public string NOTIFY1_CODE { get; set; }
        public string NOTIFY1_DESC { get; set; }
        public string NOTIFY1_BRANCH { get; set; }
        public string NOTIFY1_SHORT_DESC { get; set; }
        public string NOTIFY1_ADDR1 { get; set; }
        public string NOTIFY1_ADDR2 { get; set; }
        public string NOTIFY1_ADDR3 { get; set; }
        public string NOTIFY1_ADDR4 { get; set; }
        public string NOTIFY2_CODE { get; set; }
        public string NOTIFY2_DESC { get; set; }
        public string NOTIFY2_BRANCH { get; set; }
        public string NOTIFY2_SHORT_DESC { get; set; }
        public string NOTIFY2_ADDR1 { get; set; }
        public string NOTIFY2_ADDR2 { get; set; }
        public string NOTIFY2_ADDR3 { get; set; }
        public string NOTIFY2_ADDR4 { get; set; }
        public string NOTIFY3_CODE { get; set; }
        public string NOTIFY3_DESC { get; set; }
        public string NOTIFY3_BRANCH { get; set; }
        public string NOTIFY3_SHORT_DESC { get; set; }
        public string NOTIFY3_ADDR1 { get; set; }
        public string NOTIFY3_ADDR2 { get; set; }
        public string NOTIFY3_ADDR3 { get; set; }
        public string NOTIFY3_ADDR4 { get; set; }
        public string RELATED_CODE { get; set; }
        public string RELATED_DESC { get; set; }
        public decimal? PACKAGE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? PACKAGE2 { get; set; }
        public string PACKAGE_UNIT2 { get; set; }
        public decimal? TOTAL_VOL { get; set; }
        public string SHOW_LB { get; set; }
        public string SHOW_OZ { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? GWTS2 { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? VWTS2 { get; set; }
        public decimal VWTS_FACTOR { get; set; }
        public string HANDLE_INFO { get; set; }
        public string AS_AGENT_FOR_CARRIER { get; set; }
        public string MAN_SHIPPER_CODE { get; set; }
        public string MAN_SHIPPER_DESC { get; set; }
        public string MAN_SHIPPER_BRANCH { get; set; }
        public string MAN_SHIPPER_SHORT_DESC { get; set; }
        public string MAN_SHIPPER_ADDR1 { get; set; }
        public string MAN_SHIPPER_ADDR2 { get; set; }
        public string MAN_SHIPPER_ADDR3 { get; set; }
        public string MAN_SHIPPER_ADDR4 { get; set; }
        public string MAN_PRINT_SHIPPER_CONTACT { get; set; }
        public string MAN_CONSIGNEE_CODE { get; set; }
        public string MAN_CONSIGNEE_DESC { get; set; }
        public string MAN_CONSIGNEE_BRANCH { get; set; }
        public string MAN_CONSIGNEE_SHORT_DESC { get; set; }
        public string MAN_CONSIGNEE_ADDR1 { get; set; }
        public string MAN_CONSIGNEE_ADDR2 { get; set; }
        public string MAN_CONSIGNEE_ADDR3 { get; set; }
        public string MAN_CONSIGNEE_ADDR4 { get; set; }
        public string MAN_PRINT_CONSIGNEE_CONTACT { get; set; }
        public string IS_VOIDED { get; set; }
        public string VOIDED_USER { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public decimal? DISCOUNT_VWTS { get; set; }
        public decimal? DISCOUNT_RATE { get; set; }
        public string SHOW_CARGO_REC_DATE { get; set; }
        public string IS_VF { get; set; }
        public string HIDE_KG { get; set; }
        public string SHOW_SAD_WORD { get; set; }
        public string DIV_CODE { get; set; }
        public string FLT_SERVICE_TYPE { get; set; }
        public string SALESMAN { get; set; }
        public string APPLE_DEST { get; set; }
        public decimal? SEC_PACKAGE { get; set; }
        public string SEC_PACKAGE_UNIT { get; set; }
        public string SHOW_SAME_AS_CNEE { get; set; }
        public string BLANK_CHG { get; set; }
        public string IS_NIKE { get; set; }
        public string DELIVERY_ADDR { get; set; }
        public string DC_CODE { get; set; }
        public string DC_ADDR { get; set; }
        public string NIKE_EPL_FILE_NAME { get; set; }
        public string NIKE_CSV_FILE_NAME { get; set; }
        public string SEC_MAWB_NO { get; set; }
        public string SEC_JOB_NO { get; set; }
        public decimal? CBM { get; set; }
        public string INCOTERM { get; set; }
        public DateTime? CARGO_REC_DATE { get; set; }
        public DateTime? DOC_REC_DATE { get; set; }
        public DateTime? BOOKING_REC_DATE { get; set; }
        public string SHIPMENT_REF_NO { get; set; }
        public string GOOD_DESC { get; set; }
        public string MARKS_NO { get; set; }
        public string MAN_REMARKS { get; set; }
        public string MAN_GOOD_DESC { get; set; }
        public string MARKS_NO_HAWB { get; set; }
        public string AES_INFO { get; set; }
        public string INCOTERM_2012 { get; set; }
        public string INCOTERM_2012_PORT { get; set; }
        public DateTime? PACKAGE_MODIFY_DATE { get; set; }
        public DateTime? NDC_DATE { get; set; }
        public DateTime? SHIP_CANCEL_DATE { get; set; }
        public string IS_CW1 { get; set; }

        [NotMapped]
        public string AIRLINE_CODE { get; set; }
        [NotMapped]
        public string AIRLINE_DESC { get; set; }
        [NotMapped]
        public string FLIGHT_NO { get; set; }
        [NotMapped]
        public DateTime? FLIGHT_DATE { get; set; }

        [NotMapped]
        public List<HawbPo> HawbPos { get; set; }
        [NotMapped]
        public List<HawbCharge> HawbChargesPrepaid { get; set; }
        [NotMapped]
        public List<HawbCharge> HawbChargesCollect { get; set; }
        [NotMapped]
        public List<HawbDim> HawbDims { get; set; }
        [NotMapped]
        public List<HawbLic> HawbLics { get; set; }
        [NotMapped]
        public List<HawbEquip> HawbEquips { get; set; }
        [NotMapped]
        public List<HawbStatus> HawbStatuses { get; set; }
        [NotMapped]
        public List<HawbDoc> HawbDocs{ get; set; }
        [NotMapped]
        public List<InvoiceView> Invoices { get; set; }
        public Hawb()
        {
            HawbPos = new List<HawbPo>();
            HawbChargesPrepaid = new List<HawbCharge>();
            HawbChargesCollect = new List<HawbCharge>();
            HawbDims = new List<HawbDim>();
            HawbLics = new List<HawbLic>();
            HawbEquips = new List<HawbEquip>();
            HawbStatuses = new List<HawbStatus>();
            HawbDocs = new List<HawbDoc>();
            Invoices = new List<InvoiceView>();
        }
    }

    [Table("A_HAWB_CHG")]
    public class HawbCharge
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

    [Table("A_HAWB_DIM")]
    public class HawbDim
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
        public decimal LINE_NO { get; set; }
        public decimal CTNS { get; set; }
        public string PACKAGE_TYPE { get; set; }
        public decimal LENGTH { get; set; }
        public decimal WIDTH { get; set; }
        public decimal HEIGHT { get; set; }
        public decimal VWTS { get; set; }
        public string DIMENSION { get; set; }
    }

    [Table("A_HAWB_LIC")]
    public class HawbLic
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
        public string LIC_NO { get; set; }
        public DateTime ISSUE_DATE { get; set; }
        public DateTime EXP_DATE { get; set; }
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
        public string UNIT { get; set; }
        public decimal? PCS { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? CWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CUFT { get; set; }
        public decimal? QTY { get; set; }
    }

    [Table("A_HAWB_EQUIP")]
    public class HawbEquip
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
        public decimal LINE_NO { get; set; }
        public string EQUIP_CODE { get; set; }
        public string EQUIP_DESC { get; set; }
        public decimal PACKAGE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? GWTS { get; set; }
        public string EQUIP_CONTOUR { get; set; }

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

    [Table("A_HAWB_DOC")]
    public class HawbDoc
    {
        [Key]
        [Column(Order = 1)]
        public string HAWB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string DOC_ID { get; set; }
        public string DOC_NAME { get; set; }
        public decimal DOC_SIZE { get; set; }
        public string DOC_PATH { get; set; }
        public string COMMENTS { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string MODIFY_USER { get; set; }

    }

    public class HawbView
    {
        public string HAWB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string JOB_NO { get; set; }
        public string MAWB_NO { get; set; }
        public string AIRLINE_CODE { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime? FLIGHT_DATE { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public decimal? PACKAGE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
        public decimal? CBM { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string IS_VOIDED { get; set; }
        public string IS_TRANSFERRED { get; set; }
    }
}
