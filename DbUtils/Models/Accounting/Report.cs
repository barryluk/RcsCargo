using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    public class LedgerAccountBegEndAmount
    {
        public string AC_CODE { get; set; }
        public string BEG_IND { get; set; }
        public string END_IND { get; set; }
        public decimal AMT_BEG { get; set; }
        public decimal AMT_END { get; set; }
    }

    public class BankTransaction
    {
        public string AC_CODE { get; set; }
        public string AC_NAME { get; set; }
        public string DrCr { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int Day { get; set; }
        public int VOUCHER_NO { get; set; }
        public string DESC_TEXT { get; set; }
        public decimal DR_AMT { get; set; }
        public decimal CR_AMT { get; set; }
        public decimal BALANCE { get; set; }
    }

    public class AgingReport
    {
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_NAME { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public string BEG_IND { get; set; }
        public string END_IND { get; set; }
        public decimal AMT_BEG { get; set; }
        public decimal AMT_END { get; set; }
        public decimal AMT_DR { get; set; }
        public decimal AMT_CR { get; set; }
    }
}
