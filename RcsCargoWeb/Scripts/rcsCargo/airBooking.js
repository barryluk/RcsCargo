export default class {
    constructor() {
    }

    initAirBooking = function (masterForm) {
        //id format: airBooking_{bookingNo}_{companyId}_{frtMode}
        var bookingNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];
        
        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `Booking# ${bookingNo}`;
            if (e.id == "printBooking") {
                reportName = "AirBooking";
            } else if (e.id == "printBookingHawb") {
                reportName = "AirBookingHawb";
            } else if (e.id == "printWarehouseReceipt") {
                controllers.airBooking.printWarehouseReceipt();
                return;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "BookingNo", value: bookingNo },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });
    }

    printWarehouseReceipt = function () {
        utils.alertMessage("Warehouse Receipt...", "Print Warehouse Receipt", "info", "medium");
    };
}