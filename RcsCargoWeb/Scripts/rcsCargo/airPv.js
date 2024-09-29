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
            var buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            var reportName = e.id;
            var reportType = buttonConfig.type;
            var filename = `PV# ${pvNo}`;

            if (e.id == "AirPaymentVoucherPreview1")
                reportName = "AirPaymentVoucherPreview";

            var paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "PvNo", value: pvNo },
                { name: "IsPreview", value: e.id == "AirPaymentVoucherPreview" ? "N" : "Y" },
                { name: "IsEmail", value: e.id == "AirPaymentVoucherPreview" ? "N" : "Y" },
                { name: "AddressCode", value: "" },
                { name: "filename", value: filename }];

            if (reportType == "pdf") {
                controls.openReportViewer(reportName, paras);
            } else if (reportType == "xlsx") {
                utils.getExcelReport(reportName, paras, filename);
            }
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
                result.PACKAGE = result.CTNS;
                result.CWTS = result.GWTS > result.VWTS ? result.GWTS : result.VWTS;
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airPv")[0], result, true);
            },
        });
    }

    selectJob = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Mawb/GetJob",
            data: { id: selector.dataItem.JOB_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
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