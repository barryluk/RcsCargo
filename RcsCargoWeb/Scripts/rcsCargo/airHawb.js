export default class {
    constructor() {
    }

    initAirHawb = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var hawbNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        //manual input for HAWB# in Air Import
        $(".toolbar-frtMode").bind("click", function (e) {
            let index = $(this).kendoButtonGroup().data("kendoButtonGroup").current().index() //0: AE, 1: AI
            if (masterForm.mode == "create" && index == 1)
                $(`#${masterForm.id} [name="HAWB_NO"]`).removeAttr("readonly");
            else
                $(`#${masterForm.id} [name="HAWB_NO"]`).attr("readonly", "readonly");
        })

        if (masterForm.mode == "create" && utils.getFrtMode() == "AI")
            $(`#${masterForm.id} [name="HAWB_NO"]`).removeAttr("readonly");

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            var reportName = e.id;
            var reportType = buttonConfig.type;
            var filename = `HAWB# ${hawbNo}`;
            if (reportName == "AirHawbPreview") {
                let masterForm = utils.getMasterForm();
                let model = controls.getValuesFromFormControls(masterForm);
                if (utils.showHawbAttachedList(model.GOOD_DESC, model.MARKS_NO, model.NOTIFY2_DESC, model.NOTIFY3_DESC, model.HawbDims.length))
                    reportName = "AirHawbPreview_NEW";
            }
            
            if (e.id == "AirHawbAttachList_RCSLON") {
                filename = `HAWB Attached List - ${hawbNo}`;
            } else if (e.id == "AirFcr") {
                filename = `FCR# ${hawbNo}`;
            } else if (e.id == "CargoShippingInstructions") {
                filename = `Cargo Shipping Instructions`;
            } else if (e.id == "SecurityScreeningReceipt") {
                filename = "Security Screening Receipt";
            } else if (e.id == "K4securityletter") {
                controllers.airHawb.dialogK4securityletter();
                return;
                //filename = "K4 Security Letter";
            } else if (e.id == "BatteryDeclaration") {
                filename = "Battery Declaration";
            }

            var paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "HawbNo", value: hawbNo },
                { name: "ShowDim", value: true },
                { name: "CustomerType", value: "Shipper" },
                { name: "filename", value: filename }];

            if (reportType == "pdf") {
                controls.openReportViewer(reportName, paras);
            } else if (reportType == "xlsx") {
                utils.getExcelReport(reportName, paras);
            }
        });
    }

    dialogK4securityletter = function () {
        var html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_k4securityletter" style="width: 600px">
                <label class="col-sm-4 col-form-label">Multiple MAWB#</label>
                <div class="col-md-8">
                    <textarea type="textArea" class="form-control-textArea" name="k4securityletter_mawbNos" />
                </div>
                <label class="col-sm-4 col-form-label">Name of Signatory</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="k4securityletter_NameTitle" />
                </div>
                <label class="col-sm-4 col-form-label">Number appearing on ID</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="k4securityletter_IDNo" />
                </div>
                <label class="col-sm-4 col-form-label">Name of cargo accepted</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="k4securityletter_AcceptedName" />
                </div>
                <label class="col-sm-4 col-form-label">Name of verified ID</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="k4securityletter_VerifiedName" />
                </div>
                <label class="col-sm-4 col-form-label">Inspection Date</label>
                <div class="col-md-8">
                    <input type="date" class="form-control-dateTime" name="k4securityletter_LetterDate" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="k4securityletter_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "K4 Security Letter", null, null, false);
        var formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
        $(`#${utils.getFormId()} [name="k4securityletter_LetterDate"]`).data("kendoDatePicker").value(new Date());

        $(`[name="k4securityletter_Print"]`).click(function () {
            var dateFormat = "dd-MMM-yyyy";
            var modelData = JSON.parse($(`#${utils.getMasterFormId()}`).attr("modeldata"));
            var mawbNos = $(`#${utils.getFormId()} [name="k4securityletter_mawbNos"]`).val();
            
            if (!utils.isEmptyString(mawbNos)) {
                var reports = [];
                mawbNos.split("\n").forEach(function (mawbNo) {
                    if (mawbNo.trim().length == 11) {
                        var palletNo = "";
                        $.ajax({
                            url: "../Air/Mawb/GetLoadplanHawbEquipList",
                            data: { id: mawbNo, companyId: data.companyId, frtMode: utils.getFrtMode() },
                            dataType: "text",
                            async: false,
                            success: function (result) { palletNo = result; }
                        });
                        var hawbNo = "WFF" + mawbNo.trim().substring(3);
                        reports.push({
                            ReportName: "K4securityletter",
                            FileName: `${mawbNo}.pdf`,
                            reportParas: [
                                { name: "CompanyId", value: data.companyId },
                                { name: "FrtMode", value: utils.getFrtMode() },
                                { name: "CompanyName", value: data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].COMPANY_NAME },
                                { name: "HawbNo", value: hawbNo },
                                { name: "NameTitle", value: $(`#${utils.getFormId()} [name="k4securityletter_NameTitle"]`).val() },
                                { name: "IDNo", value: $(`#${utils.getFormId()} [name="k4securityletter_IDNo"]`).val() },
                                { name: "AcceptedName", value: $(`#${utils.getFormId()} [name = "k4securityletter_AcceptedName"]`).val() },
                                { name: "VerifiedName", value: $(`#${utils.getFormId()} [name="k4securityletter_VerifiedName"]`).val() },
                                { name: "LetterDate", value: kendo.toString($(`#${utils.getFormId()} [name="k4securityletter_LetterDate"]`).data("kendoDatePicker").value(), dateFormat) },
                                { name: "PalletNo", value: palletNo },
                            ],
                        });
                    }
                });

                console.log("print multiple letters", reports);
                utils.getMultipleRdlcReports(reports, "K4 Security Letter.zip");
            } else {
                var palletNo = "";
                $.ajax({
                    url: "../Air/Mawb/GetLoadplanHawbEquipList",
                    data: { id: modelData.MAWB_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
                    dataType: "text",
                    async: false,
                    success: function (result) { palletNo = result; }
                });
                var paras = [
                    { name: "CompanyId", value: data.companyId },
                    { name: "FrtMode", value: utils.getFrtMode() },
                    { name: "CompanyName", value: data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].COMPANY_NAME },
                    { name: "HawbNo", value: modelData.HAWB_NO },
                    { name: "NameTitle", value: $(`#${utils.getFormId()} [name="k4securityletter_NameTitle"]`).val() },
                    { name: "IDNo", value: $(`#${utils.getFormId()} [name="k4securityletter_IDNo"]`).val() },
                    { name: "AcceptedName", value: $(`#${utils.getFormId()} [name = "k4securityletter_AcceptedName"]`).val() },
                    { name: "VerifiedName", value: $(`#${utils.getFormId()} [name="k4securityletter_VerifiedName"]`).val() },
                    { name: "LetterDate", value: kendo.toString($(`#${utils.getFormId()} [name="k4securityletter_LetterDate"]`).data("kendoDatePicker").value(), dateFormat) },
                    { name: "PalletNo", value: palletNo },
                ];
                console.log("print letter", paras);
                controls.openReportViewer("K4securityletter", paras);
            }
        });
    }

    selectMawb = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Mawb/GetMawb",
            data: { id: filterValue, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                var mawbResult = {
                    MAWB_NO: result.MAWB_NO,
                    JOB_NO: result.JOB_NO,
                    AIRLINE_CODE: result.AIRLINE_CODE,
                    FLIGHT_NO: result.FLIGHT_NO,
                    FLIGHT_DATE: result.FLIGHT_DATE,
                };
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airHawb")[0], mawbResult, true);
            }
        });
    }

    selectUnusedBooking = function (selector) {
        console.log(selector);
        $.ajax({
            url: "../Air/Booking/GetBooking",
            data: { id: selector.dataItem.BOOKING_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                if (result.BookingPos != null)
                    result.HawbPos = result.BookingPos;

                result.HAWB_NO = result.BOOKING_NO;
                result.PACKAGE2 = result.SEC_PACKAGE;
                result.PACKAGE_UNIT2 = result.SEC_PACKAGE_UNIT;

                //Manifest Shipper / Consignee
                result.MAN_SHIPPER_CODE = result.SHIPPER_CODE;
                result.MAN_SHIPPER_DESC = result.SHIPPER_DESC;
                result.MAN_SHIPPER_BRANCH = result.SHIPPER_BRANCH;
                result.MAN_SHIPPER_SHORT_DESC = result.SHIPPER_SHORT_DESC;
                result.MAN_SHIPPER_ADDR1 = result.SHIPPER_ADDR1;
                result.MAN_SHIPPER_ADDR2 = result.SHIPPER_ADDR2;
                result.MAN_SHIPPER_ADDR3 = result.SHIPPER_ADDR3;
                result.MAN_SHIPPER_ADDR4 = result.SHIPPER_ADDR4;
                result.MAN_CONSIGNEE_CODE = result.CONSIGNEE_CODE;
                result.MAN_CONSIGNEE_DESC = result.CONSIGNEE_DESC;
                result.MAN_CONSIGNEE_BRANCH = result.CONSIGNEE_BRANCH;
                result.MAN_CONSIGNEE_SHORT_DESC = result.CONSIGNEE_SHORT_DESC;
                result.MAN_CONSIGNEE_ADDR1 = result.CONSIGNEE_ADDR1;
                result.MAN_CONSIGNEE_ADDR2 = result.CONSIGNEE_ADDR2;
                result.MAN_CONSIGNEE_ADDR3 = result.CONSIGNEE_ADDR3;
                result.MAN_CONSIGNEE_ADDR4 = result.CONSIGNEE_ADDR4;

                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airHawb")[0], result, true);
            }
        });
    }

    updateFromWarehouse = function (selector) {
        var formId = utils.getFormId(selector);
        $.ajax({
            url: "../Air/Booking/GetWarehouseHistory",
            data: { id: utils.getFormValue("BOOKING_NO"), companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                var model = {};
                var gwts = 0, vwts = 0, cwts = 0, pkgs = 0, vol = 0, cbm = 0;
                model.HawbDims = result;
                result.forEach(function (item) {
                    gwts += item.GWTS;
                    if (["RCSSHA", "RCSTAO", "RCSSZX"].indexOf(data.companyId) != -1)
                        vwts += Math.ceil(item.VWTS);
                    else
                        vwts += item.VWTS;

                    pkgs += item.CTNS;
                    vol += utils.roundUp(item.LENGTH * item.WIDTH * item.HEIGHT * item.CTNS, 2);
                });
                model.GWTS = gwts;
                model.VWTS = vwts;
                model.CWTS = gwts > vwts ? gwts : vwts;
                model.PACKAGE = pkgs;
                model.TOTAL_VOL = vol;
                model.CBM = utils.roundUp(vol / 1000000, 2);
                console.log(model);
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airHawb")[0], model, true);
            }
        });
    }

    uploadFiles = function (selector) {
        var formId = utils.getFormId(selector);
        var hawbNo = utils.getFormValue("HAWB_NO");
        var html = `<input type="file" name="uploadFiles" />`;
        var gridName = $(selector).parentsUntil(".k-widget.k-grid").last().parent().attr("name");
        var grid = $(`#${formId} [name="${gridName}"]`).data("kendoGrid");
        utils.alertMessage(html, "Upload Files", "info");

        $(`.kendo-window-alertMessage [name="uploadFiles"]`).kendoUpload({
            async: {
                autoUpload: true,
                saveField: "postedFiles",
                saveUrl: `../Air/Hawb/UploadFiles?hawbNo=${hawbNo}&userId=${data.user.USER_ID}`,
                //removeUrl: "../Air/Hawb/DeleteFiles"
            },
            validation: {
                maxFileSize: 52428800,
            },
            localization: {
                dropFilesHere: "Drag & Drop Files Here..."
            },
            complete: function (e) {
                $.ajax({
                    url: "../Air/Hawb/GetHawbDocs",
                    data: { id: hawbNo },
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
        window.open(`../Air/Hawb/DownloadFile?docId=${docId}`);
    }

    gridHawbDocsConfirmSaveChanges = function (e) {
        if (e.sender.dataSource.deleteDocs != null) {
            var html = "<b>Are you sure to delete the following file(s)?</b><br>";
            e.sender.dataSource.deleteDocs.forEach(function (doc) {
                html += `${doc.DOC_NAME}<br>`;
            });
            utils.confirmMessage(html.trim(), e,
                "controllers.airHawb.gridHawbDocsSaveChanges",
                "controllers.airHawb.gridHawbDocsCancelChanges",
            );
        } else {
            controllers.airHawb.gridHawbDocsSaveChanges(e);
        }
    }

    gridHawbDocsCancelChanges = function (e) {
        delete e.sender.dataSource.deleteDocs;
        e.sender.cancelChanges();
    }

    gridHawbDocsSaveChanges = function (e) {
        var hawbNo = utils.getFormValue("HAWB_NO");
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
            url: "../Air/Hawb/UpdateHawbDocs",
            data: {
                id: hawbNo,
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

    gridHawbDocsDelete = function (e) {
        if (e.sender.dataSource.deleteDocs == null)
            e.sender.dataSource.deleteDocs = [];

        e.sender.dataSource.deleteDocs.push({ DOC_ID: e.model.DOC_ID, DOC_NAME: e.model.DOC_NAME });
    }
}