using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbUtils.Models.Admin
{
    [Table("USER_LOG")]
    public class UserLog
    {
        [Key]
        public string SESSION_ID { get; set; }
        public string USER_ID { get; set; }
        public string USER_HOST_ADDRESS { get; set; }
        public DateTime LOGIN_TIME { get; set; }
        public string COMPANY_ID { get; set; }
        public string BROWSER_INFO { get; set; }
        public string APP_NAME { get; set; }
        public DateTime? LAST_REQUEST { get; set; }

    }
}
