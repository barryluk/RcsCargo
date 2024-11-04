using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;

namespace DbUtils.Models.Sea
{
    [Table("S_VOYAGE")]
    public class Voyage
    {
        [Key]
        [Column(Order = 1)]
        public string VES_CODE { get; set; }
        [Key]
        [Column(Order = 2)]
        public string VOYAGE { get; set; }
        [Key]
        [Column(Order = 3)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 4)]
        public string FRT_MODE { get; set; }
        public string CARRIER_CODE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public string MODIFY_USER { get; set; }
        public DateTime MODIFY_DATE { get; set; }
        [NotMapped]
        public List<VoyageDetail> LoadingPorts { get; set; }
        [NotMapped]
        public List<VoyageDetail> DischargePorts { get; set; }

        public Voyage()
        {
            LoadingPorts = new List<VoyageDetail>();
            DischargePorts = new List<VoyageDetail>();
        }
    }

    [Table("S_VOYAGE_DETAIL")]
    public class VoyageDetail
    {
        [Key]
        [Column(Order = 1)]
        public string VES_CODE { get; set; }
        [Key]
        [Column(Order = 2)]
        public string VOYAGE { get; set; }
        [Key]
        [Column(Order = 3)]
        public string COMPANY_ID { get; set; }
        [Key]
        [Column(Order = 4)]
        public string FRT_MODE { get; set; }
        [Key]
        [Column(Order = 5)]
        public string ORIGIN_DEST { get; set; }
        [Key]
        [Column(Order = 6)]
        public string PORT_CODE { get; set; }
        public string COUNTRY_CODE { get; set; }
        public DateTime? ARRIVAL_DATE { get; set; }
        public DateTime? DEPARTURE_DATE { get; set; }
        public DateTime? CY_CLOSING_DATE { get; set; }
        public DateTime? CFS_CLOSING_DATE { get; set; }
    }

    public class VoyageView
    {
        public string VES_CODE { get; set; }
        public string VES_DESC { get; set; }
        public string VOYAGE { get; set; }
        public string COMPANY_ID { get; set; }
        public string FRT_MODE { get; set; }
        public string CARRIER_CODE { get; set; }
        public string LOADING_PORT { get; set; }
        public string DISCHARGE_PORT { get; set; }
        public DateTime LOADING_PORT_DATE { get; set; }
        public DateTime? DISCHARGE_PORT_DATE { get; set; }
        public string CREATE_USER { get; set; }
        public DateTime CREATE_DATE { get; set; }
    }
}
