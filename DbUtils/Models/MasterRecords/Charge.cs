using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("CHARGE")]
    public class Charge
    {
        [Key]
        public string CHARGE_CODE { get; set; }
        public string CHARGE_DESC { get; set; }
        public string CHARGE_BASE { get; set; }
        public decimal? SEQUENCE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
    }
}
