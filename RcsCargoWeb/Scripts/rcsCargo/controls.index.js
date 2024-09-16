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
                        <div class="col-md-2">
                            <label class="col-form-label" >${control.label}</label>
                        </div>
                        <div class="col-md-10">
                            <span class="k-input k-textbox k-input-solid k-input-md k-rounded-md" style="max-width: 340px; margin: 2px; padding: 0px">
                                <input class="k-input-inner" name="${control.name}" placeholder="${control.searchLabel}" style="max-width: 100%" />
                                <span class="k-input-separator k-input-separator-vertical"></span>
                                <span class="k-input-suffix k-input-suffix-horizontal">
                                    <span class="k-icon k-i-search" aria-hidden="true"></span>
                                </span>
                            </span>
                        </div>
                    </div>`;
            } else if (control.type == "buttonGroup") {
                html += `
                    <div class="form-group row">
                        <div class="col-md-2">
                            <label class="col-form-label" >${control.label}</label>
                        </div>
                        <div class="col-md-10">
                            <${formControlType} type="${control.type}" name="${control.name}" dataType="${control.dataType}" />
                        </div>
                    </div>`;
            } else {
                html += `
                    <div class="form-group row">
                        <div class="col-md-2">
                            <label class="col-form-label" >${control.label}</label>
                        </div>
                        <div class="col-md-10">
                            <${formControlType} type="${control.type}" name="${control.name}" />
                        </div>
                    </div>`;
            }
        });

        html += `</div>`;
        $(`#${pageSetting.id} div.search-control`).append(html);
        $(`#${pageSetting.id} div.search-control .k-icon.k-i-search`).click(function () {
            pageSetting.id = utils.getFormId();

            var ds = $(`#${pageSetting.id} [name=${pageSetting.gridConfig.gridName}]`).data("kendoGrid").dataSource;
            //ds.read();
            $(`#${pageSetting.id} [name=${pageSetting.gridConfig.gridName}]`).data("kendoGrid").setDataSource(ds);
        });

        controls.kendo.renderFormControl_kendoUI(pageSetting);
    }

    //Render index kendoGrid
    renderIndexGrid = function (pageSetting) {
        var gridHeight = $(".content-wrapper").height() - 220;

        $(`[name=${pageSetting.gridConfig.gridName}]`).kendoGrid({
            columns: pageSetting.gridConfig.columns,
            dataSource: {
                transport: {
                    read: function (options) {
                        if (pageSetting.id.indexOf("Index") == -1) {
                            pageSetting.id = utils.getFormId();
                        }

                        var searchData = {
                            searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                            dateFrom: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                            dateTo: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                            companyId: data.companyId,
                            frtMode: $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI",
                            take: data.indexGridPageSize,
                            skip: options.data.skip,
                            sort: options.data.sort,
                        };

                        $.ajax({
                            url: pageSetting.gridConfig.dataSourceUrl,
                            data: searchData,
                            success: function (result) {
                                options.success(result);
                            },
                        });
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
            height: gridHeight,
            scrollable: { endless: true },
            selectable: "cell",
            pageable: {
                numeric: false,
                previousNext: false
            },
            dataBound: function (e) {
                var grid = this;
                var formId = utils.getFormId(grid.element);
                controls.kendo.gridAutoFitColumns(grid);

                $(".k-grid-autoFitColumns").unbind("click");
                $(`#${formId} .k-grid button:contains("New")`).unbind("click");

                $(".k-grid-autoFitColumns").bind("click", function (e) {
                    controls.kendo.gridAutoFitColumns(grid);
                });

                $(`#${formId} .k-grid button:contains("New")`).bind("click", function (e) {
                    var id = `${pageSetting.gridConfig.linkIdPrefix}_NEW_${data.companyId}_${utils.getFrtMode()}`;
                    controls.append_tabStripMain(`${pageSetting.title}# NEW`, id, pageSetting.pageName);
                });
            },
            change: function (e) {
                var grid = this;
                var selectedCell = this.select()[0];
                if ($(selectedCell).hasClass("link-cell")) {
                    //var data = this.dataItem(selectedCell.parentNode);
                    var id = $(selectedCell).text();
                    id = `${pageSetting.gridConfig.linkIdPrefix}_${id}_${data.companyId}_${utils.getFrtMode()}`;

                    //special format display for MAWB#
                    //if (pageSetting.pageName == "airMawb") {
                    //    controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${utils.formatMawbNo($(selectedCell).text())}`, id, pageSetting.pageName);
                    //} else {
                        controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${$(selectedCell).text()}`, id, pageSetting.pageName);
                    //}
                    grid.clearSelection();
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