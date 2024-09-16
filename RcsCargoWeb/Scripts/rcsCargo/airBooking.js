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

        //Manual input Booking #
        if (masterForm.mode == "create") {
            $(`#${masterForm.id} [name="BOOKING_NO"]`).removeClass("form-control");
            $(`#${masterForm.id} [name="BOOKING_NO"]`).addClass("form-control-text k-input-inner readonlyInput");
            $(`#${masterForm.id} [name="BOOKING_NO"]`).after(`<i class="k-icon k-i-change-manually handCursor" title="Manual input Booking#"></i>`);

            $(`#${masterForm.id} .k-i-change-manually`).bind("click", function () {
                if ($(`#${masterForm.id} [name="BOOKING_NO"]`).attr("readonly") == null) {
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).attr("readonly", "readonly");
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).addClass("readonlyInput");
                }
                else {
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).removeAttr("readonly", "readonly");
                    $(`#${masterForm.id} [name="BOOKING_NO"]`).removeClass("readonlyInput");
                }
            });
        }
    }

    printWarehouseReceipt = function () {
        utils.alertMessage("Warehouse Receipt...", "Print Warehouse Receipt", "info", "medium");
    };
}