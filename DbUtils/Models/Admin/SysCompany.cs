using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Admin
{
    [Table("SYS_COMPANY")]
    public class SysCompany
    {
        [Key]
        public string COMPANY_ID { get; set; }
        public string COMPANY_NAME { get; set; }
        public string COUNTRY_CODE { get; set; }
        public string REGION_CODE { get; set; }
        public string PORT_CODE { get; set; }
        public string ADDR1 { get; set; }
        public string ADDR2 { get; set; }
        public string ADDR3 { get; set; }
        public string ADDR4 { get; set; }
        public string TEL { get; set; }
        public string FAX { get; set; }
        public string EMAIL { get; set; }
        public string CONTACT { get; set; }
        public string HOME_CURR { get; set; }
        public string EX_P_CURR_CODE { get; set; }
        public string EX_C_CURR_CODE { get; set; }
        public string IM_P_CURR_CODE { get; set; }
        public string IM_C_CURR_CODE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string CUSTOMER_DESC { get; set; }
        public string CUSTOMER_BRANCH { get; set; }
        public string CUSTOMER_SHORT_DESC { get; set; }
        public string EDI_SENDER_ID_HACTL { get; set; }
        public string EDI_SENDER_ID_AAT { get; set; }
        public string RA_CODE { get; set; }
        public byte[] COMPANY_LOGO { get; set; }
        public string RPT_BOOKING_ADDR { get; set; }
        public string RPT_BOOKING_ADDR_CHT { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        public decimal? LB_PER_BAG { get; set; }
        public string BACK_COLOR { get; set; }
        public string RPT_INV_REMARKS { get; set; }
        public string CREATE_JOB_IN_MAWB { get; set; }
        public string EMAIL_ALERT { get; set; }
        public string IS_OFFSHORE { get; set; }
        public string MAWB_SPLIT_EMAIL_GROUP { get; set; }
        public string COMPANY_SLOGAN { get; set; }
        public string IS_ACTIVE { get; set; }
        public string SCAC { get; set; }
        public string ENABLE_CUSTOMER_RATE { get; set; }
        public string DEFAULT_TRANSFER_BRANCH { get; set; }
    }

    public class SysCompanyView
    {
        public string COMPANY_ID { get; set; }
        public string COMPANY_NAME { get; set; }
        public string COUNTRY_CODE { get; set; }
        public string PORT_CODE { get; set; }
    }
}
