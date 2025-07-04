export default class {
    constructor() {
    }

    initAirPv = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        let pvNo = masterForm.id.split("_")[1];
        let companyId = data.companyId;
        let frtMode = utils.getFrtMode();

        let printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        let pvCategoryBtn = $(`#${masterForm.id} [name="PV_CATEGORY"]`).data("kendoButtonGroup");
        let saveInvoiceBtn = $(`#${masterForm.id} .toolbar .k-i-track-changes`).parent().data("kendoButton");

        if (pvNo == "NEW")
            saveInvoiceBtn.enable(false);

        //(Print) dropdownbutton events
        if (printButton != null) {
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
        }

        //invoice(PV) category events
        if (pvCategoryBtn != null) {
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

        //Batch create PV
        if (masterForm.id.startsWith("airBatchPv")) {
            $(`#${masterForm.id} div h3`).text("Batch create Payment Voucher");

            let ddlHawb = $(`#${masterForm.id} [name="HAWB_NO"]`).data("kendoDropDownList");
            ddlHawb.element.parent().parent().append(`<div style="margin: 5px;" name="airBatchPv_selectedHawbNos" type="chipList" />`);

            $(`#${masterForm.id} [name="airBatchPv_selectedHawbNos"]`).kendoChipList({
                itemSize: "small",
                removable: true,
            });

            //Save button click event
            $(`#${masterForm.id} button .k-i-save`).parent().unbind();
            $(`#${masterForm.id} button .k-i-save`).parent().bind("click", function () {
                let validator = $(`#${masterForm.id}`).data("kendoValidator");
                if (!validator.validate()) {
                    utils.showNotification("Validation failed, please verify the data entry", "warning");
                    return;
                } else {
                    let model = controls.getValuesFromFormControls(masterForm);
                    let hawbNos = [];
                    let chipList = $(`#${masterForm.id} [name="airBatchPv_selectedHawbNos"]`).data("kendoChipList");
                    chipList.items().each(function (i) {
                        hawbNos.push($(chipList.items()[i]).text());
                    })
                    console.log(masterForm, model, hawbNos);
                    //return;

                    $.ajax({
                        url: masterForm.updateUrl,
                        type: "post",
                        data: { model: model, hawbNos: hawbNos },
                        beforeSend: function () {
                            kendo.ui.progress($(`#${masterForm.id} `), true);
                        },
                        success: function (result) {
                            //console.log(result);
                            let pvNos = "";
                            for (var i in result) {
                                pvNos += `${result[i].PV_NO}, `;
                            }
                            pvNos = pvNos.substring(0, pvNos.length - 2);
                            utils.alertMessage(`Batch create PV success.<br><br>PV#: ${pvNos}`, "Batch create PV");
                            controls.remove_tabStripMain(utils.getFormId());

                            if ($(`[name="gridAirPvIndex"]`) != null) {
                                $(`[name="gridAirPvIndex"]`).data("kendoGrid").dataSource.read();
                            }
                        },
                        error: function (err) {
                            console.log(err);
                            utils.showNotification("Save failed, please contact system administrator!", "error");
                        },
                        complete: function () {
                            kendo.ui.progress($(`#${utils.getFormId()}`), false);
                        }
                    });
                }
            });
        }
    }

    batchPv = function () {
        let controller = "airBatchPv";
        controls.append_tabStripMain("Batch create PV", `${controller}_${data.companyId}_${utils.getFrtMode()}`, controller);
    }

    selectHawb = function (selector, filterValue) {
        let formId = utils.getFormId();

        if (formId.startsWith("airBatchPv")) {
            let chipList = $(`#${formId} [name="airBatchPv_selectedHawbNos"]`).data("kendoChipList");
            chipList.add({ label: selector.dataItem.HAWB_NO, themeColor: "info" });
        } else {
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
                    <input type="customerAddrEditable" class="form-control-dropdownlist" name="invoicePayer" required />
                    <input type="hidden" name="invoicePayer_CODE" />
                    <input type="hidden" name="invoicePayer_BRANCH" />
                    <input type="hidden" name="invoicePayer_SHORT_DESC" />
                    <input type="text" class="form-control" name="invoicePayer_ADDR1" />
                    <input type="text" class="form-control" name="invoicePayer_ADDR2" />
                    <input type="text" class="form-control" name="invoicePayer_ADDR3" />
                    <input type="text" class="form-control" name="invoicePayer_ADDR4" style="margin-bottom: 4px" />
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="saveAsInvoice_save"><span class="k-icon k-i-save"></span>Save</span>
                </div>
            </div>`;

        var dialog = utils.alertMessage(html, "Save as Invoice", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="saveAsInvoice_save"]`).click(function () {
            let model = JSON.parse($(`#${utils.getMasterFormId()}`).attr("modelData"));
            if (utils.isEmptyString($(`[name="invoicePayer_CODE"]`).val())) {
                utils.showValidateNotification("Please select the invoice payer.", $("input[name='invoicePayer']").parent());
                return;
            }
            model.INV_NO = "";
            model.INV_TYPE = "I";
            model.INV_CATEGORY = model.PV_CATEGORY;
            model.INV_DATE = utils.convertDateToISOString(new Date());
            model.FLIGHT_DATE = utils.convertDateToISOString(kendo.parseDate(model.FLIGHT_DATE));
            model.CUSTOMER_CODE = $(`[name="invoicePayer_CODE"]`).val().split("-")[0];
            model.CUSTOMER_DESC = $(`[name="invoicePayer"]`).data("kendoDropDownList").text()
                .replace(`${$(`[name="invoicePayer"]`).val().split("-")[0]} - `, ``)
                .replace(` - ${$(`[name="invoicePayer_BRANCH"]`).val()}`, ``);
            model.CUSTOMER_BRANCH = $(`[name="invoicePayer_BRANCH"]`).val();
            model.CUSTOMER_SHORT_DESC = $(`[name="invoicePayer_SHORT_DESC"]`).val();
            model.ADDR1 = $(`[name="invoicePayer_ADDR1"]`).val();
            model.ADDR2 = $(`[name="invoicePayer_ADDR2"]`).val();
            model.ADDR3 = $(`[name="invoicePayer_ADDR3"]`).val();
            model.ADDR4 = $(`[name="invoicePayer_ADDR4"]`).val();
            model.SHOW_DATE_TYPE = "F";
            model.IS_TRANSFERRED = "N";
            model.IS_VAT = "N";
            model.CREATE_USER = data.user.USER_ID;;
            model.CREATE_DATE = utils.convertDateToISOString(new Date());
            model.MODIFY_USER = data.user.USER_ID;;
            model.MODIFY_DATE = utils.convertDateToISOString(new Date());
            model.InvoiceItems = model.PvItems;
            console.log(model);
            //return;
            $.ajax({
                url: utils.getMasterFormByName("airInvoice").updateUrl,
                type: "post",
                data: { model: model, mode: "create" },
                beforeSend: function () {
                    kendo.ui.progress($(".wrapper"), true);
                },
                success: function (result) {
                    utils.showNotification(`Invoice# ${result["INV_NO"]} created.`, "success");
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Save failed, please contact system administrator!", "error");
                },
                complete: function () {
                    kendo.ui.progress($(".wrapper"), false);
                    dialog.destroy();
                }
            });
        });
    }

    uploadFiles = function (selector) {
        var formId = utils.getFormId(selector);
        var pvNo = utils.getFormValue("PV_NO");
        var html = `<input type="file" name="uploadFiles" />`;
        var gridName = $(selector).parentsUntil(".k-widget.k-grid").last().parent().attr("name");
        var grid = $(`#${formId} [name="${gridName}"]`).data("kendoGrid");
        utils.alertMessage(html, "Upload Files", "info");

        $(`.kendo-window-alertMessage [name="uploadFiles"]`).kendoUpload({
            async: {
                autoUpload: true,
                saveField: "postedFiles",
                saveUrl: `../Air/Pv/UploadFiles?pvNo=${pvNo}&userId=${data.user.USER_ID}`,
            },
            validation: {
                maxFileSize: 52428800,
            },
            localization: {
                dropFilesHere: "Drag & Drop Files Here..."
            },
            complete: function (e) {
                $.ajax({
                    url: "../Air/Pv/GetPvDocs",
                    data: { id: pvNo },
                    success: function (result) {
                        var ds = grid.dataSource;
                        ds.data(result);
                    }
                });
            }
        });
    }

    downloadFile = function (sender, docId) {
        console.log(docId);
        window.open(`../Air/Pv/DownloadFile?docId=${docId}`);
    }

    gridPvDocsConfirmSaveChanges = function (e) {
        if (e.sender.dataSource.deleteDocs != null) {
            var html = "<b>Are you sure to delete the following file(s)?</b><br>";
            e.sender.dataSource.deleteDocs.forEach(function (doc) {
                html += `${doc.DOC_NAME}<br>`;
            });
            utils.confirmMessage(html.trim(), e,
                "controllers.airPv.gridPvDocsSaveChanges",
                "controllers.airPv.gridPvDocsCancelChanges",
            );
        } else {
            controllers.airPv.gridPvDocsSaveChanges(e);
        }
    }

    gridPvDocsCancelChanges = function (e) {
        delete e.sender.dataSource.deleteDocs;
        e.sender.cancelChanges();
    }

    gridPvDocsSaveChanges = function (e) {
        var pvNo = utils.getFormValue("PV_NO");
        var docs = [];
        var deleteDocIds = [];
        e.sender.dataSource.data().forEach(function (item) {
            if (item.dirty) {
                var fields = e.sender.dataSource.options.schema.model.fields;
                var doc = {};
                for (var field in fields) {
                    doc[field] = item[field];
                    //console.log(item[field], (item[field] instanceof Date), utils.convertDateToISOString(item[field]));
                    try {
                        if (kendo.parseDate(item[field]) instanceof Date) {
                            doc[field] = utils.convertDateToISOString(kendo.parseDate(item[field]));
                        }
                    } catch { }
                }
                docs.push(doc);
            }
        });

        if (e.sender.dataSource.deleteDocs != null) {
            e.sender.dataSource.deleteDocs.forEach(function (doc) {
                deleteDocIds.push(doc.DOC_ID);
            });
        }

        $.ajax({
            url: "../Air/Pv/UpdatePvDocs",
            data: {
                id: pvNo,
                userId: data.user.USER_ID,
                docs: docs,
                deleteDocIds: deleteDocIds,
            },
            success: function (result) {
                delete e.sender.dataSource.deleteDocs;
                var ds = e.sender.dataSource;
                ds.data(result);
            }
        });
    }

    gridPvDocsDelete = function (e) {
        if (e.sender.dataSource.deleteDocs == null)
            e.sender.dataSource.deleteDocs = [];

        e.sender.dataSource.deleteDocs.push({ DOC_ID: e.model.DOC_ID, DOC_NAME: e.model.DOC_NAME });
    }
}