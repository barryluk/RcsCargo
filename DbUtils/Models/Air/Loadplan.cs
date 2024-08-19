using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Air
{
    [Table("A_LOADPLAN_BOOKING_LIST")]
    public class LoadplanBookingList
    {
        [Key]
        [Column(Order = 1)]
        public string JOB_NO { get; set; }
        [Key]
        [Column(Order = 2)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 3)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 4)]
        public string BOOKING_NO { get; set; }
    }

    public class LoadplanBookingListView
    {
        public string JOB_NO { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string BOOKING_NO { get; set; }
        public string SHIPPER_DESC { get; set; }
        public string CONSIGNEE_DESC { get; set; }
        public decimal? PACKAGE { get; set; }
        public decimal? GWTS { get; set; }
        public decimal? VWTS { get; set; }
        public string IS_DOC_REC { get; set; }
        public string IS_BOOKING_APP { get; set; }
        public string IS_RECEIVED { get; set; }
    }
}
