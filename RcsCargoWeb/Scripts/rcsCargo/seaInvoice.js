export default class {
    constructor() {
    }

    initSeaInvoice = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var invNo = utils.decodeId(masterForm.id.split("_")[1]);
        var companyId = data.companyId;
        var frtMode = utils.getFrtMode();

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        var invCategoryBtn = $(`#${masterForm.id} [name="INV_CATEGORY"]`).data("kendoButtonGroup");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            var reportName = "";
            var filename = `Invoice# ${invNo}`;

            var paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "InvNo", value: invNo },
                { name: "VesCode", value: $(`#${masterForm.id} [name="VES_CODE"]`).val() },
                { name: "Voyage", value: $(`#${masterForm.id} [name="VOYAGE"]`).val() },
                { name: "filename", value: filename }];

            switch (e.id) {
                case "SeaInvoicePreview":
                    paras.push({ name: "IsEmail", value: "Y" });
                    paras.push({ name: "IsPreview", value: "Y" });
                    reportName = "SeaInvoicePreview";
                    break;
                case "SeaInvoice":
                    paras.push({ name: "IsEmail", value: "N" });
                    paras.push({ name: "IsPreview", value: "N" });
                    reportName = "SeaInvoice";
                    break;
                case "SeaInvoiceA4":
                    paras.push({ name: "IsEmail", value: "N" });
                    paras.push({ name: "IsPreview", value: "N" });
                    reportName = "SeaInvoicePreview";
                    break;
                case "SeaInvoicePreview_RCSLAX":
                    paras.push({ name: "IsEmail", value: "N" });
                    paras.push({ name: "IsPreview", value: "N" });
                    reportName = "SeaInvoicePreview_RCSLAX";
                    break;
                case "SeaInvoicePreview_Wecan":
                    paras.push({ name: "IsEmail", value: "N" });
                    paras.push({ name: "IsPreview", value: "N" });
                    reportName = "SeaInvoicePreview_Wecan";
                    break;
            }
            controls.openReportViewer(reportName, paras);
        });

        //HBL list
        $(`#${masterForm.id} [name="selectHbl"]`).parent().after(`<span class="k-input k-input-solid k-input-md k-rounded-md" style="max-width: 270px; padding: 2px;"><div id="${masterForm.id}_hblNoList"></div></span>`);
        let chipHblNos = $(`#${masterForm.id}_hblNoList`).kendoChipList({
            itemSize: "small",
            removable: true,
        }).data("kendoChipList");

        JSON.parse($(`#${utils.getFormId()}`).attr("modeldata")).SeaInvoiceRefNos.forEach(function (refNo) {
            chipHblNos.add({ label: refNo.REF_NO, themeColor: "info" });
        })

        //Select HBL event
        let ddl = $(`#${masterForm.id} [name="selectHbl"]`).data("kendoDropDownList");
        ddl.bind("select", function (e) {
            //console.log(masterForm, e.dataItem);

            let model = {
                CARRIER_CODE: e.dataItem.CARRIER_CODE,
                VES_CODE: e.dataItem.VES_CODE,
                VOYAGE: e.dataItem.VOYAGE,
                LOADING_PORT_DATE: e.dataItem.LOADING_PORT_DATE,
                DISCHARGE_PORT_DATE: e.dataItem.DISCHARGE_PORT_DATE,
                JOB_NO: e.dataItem.JOB_NO,
            };
            controls.setValuesToFormControls(masterForm, model, true);

            let hblNoExist = false;
            chipHblNos.items().each(function () {
                if ($(this).children().eq(0).text() == e.dataItem.HBL_NO)
                    hblNoExist = true;
            });

            if (!hblNoExist)
                chipHblNos.add({ label: e.dataItem.HBL_NO, themeColor: "info" });
        });

        //New credit note click event
        $(`#${masterForm.id} button .k-i-file-txt`).parent().bind("click", function () {
            let html = `Are you sure to save as new credit note?<br><br>`;

            utils.alertMessage(html, "Save as new credit note", "confirm", null, true, "controllers.seaInvoice.saveAsNewCreditNoteClick");
        });

        //Hide the credit note button
        if ($(`#${masterForm.id} [name=INV_TYPE] .k-selected`).text() == "Credit Note") {
            $(`#${masterForm.id} button .k-i-file-txt`).parent().attr("style", "display: none");
        }
    }

    saveAsNewCreditNoteClick = function (sender) {
        let masterForm = utils.getMasterForm();
        let validator = $(`#${masterForm.id}`).data("kendoValidator");

        if (!validator.validate()) {
            utils.showNotification("Validation failed, please verify the data entry", "error",
                $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
            return;
        } else {
            masterForm.mode = "create";
            let model = controls.getValuesFromFormControls(masterForm);
            model.INV_NO = "";
            model.INV_TYPE = "C";

            console.log(masterForm, model);
            // return;

            $.ajax({
                url: masterForm.updateUrl,
                type: "post",
                data: { model: model, mode: masterForm.mode },
                beforeSend: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), true); },
                complete: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), false); },
                success: function (result) {
                    console.log(result);
                    controls.append_tabStripMain(`${masterForm.title} ${result.INV_NO}`,
                        `${masterForm.formName}_${result.INV_NO}_${data.companyId}_${result.FRT_MODE}`, masterForm.formName);

                    utils.showNotification(`Save success, new credit note# ${result.INV_NO}`, "success", $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                    sender.destroy();
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Save failed, please contact system administrator!", "error",
                        $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                },
            });
        }
    }
}