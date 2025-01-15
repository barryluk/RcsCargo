using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("FILE_STATION_LOG")]
    public class FileStationLog
    {
        [Key]
        public string ID { get; set; }
        public DateTime LOG_TIME { get; set; }
        public string TYPE { get; set; }
        public string NAME { get; set; }
        public string EXTENSION { get; set; }
        public string PATH { get; set; }
        public string USER_ID { get; set; }
    }

    [Table("FILE_STATION_ACCESS_RIGHT")]
    public class FileStationAccessRight
    {
        [Key]
        public string ID { get; set; }
        public string PATH { get; set; }
        public string ACCESS_TYPE { get; set; }
        public string USERS { get; set; }
    }
}
