using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RcsCargoWeb.Controllers.Air
{
    [RoutePrefix("AirFreight/Test")]
    public class TestController : Controller
    {
        //[Route]: AirFreight/Test
        //[Route("Index")]: AirFreight/Test/Index
        //[Route("{id?}")]: AirFreight/Test/2
        //[Route("products/{id:int}")]: AirFreight/Test/products/{int id}
        //[Route("products/{id:alpha}")]: AirFreight/Test/products/{string id}

        [Route]
        public ActionResult Index()
        {
            return Content("index action");
        }

        [Route("RunReport")]
        public ActionResult RunReport()
        {
            //DbUtils.Admin admin = new DbUtils.Admin();
            //admin.RunScheduledReport("ShipmentReport", @"
            //    select a.origin_code, flight_date, sum(a.cwts) as cwts
            //    from (select distinct origin_code, trunc(flight_date, 'mm') as flight_date,
            //    sum(nvl(case when gwts > vwts then gwts else vwts end, 0)) as cwts
            //    from a_mawb
            //    where company_id not in ('RCSHKG_OFF') 
            //    and job is not null
            //    and job_type = 'D'
            //    and frt_mode = 'AE'
            //    group by trunc(flight_date, 'mm'), origin_code
            //    union
            //    select distinct m.origin_code, trunc(m.flight_date, 'mm') as flight_date,
            //    sum(nvl(case when h.gwts > h.vwts then h.gwts else h.vwts end, 0)) as cwts
            //    from a_mawb m left outer join a_hawb h on m.mawb = h.mawb_no and m.company_id = h.company_id and m.frt_mode = h.frt_mode
            //    where m.company_id not in ('RCSHKG_OFF') 
            //    and m.job is not null
            //    and m.job_type = 'C'
            //    and m.frt_mode = 'AE'
            //    group by trunc(flight_date, 'mm'), m.origin_code) a
            //    group by a.flight_date, a.origin_code
            //    order by a.origin_code, a.flight_date");

            return Content("Done");
        }
    }
}