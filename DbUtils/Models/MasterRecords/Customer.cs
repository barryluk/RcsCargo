using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.InteropServices;

namespace DbUtils.Models.MasterRecords
{
    [Table("CUSTOMER")]
    public class Customer
    {
        [Key]
        public string CUSTOMER_CODE { get; set; }
        public string GROUP_CODE { get; set; }
        public string TYPE { get; set; }
        public string AIR_INST { get; set; }
        public string OCEAN_INST { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public string KC_NO { get; set; }
        public string SALESMAN { get; set; }
        public string PAYMENT_TERMS { get; set; }
        public string AC_CODE_QB { get; set; }
        public string AC_CODE_MYOB { get; set; }
        public string AC_CODE_YY { get; set; }
        public string AC_NAME_QB { get; set; }
        public string AC_NAME_MYOB { get; set; }
        public string AC_NAME_YY { get; set; }
        [NotMapped]
        public List<CustomerName> CustomerNames { get; set; }
        [NotMapped]
        public List<CustomerContact> CustomerContacts { get; set; }
    }

    [Table("CUSTOMER_NAME")]
    public class CustomerName
    {
        [Key]
        [Column(Order = 1)]
        public string CUSTOMER_CODE { get; set; }
        [Key]
        [Column(Order = 2)]
        public string BRANCH_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string SHORT_DESC { get; set; }
        public string COUNTRY_CODE { get; set; }
        public string PORT_CODE { get; set; }
        public string CW1_CODE { get; set; }
        public string USCI_CODE { get; set; }
    }

    [Table("CUSTOMER_CONTACT")]
    public class CustomerContact
    {
        [Key]
        [Column(Order = 1)]
        public string CUSTOMER_CODE { get; set; }
        [Key]
        [Column(Order = 2)]
        public string BRANCH_CODE { get; set; }
        [Key]
        [Column(Order = 3)]
        public string ADDR_TYPE { get; set; }
        [Key]
        [Column(Order = 4)]
        public string SHORT_DESC { get; set; }
        public string CONTACT { get; set; }
        public string TEL { get; set; }
        public string FAX { get; set; }
        public string ADDR1 { get; set; }
        public string ADDR2 { get; set; }
        public string ADDR3 { get; set; }
        public string ADDR4 { get; set; }
        public string EMAIL { get; set; }
        public string CITY { get; set; }
        public string STATE { get; set; }
        public string POSTAL_CODE { get; set; }
    }

    public class CustomerView
    {
        public string CUSTOMER_CODE { get; set; }
        public string GROUP_CODE { get; set; }
        public string TYPE { get; set; }
        public string BRANCH_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string SHORT_DESC { get; set; }
        public string COUNTRY_CODE { get; set; }
        public string PORT_CODE { get; set; }
        public string ADDR_TYPE { get; set; }
        public string ADDR1 { get; set; }
        public string ADDR2 { get; set; }
        public string ADDR3 { get; set; }
        public string ADDR4 { get; set; }
    }
}
