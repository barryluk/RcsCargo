using DbUtils.Models.Admin;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Data.SqlTypes;
using System.Data.Common;
using System.Reflection;
using System.Web.UI.WebControls.WebParts;
using DbUtils.Models.MasterRecords;

namespace DbUtils
{
    public class Admin
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        RcsFreightDBContext db;
        public Admin() 
        {
            db = new RcsFreightDBContext();
        }

        public SysCompany GetSysCompany(string companyId)
        {
            return db.SysCompanies.Where(a => a.COMPANY_ID == companyId).FirstOrDefault();
        }

        public List<SysCompanyView> GetSysCompanies()
        {
            return db.SysCompanies.Select(a => new SysCompanyView {
                COMPANY_ID = a.COMPANY_ID,
                COMPANY_NAME = a.COMPANY_NAME,
                COUNTRY_CODE = a.COUNTRY_CODE,
                PORT_CODE = a.PORT_CODE,
                EX_P_CURR_CODE = a.EX_P_CURR_CODE,
                EX_C_CURR_CODE = a.EX_C_CURR_CODE,
                IM_P_CURR_CODE = a.IM_P_CURR_CODE,
                IM_C_CURR_CODE = a.IM_C_CURR_CODE,
                EX_CURR_CODE = a.EX_P_CURR_CODE,
                IM_CURR_CODE = a.IM_P_CURR_CODE,
            }).ToList();
        }

        public List<SysModule> GetSysModules()
        {
            return db.SysModules.OrderBy(a => a.SEQUENCE).ToList();
        }

        public void RunScheduledReports(List<ReportSchedule> reportSchedules)
        {
            foreach (var reportSchedule in reportSchedules)
            {
                bool genReport = true;
                var data = db.ReportDatas.FirstOrDefault(a => a.REPORT_NAME.Equals(reportSchedule.reportName));

                if (data != null)
                {
                    if (data.LAST_RUN_TIME.AddMinutes(reportSchedule.refreshTimeMinutes) > DateTime.Now)
                        genReport = false;
                }

                if (genReport)
                {
                    //delete the old record first
                    if (data != null)
                    {
                        db.ReportDatas.Remove(data);
                        db.SaveChanges();
                    }

                    DataTable dt = new DataTable();
                    OracleConnection conn = new OracleConnection(db.Database.Connection.ConnectionString + ";Password=RCSHKG");
                    OracleCommand cmd = new OracleCommand();
                    cmd.Connection = conn;
                    cmd.CommandText = reportSchedule.sqlCmd;
                    OracleDataAdapter adapter = new OracleDataAdapter(cmd);

                    try
                    {
                        if (conn.State != ConnectionState.Open)
                        {
                            conn.Open();
                        }
                        adapter.Fill(dt);
                    }
                    catch (Exception ex)
                    {
                        dt.Columns.Add("Error");
                        dt.Rows.Add(ex.Message);
                    }
                    finally
                    {
                        conn.Close();
                        conn.Dispose();
                    }

                    var jsonResult = JsonConvert.SerializeObject(dt);
                    var reportData = new ReportData
                    {
                        REPORT_NAME = reportSchedule.reportName,
                        LAST_RUN_TIME = DateTime.Now,
                        DATA = jsonResult
                    };
                    db.ReportDatas.Add(reportData);
                    db.SaveChanges();
                }
            }
        }

        public ReportData GetReportData(string reportName)
        {
            if (db.ReportDatas.Count(a => a.REPORT_NAME == reportName) == 1)
                return db.ReportDatas.Find(reportName);
            else
                return null;
        }

        #region User, Login, UserLog

        public List<User> GetUsers(string searchValue)
        {
            var dbParas = new List<DbParameter>
            {
                new DbParameter { FieldName = "user_id", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "upper(name)", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
                new DbParameter { FieldName = "upper(email)", ParaName = "searchValue", ParaCompareType = DbParameter.CompareType.like, Value = searchValue, OrGroupIndex = 1 },
            };
            var result = Utils.GetSqlQueryResult<User>("web_user", "*", dbParas);
            return result.ToList();
        }

        public User GetUser(string userId)
        {
            var user = db.Users.AsNoTracking().Where(a => a.USER_ID.Equals(userId, StringComparison.OrdinalIgnoreCase) ||
                a.EMAIL.Equals(userId, StringComparison.OrdinalIgnoreCase)).FirstOrDefault();

            if (user != null)
            {
                user.UserCompanies = db.UserCompanies.Where(a => a.USER_ID.Equals(user.USER_ID)).ToList();
                user.UserGroups = db.UserGroups.Where(a => a.USER_ID.Equals(user.USER_ID)).ToList();
            }
            return user;
        }

        public void AddUser(User user)
        {
            try
            {
                db.Users.Add(user);
                db.UserCompanies.AddRange(user.UserCompanies);
                db.UserGroups.AddRange(user.UserGroups);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void UpdateUser(User user)
        {
            try
            {
                db.Entry(user).State = EntityState.Modified;
                var userCompanies = db.UserCompanies.Where(a => a.USER_ID == user.USER_ID);
                var userGroups = db.UserGroups.Where(a => a.USER_ID == user.USER_ID);

                if (userCompanies != null)
                {
                    db.UserCompanies.RemoveRange(userCompanies);
                    db.UserCompanies.AddRange(user.UserCompanies);
                }
                if (userGroups != null)
                {
                    db.UserGroups.RemoveRange(userGroups);
                    db.UserGroups.AddRange(user.UserGroups);
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public void DeleteUser(string userId)
        {
            try
            {
                var user = db.Users.FirstOrDefault(a => a.USER_ID == userId);
                var userCompanies = db.UserCompanies.Where(a => a.USER_ID == userId);
                var userGroups = db.UserGroups.Where(a => a.USER_ID == userId);

                if (user != null)
                    db.Users.Remove(user);

                if (userCompanies != null)
                    db.UserCompanies.RemoveRange(userCompanies);

                if (userGroups != null)
                    db.UserGroups.RemoveRange(userGroups);

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                log.Error(Utils.FormatErrorMessage(ex));
            }
        }

        public bool IsExistingUserId(string userId)
        {
            return db.Users.Count(a => a.USER_ID == userId) == 1 ? true : false;
        }

        public bool IsExistingUserEmail(string email)
        {
            return db.Users.Count(a => a.EMAIL == email) == 1 ? true : false;
        }

        public string IsValidLogin(string userId, string password)
        {
            string status = string.Empty;
            var user = db.Users.Where(a => a.USER_ID.Equals(userId, StringComparison.OrdinalIgnoreCase) || 
                a.EMAIL.Equals(userId, StringComparison.OrdinalIgnoreCase)).FirstOrDefault();

            if (user != null)
            {
                if (user.PASSWORD.Equals(password))
                    status = "success";
                else
                    status = "password_incorrect";
            }
            else
                status = "user_not_found";

            return status;
        }

        public List<UserLog> GetUserLogs()
        {
            return db.UsersLogs.ToList();
        }

        public void AddUserLog(UserLog userLog)
        {
            var oldUserLog = db.UsersLogs.Where(a => a.USER_ID.Equals(userLog.USER_ID) && a.APP_NAME == "RCS Cargo");
            if (oldUserLog != null)
                db.UsersLogs.RemoveRange(oldUserLog);

            db.UsersLogs.Add(userLog);
            db.SaveChanges();
        }

        public bool UpdateLastRequestTime(string userId, string sessionId, string hostAddress, string browserInfo)
        {
            bool status = true;
            var userLog = db.UsersLogs.Where(a => a.USER_ID.Equals(userId)).FirstOrDefault();
            if (userLog != null)
            {
                try
                {
                    if (userLog.SESSION_ID.Equals(sessionId))
                    {
                        userLog.LAST_REQUEST = DateTime.Now;
                        userLog.USER_HOST_ADDRESS = hostAddress;
                        userLog.BROWSER_INFO = browserInfo;
                        db.Entry(userLog).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    else
                    {
                        var newUserLog = new UserLog
                        {
                            SESSION_ID = sessionId,
                            LAST_REQUEST = DateTime.Now,
                            USER_ID = userId,
                            COMPANY_ID = userLog.COMPANY_ID,
                            USER_HOST_ADDRESS = userLog.USER_HOST_ADDRESS,
                            APP_NAME = "RCS Cargo",
                            BROWSER_INFO = userLog.BROWSER_INFO,
                            LOGIN_TIME = userLog.LOGIN_TIME,
                        };
                        db.UsersLogs.Remove(userLog);
                        db.UsersLogs.Add(newUserLog);
                        db.SaveChanges();
                    }
                }
                catch (Exception ex) { log.Error(Utils.FormatErrorMessage(ex)); }
            }
            else
                status = false;

            return status;
        }

        public UserLog GetUserLog(string userId)
        {
            return db.UsersLogs.FirstOrDefault(a => a.USER_ID.Equals(userId) && a.APP_NAME == "RCS Cargo");
        }

        public bool DeleteUserLog(string userId)
        {
            var userLog = db.UsersLogs.FirstOrDefault(a => a.USER_ID.Equals(userId) && a.APP_NAME == "RCS Cargo");
            if (userLog != null)
            {
                db.UsersLogs.Remove(userLog);
                db.SaveChanges();
                log.Info($"User Log deleted: {userId}");
                return true;
            }
            else
                return false;
        }

        public bool IsValidToken(string token)
        {
            return db.UsersLogs.Count(a => a.SESSION_ID.Equals(token)) == 1 ? true : false;
        }

        public bool IsUserLogExist(string userId)
        {
            return db.UsersLogs.Count(a => a.USER_ID.Equals(userId) && a.APP_NAME == "RCS Cargo") == 1 ? true : false;
        }

        #endregion

        #region Sequence Numbers

        public List<string> GetSeqTypes()
        {
            return db.SeqFormats.Select(a => a.SEQ_TYPE).Distinct().ToList();
        }

        private string GetRCSCFSLAX_InvoiceNo(string keyValue)
        {
            try
            {
                db = new RcsFreightDBContext();
                keyValue = string.IsNullOrEmpty(keyValue) ? " " : keyValue;
                var firstNo = "S00250001";
                var subNos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                var subNoSeq = 0;
                var airNo = string.Empty;
                var seaNo = string.Empty;
                var seqNo = string.Empty;

                if (db.Invoices.Count(a => a.COMPANY_ID == "RCSCFSLAX" && a.HAWB_NO == keyValue) > 0)
                {
                    airNo = db.Invoices.Where(a => a.COMPANY_ID == "RCSCFSLAX" && a.HAWB_NO == keyValue).Select(a => a.INV_NO).Max();
                    log.Debug("2a:" + airNo);
                    var invNo = db.Invoices.Where(a => a.COMPANY_ID == "RCSCFSLAX" && a.HAWB_NO == keyValue && a.INV_NO.Contains("/"))
                        .Select(a => a.INV_NO).Max();

                    log.Debug("2b:" + invNo);
                    if (!string.IsNullOrEmpty(invNo))
                    {
                        subNoSeq = subNos.IndexOf(invNo.Substring(invNo.IndexOf("/") + 1));
                        subNoSeq++;
                        airNo = $"S{ParseInvNo(airNo).ToString().PadLeft(8, '0')}/{subNos.Substring(subNoSeq, 1)}";
                    }
                    else
                        airNo = $"S{ParseInvNo(airNo).ToString().PadLeft(8, '0')}/A";

                    seqNo = airNo;
                }
                else
                {
                    airNo = db.Invoices.Where(a => a.COMPANY_ID == "RCSCFSLAX" && !a.INV_NO.Contains("/")).Select(a => a.INV_NO).Max();
                    if (!string.IsNullOrEmpty(airNo))
                        airNo = $"S{(ParseInvNo(airNo) + 1).ToString().PadLeft(8, '0')}";
                    else
                        airNo = firstNo;

                    log.Debug("2c:" + airNo);
                }

                if (db.SeaInvoices.Count(a => a.COMPANY_ID == "RCSCFSLAX" && a.JOB_NO == keyValue) > 0)
                {
                    seaNo = db.SeaInvoices.Where(a => a.COMPANY_ID == "RCSCFSLAX" && a.JOB_NO == keyValue).Select(a => a.INV_NO).Max();
                    log.Debug("3a:" + seaNo);
                    var invNo = db.SeaInvoices.Where(a => a.COMPANY_ID == "RCSCFSLAX" && a.JOB_NO == keyValue && a.INV_NO.Contains("/"))
                        .Select(a => a.INV_NO).Max();

                    log.Debug("3b:" + invNo);
                    if (!string.IsNullOrEmpty(invNo))
                    {
                        subNoSeq = subNos.IndexOf(invNo.Substring(invNo.IndexOf("/") + 1));
                        subNoSeq++;
                        seaNo = $"S{ParseInvNo(seaNo).ToString().PadLeft(8, '0')}/{subNos.Substring(subNoSeq, 1)}";
                    }
                    else
                        seaNo = $"S{ParseInvNo(seaNo).ToString().PadLeft(8, '0')}/A";

                    seqNo = seaNo;
                }
                else
                {
                    seaNo = db.SeaInvoices.Where(a => a.COMPANY_ID == "RCSCFSLAX" && !a.INV_NO.Contains("/")).Select(a => a.INV_NO).Max();
                    if (!string.IsNullOrEmpty(seaNo))
                        seaNo = $"S{(ParseInvNo(seaNo) + 1).ToString().PadLeft(8, '0')}";
                    else
                        seaNo = firstNo;

                    log.Debug("3c:" + seaNo);
                }

                log.Debug("Air#: " + airNo + ", Sea#: " + seaNo);
                if (string.IsNullOrEmpty(seqNo))
                    seqNo = ParseInvNo(airNo) > ParseInvNo(seaNo) ? airNo : seaNo;

                log.Debug("Invoice#: " + seqNo);
                return seqNo;
            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                return ex.Message;
            }
        }

        private int ParseInvNo(string invNo)
        {
            if (invNo.Length >= 9)
                return invNo.Substring(1, 8).ParseInt() ?? 0;
            else
                return 0;
        }

        public string GetSequenceNumber(string seqType, string companyId, string origin, string dest, DateTime? date, int seqNoCount = 1)
        {
            if (seqType == "RCSCFSLAX_InvoiceNo")
                return GetRCSCFSLAX_InvoiceNo(origin);
            else
            {
                db = new RcsFreightDBContext();
                string formattedNumber = string.Empty;
                var seqFormat = db.SeqFormats.Where(a => a.SEQ_TYPE == seqType && a.COMPANY_ID == companyId).FirstOrDefault();
                if (string.IsNullOrEmpty(seqFormat.PREFIX))
                    seqFormat.PREFIX = string.Empty;
                if (string.IsNullOrEmpty(seqFormat.PREFIX2))
                    seqFormat.PREFIX2 = string.Empty;
                if (string.IsNullOrEmpty(seqFormat.SUFFIX))
                    seqFormat.SUFFIX = string.Empty;
                if (string.IsNullOrEmpty(seqFormat.CONDITION))
                    seqFormat.CONDITION = string.Empty;
                decimal seqNo = this.GetLastSeqNo(seqFormat, date);
                //log.Debug("LastSeqNo: " + seqNo);
                seqNo = this.GetNextSeqNo(seqFormat, seqNo);
                //log.Debug("NextSeqNo: " + seqNo);

                var result = string.Empty;
                for (int i = 0; i < seqNoCount; i++)
                {
                    #region PREFIX

                    if (seqFormat.PREFIX.Equals("MONTHLY"))
                    {
                        if (date.HasValue)
                            formattedNumber = date.Value.ToString("yyMM");
                        else
                            formattedNumber = DateTime.Now.ToString("yyMM");
                    }
                    else if (seqFormat.PREFIX.Equals("MONTHLY/"))
                    {
                        if (date.HasValue)
                            formattedNumber = date.Value.ToString("yy/MM/");
                        else
                            formattedNumber = DateTime.Now.ToString("yy/MM/");
                    }
                    else if (seqFormat.PREFIX.Contains("ORIGIN"))
                    {
                        formattedNumber = seqFormat.PREFIX.Substring(0, seqFormat.PREFIX.IndexOf("ORIGIN")) +
                            origin + seqFormat.PREFIX.Substring(seqFormat.PREFIX.LastIndexOf("ORIGIN") + 6);
                    }
                    else if (seqFormat.PREFIX.Contains("DEST"))
                    {
                        formattedNumber = seqFormat.PREFIX.Substring(0, seqFormat.PREFIX.IndexOf("DEST")) +
                            dest + seqFormat.PREFIX.Substring(seqFormat.PREFIX.LastIndexOf("DEST") + 4);
                    }
                    else
                        formattedNumber = seqFormat.PREFIX;

                    #endregion

                    #region PREFIX2

                    if (seqFormat.PREFIX2.Equals("MONTHLY"))
                    {
                        if (date.HasValue)
                            formattedNumber += date.Value.ToString("yyMM");
                        else
                            formattedNumber += DateTime.Now.ToString("yyMM");
                    }
                    else if (seqFormat.PREFIX2.Equals("MONTHLY/"))
                    {
                        if (date.HasValue)
                            formattedNumber += date.Value.ToString("yy/MM/");
                        else
                            formattedNumber += DateTime.Now.ToString("yy/MM/");
                    }
                    else if (seqFormat.PREFIX2.Contains("ORIGIN"))
                    {
                        formattedNumber += seqFormat.PREFIX2.Substring(0, seqFormat.PREFIX2.IndexOf("ORIGIN")) +
                            origin + seqFormat.PREFIX2.Substring(seqFormat.PREFIX2.LastIndexOf("ORIGIN") + 6);
                    }
                    else if (seqFormat.PREFIX2.Contains("DEST"))
                    {
                        formattedNumber += seqFormat.PREFIX2.Substring(0, seqFormat.PREFIX2.IndexOf("DEST")) +
                            dest + seqFormat.PREFIX2.Substring(seqFormat.PREFIX2.LastIndexOf("DEST") + 4);
                    }
                    else
                        formattedNumber += seqFormat.PREFIX2;

                    #endregion

                    formattedNumber += seqNo.ToString().PadLeft(Convert.ToInt16(seqFormat.DIGIT_LENGTH), '0');

                    #region SUFFIX

                    if (seqFormat.SUFFIX.Equals("MONTHLY"))
                    {
                        if (date.HasValue)
                            formattedNumber += date.Value.ToString("yyMM");
                        else
                            formattedNumber += DateTime.Now.ToString("yyMM");
                    }
                    else if (seqFormat.SUFFIX.Equals("MONTHLY/"))
                    {
                        if (date.HasValue)
                            formattedNumber += date.Value.ToString("yy/MM/");
                        else
                            formattedNumber += DateTime.Now.ToString("yy/MM/");
                    }
                    else if (seqFormat.SUFFIX.Contains("ORIGIN"))
                    {
                        formattedNumber += seqFormat.SUFFIX.Substring(0, seqFormat.SUFFIX.IndexOf("ORIGIN")) +
                            origin + seqFormat.SUFFIX.Substring(seqFormat.SUFFIX.LastIndexOf("ORIGIN") + 6);
                    }
                    else if (seqFormat.SUFFIX.Contains("DEST"))
                    {
                        formattedNumber += seqFormat.SUFFIX.Substring(0, seqFormat.SUFFIX.IndexOf("DEST")) +
                            dest + seqFormat.SUFFIX.Substring(seqFormat.SUFFIX.LastIndexOf("DEST") + 4);
                    }
                    else
                        formattedNumber += seqFormat.SUFFIX;

                    #endregion

                    result += formattedNumber + ",";
                    seqNo++;
                }

                return result.Substring(0, result.Length - 1);
            }
        }

        private decimal GetLastSeqNo(SeqFormat seqFormat, DateTime? date)
        {
            string sqlCmd = string.Empty;
            var dbParas = new List<OracleParameter>();
            try
            {
                if (seqFormat.SEQ_TYPE == "SE_INVOICE" && seqFormat.COMPANY_ID == "RCSHKG")
                {
                    sqlCmd = string.Format("SELECT NVL(MAX(SEQ_NO), 0) AS SEQ_NO FROM ( " +
                    "SELECT SUBSTR({0}, {1}, {2}) AS SEQ_NO " +
                    "FROM {3} WHERE COMPANY_ID IN ('RCSHKG','RCSHKG_OFF') ",
                    seqFormat.NUMBER_FIELD,
                    seqFormat.DIGIT_INDEX,
                    seqFormat.DIGIT_LENGTH,
                    seqFormat.TABLE_NAME);
                }
                else
                {
                    sqlCmd = string.Format("SELECT NVL(MAX(SEQ_NO), 0) AS SEQ_NO FROM ( " +
                    "SELECT SUBSTR({0}, {1}, {2}) AS SEQ_NO " +
                    "FROM {3} WHERE COMPANY_ID = :CompanyId ",
                    seqFormat.NUMBER_FIELD,
                    seqFormat.DIGIT_INDEX,
                    seqFormat.DIGIT_LENGTH,
                    seqFormat.TABLE_NAME);

                    dbParas.Add(new OracleParameter("CompanyId", seqFormat.COMPANY_ID));
                }

                if (!seqFormat.PREFIX.Contains("MONTHLY") && !seqFormat.PREFIX.Contains("ORIGIN") && !seqFormat.PREFIX.Contains("DEST") &&
                    !seqFormat.PREFIX2.Contains("MONTHLY") && !seqFormat.PREFIX2.Contains("ORIGIN") && !seqFormat.PREFIX2.Contains("DEST") &&
                    !seqFormat.SUFFIX.Contains("MONTHLY") && !seqFormat.SUFFIX.Contains("ORIGIN") && !seqFormat.SUFFIX.Contains("DEST"))
                {

                    if (seqFormat.SEQ_TYPE != "AE_CR_INVOICE")
                    {
                        sqlCmd += string.Format("AND {0} LIKE :NumberPREFIX ", seqFormat.NUMBER_FIELD);
                        dbParas.Add(new OracleParameter("NumberPREFIX", seqFormat.PREFIX + "%"));
                    }

                    sqlCmd += string.Format("AND LENGTH({0}) = {1} ", seqFormat.NUMBER_FIELD,
                        seqFormat.PREFIX.Length + seqFormat.PREFIX2.Length + seqFormat.DIGIT_LENGTH + seqFormat.SUFFIX.Length);
                }

                if (seqFormat.HAVE_FRT_MODE == "Y")
                {
                    sqlCmd += "AND FRT_MODE = :FrtMode ";
                    dbParas.Add(new OracleParameter("FrtMode", seqFormat.SEQ_TYPE.Substring(0, 2)));
                }
                if (!string.IsNullOrEmpty(seqFormat.CONDITION))
                    sqlCmd += seqFormat.CONDITION + " ";
                if (seqFormat.PREFIX.Contains("MONTHLY") || seqFormat.PREFIX2.Contains("MONTHLY"))
                {
                    if (seqFormat.PREFIX.Contains("/") || seqFormat.PREFIX2.Contains("/"))
                        sqlCmd += string.Format("AND {0} LIKE '%' || '{1}' || '%' ", seqFormat.NUMBER_FIELD, (date ?? DateTime.Now).ToString("yy/MM/"));
                    else
                        sqlCmd += string.Format("AND {0} LIKE '%' || '{1}' || '%' ", seqFormat.NUMBER_FIELD, (date ?? DateTime.Now).ToString("yyMM"));
                }

                //Make sure the seq number is a correct number
                sqlCmd += string.Format(" ) WHERE LENGTH(SEQ_NO) = {0} ", seqFormat.DIGIT_LENGTH);
                sqlCmd += @"AND SEQ_NO NOT LIKE '%/%'
                            AND SEQ_NO NOT LIKE '%\%'
                            AND SEQ_NO NOT LIKE '%-%'
                            AND SEQ_NO NOT LIKE '%A%'
                            AND SEQ_NO NOT LIKE '%B%'
                            AND SEQ_NO NOT LIKE '%C%'
                            AND SEQ_NO NOT LIKE '%D%'
                            AND SEQ_NO NOT LIKE '%E%'
                            AND SEQ_NO NOT LIKE '%F%'
                            AND SEQ_NO NOT LIKE '%G%'
                            AND SEQ_NO NOT LIKE '%H%'
                            AND SEQ_NO NOT LIKE '%I%'
                            AND SEQ_NO NOT LIKE '%J%'
                            AND SEQ_NO NOT LIKE '%K%'
                            AND SEQ_NO NOT LIKE '%L%'
                            AND SEQ_NO NOT LIKE '%M%'
                            AND SEQ_NO NOT LIKE '%N%'
                            AND SEQ_NO NOT LIKE '%O%'
                            AND SEQ_NO NOT LIKE '%P%'
                            AND SEQ_NO NOT LIKE '%Q%'
                            AND SEQ_NO NOT LIKE '%R%'
                            AND SEQ_NO NOT LIKE '%S%'
                            AND SEQ_NO NOT LIKE '%T%'
                            AND SEQ_NO NOT LIKE '%U%'
                            AND SEQ_NO NOT LIKE '%V%'
                            AND SEQ_NO NOT LIKE '%W%'
                            AND SEQ_NO NOT LIKE '%X%'
                            AND SEQ_NO NOT LIKE '%Y%'
                            AND SEQ_NO NOT LIKE '%Z%'";

                //log.Debug(sqlCmd);
                //foreach (var para in dbParas)
                //    log.Debug(string.Format("{0}: {1}", para.ParameterName, para.Value));

                return decimal.Parse(db.Database.SqlQuery<string>(sqlCmd, dbParas.ToArray()).FirstOrDefault());
            }
            catch (Exception ex)
            {
                log.Error(MethodBase.GetCurrentMethod().Name + Utils.FormatSqlErrorLog(ex, sqlCmd, dbParas));
                throw ex;
            }
            finally
            {
                db.Dispose();
            }
        }

        private decimal GetNextSeqNo(SeqFormat seqFormat, decimal lastSeqNo)
        {
            lastSeqNo += 1;

            if (lastSeqNo < seqFormat.DEFAULT_VALUE)
                lastSeqNo = seqFormat.DEFAULT_VALUE.Value;

            return lastSeqNo;
        }

        #endregion
    }
}
