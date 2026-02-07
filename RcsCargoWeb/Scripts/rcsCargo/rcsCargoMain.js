var loadingCount = 0;
var data;
var utils;
var controls;
var controllers = {};
var testObj, testObj1, testObj2;

$(document).ready(function () {
    loadingCount = 0;
    $.ajaxSetup({
        type: "post",
        dataType: "json",
        cache: false,
        headers: { token: localStorage.token },
        complete: function (request) {
            if (request.status == "401") {
                console.log(request.status, "Unauthorized Request, redirect to Login");
                //Unauthorized Request, redirect to Login
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.open("../Home/Login", "_self");
            }
        }
    });

    loadScripts().then(function () {
        setTimer();
    });
});

function loadingProgress() {
    const maxCount = 32;
    if (loadingCount > maxCount)
        return;

    loadingCount++;
    //console.log('Loading count: ' + loadingCount);
    $('.progress .progress-bar').attr('style', `width: ${loadingCount * (100 / maxCount)}%`);
    $('.progress .progress-bar').text(`${(loadingCount * (100 / maxCount)).toFixed()}%`);

    if (loadingCount >= maxCount)
        $(".loadingOverlay").addClass("hidden");
}

async function loadScripts() {
    //$("div.wrapper .content-wrapper").html("");

    //Disable cache for script files
    let version = localStorage.scriptVersion;
    data = new ((await import(`../../Scripts/rcsCargo/data.js?v=${version}`)).default); loadingProgress();
    utils = new ((await import(`../../Scripts/rcsCargo/utils.js?v=${version}`)).default); loadingProgress();
    controls = new ((await import(`../../Scripts/rcsCargo/controls.js?v=${version}`)).default); loadingProgress();

    controllers.masterRecords = new ((await import(`../../Scripts/rcsCargo/masterRecords.js?v=${version}`)).default); loadingProgress();
    controllers.fileStation = new ((await import(`../../Scripts/rcsCargo/fileStation.js?v=${version}`)).default); loadingProgress();
    controllers.customer = new ((await import(`../../Scripts/rcsCargo/customer.js?v=${version}`)).default); loadingProgress();
    controllers.chargeTemplate = new ((await import(`../../Scripts/rcsCargo/chargeTemplate.js?v=${version}`)).default); loadingProgress();
    controllers.airMawb = new ((await import(`../../Scripts/rcsCargo/airMawb.js?v=${version}`)).default); loadingProgress();
    controllers.airBooking = new ((await import(`../../Scripts/rcsCargo/airBooking.js?v=${version}`)).default); loadingProgress();
    controllers.airHawb = new ((await import(`../../Scripts/rcsCargo/airHawb.js?v=${version}`)).default); loadingProgress();
    controllers.airInvoice = new ((await import(`../../Scripts/rcsCargo/airInvoice.js?v=${version}`)).default); loadingProgress();
    controllers.airPv = new ((await import(`../../Scripts/rcsCargo/airPv.js?v=${version}`)).default); loadingProgress();
    controllers.airBatchPv = controllers.airPv;
    controllers.airOtherJob = new ((await import(`../../Scripts/rcsCargo/airOtherJob.js?v=${version}`)).default); loadingProgress();
    controllers.airReport = new ((await import(`../../Scripts/rcsCargo/airReport.js?v=${version}`)).default); loadingProgress();
    controllers.airTransfer = new ((await import(`../../Scripts/rcsCargo/airTransfer.js?v=${version}`)).default); loadingProgress();
    controllers.seaBooking = new ((await import(`../../Scripts/rcsCargo/seaBooking.js?v=${version}`)).default); loadingProgress();
    controllers.seaHbl = new ((await import(`../../Scripts/rcsCargo/seaHbl.js?v=${version}`)).default); loadingProgress();
    controllers.seaSob = new ((await import(`../../Scripts/rcsCargo/seaSob.js?v=${version}`)).default); loadingProgress();
    controllers.seaInvoice = new ((await import(`../../Scripts/rcsCargo/seaInvoice.js?v=${version}`)).default); loadingProgress();
    controllers.seaPv = new ((await import(`../../Scripts/rcsCargo/seaPv.js?v=${version}`)).default); loadingProgress();
    controllers.seaReport = new ((await import(`../../Scripts/rcsCargo/seaReport.js?v=${version}`)).default); loadingProgress();
    controllers.seaTransfer = new ((await import(`../../Scripts/rcsCargo/seaTransfer.js?v=${version}`)).default); loadingProgress();
    controllers.accounting = new ((await import(`../../Scripts/rcsCargo/accounting.js?v=${version}`)).default); loadingProgress();
    controllers.sysConsole = new ((await import(`../../Scripts/rcsCargo/sysConsole.js?v=${version}`)).default); loadingProgress();

    data.scriptVersion = await $.ajax({ url: "../Home/GetScriptVersion", dataType: "text" }); loadingProgress();
    localStorage.scriptVersion = data.scriptVersion;
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
                    localStorage.token = result.token;
                    data.token = result.token;
                } else if (result.result == "error") {
                    //handle session timeout and re-login later...
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    window.open("../Home/Login", "_self");
                }
            }
        });

        //run the prefetchGlobalVariables every 60 minutes
        if (Math.floor((new Date - data.masterRecords.lastUpdateTime) / 60000) >= 60) {
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