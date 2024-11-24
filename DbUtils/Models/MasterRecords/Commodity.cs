using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.MasterRecords
{
    [Table("COMMODITY")]
    public class Commodity
    {
        [Key]
        public string COMMODITY_CODE { get; set; }
        public string COMMODITY_DESC { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }

    }

    public class CommodityView
    {
        public string COMMODITY_CODE { get; set; }
        public string COMMODITY_DESC { get; set; }
    }
}
