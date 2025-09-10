using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_PERSON")]
    public class Person
    {
        [Key]
        public string PERSON_CODE { get; set; }
        public string PERSON_NAME { get; set; }
        public string DEP_CODE { get; set; }
        public string EMAIL { get; set; }
        public string PHONE { get; set; }
    }

    public class PersonView
    {
        public string PERSON_CODE { get; set; }
        public string PERSON_NAME { get; set; }
        public string DEP_CODE { get; set; }
        public string DEP_NAME { get; set; }
        public string EMAIL { get; set; }
        public string PHONE { get; set; }
    }

    [Table("AC_DEPARTMENT")]
    public class Department
    {
        [Key]
        public string DEP_CODE { get; set; }
        public string DEP_NAME { get; set; }
    }
}
