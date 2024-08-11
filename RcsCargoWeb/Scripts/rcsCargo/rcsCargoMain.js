//Global variables
var companyId = "RCSHKG";
var dateFormat = "M/d/yyyy";
var dateTimeFormat = "M/d/yyyy HH:mm";
var dateTimeLongFormat = "M/d/yyyy HH:mm:ss";
var chargeQtyUnit = ["KGS", "SHP", "HAWB", "MAWB", "TRUCK", "PLT", "SETS", "SET", "MTH", "JOB", "CBM", "CTNS", "LBS", "PCS"];
var packageUnit = ["CTNS", "PLT", "PKG", "ROLLS", "PCS"];
var dropdownlistControls = ["airline", "port", "customer", "customerAddr", "customerAddrEditable", "pkgUnit", "charge", "qtyUnit"];
//for testing only
var testObj, testObj1, testObj2;

$(document).ready(function () {
    //Sidebar Menu init
    $(".nav.nav-treeview a.nav-link").each(function () {
        var link = $(this);
        if (link.attr("data-controller") != null) {
            link.click(function () {
                var controller = link.attr("data-controller");
                var action = link.attr("data-action");
                var id = link.attr("data-id");
                var tabTitle = link.text().trim();
                append_tabStripMain(tabTitle, id + "_" + companyId);
            });
        }
    });

    //tabStripMain init
    var tabStripMain = $("#tabStripMain").kendoTabStrip({
        dataTextField: "text",
        dataContentUrlField: "contentUrl",
        dataSource: [{
            text: "Dashboard",
            contentUrl: "/Home/About"
        }]
    }).data('kendoTabStrip');
    
    tabStripMain.activateTab($("#tabStripMain-tab-1"));

    //Load MAWB List (for development)
    append_tabStripMain("MAWB Allocation", "AirMawbIndex_" + companyId);
});


//tabStripMain related functions
function append_tabStripMain(text, id) {
    var tabStrip = $("#tabStripMain").data("kendoTabStrip");

    if (tabStrip.tabGroup.find("[id='btnClose_" + id + "']").length == 0) {
        tabStrip.append({
            text: text +
                " &nbsp;&nbsp;<i class='k-icon k-icon-sm k-color-primary k-i-refresh btnRefresh' id='btnRefresh_" + id + "'></i>" +
                " &nbsp;&nbsp;<i class='k-icon k-i-close text-red btnClose' id='btnClose_" + id + "'></i>",
            encoded: false,
            content: `<div id="${id}"></div>`
        });

        $("#btnClose_" + id).click(function () {
            try {
                eval("remove_" + id + "_Objects();");
            } catch (err) { }
            tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
            tabStrip.activateTab("li:last");
        });

        $("#btnRefresh_" + id).click(function () {
            eval(`init${id.split("_")[0]}("${id}")`);
        });
    }

    tabStrip.activateTab(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
    eval(`init${id.split("_")[0]}("${id}")`);
}

function append_tabStripMain_(url, text, id, appendTarget) {
    var tabStrip = $("#tabStripMain").data("kendoTabStrip");
    text = (text.length > 18 ? text.substr(0, 15) + "..." : text);
    if (tabStrip.tabGroup.find("[id='btnClose_" + id + "']").length == 0) {
        if (appendTarget == null) {
            tabStrip.append({
                text: text +
                    " &nbsp;&nbsp;<i class='k-icon k-icon-sm k-color-primary k-i-refresh btnRefresh' id='btnRefresh_" + id + "'></i>" +
                    " &nbsp;&nbsp;<i class='k-icon k-i-close text-red btnClose' id='btnClose_" + id + "'></i>",
                encoded: false,
                contentUrl: url
            });
        } else {
            tabStrip.insertAfter({
                text: text +
                    " &nbsp;&nbsp;<i class='k-icon k-icon-sm k-color-primary k-i-refresh btnRefresh' id='btnRefresh_" + id + "'></i>" +
                    " &nbsp;&nbsp;<i class='k-icon k-i-close text-red btnClose' id='btnClose_" + id + "'></i>",
                encoded: false,
                contentUrl: url
            }, tabStrip.tabGroup.find("[id='btnClose_" + appendTarget + "']").parent().parent());
        }

        $("#btnClose_" + id).click(function () {
            try {
                eval("remove_" + id + "_Objects();");
            } catch (err) { }
            tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
            tabStrip.activateTab("li:last");
        });

        $("#btnRefresh_" + id).click(function () {
            refresh_tabStripMain(id);
        });
    }

    tabStrip.activateTab(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
}

function remove_tabStripMain(id) {
    try {
        eval("remove_" + id + "_Objects();");
    } catch (err) { }
    var tabStrip = $("#tabStripMain").data("kendoTabStrip");
    tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
    tabStrip.activateTab("li:last");
}

//Render search controls
function renderSearchControls(pageSetting) {
    var html = `<div class="col-md-4">`;

    pageSetting.searchControls.forEach(function (control) {
        var formControlType = "input";
        if (control.type == "dateRange" || control.type == "buttonGroup") {
            formControlType = "div";
        }

        if (control.type == "searchInput") {
            html += `
                <div class="form-group row">
                    <label class="col-form-label">${control.label}</label>
                    <span class="k-input k-textbox k-input-solid k-input-md k-rounded-md" style="margin-left: 12px; padding: 0px; width: 340px">
                        <input class="k-input-inner" name="${control.name}" placeholder="${control.searchLabel}" style="max-width: 320px" />
                        <span class="k-input-separator k-input-separator-vertical"></span>
                        <span class="k-input-suffix k-input-suffix-horizontal">
                            <span class="k-icon k-i-search" aria-hidden="true"></span>
                        </span>
                    </span>
                </div>`;
        } else if (control.type == "buttonGroup") {
            html += `
            <div class="form-group row">
                <label class="col-form-label">${control.label}</label>
                <${formControlType} type="${control.type}" name="${control.name}" dataType="${control.dataType}" />
            </div>`;
        } else {
            html += `
            <div class="form-group row">
                <label class="col-form-label">${control.label}</label>
                <${formControlType} type="${control.type}" name="${control.name}" />
            </div>`;
        }
    });

    html += `</div>`;
    $(`#${pageSetting.id} div.search-control`).append(html);
    $(`#${pageSetting.id} div.search-control .k-icon.k-i-search`).click(function () {
        var searchData = {};
        searchData = {
            searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
            dateFrom: $(`#${pageSetting.id} div.search-control [name=flightDateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
            dateTo: $(`#${pageSetting.id} div.search-control [name=flightDateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
            companyId: companyId,
            frtMode: $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI",
            take: indexGridPageSize
        };
        
        $(`#${pageSetting.id} [name=gridMawb]`).data("kendoGrid").dataSource.transport.options.read.data = searchData;
        $(`#${pageSetting.id} [name=gridMawb]`).data("kendoGrid").dataSource.read();
    });

    renderFormControl_kendoUI(pageSetting);
}

//Render index kendoGrid
function renderIndexGrid(pageSetting) {
    $(`[name=${pageSetting.gridConfig.gridName}]`).kendoGrid({
        columns: pageSetting.gridConfig.columns,
        dataSource: {
            transport: {
                read: {
                    url: pageSetting.gridConfig.dataSourceUrl,
                    data: {
                        searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                        dateFrom: $(`#${pageSetting.id} div.search-control [name=flightDateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                        dateTo: $(`#${pageSetting.id} div.search-control [name=flightDateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                        companyId: companyId,
                        frtMode: $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI",
                        take: indexGridPageSize
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
            pageSize: indexGridPageSize,
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
            gridAutoFitColumns(grid);
            $(".k-grid-autoFitColumns").click(function (e) {
                gridAutoFitColumns(grid);
            });
        },
        change: function (e) {
            var selectedCell = this.select()[0];
            if ($(selectedCell).attr("style") == "cursor: pointer") {
                var data = this.dataItem(selectedCell.parentNode);
                var id = $(selectedCell).text();
                id = `${pageSetting.gridConfig.linkIdPrefix}_${id}_${companyId}_AE`;

                //special format display for MAWB#
                if (pageSetting.pageName == "airMawb") {
                    append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${formatMawbNo($(selectedCell).text())}`, id);
                } else {
                    append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${$(selectedCell).text() }`, id);
                }
            }
        },
        excel: {
            proxyURL: "/Home/ExcelExportSave",
            allPages: true,
            fileName: "table_export.xlsx"
        }
    });
}

//Render form controls
function renderFormControls(masterForm) {
    var html = "";

    //Hidden fields
    masterForm.schema.hiddenFields.forEach(function (item) {
        html += ` <input type="hidden" name="${item}" />`;
    });
    masterForm.targetForm.append(html);

    //Form tabStrip
    if (masterForm.formTabs != null) {
        $(`#${masterForm.id} .row.form_group`).append(`<div class="formGroupTab"></div>`);
        var formGroupTab = $(`#${masterForm.id} .row.form_group .formGroupTab`).kendoTabStrip({ animation: false }).data("kendoTabStrip");

        masterForm.formTabs.forEach(function (tab) {
            formGroupTab.append({ text: tab.title, content: `<div name="${tab.name}" class="row"></div>` });

            tab.formGroups.forEach(function (formGroupName) {
                formGroup = masterForm.formGroups.filter(a => a.name == formGroupName)[0];
                html = `
                    <div class="col-md-${formGroup.colWidth}">
                        <div class="card card-primary">
                            <div class="card-header">
                                <h3 class="card-title">${formGroup.title}</h3>
                            </div>
                            <form class="form-horizontal">
                                <div class="card-body">
                                    <div class="row">`;
                                    
                for (var j in formGroup.formControls) {
                    var control = formGroup.formControls[j];
                    var formControlClass = "form-control";
                    var formControlType = "input";

                    if (control.type == "dateTime") {
                        formControlClass = "form-control-dateTime";
                    } else if (control.type.startsWith("number")) {
                        formControlClass = "form-control-number";
                    } else if (dropdownlistControls.includes(control.type)) {
                        formControlClass = "form-control-dropdownlist";
                    } else if (control.type == "textArea") {
                        formControlClass = "form-control-textArea";
                        formControlType = "textarea";
                    } else if (control.type == "dateRange" || control.type == "buttonGroup") {
                        formControlType = "div";
                    }

                    if (control.type == "label") {
                        html += `
                            <div class="form-group row">
                                <label class="col-sm-12 col-form-label"><h4>${control.label}</h4></label>
                            </div>`;
                    } else if (control.type == "buttonGroup") {
                        html += `
                            <div class="form-group row">
                                <label class="col-sm-3 col-form-label">${control.label}</label>
                                <div class="col-sm-9">
                                    <${formControlType} type="${control.type}" name="${control.name}" dataType="${control.dataType}" />
                                </div>
                            </div>`;
                    } else if (control.type == "grid") {
                        html += `
                            <div class="form-group row">
                                <div name="grid_${control.name}" type="${control.type}" />
                            </div>`;
                    } else if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                        var readonlyAttr = "";
                        if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                            if (control.type == "customerAddr") {
                                readonlyAttr = "readonly";
                            }
                            html += `
                                <div class="col-md-6">
                                    <label class="col-sm-3 col-form-label">${control.label}</label>
                                    <div class="col-sm-9">
                                        <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" />
                                        <input type="hidden" name="${control.name}_CODE" />
                                        <input type="hidden" name="${control.name}_BRANCH" />
                                        <input type="hidden" name="${control.name}_SHORT_DESC" />
                                        <input type="text" class="form-control" name="${control.name}_ADDR1" ${readonlyAttr} />
                                        <input type="text" class="form-control" name="${control.name}_ADDR2" ${readonlyAttr} />
                                        <input type="text" class="form-control" name="${control.name}_ADDR3" ${readonlyAttr} />
                                        <input type="text" class="form-control" name="${control.name}_ADDR4" ${readonlyAttr} style="margin-bottom: 4px" />
                                    </div>
                                </div>`;
                        }
                    } else {
                        html += `
                            <div class="form-group row">
                                <label class="col-sm-3 col-form-label">${control.label}</label>
                                <div class="col-sm-9">
                                    <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" />
                                </div>
                            </div>`;
                        }
                    }

                html += `       </div>
                            </div>
                        </form>
                    </div>
                </div>`;
                $(`#${masterForm.id} .formGroupTab [name=${tab.name}]`).append(html);
            });
        });
        formGroupTab.activateTab($(`#${masterForm.id} .formGroupTab li`).eq(0));
    }
    renderFormControl_kendoUI(masterForm);

    //readonly fields
    masterForm.schema.readonlyFields.forEach(function (item) {
        if (item.readonly == "always") {
            $(`#${masterForm.id} [name=${item.name}]`).attr("readonly", "readonly");
        } else if (item.readonly == "edit" && masterForm.mode == "edit") {
            $(`#${masterForm.id} [name=${item.name}]`).attr("readonly", "readonly");
        }
    });
}

//Render form controls (KendoUI)
function renderFormControl_kendoUI(masterForm) {
    //kendoToolBar
    $(`#${masterForm.id} div.toolbar`).each(function () {
        $(this).kendoToolBar({
            items: masterForm.toolbar
        });
    });
    $(`#${masterForm.id} [data-role=dropdownbutton]`).append(`<span class="k-icon k-i-arrow-s k-button-icon"></span>`);
    $(`#${masterForm.id} .k-i-save`).parent().click(function () {
        var model = getValuesFromFormControls(masterForm);
        console.log(model);

        $.ajax({
            url: "/Air/Mawb/TestModel",
            type: "post",
            data: model,
            success: function (result) {
                console.log(result);
            }
        });
    });

    //kendoDateTimePicker
    $(`#${masterForm.id} input[type=dateTime]`).each(function () {
        $(this).kendoDateTimePicker({
            format: dateTimeFormat
        });
    });

    //kendoDateRangePicker
    $(`#${masterForm.id} div[type=dateRange]`).each(function () {
        $(this).kendoDateRangePicker({
            labels: false,
            format: dateFormat,
            range: {
                start: addDays(new Date(), -60),
                end: new Date()
            }
        });
    });

    //kendoButtonGroup for frtMode
    $(`#${masterForm.id} div[type=buttonGroup][dataType=frtMode]`).each(function () {
        $(this).kendoButtonGroup({
            items: [
                { text: "Export", icon: "export", selected: true },
                { text: "Import", icon: "import" },
            ]
        });
    });

    //kendoButtonGroup for jobType
    $(`#${masterForm.id} div[type=buttonGroup][dataType=jobType]`).each(function () {
        $(this).kendoButtonGroup({
            items: [
                { text: "Consol", value: "C" },
                { text: "Direct", value: "D" },
            ],
            index: 0
        });
    });

    //kendoTextArea
    $(`#${masterForm.id} textarea[type=textArea]`).each(function () {
        $(this).kendoTextArea({
            rows: 8,
            maxLength: 1000
        });
    });

    //kendoNumericTextBox
    $(`#${masterForm.id} input[type*=number]`).each(function () {
        var decimal = 2;
        var format = "n";
        if ($(this).attr("type") == "numberInt") {
            decimal = 0;
            format = "n0";
        }
        $(this).kendoNumericTextBox({
            decimals: decimal,
            restrictDecimals: true,
            format: format,
        });
    });

    //kendoDropDownList for CustomerView
    $(`#${masterForm.id} input[type=customer]`).each(function () {
        var filterValue = "";
        $(this).kendoDropDownList({
            filter: "startswith",
            dataTextField: "CUSTOMER_DESC",
            dataValueField: "CUSTOMER_CODE",
            optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
            dataSource: {
                type: "json",
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        if (options.data.filter != null) {
                            try {
                                filterValue = options.data.filter.filters[0].value;
                            } catch { }
                        }
                        $.ajax({
                            url: "/Home/GetCustomers",
                            data: { searchValue: filterValue, take: take },
                            dataType: "json",
                            type: "post",
                            success: function (result) {
                                for (var i in result) {
                                    result[i].CUSTOMER_DESC = result[i].CUSTOMER_CODE + " - " + result[i].CUSTOMER_DESC + " - " + result[i].BRANCH_CODE;
                                    result[i].CUSTOMER_CODE = result[i].CUSTOMER_CODE + "-" + result[i].BRANCH_CODE + "-" + result[i].SHORT_DESC;
                                }
                                options.success(result);
                            }
                        });
                    },
                }
            },
            open: function (e) {
                $(e.sender.filterInput).val(filterValue);
            }
        });
    });

    //kendoDropDownList for CustomerView (with address)
    $(`#${masterForm.id} input[type*=customerAddr]`).each(function () {
        var filterValue = "";
        $(this).kendoDropDownList({
            filter: "startswith",
            dataTextField: "CUSTOMER_DESC",
            dataValueField: "CUSTOMER_CODE",
            optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
            autoWidth: true,
            dataSource: {
                type: "json",
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        if (options.data.filter != null) {
                            try {
                                filterValue = options.data.filter.filters[0].value;
                            } catch { }
                        }
                        $.ajax({
                            url: "/Home/GetCustomers",
                            data: { searchValue: filterValue, take: take },
                            dataType: "json",
                            type: "post",
                            success: function (result) {
                                for (var i in result) {
                                    result[i].CUSTOMER_DESC = result[i].CUSTOMER_CODE + " - " + result[i].CUSTOMER_DESC + " - " + result[i].BRANCH_CODE;
                                    result[i].CUSTOMER_CODE = result[i].CUSTOMER_CODE + "-" + result[i].BRANCH_CODE + "-" + result[i].SHORT_DESC;
                                }
                                options.success(result);
                            }
                        });
                    },
                }
            },
            select: function (e) {
                var item = e.dataItem;
                if (item == null) {
                    item = e.sender.dataSource.data()[0];
                }
                var controlName = $(this.element).attr("name");
                //$(`#${masterForm.id} input[name=${controlName}]`).val(item.CUSTOMER_DESC);
                $(`#${masterForm.id} input[name=${controlName}_CODE]`).val(item.CUSTOMER_CODE);
                $(`#${masterForm.id} input[name=${controlName}_BRANCH]`).val(item.BRANCH_CODE);
                $(`#${masterForm.id} input[name=${controlName}_SHORT_DESC]`).val(item.SHORT_DESC);
                $(`#${masterForm.id} input[name=${controlName}_ADDR1]`).val(item.ADDR1);
                $(`#${masterForm.id} input[name=${controlName}_ADDR2]`).val(item.ADDR2);
                $(`#${masterForm.id} input[name=${controlName}_ADDR3]`).val(item.ADDR3);
                $(`#${masterForm.id} input[name=${controlName}_ADDR4]`).val(item.ADDR4);
            },
            open: function (e) {
                var value = $(e.sender.element[0]).parent().next().val().split("-")[0];
                $(e.sender.filterInput).val(value);
            }
        });
    });

    //kendoDropDownList for PORT
    $(`#${masterForm.id} input[type=port]`).each(function () {
        var filterValue = "";
        $(this).kendoDropDownList({
            filter: "startswith",
            dataTextField: "PORT_DESC",
            dataValueField: "PORT_CODE",
            optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
            dataSource: {
                type: "json",
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        if (options.data.filter != null) {
                            try {
                                filterValue = options.data.filter.filters[0].value;
                            } catch { }
                        }
                        $.ajax({
                            url: "/Home/GetPorts",
                            data: { searchValue: filterValue, take: take },
                            dataType: "json",
                            type: "post",
                            success: function (result) {
                                for (var i in result) {
                                    result[i].PORT_DESC = result[i].PORT_CODE + " - " + result[i].PORT_DESC;
                                }
                                options.success(result);
                            }
                        });
                    },
                }
            },
            open: function (e) {
                $(e.sender.filterInput).val(filterValue);
            }
        });
    });

    //kendoDropDownList for AIRLINE
    $(`#${masterForm.id} input[type=airline]`).each(function () {
        var filterValue = "";
        $(this).kendoDropDownList({
            filter: "startswith",
            dataTextField: "AIRLINE_DESC",
            dataValueField: "AIRLINE_CODE",
            optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
            dataSource: {
                type: "json",
                serverFiltering: true,
                transport: {
                    read: function (options) {
                        try {
                            filterValue = options.data.filter.filters[0].value;
                        } catch { }

                        $.ajax({
                            url: "/Home/GetAirlines",
                            data: { searchValue: filterValue, take: take },
                            dataType: "json",
                            type: "post",
                            success: function (result) {
                                for (var i in result) {
                                    result[i].AIRLINE_DESC = result[i].AIRLINE_CODE + " - " + result[i].AIRLINE_DESC;
                                }
                                options.success(result);
                            }
                        });
                    },
                }
            },
            open: function (e) {
                $(e.sender.filterInput).val(filterValue);
            }
        });
    })

    //kendoDropDownList for PACKAGE_UNIT
    $(`#${masterForm.id} input[type=pkgUnit]`).each(function () {
        $(this).kendoDropDownList({
            dataSource: packageUnit
        });
    });

    //kendoGrid
    $(`#${masterForm.id} div[type=grid]`).each(function () {
        var columns;
        var formulas;
        var controlName = $(this).attr("name");
        masterForm.formGroups.forEach(function (formGroup) {
            formGroup.formControls.forEach(function (control) {
                if (control.type == "grid" && control.name == controlName.replace("grid_", "")) {
                    columns = control.columns;
                    formulas = control.formulas;
                }
            })
        })

        $(this).kendoGrid({
            toolbar: ["create", "cancel"],
            columns: columns,
            editable: { mode: "incell", confirmation: false },
            dataBound: function (e) {
                $(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).removeAttr("style");
                $(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).attr("style", "width: 26px; height: 18px");
            },
            cellClose: function (e) {
                formulas.forEach(function (formula) {
                    gridFormula(e.container, formula.fieldName, formula.formula);
                });
            }
        });
    });
}

function gridFormula(container, fieldName, formula) {
    formula.split("{").forEach(function (field) {
        if (field.length > 0) {
            var field = field.substring(0, field.indexOf("}"));
            formula = formula.replace(`{${field}}`, gridGetCellValue(container, field));
        }
    });
    //console.log(formula);

    gridSetCellValue(container, fieldName, eval(formula));
}

function gridGetCellValue(container, fieldName) {
    var grid = $(container).closest("div[type=grid]").data("kendoGrid");
    var uid = $(container).parent().attr("data-uid");
    if (uid != null) {
        return grid.dataSource._data.filter(a => a.uid == uid)[0][fieldName];
    }
}

//kendoGrid update cell value and dataSource in the same row
function gridSetCellValue(container, fieldName, value) {
    var grid = $(container).closest("div[type=grid]").data("kendoGrid");
    var uid = $(container).parent().attr("data-uid");
    var colIndex = $(container).closest("div[type=grid]").find(`th[scope=col][data-field=${fieldName}]`).attr("data-index");
    if (colIndex != null) {
        $(container).parent().find("td").eq(colIndex).addClass("k-dirty-cell");
        $(container).parent().find("td").eq(colIndex).html(`<span class="k-dirty"></span>${value}`);
    }
    if (uid != null) {
        grid.dataSource._data.filter(a => a.uid == uid)[0][fieldName] = value;
    }
}

//kendoGrid kendoDropDownList for Charge
function renderGridEditorCharges(container, options) {
    var filterValue = options.model.CHARGE_CODE;
    var ddl = $(`<input name="${options.field}" />`);
    ddl.appendTo(container);

    ddl.kendoDropDownList({
        filter: "startswith",
        dataTextField: "CHARGE_DESC_DISPLAY",
        dataValueField: "CHARGE_CODE",
        optionLabel: `Select charges ...`,
        dataSource: {
            type: "json",
            serverFiltering: true,
            transport: {
                read: function (options) {
                    if (options.data.filter != null) {
                        try {
                            filterValue = options.data.filter.filters[0].value;
                        } catch { }
                    }
                    $.ajax({
                        url: "/Home/GetCharges",
                        data: { searchValue: filterValue, take: take },
                        dataType: "json",
                        type: "post",
                        success: function (result) {
                            for (var i in result) {
                                result[i].CHARGE_DESC_DISPLAY = result[i].CHARGE_CODE + " - " + result[i].CHARGE_DESC;
                            }
                            options.success(result);
                        }
                    });
                },
            }
        },
        open: function (e) {
            $(e.sender.filterInput).val(filterValue);
        },
        select: function (e) {
            gridSetCellValue(container, "CHARGE_DESC", e.dataItem.CHARGE_DESC);
        }
    });
}

//kendoGrid kendoDropDownList for Currency
function renderGridEditorCurrency(container, options) {
    //testObj = container;
    //testObj2 = options;
    var ddl = $(`<input name="${options.field}" />`);
    ddl.appendTo(container);

    ddl.kendoDropDownList({
        dataTextField: "CURR_CODE",
        dataValueField: "CURR_CODE",
        dataSource: {
            transport: {
                read: {
                    url: "/Home/GetCurrencies",
                    dataType: "json"
                }
            }
        },
        cascade: function (e) {
            //e.sender._cascadedValue => selected value
            if (e.userTriggered == true) {
                var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                gridSetCellValue(container, "EX_RATE", exRate);
            }
        },
    });
}

//kendoGrid kendoDropDownList for Qty Unit
function renderGridEditorQtyUnit(container, options) {
    var ddl = $(`<input name="${options.field}" />`);
    ddl.appendTo(container);

    ddl.kendoDropDownList({
        dataSource: chargeQtyUnit
    });
}

//Set the values to form controls
function setValuesToFormControls(masterForm, model) {
    masterForm.schema.hiddenFields.forEach(function (field) {
        $(`#${masterForm.id} [name=${field}]`).val(model[`${field}`]);
    });

    for (var i in masterForm.formGroups) {
        for (var j in masterForm.formGroups[i].formControls) {
            var control = masterForm.formGroups[i].formControls[j];

            if (control.type == "dateTime") {
                $(`#${masterForm.id} [name=${control.name}]`).data("kendoDateTimePicker").value(kendo.parseDate(model[`${control.name}`]));
                $(`#${masterForm.id} [name=${control.name}]`).val(kendo.toString(kendo.parseDate(model[`${control.name}`]), dateTimeFormat));
            } else if (control.type == "airline" || control.type == "port" || control.type == "customer") {
                if (model[`${control.name}`] != null) {
                    var ddl = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList");
                    ddl.search(model[`${control.name}`]);
                    ddl.bind("dataBound", function () {
                        this.select(1);
                        this.trigger("select");
                    });
                }
            } else if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                if (model[`${control.name}_CODE`] != null) {
                    //handle multiple control with the same name condition
                    $(`#${masterForm.id} [name=${control.name}]`).each(function () {
                        var ddl = $(this).data("kendoDropDownList");
                        ddl.search(model[`${control.name}_CODE`]);
                        ddl.bind("dataBound", function () {
                            this.select(1);
                            this.trigger("select");
                        });
                    });                    
                }
            } else if (control.type == "grid") {
                if (model[`${control.name}`] != null) {
                    var grid = $(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid");

                    //testObj = grid;
                    var dataSource = new kendo.data.DataSource({
                        data: model[`${control.name}`],
                        batch: true,
                        schema: {
                            model: {
                                fields: control.fields
                            }
                        },
                        change: function (e) {
                            //console.log(e);
                        }
                    });
                    grid.setDataSource(dataSource);
                }
            } else if (control.type == "number" || control.type == "numberInt") {
                $(`#${masterForm.id} [name=${control.name}]`).data("kendoNumericTextBox").value(model[`${control.name}`]);
            } else if (control.type == "buttonGroup") {
                var buttonGroup = $(`#${masterForm.id} [name=${control.name}]`).data("kendoButtonGroup");
                if (control.dataType == "jobType") {
                    if (!isEmptyString(model[`${control.name}`])) {
                        var jobType = model[`${control.name}`] == "C" ? "Consol" : "Direct";
                        buttonGroup.select($(`[name=JOB_TYPE] span:contains('${jobType}')`).parent());
                    }
                }
            } else {
                $(`#${masterForm.id} [name=${control.name}]`).val(model[`${control.name}`]);
            }
        }
    }
}

//Get values from form controls
function getValuesFromFormControls(masterForm) {
    var model = {};
    masterForm.schema.hiddenFields.forEach(function (field) {
        model[field] = $(`#${masterForm.id} [name=${field}]`).val();
    });

    masterForm.formGroups.forEach(function (formGroup) {
        formGroup.formControls.forEach(function (control) {
            if (control.type != "label") {
                try {
                    if (control.type == "customer") {
                        var value = $(`#${masterForm.id} [name=${control.name}]`).val().split("-")[0];
                        var text = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").text().replace(`${value} - `, ``);
                        if (!isEmptyString(value)) {
                            model[control.name] = value;
                            model[control.name.replace("_CODE", "_DESC")] = text;
                        }
                    } else if (control.type == "customerAddr") {
                        var value = $(`#${masterForm.id} [name=${control.name}]`).val().split("-")[0];
                        if (!isEmptyString(value)) {
                            var text = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").text().replace(`${value} - `, ``);

                            model[`${control.name}_CODE`] = value;
                            model[`${control.name}_BRANCH`] = $(`#${masterForm.id} [name=${control.name}_BRANCH]`).val();
                            model[`${control.name}_SHORT_DESC`] = $(`#${masterForm.id} [name=${control.name}_SHORT_DESC]`).val();
                            model[`${control.name}_DESC`] = text;
                        }
                    } else if (control.type == "grid") {
                        if ($(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid").dataSource.data().length > 0) {
                            var data = $(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid").dataSource.data();
                            var gridData = [];
                            var lineNo = 1;

                            data.forEach(function (item) {
                                var rowData = {};
                                rowData["LINE_NO"] = lineNo;
                                for (var field in control.fields) {
                                    rowData[field] = item[field]; 
                                }
                                gridData.push(rowData);
                                lineNo++;
                            });
                            
                            model[control.name] = gridData;
                        }
                    } else {
                        model[control.name] = $(`#${masterForm.id} [name=${control.name}]`).val();
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        });
    });

    return model;
}

//kendoGrid related functions
function gridAutoFitColumns(grid) {
    setTimeout(function () {
        var colMaxWidth = 280;
        var row = [];
        var colIndex = 0;
        var tableWidth = 0;
        var font = getCanvasFont(grid.thead.find(".k-column-title")[0]);

        //get the text width from table header
        grid.thead.find("th").each(function () {
            if (this.style.display != "none") {
                var width = getTextWidth(this.innerText, font) + 17;
                if (width > colMaxWidth) {
                    width = colMaxWidth;
                }
                row.push({ colIndex: colIndex, width: width });
                colIndex++;
            }
        });

        //get the text width from table body
        grid.tbody.find("tr").each(function () {
            colIndex = 0;
            $(this).find("td").each(function () {
                if (this.style.display != "none") {
                    if (!isEmptyString(this.innerText)) {
                        var width = getTextWidth(this.innerText, font) + 15;
                        if (width > colMaxWidth) {
                            width = colMaxWidth;
                        }
                        if (width > row[colIndex].width) {
                            row[colIndex].width = width;
                        }
                    }
                    colIndex++;
                }
            });
        });

        for (var i in row) {
            tableWidth += row[i].width;
            //Set column width in table header
            grid.wrapper.find("colgroup").eq(0).find("col")[i].style.width = `${row[i].width}px`;
            //Set column width in table body
            grid.wrapper.find("colgroup").eq(1).find("col")[i].style.width = `${row[i].width}px`;
        }

        grid.wrapper.find("table").each(function () {
            this.style.width = `${tableWidth}px`;
        })
    }, 100);
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
    const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = getCssStyle(el, 'font-size') || '16px';
    const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

    return `${fontWeight} ${fontSize} ${fontFamily}`;
}


//Common JS functions
function isEmptyString(str) {
    return (!str || 0 === str.length);
}

function convertJsonToDate(str) {
    try {
        return new Date(parseInt(str.replace("/Date(", "").replace(")/", ""), 10));
    } catch (e) {
        return "";
    }
}

function convertDateToISOString(date) {
    return date.toISOString();
}

function roundUp(value, decimals) {
    value = value * Math.pow(10, decimals);
    value = Math.round(value);
    return (value / Math.pow(10, decimals));
}

function formatMawbNo(mawbNo) {
    if (mawbNo.length == 11) {
        return mawbNo.substr(0, 3) + "-" + mawbNo.substr(3, 4) + " " + mawbNo.substr(7);
    } else {
        return mawbNo;
    }
}

function formatText(value) {
    return value.trim();
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
