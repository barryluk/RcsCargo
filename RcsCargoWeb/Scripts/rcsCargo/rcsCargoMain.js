var data;
var utils;
var controls;
var controllers = {};
var testObj, testObj1, testObj2;

$(document).ready(function () {
    $.ajaxSetup({
        type: "post",
        cache: false
    });

    async function loadScripts() {
        //let msg = new ((await import('message.js')).default)("Barry");
        //msg.Message = "Monica";
        //console.log(msg.showMessage());
        data = new ((await import('../../Scripts/rcsCargo/data.js')).default);
        utils = new ((await import('../../Scripts/rcsCargo/utils.js')).default);
        controls = new ((await import('../../Scripts/rcsCargo/controls.js')).default);
        controllers.airMawb = new ((await import('../../Scripts/rcsCargo/airMawb.js')).default);
        controllers.airBooking = new ((await import('../../Scripts/rcsCargo/airBooking.js')).default);

        //For development only
        setTimeout(function () {
            controls.append_tabStripMain("MAWB Allocation", "AirMawbIndex_RCSHKG", "airMawb");
            controls.append_tabStripMain("MAWB# 272-7409 4506", "AirMawb_27274094506_RCSHKG_AE", "airMawb");
            controls.append_tabStripMain("Booking# WFF74094495", "AirBooking_WFF74094495_RCSHKG_AE", "airBooking");
        }, 1000);
    }

    loadScripts();
});