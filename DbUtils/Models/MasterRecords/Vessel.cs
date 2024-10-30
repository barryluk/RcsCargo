using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("VESSEL")]
    public class Vessel
    {
        [Key]
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
        public string LLOYD_CODE { get; set; }
        public string COUNTRY_FLAG { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
    }

    public class VesselView
    {
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
    }
}
