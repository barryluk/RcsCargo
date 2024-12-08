using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_TRANSFER_HAWB_LOG")]
    public class TransferHawbLog
    {
        [Key]
        public string ID { get; set; }
        public string COMPANY_ID { get; set; }
        public string HAWB_NO { get; set; }
        public string MAWB_NO { get; set; }
        public string JOB_NO { get; set; }
        public string NEW_JOB_NO { get; set; }
        public string NEW_COMPANY_ID { get; set; }
        public string TRANSFER_USER { get; set; }
        public DateTime TRANSFER_DATE { get; set; }
    }

    [Table("A_TRANSFER_INVOICE_LOG")]
    public class TransferInvoiceLog
    {
        [Key]
        public string ID { get; set; }
        public string COMPANY_ID { get; set; }
        public string INV_NO { get; set; }
        public string HAWB_NO { get; set; }
        public string MAWB_NO { get; set; }
        public string JOB_NO { get; set; }
        public string PV_NO { get; set; }
        public string NEW_JOB_NO { get; set; }
        public string NEW_COMPANY_ID { get; set; }
        public string TRANSFER_USER { get; set; }
        public DateTime TRANSFER_DATE { get; set; }
    }
}
