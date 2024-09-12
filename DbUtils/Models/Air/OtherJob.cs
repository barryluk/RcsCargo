using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_OTHER_JOB")]
    public class OtherJob
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
        public string LOT_NO { get; set; }
        public DateTime? FLIGHT_DATE { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
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
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal? PACKAGE { get; set; }
        public string PACKAGE_UNIT { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? GWTS { get; set; }
        public string REMARKS { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        [NotMapped]
        public List<OtherJobCharge> OtherJobChargesPrepaid { get; set; }
        [NotMapped]
        public List<OtherJobCharge> OtherJobChargesCollect { get; set; }
        [NotMapped]
        public List<InvoiceView> Invoices { get; set; }

        public OtherJob()
        {
            OtherJobChargesPrepaid = new List<OtherJobCharge>();
            OtherJobChargesCollect = new List<OtherJobCharge>();
            Invoices = new List<InvoiceView>();
        }
    }

    [Table("A_OTHER_JOB_CHG")]
    public class OtherJobCharge
    {
        [Key]
        [Column(Order = 1)]
        public string JOB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string PAYMENT_TYPE { get; set; }
        [Key]
        [Column(Order = 4)]
        public decimal LINE_NO { get; set; }
        public string CHARGE_CODE { get; set; }
        [NotMapped]
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

    public class OtherJobView
    {
        public string JOB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public DateTime FLIGHT_DATE { get; set; }
        public string LOT_NO { get; set; }
        public string HAWB_NO { get; set; }
        public string SHIPPER_CODE { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_CODE { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public string ORIGIN_CODE { get; set; }
        public string DEST_CODE { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public decimal? CWTS { get; set; }
        public string CURR_CODE { get; set; }
        public decimal EX_RATE { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
    }

}
