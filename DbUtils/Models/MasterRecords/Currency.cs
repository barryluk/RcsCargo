using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("CURRENCY")]
    public class Currency
    {
        [Key]
        [Column(Order = 1)]
        public string CURR_CODE { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        public string CURR_DESC { get; set; }
        public decimal EX_RATE { get; set; }
        public decimal DECIMAL_PLACE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
    }
}
