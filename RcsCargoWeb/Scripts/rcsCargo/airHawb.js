export default class {
    constructor() {
    }

    initAirHawb = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        var hawbNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

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
    }

    selectMawb = function (selector, filterValue) {
        $.ajax({
            url: "../Air/Mawb/GetMawb",
            data: { id: filterValue, companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                controls.setValuesToFormControls(data.masterForms.filter(a => a.formName == "airHawb")[0], result, true);
            }
        });
    }

    selectUnusedBooking = function (selector) {
        $.ajax({
            url: "../Air/Booking/GetBooking",
            data: { id: "", companyId: data.companyId, frtMode: utils.getFrtMode() },
            success: function (result) {
                if (result.BookingPos != null)
                    result.HawbPos = result.BookingPos;

                result.PACKAGE2 = result.SEC_PACKAGE;
                result.PACKAGE_UNIT2 = result.SEC_PACKAGE_UNIT;
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