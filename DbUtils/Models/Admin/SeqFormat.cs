using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Admin
{
    [Table("SEQ_FORMAT")]
    public class SeqFormat
    {
        [Key]
        [Column(Order = 1)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 2)]
        public string SEQ_TYPE { get; set; }
        public string PREFIX { get; set; }
        public string SUFFIX { get; set; }
        public decimal DIGIT_INDEX { get; set; }
        public decimal DIGIT_LENGTH { get; set; }
        public decimal? DEFAULT_VALUE { get; set; }
        public string PREFIX2 { get; set; }
        public string NUMBER_FIELD { get; set; }
        public string TABLE_NAME { get; set; }
        public string CONDITION { get; set; }
        public string HAVE_FRT_MODE { get; set; }

    }
}
