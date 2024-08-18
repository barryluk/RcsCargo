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
    }

    loadScripts();
});