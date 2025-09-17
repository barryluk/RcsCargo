using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_GL_ACCSUM")]
    public class GLAccsum
    {
        [Key]
        public decimal ID { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int AC_CODE { get; set; }
        public string CURRENCY { get; set; }
        public string BEG_IND { get; set; }
        public string END_IND { get; set; }
        public decimal AMT_BEG { get; set; }
        public decimal AMT_DR { get; set; }
        public decimal AMT_CR { get; set; }
        public decimal AMT_END { get; set; }
        public decimal AMT_BEG_F { get; set; }
        public decimal AMT_DR_F { get; set; }
        public decimal AMT_CR_F { get; set; }
        public decimal AMT_END_F { get; set; }
    }

    [Table("AC_GL_ACCSUM_TEST")]
    public class GLAccsumTest
    {
        [Key]
        public decimal ID { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int AC_CODE { get; set; }
        public string CURRENCY { get; set; }
        public string BEG_IND { get; set; }
        public string END_IND { get; set; }
        public decimal AMT_BEG { get; set; }
        public decimal AMT_DR { get; set; }
        public decimal AMT_CR { get; set; }
        public decimal AMT_END { get; set; }
        public decimal AMT_BEG_F { get; set; }
        public decimal AMT_DR_F { get; set; }
        public decimal AMT_CR_F { get; set; }
        public decimal AMT_END_F { get; set; }
    }
}
