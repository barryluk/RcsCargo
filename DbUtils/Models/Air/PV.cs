using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_PV")]
    public class Pv
    {
        [Key]
        [Column(Order = 1)]
        public string PV_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        public string VENDOR_INV_NO { get; set; }
        public string PV_TYPE { get; set; }
        public string PV_CATEGORY { get; set; }
        public string JOB_NO { get; set; }
        public string MAWB_NO { get; set; }
        public string HAWB_NO { get; set; }
        public string LOT_NO { get; set; }
        public DateTime PV_DATE { get; set; }
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
        public string IS_CR_INVOICE { get; set; }
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
        public string ORIGIN_PV_TYPE { get; set; }
        public decimal? MAWB_CWTS { get; set; }
        public decimal? MAWB_RATE { get; set; }
        [NotMapped]
        public List<PvItem> PvItems { get; set; }

        public Pv()
        {
            PvItems = new List<PvItem>();
        }
    }

    [Table("A_PV_ITEM")]
    public class PvItem
    {
        [Key]
        [Column(Order = 1)]
        public string PV_NO { get; set; }
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

    public class PvView
    {
        public string PV_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public DateTime PV_DATE { get; set; }
        public string PV_TYPE { get; set; }
        public string PV_CATEGORY { get; set; }
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
