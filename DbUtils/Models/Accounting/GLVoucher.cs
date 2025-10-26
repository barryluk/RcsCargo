using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DbUtils.Models.Accounting
{
    [Table("AC_GL_VOUCHER")]
    public class GLVoucher
    {
        [Key]
        public decimal ID { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int? VOUCHER_NO { get; set; }
        public string VOUCHER_TYPE { get; set; }
        public int LINE_NO { get; set; }
        public string AC_CODE { get; set; }
        [NotMapped]
        public string AC_NAME { get; set; }
        public string DESC_TEXT { get; set; }
        public decimal DR_AMT { get; set; }
        public decimal CR_AMT { get; set; }
        public string INV_NO { get; set; }
        public DateTime? INV_DATE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string VENDOR_CODE { get; set; }
        public string DEP_CODE { get; set; }
        public string PERSON_CODE { get; set; }
        public string RELATED_AC { get; set; }
        public DateTime VOUCHER_DATE { get; set; }
        public string CBILL { get; set; }
        public string CCHECK { get; set; }
        public string CCASHIER { get; set; }
        public int IBOOK { get; set; }
    }

    [Table("AC_VOUCHER_DESC")]
    public class VoucherDesc
    {
        [Key]
        public string ID { get; set; }
        public string DESC_TEXT { get; set; }
    }

    public class Voucher
    {
        [Key]
        public decimal ID { get; set; }
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int? VOUCHER_NO { get; set; }
        public string VOUCHER_TYPE { get; set; }
        public int LINE_NO { get; set; }
        public string AC_CODE { get; set; }
        public string AC_NAME { get; set; }
        public string DESC_TEXT { get; set; }
        public decimal DR_AMT { get; set; }
        public decimal CR_AMT { get; set; }
        public string INV_NO { get; set; }
        public DateTime? INV_DATE { get; set; }
        public string CUSTOMER_CODE { get; set; }
        public string VENDOR_CODE { get; set; }
        public string DEP_CODE { get; set; }
        public string PERSON_CODE { get; set; }
        public string RELATED_AC { get; set; }
        public DateTime VOUCHER_DATE { get; set; }
        public string CBILL { get; set; }
        public string CCHECK { get; set; }
        public string CCASHIER { get; set; }
        public int IBOOK { get; set; }
    }

    public class VoucherView
    {
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public string VOUCHER_NO { get; set; }
        public DateTime VOUCHER_DATE { get; set; }
        public string DESC_TEXT { get; set; }
        public decimal DR_AMT { get; set; }
        public decimal CR_AMT { get; set; }
        public string CBILL { get; set; }
        public string CCHECK { get; set; }
        public int IBOOK { get; set; }
    }

    public class VoucherModel
    {
        public int YEAR { get; set; }
        public int PERIOD { get; set; }
        public int VOUCHER_NO { get; set; }
        public DateTime VOUCHER_DATE { get; set; }
        public string CBILL { get; set; }
        public List<GLVoucher> Vouchers { get; set; }
    }

}
