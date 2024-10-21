using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("POWER_SEARCH_SETTING")]
    public class PowerSearchSetting
    {
        [Key]
        public string GUID { get; set; }
        public string TABLE_NAME { get; set; }
        public string ID_FIELD { get; set; }
        public string SEARCH_FIELD { get; set; }
    }

    [Table("POWER_SEARCH_TEMPLATE")]
    public class PowerSearchTemplate
    {
        [Key]
        public string GUID { get; set; }
        public string TABLE_NAME { get; set; }
        public string FIELDS { get; set; }
        public string TEMPLATE { get; set; }
    }

    public class PowerSearchResult
    {
        public string TABLE_NAME { get; set; }
        public string ID { get; set; }
        public string ID_FIELD { get; set; }
        public string FRT_MODE { get; set; }
        public string RESULT_VALUE { get; set; }
        public DateTime RESULT_DATE { get; set; }
    }
}
