using System.Web.Mvc;

namespace RcsCargoWeb.Areas.Air
{
    public class AirAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Air";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Air_default",
                "Air/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}