export default class {
    constructor() {
        if ($("#dashboardMain").length == 0) {
            $.ajax({
                url: "../Home/GetSysModules",
                success: function (menuItems) {
                    controls.initNavbar();
                    controls.initControlSidebar();
                    controls.initSidebar(menuItems);
                    controls.initTabstripMain();

                    $(window).on("resize", function () {
                        var height = $(".content-wrapper").height();
                        $("#tabStripMain").css({ "height": (height - 5), "position": "relative", "top": "-20px"});
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
                    $("[data-widget='control-sidebar']").trigger("click");
                }
            });
        }
    }

    //Navbar
    initNavbar = function () {
        function timeout() {
            setTimeout(function () {
                //if the sysCompanies is not loaded, then recall the parent function to create a recursive loop.
                console.log("waiting sysCompanies...");
                if (!$.isEmptyObject(data.masterRecords.sysCompanies)) {
                    $("div.wrapper").prepend(data.frameworkHtmlElements.navbar(data.masterRecords.sysCompanies));
                    return;
                }
                timeout();
            }, 100);
        }

        if ($.isEmptyObject(data.masterRecords.sysCompanies)) {
            timeout();
        } else {
            $("div.wrapper").prepend(data.frameworkHtmlElements.navbar(data.masterRecords.sysCompanies));
        }
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
        $(".sidebar .user-name").text(data.user.NAME);
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
            animation: false,
            //animation: {
            //    open: {
            //        effects: "fade"
            //    }
            //},
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

        //notification
        $("#notification").kendoNotification({
            autoHideAfter: 5000,
            position: {
                top: 130,
                right: 50,
            },
        });
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
        var tabStrip = $("#tabStripMain").data("kendoTabStrip");
        var pageSetting = data.indexPages.filter(a => a.pageName == controller)[0];
        if (pageSetting == null) {
            utils.alertMessage("No settings found of the requested page, it may still <br>under development, please try later.<br><br>", "Page not found", "warning", null, true);
            return;
        }

        //var originalId = id;    //keep the original id value, in case of special characters appears in the id and will be removed to prevent error in js.
        id = utils.encodeId(id);
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
            kendo.ui.progress($(`#${id}`).parent(), true);

            $("#btnClose_" + id).click(function () {
                try {
                    eval("remove_" + id + "_Objects();");
                } catch (err) { }
                controls.remove_tabStripMain(id);
            });

            $("#btnRefresh_" + id).click(function () {
                kendo.ui.progress($(`#${id}`).parent(), true);
                if (id.indexOf("Index") != -1) {
                    pageSetting = utils.getMasterForm(`#${id}`);
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

            if (localStorage.tabStrips != null) {
                var tabStrips = JSON.parse(localStorage.tabStrips);
                if (tabStrips.indexOf(id) == -1) {
                    tabStrips.push(id);
                    localStorage.tabStrips = JSON.stringify(tabStrips);
                }
            } else {
                localStorage.tabStrips = JSON.stringify([id]);
            }
        }

        //tabStrip.activateTab(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
        tabStrip.activateTab("li:last");
        if (id.indexOf("Index") != -1)
            controls.index.initIndexPage(pageSetting);
        else
            controls.edit.initEditPage(id);
    }

    activate_tabStripMain = function (id) {
        id = utils.removeSpecialCharacters(id);
        var tabStrip = $("#tabStripMain").data("kendoTabStrip");
        tabStrip.activateTab(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
    }

    remove_tabStripMain = function (id) {
        id = utils.removeSpecialCharacters(id);
        //console.log(id);
        try {
            eval("remove_" + id + "_Objects();");
        } catch (err) { }
        var tabStrip = $("#tabStripMain").data("kendoTabStrip");
        tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + id + "']").parent().parent());
        try {
            tabStrip.activateTab("li:last");
        } catch { }

        if (localStorage.tabStrips != null) {
            var tabStrips = JSON.parse(localStorage.tabStrips);
            if (tabStrips.indexOf(id) != -1) {
                tabStrips.splice(tabStrips.indexOf(id), 1);
                localStorage.tabStrips = JSON.stringify(tabStrips);
            }
        } else {
            localStorage.tabStrips = JSON.stringify([]);
        }
    }

    //Set the values to form controls
    setValuesToFormControls = function (masterForm, model, partialUpdate = false) {
        //console.log(masterForm, model);
        if (masterForm.mode == "create") {
            masterForm.schema.fields.forEach(function (field) {
                if (field.defaultValue != null) {
                    model[field.name] = field.defaultValue;
                }
            });
        }

        //Status info
        if (masterForm.mode == "edit") {
            $(`#${masterForm.id} span.toolbar-status`).html(`Create: ${model.CREATE_USER} - ${kendo.toString(kendo.parseDate(model.CREATE_DATE), data.dateTimeLongFormat)}<br> 
            Modify: ${model.MODIFY_USER} - ${kendo.toString(kendo.parseDate(model.MODIFY_DATE), data.dateTimeLongFormat)}`)
        }

        //Frt Mode buttonGroup control
        if (model.FRT_MODE != null) {
            var buttonGroup = $(`#${masterForm.id} .toolbar-frtMode`).data("kendoButtonGroup");
            var buttonText = model.FRT_MODE == "AE" ? "Export" : "Import";
            buttonGroup.select($(`#${masterForm.id} .toolbar-frtMode span:contains('${buttonText}')`).parent());

            if (masterForm.mode == "edit")
                buttonGroup.enable(false);
        }

        for (var i in masterForm.formGroups) {
            for (var j in masterForm.formGroups[i].formControls) {
                var control = masterForm.formGroups[i].formControls[j];
                //Check the existence of the control (name$: ends with value, special case for grid_)
                if ($(`#${masterForm.id} [name$=${control.name}]`).length == 0)
                    continue;

                //_CODE: special case for customers / shipper / consignee ... etc.
                if (partialUpdate && model[`${control.name}`] == null && model[`${control.name}_CODE`] == null)
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
                        //if (utils.getEditMode($(`#${masterForm.id} [name=${controlName}]`)) == "edit") {
                            var ddl = $(`#${masterForm.id} [name=${controlName}]`).data("kendoDropDownList");
                            if (!controls.isEmptyString(model[`${controlName}`])) {
                                ddl.filterInput.val(model[`${controlName}`]);
                                ddl.dataSource.data([{ [controlName]: model[`${controlName}`] }]);
                                ddl.value(model[`${controlName}`]);
                                ddl.search(model[`${controlName}`]);
                            }
                        //}
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
                        var controlName = control.name;
                        $(`#${masterForm.id} [name=${controlName}]`).each(function () {
                            var ddl = $(this).data("kendoDropDownList");
                            ddl.search(model[`${controlName}_CODE`]);
                            ddl.bind("dataBound", function (e) {
                                var ddlName = $(e.sender.element).attr("name");     //very important to get the correct control name!! the dropDropList search is a async function
                                var dataItems = ddl.dataSource.data();
                                for (var i = 0; i < dataItems.length; i++) {
                                    //console.log(ddlName, dataItems[i].BRANCH_CODE, dataItems[i].SHORT_DESC, model[`${ddlName}_BRANCH`], model[`${ddlName}_SHORT_DESC`])
                                    if (dataItems[i].BRANCH_CODE == model[`${ddlName}_BRANCH`] &&
                                        dataItems[i].SHORT_DESC == model[`${ddlName}_SHORT_DESC`]) {
                                        this.select(i + 1);
                                        this.trigger("select");
                                        break;
                                    }
                                }
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
                    if (control.dataType == "customerType") {
                        if (model[`${control.name}`] != null) {
                            $(`#${masterForm.id} div[type=buttonGroup][name=${control.name}]`).val(model[`${control.name}`]);
                            for (var index = 0; index < model[`${control.name}`].length; index++) {
                                if (model[`${control.name}`].substr(index, 1) == "Y")
                                    $(`#${masterForm.id} div[type=buttonGroup][name=${control.name}]`).data("kendoButtonGroup").select(index);
                            }
                        }
                    } else {
                        var buttonGroup = $(`#${masterForm.id} div[type=buttonGroup][name=${control.name}]`).data("kendoButtonGroup");
                        if (!controls.isEmptyString(model[`${control.name}`])) {
                            var buttonText = data.masterRecords[`${control.dataType}`].filter(a => a.value == model[`${control.name}`])[0].text;
                            buttonGroup.select($(`div[type=buttonGroup][name="${control.name}"] span:contains('${buttonText}')`).parent());
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
        var modelData = JSON.parse($(`#${masterForm.id}`).attr("modelData"));
        masterForm.schema.fields.forEach(function (field) {
            if (field.hidden != null) {
                if (masterForm.mode == "edit")
                    model[field.name] = modelData[field.name];
                else {
                    if (field.defaultValue != null)
                        model[field.name] = field.defaultValue;
                    else
                        model[field.name] = modelData[field.name];
                }
            }
        });

        masterForm.formGroups.forEach(function (formGroup) {
            formGroup.formControls.forEach(function (control) {
                if (control.type != "label") {
                    if ($(`#${masterForm.id} [name=${control.name}]`).length >= 1 || $(`#${masterForm.id} [name=grid_${control.name}]`).length == 1) {
                        if (control.type == "customer") {
                            var value = $(`#${masterForm.id} [name=${control.name}]`).val().split("-")[0];
                            var text = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").text().replace(`${value} - `, ``);
                            if (!controls.isEmptyString(value)) {
                                model[control.name] = utils.formatText(value);
                                model[control.name.replace("_CODE", "_DESC")] = utils.formatText(text);
                            }
                        } else if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                            //console.log(control.name, `#${masterForm.id} [name=${control.name}]`);
                            //console.log($(`#${masterForm.id} [name=${control.name}]`).val());

                            var value = $(`#${masterForm.id} [name=${control.name}]`).val().split("-")[0];
                            if (!controls.isEmptyString(value)) {
                                var text = $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").text().replace(`${value} - `, ``)
                                    .replace(` - ${$(`#${masterForm.id} [name=${control.name}_BRANCH]`).val()}`, ``);

                                model[`${control.name}_CODE`] = utils.formatText(value);
                                model[`${control.name}_BRANCH`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_BRANCH]`).val());
                                model[`${control.name}_SHORT_DESC`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_SHORT_DESC]`).val());
                                model[`${control.name}_DESC`] = utils.formatText(text);
                            }
                        } else if (control.type == "buttonGroup") {
                            if (control.dataType == "customerType") {
                                var selectedIndexes = [];
                                var type = "";
                                $(`#${masterForm.id} .k-widget.k-button-group[name=${control.name}]`).data("kendoButtonGroup").current().each(function () {
                                    selectedIndexes.push($(this).index());
                                });
                                for (var i = 0; i < 4; i++) {
                                    var selected = false;
                                    selectedIndexes.forEach(function (index) {
                                        if (index == i) {
                                            selected = true;
                                            type += "Y";
                                        }
                                    });
                                    if (!selected)
                                        type += "N";
                                }
                                model[control.name] = type;
                            } else {
                                var text = $(`#${masterForm.id} .k-widget.k-button-group[name=${control.name}]`).data("kendoButtonGroup").current().text();
                                model[control.name] = data.masterRecords[control.dataType].filter(a => a.text == text)[0].value;
                            }
                        } else if (control.type == "switch") {
                            var switchCtrl = $(`#${masterForm.id} [name=${control.name}]`).data("kendoSwitch");
                            if (switchCtrl.check())
                                model[`${control.name}`] = "Y";
                            else
                                model[`${control.name}`] = "N";
                        } else if (control.type == "grid") {
                            if ($(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid").dataSource.data().length > 0) {
                                model[control.name] = utils.formatGridData(
                                    $(`#${masterForm.id} [name=grid_${control.name}]`).data("kendoGrid"), control, masterForm.idField, model[masterForm.idField]);
                            }
                        } else {
                            //for all default input values
                            model[control.name] = utils.formatText($(`#${masterForm.id} [name=${control.name}]`).val());
                            //special case for exchange rate
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

        if (masterForm.mode == "create") {
            model["COMPANY_ID"] = data.companyId;
            model["FRT_MODE"] = utils.getFrtMode();
            model["CREATE_USER"] = data.user.USER_ID;
            model["CREATE_DATE"] = utils.convertDateToISOString(new Date());
            model["MODIFY_USER"] = data.user.USER_ID;
            model["MODIFY_DATE"] = utils.convertDateToISOString(new Date());
        } else {
            model["COMPANY_ID"] = modelData.COMPANY_ID;
            model["FRT_MODE"] = modelData.FRT_MODE;
            model["CREATE_USER"] = modelData.CREATE_USER;
            model["CREATE_DATE"] = utils.convertDateToISOString(kendo.parseDate(modelData.CREATE_DATE));
            model["MODIFY_USER"] = data.user.USER_ID;
            model["MODIFY_DATE"] = utils.convertDateToISOString(new Date());
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

    isEmptyString = function (str) {
        if (str == null)
            return true;
        if (typeof str != "string")
            return true;
        if (str.trim().length == 0)
            return true;

        return (!str || 0 === str.length);
    }
}