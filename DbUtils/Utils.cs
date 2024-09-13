using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Common;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using Oracle.ManagedDataAccess.Client;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace DbUtils
{
    public static class Utils
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private static string defaultKey = "0x9_@RCS";
        private static int defaultMaxQueryRows = 1000;
        public const string dbSchema = "RCS_FREIGHT";

        public static int DefaultMaxQueryRows { get { return defaultMaxQueryRows; } }

        public static string NewGuid()
        {
            long i = 1;
            foreach (byte b in Guid.NewGuid().ToByteArray())
                i *= ((int)b + 1);
            return string.Format("{0:x}", i - DateTime.Now.Ticks).ToUpper();
        }

        public static object GetDynamicProperty(object item, string propName)
        {
            //Use reflection to get order type
            return item.GetType().GetProperty(propName).GetValue(item, null);
        }

        public static int getMaxLine(string[] lin)
        {
            int chang = lin.Length;
            for (int i = 0; i < lin.Length; i++)
            {
                if (string.IsNullOrWhiteSpace(lin[i].Trim()))
                {
                    chang = i;
                }
            }
            return chang;
        }

        public static bool ContainsAny(this string str, params string[] values)
        {
            if (!string.IsNullOrEmpty(str) || values.Length > 0)
            {
                foreach (string value in values)
                {
                    if (str.Contains(value))
                        return true;
                }
            }

            return false;
        }

        public static void SerializeObjectToXML(this object obj, string fileName = "")
        {
            XmlSerializer serializer = new XmlSerializer(obj.GetType());
            TextWriter writer = new StreamWriter($"{(fileName == "" ? "output" : fileName)}.xml");
            serializer.Serialize(writer, obj);
            writer.Close();
        }

        public static DateTime ToMinTime(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, 0, 0, 0);
        }

        public static DateTime ToMaxTime(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, 23, 59, 59);
        }

        //Special format for AEO (e.g. 69.1 -> 6910)
        public static string FormatAEONumber(this decimal number)
        {
            return number.ToString("n").Replace(".", "").Replace(",", "");
        }

        public static string FormatStringListToSqlWhere(this List<string> values)
        {
            string sqlWhere = string.Empty;
            foreach (var value in values)
            {
                sqlWhere += $"'{value}',";
            }
            if (sqlWhere.Length > 0)
                return sqlWhere.Substring(0, sqlWhere.Length - 1);
            else
                return string.Empty;
        }

        public static string FormatErrorMessage(this Exception ex, int maxChars = 0)
        {
            string message = ($"Error source: {ex.Source}, Error Message: {ex.Message}, StackTrace: {ex.StackTrace}");

            if (message.Contains("EntityValidationErrors"))
            {
                message += " ";
                DbEntityValidationException exception = ex as DbEntityValidationException;
                foreach (var item in exception.EntityValidationErrors)
                {
                    foreach (var error in item.ValidationErrors)
                    {
                        message += ($"Error PropertyName: {error.PropertyName}, Error Message: {error.ErrorMessage}\r\n");
                    }
                }
            }
            else if (ex.InnerException != null)
            {
                Exception innerException = ex.InnerException;
                message = ($"Error source: {innerException.Source}, Error Message: {innerException.Message}, StackTrace: {innerException.StackTrace}");
                while (innerException.InnerException != null)
                {
                    innerException = innerException.InnerException;
                    message = ($"Error source: {innerException.Source}, Error Message: {innerException.Message}, StackTrace: {innerException.StackTrace}");
                }
            }

            if (maxChars > 0)
                return message.Substring(0, maxChars);
            else
                return message.Trim();
        }

        public static bool SendEmailAlert(string subject, string body, List<string> recipients = null)
        {
            try
            {
                MailMessage mail = new MailMessage();
                mail.IsBodyHtml = true;
                mail.From = new MailAddress(Utils.EmailAlert);
                if (recipients != null)
                {
                    foreach (string recipient in recipients)
                        mail.To.Add(new MailAddress(recipient));
                }
                else
                    mail.To.Add(new MailAddress(Utils.EmailAlert));
                mail.Subject = subject;
                mail.Body = body;
                SmtpClient smtpClient = new SmtpClient(Utils.EmailServer);
                smtpClient.Send(mail);

                return true;
            }
            catch (Exception ex)
            {
                log.Error(ex.ToString());
                return false;
            }
        }

        public static List<T> GetSqlQueryResult<T>(string fromStatment, string selectStatment, List<DbParameter> parameters)
        {
            return RunSqlQuery<T>(fromStatment, selectStatment, parameters);
        }

        public static List<T> GetSqlQueryResult<T>(string tableName, string keyName, string keyValue, string companyId = "", string frtMode = "")
        {
            var dbParas = new List<DbParameter>();
            dbParas.Add(new DbParameter { FieldName = keyName, ParaName = keyName, ParaCompareType = DbParameter.CompareType.equals, Value = keyValue });
            if (!string.IsNullOrEmpty(companyId))
                dbParas.Add(new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId });
            if (!string.IsNullOrEmpty(frtMode))
                dbParas.Add(new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode });

            return RunSqlQuery<T>(tableName, "*", dbParas);
        }

        public static List<T> GetSqlQueryResult<T>(string tableName, string fields, string keyName, string keyValue, string companyId = "", string frtMode = "")
        {
            var dbParas = new List<DbParameter>();
            dbParas.Add(new DbParameter { FieldName = keyName, ParaName = keyName, ParaCompareType = DbParameter.CompareType.equals, Value = keyValue });
            if (!string.IsNullOrEmpty(companyId))
                dbParas.Add(new DbParameter { FieldName = "company_id", ParaName = "company_id", ParaCompareType = DbParameter.CompareType.equals, Value = companyId });
            if (!string.IsNullOrEmpty(frtMode))
                dbParas.Add(new DbParameter { FieldName = "frt_mode", ParaName = "frt_mode", ParaCompareType = DbParameter.CompareType.equals, Value = frtMode });

            return RunSqlQuery<T>(tableName, fields, dbParas);
        }

        /// Important Notes: oracle parameters
        /// Number of parameters appear in sql command must match in the parameters array, if same parameter appear twice or more in the sql command,
        /// it should also add the same in the parameter, the sequence of the parameters in the sql command should be also same as in the parameter array too!
        private static List<T> RunSqlQuery<T>(string tableName, string fields, List<DbParameter> parameters)
        {
            var sqlCmd = string.Empty;
            if (tableName.Contains(" where "))
                sqlCmd = $"select {fields} from {tableName}";
            else
                sqlCmd = $"select {fields} from {tableName} where";

            try
            {
                RcsFreightDBContext db = new RcsFreightDBContext();
                var dbParas = new List<Oracle.ManagedDataAccess.Client.OracleParameter>();

                foreach (var para in parameters.Where(a => !a.OrGroupIndex.HasValue))
                {
                    var str = sqlCmd.EndsWith("where") ? "" : "and";
                    sqlCmd += $" {str} {para.FieldName} {para.GetParaCompareOperator()} :{para.ParaName}";
                    dbParas.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(para.ParaName, para.Value));
                }
                foreach (var orGroupIndex in parameters.Where(a => a.OrGroupIndex.HasValue).Select(a => a.OrGroupIndex).Distinct())
                {
                    sqlCmd += " " + (sqlCmd.EndsWith("where") ? "(" : "and (");
                    foreach (var para in parameters.Where(a => a.OrGroupIndex == orGroupIndex))
                    {
                        var str = sqlCmd.EndsWith("(") ? "" : "or";
                        sqlCmd += $" {str} {para.FieldName} {para.GetParaCompareOperator()} :{para.ParaName}";
                        dbParas.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(para.ParaName, para.Value));
                    }
                    sqlCmd += ") ";
                }
                sqlCmd = sqlCmd.Trim().Replace("  ", " ").Replace("( ", "(");

                //Debug only, must comment for production
                //foreach (var para in parameters)
                //{
                //    log.Debug($"FieldName: {para.FieldName} | ParaName: {para.ParaName} | Value: {para.Value} | operator: {para.GetParaCompareOperator()}");
                //}
                //log.Debug(sqlCmd);

                return db.Database.SqlQuery<T>(sqlCmd, dbParas.ToArray()).Take(Utils.DefaultMaxQueryRows).ToList();
            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                log.Error(sqlCmd);
                foreach (var para in parameters)
                {
                    log.Error($"FieldName: {para.FieldName} | ParaName: {para.ParaName} | Value: {para.Value} | operator: {para.GetParaCompareOperator()}");
                }
                return null;
            }
        }

        public static string FormatSqlErrorLog(Exception ex, string sqlCmd, List<OracleParameter> paras)
        {
            StringBuilder errorMsg = new StringBuilder();
            errorMsg.AppendLine(": " + ex.Message);
            errorMsg.AppendLine("--- Command Text ---");
            errorMsg.AppendLine(sqlCmd);

            if (paras.Count > 0)
                errorMsg.AppendLine("--- Parameters ---");

            foreach (var para in paras)
                errorMsg.AppendLine(string.Format("{0}: {1}", para.ParameterName, para.Value));

            return errorMsg.ToString();
        }

        #region Decrypt / Encrypt

        public static string DESDecrypt(string text)
        {
            return string.IsNullOrEmpty(text) ? "" : DESDecrypt(text, defaultKey);  //Decrypt key must be 8 characters
        }

        public static string DESEncrypt(string text)
        {
            if (string.IsNullOrEmpty(text))
                return "";
            else
            {
                string result = DESEncrypt(text, defaultKey);
                return result;
            }
        }

        public static string DESDecrypt(string text, string encryptionKey)
        {
            try
            {
                DESCryptoServiceProvider des = new DESCryptoServiceProvider();

                byte[] inputByteArray = new byte[text.Length / 2];
                for (int x = 0; x < text.Length / 2; x++)
                {
                    int i = (Convert.ToInt32(text.Substring(x * 2, 2), 16));
                    inputByteArray[x] = (byte)i;
                }

                des.Key = ASCIIEncoding.ASCII.GetBytes(encryptionKey);
                des.IV = ASCIIEncoding.ASCII.GetBytes(encryptionKey);
                MemoryStream ms = new MemoryStream();
                CryptoStream cs = new CryptoStream(ms, des.CreateDecryptor(), CryptoStreamMode.Write);

                cs.Write(inputByteArray, 0, inputByteArray.Length);
                cs.FlushFinalBlock();

                StringBuilder ret = new StringBuilder();

                return System.Text.Encoding.Default.GetString(ms.ToArray());
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static string DESEncrypt(string stringToEncrypt, string encryptionKey)
        {
            try
            {
                DESCryptoServiceProvider des = new DESCryptoServiceProvider();
                des.Key = ASCIIEncoding.ASCII.GetBytes(encryptionKey);
                des.IV = ASCIIEncoding.ASCII.GetBytes(encryptionKey);

                byte[] inputByteArray = Encoding.Default.GetBytes(stringToEncrypt);

                MemoryStream ms = new MemoryStream();
                CryptoStream cs = new CryptoStream(ms, des.CreateEncryptor(), CryptoStreamMode.Write);
                cs.Write(inputByteArray, 0, inputByteArray.Length);
                cs.FlushFinalBlock();

                StringBuilder ret = new StringBuilder();
                foreach (byte b in ms.ToArray())
                {
                    ret.AppendFormat("{0:X2}", b);
                }
                return ret.ToString();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

        #region App Settings

        public static string EmailServer
        {
            get { return ConfigurationManager.AppSettings["EmailServer"]; }
        }

        public static string EmailAlert
        {
            get { return ConfigurationManager.AppSettings["EmailAlert"]; }
        }

        public static string DbDefaultSchema
        {
            get { return ConfigurationManager.AppSettings["DbDefaultSchema"]; }
        }

        #endregion

        #region Convert Object to Primitive Data Type

        public static string GetString(this object obj)
        {
            if (obj is string)
                return (string)obj;
            else
                return string.Empty;
        }

        public static int? GetInt(this object obj)
        {
            if (obj is int)
                return (int)obj;
            else
                return null;
        }

        public static decimal? GetDecimal(this object obj)
        {
            if (obj is decimal)
                return (decimal)obj;
            else
                return null;
        }

        public static DateTime? GetDateTime(this object obj)
        {
            if (obj is DateTime)
                return (DateTime)obj;
            else
                return null;
        }

        public static DateTime? GetDate(this object obj)
        {
            if (obj is DateTime)
            {
                return new DateTime(((DateTime)obj).Year, ((DateTime)obj).Month, ((DateTime)obj).Day);
            }
            else
                return null;
        }

        public static byte[] GetBytes(this object obj)
        {
            if (obj is byte[])
                return (byte[])obj;
            else
                return null;
        }

        public static DateTime? ParseDateTime(this string dateString, string dateFormat)
        {
            DateTime date;
            if (DateTime.TryParseExact(dateString, dateFormat, null, System.Globalization.DateTimeStyles.None, out date))
                return date;
            else
                return null;
        }

        public static decimal? ParseDecimal(this string numberString)
        {
            decimal number;
            if (decimal.TryParse(numberString, out number))
                return number;
            else
                return null;
        }

        public static int? ParseInt(this string numberString)
        {
            int number;
            if (int.TryParse(numberString, out number))
                return number;
            else
                return null;
        }

        #endregion Convert Object to Primitive Data Type

    }

    public class DbParameter
    {
        public enum CompareType { equals, greater, less, greaterEquals, lessEquals, like };
        public string FieldName { get; set; }
        public CompareType ParaCompareType { get; set; }
        public string ParaName { get; set; }
        public object Value { get; set; }
        public int? OrGroupIndex { get; set; }
        public string GetParaCompareOperator()
        {
            switch (this.ParaCompareType) 
            {
                case CompareType.equals: return "=";
                case CompareType.greater: return ">";
                case CompareType.less: return "<";
                case CompareType.greaterEquals: return ">=";
                case CompareType.lessEquals: return "<=";
                case CompareType.like: return "like";
                default: return null;
            }
        }
    }
}