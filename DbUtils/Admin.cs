using DbUtils.Models.Admin;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
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

    }
}
