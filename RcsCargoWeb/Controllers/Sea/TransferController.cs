using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using DbUtils;
using Newtonsoft.Json;
using DbUtils.Models.Sea;
using System.ComponentModel.Design;
using System.Web.Configuration;
using Kendo.Mvc.Infrastructure;
using DbUtils.Models.Admin;
using Reporting.DataService.AirFreightReport;
using Reporting.DataService.SeaFreightReport;
using DbUtils.Models.Air;

namespace RcsCargoWeb.Sea.Controllers
{

    [RoutePrefix("Sea/Transfer")]
    public class TransferController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        DbUtils.Sea sea = new DbUtils.Sea();
        DbUtils.Admin admin = new DbUtils.Admin();

        [Route("GridTransferList_Read")]
        public ActionResult GridTransferList_Read(string hblNo, string vesCode, string voyage, string companyId, string frtMode, DateTime dateFrom, DateTime dateTo,
            [Bind(Prefix = "sort")] IEnumerable<Dictionary<string, string>> sortings, int take = 25, int skip = 0)
        {
            hblNo = hblNo.Trim().ToUpper() + "%";
            vesCode = vesCode.Trim().ToUpper() + "%";
            voyage = voyage.Trim().ToUpper() + "%";
            var sortField = "LOADING_PORT_DATE";
            var sortDir = "desc";

            if (sortings != null)
            {
                sortField = sortings.First().Single(a => a.Key == "field").Value;
                sortDir = sortings.First().Single(a => a.Key == "dir").Value;
            }

            var results = sea.GetTransferList(dateFrom, dateTo, companyId, frtMode, hblNo, vesCode, voyage);

            if (!string.IsNullOrEmpty(sortField) && !string.IsNullOrEmpty(sortDir))
            {
                if (sortDir == "asc")
                    results = results.OrderBy(a => Utils.GetDynamicProperty(a, sortField)).ToList();
                else
                    results = results.OrderByDescending(a => Utils.GetDynamicProperty(a, sortField)).ToList();
            }

            return AppUtils.JsonContentResult(results, skip, take);
        }

        [Route("TransferShipments")]
        public ActionResult TransferShipments(string userId, List<string> hblNos, string companyId, string targetCompanyId, bool transferOffshore)
        {
            var sysCompany = admin.GetSysCompany(companyId);
            var hbls = new List<SeaHbl>();
            var offshoreCompanyId = "RCSHKG_OFF";

            try
            {
                foreach (var hblNo in hblNos)
                    hbls.Add(sea.GetHbl(hblNo, companyId, "SE", false));

                foreach(var hbl in hbls)
                {
                    //Vessel Voyage
                    var voyage = sea.GetVoyage(hbl.VES_CODE, hbl.VOYAGE, companyId, "SE");
                    if (!sea.IsExisitingVesselVoyage(hbl.VES_CODE, hbl.VOYAGE, targetCompanyId, "SI"))
                    {
                        var newVoyage = new Voyage();
                        foreach (var property in typeof(Voyage).GetProperties())
                            property.SetValue(newVoyage, property.GetValue(voyage));

                        newVoyage.COMPANY_ID = targetCompanyId;
                        newVoyage.FRT_MODE = "SI";
                        newVoyage.CREATE_USER = userId;
                        newVoyage.CREATE_DATE = DateTime.Now;
                        newVoyage.MODIFY_USER = userId;
                        newVoyage.MODIFY_DATE = DateTime.Now;

                        newVoyage.LoadingPorts = new List<VoyageDetail>();
                        foreach (var item in voyage.LoadingPorts)
                        {
                            var voyageDetail = new VoyageDetail();
                            foreach (var property in typeof(VoyageDetail).GetProperties())
                                property.SetValue(voyageDetail, property.GetValue(item));

                            voyageDetail.COMPANY_ID = targetCompanyId;
                            voyageDetail.FRT_MODE = "SI";
                            newVoyage.LoadingPorts.Add(voyageDetail);
                        }
                        newVoyage.DischargePorts = new List<VoyageDetail>();
                        foreach (var item in voyage.DischargePorts)
                        {
                            var voyageDetail = new VoyageDetail();
                            foreach (var property in typeof(VoyageDetail).GetProperties())
                                property.SetValue(voyageDetail, property.GetValue(item));

                            voyageDetail.COMPANY_ID = targetCompanyId;
                            voyageDetail.FRT_MODE = "SI";
                            newVoyage.DischargePorts.Add(voyageDetail);
                        }
                        sea.AddVoyage(newVoyage);
                    }

                    //Vessel Voyage (Offshore)
                    if (transferOffshore && !sea.IsExisitingVesselVoyage(hbl.VES_CODE, hbl.VOYAGE, offshoreCompanyId, "SE"))
                    {
                        var newVoyage = new Voyage();
                        foreach (var property in typeof(Voyage).GetProperties())
                            property.SetValue(newVoyage, property.GetValue(voyage));

                        newVoyage.COMPANY_ID = offshoreCompanyId;
                        newVoyage.CREATE_USER = userId;
                        newVoyage.CREATE_DATE = DateTime.Now;
                        newVoyage.MODIFY_USER = userId;
                        newVoyage.MODIFY_DATE = DateTime.Now;

                        newVoyage.LoadingPorts = new List<VoyageDetail>();
                        foreach (var item in voyage.LoadingPorts)
                        {
                            var voyageDetail = new VoyageDetail();
                            foreach (var property in typeof(VoyageDetail).GetProperties())
                                property.SetValue(voyageDetail, property.GetValue(item));

                            voyageDetail.COMPANY_ID = offshoreCompanyId;
                            newVoyage.LoadingPorts.Add(voyageDetail);
                        }
                        newVoyage.DischargePorts = new List<VoyageDetail>();
                        foreach (var item in voyage.DischargePorts)
                        {
                            var voyageDetail = new VoyageDetail();
                            foreach (var property in typeof(VoyageDetail).GetProperties())
                                property.SetValue(voyageDetail, property.GetValue(item));

                            voyageDetail.COMPANY_ID = offshoreCompanyId;
                            newVoyage.DischargePorts.Add(voyageDetail);
                        }
                        sea.AddVoyage(newVoyage);
                    }

                    //HBL
                    var jobNo = sea.GetJobNoByMasterHbl(hbl.MASTER_HBL_NO, targetCompanyId, "SI");
                    if (string.IsNullOrEmpty(jobNo))
                        jobNo = admin.GetSequenceNumber("SI_JOB", targetCompanyId, hbl.LOADING_PORT, hbl.DISCHARGE_PORT, hbl.LOADING_PORT_DATE);

                    if (!sea.IsExisitingHblNo(hbl.HBL_NO, targetCompanyId, "SI"))
                    {
                        var newHbl = new SeaHbl();
                        foreach (var property in typeof(SeaHbl).GetProperties())
                            property.SetValue(newHbl, property.GetValue(hbl));

                        newHbl.JOB_NO = jobNo;
                        newHbl.SeaHblDocs.Clear();
                        newHbl.SeaHblChargesPrepaid.Clear();
                        newHbl.SeaHblChargesCollect.Clear();
                        newHbl.SeaHblStatuses.Clear();
                        newHbl.FRT_MODE = "SI";
                        newHbl.COMPANY_ID = targetCompanyId;
                        newHbl.CREATE_USER = userId;
                        newHbl.CREATE_DATE = DateTime.Now;
                        newHbl.MODIFY_USER = userId;
                        newHbl.MODIFY_DATE = DateTime.Now;

                        hbl.SeaHblCargos = new List<SeaHblCargo>();
                        foreach (var item in hbl.SeaHblCargos)
                        {
                            var hblCargo = new SeaHblCargo();
                            foreach (var property in typeof(SeaHblCargo).GetProperties())
                                property.SetValue(hblCargo, property.GetValue(item));

                            hblCargo.COMPANY_ID = targetCompanyId;
                            hblCargo.FRT_MODE = "SI";
                            hbl.SeaHblCargos.Add(hblCargo);
                        }

                        hbl.SeaHblContainers = new List<SeaHblContainer>();
                        foreach (var item in hbl.SeaHblContainers)
                        {
                            var hblContainer = new SeaHblContainer();
                            foreach (var property in typeof(SeaHblContainer).GetProperties())
                                property.SetValue(hblContainer, property.GetValue(item));

                            hblContainer.COMPANY_ID = targetCompanyId;
                            hblContainer.FRT_MODE = "SI";
                            hbl.SeaHblContainers.Add(hblContainer);
                        }

                        hbl.SeaHblPos = new List<SeaHblPo>();
                        foreach (var item in hbl.SeaHblPos)
                        {
                            var hblPo = new SeaHblPo();
                            foreach (var property in typeof(SeaHblPo).GetProperties())
                                property.SetValue(hblPo, property.GetValue(item));

                            hblPo.COMPANY_ID = targetCompanyId;
                            hblPo.FRT_MODE = "SI";
                            hbl.SeaHblPos.Add(hblPo);
                        }

                        hbl.SeaHblSos = new List<SeaHblSo>();
                        foreach (var item in hbl.SeaHblSos)
                        {
                            var hblSo = new SeaHblSo();
                            foreach (var property in typeof(SeaHblSo).GetProperties())
                                property.SetValue(hblSo, property.GetValue(item));

                            hblSo.COMPANY_ID = targetCompanyId;
                            hblSo.FRT_MODE = "SI";
                            hbl.SeaHblSos.Add(hblSo);
                        }
                        sea.AddHbl(newHbl);
                    }

                    //HBL (Offshore)
                    if (transferOffshore && !sea.IsExisitingHblNo(hbl.HBL_NO, offshoreCompanyId, "SE"))
                    {
                        var newHbl = new SeaHbl();
                        foreach (var property in typeof(SeaHbl).GetProperties())
                            property.SetValue(newHbl, property.GetValue(hbl));

                        newHbl.SeaHblDocs.Clear();
                        newHbl.SeaHblChargesPrepaid.Clear();
                        newHbl.SeaHblChargesCollect.Clear();
                        newHbl.SeaHblStatuses.Clear();
                        newHbl.COMPANY_ID = offshoreCompanyId;
                        newHbl.CREATE_USER = userId;
                        newHbl.CREATE_DATE = DateTime.Now;
                        newHbl.MODIFY_USER = userId;
                        newHbl.MODIFY_DATE = DateTime.Now;

                        hbl.SeaHblCargos = new List<SeaHblCargo>();
                        foreach (var item in hbl.SeaHblCargos)
                        {
                            var hblCargo = new SeaHblCargo();
                            foreach (var property in typeof(SeaHblCargo).GetProperties())
                                property.SetValue(hblCargo, property.GetValue(item));

                            hblCargo.COMPANY_ID = offshoreCompanyId;
                            hbl.SeaHblCargos.Add(hblCargo);
                        }

                        hbl.SeaHblContainers = new List<SeaHblContainer>();
                        foreach (var item in hbl.SeaHblContainers)
                        {
                            var hblContainer = new SeaHblContainer();
                            foreach (var property in typeof(SeaHblContainer).GetProperties())
                                property.SetValue(hblContainer, property.GetValue(item));

                            hblContainer.COMPANY_ID = offshoreCompanyId;
                            hbl.SeaHblContainers.Add(hblContainer);
                        }

                        hbl.SeaHblPos = new List<SeaHblPo>();
                        foreach (var item in hbl.SeaHblPos)
                        {
                            var hblPo = new SeaHblPo();
                            foreach (var property in typeof(SeaHblPo).GetProperties())
                                property.SetValue(hblPo, property.GetValue(item));

                            hblPo.COMPANY_ID = offshoreCompanyId;
                            hbl.SeaHblPos.Add(hblPo);
                        }

                        hbl.SeaHblSos = new List<SeaHblSo>();
                        foreach (var item in hbl.SeaHblSos)
                        {
                            var hblSo = new SeaHblSo();
                            foreach (var property in typeof(SeaHblSo).GetProperties())
                                property.SetValue(hblSo, property.GetValue(item));

                            hblSo.COMPANY_ID = offshoreCompanyId;
                            hbl.SeaHblSos.Add(hblSo);
                        }
                        sea.AddHbl(newHbl);
                    }

                    //Transfer Log
                    var log = new TransferHblLog
                    {
                        ID = Utils.NewGuid(),
                        COMPANY_ID = companyId,
                        HBL_NO = hbl.HBL_NO,
                        JOB_NO = hbl.JOB_NO,
                        VES_CODE = hbl.VES_CODE,
                        VOYAGE = hbl.VOYAGE,
                        NEW_JOB_NO = jobNo,
                        NEW_COMPANY_ID = targetCompanyId,
                        TRANSFER_USER = userId,
                        TRANSFER_DATE = DateTime.Now,
                    };
                    sea.AddTransferHblLog(log);
                }
            }
            catch (Exception ex)
            {
                return Content(ex.Message);
            }
            return Content("success");
        }
    }
}