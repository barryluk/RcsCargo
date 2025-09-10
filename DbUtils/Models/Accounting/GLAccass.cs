using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_GL_ACCASS")]
    public class GLAccass
    {
        [Key]
        public int ID { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int AC_CODE { get; set; }
        public string CURRENCY { get; set; }
        public string DEPT_ID { get; set; }
        public string PERSON_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string VENDOR_ID { get; set; }
        public string BEG_IND { get; set; }
        public string END_IND { get; set; }
        public decimal AMT_BEG { get; set; }
        public decimal AMT_DR { get; set; }
        public decimal AMT_CR { get; set; }
        public decimal AMT_END { get; set; }
    }
}
