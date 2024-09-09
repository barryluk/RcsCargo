export default class {
    constructor() {
        $.ajax({
            url: "../Home/GetSysModules",
            success: function (menuItems) {
                controls.initNavbar();
                controls.initControlSidebar();
                controls.initSidebar(menuItems);
                controls.initTabstripMain();

                $(window).on("resize", function () {
                    var height = $(".content-wrapper").height();
                    $("#tabStripMain").css("height", height - 5);
                });
                $(window).trigger("resize");

                $(".nav-item.dropdown").bind("click", function () {
                    $(this).toggleClass("open");
                });
                $(".nav-item.dropdown.sysCompany").hover(function () {
                    $(this).find(".fa-house-user").toggleClass("fa-shake");
                });
                $(".dropdown.sysCompany .dropdown-item").bind("click", function (sender) {
                    console.log(sender.target);
                    data.companyId = $(sender.target).text().trim();
                    $(".dropdown.sysCompany span.currentSystemCompany").text(data.companyId);
                });
                $("[data-widget='control-logout']").bind("click", function () {
                    $.ajax({
                        url: "/Admin/Account/Logout",
                        data: { userId: data.user.USER_ID },
                        success: function (result) {
                            localStorage.removeItem("user");
                            localStorage.removeItem("sessionId");
                            window.open("../Home/Login", "_self");
                        }
                    });
                });
                $("[data-toggle='tooltip']").kendoTooltip();
            }
        });
    }

    //Navbar
    initNavbar = function () {
        $("div.wrapper").prepend(data.frameworkHtmlElements.navbar(data.masterRecords.sysCompanies));
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
            }],
            animation: {
                open: {
                    effects: "fade"
                }
            },
            activate: function (e) {
                try {
                    if ($(e.contentElement).find("div[id]")[0]["id"] != "dashboardMain")
                        data.lastActiveTabId = $(e.contentElement).find("div[id]")[0]["id"];
                } catch { }
            }
        }).data("kendoTabStrip");

        tabStripMain.activateTab($("#tabStripMain-tab-1"));
        controls.configureSortable();

        $("span:contains(Dashboard)").prepend(`<i class="k-icon k-icon-sm k-color-default fa fa-gauge-high" style="margin-right: 6px"></i>`);
        $(".k-tabstrip-items-wrapper").eq(0).before("<button id='btntabStripMainControl' type='button' style='width: 95.5px; left: 1.5px; top: 27px; z-index: 999'>Tab Control</button>");
        $("ul.k-tabstrip-items").before("<span class='tab-control'><div style='width: 100px'></div></span>");
        //$("span:contains(Dashboard)").before("<button id='btntabStripMainCloseAll' type='button'>Tab Control</button>");
        $("#btntabStripMainControl").kendoDropDownButton({
            items: [
                {
                    text: "Close all tabs", icon: "close", click: function (e) {
                        $("#tabStripMain li.k-tabstrip-item .k-icon.k-i-close").each(function () {
                            var tabId = $(this).attr("id").replace("btnClose_", "");
                            if (!$(this).prev().prev().hasClass("k-i-pin"))
                                controls.remove_tabStripMain(tabId);
                        })
                    }
                },
                {
                    text: "Close other tabs", icon: "close", click: function (e) {
                        $("#tabStripMain li.k-tabstrip-item .k-icon.k-i-close").each(function () {
                            var tabId = $(this).attr("id").replace("btnClose_", "");
                            if (!$(this).prev().prev().hasClass("k-i-pin") && $(this).attr("id").replace("btnClose_", "") != data.lastActiveTabId)
                                controls.remove_tabStripMain(tabId);
                        })
                    },
                },
                {
                    text: "Pin all tabs", icon: "pin", click: function (e) {
                        $("#tabStripMain .btnPin").each(function () {
                            $(this).removeClass("k-i-unpin");
                            $(this).addClass("k-i-pin");
                        })
                    },
                },
                {
                    text: "Un-Pin all tabs", icon: "unpin", click: function (e) {
                        $("#tabStripMain .btnPin").each(function () {
                            $(this).removeClass("k-i-pin");
                            $(this).addClass("k-i-unpin");
                        })
                    },
                },
                {
                    text: "Refresh all tabs", icon: "refresh", click: function (e) {
                        $("#tabStripMain li.k-tabstrip-item .k-icon.k-i-refresh").each(function () {
                            $(this).trigger("click");
                        })
                    },
                },
            ],
            //showArrowButton: true,
        });
        $("#btntabStripMainControl span.k-button-text").after("<span class='k-icon k-i-arrow-s k-button-icon'></span>");
    }

    configureSortable = function () {
        $("#tabStripMain ul.k-tabstrip-items").kendoSortable({
            filter: "li.k-item",
            axis: "x",
            container: "ul.k-tabstrip-items",
            hint: function (element) {
                return $("<div id='hint' class='k-widget k-tabstrip'><ul class='k-tabstrip-items k-reset'><li class='k-item k-active k-tab-on-top'>" + element.html() + "</li></ul></div>");
            },
            start: function (e) {
                var tabstrip = $("#tabStripMain").data("kendoTabStrip");
                tabstrip.activateTab(e.item);
            },
            change: function (e) {
                var tabstrip = $("#tabStripMain").data("kendoTabStrip"),
                    reference = tabstrip.tabGroup.children().eq(e.newIndex);

                if (e.oldIndex < e.newIndex) {
                    tabstrip.insertAfter(e.item, reference);
                } else {
                    tabstrip.insertBefore(e.item, reference);
                }
            }
        });
    };

    append_tabStripMain = function (text, id, controller) {
        kendo.ui.progress($(".container-fluid"), true);
        var tabStrip = $("#tabStripMain").data("kendoTabStrip");
        var pageSetting = data.indexPages.filter(a => a.pageName == controller)[0];
        pageSetting.id = id;

        if (tabStrip.tabGroup.find("[id='btnClose_" + id + "']").length == 0) {
            tabStrip.append({
                text: text +
                    " &nbsp;&nbsp;<i class='k-icon k-icon-sm k-color-default k-i-unpin btnPin'></i>" +
                    " &nbsp;&nbsp;<i class='k-icon k-icon-sm k-color-default k-i-refresh btnRefresh' id='btnRefresh_" + id + "'></i>" +
                    " &nbsp;&nbsp;<i class='k-icon k-i-close k-color-default btnClose' id='btnClose_" + id + "'></i>",
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
                kendo.ui.progress($(".container-fluid"), true);
                if (id.indexOf("Index") != -1) {
                    pageSetting.id = id;
                    controls.index.initIndexPage(pageSetting);
                }
                else
                    controls.edit.initEditPage(id);
            });

            $(".btnPin").unbind("click");

            $(".btnPin").bind("click", function () {
                if ($(this).hasClass("k-i-unpin")) {
                    $(this).removeClass("k-i-unpin");
                    $(this).addClass("k-i-pin");
                } else {
                    $(this).removeClass("k-i-pin");
                    $(this).addClass("k-i-unpin");
                }
            });
        }

        tabStrip.activateTab(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
        if (id.indexOf("Index") != -1)
            controls.index.initIndexPage(pageSetting);
        else
            controls.edit.initEditPage(id);
    }

    remove_tabStripMain = function (id) {
        try {
            eval("remove_" + id + "_Objects();");
        } catch (err) { }
        var tabStrip = $("#tabStripMain").data("kendoTabStrip");
        tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
        tabStrip.activateTab("li:last");
    }

    //Set the values to form controls
    setValuesToFormControls = function (masterForm, model, partialUpdate = false) {
        if (masterForm.schema.hiddenFields != null) {
            masterForm.schema.hiddenFields.forEach(function (field) {
                var value;
                if (model[`${field}`] != null) {
                    if (typeof model[`${field}`] == "object")
                        value = JSON.stringify(model[`${field}`]);
                    else
                        value = model[`${field}`];
                }

                if (!partialUpdate)
                    $(`#${masterForm.id} [name=${field}]`).val(value);
                else {
                    if (model[`${field}`] != null)
                        $(`#${masterForm.id} [name=${field}]`).val(value);
                }
            });
        }

        for (var i in masterForm.formGroups) {
            for (var j in masterForm.formGroups[i].formControls) {
                var control = masterForm.formGroups[i].formControls[j];
                //Check the existence of the control (name$: ends with value, speical case for grid_)
                if ($(`#${masterForm.id} [name$=${control.name}]`).length == 0)
                    continue;

                if (partialUpdate && model[`${control.name}`] == null)
                    continue;

                if (control.type == "date") {
                    $(`#${masterForm.id} [name=${control.name}]`).data("kendoDatePicker").value(kendo.parseDate(model[`${control.name}`]));
                    $(`#${masterForm.id} [name=${control.name}]`).val(kendo.toString(kendo.parseDate(model[`${control.name}`]), data.dateFormat));
                }
                else if (control.type == "dateTime") {
                    $(`#${masterForm.id} [name=${control.name}]`).data("kendoDateTimePicker").value(kendo.parseDate(model[`${control.name}`]));
                    $(`#${masterForm.id} [name=${control.name}]`).val(kendo.toString(kendo.parseDate(model[`${control.name}`]), data.dateTimeFormat));
                } else if (data.dropdownlistControls.filter(a => a.indexOf("customer") == -1).includes(control.type)) {
                    $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").value(model[`${control.name}`]);
                    if (control.name == "HAWB_NO" || control.name == "MAWB_NO" || control.name == "JOB_NO" || control.name == "LOT_NO") {
                        var controlName = control.name;
                        if (utils.getEditMode($(`#${masterForm.id} [name=${controlName}]`)) == "edit") {
                            var ddl = $(`#${masterForm.id} [name=${controlName}]`).data("kendoDropDownList");
                            if (!utils.isEmptyString(model[`${controlName}`])) {
                                ddl.filterInput.val(model[`${controlName}`]);
                                ddl.dataSource.data([{ [controlName]: model[`${controlName}`] }]);
                                ddl.value(model[`${controlName}`]);
                                ddl.search(model[`${controlName}`]);
                            }
                        }
                    } else if (control.name == "BOOKING_NO") {
                        var controlName = control.name;
                        if (utils.getEditMode($(`#${masterForm.id} [name=${controlName}]`)) == "edit") {
                            var ddl = $(`#${masterForm.id} [name=${controlName}]`).data("kendoDropDownList");
                            ddl.dataSource.data([{ BOOKING_NO: model[`${controlName}`] }]);
                            ddl.value(model[`${controlName}`]);
                        }
                    }

                    if (control.exRateName != null) {
                        $(`#${masterForm.id} [name=${control.exRateName}]`).val(model[`${control.exRateName}`]);
                    }
                } else if (control.type == "customer") {
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
                } else if (control.type == "switch") {
                    var switchCtrl = $(`#${masterForm.id} [name=${control.name}]`).data("kendoSwitch");
                    if (model[`${control.name}`] == "Y")
                        switchCtrl.check(true);
                    else
                        switchCtrl.check(false);
                } else if (control.type == "grid") {
                    if (model[`${control.name}`] != null) {
                        var grid = $(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid");
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
                    //if (control.dataType == "jobType") {
                    if (!utils.isEmptyString(model[`${control.name}`])) {
                        var buttonText = data.masterRecords[`${control.dataType}`].filter(a => a.value == model[`${control.name}`])[0].text;
                        //var jobType = model[`${control.name}`] == "C" ? "Consol" : "Direct";
                        buttonGroup.select($(`div[type=buttonGroup][name="${control.name}"] span:contains('${buttonText}')`).parent());
                    }
                    //}
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
                        } else if (control.type == "buttonGroup") {
                            var text = $(`#${masterForm.id} [name=${control.name}]`).data("kendoButtonGroup").current().text();
                            model[control.name] = data.masterRecords[control.dataType].filter(a => a.text == text)[0].value;
                        } else if (control.type == "switch") {
                            var switchCtrl = $(`#${masterForm.id} [name=${control.name}]`).data("kendoSwitch");
                            if (switchCtrl.check())
                                model[`${control.name}`] = "Y";
                            else
                                model[`${control.name}`] = "N";
                        } else if (control.type == "grid") {
                            if ($(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid").dataSource.data().length > 0) {
                                var dsData = $(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid").dataSource.data();
                                var gridData = [];
                                var lineNo = 1;

                                dsData.forEach(function (item) {
                                    var rowData = {};
                                    rowData["LINE_NO"] = lineNo;
                                    for (var field in control.fields) {
                                        if (control.fields[field].controlType == "checkBox") {
                                            if (item[field] == "true" || item[field] == "Y")
                                                rowData[field] = "Y";
                                            else
                                                rowData[field] = "N";
                                        } else
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

        //special case for multiple MAWB#
        if (masterForm.formName == "airMawb" && masterForm.mode == "create") {
            var formId = utils.getFormId();
            if ($(`#${formId} #airMawb_NEW_${data.companyId}_${utils.getFrtMode()}_mawbNoList`).length == 1) {
                var mawbNos = "";
                $(`#${formId} .k-chip.k-chip-solid-info span.k-chip-label`).each(function () {
                    mawbNos += $(this).text() + ",";
                });

                //MAWB length = 11
                if (mawbNos.length > 11) {
                    model["MAWB"] = mawbNos.substring(0, mawbNos.length - 1);
                }
            }
        }
        return model;
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