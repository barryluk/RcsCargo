export default class {
    constructor() {
    }
    
    initIndexPage = function (pageSetting) {
        if (pageSetting.gridConfig != null) {
            $(`#${pageSetting.id}`).html(data.htmlElements.indexPage(pageSetting.title, pageSetting.gridConfig.gridName));
            this.renderSearchControls(pageSetting);
            this.renderIndexGrid(pageSetting);
        } else {
            $(`#${pageSetting.id}`).html(data.htmlElements.indexPage(pageSetting.title));
            this.renderSearchControls(pageSetting, false);
            this.renderControls(pageSetting);
        }

        if (pageSetting.additionalScript != null) {
            if (["country", "port", "airline", "currency", "charge", "chargeTemplate"].indexOf(pageSetting.pageName) == -1)
                eval(`controllers.${pageSetting.pageName}.${pageSetting.additionalScript}(pageSetting)`);
            else
                eval(`controllers.masterRecords.${pageSetting.additionalScript}(pageSetting)`);
        }

        kendo.ui.progress($(".container-fluid"), false);
    }

    renderControls = function (pageSetting) {
        var html = "";

        if (pageSetting.groups != null) {
            $(`#${pageSetting.id}`).append(`<div name="main" class="row"></div>`);
            pageSetting.groups.forEach(function (group) {
                var ctrlHtml = "";
                $(`#${pageSetting.id} div[name="main"]`).append(`<div name="${group.name}" class="row col-xl-${group.colWidth} col-lg-6"></div>`);
                group.controls.forEach(function (control) {
                    var iconHtml = "";
                    if (control.icon != null)
                        iconHtml = `<span class="k-icon ${control.icon} k-button-icon"></span>`;
                    ctrlHtml += `<span class="menuButton k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="${control.name}">${iconHtml}${control.label}</span>`;
                });
                $(`#${pageSetting.id} [name="${group.name}"]`).append(data.htmlElements.card(group.title, ctrlHtml, 12, "info", "center"));
            });
        }

        if (pageSetting.controls != null) {
            pageSetting.controls.forEach(function (control) {
                var colWidth = "";
                var callbackFunction = "";
                var controlHtml = "";
                var formControlType = "input";
                var formControlClass = "form-control";

                if (control.colWidth != null)
                    colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;
                if (data.dropdownlistControls.includes(control.type))
                    formControlClass = "form-control-dropdownlist";
                if (control.callbackFunction != null)
                    callbackFunction = `callbackFunction="${control.callbackFunction}"`;
                if (control.type != "emptyBlock")
                    controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${callbackFunction} />`;
                else {
                    if (control.name != null)
                        controlHtml = `<div name="${control.name}" />`;
                    else
                        controlHtml = `<div />`;
                }

                if (control.label != null) {
                    html += `
                    <div class="row ${colWidth}">
                        <label class="col-sm-3 col-form-label">${control.label}</label>
                        <div class="col-sm-9">
                            ${controlHtml}
                        </div>
                    </div>`;
                } else {
                    html += `
                    <div class="row ${colWidth}">
                        <div class="col-sm-12">
                            ${controlHtml}
                        </div>
                    </div>`;
                }
            });
        }

        $(`#${pageSetting.id}`).append(html);
        controls.kendo.renderFormControl_kendoUI(pageSetting);
    }

    //Render search controls
    renderSearchControls = function (pageSetting, initKendoControls = true) {
        var html = `<div class="col-md-6">`;

        if (pageSetting.searchControls != null) {
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

            if (initKendoControls)
                controls.kendo.renderFormControl_kendoUI(pageSetting);
        }
    }

    //Render index kendoGrid
    renderIndexGrid = function (pageSetting) {
        var gridHeight = $(".content-wrapper").height() - 232;

        $(`[name=${pageSetting.gridConfig.gridName}]`).kendoGrid({
            columns: pageSetting.gridConfig.columns,
            dataSource: {
                transport: {
                    read: function (options) {
                        if (pageSetting.id.indexOf("Index") == -1) {
                            pageSetting.id = utils.getFormId();
                        }

                        var searchData = {};

                        if (pageSetting.searchControls.length <= 1) {
                            searchData = {
                                searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                                companyId: data.companyId,
                                take: data.indexGridPageSize,
                                skip: options.data.skip,
                                sort: options.data.sort,
                            };
                        } else {
                            searchData = {
                                searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                                dateFrom: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                                dateTo: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                                companyId: data.companyId,
                                frtMode: $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI",
                                take: data.indexGridPageSize,
                                skip: options.data.skip,
                                sort: options.data.sort,
                            };
                        }

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
                serverSorting: pageSetting.gridConfig.serverSorting == null ? true : pageSetting.gridConfig.serverSorting,
                pageSize: data.indexGridPageSize,
                serverPaging: pageSetting.gridConfig.serverSorting == null ? true : pageSetting.gridConfig.serverSorting,
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

                $(`#${formId} .k-grid-content.k-auto-scrollable`).height($(`#${formId} .k-grid-content.k-auto-scrollable`).height() - 7);

                $(".k-grid-autoFitColumns").unbind("click");
                $(".k-grid-autoFitColumns").bind("click", function (e) {
                    controls.kendo.gridAutoFitColumns(grid);
                });

                if (pageSetting.gridConfig.linkIdPrefix != null) {
                    $(`#${formId} .k-grid button:contains("New")`).unbind("click");
                    $(`#${formId} .k-grid button:contains("New")`).bind("click", function (e) {
                        var id = `${pageSetting.gridConfig.linkIdPrefix}_NEW_${data.companyId}_${utils.getFrtMode()}`;
                        controls.append_tabStripMain(`${pageSetting.title}# NEW`, id, pageSetting.pageName);
                    });
                }

                //Toolbar custom button events
                if (pageSetting.gridConfig.toolbar != null) {
                    pageSetting.gridConfig.toolbar.forEach(function (button) {
                        if (["new", "excel", "autoFitColumns"].indexOf(button.name) == -1) {
                            if (button.callbackFunction != null) {
                                var controlName = grid.element.attr("name");
                                //remove all bindings for the control, to prevent duplicated events
                                $(`#${formId} [name="${controlName}"] button.k-grid-${button.name}`).unbind();
                                $(`#${formId} [name="${controlName}"] button.k-grid-${button.name}`).bind("click", function (e) {
                                    eval(`${button.callbackFunction}(e.target)`);
                                });
                            }
                        }
                    })
                }

                //remove the link-cell attribute if no data in the cell
                let rowIndex = 0;
                grid.items().each(function () {
                    let tr = $(this);
                    let dataItem = grid.dataItems()[rowIndex];
                    tr.children().each(function () {
                        let td = $(this);
                        if (td.hasClass("link-cell") && utils.isEmptyString(td.text()))
                            td.removeClass("link-cell");

                        if (td.hasClass("link-cell") && !td.text().endsWith("VOID") && dataItem["IS_VOIDED"] == "Y") {
                            td.append(`<span class="right badge badge-warning" style="margin-left: 4px">VOID</span>`);
                        }
                    });
                    rowIndex++;
                });

                //Auto resize columns width
                controls.kendo.gridAutoFitColumns(grid);

                //override the column width after autoFitColumns function
                pageSetting.gridConfig.columns.forEach(function (col) {
                    if (col.width != null) {
                        grid.resizeColumn(grid.columns[pageSetting.gridConfig.columns.indexOf(col)], col.width);
                    }
                });
            },
            change: function (e) {
                var grid = this;
                var selectedCell = this.select()[0];
                if ($(selectedCell).hasClass("link-cell")) {
                    //var data = this.dataItem(selectedCell.parentNode);
                    var id = $(selectedCell).text().replace("VOID", "");
                    if ($(selectedCell).attr("callbackFunction") != null) {
                        eval(`${$(selectedCell).attr("callbackFunction")}(e.sender, id)`);
                    } else {
                        id = `${pageSetting.gridConfig.linkIdPrefix}_${id}_${data.companyId}_${utils.getFrtMode()}`;
                        controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${$(selectedCell).text().replace("VOID", "") }`, id, pageSetting.pageName);
                    }
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