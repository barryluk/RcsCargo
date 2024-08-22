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
            el = $(".k-tabstrip-content.k-content.k-active").find(`[name=${fieldName}]`);

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

    getFormId = function () {
        if ($(`.k-tabstrip-content.k-content.k-active div[id]`).length == 1)
            return $(`.k-tabstrip-content.k-content.k-active div[id]`).attr("id");
        else
            return null;
    }

    getFrtMode = function () {
        if ($(`.k-tabstrip-content.k-content.k-active div[name=frtMode]`).length == 1) {
            return $(`.k-tabstrip-content.k-content.k-active div[name=frtMode]`)
                .find(".k-selected .k-button-text").text() == "Export" ? "AE" : "AI";
        } else if ($(`.k-tabstrip-content.k-content.k-active input[name=FRT_MODE]`).length == 1) {
            return $(`.k-tabstrip-content.k-content.k-active input[name=FRT_MODE]`).val();
        } else
            return null;
    }

    getExRate = function (currCode) {
        var exRate;
        data.currencies.forEach(function (currency) {
            if (currency.CURR_CODE == currCode) {
                exRate = currency.EX_RATE;
            }
        });
        return exRate;
    }

    //Common JS functions
    isEmptyString = function (str) {
        return (!str || 0 === str.length);
    }

    convertJsonToDate = function (str) {
        try {
            return new Date(parseInt(str.replace("/Date(", "").replace(")/", ""), 10));
        } catch (e) {
            return "";
        }
    }

    convertDateToISOString = function (date) {
        return date.toISOString();
    }

    roundUp = function (value, decimals) {
        value = value * Math.pow(10, decimals);
        value = Math.round(value);
        return (value / Math.pow(10, decimals));
    }

    formatMawbNo = function (mawbNo) {
        if (mawbNo.length == 11) {
            return mawbNo.substr(0, 3) + "-" + mawbNo.substr(3, 4) + " " + mawbNo.substr(7);
        } else {
            return mawbNo;
        }
    }

    formatText = function (value) {
        return value.trim();
    }

    formatDateTime = function (value, dateFormat) {
        var date = kendo.parseDate(value);
        if (date != null) {
            return kendo.toString(date, dateFormat);
        }
    }

    addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}