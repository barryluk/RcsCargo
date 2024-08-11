using DbUtils.Models.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbUtils
{
    public class Admin
    {
        RcsFreightDBContext db;
        public Admin() 
        {
            db = new RcsFreightDBContext();
        }

        public List<SysModule> GetSysModules()
        {
            return db.SysModules.OrderBy(a => a.SEQUENCE).ToList();
        }

    }
}
