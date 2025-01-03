export default class {
    constructor() {
    }

    //Navbar
    initNavbar = function () {
        $("div.wrapper").prepend(data.frameworkHtmlElements.navbar(data.user.UserCompanies));
    }

    //Sidebar
    initSidebar = function (menuItems) {
        let html = data.frameworkHtmlElements.sidebar(menuItems);
        $("div.wrapper").prepend(html);
        $(".nav a.nav-link").each(function () {
            let link = $(this);
            //console.log(link.text(), link.attr("data-controller"), utils.isEmptyString(link.attr("data-controller")));
            if (!utils.isEmptyString(link.attr("data-controller")) && link.attr("data-controller") != "null") {
                link.click(function () {
                    let controller = link.attr("data-controller");
                    let action = link.attr("data-action");
                    let id = link.attr("data-id");
                    let userType = link.attr("data-userType");
                    let tabTitle = link.text().trim();

                    if ((userType == "A" && data.user.USER_TYPE == "A") || userType == "null")
                        controls.append_tabStripMain(tabTitle, id + "_" + data.companyId, controller);
                    else
                        utils.alertMessage("System administrator login is required for this module.<br><br>", "Access Restricted", "warning", null, true);
                });
            }
        });

        //Very important to init the treeview to ensure expand / collapse working
        $('[data-widget="treeview"]').Treeview('init');
        $(".sidebar .user-name").text(data.user.NAME);

        //Power search
        $("button.btn.btn-sidebar").click(function () {
            let html = `
                <div class="row col-sm-12" id="dialog_powerSearch" style="width: 650px">
                    <div class="col-sm-8">
                        <span class="k-input k-textbox k-input-solid k-input-md k-rounded-md" style="max-width: 340px; margin: 2px; padding: 0px">
                            <input class="k-input-inner" id="powerSearch_searchValue" placeholder="Search" style="max-width: 100%" />
                            <span class="k-input-separator k-input-separator-vertical"></span>
                            <span class="k-input-suffix k-input-suffix-horizontal">
                                <span class="k-icon k-i-search" aria-hidden="true" id="powerSearch_btnSearch"></span>
                            </span>
                        </span>
                    </div>
                    <div class="col-sm-4">
                        <label class="col-form-label">Days from now:</label>
                        <input class="form-control-dropdownlist" id="powerSearch_days" style="width: 100px" />
                    </div>
                    <div id="powerSearch_result" style="height: 400px; overflow: auto;"></div>
                </div>
            `;
            utils.alertMessage(html, "Power search");
            $("#powerSearch_searchValue").val($("input.form-control-sidebar").val());
            $("#powerSearch_days").kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: {
                    data: [{ text: "30", value: 30 },
                        { text: "60", value: 60 },
                        { text: "90", value: 90 },
                        { text: "180", value: 180 },
                        { text: "1 year", value: 365 },
                        { text: "2 years", value: 730 },]
                }
            });

            $("#powerSearch_btnSearch").click(function () {
                let searchValue = $("#powerSearch_searchValue").val();
                if (utils.isEmptyString(searchValue))
                    return;

                $.ajax({
                    url: "../MasterRecord/PowerSearch/Search",
                    data: {
                        searchValue: searchValue,
                        companyId: data.companyId,
                        days: $("#powerSearch_days").data("kendoDropDownList").value()
                    },
                    beforeSend: function () { kendo.ui.progress($(".wrapper"), true); },
                    complete: function () { kendo.ui.progress($(".wrapper"), false); },
                    success: function (result) {
                        let resultHtml = "";
                        for (var item in result)
                            resultHtml += `<p data-id="${result[item].TABLE_NAME}-${result[item].FRT_MODE}-${result[item].ID}-${result[item].ID_FIELD}"></p>`;

                        $("#powerSearch_result").html(resultHtml);

                        for (var item in result) {
                            let template = data.masterRecords.powerSearchTemplates.filter(a => a.TABLE_NAME == result[item].TABLE_NAME)[0];
                            let frtMode = result[item].FRT_MODE;
                            let tableName = result[item].TABLE_NAME;
                            let id = result[item].ID;
                            let idFieldName = result[item].ID_FIELD;

                            template.TEMPLATE = template.TEMPLATE.replaceAll("\r", "").replaceAll("\n", "");

                            $.ajax({
                                url: "../MasterRecord/PowerSearch/GetSearchResultDetail",
                                data: {
                                    companyId: data.companyId,
                                    frtMode: frtMode,
                                    tableName: tableName,
                                    id: id,
                                    idFieldName: idFieldName,
                                },
                                success: function (detailResult) {
                                    detailResult = JSON.parse(detailResult);
                                    let templateHtml = template.TEMPLATE;
                                    templateHtml = templateHtml.replace("{id}", `${tableName}-${frtMode}-${id}`);
                                    template.TEMPLATE.split("{").forEach(function (val) {
                                        let key = val.substring(0, val.indexOf("}"));
                                        let value = detailResult[0][key];
                                        if (!utils.isEmptyString(key))
                                            templateHtml = templateHtml.replaceAll(`{${key}}`, value);
                                    });
                                    let contentHtml = templateHtml.substring(templateHtml.indexOf("<br>"));
                                    contentHtml = contentHtml.replaceAll(utils.formatText(searchValue), `<span class="highlight">${utils.formatText(searchValue)}</span>`)
                                        .replaceAll("T00:00:00", "");

                                    //console.log(`#powerSearch_result p[data-id="${tableName}-${frtMode}-${id}-${idFieldName}"]`);
                                    $(`#powerSearch_result p[data-id="${tableName}-${frtMode}-${id}-${idFieldName}"]`)
                                        .append(`${templateHtml.substring(0, templateHtml.indexOf("<br>"))}${contentHtml}`);

                                    $(`#powerSearch_result p[data-id="${tableName}-${frtMode}-${id}-${idFieldName}"] .link-text`).click(function () {
                                        //console.log($(this).attr("data-id"));
                                        let controller = "";
                                        let tabTitle = "";
                                        let id = $(this).attr("data-id").split("-")[2];
                                        let frtMode = $(this).attr("data-id").split("-")[1];
                                        switch ($(this).attr("data-id").split("-")[0]) {
                                            case "A_MAWB": tabTitle = "MAWB#"; controller = "airMawb"; break;
                                            case "A_HAWB": tabTitle = "HAWB#"; controller = "airHawb"; break;
                                            case "A_BOOKING": tabTitle = "Booking#"; controller = "airBooking"; break;
                                            case "A_INVOICE": tabTitle = "Invoice#"; controller = "airInvoice"; break;
                                            case "A_PV": tabTitle = "PV#"; controller = "airPv"; break;
                                        }

                                        if (controller != "") {
                                            controls.append_tabStripMain(`${tabTitle} ${id}`, `${controller}_${id}_${data.companyId}_${frtMode}`, controller);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            });

            if (!utils.isEmptyString($("input.form-control-sidebar").val()))
                $("#powerSearch_btnSearch").trigger("click");
        });
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

                if ($(e.contentElement).find("div[id]")[0]["id"] == "dashboardMain") {
                    calendar.updateSize();
                    calendar.updateSize();
                    calendar.updateSize();
                }
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
                        let index = 0;
                        $("#tabStripMain li.k-tabstrip-item .k-icon.k-i-refresh").each(function () {
                            let btn = $(this);
                            index++;
                            setTimeout(function () { btn.trigger("click"); }, 600 * index);
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
        //console.log(id);
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
            if (id.indexOf("Index") == -1)
                kendo.ui.progress($(`#${id}`).parent(), true);

            $("#btnClose_" + id).click(function () {
                try {
                    eval("remove_" + id + "_Objects();");
                } catch (err) { }
                controls.remove_tabStripMain(id);
            });

            $("#btnRefresh_" + id).click(function () {
                controls.activate_tabStripMain(id);
                if (id.indexOf("Index") == -1)
                    kendo.ui.progress($(`#${id}`).parent(), true);
                if (id.indexOf("Index") != -1) {
                    pageSetting = utils.getMasterForm(`#${id}`);
                    pageSetting.id = id;
                    controls.initIndexPage(pageSetting);
                }
                else
                    controls.initEditPage(id);
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
        //tabStrip.activateTab("li:last");
        if (id.indexOf("Index") != -1) {
            controls.activate_tabStripMain(id);
            controls.initIndexPage(pageSetting);
        }
        else {
            controls.activate_tabStripMain(id);
            controls.initEditPage(id);
        }

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
        masterForm.id = utils.getFormId();
        //console.log(masterForm.id);
        if (masterForm.mode == "create") {
            masterForm.schema.fields.forEach(function (field) {
                if (field.defaultValue != null) {
                    if (field.defaultValue == "currency") {
                        let sysCompany = data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0];
                        let currCode = sysCompany[`${(utils.getFrtMode() == "AE" || utils.getFrtMode() == "SE") ? "EX" : "IM"}_${field.name}`];
                        let exRate = data.masterRecords.currencies.filter(a => a.CURR_CODE == currCode)[0].EX_RATE;
                        model[field.name] = currCode;
                        model[field.name.replace("CURR_CODE", "EX_RATE")] = exRate;
                    }
                    else
                        model[field.name] = field.defaultValue;
                }
            });
        }

        //Status info
        if (masterForm.mode == "edit" && !partialUpdate) {
            $(`#${masterForm.id} span.toolbar-status`).html(`Create: ${model.CREATE_USER} - ${kendo.toString(kendo.parseDate(model.CREATE_DATE), data.dateTimeLongFormat)}<br> 
            Modify: ${model.MODIFY_USER} - ${kendo.toString(kendo.parseDate(model.MODIFY_DATE), data.dateTimeLongFormat)}`)
        }

        //Frt Mode buttonGroup control
        if (model.FRT_MODE != null) {
            if (model.FRT_MODE.startsWith("A")) {
                var buttonGroup = $(`#${masterForm.id} .toolbar-frtMode`).data("kendoButtonGroup");
                var buttonText = model.FRT_MODE == "AE" ? "Export" : "Import";
                buttonGroup.select($(`#${masterForm.id} .toolbar-frtMode span:contains('${buttonText}')`).parent());

                if (masterForm.mode == "edit")
                    buttonGroup.enable(false);
            } else {
                var buttonGroup = $(`#${masterForm.id} .toolbar-seaFrtMode`).data("kendoButtonGroup");
                var buttonText = model.FRT_MODE == "SE" ? "Export" : "Import";
                buttonGroup.select($(`#${masterForm.id} .toolbar-seaFrtMode span:contains('${buttonText}')`).parent());

                if (masterForm.mode == "edit")
                    buttonGroup.enable(false);
            }
        }

        for (var i in masterForm.formGroups) {
            for (var j in masterForm.formGroups[i].formControls) {
                var control = masterForm.formGroups[i].formControls[j];
                masterForm.id = utils.getFormId();
                //console.log(`#${masterForm.id} [name=${control.name}]`);
                //Check the existence of the control (name$: ends with value, special case for grid_)
                if ($(`#${masterForm.id} [name$=${control.name}]`).length == 0)
                    continue;

                //_CODE: special case for customers / shipper / consignee ... etc.
                if (partialUpdate && model[`${control.name}`] == null && model[`${control.name}_CODE`] == null)
                    continue;

                if (control.type == "date") {
                    if (model[`${control.name}`] != null) {
                        if (kendo.parseDate(model[`${control.name}`]).getFullYear() > 1) {
                            $(`#${masterForm.id} [name=${control.name}]`).data("kendoDatePicker").value(kendo.parseDate(model[`${control.name}`]));
                            $(`#${masterForm.id} [name=${control.name}]`).val(kendo.toString(kendo.parseDate(model[`${control.name}`]), data.dateFormat));
                        }
                    }
                }
                else if (control.type == "dateTime") {
                    if (model[`${control.name}`] != null) {
                        if (kendo.parseDate(model[`${control.name}`]).getFullYear() > 1) {
                            $(`#${masterForm.id} [name=${control.name}]`).data("kendoDateTimePicker").value(kendo.parseDate(model[`${control.name}`]));
                            $(`#${masterForm.id} [name=${control.name}]`).val(kendo.toString(kendo.parseDate(model[`${control.name}`]), data.dateTimeFormat));
                        }
                    }
                } else if (data.dropdownlistControls.filter(a => a.indexOf("customer") == -1).includes(control.type)) {
                    $(`#${masterForm.id} [name=${control.name}]`).data("kendoDropDownList").value(model[`${control.name}`]);
                    if (control.name == "HAWB_NO" || control.name == "MAWB_NO" || control.name == "JOB_NO"
                        || control.name == "LOT_NO" || control.name == "CONTAINER_NO") {
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
                        let controlName = control.name;
                        let ddl = $(`#${masterForm.id} [name=${controlName}]`).data("kendoDropDownList");
                        //console.log(controlName, $(`#${masterForm.id} [name=${controlName}]`).data("kendoDropDownList").dataSource.data());
                        let customer = data.masterRecords.customers.filter(a =>
                            a.CUSTOMER_CODE.startsWith(model[`${controlName}_CODE`]) && 
                            a.BRANCH_CODE == (model[`${controlName}_BRANCH`]) &&
                            a.SHORT_DESC == (model[`${controlName}_SHORT_DESC`])
                        );
                        if (customer.length > 0) {
                            ddl.select(data.masterRecords.customers.indexOf(customer[0]) + 1);
                            ddl.trigger("select");
                        } else {
                            ddl.search(model[`${controlName}_CODE`]);
                            ddl.bind("dataBound", function (e) {
                                let ddlName = $(e.sender.element).attr("name");     //very important to get the correct control name!! the dropDropList search is a async function
                                //console.log(ddlName, ddl.dataSource.data());
                                customer = ddl.dataSource.data().filter(a =>
                                    a.BRANCH_CODE == (model[`${ddlName}_BRANCH`]) &&
                                    a.SHORT_DESC == (model[`${ddlName}_SHORT_DESC`]));

                                if (customer.length > 0) {
                                    ddl.select(ddl.dataSource.data().indexOf(customer[0]) + 1);
                                    ddl.trigger("select");
                                }
                            });
                        }
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

                if (control.name2 != null) {
                    if (control.type2 == "switch") {
                        var switchCtrl = $(`#${masterForm.id} [name=${control.name2}]`).data("kendoSwitch");
                        //console.log(switchCtrl);
                        if (model[`${control.name2}`] == "Y")
                            switchCtrl.check(true);
                        else
                            switchCtrl.check(false);
                    } else {
                        $(`#${masterForm.id} [name=${control.name2}]`).val(model[`${control.name2}`]);
                    }
                }
            }
        }
        if (model["IS_VOIDED"] == "Y")
            utils.addVoidOverlay(`#${masterForm.id}`);
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
                                model[`${control.name}_ADDR1`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR1]`).val());
                                model[`${control.name}_ADDR2`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR2]`).val());
                                model[`${control.name}_ADDR3`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR3]`).val());
                                model[`${control.name}_ADDR4`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR4]`).val());

                                if (control.name == "CUSTOMER") {
                                    model[`ADDR1`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR1]`).val());
                                    model[`ADDR2`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR2]`).val());
                                    model[`ADDR3`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR3]`).val());
                                    model[`ADDR4`] = utils.formatText($(`#${masterForm.id} [name=${control.name}_ADDR4]`).val());
                                }
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
                            //special case for new Job#
                            if (control.name == "JOB_NO") {
                                console.log("Job#");
                            }
                        }
                    }

                    if (control.name2 != null) {
                        if ($(`#${masterForm.id} [name=${control.name2}]`).length >= 1) {
                            if (control.type2 == "switch") {
                                var switchCtrl = $(`#${masterForm.id} [name=${control.name2}]`).data("kendoSwitch");
                                if (switchCtrl.check())
                                    model[`${control.name2}`] = "Y";
                                else
                                    model[`${control.name2}`] = "N";
                            } else {
                                //for all default input values
                                model[control.name2] = utils.formatText($(`#${masterForm.id} [name=${control.name2}]`).val());
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

        //special case for HBL No in sea invoice / PV
        if (masterForm.formName == "seaInvoice" || masterForm.formName == "seaPv") {
            var formId = utils.getFormId();
            if ($(`#${formId}_hblNoList`).length == 1) {
                let hblNos = [];
                let lineNo = 1;
                $(`#${formId} .k-chip.k-chip-solid-info span.k-chip-label`).each(function () {
                    if (masterForm.formName == "seaInvoice") {
                        hblNos.push({
                            INV_NO: $(`#${formId} [name="INV_NO"]`).val(),
                            COMPANY_ID: data.companyId,
                            FRT_MODE: utils.getFrtMode(),
                            LINE_NO: lineNo,
                            REF_TYPE: "H",
                            REF_NO: $(this).text(),
                        });
                    } else {
                        hblNos.push({
                            PV_NO: $(`#${formId} [name="PV_NO"]`).val(),
                            COMPANY_ID: data.companyId,
                            FRT_MODE: utils.getFrtMode(),
                            LINE_NO: lineNo,
                            REF_TYPE: "H",
                            REF_NO: $(this).text(),
                        });
                    }
                    
                    lineNo++;
                });
                if (masterForm.formName == "seaInvoice")
                    model["SeaInvoiceRefNos"] = hblNos;
                else
                    model["SeaPvRefNos"] = hblNos;
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

        if (str.toString().trim().length == 0)
            return true;
        else
            return false;
    }

    //isEmptyString = function (str) {
    //    if (str == null)
    //        return true;
    //    if (typeof str != "string")
    //        return true;
    //    if (str.trim().length == 0)
    //        return true;

    //    return (!str || 0 === str.length);
    //}

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

        if (pageSetting.initScript != null)
            eval(`${pageSetting.initScript}(pageSetting)`);

        if (pageSetting.additionalScript != null) {
            if (["country", "port", "seaPort", "airline", "carrier", "vessel", "currency", "charge", "chargeTemplate"].indexOf(pageSetting.pageName) == -1)
                eval(`controllers.${pageSetting.pageName}.${pageSetting.additionalScript}(pageSetting)`);
            else
                eval(`controllers.masterRecords.${pageSetting.additionalScript}(pageSetting)`);
        }

        //kendo.ui.progress($(".container-fluid"), false);
    }

    renderControls = function (pageSetting) {
        var html = "";

        if (pageSetting.groups != null) {
            $(`#${pageSetting.id}`).append(`<div name="main" class="row"></div>`);
            pageSetting.groups.forEach(function (group) {
                var ctrlHtml = "";
                $(`#${pageSetting.id} div[name="main"]`).append(`<div name="${group.name}" class="row col-xl-${group.colWidth} col-lg-6"></div>`);
                if (group.controls != null) {
                    group.controls.forEach(function (control) {
                        var iconHtml = "";
                        if (control.icon != null)
                            iconHtml = `<span class="k-icon ${control.icon} k-button-icon"></span>`;
                        ctrlHtml += `<span class="menuButton k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="${control.name}">${iconHtml}${control.label}</span>`;
                    });
                }
                if (group.name != "emptyGroup")
                    $(`#${pageSetting.id} [name="${group.name}"]`).append(data.htmlElements.card(group.title, ctrlHtml, 12, "info", "center"));
            });
        }

        if (pageSetting.controls != null) {
            pageSetting.controls.forEach(function (control) {
                let colWidth = "";
                let callbackFunction = "";
                let controlHtml = "";
                let formControlType = utils.getFormControlType(control.type);
                let formControlType2 = control.type2 != null ? utils.getFormControlType(control.type2) : "";
                let formControlClass = utils.getFormControlClass(control.type);
                let formControlClass2 = control.type2 != null ? utils.getFormControlClass(control.type2) : "";
                let readonlyAttr = control.readonly == null ? "" : "readonly";

                if (control.colWidth != null)
                    colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                if (control.callbackFunction != null)
                    callbackFunction = `callbackFunction="${control.callbackFunction}"`;
                if (control.type != "emptyBlock") {
                    if (control.type == "button")
                        controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${readonlyAttr} ${callbackFunction}>${control.text}</${formControlType}>`;
                    else {
                        if (!utils.isEmptyString(formControlType2)) {
                            //if (formControlClass == "form-control")
                            //    formControlClass = "form-control inline";

                            controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass} inline" name="${control.name}" ${readonlyAttr} ${callbackFunction} />`;
                            controlHtml += `<${formControlType2} type="${control.type2}" class="${formControlClass2}" name="${control.name2}" ${readonlyAttr} />`;
                        } else {
                            controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${readonlyAttr} ${callbackFunction} />`;
                        }
                    }
                }
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
        controls.renderFormControl_kendoUI(pageSetting);
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
                } else if (control.type == "emptyBlock") {
                    let controlHtml = "";
                    if (control.name != null)
                        controlHtml = `<div name="${control.name}" />`;
                    else
                        controlHtml = `<div />`;

                    html += `
                    <div class="form-group row">
                        <div class="col-md-2">
                            &nbsp;
                        </div>
                        <div class="col-md-10">
                            ${controlHtml}
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

            if (initKendoControls) {
                try {
                    controls.renderFormControl_kendoUI(pageSetting);
                }
                catch {
                    setTimeout(function () {
                        console.log("err: controls.renderFormControl_kendoUI", utils.getFormId());
                        $(`#btnRefresh_${utils.getFormId()}`).trigger("click");
                    }, 500);
                }
            }
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

                        if (pageSetting.pageName == "airTransfer") {
                            searchData = {
                                hawbNo: $(`#${pageSetting.id} div.search-control input[name=hawbNo]`).val(),
                                mawbNo: $(`#${pageSetting.id} div.search-control input[name=mawbNo]`).val(),
                                dateFrom: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                                dateTo: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                                companyId: data.companyId,
                                frtMode: "AE",
                                take: data.indexGridPageSize,
                                skip: options.data.skip,
                                sort: options.data.sort,
                            };
                        } else {
                            if (pageSetting.searchControls.length <= 1) {
                                searchData = {
                                    searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                                    companyId: data.companyId,
                                    take: data.indexGridPageSize,
                                    skip: options.data.skip,
                                    sort: options.data.sort,
                                };
                            } else {
                                let frtMode = "";
                                if ($(`#${pageSetting.id} div.search-control div[name=frtMode]`).attr("datatype") == "seaFrtMode")
                                    frtMode = $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "SE" : "SI";
                                else
                                    frtMode = $(`#${pageSetting.id} div.search-control div[name=frtMode]`).find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI";

                                searchData = {
                                    searchValue: $(`#${pageSetting.id} div.search-control input[name=searchInput]`).val(),
                                    dateFrom: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().start.toISOString(),
                                    dateTo: $(`#${pageSetting.id} div.search-control [name$=DateRange]`).data("kendoDateRangePicker").range().end.toISOString(),
                                    companyId: data.companyId,
                                    frtMode: frtMode,
                                    take: data.indexGridPageSize,
                                    skip: options.data.skip,
                                    sort: options.data.sort,
                                };
                            }
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
                    controls.gridAutoFitColumns(grid);
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
                controls.gridAutoFitColumns(grid);

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

                    //special case for sea Voyage
                    if (grid.element.attr("name") == "gridSeaVoyageIndex") {
                        let vesCode = $(selectedCell).text().split("/")[0].trim();
                        let voyage = $(selectedCell).text().split("/")[2].trim();
                        voyage = $(selectedCell).text().substring($(selectedCell).text().indexOf(voyage));
                        id = `${vesCode}-${voyage}`;
                    }

                    if ($(selectedCell).attr("callbackFunction") != null) {
                        eval(`${$(selectedCell).attr("callbackFunction")}(e.sender, id)`);
                    } else {
                        id = `${pageSetting.gridConfig.linkIdPrefix}_${id}_${data.companyId}_${utils.getFrtMode()}`;
                        if (grid.element.attr("name") == "gridSeaVoyageIndex") {
                            let voyage = $(selectedCell).text().split("/")[2].trim();
                            voyage = $(selectedCell).text().substring($(selectedCell).text().indexOf(voyage));
                            let title = `${$(selectedCell).text().split("/")[1].trim()} / ${voyage}`;
                            controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}: ${title}`, id, pageSetting.pageName);
                        }
                        else
                            controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${$(selectedCell).text().replace("VOID", "")}`, id, pageSetting.pageName);
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

    initEditPage = function (id, para) {
        //linkIdPrefix: airMawb / airBooking
        //id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        let formName = id.split("_")[0];
        this.keyValue = id.split("_")[1];
        this.companyId = id.indexOf("RCSHKG_OFF") == -1 ? id.split("_")[2] : "RCSHKG_OFF";
        this.frtMode = id.substring(id.lastIndexOf("_") + 1);
        let masterForm = utils.getMasterForm();
        masterForm.id = utils.getFormId();
        $(`#${id}`).html(data.htmlElements.editPage(`${masterForm.title} ${formName == "airMawb" ? utils.formatMawbNo(this.keyValue) : utils.decodeId(this.keyValue)}`));
        this.renderFormControls(masterForm);
        this.getModelData(masterForm, para);
    }

    //Get model data
    getModelData = function (masterForm, para) {
        let formId = utils.getFormId();
        masterForm.id = utils.getFormId();
        //console.log(masterForm);
        var requestParas = {
            id: utils.decodeId(this.keyValue),
            companyId: this.companyId,
            frtMode: this.frtMode
        };
        if (formId.startsWith("seaVoyage_")) {
            requestParas = {
                vesCode: utils.decodeId(this.keyValue).split("-")[0],
                voy: utils.decodeId(this.keyValue).split("-")[1],
                companyId: this.companyId,
                frtMode: this.frtMode
            };
        }
        if (para != null)
            $.extend(requestParas, para);

        if (masterForm.mode == "edit" || masterForm.mode == "create") {
            $.ajax({
                url: masterForm.readUrl,
                data: requestParas,
                success: function (result) {
                    $(`#${formId}`).attr("modelData", JSON.stringify(result));
                    //masterForm.modelData = result;
                    controls.setValuesToFormControls(masterForm, result);
                    if (masterForm.additionalScript != null)
                        eval(`controllers.${masterForm.formName}.${masterForm.additionalScript}(masterForm);`);
                },
                complete: function () {
                    kendo.ui.progress($(`#${masterForm.id}`).parent(), false);
                }
            });
        }
    }

    //Render form controls
    renderFormControls = function (masterForm) {
        var html = "";

        //Form tabStrip
        if (masterForm.formTabs != null) {
            $(`#${masterForm.id} .row.form_group`).append(`<div class="formGroupTab"></div>`);
            var formGroupTab = $(`#${masterForm.id} .row.form_group .formGroupTab`).kendoTabStrip({ animation: false }).data("kendoTabStrip");

            //Hide the tab title if only 1 tab in this form
            if (masterForm.formTabs.length == 1)
                $(`#${masterForm.id} .k-tabstrip-items`).attr("style", "display: none");

            masterForm.formTabs.forEach(function (tab) {
                formGroupTab.append({ text: tab.title, content: `<div name="${tab.name}" class="row"></div>` });

                if (tab.formGroups == null)
                    return;

                tab.formGroups.forEach(function (formGroupName) {
                    var formGroup = masterForm.formGroups.filter(a => a.name == formGroupName)[0];
                    html = "";

                    if (formGroup == null)
                        return;

                    for (var j in formGroup.formControls) {
                        var control = formGroup.formControls[j];
                        var field = masterForm.schema.fields.filter(a => a.name == control.name)[0];
                        var formControlClass = utils.getFormControlClass(control.type);
                        let formControlClass2 = control.type2 != null ? utils.getFormControlClass(control.type2) : "";
                        var formControlType = utils.getFormControlType(control.type);
                        let formControlType2 = control.type2 != null ? utils.getFormControlType(control.type2) : "";
                        var required = "";

                        //skip for empty blocks
                        if (control.name == null) {
                            if (control.type == "emptyBlock") {
                                html += `
                                    <div class="col-xl-${control.colWidth}">
                                        <label class="col-sm-3 col-form-label">${control.label}</label>
                                        <div class="col-sm-9">
                                        </div>
                                    </div>`;
                            }
                            continue;
                        }

                        if (field != null)
                            required = field["required"] == null ? "" : "required";

                        if (control.type == "label") {
                            html += `
                                <div class="row">
                                    <label class="col-lg-12 col-form-label"><h5>${control.label}</h5></label>
                                </div>`;
                        } else if (control.type == "buttonGroup") {
                            var colWidth = "";
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;
                            html += `
                                <div class="row ${colWidth}">
                                    <label class="col-sm-3 col-form-label">${control.label}</label>
                                    <div class="col-sm-9">
                                        <${formControlType} type="${control.type}" name="${control.name}" dataType="${control.dataType}" ${!utils.isEmptyString(required) ? "required-checking='true'" : ""} />
                                    </div>
                                </div>`;
                        } else if (control.type == "grid") {
                            var colWidth = "";
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                            if (!utils.isEmptyString(control.label)) {
                                html += `
                                    <div class="row col-xl-12 col-lg-12">
                                        <div class="row ${colWidth}">
                                            <label class="col-sm-3 col-form-label">${control.label}</label>
                                                <div class="col-sm-9">
                                                <div name="grid_${control.name}" type="${control.type}" ${!utils.isEmptyString(required) ? "required-checking='true'" : ""} />
                                            </div>
                                        </div>
                                    </div>`;
                            } else {
                                html += `
                                    <div class="row">
                                        <div name="grid_${control.name}" type="${control.type}" ${!utils.isEmptyString(required) ? "required-checking='true'" : ""} />
                                    </div>`;
                            }
                        } else if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                            var readonlyAttr = "";
                            if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                                var colWidth = "";
                                if (control.colWidth != null)
                                    colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;
                                if (control.type == "customerAddr") {
                                    readonlyAttr = "readonly";
                                }
                                html += `
                                    <div class="row ${colWidth}">
                                        <label class="col-sm-3 col-form-label">${control.label}</label>
                                        <div class="col-sm-9">
                                            <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${required} />
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
                                    <div class="row col-xl-${colWidth} col-lg-${colWidth * 2 > 12 ? 12 : colWidth * 2}">
                                        <label class="col-sm-3 col-form-label">${control.label}</label>
                                        <div class="row col-sm-9">
                                            <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" style="margin-left: 9.5px; width: 95px; height: 28.79px" ${required} />
                                            &nbsp;
                                            <${formControlType} class="form-control" name="${control.exRateName}" style="width: 80px;" readonly ${required} />
                                        </div>
                                    </div>`;
                            }
                        } else if (control.type == "chargeTemplate") {
                            var colWidth = control.colWidth != null ? control.colWidth : "3";
                            html += `
                                <div class="row col-xl-${colWidth} col-lg-${colWidth * 2 > 12 ? 12 : colWidth * 2}">
                                    <label class="col-sm-4 col-form-label">${control.label}</label>
                                    <div class="row col-sm-8">
                                        <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" targetControl="${control.targetControl}" />
                                    </div>
                                </div>`;
                        } else if (control.type == "button") {
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                            html += `
                                <div class="row ${colWidth}">
                                    <button type="button" class="customButton button-icon-${control.icon}" name="${control.name}" style="margin: 4px;">${control.label}</button>
                                </div>`;
                        } else {
                            var colWidth = "";
                            var callbackFunction = "";
                            var controlHtml = "";

                            if (control.callbackFunction != null)
                                callbackFunction = `callbackFunction="${control.callbackFunction}"`;
                            if (control.type != "emptyBlock") {
                                if (!utils.isEmptyString(formControlType2)) {
                                    if (formControlClass == "form-control")
                                        formControlClass = "form-control inline";
                                    if (formControlClass2 == "form-control")
                                        formControlClass2 = "form-control inline";

                                    controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${callbackFunction} ${required} />`;
                                    controlHtml += `<${formControlType2} type="${control.type2}" class="${formControlClass2}" name="${control.name2}" ${required} />`;
                                } else {
                                    controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${callbackFunction} ${required} />`;
                                }
                            }
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                            html += `
                                <div class="row ${colWidth}">
                                    <label class="col-sm-3 col-form-label">${control.label}</label>
                                    <div class="col-sm-9">
                                        ${controlHtml}
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
        //console.log(masterForm.id);
        controls.renderFormControl_kendoUI(masterForm, true);

        //readonly fields
        masterForm.schema.fields.forEach(function (field) {
            if (field.readonly != null) {
                if (field.readonly == "always") {
                    $(`#${masterForm.id} [name=${field.name}]`).attr("readonly", "readonly");
                } else if (field.readonly == "edit" && masterForm.mode == "edit") {
                    $(`#${masterForm.id} [name=${field.name}]`).attr("readonly", "readonly");
                }
            };
        });

        //Readonly kendo controls
        $(`#${masterForm.id} input[readonly=readonly], div[readonly=readonly]`).each(function () {
            var ctrlType = $(this).attr("data-role");
            switch (ctrlType) {
                case "dropdownlist":
                    $(this).data("kendoDropDownList").enable(false);
                    break;
                case "datetimepicker":
                    $(this).data("kendoDateTimePicker").enable(false);
                    break;
                case "datepicker":
                    $(this).data("kendoDatePicker").enable(false);
                    break;
                case "numerictextbox":
                    $(this).data("kendoNumericTextBox").enable(false);
                    break;
                case "buttongroup":
                    $(this).data("kendoButtonGroup").enable(false);
                    break;
            }
        });

        //collapse cards
        if (masterForm.formGroups != null) {
            masterForm.formGroups.forEach(function (formGroup) {
                if (formGroup.collapse == true) {
                    $(`.card-title:contains("${formGroup.title}")`).CardWidget("collapse");
                }
            });
        }
    }

    //Render form controls (KendoUI)
    renderFormControl_kendoUI = function (masterForm, enableValidation = false) {
        masterForm.id = utils.getFormId();
        //console.log(masterForm);
        //kendoValidator
        var validator = $(`#${masterForm.id}`).data("kendoValidator");
        if (validator == null && enableValidation) {
            var rules = {
                chipListRequired: function (input) {
                    var result = true;
                    if (input.is("[type=chipList]")) {
                        if (input.is("[required-checking='true']")) {
                            if (input.data("kendoButtonGroup").data("kendoChipList").items().length == 0)
                                result = false;
                        }
                    }
                    return result;
                },
                buttonGroupRequired: function (input) {
                    var result = true;
                    if (input.is("[type=buttonGroup]")) {
                        if (input.is("[required-checking='true']")) {
                            if (input.data("kendoButtonGroup").current().length == 0)
                                result = false;
                        }
                    }
                    return result;
                },
                gridRequired: function (input) {
                    var result = true;
                    if (input.is("[type=grid]")) {
                        if (input.is("[required-checking='true']")) {
                            if (input.data("kendoGrid").dataSource.data().length == 0)
                                result = false;
                            else {
                                var rowsCount = 0;
                                input.data("kendoGrid").dataSource.data().forEach(function (row) {
                                    if (!utils.isGridRowDeleted(input.data("kendoGrid"),
                                        input.data("kendoGrid").dataSource.data().indexOf(row))) {
                                        rowsCount++;
                                    }
                                });
                                if (rowsCount == 0)
                                    result = false;
                            }
                        }
                    }
                    return result;
                },
                gridDataValidate: function (input) {
                    var result = true;
                    if (input.is("[type=grid]")) {
                        var grid = input.data("kendoGrid");
                        var gridConfig = utils.getFormControlByName(input.attr("name").replace("grid_", ""));

                        grid.dataSource.data().forEach(function (item) {
                            for (var i in gridConfig.fields) {
                                if (gridConfig.fields[i].validation != null) {
                                    if (gridConfig.fields[i].validation.required == true) {
                                        try {
                                            if (utils.isEmptyString(item[i])) {
                                                result = false;
                                            }
                                        } catch {
                                            console.log("err", i);
                                            //result = false;
                                        }
                                    }
                                }
                            }
                        });
                    }
                    return result;
                },
            };

            function getGridDataValidateMessage(input) {
                var result = "The following field(s) are required: ";
                if (input.is("[type=grid]")) {
                    var grid = input.data("kendoGrid");
                    var gridConfig = utils.getFormControlByName(input.attr("name").replace("grid_", ""));

                    grid.dataSource.data().forEach(function (item) {
                        for (var i in gridConfig.fields) {
                            if (gridConfig.fields[i].validation != null) {
                                if (gridConfig.fields[i].validation.required == true) {
                                    try {
                                        if (utils.isEmptyString(item[i])) {
                                            console.log(item, i);
                                            if (result.indexOf(i) == -1)
                                                result += i + ", ";
                                        }
                                    } catch {
                                        console.log("err", item, i);
                                        if (result.indexOf(i) == -1)
                                            result += i + ", ";
                                    }
                                }
                            }
                        }
                    });
                }
                console.log(result.substring(0, result.length - 2));
                return result.substring(0, result.length - 2);
            }

            var messages = {
                chipListRequired: "At least 1 record must be added.",
                buttonGroupRequired: "At least 1 option must be selected.",
                gridRequired: "At least 1 record must be added.",
                gridDataValidate: function (input) {
                    return getGridDataValidateMessage(input);
                },
            };

            if (masterForm.schema.validation != null) {
                rules = Object.assign({}, rules, masterForm.schema.validation.rules);
                messages = Object.assign({}, messages, masterForm.schema.validation.messages);
            }

            validator = $(`#${masterForm.id}`).kendoValidator({
                rules: rules,
                messages: messages,
                errorTemplate: ({ message }) => utils.validatorErrorTemplate(message),
                validate: function (e) {
                    if (!e.valid) {
                        setTimeout(function () {
                            validator.hideMessages();
                        }, 1000 * 6);
                    }
                }
            }).data("kendoValidator");

            validator._inputSelector = "[type=grid],[type=buttonGroup],[type=chipList],:input:not(:button,[type=submit],[type=reset],[disabled],[readonly])[data-validate!=false]";
            testObj = validator;
        }

        //kendoToolBar
        $(`#${masterForm.id} div.toolbar`).each(function () {
            $(this).kendoToolBar({
                items: masterForm.toolbar
            });
        });
        $(`#${masterForm.id} [data-role=dropdownbutton]`).append(`<span class="k-icon k-i-arrow-s k-button-icon"></span>`);

        if (masterForm.schema != null) {
            if (masterForm.schema.fields.filter(a => a.name == "FRT_MODE").length == 0)
                $(`#${masterForm.id} .toolbar.k-toolbar`).append(`<span class="toolbar-status"></span>`);
            else {
                if (masterForm.id.startsWith("air"))
                    $(`#${masterForm.id} .toolbar.k-toolbar`).append(`<span class="toolbar-frtMode"></span><span class="toolbar-status"></span>`);
                else
                    $(`#${masterForm.id} .toolbar.k-toolbar`).append(`<span class="toolbar-seaFrtMode"></span><span class="toolbar-status"></span>`);
            }
        }

        //New button click event
        $(`#${masterForm.id} button .k-i-file-add`).parent().bind("click", function () {
            var formId = utils.getFormId($(this));
            if (formId.split("_")[1] == "NEW") {
                $("#btnRefresh_" + formId).trigger("click");
            } else {
                var controller = formId.split("_")[0];
                controls.append_tabStripMain(`${masterForm.title} NEW`, `${controller}_NEW_${data.companyId}_${utils.getFrtMode()}`, controller);
            }
        });

        //Save button click event
        $(`#${masterForm.id} button .k-i-save`).parent().bind("click", function () {
            //Get the masterForm settings from id element
            masterForm = utils.getMasterForm();
            if (!validator.validate()) {
                utils.showNotification("Validation failed, please verify the data entry", "warning");
                return;
            } else {
                var model = controls.getValuesFromFormControls(masterForm);
                console.log(masterForm, model);
                //return;

                $.ajax({
                    url: masterForm.updateUrl,
                    type: "post",
                    data: { model: model, mode: masterForm.mode },
                    beforeSend: function () {
                        kendo.ui.progress($(`#${masterForm.id}`), true);
                    },
                    success: function (result) {
                        console.log(result);
                        if (masterForm.mode == "edit") {
                            $(`#btnRefresh_${masterForm.id}`).trigger("click");
                        } else {
                            var controller = masterForm.id.split("_")[0];
                            var newId = `${controller}_${utils.encodeId(result[masterForm.idField])}_${data.companyId}_${utils.getFrtMode()}`;
                            console.log("newID", newId);

                            //Change the form control values
                            var tabHtml = $(`#btnRefresh_${masterForm.id}`).parent().html();

                            //seaSob_NEW_RCSHKG_SE_HBL_SHALAX19713
                            if (tabHtml.startsWith("SOB#")) {
                                tabHtml = `SOB# ${result[masterForm.idField]} &nbsp;&nbsp;<i class="k-icon k-icon-sm k-color-default k-i-unpin btnPin"></i> &nbsp;&nbsp;<i class="k-icon k-icon-sm k-color-default k-i-refresh btnRefresh" id="btnRefresh_${newId}"></i> &nbsp;&nbsp;<i class="k-icon k-i-close k-color-default btnClose" id="btnClose_${newId}"></i>`;
                            }
                            else
                                tabHtml = tabHtml.replaceAll("NEW", utils.encodeId(result[masterForm.idField]));

                            tabHtml = tabHtml.replace(masterForm.title + " " + utils.encodeId(result[masterForm.idField]), masterForm.title + " " + result[masterForm.idField]);
                            $(`#btnRefresh_${masterForm.id}`).parent().html(tabHtml);
                            $(`#${masterForm.id}`).attr("id", newId);
                            $(`#${newId} h3`).text(`${masterForm.title} ${utils.encodeId(result[masterForm.idField])}`);

                            $("#btnClose_" + newId).click(function () {
                                var tabStrip = $("#tabStripMain").data("kendoTabStrip");
                                tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + newId + "']").parent().parent());
                                tabStrip.activateTab("li:last");
                            });

                            $("#btnRefresh_" + newId).click(function () {
                                kendo.ui.progress($(`#${newId}`), true);
                                controls.initEditPage(newId);
                            });

                            $("#btnRefresh_" + newId).trigger("click");
                        }
                        utils.showNotification("Save success", "success");
                    },
                    error: function (err) {
                        console.log(err);
                        utils.showNotification("Save failed, please contact system administrator!", "error");
                    },
                    complete: function () {
                        kendo.ui.progress($(`#${utils.getFormId()}`), false);
                    }
                });
            }
        });

        //Void button click event
        $(`#${masterForm.id} button .k-i-cancel`).parent().bind("click", function () {
            utils.confirmMessage("Are you sure to void this record?", "", "controls.voidConfirmClick");
        });

        //kendoDatePicker
        $(`#${masterForm.id} input[type=date]`).each(function () {
            $(this).kendoDatePicker({
                format: data.dateFormat
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
            //console.log(utils.getFormControlByName($(this).attr("name")));
            $(this).kendoDateRangePicker({
                labels: false,
                format: data.dateFormat,
                range: {
                    start: utils.addDays(new Date(), (utils.getFormControlByName($(this).attr("name")).daysBefore ?? 60) * -1),
                    end: utils.addDays(new Date(), 30)
                }
            });

            $(this).find("span").eq(2).html(`<i class="fa-solid fa-arrows-left-right"></i>`)
        });

        //kendoButtonGroup for customerType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=customerType]`).each(function () {
            var control = $(this);
            $(this).kendoButtonGroup({
                selection: "multiple",
                items: data.masterRecords.customerType,
                select: function (e) {
                    //var frtMode = this.current().text() == "Export" ? "AE" : "AI";
                    //$(`#${masterForm.id} input[name="FRT_MODE"]`).val(frtMode);
                }
            });
        });

        //kendoButtonGroup for frtMode
        $(`#${masterForm.id} div[type=buttonGroup][dataType=frtMode], #${masterForm.id} .toolbar-frtMode`).each(function () {
            let countryCode = data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].COUNTRY_CODE;
            if (countryCode == "US") {
                $(this).kendoButtonGroup({
                    items: [
                        { text: "Export", iconClass: "fa fa-plane-departure" },
                        { text: "Import", iconClass: "fa fa-plane-arrival", selected: true },
                    ],
                    select: function (e) {
                        var frtMode = this.current().text() == "Export" ? "AE" : "AI";
                        $(`#${masterForm.id} input[name="FRT_MODE"]`).val(frtMode);
                    }
                });
            } else {
                $(this).kendoButtonGroup({
                    items: [
                        { text: "Export", iconClass: "fa fa-plane-departure", selected: true },
                        { text: "Import", iconClass: "fa fa-plane-arrival" },
                    ],
                    select: function (e) {
                        var frtMode = this.current().text() == "Export" ? "AE" : "AI";
                        $(`#${masterForm.id} input[name="FRT_MODE"]`).val(frtMode);
                    }
                });
            }
        });

        //kendoButtonGroup for seaFrtMode
        $(`#${masterForm.id} div[type=buttonGroup][dataType=seaFrtMode], #${masterForm.id} .toolbar-seaFrtMode`).each(function () {
            let countryCode = data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].COUNTRY_CODE;
            if (countryCode == "US") {
                $(this).kendoButtonGroup({
                    items: [
                        { text: "Export", iconClass: "k-icon k-i-export" },
                        { text: "Import", iconClass: "k-icon k-i-import", selected: true },
                    ],
                    select: function (e) {
                        var seaFrtMode = this.current().text() == "Export" ? "SE" : "SI";
                        $(`#${masterForm.id} input[name="FRT_MODE"]`).val(seaFrtMode);
                    }
                });
            } else {
                $(this).kendoButtonGroup({
                    items: [
                        { text: "Export", iconClass: "k-icon k-i-export", selected: true },
                        { text: "Import", iconClass: "k-icon k-i-import" },
                    ],
                    select: function (e) {
                        var seaFrtMode = this.current().text() == "Export" ? "SE" : "SI";
                        $(`#${masterForm.id} input[name="FRT_MODE"]`).val(seaFrtMode);
                    }
                });
            }
        });

        //kendoButtonGroup for bookingType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=bookingType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.bookingType,
                index: 0
            });
        });

        //kendoButtonGroup for jobType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=jobType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.jobType,
                select: function (e) {
                    try {
                        eval(`controllers.airMawb.changedJobType(e.sender)`);
                    } catch { }
                },
                index: 0
            });
        });

        //kendoButtonGroup for printDateType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=printDateType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.printDateType,
                index: 0
            });
        });

        //kendoButtonGroup for invoiceType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=invoiceType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.invoiceType,
                index: 0
            });
        });

        //kendoButtonGroup for invoiceCategory
        $(`#${masterForm.id} div[type=buttonGroup][dataType=invoiceCategory]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.invoiceCategory,
                index: 0
            });
        });

        //kendoButtonGroup for seaInvoiceCategory
        $(`#${masterForm.id} div[type=buttonGroup][dataType=seaInvoiceCategory]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.seaInvoiceCategory,
                index: 0
            });
        });

        //kendoButtonGroup for seaInvoiceFormat
        $(`#${masterForm.id} div[type=buttonGroup][dataType=seaInvoiceFormat]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.seaInvoiceFormat,
                index: 0
            });
        });

        //kendoButtonGroup for pvType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=pvType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.pvType,
                index: 0
            });
        });

        //kendoSwitch
        $(`#${masterForm.id} input[type=switch]`).each(function () {
            $(this).kendoSwitch({
                messages: {
                    checked: "yes",
                    unchecked: "no"
                },
                size: "small",
                checked: true
            });
        });

        //kendoTextArea
        $(`#${masterForm.id} textarea[type=textArea]`).each(function () {
            $(this).kendoTextArea({
                rows: 8,
                maxLength: 1000
            });

            $(this).attr("style", $(this).attr("style") + "height: 100%;");
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
                            if (filterValue == "")
                                options.success(data.masterRecords.customers);
                            else {
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
                            }
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
            let ddl = $(this);
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
                            if (filterValue == "")
                                options.success(data.masterRecords.customers);
                            else {
                                let searchValue = utils.formatText(filterValue);
                                let customers = data.masterRecords.customers.filter(a =>
                                    a.CUSTOMER_CODE.startsWith(searchValue) || a.CUSTOMER_DESC.indexOf(searchValue) != -1 || (a.SHORT_DESC ?? "").startsWith(searchValue)
                                );
                                if (customers.length > 0) {
                                    options.success(customers);
                                } else {
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
                                }
                            }
                        },
                    }
                },
                select: function (e) {
                    //console.log(masterForm.id);
                    masterForm.id = utils.getFormId();
                    if (!masterForm.id.endsWith("_createInvoice"))
                        masterForm.id = utils.getFormId(this.element);
                    var item = e.dataItem;
                    if (item == null) {
                        item = e.sender.dataSource.data()[e.sender.selectedIndex - 1];
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

                    if (data.masterRecords.customers.filter(a => a.CUSTOMER_CODE == item.CUSTOMER_CODE).length == 0) {
                        data.masterRecords.customers.push({
                            CUSTOMER_CODE: item.CUSTOMER_CODE,
                            CUSTOMER_DESC: item.CUSTOMER_DESC,
                            BRANCH_CODE: item.BRANCH_CODE,
                            SHORT_DESC: item.SHORT_DESC,
                            ADDR1: item.ADDR1,
                            ADDR2: item.ADDR2,
                            ADDR3: item.ADDR3,
                            ADDR4: item.ADDR4,
                        });
                    }
                },
                open: function (e) {
                    var value = $(e.sender.element[0]).parent().next().val().split("-")[0];
                    $(e.sender.filterInput).val(value);
                }
            });
        });

        //kendoDropDownList for Country
        $(`#${masterForm.id} input[type=country]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "COUNTRY_DESC_DISPLAY",
                dataValueField: "COUNTRY_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.countries },
            });
        });

        //kendoDropDownList for Port
        $(`#${masterForm.id} input[type=port]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "PORT_DESC_DISPLAY",
                dataValueField: "PORT_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.ports },
            });
        });

        //kendoDropDownList for SeaPort
        $(`#${masterForm.id} input[type=seaPort]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "PORT_DESC_DISPLAY",
                dataValueField: "PORT_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.seaPorts },
            });
        });

        //kendoDropDownList for Airline
        $(`#${masterForm.id} input[type=airline]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "AIRLINE_DESC_DISPLAY",
                dataValueField: "AIRLINE_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.airlines },
            });
        });

        //kendoDropDownList for Vessel
        $(`#${masterForm.id} input[type=vessel]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "VES_DESC_DISPLAY",
                dataValueField: "VES_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.vessels },
            });
        });

        //kendoDropDownList for Carrier
        $(`#${masterForm.id} input[type=carrier]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "CARRIER_DESC_DISPLAY",
                dataValueField: "CARRIER_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.carriers },
            });
        });

        //kendoDropDownList for Carrier Contract
        $(`#${masterForm.id} input[type=carrierContract]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "CONTRACT_NO_DISPLAY",
                dataValueField: "CONTRACT_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.carrierContracts },
            });
        });

        //kendoDropDownList for EDI Terminal
        $(`#${masterForm.id} input[type=ediTerminal]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: { data: data.masterRecords.ediTerminal },
            });
        })

        //kendoDropDownList for vwts factor
        $(`#${masterForm.id} input[type=vwtsFactor]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.vwtsFactor
            });
        });

        //kendoDropDownList for to order
        $(`#${masterForm.id} input[type=toOrder]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.masterRecords.toOrder
            });
        });

        //kendoDropDownList for print on HBL
        $(`#${masterForm.id} input[type=printOnHbl]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.masterRecords.printOnHbl
            });
        });

        //kendoDropDownList for incoterm
        $(`#${masterForm.id} input[type=incoterm]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.masterRecords.incoterm
            });
        });

        //kendoDropDownList for payment terms
        $(`#${masterForm.id} input[type=paymentTerms]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: data.masterRecords.paymentTerms
            });
        });

        //kendoDropDownList for show charges
        $(`#${masterForm.id} input[type=showCharges]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataTextField: "text",
                dataValueField: "value",
                dataSource: data.masterRecords.showCharges
            });
        });

        //kendoDropDownList for flight service type
        $(`#${masterForm.id} input[type=fltServiceType]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: data.masterRecords.fltServiceType
            });
        });

        //kendoDropDownList for sea service type
        $(`#${masterForm.id} input[type=seaServiceType]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.seaServiceType
            });
        });

        //kendoDropDownList for seqType
        $(`#${masterForm.id} input[type=seqType]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.seqTypes
            });
        });

        //kendoDropDownList for sysCompany
        $(`#${masterForm.id} input[type=sysCompany]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "COMPANY_ID",
                dataValueField: "COMPANY_ID",
                dataSource: data.masterRecords.sysCompanies
            });
        });

        //kendoDropDownList for transferSysCompany
        $(`#${masterForm.id} input[type=transferSysCompany]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "COMPANY_ID",
                dataValueField: "COMPANY_ID",
                dataSource: data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID != "RCSHKG_OFF" && a.COMPANY_ID != data.companyId)
            });
        });

        //kendoDropDownList for selectMawb
        $(`#${masterForm.id} input[type=selectMawb]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "MAWB_NO",
                dataValueField: "MAWB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).text()} ...`,
                template: (dataItem) => `${dataItem.MAWB_NO} / ${dataItem.JOB_NO} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
                    ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Hawb/GetMawbs",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.MAWB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectJob
        $(`#${masterForm.id} input[type=selectJob]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "JOB_NO",
                dataValueField: "JOB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).text()} ...`,
                template: function (dataItem) {
                    if (dataItem.MAWB_NO == null) {
                        if (dataItem.DEST_CODE == null)
                            dataItem.DEST_CODE = "-";
                        return `${dataItem.JOB_NO}, ${dataItem.DEST_CODE}, ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`;
                    } else {
                        return `${dataItem.JOB_NO}, ${dataItem.MAWB_NO}, ${dataItem.DEST_CODE}, ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`;
                    }
                },
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Invoice/GetJobNos",
                                    data: {
                                        searchValue: utils.formatText(filterValue),
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.JOB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectLot
        $(`#${masterForm.id} input[type=selectLot]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "LOT_NO",
                dataValueField: "LOT_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).text()} ...`,
                template: (dataItem) => `${dataItem.LOT_NO} / ${dataItem.ORIGIN_CODE} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
                    ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Mawb/GetLotNos",
                                    data: {
                                        searchValue: utils.formatText(filterValue),
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.LOT_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectHawb
        $(`#${masterForm.id} input[type^=selectHawb]`).each(function () {
            let filterValue = "";
            let typeAttr = $(this).attr("type");
            let ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "HAWB_NO",
                dataValueField: "HAWB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).text()} ...`,
                template: (dataItem) => `${dataItem.HAWB_NO} / ${dataItem.MAWB_NO} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
                    ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    //console.log(options.data.filter.filters[0].value, ddl.optionLabel.text());
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: typeAttr == "selectHawb" ? "../Air/Hawb/GetHawbs" : "../Air/Hawb/GetHawbsAllOrigin",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.HAWB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for unUsedBooking
        $(`#${masterForm.id} input[type=unUsedBooking]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "BOOKING_NO",
                dataValueField: "BOOKING_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: ({ BOOKING_NO, ORIGIN_CODE, DEST_CODE, CONSIGNEE_DESC }) => `${BOOKING_NO} / ${ORIGIN_CODE} - ${DEST_CODE} / ${CONSIGNEE_DESC}`,
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
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Hawb/GetUnusedBooking",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
                select: function (e) {
                    var callbackFunction = data.masterForms.filter(a => a.formName == "airHawb")[0]
                        .formGroups.filter(a => a.name == "mainInfo")[0]
                        .formControls.filter(a => a.name == "BOOKING_NO")[0].callbackFunction;
                    eval(`${callbackFunction}(e)`);
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectVoyage
        $(`#${masterForm.id} input[type=selectVoyage]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "VES_DESC",
                dataValueField: "VES_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: ({ VES_DESC, VOYAGE, LOADING_PORT, DISCHARGE_PORT }) => `${VES_DESC} / ${VOYAGE} ${LOADING_PORT} - ${DISCHARGE_PORT}`,
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
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Sea/Voyage/GetVoyages",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
                select: function (e) {
                    let voyage = $(e.sender.element).attr("name").replace("VES_CODE", "VOYAGE");
                    $(`#${masterForm.id} input[name="${voyage}"]`).val(e.dataItem.VOYAGE);

                    let model = {
                        LOADING_PORT: e.dataItem.LOADING_PORT,
                        LOADING_PORT_DATE: e.dataItem.LOADING_PORT_DATE,
                        DISCHARGE_PORT: e.dataItem.DISCHARGE_PORT,
                        DISCHARGE_PORT_DATE: e.dataItem.DISCHARGE_PORT_DATE,
                    };
                    controls.setValuesToFormControls(masterForm, model, true);
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectSeaJob
        $(`#${masterForm.id} input[type=selectSeaJob]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "JOB_NO",
                dataValueField: "JOB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: ({ JOB_NO, VES_DESC, VOYAGE }) => `${JOB_NO} / ${VES_DESC} / ${VOYAGE}`,
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
                            if (filterValue == "")
                                options.success([{ JOB_NO: "New Job#", VES_DESC: "", VOYAGE: "" }]);
                            else {
                                $.ajax({
                                    url: "../Sea/Hbl/GetJobNos",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        let jobNos = [{ JOB_NO: "New Job#", VES_DESC: "", VOYAGE: "" }];
                                        for (var i in result) {
                                            jobNos.push(result[i]);
                                        }
                                        options.success(jobNos);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectHbl
        $(`#${masterForm.id} input[type=selectHbl]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "HBL_NO",
                dataValueField: "HBL_NO",
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
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Sea/Hbl/GetHblNos",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectContainer
        $(`#${masterForm.id} input[type=selectContainer]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "CONTAINER_NO",
                dataValueField: "CONTAINER_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: ({ CONTAINER_NO, SEAL }) => `${CONTAINER_NO} / ${SEAL}`,
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
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Sea/Hbl/GetContainerNos",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for unUsedSeaBooking
        $(`#${masterForm.id} input[type=unUsedSeaBooking]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "BOOKING_NO",
                dataValueField: "BOOKING_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: ({ BOOKING_NO, VES_DESC, VOYAGE, LOADING_PORT, DISCHARGE_PORT }) => `${BOOKING_NO} / ${VES_DESC} / ${VOYAGE} ${LOADING_PORT} - ${DISCHARGE_PORT}}`,
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
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Sea/Booking/GetUnusedBooking",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
                select: function (e) {
                    $.ajax({
                        url: "../Sea/Booking/GetBooking",
                        data: { id: e.dataItem.BOOKING_NO, companyId: data.companyId, frtMode: utils.getFrtMode() },
                        success: function (result) {
                            controls.setValuesToFormControls(masterForm, result, true);
                        }
                    });
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for log files
        $(`#${masterForm.id} input[type=logFiles]`).each(function () {
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                optionLabel: "Select log file",
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: "../Admin/System/GetLogFiles",
                                success: function (result) {
                                    options.success(result);
                                }
                            });
                        },
                    }
                },
                select: function (e) {
                    $.ajax({
                        url: "../Admin/System/GetLog",
                        dataType: "text",
                        data: { fileName: e.dataItem },
                        success: function (result) {
                            $(`#${utils.getFormId()} [name="logContent"]`).html(result.replaceAll("\r\n", "<br>"));
                        }
                    });
                },
            }).data("kendoDropDownList");
        });

        //kendoButton
        $(`#${masterForm.id} button[type=button].customButton`).each(function () {
            var icon = $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1).length == 1 ?
                $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1)[0].replace("button-icon-", "") : "";
            $(this).kendoButton({ icon: icon });
        });

        //kendoDropDownList for currency
        $(`#${masterForm.id} input[type=currency]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "CURR_CODE",
                dataValueField: "CURR_CODE",
                optionLabel: " ",
                dataSource: data.masterRecords.currencies,
                cascade: function (e) {
                    //e.sender._cascadedValue => selected value
                    if (e.userTriggered == true) {
                        testObj = e;
                        var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                        var formControl = utils.getFormControlByName(e.sender.element.attr("name"));
                        if (formControl != null) {
                            if (formControl.exRateName != null) {
                                $(`[name="${formControl.exRateName}"]`).val(exRate);
                            }
                        }
                    }
                },
            });
        });

        //kendoDropDownList for charge template
        $(`#${masterForm.id} input[type=chargeTemplate]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: "Select for charge template...",
                filter: "startswith",
                dataSource: { data: data.masterRecords.chargeTemplates },
                select: function (e) {
                    if (e.dataItem != null) {
                        var templateName = e.dataItem;
                        var grid = $(`#${masterForm.id} [name=${e.sender.element.attr("targetControl")}]`).data("kendoGrid");
                        var cwts = utils.getFormValue("CWTS", e.sender.element);

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
                                //trigger the formula event
                                grid.editCell(`#${utils.getFormId()} [name="${$(grid.element[0]).attr("name")}"] tr:last td:first`);
                                grid.closeCell();
                            }
                        });
                    }
                },
            });
        });

        //kendoDropDownList for Region
        $(`#${masterForm.id} input[type=region]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                optionLabel: " ",
                dataSource: data.masterRecords.region,
            });
        });

        //kendoDropDownList for PACKAGE_UNIT
        $(`#${masterForm.id} input[type=pkgUnit]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.packageUnit
            });
        });

        //kendoDropDownList for ChargeUnit
        $(`#${masterForm.id} input[type=chargeQtyUnit]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.masterRecords.chargeQtyUnit
            });
        });

        //kendoDropDownList for GroupCode
        $(`#${masterForm.id} input[type=groupCode]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                filter: "startswith",
                dataSource: data.masterRecords.groupCodes
            });
        });

        //kendoGrid
        $(`#${masterForm.id} div[type=grid]`).each(function () {
            let editable = { mode: "incell", confirmation: false };
            let controlName = $(this).attr("name");
            let gridConfig = utils.getFormControlByName(controlName.replace("grid_", ""));
            let toolbar = [];
            if (gridConfig.editable == false)
                editable = false;

            if (gridConfig.toolbar == null)
                toolbar = ["create", "cancel"];     //default buttons
            else if (gridConfig.toolbar.length == 0)
                toolbar = null;                     //disable the toolbar if don't want to show (toolbar: [] in the setting js)
            else
                toolbar = gridConfig.toolbar;

            //Calculate the grid width, 
            let gridWidth = 25;     //initial width
            gridConfig.columns.forEach(function (col) {
                gridWidth += col.width == null ? 70 : col.width;
            });
            $(this).kendoGrid({
                toolbar: toolbar,
                columns: gridConfig.columns,
                editable: editable,
                resizable: true,
                navigatable: true,
                width: gridWidth,
                selectable: "cell",
                dataBound: function (e) {

                    //Toolbar custom button events
                    if (toolbar != null) {
                        toolbar.forEach(function (button) {
                            if (button != "create" && button != "cancel") {
                                if (button.callbackFunction != null) {
                                    let formId = utils.getFormId($(e.sender.element));
                                    //remove all bindings for the control, to prevent duplicated events
                                    $(`#${masterForm.id} [name="${controlName}"] button.k-grid-${button.name}`).unbind();
                                    $(`#${masterForm.id} [name="${controlName}"] button.k-grid-${button.name}`).bind("click", function (e) {
                                        eval(`${button.callbackFunction}(e.target)`);
                                    });
                                }
                            }
                        })
                    }

                    if (gridConfig.events != null) {
                        if (gridConfig.events.filter(a => a.eventType == "dataBound").length == 1) {
                            var event = events.filter(a => a.eventType == "dataBound")[0];
                            eval(`${event.callbackFunction}(e)`);
                        }
                    }

                    //Cancel edit will trigger dataBound event, calculate the total amount
                    if (gridConfig.formulas != null) {
                        gridConfig.formulas.forEach(function (formula) {
                            if (formula.fieldName.startsWith("master.")) {
                                var gridCell = $(`#${utils.getFormId()} [name="${controlName}"] tr:last td:first`);
                                controls.gridFormula(gridCell, formula.fieldName, formula.formula);
                            }
                        });
                    }
                },
                cellClose: function (e) {
                    if (gridConfig.formulas != null) {
                        gridConfig.formulas.forEach(function (formula) {
                            controls.gridFormula(e.container, formula.fieldName, formula.formula);
                        });
                    }
                },
                saveChanges: function (e) {
                    e.preventDefault();
                    if (gridConfig.toolbar != null) {
                        if (gridConfig.toolbar.filter(a => a.name == "save").length == 1) {
                            if (gridConfig.toolbar.filter(a => a.name == "save")[0].callbackFunction != null)
                                eval(`${gridConfig.toolbar.filter(a => a.name == "save")[0].callbackFunction}(e)`);
                        }
                    }
                },
                remove: function (e) {
                    e.preventDefault();

                    //calculate the total amount when row deleted
                    if (gridConfig.formulas != null) {
                        gridConfig.formulas.forEach(function (formula) {
                            if (formula.fieldName.startsWith("master.")) {
                                var gridCell = $(`#${utils.getFormId()} [name="${controlName}"] tr:last td:first`);
                                controls.gridFormula(gridCell, formula.fieldName, formula.formula);
                            }
                        });
                    }

                    if (gridConfig.deleteCallbackFunction != null) {
                        eval(`${gridConfig.deleteCallbackFunction}(e)`);
                    }
                },
                change: function (e) {
                    var grid = this;
                    var selectedCell = this.select()[0];
                    if ($(selectedCell).hasClass("link-cell")) {
                        var id = $(selectedCell).text();
                        id = `${gridConfig.linkIdPrefix}_${id}_${data.companyId}_${utils.getFrtMode()}`;
                        controls.append_tabStripMain(`${gridConfig.linkTabTitle} ${$(selectedCell).text()}`, id, gridConfig.linkIdPrefix);
                        grid.clearSelection();
                    }
                },
            });
        });
    }

    //kendoGrid related functions
    gridFormula = function (container, fieldName, formula) {
        //console.log(container, fieldName, formula);
        if (fieldName.startsWith("master.")) {
            if (formula.startsWith("SUM(")) {
                formula = formula.replace("SUM(", "");
                formula = formula.substr(0, formula.length - 1);

                formula.split("{").forEach(function (field) {
                    if (field.length > 0) {
                        var field = field.substring(0, field.indexOf("}"));
                        var sum = 0;
                        if (field.startsWith("master.")) {
                            sum = $(`#${utils.getFormId()} [name="${field.replace("master.", "")}"]`).val();
                        } else {
                            controls.gridGetCellValues(container, field).forEach(function (value) { sum += value });
                        }
                        formula = formula.replace(`{${field}}`, sum);
                    }
                });

                try { $(`#${utils.getFormId()} [name="${fieldName.replace("master.", "")}"]`).val(utils.roundUp(eval(formula), 2)); }
                catch { }
                //console.log(formula, eval(formula));
            }
        } else {
            formula.split("{").forEach(function (field) {
                if (field.length > 0) {
                    var field = field.substring(0, field.indexOf("}"));
                    formula = formula.replace(`{${field}}`, controls.gridGetCellValue(container, field));
                }
            });

            //console.log(formula);

            if (formula.indexOf("*") != -1 || formula.indexOf("/") != -1)
                controls.gridSetCellValue(container, fieldName, utils.roundUp(eval(formula), 2));
            else {
                try {
                    controls.gridSetCellValue(container, fieldName, eval(formula));
                }
                catch {
                    controls.gridSetCellValue(container, fieldName, formula);
                }
            }
        }
    }

    gridGetCellValues = function (container, fieldName) {
        var grid = $(container).closest("div[type=grid]").data("kendoGrid");
        var values = [];

        if (grid != null) {
            grid.dataSource.data().forEach(function (dataItem) {
                if (!utils.isGridRowDeleted(grid, (grid.dataSource.data().indexOf(dataItem)))) {
                    values.push(dataItem[fieldName]);
                }
            })
        }
        return values;
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

    //kendoGrid kendoDropDownList for Charges
    renderGridEditorCharges = function (container, options) {
        var filterValue = options.model.CHARGE_CODE;
        var ddl = $(`<input name="${options.field}" style="width: 80px; margin-right: 5px;" />`);
        var txt = $(`<input name="CHARGE_DESC" style="width: 170px" />`);
        ddl.appendTo(container);
        txt.appendTo(container);
        txt.kendoTextBox();

        ddl.kendoDropDownList({
            autoWidth: true,
            filter: "startswith",
            dataTextField: "CHARGE_DESC_DISPLAY",
            dataValueField: "CHARGE_CODE",
            optionLabel: `Select charges ...`,
            dataSource: {
                type: "json",
                data: data.masterRecords.charges,
            },
            open: function (e) {
                $(e.sender.filterInput).val(filterValue);
            },
            select: function (e) {
                $(txt).data("kendoTextBox").value(e.dataItem.CHARGE_DESC);
                controls.gridSetCellValue(container, "CHARGE_DESC", e.dataItem.CHARGE_DESC);
            }
        });
    }

    //kendoGrid kendoDropDownList for Currency
    renderGridEditorCurrency = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            dataTextField: "CURR_CODE",
            dataValueField: "CURR_CODE",
            dataSource: data.masterRecords.currencies,
            cascade: function (e) {
                //e.sender._cascadedValue => selected value
                if (e.userTriggered == true) {
                    var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                    controls.gridSetCellValue(container, "EX_RATE", exRate);
                }
            },
        });
    }

    //kendoGrid kendoDropDownList for Country
    renderGridEditorCountry = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            filter: "startswith",
            dataTextField: "COUNTRY_DESC_DISPLAY",
            dataValueField: "COUNTRY_CODE",
            dataSource: data.masterRecords.countries,
        });
    }

    //kendoGrid kendoDropDownList for Port
    renderGridEditorPort = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            filter: "startswith",
            dataTextField: "PORT_DESC_DISPLAY",
            dataValueField: "PORT_CODE",
            dataSource: data.masterRecords.ports,
        });
    }

    //kendoGrid kendoDropDownList for SeaPort
    renderGridEditorSeaPort = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            filter: "startswith",
            dataTextField: "PORT_DESC_DISPLAY",
            dataValueField: "PORT_CODE",
            dataSource: data.masterRecords.seaPorts,
        });
    }

    //kendoGrid kendoCheckBox
    renderGridEditorCheckBox = function (container, options) {
        var ckb = $(`<input name="${options.field}" />`);
        ckb.appendTo(container);
        ckb.kendoCheckBox({
            checked: options.model[options.field] == "Y" ? true : false,
        });
    }

    //kendoGrid kendoDropDownList for Package Qty Unit
    renderGridEditorPackageQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.packageUnit
        });
    }

    //kendoGrid kendoDropDownList for Charge Qty Unit
    renderGridEditorChargeQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.chargeQtyUnit
        });
    }

    //kendoGrid kendoDropDownList for Cargo Unit
    renderGridEditorCargoUnits = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.cargoUnits
        });
    }

    //kendoGrid kendoDropDownList for Sea Charge Qty Unit
    renderGridEditorSeaChargeQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.seaChargeQtyUnit
        });
    }

    //kendoGrid kendoDropDownList for Container Size
    renderGridEditorContainerSize = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.containerSize
        });
    }

    //kendoGrid kendoDropDownList for Commodity
    renderGridEditorCommodities = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            filter: "startswith",
            optionLabel: " ",
            dataTextField: "COMMODITY_DESC",
            dataValueField: "COMMODITY_DESC",
            dataSource: data.masterRecords.commodities
        });
    }

    //kendoGrid kendoDropDownList for sea service type
    renderGridEditorService = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.seaServiceType
        });
    }

    //kendoGrid kendoNumericTextBox
    renderGridEditorNumericTextBox = function (container, options, decimals = 2) {
        var format = decimals == 0 ? "n0" : "n";
        var input = $(`<input name="${options.field}" style="width: calc(100% - 3px);" />`);
        input.appendTo(container);
        input.kendoNumericTextBox({
            decimals: decimals,
            restrictDecimals: true,
            format: format,
        });
    }

    //kendoGrid kendoTextArea
    renderGridEditorTextArea = function (container, options) {
        var textArea = $(`<textarea name="${options.field}" style="height: 100%; width: calc(100% - 3px);" />`);
        textArea.appendTo(container);
        textArea.kendoTextArea({
            rows: 8,
            maxLength: 1000
        });
    }

    //kendoGrid special controls from Loadplan Equipments
    renderGridEditorLoadplanEquipHawbNos = function (container, options) {
        var formId = utils.getFormId($(container));
        var gridHawbList = $(`#${formId} [name="grid_LoadplanHawbListViews"]`).data("kendoGrid");
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataTextField: "HAWB_NO",
            dataValueField: "HAWB_NO",
            dataSource: gridHawbList.dataSource.data(),
        });
    }

    //kendoGrid special controls from HBL container#
    renderGridEditorHblContainerNo = function (container, options) {
        let formId = utils.getFormId($(container));
        let gridHblCargo = $(`#${formId} [name="grid_SeaHblContainers"]`).data("kendoGrid");
        let ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataTextField: "CONTAINER_NO",
            dataValueField: "CONTAINER_NO",
            dataSource: gridHblCargo.dataSource.data(),
        });
    }

    renderGridEditorLoadplanEquips = function (container, options) {
        var cbb = $(`<input name="${options.field}" style="width: 80px; height: 25.6px; margin-right: 5px;" />`);
        var txt = $(`<input name="EQUIP_DESC" style="width: 150px" />`);
        cbb.appendTo(container);
        txt.appendTo(container);

        txt.kendoTextBox();
        cbb.kendoComboBox({
            autoWidth: true,
            size: "small",
            dataSource: data.masterRecords.equipCodes
        });
    }

    renderGridEditorBranch = function (container, options) {
        var formId = utils.getFormId($(container));
        var gridCustomerName = $(`#${formId} [name="grid_CustomerNames"]`).data("kendoGrid");
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            optionLabel: " ",
            dataTextField: "BRANCH_CODE",
            dataValueField: "BRANCH_CODE",
            dataSource: gridCustomerName.dataSource.data(),
        });
    }

    renderGridEditorShortDesc = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        var formId = utils.getFormId($(container));
        var gridCustomerName = $(`#${formId} [name="grid_CustomerNames"]`).data("kendoGrid");
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            optionLabel: " ",
            dataTextField: "SHORT_DESC",
            dataValueField: "SHORT_DESC",
            dataSource: gridCustomerName.dataSource.data(),
        });
    }

    gridAutoFitColumns = function (grid) {
        //kendoTabStrip animation issue, disable the animation of the tabStrip will not need the setTimeout anymore
        //setTimeout(function () {
        var colMaxWidth = grid.thead.find("th").length > 5 ? 280 : 600;
        var row = [];
        var colIndex = 0;
        var tableWidth = 0;
        var font = utils.getCanvasFont(grid.thead.find(".k-column-title")[0]);

        //get the text width from table header
        grid.thead.find("th").each(function () {
            if (this.style.display != "none") {
                var width = utils.getTextWidth(this.innerText, font) + 18;
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
        });

        //}, 100);
    }

    voidConfirmClick = function () {
        let masterForm = utils.getMasterForm();
        let modelData = JSON.parse($(`#${masterForm.id}`).attr("modelData"));
        if (modelData[masterForm.idField] != null) {
            let model = {
                COMPANY_ID: data.companyId,
                FRT_MODE: utils.getFrtMode(),
                IS_VOIDED: "Y",
                VOIDED_USER: data.user.USER_ID,
                VOIDED_DATE: utils.convertDateToISOString(new Date()),
            };
            $.ajax({
                url: masterForm.voidUrl,
                type: "post",
                data: { id: modelData[masterForm.idField], model: model },
                beforeSend: function () {
                    kendo.ui.progress($(`#${masterForm.id}`), true);
                },
                success: function (result) {
                    utils.addVoidOverlay(`#${masterForm.id}`);
                    utils.showNotification("Record voided.", "success");
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Save failed, please contact system administrator!", "error");
                },
                complete: function () {
                    kendo.ui.progress($(`#${masterForm.id}`), false);
                }
            });
        }
    }
}