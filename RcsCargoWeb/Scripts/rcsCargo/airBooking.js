export default class {
    constructor() {
    }

    initAirBooking = function (masterForm) {
        //id format: airBooking_{bookingNo}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var bookingNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];
        
        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `Booking# ${bookingNo}`;
            if (e.id == "printBooking") {
                reportName = "AirBooking";
            } else if (e.id == "printBookingHawb") {
                reportName = "AirBooking_Hawb";
            } else if (e.id == "printWarehouseReceipt") {
                controllers.airBooking.printWarehouseReceipt();
                return;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "BookingNo", value: bookingNo },
                { name: "CompanyName", value: data.companyId },
                { name: "CustomerType", value: "Shipper" },
                { name: "filename", value: filename },]);
        });

        //Manual input Booking #
        if (masterForm.mode == "create") {
            $(`#${masterForm.id} [name="BOOKING_NO"]`).removeClass("form-control");
            $(`#${masterForm.id} [name="BOOKING_NO"]`).addClass("form-control-text k-input-inner readonlyInput");
            $(`#${masterForm.id} [name="BOOKING_NO"]`).after(`<i class="k-icon k-i-change-manually handCursor" title="Manual input Booking#"></i>`);

            $(`#${masterForm.id} .k-i-change-manually`).bind("click", function () {
                if ($(`#${masterForm.id} [name="BOOKING_NO"]`).attr("readonly") == null) {
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).attr("readonly", "readonly");
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).addClass("readonlyInput");
                }
                else {
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).removeAttr("readonly", "readonly");
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).removeClass("readonlyInput");
                }
            });
        }

        //Auto calculate vwts, cuft
        $(`#${masterForm.id} [name="CBM"]`).blur(function () {
            let inputVwtsFactor = $(`#${masterForm.id} [name="VWTS_FACTOR"]`).data("kendoDropDownList");
            let inputCbm = $(this).data("kendoNumericTextBox");
            let inputVwts = $(`#${masterForm.id} [name="VWTS"]`).data("kendoNumericTextBox");
            let inputCuft = $(`#${masterForm.id} [name="CUFT"]`).data("kendoNumericTextBox");

            if (inputCbm.value() != null) {
                inputVwts.value(utils.roundUp(inputCbm.value() * 1000000 / inputVwtsFactor.value(), 2));
                inputCuft.value(utils.roundUp(inputCbm.value() * 35.31, 2))
            }
        });

        //Save as new button click event
        $(`#${masterForm.id} button .k-i-copy`).parent().bind("click", function () {
            let html = `Are you sure to as new booking?<br><br>
                <div class="row col-sm-12" style="width: 500px; margin-bottom: 20px">
                    <label class="col-sm-4 col-form-label">Manual assign Booking#</label>
                    <div class="col-sm-8">
                        <input type='text' class='form-control' name='saveAsNew_bookingNo' placeHolder='New booking#, blank for auto generate.' />
                    </div>
                </div>`;

            utils.alertMessage(html, "Save as new booking", "confirm", null, true, "controllers.airBooking.saveAsNewBookingClick");
        });
    }

    saveAsNewBookingClick = function (sender) {
        let assignedBookingNo = $(`[name="saveAsNew_bookingNo"]`).val();
        let masterForm = utils.getMasterForm();
        let validator = $(`#${masterForm.id}`).data("kendoValidator");

        if (!utils.isEmptyString(assignedBookingNo)) {
            if (utils.isExistingBookingNo(assignedBookingNo)) {
                utils.showNotification("Booking# already exist, please use a different booking number.", "error",
                    $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                return;
            }
        }

        if (!validator.validate()) {
            utils.showNotification("Validation failed, please verify the data entry", "error",
                $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
            return;
        } else {
            masterForm.mode = "create";
            let model = controls.getValuesFromFormControls(masterForm);
            model.BOOKING_NO = utils.formatText(assignedBookingNo) ?? "";
            if (model.BookingPos != null) {
                model.BookingPos.forEach(function (po) {
                    po.BOOKING_NO = utils.formatText(assignedBookingNo) ?? "";
                });
            }
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
                    controls.append_tabStripMain(`${masterForm.title} ${result.BOOKING_NO}`,
                        `${masterForm.formName}_${result.BOOKING_NO}_${data.companyId}_${result.FRT_MODE}`, masterForm.formName);

                    utils.showNotification(`Save success, new booking# ${result.BOOKING_NO}`, "success", $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
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

    printWarehouseReceipt = function () {
        utils.alertMessage("Warehouse Receipt...", "Print Warehouse Receipt", "info", "medium");
    };

    pasteToPo = function () {
        let html = `
            <div id="${utils.getFormId()}_pasteToPo">
                <div class="row col-sm-12" style="width: 600px">
                    <label class="col-sm-2 col-form-label">PO Content Type:</label>
                    <div class="col-sm-10">
                        <input class="form-control-dropdownlist" name="poContentType" />
                    </div>
                    <span class="k-input k-textarea k-input-solid k-input-md k-rounded-md k-resize-none">
                        <textArea name="pastedContent" class="!k-overflow-y-auto k-input-inner" maxlength="2000" rows="8" autocomplete="off" style="width: 100%; resize: none; height: 100%;"></textArea>
                    </span>
                </div>
                <br>
                <div class="col-md-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="pasteToPo_paste"><span class="k-icon k-i-clipboard-text"></span>Paste</span>
                </div>
            </div>`;

        let dialog = utils.alertMessage(html, "Paste from Excel", null, null, false);

        $(`#${utils.getFormId()} [name="poContentType"]`).kendoDropDownList({
            dataSource: {
                data: [
                    { text: "KateSpade (CT#, PO#, STYLE#)", value: "poKateSpade" },
                    { text: "PO# separated by comma (',') ", value: "poComma"},
                    { text: "PO# separated new line)", value: "poNewline" },
                ]
            },
            dataTextField: "text",
            dataValueField: "value",
            change: function (e) {
                let placeHolder = "Paste contents here, example:\n";
                if (this.value() == "poKateSpade")
                    placeHolder += "CT#54370 PO#PO0000740 STYLE#SKBR2019\nCT#54457 PO#PO0000741 STYLE#SKBR2014";
                else if (this.value() == "poComma")
                    placeHolder += "PO0000740,PO0000741";
                else if (this.value() == "poNewline")
                    placeHolder += "PO0000740\nPO0000741";

                $(`#${utils.getFormId()} [name="pastedContent"]`).attr("placeHolder", placeHolder);
            }
        }).data("kendoDropDownList").trigger("change");

        $(`#${utils.getFormId()} [name="pasteToPo_paste"]`).click(function () {
            let lineNo = 1;
            if (!utils.isEmptyString($(`#${utils.getFormId()} [name="pastedContent"]`).val())) {
                let pastedContents = $(`#${utils.getFormId()} [name="pastedContent"]`).val().trim();
                let grid = $(`#${utils.getMasterFormId()} [name="grid_BookingPos"]`).data("kendoGrid");
                let poContentType = $(`#${utils.getFormId()} [name="poContentType"]`).data("kendoDropDownList").value();

                if (poContentType == "poKateSpade") {
                    pastedContents.split("\n").forEach(function (strline) {
                        let str = strline.trim();
                        if (!utils.isEmptyString(str)) {
                            if (str.indexOf("CT#") != -1 && str.indexOf("PO#") != -1 && str.indexOf("STYLE#") != -1) {
                                let materialNo = "";
                                let styleNo = "";
                                let poNo = "";
                                str.split(" ").forEach(function (value) {
                                    if (value.trim().startsWith("CT#"))
                                        materialNo = value.replace("CT#", "").trim();
                                    else if (value.trim().startsWith("STYLE#"))
                                        styleNo = value.replace("STYLE#", "").trim();
                                    else if (value.trim().startsWith("PO#"))
                                        poNo = value.replace("PO#", "").trim();

                                    if (!utils.isEmptyString(poNo) && !utils.isEmptyString(styleNo) && !utils.isEmptyString(materialNo)) {
                                        grid.dataSource.data().push({
                                            LINE_NO: lineNo,
                                            PO_NO: poNo,
                                            STYLE_NO: styleNo,
                                            MATERIAL_NO: materialNo,
                                            QTY: 0,
                                            UNIT: "CTNS",
                                        });
                                        lineNo++;
                                    }
                                });
                            }

                        }
                    });
                } else if (poContentType == "poComma") {
                    pastedContents.split(",").forEach(function (strline) {
                        let str = strline.trim();
                        if (!utils.isEmptyString(str)) {
                            grid.dataSource.data().push({
                                LINE_NO: lineNo,
                                PO_NO: str,
                                QTY: 0,
                                UNIT: "CTNS",
                            });
                            lineNo++;
                        };
                    });
                } else if (poContentType == "poNewline") {
                    pastedContents.split("\n").forEach(function (strline) {
                        let str = strline.trim();
                        if (!utils.isEmptyString(str)) {
                            grid.dataSource.data().push({
                                LINE_NO: lineNo,
                                PO_NO: str,
                                QTY: 0,
                                UNIT: "CTNS",
                            });
                            lineNo++;
                        };
                    });
                }
            }
            if (lineNo == 1)
                utils.showNotification("Pasted PO failed, content format is incorrect.", "error", ".k-widget.k-window .k-i-close");
            else
                dialog.destroy();
        });
    }

    pasteToWarehouse = function () {
        let html = `
            <div id="${utils.getFormId()}_pasteToWarehouse">
                <div class="row col-sm-12" style="width: 650px;">
                    <div name="pastedContent" style="height: 450px;" />
                </div>
                <br>
                <div class="col-md-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 30%" name="pasteToWarehouse_paste"><span class="k-icon k-i-clipboard-text"></span>Paste To Warehouse</span>
                </div>
            </div>`;

        let dialog = utils.alertMessage(html, "Paste from Excel (Warehouse)", null, null, false);

        $(`#${utils.getFormId()} [name="pastedContent"]`).kendoSpreadsheet({
            toolbar: false,
            sheetsbar: false,
            sheets: [{
                rows: [{
                    cells: [{ value: "日期", enable: false, background: "rgb(167,214,255)", color: "rgb(0,62,117)", bold: true },
                        { value: "件数", enable: false, background: "rgb(167,214,255)", color: "rgb(0,62,117)", bold: true },
                        { value: "重量", enable: false, background: "rgb(167,214,255)", color: "rgb(0,62,117)", bold: true },
                        { value: "体积", enable: false, background: "rgb(167,214,255)", color: "rgb(0,62,117)", bold: true },
                        { value: "货物尺寸", enable: false, background: "rgb(167,214,255)", color: "rgb(0,62,117)", bold: true }]
                },],
                columns: [{ width: 120 }, { width: 50 }, { width: 50 }, { width: 50 }, { width: 280 },],
            }],
            paste: function (e) {
                e.preventDefault();
                let cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
                let rowIndex = e.range.topLeft().row + 1;
                let sheet = $(e.sender.element).data("kendoSpreadsheet").sheets()[0];
                e.clipboardContent.data.forEach(function (row) {
                    let colIndex = e.range.topLeft().col;
                    row.forEach(function (cell) {
                        sheet.range(`${cols[colIndex]}${rowIndex}`).value(cell.value);
                        colIndex++;
                    });
                    rowIndex++;
                });
            }
        });

        $(`#${utils.getFormId()} [name="pasteToWarehouse_paste"]`).click(function () {
            let lineNo = 1;
            let warehouse = [];
            let rows = $(`#${utils.getFormId()} [name="pastedContent"]`).data("kendoSpreadsheet").toJSON().sheets[0].rows;

            try {
                rows.forEach(function (row) {
                    //skip the header row
                    if (rows.indexOf(row) > 0) {
                        //[0]: date, [1]: ctns, [2]: gwts, [3]: cbm, [4]: dim
                        row.cells[4].value.split("\n").forEach(function (dim) {
                            if (!utils.isEmptyString(dim.trim())) {
                                warehouse.push({
                                    CREATE_DATE: utils.parseDate(row.cells[0].value) ?? new Date(),
                                    PACKAGE_TYPE: "CTNS",
                                    CTNS: eval(dim.split("*")[3].substring(0, dim.split("*")[3].indexOf("="))),
                                    GWTS: utils.roundUp(eval(row.cells[2].value) * (eval(dim.split("*")[3].substring(0, dim.split("*")[3].indexOf("="))) / eval(row.cells[1].value)), 2),
                                    VWTS: utils.roundUp(eval(dim.split("*")[0]) * eval(dim.split("*")[1]) * eval(dim.split("*")[2]) * eval(dim.split("*")[3].substring(0, dim.split("*")[3].indexOf("="))) / 1000000 / 0.006, 2),
                                    LENGTH: eval(dim.split("*")[0]),
                                    WIDTH: eval(dim.split("*")[1]),
                                    HEIGHT: eval(dim.split("*")[2]),
                                    MEASURE_UNIT: "C",
                                    DIMENSION: `${eval(dim.split("*")[0])}x${eval(dim.split("*")[1])}x${eval(dim.split("*")[2])}C\\${eval(dim.split("*")[3].substring(0, dim.split("*")[3].indexOf("=")))}`,
                                    IS_PICKUP: "N",
                                    IS_DEL: "N",
                                    IS_DAM: "N",
                                });
                                lineNo++;
                            }
                        });
                    }
                });
            } catch (err) {
                utils.showNotification(`Paste to warehouse failed: ${err}`, "error", ".k-widget.k-window .k-i-close");
                return;
            }

            if (lineNo == 1)
                utils.showNotification("Paste to warehouse failed, content format is incorrect.", "error", ".k-widget.k-window .k-i-close");
            else {
                let grid = $(`#${utils.getMasterFormId()} [name="grid_WarehouseHistories"]`).data("kendoGrid");
                grid.dataSource.data(warehouse);
                dialog.destroy();
            }
        });
    }
}