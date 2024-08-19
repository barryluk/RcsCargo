export default class {
    constructor() {
    }

    initAirBookingIndex = function (id) {
        var pageSetting = data.indexPages.filter(a => a.pageName == "airBooking")[0];
        pageSetting.id = id;
        $(`#${id}`).html(data.htmlElements.indexPage("Booking", pageSetting.gridConfig.gridName));

        controls.renderSearchControls(pageSetting);
        controls.renderIndexGrid(pageSetting);
    }

    initAirBooking = function (id, mode = "edit", jobType = "") {
        //id format: AirBooking_{bookingNo}_{companyId}_{frtMode}
        var bookingNo = id.split("_")[1];
        var companyId = id.split("_")[2];
        var frtMode = id.split("_")[3];

        $(`#${id}`).html(data.htmlElements.editPage(`Booking# ${bookingNo}`));

        var masterForm = data.masterForms.filter(a => a.formName == "airBooking")[0];
        masterForm.id = id;
        masterForm.mode = mode;
        masterForm.targetForm = $(`#${id} .container-fluid .row.form_group`);
        controls.renderFormControls(masterForm);

        var printButton = $(`#${id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

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
                { name: "CompanyId", value: data.companyId },
                { name: "FrtMode", value: utils.getFrtMode() },
                { name: "MawbNo", value: mawbNo },
                { name: "JobNo", value: utils.getFormValue("JOB") },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });

        //Get model data
        if (mode == "edit") {
            $.ajax({
                url: "../Air/Booking/GetBooking",
                type: "post",
                dataType: "json",
                data: {
                    bookingNo: bookingNo,
                    companyId: companyId,
                    frtMode: frtMode
                },
                success: function (result) {
                    controls.setValuesToFormControls(masterForm, result);
                }
            });
        }
    }
}