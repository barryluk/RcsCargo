export default class {
    constructor() {
    }

    initAirPv = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        //console.log(masterForm.id);
        let pvNo = masterForm.id.split("_")[1];
        let companyId = masterForm.id.split("_")[2];
        let frtMode = masterForm.id.split("_")[3];

        let printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        let pvCategoryBtn = $(`#${masterForm.id} [name="PV_CATEGORY"]`).data("kendoButtonGroup");
        let saveInvoiceBtn = $(`#${masterForm.id} .toolbar .k-i-track-changes`).parent().data("kendoButton");

        if (pvNo == "NEW")
            saveInvoiceBtn.enable(false);

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            let buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            let reportName = e.id;
            let reportType = buttonConfig.type;
            let filename = `PV# ${pvNo}`;

            if (e.id == "AirPaymentVoucherPreview1")
                reportName = "AirPaymentVoucherPreview";

            let paras = [
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
            let ddlHawb = $(`#${masterForm.id} [name="HAWB_NO"]`).data("kendoDropDownList");
            let ddlMawb = $(`#${masterForm.id} [name="MAWB_NO"]`).data("kendoDropDownList");
            let ddlJob = $(`#${masterForm.id} [name="JOB_NO"]`).data("kendoDropDownList");
            let ddlLot = $(`#${masterForm.id} [name="LOT_NO"]`).data("kendoDropDownList");

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

    saveAsInvoiceDialog = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_saveAsInvoice" style="width: 460px">
                <label class="col-sm-3 col-form-label">Invoice Payer</label>
                <div class="col-md-9">
                    <input type="customerAddr" class="form-control-dropdownlist" name="invoicePayer" required />
                    <input type="hidden" name="invoicePayer_CODE" />
                    <input type="hidden" name="invoicePayer_BRANCH" />
                    <input type="hidden" name="invoicePayer_SHORT_DESC" />
                    <input type="text" class="form-control" name="invoicePayer_ADDR1" readonly />
                    <input type="text" class="form-control" name="invoicePayer_ADDR2" readonly />
                    <input type="text" class="form-control" name="invoicePayer_ADDR3" readonly />
                    <input type="text" class="form-control" name="invoicePayer_ADDR4" readonly style="margin-bottom: 4px" />
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="saveAsInvoice_save"><span class="k-icon k-i-save"></span>Save</span>
                </div>
            </div>`;

        utils.alertMessage(html, "Save as Invoice", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.kendo.renderFormControl_kendoUI(formSetting);

        $(`[name="saveAsInvoice_save"]`).click(function () {
            let model = JSON.parse($(`#${utils.getMasterFormId()}`).attr("modelData"));
            if (utils.isEmptyString($(`[name="invoicePayer_CODE"]`).val())) {
                utils.showValidateNotification("Please select the invoice payer.", $("input[name='invoicePayer']").parent());
                return;
            }
        });
    }
}