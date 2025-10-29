using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DbUtils.Models.Admin;
using Newtonsoft.Json;

namespace RcsCargoWeb.Controllers.Admin
{
    [RoutePrefix("Admin/Account")]
    public class AccountController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        [Route("VerifyLogin")]
        public ActionResult VerifyLogin(string userId, string password)
        {
            DbUtils.Admin admin = new DbUtils.Admin();

            //resultMsg(string): success / password_incorrect / user_not_found
            //contentType(string): application/json; text/plain
            var resultMsg = admin.IsValidLogin(userId, password);
            var jsonResult = string.Empty;
            if (resultMsg == "success")
            {
                var user = admin.GetUser(userId);

                //DEFAULT_COMPANY is mandatory for UserLog
                if (string.IsNullOrEmpty(user.DEFAULT_COMPANY))
                    user.DEFAULT_COMPANY = user.UserCompanies.FirstOrDefault().COMPANY_ID;

                //Add record to USER_LOG table
                var userLog = new DbUtils.Models.Admin.UserLog
                {
                    SESSION_ID = DbUtils.Utils.NewGuid(),
                    USER_ID = user.USER_ID,
                    COMPANY_ID = user.DEFAULT_COMPANY,
                    LOGIN_TIME = DateTime.Now,
                    LAST_REQUEST = DateTime.Now,
                    USER_HOST_ADDRESS = Request.UserHostAddress,
                    BROWSER_INFO = HttpContext.Request.UserAgent,
                    APP_NAME = "RCS Cargo",
                    //DETAIL_INFO = $"{user.USER_ID},{Request.UserHostAddress}"
                };
                try 
                { 
                    admin.AddUserLog(userLog);
                    AppUtils.userLogs = admin.GetUserLogs();
                }
                catch (Exception ex) { log.Error(DbUtils.Utils.FormatErrorMessage(ex)); }

                //for security issue, should not expose the password to client side
                user.PASSWORD = string.Empty;
                jsonResult = "{ \"result\": \"success\", \"token\": \"" + userLog.SESSION_ID + "\", \"user\": " + JsonConvert.SerializeObject(user) + " }";
            }
            else
                jsonResult = "{ \"result\": \"" + resultMsg + "\" }";

            return Content(jsonResult, "application/json");
        }

        [CheckToken]
        [Route("GetSessionStatus")]
        public ActionResult GetSessionStatus(string userId, string companyId)
        {
            DbUtils.Admin admin = new DbUtils.Admin();
            var jsonResult = string.Empty;
            bool status = admin.IsUserLogExist(userId);

            try
            {
                if (status)
                {
                    var token = HttpContext.Request.Headers["token"];
                    admin.UpdateLastRequestTime(userId, companyId, token, Request.UserHostAddress, HttpContext.Request.UserAgent);
                    jsonResult = "{ \"result\": \"success\", \"token\": \"" + token + "\" }";
                }
                else
                    jsonResult = "{ \"result\": \"error\" }";
            }
            catch (Exception ex)
            {
                jsonResult = "{ \"result\": \"error\", \"errorMessage\": \"" + ex.Message + "\" }";
                log.Error(DbUtils.Utils.FormatErrorMessage(ex));
            }

            return Content(jsonResult, "application/json");
        }

        [Route("Logout")]
        public ActionResult Logout(string userId)
        {
            DbUtils.Admin admin = new DbUtils.Admin();
            var jsonResult = string.Empty;
            bool status = admin.DeleteUserLog(userId);

            if (status)
                jsonResult = "{ \"result\": \"success\" }";
            else
                jsonResult = "{ \"result\": \"error\" }";

            return Content(jsonResult, "application/json");
        }

        [CheckToken]
        [Route("GetUser")]
        public ActionResult GetUser(string userId)
        {
            DbUtils.Admin admin = new DbUtils.Admin();
            var user = admin.GetUser(userId);
            user.PASSWORD = string.Empty;
            return Json(user, JsonRequestBehavior.AllowGet);
        }
    }
}