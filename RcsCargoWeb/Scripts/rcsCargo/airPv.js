export default class {
    constructor() {
    }

    initAirPv = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        //console.log(masterForm.id);
        var pvNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        var pvCategoryBtn = $(`#${masterForm.id} [name="PV_CATEGORY"]`).data("kendoButtonGroup");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `MAWB# ${utils.formatMawbNo(hawbNo)}`;
            if (e.id == "printMawb") {
                reportName = "AirMawb";
            } else if (e.id == "previewMawb") {
                reportName = "AirMawbPreview";
            } else if (e.id == "loadplan") {
                reportName = "AirLoadPlan";
                filename = `Loadplan ${utils.formatMawbNo(hawbNo)}`;
            } else if (e.id == "manifest") {
                reportName = "AirCargoManifest";
                filename = `CargoManifest ${utils.formatMawbNo(hawbNo)}`;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "HawbNo", value: hawbNo },
                { name: "JobNo", value: utils.getFormValue("JOB_NO") },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });

        //invoice(PV) category events
        pvCategoryBtn.bind("select", function (e) {
            var ddlHawb = $(`#${masterForm.id} [name="HAWB_NO"]`).data("kendoDropDownList");
            var ddlMawb = $(`#${masterForm.id} [name="MAWB_NO"]`).data("kendoDropDownList");
            var ddlJob = $(`#${masterForm.id} [name="JOB_NO"]`).data("kendoDropDownList");
            var ddlLot = $(`#${masterForm.id} [name="LOT_NO"]`).data("kendoDropDownList");

            switch (pvCategoryBtn.current().text()) {
                case "HAWB":
                    ddlHawb.enable(true);
                    ddlMawb.enable(false);
                    ddlJob.enable(false);
                    ddlLot.enable(false);
                    break;
                case "MAWB":
                    ddlHawb.enable(false);
                    ddlMawb.enable(true);
                    ddlJob.enable(false);
                    ddlLot.enable(false);
                    break;
                case "Job":
                    ddlHawb.enable(false);
                    ddlMawb.enable(false);
                    ddlJob.enable(true);
                    ddlLot.enable(false);
                    break;
                case "Lot":
                    ddlHawb.enable(false);
                    ddlMawb.enable(false);
                    ddlJob.enable(false);
                    ddlLot.enable(true);
                    break;
            }
        });

        pvCategoryBtn.trigger("select");
    }

    selectHawb = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Hawb/GetHawbs",
            data: { searchValue: selector.dataItem.HAWB_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                result[0].ORIGIN = result[0].ORIGIN_CODE;
                result[0].DEST = result[0].DEST_CODE;
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airPv")[0], result[0], true);
            }
        });
    }

    selectMawb = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Mawb/GetMawb",
            data: { id: selector.dataItem.MAWB_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                result.ORIGIN = result.ORIGIN_CODE;
                result.DEST = result.DEST_CODE;
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airPv")[0], result, true);
            },
        });
    }

    selectLot = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Mawb/GetLotDetail",
            data: { lotNo: selector.dataItem.LOT_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                result.ORIGIN = result.ORIGIN_CODE;
                result.DEST = result.DEST_CODE;
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airPv")[0], result, true);
            },
        });
    }
}