export default class {
    constructor() {
        $.ajax({
            url: "../Home/GetSysModules",
            success: function (menuItems) {
                controls.initNavbar();
                controls.initControlSidebar();
                controls.initSidebar(menuItems);
                controls.initTabstripMain();

                $(".nav-item.dropdown").bind("click", function () {
                    $(this).toggleClass("open");
                });
            }
        });
    }

    //Navbar
    initNavbar = function () {
        $("div.wrapper").prepend(data.frameworkHtmlElements.navbar());
    }

    //Sidebar
    initSidebar = function (menuItems) {
        var html = data.frameworkHtmlElements.sidebar(menuItems);
        $("div.wrapper").prepend(html);
        $(".nav.nav-treeview a.nav-link").each(function () {
            var link = $(this);
            if (link.attr("data-controller") != null) {
                link.click(function () {
                    var controller = link.attr("data-controller");
                    var action = link.attr("data-action");
                    var id = link.attr("data-id");
                    var tabTitle = link.text().trim();
                    controls.append_tabStripMain(tabTitle, id + "_" + data.companyId, controller);
                });
            }
        });

        //Very important to init the treeview to ensure expand / collapse working
        $('[data-widget="treeview"]').Treeview('init');
    }

    //ControlSidebar
    initControlSidebar = function () {
        $("div.wrapper").prepend(data.frameworkHtmlElements.controlSidebar());
    }

    //tabStripMain related functions
    //tabStripMain
    initTabstripMain = function () {
        var tabStripMain = $("#tabStripMain").kendoTabStrip({
            dataTextField: "text",
            dataContentUrlField: "contentUrl",
            dataSource: [{
                text: "Dashboard",
                contentUrl: "../Home/Dashboard"
            }]
        }).data('kendoTabStrip');

        tabStripMain.activateTab($("#tabStripMain-tab-1"));
    }

    append_tabStripMain = function (text, id, controller) {
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
                eval(`controllers.${controller}.init${id.split("_")[0]}("${id}")`);
            });
        }

        tabStrip.activateTab(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
        eval(`controllers.${controller}.init${id.split("_")[0]}("${id}")`);
    }

    remove_tabStripMain = function (id) {
        try {
            eval("remove_" + id + "_Objects();");
        } catch (err) { }
        var tabStrip = $("#tabStripMain").data("kendoTabStrip");
        tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
        tabStrip.activateTab("li:last");
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

        this.renderFormControl_kendoUI(pageSetting);
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
                controls.gridAutoFitColumns(grid);
                $(".k-grid-autoFitColumns").click(function (e) {
                    controls.gridAutoFitColumns(grid);
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

    //Render form controls
    renderFormControls = function (masterForm) {
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
                    var formGroup = masterForm.formGroups.filter(a => a.name == formGroupName)[0];
                    html = "";

                    for (var j in formGroup.formControls) {
                        var control = formGroup.formControls[j];
                        var formControlClass = "form-control";
                        var formControlType = "input";

                        if (control.type == "dateTime") {
                            formControlClass = "form-control-dateTime";
                        } else if (control.type.startsWith("number")) {
                            formControlClass = "form-control-number";
                        } else if (data.dropdownlistControls.includes(control.type)) {
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
                                <label class="col-lg-12 col-form-label"><h5>${control.label}</h5></label>
                            </div>`;
                        } else if (control.type == "buttonGroup") {
                            html += `
                            <div class="form-group row">
                                <label class="col-lg-3 col-form-label">${control.label}</label>
                                <div class="col-lg-9">
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
                                <div class="row col-xl-6 col-lg-12">
                                    <label class="col-lg-3 col-form-label">${control.label}</label>
                                    <div class="col-lg-9">
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
                        } else if (control.type == "currency") {
                            if (control.exRateName != null) {
                                var colWidth = control.colWidth != null ? control.colWidth : "3";
                                html += `
                                <div class="form-group row col-xl-${colWidth} col-lg-${colWidth * 2 > 12 ? 12 : colWidth * 2}">
                                    <label class="col-sm-3 col-form-label">${control.label}</label>
                                    <div class="row col-sm-9">
                                        <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" style="width: 95px; height: 28.89px" />
                                        &nbsp;
                                        <${formControlType} class="form-control" name="${control.exRateName}" style="width: 80px;" readonly />
                                    </div>
                                </div>`;
                            }
                        } else if (control.type == "chargeTemplate") {
                            var colWidth = control.colWidth != null ? control.colWidth : "3";
                            html += `
                            <div class="form-group row col-xl-${colWidth} col-lg-${colWidth * 2 > 12 ? 12 : colWidth * 2}">
                                <label class="col-sm-4 col-form-label">${control.label}</label>
                                <div class="row col-sm-8">
                                    <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" targetControl="${control.targetControl}" />
                                </div>
                            </div>`;
                        } else {
                            var colWidth = "";
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                            html += `
                            <div class="row ${colWidth}">
                                <label class="col-sm-3 col-form-label">${control.label}</label>
                                <div class="col-sm-9">
                                    <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" />
                                </div>
                            </div>`;
                        }
                    }

                    $(`#${masterForm.id} .formGroupTab [name=${tab.name}]`).append(data.htmlElements.card(formGroup.title, html, formGroup.colWidth));
                    //$(`#${masterForm.id} .formGroupTab [name=${tab.name}]`).append(html);
                });
            });
            formGroupTab.activateTab($(`#${masterForm.id} .formGroupTab li`).eq(0));
        }
        controls.renderFormControl_kendoUI(masterForm);

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
    renderFormControl_kendoUI = function (masterForm) {
        //kendoToolBar
        $(`#${masterForm.id} div.toolbar`).each(function () {
            $(this).kendoToolBar({
                items: masterForm.toolbar
            });
        });
        $(`#${masterForm.id} [data-role=dropdownbutton]`).append(`<span class="k-icon k-i-arrow-s k-button-icon"></span>`);
        $(`#${masterForm.id} .k-i-save`).parent().click(function () {
            var model = controls.getValuesFromFormControls(masterForm);
            console.log(model);

            $.ajax({
                url: "../Air/Mawb/TestModel",
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
                format: data.dateTimeFormat
            });
        });

        //kendoDateRangePicker
        $(`#${masterForm.id} div[type=dateRange]`).each(function () {
            $(this).kendoDateRangePicker({
                labels: false,
                format: data.dateFormat,
                range: {
                    start: utils.addDays(new Date(), -60),
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
                                url: "../Home/GetCustomers",
                                data: { searchValue: filterValue, take: data.take },
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
                                url: "../Home/GetCustomers",
                                data: { searchValue: filterValue, take: data.take },
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
                                url: "../Home/GetPorts",
                                data: { searchValue: filterValue, take: data.take },
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
                                url: "../Home/GetAirlines",
                                data: { searchValue: filterValue, take: data.take },
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

        //kendoDropDownList for currency
        $(`#${masterForm.id} input[type=currency]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "CURR_CODE",
                dataValueField: "CURR_CODE",
                optionLabel: " ",
                dataSource: data.currencies,
                cascade: function (e) {
                    //e.sender._cascadedValue => selected value
                    if (e.userTriggered == true) {
                        var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                        if (e.sender.element.parent().next("[name*=EX_RATE]").length == 1) {
                            e.sender.element.parent().next("[name*=EX_RATE]").val(exRate);
                        }
                    }
                },
            });
        });

        //kendoDropDownList for charge template
        $(`#${masterForm.id} input[type=chargeTemplate]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: "Select for charge template...",
                dataSource: {
                    transport: {
                        read: {
                            url: "../Home/GetChargeTemplates",
                            data: { companyId: data.companyId },
                            dataType: "json"
                        }
                    }
                },
                cascade: function (e) {
                    //e.sender._cascadedValue => selected value
                    if (e.userTriggered == true) {
                        var templateName = e.sender._cascadedValue;
                        //var currencies;
                        var grid = $(`#${masterForm.id} [name=${e.sender.element.attr("targetControl")}]`).data("kendoGrid");
                        var cwts = utils.getFormValue("CWTS", e.sender.element);
                        testObj = grid;

                        $.ajax({
                            url: "../Home/GetChargeTemplate",
                            data: { companyId: data.companyId, templateName: templateName },
                            dataType: "json",
                            success: function (templateItems) {
                                templateItems.forEach(function (item) {
                                    item.EX_RATE = utils.getExRate(item.CURR_CODE);
                                    item.QTY = item.UNIT == "KGS" ? cwts : 1;
                                    item.QTY_UNIT = item.UNIT;
                                    item.MIN_CHARGE = item.MIN_AMOUNT;
                                    item.AMOUNT = item.QTY * item.PRICE;
                                    item.AMOUNT = item.MIN_AMOUNT > item.AMOUNT ? item.MIN_AMOUNT : item.AMOUNT;
                                    item.AMOUNT_HOME = utils.roundUp(item.AMOUNT * item.EX_RATE, 0);

                                    //dirty visual effects
                                    grid.dataSource.data().push(item);
                                    var dsItem = grid.dataSource.data()[grid.dataSource.data().length - 1];
                                    dsItem.dirty = true;
                                    dsItem.dirtyFields = { CHARGE_CODE: true, CURR_CODE: true, EX_RATE: true, QTY: true, QTY_UNIT: true, PRICE: true, MIN_CHARGE: true, AMOUNT: true, AMOUNT_HOME: true };
                                });
                                grid.dataSource.trigger("change");
                            }
                        });
                    }
                },
            });
        });

        //kendoDropDownList for PACKAGE_UNIT
        $(`#${masterForm.id} input[type=pkgUnit]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.packageUnit
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

            //Calculate the grid width
            var gridWidth = 0;
            columns.forEach(function (col) {
                gridWidth += col.width == null ? 70 : col.width;
            });
            $(this).kendoGrid({
                toolbar: ["create", "cancel"],
                columns: columns,
                editable: { mode: "incell", confirmation: false },
                resizable: true,
                width: gridWidth,
                dataBound: function (e) {
                    $(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).removeAttr("style");
                    $(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).attr("style", "width: 26px; height: 18px");
                },
                cellClose: function (e) {
                    formulas.forEach(function (formula) {
                        controls.gridFormula(e.container, formula.fieldName, formula.formula);
                    });
                }
            });
        });
    }

    //Set the values to form controls
    setValuesToFormControls = function (masterForm, model) {
        masterForm.schema.hiddenFields.forEach(function (field) {
            $(`#${masterForm.id} [name=${field}]`).val(model[`${field}`]);
        });

        for (var i in masterForm.formGroups) {
            for (var j in masterForm.formGroups[i].formControls) {
                var control = masterForm.formGroups[i].formControls[j];

                if (control.type == "dateTime") {
                    if ($(`#${masterForm.id} [name=${control.name}]`).length == 1) {
                        $(`#${masterForm.id} [name=${control.name}]`).data("kendoDateTimePicker").value(kendo.parseDate(model[`${control.name}`]));
                        $(`#${masterForm.id} [name=${control.name}]`).val(kendo.toString(kendo.parseDate(model[`${control.name}`]), data.dateTimeFormat));
                    }
                } else if (control.type == "airline" || control.type == "port" || control.type == "customer") {
                    if (model[`${control.name}`] != null) {
                        var ddl = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList");
                        ddl.search(model[`${control.name}`]);
                        ddl.bind("dataBound", function () {
                            this.select(1);
                            this.trigger("select");
                        });
                    }
                } else if (control.type == "currency") {
                    $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").value(model[`${control.name}`]);
                    if (control.exRateName != null) {
                        $(`#${masterForm.id} [name=${control.exRateName}]`).val(model[`${control.exRateName}`]);
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
                    var buttonGroup = $(`#${masterForm.id} div[type=buttonGroup][name=${control.name}]`).data("kendoButtonGroup");
                    if (control.dataType == "jobType") {
                        if (!utils.isEmptyString(model[`${control.name}`])) {
                            var jobType = model[`${control.name}`] == "C" ? "Consol" : "Direct";
                            buttonGroup.select($(`div[type=buttonGroup][name=JOB_TYPE] span:contains('${jobType}')`).parent());
                        }
                    }
                } else {
                    $(`#${masterForm.id} [name=${control.name}]`).val(model[`${control.name}`]);
                }
            }
        }
    }

    //Get values from form controls
    getValuesFromFormControls = function (masterForm) {
        var model = {};
        masterForm.schema.hiddenFields.forEach(function (field) {
            model[field] = $(`#${masterForm.id} [name=${field}]`).val();
        });

        masterForm.formGroups.forEach(function (formGroup) {
            formGroup.formControls.forEach(function (control) {
                if (control.type != "label") {
                    if ($(`#${masterForm.id} [name=${control.name}]`).length == 1 || $(`#${masterForm.id} [name=grid_${control.name}]`).length == 1) {
                        if (control.type == "customer") {
                            var value = $(`#${masterForm.id} [name=${control.name}]`).val().split("-")[0];
                            var text = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").text().replace(`${value} - `, ``);
                            if (!utils.isEmptyString(value)) {
                                model[control.name] = value;
                                model[control.name.replace("_CODE", "_DESC")] = text;
                            }
                        } else if (control.type == "customerAddr") {
                            var value = $(`#${masterForm.id} [name=${control.name}]`).val().split("-")[0];
                            if (!utils.isEmptyString(value)) {
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
                            if (control.exRateName != null) {
                                model[control.exRateName] = $(`#${masterForm.id} [name=${control.exRateName}]`).val();
                            }
                        }
                    }
                }
            });
        });

        return model;
    }

    //kendoGrid related functions
    gridFormula = function (container, fieldName, formula) {
        formula.split("{").forEach(function (field) {
            if (field.length > 0) {
                var field = field.substring(0, field.indexOf("}"));
                formula = formula.replace(`{${field}}`, controls.gridGetCellValue(container, field));
            }
        });

        //console.log(formula);
        if (formula.indexOf("*") != -1 || formula.indexOf("/") != -1)
            controls.gridSetCellValue(container, fieldName, utils.roundUp(eval(formula), 2));
        else
        {
            try {
                controls.gridSetCellValue(container, fieldName, eval(formula));
            }
            catch {
                controls.gridSetCellValue(container, fieldName, formula);
            }
        }
    }

    gridGetCellValue = function (container, fieldName) {
        var grid = $(container).closest("div[type=grid]").data("kendoGrid");
        var uid = $(container).parent().attr("data-uid");
        if (uid != null) {
            return grid.dataSource._data.filter(a => a.uid == uid)[0][fieldName];
        }
    }

    //kendoGrid update cell value and dataSource in the same row
    gridSetCellValue = function (container, fieldName, value) {
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
    renderGridEditorCharges = function (container, options) {
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
                            url: "../Home/GetCharges",
                            data: { searchValue: filterValue, take: data.take },
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
                controls.gridSetCellValue(container, "CHARGE_DESC", e.dataItem.CHARGE_DESC);
            }
        });
    }

    //kendoGrid kendoDropDownList for Currency
    renderGridEditorCurrency = function (container, options) {
        //testObj = container;
        //testObj2 = options;
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            dataTextField: "CURR_CODE",
            dataValueField: "CURR_CODE",
            dataSource: data.currencies,
            cascade: function (e) {
                //e.sender._cascadedValue => selected value
                if (e.userTriggered == true) {
                    var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                    controls.gridSetCellValue(container, "EX_RATE", exRate);
                }
            },
        });
    }

    //kendoGrid kendoDropDownList for Qty Unit
    renderGridEditorQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            dataSource: data.chargeQtyUnit
        });
    }

    gridAutoFitColumns = function (grid) {
        setTimeout(function () {
            var colMaxWidth = 280;
            var row = [];
            var colIndex = 0;
            var tableWidth = 0;
            var font = utils.getCanvasFont(grid.thead.find(".k-column-title")[0]);

            //get the text width from table header
            grid.thead.find("th").each(function () {
                if (this.style.display != "none") {
                    var width = utils.getTextWidth(this.innerText, font) + 17;
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
                        if (!utils.isEmptyString(this.innerText)) {
                            var width = utils.getTextWidth(this.innerText, font) + 15;
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

    openReportViewer = function (reportName, paras) {
        var url = "http://gemini.rcs-asia.com:9010/FileDownload?id=";
        var paraValue = `reportName=${reportName};`;
        paras.forEach(function (para) {
            paraValue += `${para.name}=${para.value};`;
        });

        $.ajax({
            url: "../Home/EncryptString",
            data: { value: paraValue },
            dataType: "text",
            success: function (result) {
                url += result;

                $(".content-wrapper").append("<div class='kendo-window'></div>");
                var win = $(".kendo-window").kendoWindow({
                    title: "Report Viewer",
                    modal: true,
                    content: {
                        url: url,
                    },
                    width: "60%",
                    height: "95%",
                    close: function (e) {
                        win.destroy();
                    },
                }).data("kendoWindow");

                win.center().open();
                $("iframe").bind("load", function () {
                    kendo.ui.progress(win.element, false);
                });
                kendo.ui.progress(win.element, true);
            }
        });
    }
}