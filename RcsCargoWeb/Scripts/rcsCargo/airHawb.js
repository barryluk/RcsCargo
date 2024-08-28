export default class {
    constructor() {
    }

    initAirHawb = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        var hawbNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `MAWB# ${utils.formatMawbNo(hawbNo)}`;
            if (e.id == "printMawb") {
                reportName = "AirMawb";
            } else if (e.id == "previewMawb") {
                reportName = "AirMawbPreview";
            } else if (e.id == "loadplan") {
                reportName = "AirLoadPlan";
                filename = `Loadplan ${utils.formatMawbNo(hawbNo)}`;
            } else if (e.id == "manifest") {
                reportName = "AirCargoManifest";
                filename = `CargoManifest ${utils.formatMawbNo(hawbNo)}`;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "HawbNo", value: hawbNo },
                { name: "JobNo", value: utils.getFormValue("JOB_NO") },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });
    }


    updateFromWarehouse = function (selector) {
        var formId = utils.getFormId(selector);
        utils.alertMessage(formId, "", "warning");
        //var gridHawbData = $(`#${formId} [name="grid_LoadplanHawbListViews"]`).data("kendoGrid").dataSource.data();
        //var gridEquipData = $(`#${formId} [name="grid_LoadplanHawbEquips"]`).data("kendoGrid").dataSource.data();
        //var result = [];
        //console.log(gridHawbData);
        //console.log(gridEquipData);
        //gridHawbData.forEach(function (hawb) {
        //    var pkgs = 0;
        //    gridEquipData.forEach(function (equip) {
        //        if (hawb.HAWB_NO == equip.HAWB_NO)
        //            pkgs += equip.PACKAGE;
        //    });

        //    if (hawb.PACKAGE != pkgs)
        //        result.push({ HAWB_NO: hawb.HAWB_NO, PACKAGE: hawb.PACKAGE, PKGS: pkgs });
        //});

        //console.log(result);
        //if (result.length > 0) {
        //    var msg = "Equipments no. of packages doesn't match with HAWB packages:<br>";
        //    result.forEach(function (item) {
        //        msg += `HAWB: ${item.HAWB_NO}, Packages: ${item.PACKAGE}, wrong packages: <span style="color: red">${item.PKGS}</span><br>`;
        //    });
        //    utils.alertMessage(msg, "", "warning");
        //} else {
        //    utils.alertMessage("All data entries are correct.");
        //}
    }
}