using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Web.UI.WebControls;

namespace DbUtils.Models.MasterRecords
{
    [Table("CHARGE")]
    public class Charge
    {
        [Key]
        public string CHARGE_CODE { get; set; }
        public string CHARGE_DESC { get; set; }
        public string CHARGE_BASE { get; set; }
        public decimal? SEQUENCE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
    }

    [Table("CHARGE_TEMPLATE")]
    public class ChargeTemplate
    {
        [Key]
        [Column(Order = 1)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 2)]
        public string TEMPLATE_NAME { get; set; }
        [Key]
        [Column(Order = 3)]
        public string CHARGE_CODE { get; set; }
        public string CHARGE_DESC { get; set; }
        public string CURR_CODE { get; set; }
        public decimal PRICE { get; set; }
        public string UNIT { get; set; }
        public decimal MIN_AMOUNT { get; set; }
    }
}
