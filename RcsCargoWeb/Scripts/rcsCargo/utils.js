export default class {
    constructor() {
    }

    getTextWidth = function (text, font) {
        // re-use canvas object for better performance
        const canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }

    getCssStyle = function (element, prop) {
        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }

    getCanvasFont = function (el = document.body) {
        const fontWeight = this.getCssStyle(el, 'font-weight') || 'normal';
        const fontSize = this.getCssStyle(el, 'font-size') || '16px';
        const fontFamily = this.getCssStyle(el, 'font-family') || 'Times New Roman';

        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }

    getFormValue = function (fieldName, container, dataType = "string") {
        var el;
        if (!this.isEmptyString(container))
            el = $(container).parentsUntil("div.container-fluid").find(`[name=${fieldName}]`);
        else
            el = $("[id^=tabStripMain-].k-tabstrip-content.k-content.k-active").find(`[name=${fieldName}]`);

        var value;
        if (el.length > 0) {
            value = el.eq(0).val();

            if (value == null) {
                if (dataType == "string")
                    value = "";
                else if (dataType == "number")
                    value = 0;
            }
        } else {
            //special case for CWTS
            if (fieldName == "CWTS") {
                var elGwts = $(container).parentsUntil("div.container-fluid").find(`[name=GWTS]`);
                var elVwts = $(container).parentsUntil("div.container-fluid").find(`[name=VWTS]`);
                if (elGwts.length > 0 && elVwts.length > 0) {
                    var gwts = this.isEmptyString(elGwts.eq(0).val()) ? 0 : elGwts.eq(0).val();
                    var vwts = this.isEmptyString(elVwts.eq(0).val()) ? 0 : elVwts.eq(0).val();
                    if (gwts > vwts)
                        value = gwts;
                    else
                        value = vwts;
                }
            }
        }
        return value;
    }

    getEditMode = function (selector) {
        var formId = utils.getFormId(selector);
        if (formId.indexOf("NEW") == -1)
            return "edit";
        else
            return "create";
    }

    getFormId = function (selector) {
        if ($(".kendo-window-alertMessage").length == 1) {
            if ($(".kendo-window-alertMessage [name=kendo-window-alertMessage-content] div[id]").length == 1) {
                return $(".kendo-window-alertMessage [name=kendo-window-alertMessage-content] div[id]").attr("id");
            }
        }

        if (selector != null) {
            var els = $(selector).parentsUntil("#tabStripMain");
            //return els.eq(els.length - 2).attr("id");
            return els.children().closest("div").not(".k-loading-mask").attr("id");
        } else {
            if ($(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[id]`).length > 0)
                return $(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[id]`).first().attr("id");
            else
                return null;
        }
    }

    getMasterFormId = function (selector) {
        if (selector != null) {
            var els = $(selector).parentsUntil("#tabStripMain");
            //return els.eq(els.length - 2).attr("id");
            return els.children().closest("div").not(".k-loading-mask").attr("id");
        } else {
            if ($(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[id]`).length > 0)
                return $(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[id]`).first().attr("id");
            else
                return null;
        }
    }

    getFrtMode = function (selector) {
        var frtMode = null;
        if (selector != null) {
            var values = selector.split("_");
            frtMode = values[values.length - 1];
        }
        //Index page frtMode
        if ($(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[name=frtMode]`).length == 1) {
            return $(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[name=frtMode]`)
                .find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI";
        }
        //Edit page frtMode
        if ($(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active span.toolbar-frtMode`).length == 1) {
            return $(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active span.toolbar-frtMode`)
                .find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI";
        }
        if ($(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active input[name=FRT_MODE]`).length > 0) {
            frtMode = $(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active input[name=FRT_MODE]`).first().val();
        }
        if ($(`[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[id]`).length > 0) {
            var values = $("[id^=tabStripMain-].k-tabstrip-content.k-content.k-active div[id]").first().attr("id").split("_");
            frtMode = values[values.length - 1];
        }
        return frtMode;
    }

    getExRate = function (currCode) {
        var exRate;
        data.masterRecords.currencies.forEach(function (currency) {
            if (currency.CURR_CODE == currCode) {
                exRate = currency.EX_RATE;
            }
        });
        return exRate;
    }

    getMasterForm = function (selector) {
        let formId = utils.getFormId(selector);
        if (formId.indexOf("Index") == -1) {
            let masterForm = data.masterForms.filter(a => a.formName == formId.split("_")[0])[0];
            masterForm.id = formId;
            masterForm.mode = utils.getEditMode(selector);
            return masterForm;
        } else {
            let indexPage = data.indexPages.filter(a => a.pageName == formId.split("_")[0].replace("Index", ""))[0];
            indexPage.id = formId;
            return indexPage;
        }
    }

    getMasterFormByName = function (name) {
        var masterForm = {}
        if (name.endsWith("Index"))
            masterForm = data.indexPages.filter(a => a.pageName == name.replace("Index", ""))[0];
        else
            masterForm = data.masterForms.filter(a => a.formName == name)[0];

        return masterForm;
    }

    getIndexFormControlByName = function (name) {
        var indexForm = data.indexPages.filter(a => a.pageName == utils.getFormId().split("_")[0].replace("Index", ""))[0];
        var formControl = {};
        if (indexForm != null) {
            for (var attr in indexForm) {
                if (attr == name)
                    formControl = indexForm[attr];
            }
        }
        return formControl;
    }

    getFormControlByName = function (name) {
        let masterForm = data.masterForms.filter(a => a.formName == utils.getFormId().split("_")[0])[0];
        let pageSetting = data.indexPages.filter(a => a.pageName == utils.getFormId().split("_")[0].replace("Index", ""))[0];
        let formControl = {};
        if (masterForm != null) {
            masterForm.formGroups.forEach(function (group) {
                if (group.formControls.filter(a => a.name == name).length == 1)
                    formControl = group.formControls.filter(a => a.name == name)[0];
            });
        }
        if (pageSetting != null) {
            if (pageSetting.searchControls.filter(a => a.name == name).length == 1)
                formControl = pageSetting.searchControls.filter(a => a.name == name)[0];

            if (pageSetting.groups != null) {
                pageSetting.groups.forEach(function (group) {
                    if (group.controls.filter(a => a.name == name).length == 1)
                        formControl = group.controls.filter(a => a.name == name)[0];
                });
            }
        }
        return formControl;
    }

    calcVwts = function (length, width, height, ctns) {
        var vwtsFactor = utils.getFormValue("VWTS_FACTOR") == null ? 6000 : utils.getFormValue("VWTS_FACTOR");
        var vwts = utils.roundUp(((length * width * height * ctns) / vwtsFactor), 3);
        return vwts;
    }

    //Common JS functions
    isEmptyString = function (str) {
        if (str == null)
            return true;

        if (str.toString().trim().length == 0)
            return true;
        else
            return false;
    }

    removeNullString = function (str) {
        try {
            str = str.replaceAll("null", "");
            str = str.trim();
            if (str.startsWith("<br>"))
                str = str.substr(4);
            if (str.endsWith("<br>"))
                str = str.substr(0, str.length - 4);
            return str.trim();
        } catch {
            return "";
        }
    }

    convertJsonToDate = function (str) {
        try {
            return new Date(parseInt(str.replace("/Date(", "").replace(")/", ""), 10));
        } catch (e) {
            return "";
        }
    }

    convertDateToISOString = function (date) {
        try {
            return date.toISOString();
        } catch {
            return null;
        }
    }

    roundUp = function (value, decimals) {
        value = value * Math.pow(10, decimals);
        value = Math.round(value);
        return (value / Math.pow(10, decimals));
    }

    encodeId = function (id) {
        id = id.replaceAll("/", "-slash-");
        id = id.replaceAll("\\", "-backslash-");
        id = id.replaceAll(" ", "-space-");
        id = id.replaceAll("(", "-lbracket-");
        id = id.replaceAll(")", "-rbracket-");
        return id;
    }

    decodeId = function (id) {
        id = id.replaceAll("-slash-", "/");
        id = id.replaceAll("-backslash-", "\\");
        id = id.replaceAll("-space-", " ");
        id = id.replaceAll("-lbracket-", "(");
        id = id.replaceAll("-rbracket-", ")");
        return id;
    }

    parseDate = function (value) {
        try {
            return kendo.parseDate(value);
        } catch { return null; }
    }

    formatDateTime = function (dataItem, format = "date") {
        if (format == "date")
            format = data.dateFormat;
        else if (format == "dateTime")
            format = data.dateTimeFormat;
        else if (format == "dateTimeLong")
            format = data.dateTimeLongFormat;

        return utils.isEmptyString(dataItem) ? "" : kendo.toString(kendo.parseDate(dataItem), format);
    }

    formatMawbNo = function (mawbNo) {
        try {
            if (mawbNo.length == 11) {
                return mawbNo.substr(0, 3) + "-" + mawbNo.substr(3, 4) + " " + mawbNo.substr(7);
            } else {
                return mawbNo;
            }
        } catch {
            return mawbNo;
        }
    }

    formatGridData = function (grid, gridConfig, idField, idValue) {
        var dsData = grid.dataSource.data();
        var gridRows = grid.items();
        var gridData = [];
        var lineNo = 1;

        dsData.forEach(function (item) {
            var rowData = {};
            rowData["LINE_NO"] = lineNo;
            for (var field in gridConfig.fields) {
                if (gridConfig.fields[field].controlType == "checkBox") {
                    if (item[field] == "true" || item[field] == "Y")
                        rowData[field] = "Y";
                    else
                        rowData[field] = "N";
                } else {
                    if (utils.isEmptyString(item[field]) && gridConfig.fields[field].defaultValue != null)
                        rowData[field] = gridConfig.fields[field].defaultValue;
                    else {
                        if (gridConfig.fields[field].type == "date") {
                            if (item[field] != null)
                                rowData[field] = utils.convertDateToISOString(item[field]);
                            else
                                rowData[field] = "";
                        }
                        else
                            rowData[field] = utils.formatText(item[field]);
                    }
                }
                if (gridConfig.fields[field].type == "lineNo")
                    rowData[field] = lineNo;

                if (field == "CREATE_USER" || field == "MODIFY_USER")
                    rowData[field] = data.user.USER_ID;
            }

            if (idField != null) {
                if (idField == "MAWB")
                    rowData["MAWB_NO"] = idValue;
                else
                    rowData[idField] = idValue;
            }
            rowData["COMPANY_ID"] = data.companyId;
            rowData["FRT_MODE"] = utils.getFrtMode();

            //console.log(dsData.indexOf(item), utils.isGridRowDeleted(grid, dsData.indexOf(item)));
            if (!utils.isGridRowDeleted(grid, dsData.indexOf(item))) {
                gridData.push(rowData);
                lineNo++;
            }
        });

        //console.log(gridData);
        return gridData;
    }

    //If record is deleted from the grid, the <tr> element will have style: "display: none;"
    isGridRowDeleted = function (grid, rowIndex) {
        var gridRow = grid.items()[rowIndex];
        if ($(gridRow).attr("style") == "display: none;")
            return true;
        else
            return false;
    }

    isHiddenTab = function (selector) {
        var id = $(selector).parentsUntil(".k-tabstrip-content.k-content").parent().eq(0).attr("aria-labelledby");
        return $(`#${id}`).attr("style") == "display: none";
    }

    isExisitingChargeTemplateName = function (templateName) {
        var serverResult = "";
        $.ajax({
            url: "../MasterRecord/ChargeTemplate/IsExisitingChargeTemplateName",
            dataType: "text",
            data: { id: utils.formatText(templateName), companyId: data.companyId },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingChargeCode = function (chargeCode) {
        var serverResult = "";
        $.ajax({
            url: "../MasterRecord/Charge/IsExistingChargeCode",
            dataType: "text",
            data: { id: utils.formatText(chargeCode) },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingCountryCode = function (countryCode) {
        var serverResult = "";
        $.ajax({
            url: "../MasterRecord/Country/IsExistingCountryCode",
            dataType: "text",
            data: { id: utils.formatText(countryCode) },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingPortCode = function (portCode) {
        var serverResult = "";
        $.ajax({
            url: "../MasterRecord/Port/IsExistingPortCode",
            dataType: "text",
            data: { id: utils.formatText(portCode) },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingAirlineCode = function (airlineCode) {
        var serverResult = "";
        $.ajax({
            url: "../MasterRecord/Airline/IsExistingAirlineCode",
            dataType: "text",
            data: { id: utils.formatText(airlineCode) },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingCurrencyCode = function (currencyCode) {
        var serverResult = "";
        $.ajax({
            url: "../MasterRecord/Currency/IsExistingCurrencyCode",
            dataType: "text",
            data: { id: utils.formatText(currencyCode), companyId: data.companyId },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingBookingNo = function (bookingNo) {
        var serverResult = "";
        $.ajax({
            url: "../Air/Booking/IsExistingBookingNo",
            dataType: "text",
            data: { id: bookingNo, companyId: data.companyId, frtMode: utils.getFrtMode() },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isExistingMawbNo = function (mawbNo) {
        var serverResult = "";
        $.ajax({
            url: "../Air/Mawb/IsExistingMawbNo",
            dataType: "text",
            data: { id: mawbNo, companyId: data.companyId, frtMode: utils.getFrtMode() },
            async: false,
            success: function (result) {
                serverResult = result;
            }
        });

        return serverResult == "True" ? true : false;
    }

    isValidMawbNo = function (value) {
        if (this.isInteger(value)) {
            if (value.length == 11) {
                var v_firstMAWB = value.substr(3, 7);
                var v_lastMAWB = value.substr(10, 1);
                var v_remainder = v_firstMAWB % 7;

                if (v_remainder != v_lastMAWB) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else if (value != "") {
                return false;
            }
        }
        else {
            return false;
        }
    }

    isInteger = function (value) {
        var integer = "0123456789";
        for (var i = 0; i < value.toString().length; i++) {
            if (integer.indexOf(value.toString().substr([i], 1)) == -1)
                return false;
        }
        return true;
    }

    formatText = function (value) {
        try {
            return value.toUpperCase().trim();
        } catch {
            return value;
        }
    }

    formatSearchText = function (value) {
        try {
            return value.toUpperCase().trim() + "%";
        } catch {
            return value;
        }
    }

    formatDateTime = function (value, dateFormat) {
        var date = kendo.parseDate(value);
        if (date != null) {
            return kendo.toString(date, dateFormat);
        }
    }

    removeSpecialCharacters = function (value) {
        value = value.replaceAll("/", "").replaceAll("\"", "");

        return value;
    }

    addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    validatorErrorTemplate = function (message) {
        return `
            <div class="k-widget k-tooltip k-tootip-error red-tooltip">
                <span class="k-icon k-i-warning">&nbsp;</span>${message}
                <div class="k-callout k-callout-n"></div>
            </div>`;
    }

    showValidateNotification = function (msg, element) {
        if (element != null) {
            var top = $(element).offset().top - 15;
            var left = $(element).offset().left + 20;
            $("#notification").data("kendoNotification").options.position.top = top;
            $("#notification").data("kendoNotification").options.position.left = left;
        }
        $("#notification").data("kendoNotification").show(msg, "error");
    }

    //type: "info", "success", "warning", "error"
    showNotification = function (msg, type = "info", element) {
        if (element != null) {
            var top = $(element).offset().top + 35;
            var left = $(element).offset().left - (18 + msg.length * 5);
            $("#notification").data("kendoNotification").options.position.top = top;
            $("#notification").data("kendoNotification").options.position.left = left;
        }
        $("#notification").data("kendoNotification").show(msg, type);
    }

    addVoidOverlay = function (element) {
        if (element != null) {
            let height = $(element).height();
            let html = `
                <div class="voidOverlay" style="z-index: 10000; position: absolute; width: calc(100% - 20px); height: ${height}px; background-color: rgb(128, 128, 128, 0.2);">
                    <img src="../Content/img/void.png" style="position: absolute; opacity: 0.5; top: 20%; left: calc(50% - 200px); width: 300px"/>
                </div>`;
            $(element).before(html);
            $(element).parent().css("background-color", "rgb(128, 128, 128, 0.2)");
        }
    }

    //type: "info", "warning", "error", size: "small", "medium", "large"
    alertMessage = function (msg, title, type = "info", size, showCloseButtons = true, callbackFunction) {
        var contentHeight = "100%";
        if (showCloseButtons)
            contentHeight = "calc(100% - 35px)";
        var closeButtons = "";
        if (showCloseButtons) {
            var cancelButton = ``;
            if (callbackFunction != null) {
                cancelButton = `<button type="button" class="customButton button-icon-x-outline" style="width: 80px; margin: 4px;">Cancel</button>`;
            }
            closeButtons = `<div style="text-align: center;">
                    <button type="button" class="customButton button-icon-check-outline" style="width: 80px; margin: 4px;">Ok</button>
                    ${cancelButton}
                </div>`;
        }
        var html = `<div class='kendo-window-alertMessage'>
                <div name="kendo-window-alertMessage-content" style="height: ${contentHeight};">${msg}</div>
                ${closeButtons}
            </div>`;
        var width = null;
        var height = null;
        var icon = "<i class='k-icon k-i-info-circle' style='margin-left: 5px; margin-right: 5px; margin-top: 2px;'></i>";

        if (type == "warning")
            icon = "<i class='k-icon k-i-warning fa-beat-fade' style='margin-left: 5px; margin-right: 10px; margin-top: 2px; color: red; --fa-beat-fade-scale: 1.5'></i>";
        else if (type == "error")
            icon = "<i class='k-icon k-i-x-outline fa-beat-fade' style='margin-left: 5px; margin-right: 10px; margin-top: 2px; color: red; --fa-beat-fade-scale: 1.5'></i>";

        if (utils.isEmptyString(title))
            title = "RCS Cargo System";

        title = `${icon} <b>${title}</b>`;

        if (size == "small") {
            width = "25%";
            height = "25%";
        } else if (size == "medium") {
            width = "45%";
            height = "45%";
        } else if (size == "large") {
            width = "65%";
            height = "65%";
        }

        $(".content-wrapper").append(html);
        var alertWin = $(".kendo-window-alertMessage").kendoWindow({
            title: { text: title, encoded: false },
            modal: true,
            width: width,
            height: height,
            open: function () {
                //var contentHeight = $("[name=kendo-window-alertMessage-content]").height();
                //$(".k-widget.k-window").height(contentHeight + 75);
            },
            close: function (e) {
                alertWin.destroy();
            },
        }).data("kendoWindow");

        alertWin.center().open();

        $(`.kendo-window-alertMessage button[type=button].customButton`).each(function () {
            var icon = $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1).length == 1 ?
                $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1)[0].replace("button-icon-", "") : "";

            $(this).kendoButton({ icon: icon });
            if (icon == "check-outline") {
                if (callbackFunction != null) {
                    $(this).bind("click", function () {
                        eval(`${callbackFunction}(alertWin)`);
                    });
                } else {
                    $(this).bind("click", function () {
                        alertWin.destroy();
                    });
                }
            }
            if (icon == "x-outline") {
                $(this).bind("click", function () {
                    alertWin.destroy();
                });
            }
        });

        return alertWin;
    }

    confirmMessage = function (msg, eventObj, confirmCallback, cancelCallback, title) {
        var html = `<div class='kendo-window-confirmMessage'>
                <div name="kendo-window-confirmMessage-content" style="height: calc(100% - 35px);">${msg}</div>
                <div style="text-align: center;">
                    <button type="button" class="customButton button-icon-check-outline" style="width: 80px; margin: 4px;">Yes</button>
                    <button type="button" class="customButton button-icon-x-outline" style="width: 80px; margin: 4px;">No</button>
                </div>
            </div>`;
        var width = "25%";
        var height = "20%";

        if (utils.isEmptyString(title))
            title = "RCS Cargo System";

        title = `<i class='k-icon k-i-question-circle' style='margin-left: 5px; margin-right: 5px; margin-top: 2px;'></i> <b>${title}</b>`;

        $(".content-wrapper").append(html);
        var confirmWin = $(".kendo-window-confirmMessage").kendoWindow({
            title: { text: title, encoded: false },
            modal: true,
            width: width,
            height: height,
            close: function (e) {
                confirmWin.destroy();
            },
        }).data("kendoWindow");

        confirmWin.center().open();

        $(`.kendo-window-confirmMessage button[type=button].customButton`).each(function () {
            var icon = $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1).length == 1 ?
                $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1)[0].replace("button-icon-", "") : "";
            $(this).kendoButton({ icon: icon });

            if (icon == "check-outline") {
                $(this).bind("click", function () {
                    confirmWin.destroy();
                    if (!utils.isEmptyString(confirmCallback) && eventObj != null) {
                        eval(`${confirmCallback}(eventObj)`);
                    }
                });
            } else if (icon == "x-outline") {
                $(this).bind("click", function () {
                    confirmWin.destroy();
                    if (!utils.isEmptyString(cancelCallback)) {
                        eval(`${cancelCallback}(eventObj)`);
                    }
                });
            }
        });
    }

    getRdlcEncryptString = function (value) {
        var str = "";
        $.ajax({
            url: "../Home/EncryptString",
            data: {value: value},
            dataType: "text",
            async: false,
            success: function (result) { str = result; }
        });
        return str;
    }

    getMultipleRdlcReports = function (reports, downloadFileName) {
        $.ajax({
            url: "../Report/GetMultipleRdlcReports",
            data: { reports: reports, },
            dataType: "text",
            beforeSend: function () { kendo.ui.progress($(".wrapper"), true); },
            success: function (id) { window.open(`../Report/DownloadReport?id=${id}&downloadFilename=${downloadFileName}`); },
            complete: function () { kendo.ui.progress($(".wrapper"), false); }
        });
    }

    getExcelReport = function (reportName, paras, downloadFileName) {
        var extraParas = {};
        if (utils.isEmptyString(downloadFileName))
            downloadFileName = reportName;

        if (reportName == "AirCustomizeShipmentReport")
            extraParas = paras.filter(a => a.name == "SelectedFields")[0].value;

        $.ajax({
            url: "../Report/GetExcelReport",
            data: {
                paras: paras,
                reportName: reportName,
                companyId: data.companyId,
                extraParas: extraParas,
            },
            dataType: "text",
            beforeSend: function () { kendo.ui.progress($(".wrapper"), true); },
            success: function (id) {
                if (reportName == "AirCustomizeShipmentReport")
                    window.open(`../Report/DownloadReport?id=${id}&downloadFilename=${downloadFileName}.xls`);
                else
                    window.open(`../Report/DownloadReport?id=${id}&downloadFilename=${downloadFileName}.xlsx`);
            },
            complete: function () { kendo.ui.progress($(".wrapper"), false); }
        });
    }

    getRdlcExcelReport = function (reportName, paras, downloadFileName) {
        if (utils.isEmptyString(downloadFileName))
            downloadFileName = reportName;

        $.ajax({
            url: "../Report/GetRdlcExcelReport",
            data: {
                paras: paras,
                reportName: reportName,
            },
            dataType: "text",
            beforeSend: function () { kendo.ui.progress($(".wrapper"), true); },
            success: function (id) {
                window.open(`../Report/DownloadReport?id=${id}&downloadFilename=${downloadFileName}.xls`);
            },
            complete: function () { kendo.ui.progress($(".wrapper"), false); }
        });
    }

    getFormControlClass = function (type) {
        var formControlClass = "form-control";
        if (type == null)
            return formControlClass;

        if (type == "date" || type == "dateTime") {
            formControlClass = "form-control-dateTime";
        } else if (type.startsWith("number")) {
            formControlClass = "form-control-number";
        } else if (data.dropdownlistControls.includes(type)) {
            formControlClass = "form-control-dropdownlist";
        } else if (type == "textArea") {
            formControlClass = "form-control-textArea";
        } else if (type == "switch") {
            formControlClass = "";
        }
        return formControlClass;
    }

    getFormControlType = function (type) {
        var formControlType = "input";
        if (type == null)
            return formControlType;

        if (type == "textArea") {
            formControlType = "textarea";
        } else if (type == "dateRange" || type == "buttonGroup") {
            formControlType = "div";
        }
        return formControlType;
    }
}