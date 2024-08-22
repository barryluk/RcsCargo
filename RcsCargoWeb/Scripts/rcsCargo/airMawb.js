export default class {
    constructor() {
    }

    initAirMawb = function (masterForm) {
        //linkIdPrefix: airMawb / airBooking
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        var mawbNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `MAWB# ${utils.formatMawbNo(mawbNo)}`;
            if (e.id == "printMawb") {
                reportName = "AirMawb";
            } else if (e.id == "previewMawb") {
                reportName = "AirMawbPreview";
            } else if (e.id == "loadplan") {
                reportName = "AirLoadPlan";
                filename = `Loadplan ${utils.formatMawbNo(mawbNo)}`;
            } else if (e.id == "manifest") {
                reportName = "AirCargoManifest";
                filename = `CargoManifest ${utils.formatMawbNo(mawbNo)}`;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "MawbNo", value: mawbNo },
                { name: "JobNo", value: utils.getFormValue("JOB") },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });

        var buttonGroup = $(`#${masterForm.id} div[type=buttonGroup][name=JOB_TYPE]`).data("kendoButtonGroup");
        buttonGroup.bind("select", function (e) {
            //0: Consol, 1: Direct
            //Handle change Job Type
            var selectedJobType = e.sender.selectedIndices[0] == 0 ? "C" : "D";
            if (selectedJobType != $(`#${masterForm.id} input[name=JOB_TYPE]`).val()) {
                controls.edit.initEditPage(masterForm.id, "edit", { changedJobType: selectedJobType });
                //$(`#${masterForm.id} input[name=JOB_TYPE]`).val(selectedJobType);
                //controllers.airMawb.initAirMawb(masterForm);
                return;
            }

            var tabStrip = $(`#${masterForm.id} .formGroupTab`).data("kendoTabStrip");
            var tabConsol = $(`#${masterForm.id} span:contains("Load Plan")`).parent();
            var tabDirect = $(`#${masterForm.id} span:contains("Direct Job")`).parent();
            if (e.sender.selectedIndices[0] == 0) {
                tabStrip.remove(tabDirect);
            } else {
                tabStrip.remove(tabConsol);
            }
        });

        buttonGroup.trigger("select");
    }
}