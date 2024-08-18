export default class {
    constructor() {
    }

    initAirMawbIndex = function (id) {
        $(`#${id}`).html(data.htmlElements.indexPage("MAWB"));

        var pageSetting = data.indexPages.filter(a => a.pageName == "airMawb")[0];
        pageSetting.id = id;

        controls.renderSearchControls(pageSetting);
        controls.renderIndexGrid(pageSetting);
    }

    initAirMawb = function (id, mode = "edit", jobType = "") {
        //id format: AirMawb_{mawbNo}_{companyId}_{frtMode}
        var mawbNo = id.split("_")[1];
        var companyId = id.split("_")[2];
        var frtMode = id.split("_")[3];

        $(`#${id}`).html(data.htmlElements.editPage(`MAWB# ${utils.formatMawbNo(mawbNo)}`));

        var masterForm = data.masterForms.filter(a => a.formName == "airMawb")[0];
        masterForm.id = id;
        masterForm.mode = mode;
        masterForm.targetForm = $(`#${id} .container-fluid .row.form_group`);
        controls.renderFormControls(masterForm);

        var printButton = $(`#${id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            console.log(e);
            if (e.id == "printMawb") {
                controls.openReportViewer("AirMawb", [
                    { name: "CompanyId", value: data.companyId },
                    { name: "FrtMode", value: "AE" },
                    { name: "MawbNo", value: mawbNo },]);
            } else if (e.id == "previewMawb") {
                controls.openReportViewer("AirMawbPreview", [
                    { name: "CompanyId", value: data.companyId },
                    { name: "FrtMode", value: utils.getFrtMode() },
                    { name: "MawbNo", value: mawbNo },]);
            }
        });

        var buttonGroup = $(`#${masterForm.id} div[type=buttonGroup][name=JOB_TYPE]`).data("kendoButtonGroup");
        buttonGroup.bind("select", function (e) {
            //0: Consol, 1: Direct
            //Handle change Job Type
            var selectedJobType = e.sender.selectedIndices[0] == 0 ? "C" : "D";
            if (selectedJobType != $(`#${masterForm.id} input[name=JOB_TYPE]`).val()) {
                controllers.airMawb.initAirMawb(masterForm.id, "edit", selectedJobType);
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

        //Get model data
        if (mode == "edit") {
            $.ajax({
                url: "../Air/Mawb/GetMawb",
                type: "post",
                dataType: "json",
                data: {
                    mawbNo: mawbNo,
                    companyId: companyId,
                    frtMode: frtMode
                },
                success: function (result) {
                    if (jobType != "") {
                        result.JOB_TYPE = jobType;
                    }
                    controls.setValuesToFormControls(masterForm, result);
                    buttonGroup.trigger("select");
                }
            });
        }
    }
}