using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace DbUtils
{
    public static class Utils
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private static string defaultKey = "0x9_@RCS";
        private static int defaultMaxQueryRows = 1000;

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
}
