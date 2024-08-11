using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("PORT")]
    public class Port
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
        public string SCHEDULE_K { get; set; }
        public string SCHEDULE_D { get; set; }

    }
}
