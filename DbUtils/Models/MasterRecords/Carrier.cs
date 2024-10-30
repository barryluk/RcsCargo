using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("CARRIER")]
    public class Carrier
    {
        [Key]
        public string CARRIER_CODE { get; set; }
        public string CARRIER_DESC { get; set; }
        public string SCAC { get; set; }
        public string CW1_CODE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
    }

    public class CarrierView
    {
        public string CARRIER_CODE { get; set; }
        public string CARRIER_DESC { get; set; }
    }
}
