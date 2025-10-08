var data;
var utils;
var controls;
var controllers = {};
var testObj, testObj1, testObj2;

$(document).ready(function () {
    $.ajaxSetup({
        type: "post",
        dataType: "json",
        cache: false,
        headers: { token: localStorage.sessionId },
        complete: function (request) {
            if (request.status == "401") {
                console.log(request.status, "Unauthorized Request, redirect to Login");
                //Unauthorized Request, redirect to Login
                localStorage.removeItem("user");
                localStorage.removeItem("sessionId");
                window.open("../Home/Login", "_self");
            }
        }
    });

    loadScripts().then(function () {
        setTimer();
    });
});

async function loadScripts() {
    //$("div.wrapper .content-wrapper").html("");

    //Disable cache for script files
    let version = kendo.toString(new Date(), "yyyyMMddHHmmss");
    data = new ((await import(`../../Scripts/rcsCargo/data.js`)).default);
    utils = new ((await import(`../../Scripts/rcsCargo/utils.js`)).default);
    controls = new ((await import(`../../Scripts/rcsCargo/controls.js`)).default);

    controllers.masterRecords = new ((await import(`../../Scripts/rcsCargo/masterRecords.js`)).default);
    controllers.fileStation = new ((await import(`../../Scripts/rcsCargo/fileStation.js`)).default);
    controllers.customer = new ((await import(`../../Scripts/rcsCargo/customer.js`)).default);
    controllers.chargeTemplate = new ((await import(`../../Scripts/rcsCargo/chargeTemplate.js`)).default);
    controllers.airMawb = new ((await import(`../../Scripts/rcsCargo/airMawb.js`)).default);
    controllers.airBooking = new ((await import(`../../Scripts/rcsCargo/airBooking.js`)).default);
    controllers.airHawb = new ((await import(`../../Scripts/rcsCargo/airHawb.js`)).default);
    controllers.airInvoice = new ((await import(`../../Scripts/rcsCargo/airInvoice.js`)).default);
    controllers.airPv = new ((await import(`../../Scripts/rcsCargo/airPv.js`)).default);
    controllers.airBatchPv = controllers.airPv;
    controllers.airOtherJob = new ((await import(`../../Scripts/rcsCargo/airOtherJob.js`)).default);
    controllers.airReport = new ((await import(`../../Scripts/rcsCargo/airReport.js`)).default);
    controllers.airTransfer = new ((await import(`../../Scripts/rcsCargo/airTransfer.js`)).default);
    controllers.seaBooking = new ((await import(`../../Scripts/rcsCargo/seaBooking.js`)).default);
    controllers.seaHbl = new ((await import(`../../Scripts/rcsCargo/seaHbl.js`)).default);
    controllers.seaSob = new ((await import(`../../Scripts/rcsCargo/seaSob.js`)).default);
    controllers.seaInvoice = new ((await import(`../../Scripts/rcsCargo/seaInvoice.js`)).default);
    controllers.seaPv = new ((await import(`../../Scripts/rcsCargo/seaPv.js`)).default);
    controllers.seaReport = new ((await import(`../../Scripts/rcsCargo/seaReport.js`)).default);
    controllers.seaTransfer = new ((await import(`../../Scripts/rcsCargo/seaTransfer.js`)).default);
    controllers.accounting = new ((await import(`../../Scripts/rcsCargo/accounting.js`)).default);
    controllers.sysConsole = new ((await import(`../../Scripts/rcsCargo/sysConsole.js`)).default);

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
            data: {
                userId: data.user.USER_ID,
                companyId: data.companyId
            },
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