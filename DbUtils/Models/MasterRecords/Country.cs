using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("COUNTRY")]
    public class Country
    {
        [Key]
        public string COUNTRY_CODE { get; set; }
        public string COUNTRY_DESC { get; set; }
        public string REGION_CODE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }

    }

    public class CountryView
    {
        public string COUNTRY_CODE { get; set; }
        public string COUNTRY_DESC { get; set; }
    }
}
