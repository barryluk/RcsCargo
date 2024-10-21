export default class {
    constructor() {
    }

    initAirMawb = function (masterForm) {
        //linkIdPrefix: airMawb / airBooking
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var mawbNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        $(`#${masterForm.id} div[type=buttonGroup][dataType=jobType]`).data("kendoButtonGroup").trigger("select");
        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `MAWB# ${utils.formatMawbNo(mawbNo)}`;
            if (e.id == "printMawb") {
                reportName = "AirMawb";
            } else if (e.id == "previewMawb") {
                reportName = "AirMawbPreview";
            } else if (e.id == "loadplan") {
                reportName = "AirLoadPlan";
                filename = `Loadplan ${utils.formatMawbNo(mawbNo)}`;
            } else if (e.id == "manifest") {
                reportName = "AirCargoManifest";
                filename = `CargoManifest ${utils.formatMawbNo(mawbNo)}`;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "MawbNo", value: mawbNo },
                { name: "JobNo", value: utils.getFormValue("JOB") },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });

        //multiple MAWB# (only available in create mode)
        if (masterForm.mode == "create") {
            $(`#${masterForm.id} [name="MAWB"]`).attr("class", "k-input k-input-solid k-input-md k-rounded-md");
            $(`#${masterForm.id} [name="MAWB"]`).after(`<button type="button" name="multipleMawbNo" style="margin: 4px;">Multiple MAWB#</button>`);
            $("[name='multipleMawbNo']").kendoButton({ icon: "ungroup" });
            $("[name='multipleMawbNo']").bind("click", function () {
                var html = `
                <div style="height: calc(100% - 30px)">
                    <span class="k-input k-textarea k-input-solid k-input-md k-rounded-md k-resize-none">
		                <textarea type="textArea" class="!k-overflow-y-auto k-input-inner" name="multipleMawbNo" maxlength="1000" rows="9" placeholder="Each MAWB# separated by new line..." style="width: 215px; resize: none; height: 100%;"></textarea>
	                </span>
                </div>`;
                utils.alertMessage(html, "Multiple MAWB#", null, null, true, "controllers.airMawb.processMultipleMawbNo");

                //$(`button[name="${masterForm.id}_processMultipleMawbNo"]`).bind("click", function () { });
            });
        }
    }

    processMultipleMawbNo = function (sender) {
        var masterForm = utils.getMasterForm();
        if (utils.isEmptyString($("textarea[name='multipleMawbNo']").val().trim())) {
            utils.showValidateNotification("MAWB# should not be empty", $("textarea[name='multipleMawbNo']"));
            return;
        }

        kendo.ui.progress($(`[name="kendo-window-alertMessage-content"]`), true);

        if ($(`#${masterForm.id}_mawbNoList`).length == 0)
            $(`#${masterForm.id} [name="MAWB"]`).before(`<span class="k-input k-input-solid k-input-md k-rounded-md" style="max-width: 340px; padding: 2px;"><div id="${masterForm.id}_mawbNoList"></div></span>`);
        else
            $(`#${masterForm.id}_mawbNoList`).parent().removeClass("hidden");


        $(`#${masterForm.id} [name="MAWB"]`).addClass("hidden");
        var mawbNos = [];
        $("textarea[name='multipleMawbNo']").val().split("\n").forEach(function (mawbNo) {
            if (!utils.isEmptyString(mawbNo.trim())) {
                if (!utils.isValidMawbNo(mawbNo.trim())) {
                    $(`#${masterForm.id} [name="MAWB"]`).val(mawbNo.trim());
                    mawbNos.push({ label: mawbNo.trim(), themeColor: "error", attributes: { "toolip-data-val": "Invalid MAWB#" } });
                } else if (utils.isExistingMawbNo(mawbNo.trim())) {
                    $(`#${masterForm.id} [name="MAWB"]`).val(mawbNo.trim());
                    mawbNos.push({ label: mawbNo.trim(), themeColor: "error", attributes: { "toolip-data-val": "MAWB# already exists" } });
                } else {
                    if (utils.isEmptyString($(`#${masterForm.id} [name="MAWB"]`).val().trim()))
                        $(`#${masterForm.id} [name="MAWB"]`).val(mawbNo.trim());

                    mawbNos.push({ label: mawbNo.trim(), themeColor: "info" });
                }
            }
        });

        if ($(`#${masterForm.id}_mawbNoList`).data("kendoChipList") == null) {
            $(`#${masterForm.id}_mawbNoList`).kendoChipList({
                itemSize: "small",
                removable: true,
                items: mawbNos,
                remove: function (e) {
                    //setTimeout trigger this function after item has been removed
                    setTimeout(function () {
                        $(`#${masterForm.id} .k-chip.k-chip-solid-info span.k-chip-label`).each(function () {
                            $(`#${masterForm.id} [name="MAWB"]`).val($(this).text());
                        });
                        $(`#${masterForm.id} .k-chip.k-chip-solid-error span.k-chip-label`).each(function () {
                            $(`#${masterForm.id} [name="MAWB"]`).val($(this).text());
                        });

                        var validator = $(`#${masterForm.id}`).data("kendoValidator");
                        validator.hideMessages();

                        if ($("div.k-chip").length == 0) {
                            $(`#${masterForm.id}_mawbNoList`).parent().addClass("hidden");
                            $(`#${masterForm.id} [name="MAWB"]`).val("");
                            $(`#${masterForm.id} [name="MAWB"]`).removeClass("hidden");
                        }

                    }, 500);
                }
            });
        } else {
            var chipList = $(`#${masterForm.id}_mawbNoList`).data("kendoChipList");
            $("div.k-chip").each(function () {
                chipList.remove($(this));
            });
            mawbNos.forEach(function (item) {
                chipList.add(item);
            });
        }

        $(`#${masterForm.id} [toolip-data-val]`).each(function () {
            var content = $(this).attr("toolip-data-val");
            $(this).kendoTooltip({
                //autoHide: false,
                content: content,
                show: function (e) {
                    e.sender.popup.element.addClass("red-tooltip");
                }
            });
        })

        var validator = $(`#${masterForm.id}`).data("kendoValidator");
        validator.hideMessages();

        kendo.ui.progress($(`[name="kendo-window-alertMessage-content"]`), false);
        sender.destroy();
    }

    changedJobType = function (selector) {
        //testObj = selector;
        var formId = utils.getFormId(selector.element);
        var selectedJobType = selector.selectedIndices[0] == 0 ? "C" : "D";     //0: Consol, 1: Direct
        //console.log(formId, selectedJobType);

        var tabStrip = $(`#${formId} .formGroupTab`).data("kendoTabStrip");
        var tabConsol = $(`#${formId} span:contains("Load Plan")`).parent();
        var tabDirect = $(`#${formId} span:contains("Direct Job")`).parent();

        if (selectedJobType == "C") {
            tabConsol.removeAttr("style");
            tabDirect.attr("style", "display: none");
        } else {
            tabConsol.attr("style", "display: none");
            tabDirect.removeAttr("style");
        }
    }

    lotAssignment = function (sender, lotNo) {
        //console.log(sender, lotNo);
        var gridHeight = 0;
        var html = `
            <div class="row col-sm-5" id="${utils.getFormId()}_lotAssignment">
                <label class="col-sm-2 col-form-label">Lot #</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" name="lotAssignment_lotNo" readonly="readonly" />
                </div>
                <label class="col-sm-2 col-form-label">Flight Date</label>
                <div class="col-sm-10">
                    <div type="dateRange" name="lotAssignment_flightDate" />
                </div>
                <div class="col-md-2">
                    <label class="col-form-label" >Search for</label>
                </div>
                <div class="col-md-10">
                    <span class="k-input k-textbox k-input-solid k-input-md k-rounded-md" style="max-width: 340px; margin: 2px; padding: 0px">
                        <input class="k-input-inner" name="lotAssignment_searchInput" placeholder="MAWB# / Job# / Flight# / Shipper" style="max-width: 100%" />
                        <span class="k-input-separator k-input-separator-vertical"></span>
                        <span class="k-input-suffix k-input-suffix-horizontal">
                            <span class="k-icon k-i-search" aria-hidden="true"></span>
                        </span>
                    </span>
                </div>
            </div>
            <div class="col-md-12">
                <label class="col-form-label" >Selected MAWB#</label>
                <div style="margin: 5px" name="lotAssignment_selectedMawbNos" type="chipList" required-checking="true" />
            </div>
            <div class="col-md-12">
                <div name="grid_mawbListForLotAssignment" type="grid" />
            </div>`;

        utils.alertMessage(html, "Lot Assignment", null, "large", true, "controllers.airMawb.updateLotAssignment");
        var formSetting = {
            id: `${utils.getFormId()}_lotAssignment`
        };
        controls.kendo.renderFormControl_kendoUI(formSetting);

        $(`.kendo-window-alertMessage span.k-i-search`).click(function () {
            $(`.kendo-window-alertMessage [name="grid_mawbListForLotAssignment"]`).data("kendoGrid").dataSource.read();
        });

        $(`.kendo-window-alertMessage [name="lotAssignment_selectedMawbNos"]`).kendoChipList({
            itemSize: "small",
            removable: true,
            remove: function (e) {
                setTimeout(function () { adjustGridHeight(); }, 1);
            }
        });

        if (!utils.isEmptyString(lotNo)) {
            $(`.kendo-window-alertMessage [name=lotAssignment_lotNo]`).val(lotNo);
            $.ajax({
                url: "../Air/Mawb/GetMawbNosByLot",
                data: {
                    lotNo: lotNo,
                    companyId: data.companyId,
                    frtMode: utils.getFrtMode(),
                },
                success: function (result) {
                    if (result != null) {
                        var chipList = $(`.kendo-window-alertMessage [name="lotAssignment_selectedMawbNos"]`).data("kendoChipList");
                        result.forEach(function (mawbNo) {
                            chipList.add({ label: mawbNo, themeColor: "info" });
                        });
                        //adjustGridHeight();
                    }
                },
            });
        }

        function adjustGridHeight() {
            //chipListHeight initial height: 32
            var chipListHeight = $(`.kendo-window-alertMessage [name="lotAssignment_selectedMawbNos"]`).parent().height();
            $(`.kendo-window-alertMessage [name=grid_mawbListForLotAssignment]`).height(gridHeight - (chipListHeight - 32));
            $(`.kendo-window-alertMessage [name=grid_mawbListForLotAssignment] .k-grid-content.k-auto-scrollable`).height(gridHeight - (chipListHeight - 32) - 116);
        }

        $(`.kendo-window-alertMessage [name="grid_mawbListForLotAssignment"]`).kendoGrid({
            toolbar: [
                { name: "selectAll", text: "Select All", iconClass: "k-icon k-i-tick" },
                { name: "selectMawb", text: "Add to Lot", iconClass: "k-icon k-i-plus" }],
            columns: [
                {
                    template: `<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md" />`
                },
                { field: "MAWB", title: "MAWB #" },
                { field: "JOB", title: "Job #" },
                { field: "LOT_NO", title: "Lot #" },
                {
                    field: "JOB_TYPE", title: "Type", template: function (dataItem) {
                        if (!data.isEmptyString(dataItem.JOB_TYPE)) {
                            return dataItem.JOB_TYPE == "C" ? "Consol" : "Direct";
                        } else {
                            return "";
                        }
                    }
                },
                { field: "FLIGHT_NO", title: "Flight #" },
                { field: "FLIGHT_DATE", title: "Flight Date" },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Dest." },
                { field: "ETA", title: "ETA" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "PACKAGE", title: "Packages" },
                { field: "GWTS", title: "G/Wts" },
                { field: "VWTS", title: "V/Wts" },
            ],
            resizable: true,
            sortable: true,
            scrollable: { endless: true },
            pageable: {
                numeric: false,
                previousNext: false
            },
            height: $(".kendo-window-alertMessage.k-window-content").height() - 165,
            dataSource: {
                serverSorting: true,
                pageSize: data.indexGridPageSize,
                serverPaging: true,
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: "../Air/Mawb/GridMawb_Read",
                            data: {
                                searchValue: $(`.kendo-window-alertMessage input[name=lotAssignment_searchInput]`).val(),
                                dateFrom: $(`.kendo-window-alertMessage [name="lotAssignment_flightDate"]`).data("kendoDateRangePicker").range().start.toISOString(),
                                dateTo: $(`.kendo-window-alertMessage [name="lotAssignment_flightDate"]`).data("kendoDateRangePicker").range().end.toISOString(),
                                companyId: data.companyId,
                                frtMode: utils.getFrtMode(),
                                take: data.indexGridPageSize,
                                skip: options.data.skip,
                                sort: options.data.sort,
                            },
                            success: function (result) {
                                options.success(result);
                            },
                        });
                    },

                    schema: {
                        data: function (response) {
                            return response.Data;
                        },
                        total: function (response) {
                            return response.Total;
                        }
                    },
                },
                schema: { data: function (response) { return response.Data; }, total: function (response) { return response.Total; } },
            },
            dataBound: function (e) {
                testObj = e.sender;
                e.sender.autoFitColumns();
                $(".kendo-window-alertMessage .k-grid-selectAll").bind("click", function (e) {
                    $(".kendo-window-alertMessage [name=grid_mawbListForLotAssignment] tbody .k-checkbox").attr("checked", "checked");
                });
                $(`.kendo-window-alertMessage .k-grid-selectMawb`).click(function () {
                    $(".kendo-window-alertMessage [name=grid_mawbListForLotAssignment] tbody .k-checkbox").each(function () {
                        if ($(this).is(":checked")) {
                            var mawbNo = $(this).parent().next().text();
                            if ($(`.kendo-window-alertMessage .k-chip.k-chip-solid-info span.k-chip-label`)
                                .filter(function () { return $(this).text() == mawbNo }).length == 0) {

                                    var chipList = $(`.kendo-window-alertMessage [name="lotAssignment_selectedMawbNos"]`).data("kendoChipList");
                                    chipList.add({ label: mawbNo, themeColor: "info" });
                                }
                        }
                    });
                    adjustGridHeight();
                });

                if (gridHeight == 0)
                    gridHeight = $(`.kendo-window-alertMessage [name=grid_mawbListForLotAssignment]`).height();

                adjustGridHeight();

                //remove the checkbox if Lot# already exist
                e.sender.items().each(function () {
                    if (!utils.isEmptyString($(this).children().eq(3).text())) {
                        $(this).children().eq(0).html("");
                    }
                });
            }
        });
    }

    updateLotAssignment = function (sender) {
        var chipList = $(`.kendo-window-alertMessage [name="lotAssignment_selectedMawbNos"]`).data("kendoChipList");
        if (chipList.items().length == 0) {
            utils.showValidateNotification("At least 1 MAWB should be selected", chipList.element);
            return;
        }

        var model = {
            lotNo: $(`.kendo-window-alertMessage [name=lotAssignment_lotNo]`).val(),
            companyId: data.companyId,
            frtMode: utils.getFrtMode(),
            mawbNos: [],
        };
        $(`.kendo-window-alertMessage .k-chip.k-chip-solid-info span.k-chip-label`).each(function () {
            model.mawbNos.push($(this).text());
        });
        //console.log(model);

        $.ajax({
            url: "../Air/Mawb/UpdateLotNo",
            dataType: "text",
            data: {
                lotNo: model.lotNo,
                companyId: model.companyId,
                frtMode: model.frtMode,
                mawbNos: model.mawbNos,
            },
            success: function (result) {
                $(`.kendo-window-alertMessage [name=lotAssignment_lotNo]`).val(result);
                utils.showNotification("Lot assignment saved successfully", "success",
                    $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                $(`.kendo-window-alertMessage [name=grid_mawbListForLotAssignment]`).data("kendoGrid").dataSource.read();
            }
        });
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

        utils.alertMessage(html, "Create Invoice", null, null, true, "controllers.airMawb.createInvoice");
        var formSetting = {};
        formSetting.id = `${utils.getFormId()}_createInvoice`;
        controls.kendo.renderFormControl_kendoUI(formSetting);

        $(`#${utils.getFormId()}_createInvoice`).kendoValidator({ errorTemplate: ({ message }) => utils.validatorErrorTemplate(message) });
    }

    createInvoice = function (sender) {
        var validator = $(`#${utils.getFormId()}_createInvoice`).data("kendoValidator");
        if (validator.validate()) {
            var modelData = JSON.parse($(`#${utils.getFormId()}`).attr("modelData"));
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
                INV_CATEGORY: "M",
                SHOW_DATE_TYPE: "F",
                MAWB_NO: modelData.MAWB,
                JOB_NO: modelData.JOB_NO,
                CUSTOMER_CODE: $("[name='invoicePayer_CODE']").val().split("-")[0],
                CUSTOMER_BRANCH: $("[name='invoicePayer_BRANCH']").val(),
                CUSTOMER_SHORT_DESC: $("[name='invoicePayer_SHORT_DESC']").val(),
                CUSTOMER_DESC: $("[name='invoicePayer']").data("kendoDropDownList").text()
                    .replace(`${$("[name='invoicePayer_CODE']").val().split("-")[0]} - `, ``)
                    .replace(` - ${$("[name='invoicePayer_CODE']").val().split("-")[1]}`, ``),
                AIRLINE_CODE: modelData.AIRLINE_CODE,
                FLIGHT_NO: modelData.FLIGHT_NO,
                FLIGHT_DATE: modelData.FLIGHT_DATE,
                FRT_PAYMENT_PC: $("[name='createInvoice_frtPaymentPc']").val(),
                PACKAGE: modelData.CTNS,
                PACKAGE_UNIT: modelData.PACKAGE_UNIT,
                GWTS: modelData.GWTS,
                VWTS: modelData.VWTS,
                CWTS: modelData.CWTS,
                ORIGIN: modelData.ORIGIN_CODE,
                DEST: modelData.DEST_CODE,
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
                model.CURR_CODE = modelData.P_CURR_CODE;
                model.EX_RATE = modelData.P_EX_RATE;
                grid = $(`#${utils.getFormId()} [name="grid_MawbChargesPrepaid"]`).data("kendoGrid");
                gridConfig = utils.getFormControlByName("MawbChargesPrepaid");
            } else {
                model.CURR_CODE = modelData.C_CURR_CODE;
                model.EX_RATE = modelData.C_EX_RATE;
                grid = $(`#${utils.getFormId()} [name="grid_MawbChargesCollect"]`).data("kendoGrid");
                gridConfig = utils.getFormControlByName("MawbChargesCollect");
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
                    kendo.ui.progress($(`#${utils.getFormId()}_createInvoice`), true);
                },
                success: function (result) {
                    console.log(result);
                    $.ajax({
                        url: "../Air/Mawb/GetMawbInvoices",
                        data: { id: model.MAWB_NO, companyId: model.COMPANY_ID, frtMode: model.FRT_MODE },
                        success: function (invoices) {
                            var invoiceModel = { Invoices: invoices };
                            controls.setValuesToFormControls(utils.getMasterFormByName("airMawb"), invoiceModel, true);
                            utils.showNotification("Invoice created success", "success");
                        }
                    });
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Invoice created failed, please contact system administrator!", "error");
                },
                complete: function () {
                    kendo.ui.progress($(`#${utils.getFormId()}_createInvoice`), false);
                    sender.destroy();
                }
            });

        }
    }

    searchBookingClick = function (selector) {
        var formId = utils.getFormId(selector);
        var targetGridName = "grid_LoadplanBookingListViews";

            var html = `<div class='kendo-window-loadplan-booking'>
                <div name="gridSearchBooking"></div>
            </div>`;

            $(".content-wrapper").append(html);
            var searchWin = $(".kendo-window-loadplan-booking").kendoWindow({
                title: "Search Booking",
                modal: true,
                //content: html,
                width: "40%",
                height: "40%",
                close: function (e) {
                    searchWin.destroy();
                },
            }).data("kendoWindow");

            searchWin.center().open();

            kendo.ui.progress($(`.kendo-window-loadplan-booking`), true);
            $.ajax({
                url: "../Air/Mawb/SearchBooking",
                data: { dest: utils.getFormValue("DEST_CODE"), companyId: data.companyId },
                success: function (result) {
                    setTimeout(function () {
                        var grid = $(`.kendo-window-loadplan-booking [name="gridSearchBooking"]`).kendoGrid({
                            toolbar: [
                                { name: "selectAll", text: "Select All", iconClass: "k-icon k-i-tick" },
                                { name: "selectBooking", text: "Add to loadplan", iconClass: "k-icon k-i-plus" }],
                            columns: [
                                {
                                    template: `<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md" />`
                                },
                                { field: "BOOKING_NO", title: "Booking #" },
                                { field: "SHIPPER_DESC", title: "Shipper" },
                                { field: "CONSIGNEE_DESC", title: "Consignee" },
                                { field: "PACKAGE", title: "Packages" },
                                { field: "GWTS", title: "G/Wts" },
                                { field: "VWTS", title: "V/Wts" },
                                { field: "IS_DOC_REC", title: "Doc Rcvd?" },
                                { field: "IS_BOOKING_APP", title: "Approved?" },
                                { field: "IS_RECEIVED", title: "Rcvd?" },
                            ],
                            dataSource: { data: result },
                            resizable: true,
                            height: $(".kendo-window-loadplan-booking.k-window-content").height(),
                            dataBound: function (e) {
                                $("[name=gridSearchBooking]").data("kendoGrid").autoFitColumns();
                            }
                        });
                    
                        kendo.ui.progress($(`.kendo-window-loadplan-booking`), false);

                        $(".kendo-window-loadplan-booking .k-grid-selectAll").bind("click", function (e) {
                            $(".kendo-window-loadplan-booking [name=gridSearchBooking] tbody .k-checkbox").attr("checked", "checked");
                        });

                        $(".kendo-window-loadplan-booking .k-grid-selectBooking").bind("click", function (e) {
                            var bookingData = $("[name=gridSearchBooking]").data("kendoGrid").dataSource.data();
                            var selectedBookings = [];
                            $(".kendo-window-loadplan-booking [name=gridSearchBooking] tbody .k-checkbox").each(function () {
                                if ($(this).is(":checked")) {
                                    var dataRow = bookingData.filter(a => a.BOOKING_NO == $(this).parent().next().text())[0];
                                    selectedBookings.push({
                                        BOOKING_NO: dataRow.BOOKING_NO,
                                        SHIPPER_DESC: dataRow.SHIPPER_DESC,
                                        CONSIGNEE_DESC: dataRow.CONSIGNEE_DESC,
                                        ORIGIN_CODE: dataRow.ORIGIN_CODE,
                                        DEST_CODE: dataRow.DEST_CODE,
                                        PACKAGE: dataRow.PACKAGE,
                                        GWTS: dataRow.GWTS,
                                        VWTS: dataRow.VWTS,
                                        IS_DOC_REC: dataRow.IS_DOC_REC,
                                        IS_BOOKING_APP: dataRow.IS_BOOKING_APP,
                                        IS_RECEIVED: dataRow.IS_RECEIVED,
                                    });
                                }
                            });

                            var targetGrid = $(`#${formId} [name="${targetGridName}"]`).data("kendoGrid");
                            var dataSource = targetGrid.dataSource;
                            dataSource.data(selectedBookings);
                            targetGrid.setDataSource(dataSource);
                            searchWin.close();
                        });
                    }, 500);
                    
                }
            });
    }

    checkDataClick = function (selector) {
        var formId = utils.getFormId(selector);
        var gridHawbData = $(`#${formId} [name="grid_LoadplanHawbListViews"]`).data("kendoGrid").dataSource.data();
        var gridEquipData = $(`#${formId} [name="grid_LoadplanHawbEquips"]`).data("kendoGrid").dataSource.data();
        var result = [];
        //console.log(gridHawbData);
        //console.log(gridEquipData);
        gridHawbData.forEach(function (hawb) {
            var pkgs = 0;
            gridEquipData.forEach(function (equip) {
                if (hawb.HAWB_NO == equip.HAWB_NO)
                    pkgs += equip.PACKAGE;
            });

            if (hawb.PACKAGE != pkgs)
                result.push({ HAWB_NO: hawb.HAWB_NO, PACKAGE: hawb.PACKAGE, PKGS: pkgs });
        });

        //console.log(result);
        if (result.length > 0) {
            var msg = "Equipments no. of packages doesn't match with HAWB packages:<br>";
            result.forEach(function (item) {
                msg += `HAWB: ${item.HAWB_NO}, Packages: ${item.PACKAGE}, wrong packages: <span style="color: red">${item.PKGS}</span><br>`;
            });
            utils.alertMessage(msg, "", "warning");
        } else {
            utils.alertMessage("All data entries are correct.");
        }
    }
}