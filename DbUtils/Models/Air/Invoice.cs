using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_INVOICE")]
    public class Invoice
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
        public string MAWB_NO { get; set; }
        public string HAWB_NO { get; set; }
        public string LOT_NO { get; set; }
        public DateTime INV_DATE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string CUSTOMER_BRANCH { get; set; }
        public string AIRLINE_CODE { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public string ORIGIN { get; set; }
        public string DEST { get; set; }
        public string FRT_PAYMENT_PC { get; set; }
        public decimal? PACKAGE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
        public string CR_INVOICE { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
        public string REMARK { get; set; }
        public string IS_VOIDED { get; set; }
        public string IS_PRINTED { get; set; }
        public string IS_POSTED { get; set; }
        public string VOIDED_USER { get; set; }
        public DateTime? VOIDED_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string CUSTOMER_SHORT_DESC { get; set; }
        public string IS_TRANSFERRED { get; set; }
        public string SHOW_DATE_TYPE { get; set; }
        public string PAYMENT_TERMS { get; set; }
        public string ADDR1 { get; set; }
        public string ADDR2 { get; set; }
        public string ADDR3 { get; set; }
        public string ADDR4 { get; set; }
        public string IS_VAT { get; set; }
        public decimal? VAT_RATE { get; set; }
        [NotMapped]
        public List<InvoiceHawb> InvoiceHawbs { get; set; }
        [NotMapped]
        public List<InvoiceItem> InvoiceItems { get; set; }

        public Invoice()
        {
            InvoiceHawbs = new List<InvoiceHawb>();
            InvoiceItems = new List<InvoiceItem>();
        }
    }

    [Table("A_INVOICE_HAWB")]
    public class InvoiceHawb
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
        public string HAWB_NO { get; set; }
    }

    [Table("A_INVOICE_ITEM")]
    public class InvoiceItem
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
        public decimal MIN_CHARGE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
        public decimal? VAT { get; set; }
    }

    public class InvoiceView
    {
        public string INV_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public DateTime INV_DATE { get; set; }
        public string INV_TYPE { get; set; }
        public string INV_CATEGORY { get; set; }
        public string JOB_NO { get; set; }
        public string MAWB_NO { get; set; }
        public string HAWB_NO { get; set; }
        public string LOT_NO { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string ORIGIN { get; set; }
        public string DEST { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal AMOUNT { get; set; }
        public decimal AMOUNT_HOME { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public string IS_VOIDED { get; set; }
    }

}
