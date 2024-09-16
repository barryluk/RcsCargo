using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Admin
{
    [Table("WEB_USER")]
    public class User
    {
        [Key]
        public string USER_ID { get; set; }
        public string PASSWORD { get; set; }
        public string NAME { get; set; }
        public string GENDER { get; set; }
        public string STAFF_ID { get; set; }
        public string TEL { get; set; }
        public string EMAIL { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string USER_TYPE { get; set; }
        public string DEFAULT_COMPANY { get; set; }
        [NotMapped]
        public List<UserGroup> UserGroups { get; set; }
        [NotMapped]
        public List<UserCompany> UserCompanies { get; set; }
        public User()
        {
            UserGroups = new List<UserGroup>();
            UserCompanies = new List<UserCompany>();
        }
    }

    [Table("WEB_USER_COMPANY")]
    public class UserCompany
    {
        [Key]
        [Column(Order = 1)]
        public string USER_ID { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
    }

    [Table("WEB_USER_GROUP")]
    public class UserGroup
    {
        [Key]
        [Column(Order = 1)]
        public string USER_ID { get; set; }
        [Key]
        [Column(Order = 2)]
        public string GROUP_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string COMPANY_ID { get; set; }
    }
}
