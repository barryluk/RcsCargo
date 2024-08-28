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

        public List<SysCompanyView> GetSysCompanies()
        {
            return db.SysCompanies.Select(a => new SysCompanyView {
                COMPANY_ID = a.COMPANY_ID,
                COMPANY_NAME = a.COMPANY_NAME,
                COUNTRY_CODE = a.COUNTRY_CODE,
                PORT_CODE = a.PORT_CODE,
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

        public void AddUserLog(UserLog userLog)
        {
            var oldUserLog = db.UsersLogs.Where(a => a.USER_ID.Equals(userLog.USER_ID)).FirstOrDefault();
            if (oldUserLog != null)
                db.UsersLogs.Remove(oldUserLog);

            db.UsersLogs.Add(userLog);
            db.SaveChanges();
        }

        public bool UpdateLastRequestTime(string userId, string sessionId)
        {
            bool status = true;
            var userLog = db.UsersLogs.Where(a => a.USER_ID.Equals(userId)).FirstOrDefault();
            if (userLog != null)
            {
                if (userLog.SESSION_ID.Equals(sessionId))
                {
                    userLog.LAST_REQUEST = DateTime.Now;
                    db.Entry(userLog).State = EntityState.Modified;
                    db.SaveChanges();
                }
                else
                {
                    var newUserLog = userLog;
                    db.UsersLogs.Remove(userLog);

                    newUserLog.SESSION_ID = sessionId;
                    newUserLog.LAST_REQUEST = DateTime.Now;
                    db.UsersLogs.Add(newUserLog);
                    db.SaveChanges();
                }
            }
            else
                status = false;

            return status;
        }

        public UserLog GetUserLog(string userId)
        {
            return db.UsersLogs.FirstOrDefault(a => a.USER_ID.Equals(userId));
        }

        public bool DeleteUserLog(string userId)
        {
            var userLog = db.UsersLogs.FirstOrDefault(a => a.USER_ID.Equals(userId));
            if (userLog != null)
            {
                db.UsersLogs.Remove(userLog);
                db.SaveChanges();
                return true;
            }
            else
                return false;
        }

        public bool IsUserLogExist(string userId)
        {
            return db.UsersLogs.Count(a => a.USER_ID.Equals(userId)) == 1 ? true : false;
        }
    }
}
