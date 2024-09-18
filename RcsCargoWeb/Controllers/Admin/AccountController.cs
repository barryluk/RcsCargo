using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace RcsCargoWeb.Controllers.Admin
{
    [RoutePrefix("Admin/Account")]
    public class AccountController : Controller
    {
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

                //Add record to USER_LOG table
                var userLog = new DbUtils.Models.Admin.UserLog
                { 
                    SESSION_ID = Session.SessionID,
                    USER_ID = user.USER_ID,
                    COMPANY_ID = "RCSHKG",
                    LOGIN_TIME = DateTime.Now,
                    LAST_REQUEST = DateTime.Now,
                    USER_HOST_ADDRESS = Request.UserHostAddress,
                    BROWSER_INFO = HttpContext.Request.UserAgent,
                    APP_NAME = "RCS Cargo"
                };
                admin.AddUserLog(userLog);

                //for security issue, should not expose the password to client side
                user.PASSWORD = string.Empty;
                jsonResult = "{ \"result\": \"success\", \"sessionId\": \"" + Session.SessionID + "\", \"user\": " + JsonConvert.SerializeObject(user) + " }";
            }
            else
                jsonResult = "{ \"result\": \"" + resultMsg + "\" }";

            return Content(jsonResult, "application/json");
        }

        [Route("GetSessionStatus")]
        public ActionResult GetSessionStatus(string userId)
        {
            DbUtils.Admin admin = new DbUtils.Admin();
            var jsonResult = string.Empty;
            bool status = admin.IsUserLogExist(userId);

            if (status)
            {
                admin.UpdateLastRequestTime(userId, Session.SessionID);
                jsonResult = "{ \"result\": \"success\", \"sessionId\": \"" + Session.SessionID + "\" }";
            }
            else
                jsonResult = "{ \"result\": \"error\" }";

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