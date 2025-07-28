export default class {
    constructor() {
    }

    initAirOtherJob = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var jobNo = masterForm.id.split("_")[1];
        var companyId = data.companyId;
        var frtMode = utils.getFrtMode();

        //Save as new button click event
        $(`#${masterForm.id} button .k-i-copy`).parent().bind("click", function () {
            let html = `Are you sure to as new job?<br><br>`;

            utils.alertMessage(html, "Save as new job", "confirm", null, true, "controllers.airOtherJob.saveAsNewOtherJobClick");
        });
    }

    saveAsNewOtherJobClick = function (sender) {
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
            
            console.log(masterForm, model);
            //return;

            $.ajax({
                url: masterForm.updateUrl,
                type: "post",
                data: { model: model, mode: masterForm.mode },
                beforeSend: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), true); },
                complete: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), false); },
                success: function (result) {
                    console.log(result);
                    controls.append_tabStripMain(`${masterForm.title} ${result.JOB_NO}`,
                        `${masterForm.formName}_${result.JOB_NO}_${data.companyId}_${result.FRT_MODE}`, masterForm.formName);

                    utils.showNotification(`Save success, new job# ${result.JOB_NO}`, "success", $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
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

    createInvoiceClick = function (selector) {
        var html = `
            <div class="row" id="${utils.getFormId()}_createInvoice">
                <label class="col-sm-3 col-form-label">Freight Payment</label>
                <div class="col-sm-9">
                    <input type="paymentTerms" name="createInvoice_frtPaymentPc" />
                </div>
                <label class="col-sm-3 col-form-label">Invoice Payer</label>
                <div class="col-sm-9">
                    <input type="customerAddr" class="form-control" name="invoicePayer" required />
                    <input type="hidden" name="invoicePayer_CODE" />
                    <input type="hidden" name="invoicePayer_BRANCH" />
                    <input type="hidden" name="invoicePayer_SHORT_DESC" />
                    <input type="text" class="form-control" name="invoicePayer_ADDR1" readonly />
                    <input type="text" class="form-control" name="invoicePayer_ADDR2" readonly />
                    <input type="text" class="form-control" name="invoicePayer_ADDR3" readonly />
                    <input type="text" class="form-control" name="invoicePayer_ADDR4" readonly style="margin-bottom: 4px" />
                </div>
            </div>`;

        utils.alertMessage(html, "Create Invoice", null, null, true, "controllers.airOtherJob.createInvoice");
        var formSetting = {};
        formSetting.id = `${utils.getFormId()}_createInvoice`;
        controls.renderFormControl_kendoUI(formSetting);
    }

    createInvoice = function (sender) {
        $(`#${utils.getFormId()}`).kendoValidator({ errorTemplate: ({ message }) => utils.validatorErrorTemplate(message) });
        let validator = $(`#${utils.getFormId()}`).data("kendoValidator");
        let masterFormId = utils.getFormId().replace("_createInvoice", "");
        //console.log($(`#${utils.getFormId()}`), utils.getFormId());
        if (validator.validate()) {
            var modelData = JSON.parse($(`#${masterFormId}`).attr("modelData"));
            var model = {
                INV_NO: "",
                COMPANY_ID: data.companyId,
                FRT_MODE: utils.getFrtMode(),
                IS_VOIDED: "N",
                IS_PRINTED: "N",
                IS_POSTED: "N",
                IS_TRANSFERRED: "N",
                INV_DATE: utils.convertDateToISOString(new Date()),
                INV_TYPE: "I",
                INV_CATEGORY: "J",
                SHOW_DATE_TYPE: "F",
                //MAWB_NO: modelData.MAWB,
                JOB_NO: modelData.JOB_NO,
                CUSTOMER_CODE: $("[name='invoicePayer_CODE']").val().split("-")[0],
                CUSTOMER_BRANCH: $("[name='invoicePayer_BRANCH']").val(),
                CUSTOMER_SHORT_DESC: $("[name='invoicePayer_SHORT_DESC']").val(),
                CUSTOMER_DESC: $("[name='invoicePayer']").data("kendoDropDownList").text()
                    .replace(`${$("[name='invoicePayer_CODE']").val().split("-")[0]} - `, ``)
                    .replace(` - ${$("[name='invoicePayer_CODE']").val().split("-")[1]}`, ``),
                //AIRLINE_CODE: modelData.AIRLINE_CODE,
                //FLIGHT_NO: modelData.FLIGHT_NO,
                FLIGHT_DATE: utils.convertDateToISOString(utils.parseDate(modelData.FLIGHT_DATE)),
                FRT_PAYMENT_PC: $("[name='createInvoice_frtPaymentPc']").val(),
                PACKAGE: modelData.CTNS,
                PACKAGE_UNIT: modelData.PACKAGE_UNIT,
                GWTS: modelData.GWTS,
                VWTS: modelData.VWTS,
                CWTS: modelData.CWTS,
                ORIGIN: modelData.ORIGIN_CODE,
                DEST: modelData.DEST_CODE,
                CURR_CODE: modelData.CURR_CODE,
                EX_RATE: modelData.EX_RATE,
                AMOUNT: 0,
                AMOUNT_HOME: 0,
                CREATE_USER: data.user.USER_ID,
                CREATE_DATE: utils.convertDateToISOString(new Date()),
                MODIFY_USER: data.user.USER_ID,
                MODIFY_DATE: utils.convertDateToISOString(new Date()),
            };

            var grid;
            var gridConfig;
            if ($("[name='createInvoice_frtPaymentPc']").val() == "P") {
                grid = $(`#${masterFormId} [name="grid_OtherJobChargesPrepaid"]`).data("kendoGrid");
                gridConfig = utils.getFormControlByName("OtherJobChargesPrepaid");
            } else {
                grid = $(`#${masterFormId} [name="grid_OtherJobChargesCollect"]`).data("kendoGrid");
                gridConfig = utils.getFormControlByName("OtherJobChargesCollect");
            }

            model.InvoiceItems = utils.formatGridData(grid, gridConfig);
            model.InvoiceItems.forEach(function (item) {
                model.AMOUNT += item.AMOUNT_HOME;
            });
            model.AMOUNT = utils.roundUp(model.AMOUNT, 2);
            model.AMOUNT_HOME = utils.roundUp(model.AMOUNT * model.EX_RATE, 2);
            console.log(model);

            $.ajax({
                url: utils.getMasterFormByName("airInvoice").updateUrl,
                type: "post",
                data: { model: model, mode: "create" },
                beforeSend: function () {
                    kendo.ui.progress($(`#${utils.getFormId()}`), true);
                },
                success: function (result) {
                    console.log(result);
                    $.ajax({
                        url: "../Air/OtherJob/GetOtherJobInvoices",
                        data: { id: model.JOB_NO, companyId: model.COMPANY_ID, frtMode: model.FRT_MODE },
                        success: function (invoices) {
                            var invoiceModel = { Invoices: invoices };
                            controls.setValuesToFormControls(utils.getMasterFormByName("airOtherJob"), invoiceModel, true);
                            utils.showNotification("Invoice created success", "success");
                        }
                    });
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Invoice created failed, please contact system administrator!", "error");
                },
                complete: function () {
                    kendo.ui.progress($(`#${utils.getFormId()}`), false);
                    sender.destroy();
                }
            });

        }
    }

}