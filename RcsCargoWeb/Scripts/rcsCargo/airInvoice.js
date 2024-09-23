export default class {
    constructor() {
    }

    initAirInvoice = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        //console.log(masterForm.id);
        var invNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        var invCategoryBtn = $(`#${masterForm.id} [name="INV_CATEGORY"]`).data("kendoButtonGroup");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `Invoice# ${invNo}`;
            if (e.id == "printInvoice") {
                reportName = "AirInvoice";
            } else if (e.id == "previewInvoice") {
                reportName = "AirInvoicePreview";
            }

            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "InvNo", value: invNo },
                { name: "IsPreview", value: "N" },
                { name: "IsEmail", value: "N" },
                { name: "ShowFlightDate", value: utils.isEmptyString($(`#${masterForm.id} [name="FLIGHT_DATE"]`).val()) ? "N" : "Y" },
                { name: "AddressCode", value: "" },
                { name: "filename", value: filename },]);
        });

        //invoice category events
        invCategoryBtn.bind("select", function (e) {
            var ddlHawb = $(`#${masterForm.id} [name="HAWB_NO"]`).data("kendoDropDownList");
            var ddlMawb = $(`#${masterForm.id} [name="MAWB_NO"]`).data("kendoDropDownList");
            var ddlJob = $(`#${masterForm.id} [name="JOB_NO"]`).data("kendoDropDownList");
            var ddlLot = $(`#${masterForm.id} [name="LOT_NO"]`).data("kendoDropDownList");

            switch (invCategoryBtn.current().text()) {
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

        invCategoryBtn.trigger("select");
    }

    selectHawb = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Hawb/GetHawbs",
            data: { searchValue: selector.dataItem.HAWB_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                result[0].ORIGIN = result[0].ORIGIN_CODE;
                result[0].DEST = result[0].DEST_CODE;
                var masterForm = JSON.parse($(`#${utils.getFormId()}`).attr("masterForm"));
                controls.setValuesToFormControls(masterForm, result[0], true);
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
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airInvoice")[0], result, true);

                $.ajax({
                    url: "../Air/Hawb/GetHawbNos",
                    data: { id: selector.dataItem.MAWB_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
                    success: function (result) {
                        var hawbNos = [];
                        result.forEach(function (item) {
                            hawbNos.push({ label: item });
                        });
                        var formId = utils.getFormId(selector.sender.element);
                        utils.alertMessage(`<div id="${formId}_hawbNoList" class="selectHawbNoList"></div>`, "Select HAWB#", "info", "", true);

                        var chipList = $(`#${formId}_hawbNoList`).kendoChipList({
                            selectable: 'multiple',
                            itemSize: "small",
                            items: hawbNos,
                        }).data("kendoChipList");

                        if (!utils.isEmptyString($(`#${formId} [name="InvoiceHawbs"]`).val())) {
                            var hawbs = JSON.parse($(`#${formId} [name="InvoiceHawbs"]`).val());
                            chipList.items().each(function () {
                                if (hawbs.filter(a => a.HAWB_NO == $(this).text()).length == 1)
                                    $(this).addClass("k-selected");
                            });
                        }

                        $(".kendo-window-alertMessage .customButton.button-icon-check-outline").click(function () {
                            //var chipList = $(`#${formId}_hawbNoList`).data("kendoChipList");
                            var invoiceHawbs = [];
                            chipList.items().each(function () {
                                if ($(this).hasClass("k-selected")) {
                                    //console.log($(this).text());
                                    invoiceHawbs.push({
                                        INV_NO: utils.getFormValue("INV_NO"),
                                        COMPANY_ID: data.companyId,
                                        FRT_MODE: utils.getFrtMode(),
                                        HAWB_NO: $(this).text(),
                                    });
                                }
                            });

                            //console.log(invoiceHawbs);
                            $(`#${formId} [name="InvoiceHawbs"]`).val(JSON.stringify(invoiceHawbs));
                            $(".kendo-window-alertMessage").data("kendoWindow").destroy();
                        });
                    },
                });
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
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airInvoice")[0], result, true);
            },
        });
    }

    //grid_InvoiceItemsDataBound = function (e) {
    //    console.log("grid dataBound", e);
    //}
}