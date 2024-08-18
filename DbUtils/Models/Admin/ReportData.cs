using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Admin
{
    [Table("REPORT_DATA")]
    public class ReportData
    {
        [Key]
        public string REPORT_NAME { get; set; }
        public DateTime LAST_RUN_TIME{ get; set; }
        public string DATA { get; set; }
    }

    public class ReportSchedule
    {
        public string reportName { get; set; }
        public int refreshTimeMinutes { get; set; }
        public string sqlCmd { get; set; }
    }
}
