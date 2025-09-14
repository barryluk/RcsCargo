using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_LEDGER_ACCOUNT")]
    public class LedgerAccount
    {
        [Key]
        public string ID { get; set; }
        public string CLASS { get; set; }
        public string CLASS_ENG { get; set; }
        public string AC_CODE { get; set; }
        public string AC_NAME { get; set; }
        public int CODE_LEVEL { get; set; }
        public string CRDR_BALANCE { get; set; }
        public string BOOK_TYPE { get; set; }
        public string CURRENCY { get; set; }
        public int BCASH { get; set; }
        public int BBANK { get; set; }
        public string ADD_INFO { get; set; }
    }

    public class LedgerAccountView
    {
        public string CLASS { get; set; }
        public string CLASS_ENG { get; set; }
        public string AC_CODE { get; set; }
        public string AC_NAME { get; set; }
        public int CODE_LEVEL { get; set; }
        public string CRDR_BALANCE { get; set; }
        public string CURRENCY { get; set; }
        public int BCASH { get; set; }
        public int BBANK { get; set; }
        public decimal OPEN_DR { get; set; }
        public decimal OPEN_CR { get; set; }
        public decimal CURRENT_DR { get; set; }
        public decimal CURRENT_CR { get; set; }
        public decimal CLOSE_DR { get; set; }
        public decimal CLOSE_CR { get; set; }
    }

    public class LedgerAccountBegEndAmount
    {
        public string AC_CODE { get; set; }
        public decimal AMT_BEG { get; set; }
        public decimal AMT_END { get; set; }
    }
}
