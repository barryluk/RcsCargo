using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Sea
{
    [Table("S_INVOICE")]
    public class SeaInvoice
    {
        [Key]
        [Column(Order = 1)]
        public string INV_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string INV_TYPE { get; set; }
        public string INV_CATEGORY { get; set; }
        public string JOB_NO { get; set; }
        public DateTime INV_DATE { get; set; }
        public string VES_CODE { get; set; }
        public string VOYAGE { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string CUSTOMER_BRANCH { get; set; }
        public string CUSTOMER_SHORT_DESC { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public string CONTAINER_NO { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
        public string REF_NO { get; set; }
        public decimal? PS_RATIO { get; set; }
        public string INV_FORMAT { get; set; }
        public string REMARKS { get; set; }
        public string PAYMENT_TERMS { get; set; }
        public string IS_VAT { get; set; }
        public decimal? VAT_RATE { get; set; }
        public DateTime? DISCHARGE_PORT_DATE { get; set; }
        public string CARRIER_CODE { get; set; }
        public string COMMODITY { get; set; }
        public string IS_VOIDED { get; set; }
        public string IS_PRINTED { get; set; }
        public string IS_POSTED { get; set; }
        public string VOIDED_USER { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        [NotMapped]
        public List<SeaInvoiceRefNo> SeaInvoiceRefNos { get; set; }
        [NotMapped]
        public List<SeaInvoiceItem> SeaInvoiceItems { get; set; }
        public SeaInvoice()
        {
            SeaInvoiceRefNos = new List<SeaInvoiceRefNo>();
            SeaInvoiceItems = new List<SeaInvoiceItem>();
        }
    }

    [Table("S_INVOICE_REF_NO")]
    public class SeaInvoiceRefNo
    {
        [Key]
        [Column(Order = 1)]
        public string INV_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string REF_TYPE { get; set; }
        [Key]
        [Column(Order = 4)]
        public string REF_NO { get; set; }
    }

    [Table("S_INVOICE_ITEM")]
    public class SeaInvoiceItem
    {
        [Key]
        [Column(Order = 1)]
        public string INV_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
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
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
    }

    public class SeaInvoiceView
    {
        public string INV_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public DateTime INV_DATE { get; set; }
        public string INV_TYPE { get; set; }
        public string INV_CATEGORY { get; set; }
        public string JOB_NO { get; set; }
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
        public string VOYAGE { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public string IS_VOIDED { get; set; }
    }
}
