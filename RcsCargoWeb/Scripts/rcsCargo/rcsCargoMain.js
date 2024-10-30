var data;
var utils;
var controls;
var controllers = {};
var testObj, testObj1, testObj2;

$(document).ready(function () {
    $.ajaxSetup({
        type: "post",
        dataType: "json",
        cache: false
    });

    loadScripts().then(function () {
        setTimer();
    });
});

async function loadScripts() {
    //$("div.wrapper .content-wrapper").html("");

    //Disable cache for script files
    let version = kendo.toString(new Date(), "yyyyMMddHHmmss");
    //let msg = new ((await import('message.js')).default)("Barry");    Example for passing values to the constructor
    data = new ((await import(`../../Scripts/rcsCargo/data.js?v=${version}`)).default);
    utils = new ((await import(`../../Scripts/rcsCargo/utils.js?v=${version}`)).default);
    controls = new ((await import(`../../Scripts/rcsCargo/controls.js?v=${version}`)).default);
    //controls.index = new ((await import(`../../Scripts/rcsCargo/controls.index.js?v=${version}`)).default);
    //controls.edit = new ((await import(`../../Scripts/rcsCargo/controls.edit.js?v=${version}`)).default);
    //controls.kendo = new ((await import(`../../Scripts/rcsCargo/controls.kendo.js?v=${version}`)).default);

    controllers.masterRecords = new ((await import(`../../Scripts/rcsCargo/masterRecords.js?v=${version}`)).default);
    controllers.airMawb = new ((await import(`../../Scripts/rcsCargo/airMawb.js?v=${version}`)).default);
    controllers.airBooking = new ((await import(`../../Scripts/rcsCargo/airBooking.js?v=${version}`)).default);
    controllers.airHawb = new ((await import(`../../Scripts/rcsCargo/airHawb.js?v=${version}`)).default);
    controllers.airInvoice = new ((await import(`../../Scripts/rcsCargo/airInvoice.js?v=${version}`)).default);
    controllers.airPv = new ((await import(`../../Scripts/rcsCargo/airPv.js?v=${version}`)).default);
    controllers.airReport = new ((await import(`../../Scripts/rcsCargo/airReport.js?v=${version}`)).default);
    controllers.sysConsole = new ((await import(`../../Scripts/rcsCargo/sysConsole.js?v=${version}`)).default);

    $.ajax({
        url: "../Home/GetScriptVersion",
        dataType: "text",
        success: function (result) { data.scriptVersion = result },
    });
}

function setTimer() {
    //send request to server to keep session alive and also get the status
    if (data.intervalId != null) {
        clearInterval(data.intervalId);
        data.intervalId = null;
    }

    data.intervalId = setInterval(function () {
        $.ajax({
            url: "/Admin/Account/GetSessionStatus",
            type: "post",
            dataType: "json",
            data: { userId: data.user.USER_ID },
            success: function (result) {
                //console.log(result);
                if (result.result == "success") {
                    localStorage.sessionId = result.sessionId;
                    data.sessionId = result.sessionId;
                } else if (result.result == "error") {
                    //handle session timeout and re-login later...
                    localStorage.removeItem("user");
                    localStorage.removeItem("sessionId");
                    window.open("../Home/Login", "_self");
                }
            }
        });

        //run the prefetchGlobalVariables every 10 minutes
        if (Math.floor((new Date - data.masterRecords.lastUpdateTime) / 60000) >= 10) {
            data.prefetchGlobalVariables();
        }

        $.ajax({
            url: "../Home/GetScriptVersion",
            dataType: "text",
            success: function (result) {
                if (result != data.scriptVersion) {
                    console.log("Update script from server", data.scriptVersion, result);
                    loadScripts();
                }
            },
        });
    }, 1000 * 60);
}