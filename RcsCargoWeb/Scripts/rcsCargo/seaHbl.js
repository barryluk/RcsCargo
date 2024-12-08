export default class {
    constructor() {
    }

    initSeaHbl = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        let hblNo = masterForm.id.split("_")[1];
        let companyId = masterForm.id.split("_")[2];
        let frtMode = masterForm.id.split("_")[3];

        let printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            let buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            let reportName = "";
            let reportType = buttonConfig.type;
            let filename = `B/L# ${hblNo}`;
            masterForm = utils.getMasterForm();
            let model = controls.getValuesFromFormControls(masterForm);
            let paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "HblNo", value: hblNo },
                { name: "ContainerWords", value: model.ENTRY_WORD1 },
                { name: "ShowLogo", value: false },
                { name: "ShowChg", value: false },
                { name: "filename", value: filename }];

            if (e.id == "previewHbl") {
                paras.filter(a => a.name == "ShowLogo")[0].value = true;
                reportName = "SeaHouseBill";
            } else if (e.id == "previewHblA4") {
                paras.filter(a => a.name == "ShowLogo")[0].value = true;
                reportName = "SeaHouseBill_A4";
            } else if (e.id == "printHbl") {
                reportName = "SeaHouseBillNoFrame";
                console.log(paras);
            } else if (e.id == "printHblA4") {
                paras.push({ name: "ShowWord", value: "ORIGINAL" })
                reportName = "SeaHouseBill_A4";
            } else if (e.id == "printHblA4Copy") {
                paras.push({ name: "ShowWord", value: "COPY" })
                reportName = "SeaHouseBill_A4";
            } else if (e.id == "printFcr") {
                paras.push({ name: "ShowWord", value: "" })
                reportName = "SeaFCR";
            } else if (e.id == "printUS") {
                paras.push({ name: "ShowWord", value: "ORIGINAL" })
                reportName = "SeaHouseBill_US_A4";
            } else if (e.id == "printUSCopy") {
                paras.push({ name: "ShowWord", value: "COPY" })
                reportName = "SeaHouseBill_US_A4";
            }

            if (reportType == "pdf") {
                controls.openReportViewer(reportName, paras);
            } else if (reportType == "xlsx") {
                utils.getExcelReport(reportName, paras);
            }
        });

        $(`#${masterForm.id} [name="TO_ORDER_FLAG"]`).parent().attr("style", "width: 90px")
    }

    uploadFiles = function (selector) {
        var formId = utils.getFormId(selector);
        var hblNo = utils.getFormValue("HBL_NO");
        var html = `<input type="file" name="uploadFiles" />`;
        var gridName = $(selector).parentsUntil(".k-widget.k-grid").last().parent().attr("name");
        var grid = $(`#${formId} [name="${gridName}"]`).data("kendoGrid");
        utils.alertMessage(html, "Upload Files", "info");

        $(`.kendo-window-alertMessage [name="uploadFiles"]`).kendoUpload({
            async: {
                autoUpload: true,
                saveField: "postedFiles",
                saveUrl: `../Sea/Hbl/UploadFiles?hblNo=${hblNo}&userId=${data.user.USER_ID}`,
                //removeUrl: "../Sea/Hbl/DeleteFiles"
            },
            validation: {
                maxFileSize: 52428800,
            },
            localization: {
                dropFilesHere: "Drag & Drop Files Here..."
            },
            complete: function (e) {
                $.ajax({
                    url: "../Sea/Hbl/GetHblDocs",
                    data: { id: hblNo },
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
        window.open(`../Sea/Hbl/DownloadFile?docId=${docId}`);
    }

    gridHblDocsConfirmSaveChanges = function (e) {
        if (e.sender.dataSource.deleteDocs != null) {
            var html = "<b>Are you sure to delete the following file(s)?</b><br>";
            e.sender.dataSource.deleteDocs.forEach(function (doc) {
                html += `${doc.DOC_NAME}<br>`;
            });
            utils.confirmMessage(html.trim(), e,
                "controllers.seaHbl.gridHblDocsSaveChanges",
                "controllers.seaHbl.gridHblDocsCancelChanges",
            );
        } else {
            controllers.seaHbl.gridHblDocsSaveChanges(e);
        }
    }

    gridHblDocsCancelChanges = function (e) {
        delete e.sender.dataSource.deleteDocs;
        e.sender.cancelChanges();
    }

    gridHblDocsSaveChanges = function (e) {
        var hblNo = utils.getFormValue("HBL_NO");
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
            url: "../Sea/Hbl/UpdateHblDocs",
            data: {
                id: hblNo,
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

    gridHblDocsDelete = function (e) {
        if (e.sender.dataSource.deleteDocs == null)
            e.sender.dataSource.deleteDocs = [];

        e.sender.dataSource.deleteDocs.push({ DOC_ID: e.model.DOC_ID, DOC_NAME: e.model.DOC_NAME });
    }
}