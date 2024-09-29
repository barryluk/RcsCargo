using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Xml.Linq;

namespace RcsCargoWeb
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        string scriptPath = string.Empty;

        protected void Application_Start()
        {
            scriptPath = System.Web.HttpContext.Current.Server.MapPath("~/Scripts/rcsCargo");
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            var timer = new System.Timers.Timer();
            timer.Enabled = true;
            timer.Interval = 1000 * 60;
            timer.Elapsed += Timer_Elapsed;
            timer.Start();

            UpdateScriptVersion();
        }

        private void Timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            try
            {
                XElement xe = XElement.Load(System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/reports_schedule.xml"));
                List<DbUtils.Models.Admin.ReportSchedule> reportSchedules = (from a in xe.Descendants("Table")
                                                                             select new DbUtils.Models.Admin.ReportSchedule
                                                                             {
                                                                                 reportName = a.Element("reportName").Value,
                                                                                 refreshTimeMinutes = int.Parse(a.Element("refreshTimeMinutes").Value),
                                                                                 sqlCmd = a.Element("sqlCmd").Value
                                                                             }).ToList();

                //log.Debug("Timer_Elapsed");
                var admin = new DbUtils.Admin();
                admin.RunScheduledReports(reportSchedules);

                UpdateScriptVersion();
            }
            catch (Exception ex)
            {
                log.Error(ex.ToString());
            }
        }

        private void UpdateScriptVersion()
        {
            var directory = new System.IO.DirectoryInfo(scriptPath);
            directory.Refresh();

            var scriptFile = directory.GetFiles("*.*", System.IO.SearchOption.TopDirectoryOnly)
                .OrderByDescending(f => f.LastWriteTime).FirstOrDefault();
            AppUtils.scriptVersion = scriptFile.LastWriteTime.ToString("yyyyMMddHHmmss");

            //var scriptFiles = directory.GetFiles("*.*", System.IO.SearchOption.TopDirectoryOnly);
            //foreach (var file in scriptFiles)
            //{
            //    file.Refresh();
            //    log.Debug(file.Name + ", " + file.LastWriteTime.ToString());
            //}
        }
    }
}
