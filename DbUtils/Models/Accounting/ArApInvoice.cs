using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_ARAP_INVOICE")]
    public class AcArApInvoice
    {
        [Key]
        public string ID { get; set; }
        public string INV_NO { get; set; }
        public string VOUCH_TYPE { get; set; }
        public DateTime VOUCH_DATE { get; set; }
        public string DEPT_CODE { get; set; }
        [NotMapped]
        public string DEPT_NAME { get; set; }
        public string PERSON_CODE { get; set; }
        [NotMapped]
        public string PERSON_NAME { get; set; }
        public string CUSTOMER_CODE { get; set; }
        [NotMapped]
        public string CUSTOMER_CODE_MAPPING { get; set; }
        [NotMapped]
        public string CUSTOMER_NAME { get; set; }
        public string MAWB_NO { get; set; }
        public string FLIGHT_NO { get; set; }
        public DateTime? FLIGHT_DATE { get; set; }
        public string HAWB_NO { get; set; }
        public string ORIGIN { get; set; }
        public string DEST { get; set; }
        public decimal AMOUNT { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string MODIFY_USER { get; set; }
    }

    [Table("AC_CUSTOMER_MAPPING")]
    public class AcCustomerMapping
    {
        [Key]
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_NAME { get; set; }
        public string CODE { get; set; }
    }

    [Table("AC_VENDOR_MAPPING")]
    public class AcVendorMapping
    {
        [Key]
        public string VENDOR_CODE { get; set; }
        public string VENDOR_NAME { get; set; }
        public string CODE { get; set; }
    }

    [Table("AC_PERSON_MAPPING")]
    public class AcPersonMapping
    {
        [Key]
        public string PERSON_CODE { get; set; }
        public string PERSON_NAME { get; set; }
    }
}
