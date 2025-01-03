using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Sea
{
    [Table("S_SOB")]
    public class Sob
    {
        [Key]
        [Column(Order = 1)]
        public string SOB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string HBL_NO { get; set; }
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
        public string SHOW_SAME_AS_CNEE { get; set; }

        [NotMapped]
        public List<SobCargo> SobCargos { get; set; }
        [NotMapped]
        public List<SobContainer> SobContainers { get; set; }
        [NotMapped]
        public List<SobSo> SobSos { get; set; }

        public Sob()
        {
            SobCargos = new List<SobCargo>();
            SobContainers = new List<SobContainer>();
            SobSos = new List<SobSo>();
        }
    }

    [Table("S_SOB_CARGO")]
    public class SobCargo
    {
        [Key]
        [Column(Order = 1)]
        public string SOB_NO { get; set; }
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
        public decimal? CBM { get; set; }
        public string COMMODITY { get; set; }
        public string CONTAINER_NO { get; set; }
    }

    [Table("S_SOB_CONTAINER")]
    public class SobContainer
    {
        [Key]
        [Column(Order = 1)]
        public string SOB_NO { get; set; }
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
        public decimal? CBM { get; set; }
        public string SO_NO { get; set; }
        public string SERVICE { get; set; }
    }

    [Table("S_SOB_SO")]
    public class SobSo
    {
        [Key]
        [Column(Order = 1)]
        public string SOB_NO { get; set; }
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

    public class SobView
    {
        public string SOB_NO { get; set; }
        public string HBL_NO { get; set; }
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
