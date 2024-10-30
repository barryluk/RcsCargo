using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("SEA_PORT")]
    public class SeaPort
    {
        [Key]
        public string PORT_CODE { get; set; }
        public string PORT_DESC { get; set; }
        public string COUNTRY_CODE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string UN_LOCATION { get; set; }

    }

    public class SeaPortView
    {
        public string PORT_CODE { get; set; }
        public string PORT_DESC { get; set; }
        public string COUNTRY_CODE { get; set; }
    }
}
