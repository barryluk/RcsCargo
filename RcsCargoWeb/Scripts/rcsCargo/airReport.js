export default class {
    constructor() {
    }

    initAirReport = function (pageSetting) {
        //linkIdPrefix: airMawb / airBooking
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        var companyName = data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].COMPANY_NAME;
        var paras = [
            { name: "CompanyId", value: data.companyId },
            { name: "FrtMode", value: utils.getFrtMode() },
            { name: "CompanyName", value: companyName },
            { name: "DateFrom", value: $(`#${pageSetting.id} [name=dateRange]`).data("kendoDateRangePicker").range().start.toISOString() },
            { name: "DateTo", value: $(`#${pageSetting.id} [name=dateRange]`).data("kendoDateRangePicker").range().end.toISOString() },
        ];

        $(`#${pageSetting.id} .menuButton`).each(function () {
            $(this).click(function () {
                switch ($(this).text()) {
                    case "Booking Report":
                        var reportName = "AirBookingReport";
                        //paras.push({ name: "filename", value: "Booking Report" });
                        paras.push({ name: "fileFormat", value: "excel" });
                        //controls.openReportViewer(reportName, paras);
                        utils.getRdlcExcelReport(reportName, paras, "Booking Report");
                        break;

                    case "Booking DSR":
                        var reportName = "AirBookingDSR";
                        utils.getExcelReport(reportName, paras, "Booking DSR");
                        break;
                }
            });
        });
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
}