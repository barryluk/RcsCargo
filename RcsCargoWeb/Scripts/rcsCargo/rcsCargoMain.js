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
        //let msg = new ((await import('message.js')).default)("Barry");    Example for passing values to the constructor
        data = new ((await import('../../Scripts/rcsCargo/data.js')).default);
        utils = new ((await import('../../Scripts/rcsCargo/utils.js')).default);
        controls = new ((await import('../../Scripts/rcsCargo/controls.js')).default);
        controls.index = new ((await import('../../Scripts/rcsCargo/controls.index.js')).default);
        controls.edit = new ((await import('../../Scripts/rcsCargo/controls.edit.js')).default);
        controls.kendo = new ((await import('../../Scripts/rcsCargo/controls.kendo.js')).default);

        controllers.airMawb = new ((await import('../../Scripts/rcsCargo/airMawb.js')).default);
        controllers.airBooking = new ((await import('../../Scripts/rcsCargo/airBooking.js')).default);

        //For development only
        setTimeout(function () {
            controls.append_tabStripMain("MAWB Allocation", `airMawbIndex_${data.companyId}`, "airMawb");
            controls.append_tabStripMain("Booking", `airBookingIndex_${data.companyId}`, "airBooking");
            //controls.append_tabStripMain("MAWB# 272-7409 4506", "airMawb_27274094506_RCSHKG_AE", "airMawb");
            //controls.append_tabStripMain("Booking# WFF74094495", "airBooking_WFF74094495_RCSHKG_AE", "airBooking");
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