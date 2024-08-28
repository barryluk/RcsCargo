using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("AIRLINE")]
    public class Airline
    {
        [Key]
        public string AIRLINE_CODE { get; set; }
        public string AIRLINE_DESC { get; set; }
        public string MAWB_PREFIX { get; set; }
        public string EDI_TERMINAL { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string BRANCH_CODE { get; set; }
        public string SHORT_DESC { get; set; }

    }

    public class AirlineView
    {
        public string AIRLINE_CODE { get; set; }
        public string AIRLINE_DESC { get; set; }
    }
}
