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

    async function loadScripts() {
        //Disable cache for script files
        let version = Math.random();
        //let msg = new ((await import('message.js')).default)("Barry");    Example for passing values to the constructor
        data = new ((await import(`../../Scripts/rcsCargo/data.js?v=${version}`)).default);
        utils = new ((await import(`../../Scripts/rcsCargo/utils.js?v=${version}`)).default);
        controls = new ((await import(`../../Scripts/rcsCargo/controls.js?v=${version}`)).default);
        controls.index = new ((await import(`../../Scripts/rcsCargo/controls.index.js?v=${version}`)).default);
        controls.edit = new ((await import(`../../Scripts/rcsCargo/controls.edit.js?v=${version}`)).default);
        controls.kendo = new ((await import(`../../Scripts/rcsCargo/controls.kendo.js?v=${version}`)).default);

        controllers.airMawb = new ((await import(`../../Scripts/rcsCargo/airMawb.js?v=${version}`)).default);
        controllers.airBooking = new ((await import(`../../Scripts/rcsCargo/airBooking.js?v=${version}`)).default);
        controllers.airHawb = new ((await import(`../../Scripts/rcsCargo/airHawb.js?v=${version}`)).default);
        controllers.airInvoice = new ((await import(`../../Scripts/rcsCargo/airInvoice.js?v=${version}`)).default);
        controllers.airPv = new ((await import(`../../Scripts/rcsCargo/airPv.js?v=${version}`)).default);

        //For development only
        setTimeout(function () {
            //setTimeout(function () { controls.append_tabStripMain("MAWB", `airMawbIndex_${data.companyId}`, "airMawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("MAWB# NEW", `airMawb_NEW_RCSHKG_AE`, "airMawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("MAWB# 27274093235", "airMawb_27274093235_RCSHKG_AE", "airMawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("MAWB# 17286649382", "airMawb_17286649382_RCSHKG_AE", "airMawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("Booking", `airBookingIndex_${data.companyId}`, "airBooking"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("Booking# WFF74277243", "airBooking_WFF74277243_RCSHKG_AE", "airBooking"); }, 500)
            //setTimeout(function () { controls.append_tabStripMain("Hawb", `airHawbIndex_${data.companyId}`, "airHawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("HAWB# NEW", `airHawb_NEW_RCSHKG_AE`, "airHawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("HAWB# HKG18124773", "airHawb_HKG18124773_RCSHKG_AE", "airHawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("HAWB# HKG18124768", "airHawb_HKG18124768_RCSHKG_AE", "airHawb"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("Invoice# TD0187325", "airInvoice_TD0187325_RCSHKG_AE", "airInvoice"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("Invoice# TD0187274", "airInvoice_TD0187274_RCSHKG_AE", "airInvoice"); }, 500);
            //setTimeout(function () { controls.append_tabStripMain("Invoice# CNHK121248", "airInvoice_CNHK121248_RCSHKG_AE", "airInvoice"); }, 500);
            setTimeout(function () { controls.append_tabStripMain("PV# TAPV0150685", "airPv_TAPV0150685_RCSHKG_AE", "airPv"); }, 500);
        }, 1000);

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
        }, 1000 * 60);
    }

    loadScripts();
});