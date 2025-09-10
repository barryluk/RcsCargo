using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_VENDOR")]
    public class Vendor
    {
        [Key]
        public string VENDOR_CODE { get; set; }
        public string VENDOR_NAME { get; set; }
        public string SHORT_NAME { get; set; }
        public string REGION_CODE { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_PERSON { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string MODIFY_PERSON { get; set; }
    }

    public class VendorView
    {
        [Key]
        public string VENDOR_CODE { get; set; }
        public string VENDOR_NAME { get; set; }
        public string SHORT_NAME { get; set; }
        public string REGION_CODE { get; set; }
        public string REGION_NAME { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string CREATE_PERSON { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string MODIFY_PERSON { get; set; }
    }

    [Table("AC_VENDOR_REGION")]
    public class VendorRegion
    {
        [Key]
        public string REGION_CODE { get; set; }
        public string REGION_NAME { get; set; }
    }
}
