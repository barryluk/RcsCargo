using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Admin
{
    [Table("SYS_MODULE")]
    public class SysModule
    {
        [Key]
        public string MODULE_ID { get; set; }
        public int SEQUENCE { get; set; }
        public int? FOLDER_LEVEL { get; set; }
        public string TYPE { get; set; }
        public string PARENT_ID { get; set; }
        public string DISPLAY_NAME { get; set; }
        public string CONTROLLER { get; set; }
        public string ACTION { get; set; }
        public string DATA_ID { get; set; }
        public string ICON { get; set; }
        public string ENABLE { get; set; }
        public string USER_TYPE { get; set; }
    }
}
