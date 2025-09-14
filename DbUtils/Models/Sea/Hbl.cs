using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Sea
{
    [Table("S_HBL")]
    public class SeaHbl
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string BOOKING_NO { get; set; }
        public string IS_MASTER_HBL { get; set; }
        public string MASTER_HBL_NO { get; set; }
        public string JOB_NO { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string SHIPPER_BRANCH { get; set; }
        public string SHIPPER_SHORT_DESC { get; set; }
        public string SHIPPER_ADDR1 { get; set; }
        public string SHIPPER_ADDR2 { get; set; }
        public string SHIPPER_ADDR3 { get; set; }
        public string SHIPPER_ADDR4 { get; set; }
        public string TO_ORDER_FLAG { get; set; }
        public string TO_ORDER { get; set; }
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
        public string INIT_VES_CODE { get; set; }
        public string INIT_VOYAGE { get; set; }
        public string VES_CODE { get; set; }
        public string VOYAGE { get; set; }
        public string RECEIPT_PORT { get; set; }
        public string LOADING_PORT { get; set; }
        public string DISCHARGE_PORT { get; set; }
        public string DELIVERY_PORT { get; set; }
        public string DEST_PORT { get; set; }
        public DateTime? RECEIPT_PORT_DATE { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public DateTime DISCHARGE_PORT_DATE { get; set; }
        public DateTime? DELIVERY_PORT_DATE { get; set; }
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
        public string ORIGINAL_COPY { get; set; }
        public string ISSUE_PLACE { get; set; }
        public DateTime? ISSUE_DATE { get; set; }
        public DateTime? CARGO_REC_DATE { get; set; }
        public string HBL_BY { get; set; }
        public string AS_AGENT_FOR { get; set; }
        public decimal? C20F { get; set; }
        public decimal? C40F { get; set; }
        public decimal? C40HQ { get; set; }
        public decimal? C45F { get; set; }
        public string P_CURR_CODE { get; set; }
        public decimal P_EX_RATE { get; set; }
        public string C_CURR_CODE { get; set; }
        public decimal C_EX_RATE { get; set; }
        public string ENTRY_WORD1 { get; set; }
        public string ENTRY_WORD2 { get; set; }
        public string COUNTRY_OF_ORIGIN { get; set; }
        public string REMARKS { get; set; }
        public string PRINT_REMARKS { get; set; }
        public string SPECIAL_INST { get; set; }
        public string PRINT_SPECIAL_INST { get; set; }
        public string CONTAINER_WORD { get; set; }
        public string FMC_NO { get; set; }
        public string PRINT_FMC_NO { get; set; }
        public string IS_VOIDED { get; set; }
        public string VOIDED_USER { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string WH_CODE { get; set; }
        public string SALESMAN { get; set; }
        public string SHOW_SAME_AS_CNEE { get; set; }
        public string AMS_MASTER_HBL_NO { get; set; }
        public string IT_NO { get; set; }
        public DateTime? SUBMIT_DATE { get; set; }
        public string APPROVED_AT { get; set; }
        public string PRINT_ON_HBL { get; set; }
        public string CONTRACT { get; set; }
        public string LAST_FOREIGN_PORT { get; set; }
        public DateTime? ISF_DATE { get; set; }
        public DateTime? CNTR_GATE_IN_DATE { get; set; }
        public string PAY_COUNTRY { get; set; }
        public string SHOW_CHG { get; set; }
        public string INCOTERM { get; set; }
        public string INCOTERM_PORT { get; set; }
        public string IS_CW1 { get; set; }
        public string CONTRACT_NO { get; set; }
        public DateTime? VGM_DATE { get; set; }
        public string CARRIER_NAME { get; set; }
        public string AS_CARRIER { get; set; }

        [NotMapped]
        public List<SeaHblCargo> SeaHblCargos { get; set; }
        [NotMapped]
        public List<SeaHblContainer> SeaHblContainers { get; set; }
        [NotMapped]
        public List<SeaHblPo> SeaHblPos { get; set; }
        [NotMapped]
        public List<SeaHblSo> SeaHblSos { get; set; }
        [NotMapped]
        public List<SeaHblCharge> SeaHblChargesPrepaid { get; set; }
        [NotMapped]
        public List<SeaHblCharge> SeaHblChargesCollect{ get; set; }
        [NotMapped]
        public List<SeaHblDoc> SeaHblDocs { get; set; }
        [NotMapped]
        public List<SeaHblStatus> SeaHblStatuses { get; set; }

        public SeaHbl()
        {
            SeaHblCargos = new List<SeaHblCargo>();
            SeaHblContainers = new List<SeaHblContainer>();
            SeaHblPos = new List<SeaHblPo>();
            SeaHblSos = new List<SeaHblSo>();
            SeaHblChargesPrepaid = new List<SeaHblCharge>();
            SeaHblChargesCollect = new List<SeaHblCharge>();
            SeaHblDocs = new List<SeaHblDoc>();
            SeaHblStatuses = new List<SeaHblStatus>();
        }
    }

    [Table("S_HBL_CARGO")]
    public class SeaHblCargo
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
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
        public decimal? QTY { get; set; }
        public string UNIT { get; set; }
        public decimal? KGS { get; set; }
        public double? CBM { get; set; }
        public string COMMODITY { get; set; }
        public string CONTAINER_NO { get; set; }
    }

    [Table("S_HBL_CONTAINER")]
    public class SeaHblContainer
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public decimal LINE_NO { get; set; }
        public string CONTAINER_NO { get; set; }
        public string SEAL { get; set; }
        public string CONTAINER_SIZE { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? KGS { get; set; }
        public double? CBM { get; set; }
        public string SO_NO { get; set; }
        public string SERVICE { get; set; }
    }

    [Table("S_HBL_CHG")]
    public class SeaHblCharge
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public string PAYMENT_TYPE { get; set; }
        [Key]
        [Column(Order = 5)]
        public decimal LINE_NO { get; set; }
        public string CHARGE_CODE { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal PRICE { get; set; }
        public decimal QTY { get; set; }
        public string QTY_UNIT { get; set; }
        public decimal MIN_CHARGE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
        public string CHARGE_DESC { get; set; }

    }

    [Table("S_HBL_PO")]
    public class SeaHblPo
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
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

    [Table("S_HBL_SO")]
    public class SeaHblSo
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
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

    [Table("S_HBL_DOC")]
    public class SeaHblDoc
    {
        public string HBL_NO { get; set; }
        [Key]
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

    [Table("S_HBL_STATUS")]
    public class SeaHblStatus
    {
        [Key]
        [Column(Order = 1)]
        public string HBL_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public decimal LINE_NO { get; set; }
        public string STATUS_CODE { get; set; }
        public DateTime STATUS_DATE { get; set; }
        public string REMARKS { get; set; }
        public string STATUS_TYPE { get; set; }
    }

    public class HblView
    {
        public string HBL_NO { get; set; }
        public string JOB_NO { get; set; }
        public string BOOKING_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string CARRIER_CODE { get; set; }
        public string CARRIER_DESC { get; set; }
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
        public string VOYAGE { get; set; }
        public string LOADING_PORT { get; set; }
        public string DISCHARGE_PORT { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public DateTime? DISCHARGE_PORT_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string IS_TRANSFERRED { get; set; }
    }

    public class JobView
    {
        public string JOB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
        public string VOYAGE { get; set; }
        public string LOADING_PORT { get; set; }
        public string DISCHARGE_PORT { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
    }

    public class ContainerView
    {
        public string CONTAINER_NO { get; set; }
        public string SEAL { get; set; }
        public string CONTAINER_SIZE { get; set; }
    }
}
