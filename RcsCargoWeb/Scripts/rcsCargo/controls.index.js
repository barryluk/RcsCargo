export default class {
    constructor() {
    }
    
    initIndexPage = function (pageSetting) {
        $(`#${pageSetting.id}`).html(data.htmlElements.indexPage(pageSetting.title, pageSetting.gridConfig.gridName));

        this.renderSearchControls(pageSetting);
        this.renderIndexGrid(pageSetting);
        kendo.ui.progress($(".container-fluid"), false);
    }

    //Render search controls
    renderSearchControls = function (pageSetting) {
        var html = `<div class="col-md-6">`;

        pageSetting.searchControls.forEach(function (control) {
            var formControlType = "input";
            if (control.type == "dateRange" || control.type == "buttonGroup") {
                formControlType = "div";
            }

            if (control.type == "searchInput") {
                html += `
                <div class="form-group row">
                    <label class="col-form-label col-md-2">${control.label}</label>
                    <span class="k-input k-textbox k-input-solid k-input-md k-rounded-md col-md-10" style="max-width: 340px; margin: 7px; padding: 0px">
                        <input class="k-input-inner" name="${control.name}" placeholder="${control.searchLabel}" style="max-width: 100%" />
                        <span class="k-input-separator k-input-separator-vertical"></span>
                        <span class="k-input-suffix k-input-suffix-horizontal">
                            <span class="k-icon k-i-search" aria-hidden="true"></span>
                        </span>
                    </span>
                </div>`;
            } else if (control.type == "buttonGroup") {
                html += `
            <div class="form-group row">
                <label class="col-form-label col-md-2" >${control.label}</label>
                <${formControlType} class="col-md-10" type="${control.type}" name="${control.name}" dataType="${control.dataType}" />
            </div>`;
            } else {
                html += `
            <div class="form-group row">
                <label class="col-form-label col-md-2">${control.label}</label>
                <${formControlType} class="col-md-10" type="${control.type}" name="${control.name}" />
            </div>`;
            }
        });

        html += `</div>`;
        $(`#${pageSetting.id} div.search-control`).append(html);
        $(`#${pageSetting.id} div.search-control .k-icon.k-i-search`).click(function () {
            pageSetting.id = utils.getFormId();
            var searchData = {};
            searchData = {
                searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                dateFrom: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                dateTo: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                companyId: data.companyId,
                frtMode: $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI",
                take: data.indexGridPageSize
            };

            $(`#${pageSetting.id} [name=${pageSetting.gridConfig.gridName}]`).data("kendoGrid").dataSource.transport.options.read.data = searchData;
            $(`#${pageSetting.id} [name=${pageSetting.gridConfig.gridName}]`).data("kendoGrid").dataSource.read();
        });

        controls.kendo.renderFormControl_kendoUI(pageSetting);
    }

    //Render index kendoGrid
    renderIndexGrid = function (pageSetting) {
        $(`[name=${pageSetting.gridConfig.gridName}]`).kendoGrid({
            columns: pageSetting.gridConfig.columns,
            dataSource: {
                transport: {
                    read: {
                        url: pageSetting.gridConfig.dataSourceUrl,
                        data: {
                            searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                            dateFrom: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                            dateTo: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                            companyId: data.companyId,
                            frtMode: $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI",
                            take: data.indexGridPageSize
                        },
                        dataType: "json"
                    }
                },
                schema: {
                    data: function (response) {
                        return response.Data;
                    },
                    total: function (response) {
                        return response.Total;
                    }
                },
                serverSorting: true,
                pageSize: data.indexGridPageSize,
                serverPaging: true,
            },
            resizable: true,
            sortable: true,
            toolbar: pageSetting.gridConfig.toolbar,
            height: 550,
            scrollable: { endless: true },
            selectable: "cell",
            pageable: {
                numeric: false,
                previousNext: false
            },
            dataBound: function (e) {
                var grid = this;
                controls.kendo.gridAutoFitColumns(grid);
                $(".k-grid-autoFitColumns").click(function (e) {
                    controls.kendo.gridAutoFitColumns(grid);
                });
            },
            change: function (e) {
                var selectedCell = this.select()[0];
                if ($(selectedCell).attr("style") == "cursor: pointer") {
                    //var data = this.dataItem(selectedCell.parentNode);
                    var id = $(selectedCell).text();
                    id = `${pageSetting.gridConfig.linkIdPrefix}_${id}_${data.companyId}_${utils.getFrtMode()}`;

                    //special format display for MAWB#
                    if (pageSetting.pageName == "airMawb") {
                        controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${utils.formatMawbNo($(selectedCell).text())}`, id, pageSetting.pageName);
                    } else {
                        controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${$(selectedCell).text()}`, id, pageSetting.pageName);
                    }
                }
            },
            excel: {
                proxyURL: "../Home/ExcelExportSave",
                allPages: true,
                fileName: "table_export.xlsx"
            }
        });
    }
}