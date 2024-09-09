using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace RcsCargoWeb
{
    public static class AppUtils
    {
        public static readonly int takeRecords = 25;
        public static ContentResult JsonContentResult(IEnumerable<object> obj, int skip = 0, int take = 0)
        {
            string jsonString = string.Empty;
            if (take == 0)
                jsonString =  "{\"Data\":" + JsonConvert.SerializeObject(obj) + ",\"Total\":" + obj.Count().ToString() + "}";
            else
                jsonString =  "{\"Data\":" + JsonConvert.SerializeObject(obj.Skip(skip).Take(take)) + ",\"Total\":" + obj.Count().ToString() + "}";

            ContentResult result = new ContentResult();
            result.Content = jsonString;
            result.ContentType = "application/json";
            return result;
        }
    }
}