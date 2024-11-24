export default class {
    constructor() {
    }

    initSeaBooking = function (masterForm) {
        //id format: seaBooking_{bookingNo}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var bookingNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];
        
        //Save as new button click event
        $(`#${masterForm.id} button .k-i-copy`).parent().bind("click", function () {
            let html = `Are you sure to as new booking?<br><br>
                <div class="row col-sm-12" style="width: 500px; margin-bottom: 20px">
                    <label class="col-sm-4 col-form-label">Manual assign Booking#</label>
                    <div class="col-sm-8">
                        <input type='text' class='form-control' name='saveAsNew_bookingNo' placeHolder='New booking#, blank for auto generate.' />
                    </div>
                </div>`;

            utils.alertMessage(html, "Save as new booking", "confirm", null, true, "controllers.seaBooking.saveAsNewBookingClick");
        });
    }

    saveAsNewBookingClick = function (sender) {
        let assignedBookingNo = $(`[name="saveAsNew_bookingNo"]`).val();
        let masterForm = utils.getMasterForm();
        let validator = $(`#${masterForm.id}`).data("kendoValidator");

        if (!utils.isEmptyString(assignedBookingNo)) {
            if (utils.isExistingSeaBookingNo(assignedBookingNo)) {
                utils.showNotification("Booking# already exist, please use a different booking number.", "error",
                    $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                return;
            }
        }

        if (!validator.validate()) {
            utils.showNotification("Validation failed, please verify the data entry", "error",
                $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
            return;
        } else {
            masterForm.mode = "create";
            let model = controls.getValuesFromFormControls(masterForm);
            model.BOOKING_NO = utils.formatText(assignedBookingNo) ?? "";
            if (model.SeaBookingSos != null) {
                model.SeaBookingSos.forEach(function (so) {
                    so.BOOKING_NO = utils.formatText(assignedBookingNo) ?? "";
                });
            }
            if (model.SeaBookingCargos != null) {
                model.SeaBookingCargos.forEach(function (cargo) {
                    cargo.BOOKING_NO = utils.formatText(assignedBookingNo) ?? "";
                });
            }
            if (model.SeaBookingPos != null) {
                model.SeaBookingPos.forEach(function (po) {
                    po.BOOKING_NO = utils.formatText(assignedBookingNo) ?? "";
                });
            }
            console.log(masterForm, model);
            //return;

            $.ajax({
                url: masterForm.updateUrl,
                type: "post",
                data: { model: model, mode: masterForm.mode },
                beforeSend: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), true); },
                complete: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), false); },
                success: function (result) {
                    console.log(result);
                    controls.append_tabStripMain(`${masterForm.title} ${result.BOOKING_NO}`,
                        `${masterForm.formName}_${result.BOOKING_NO}_${data.companyId}_${result.FRT_MODE}`, masterForm.formName);

                    utils.showNotification(`Save success, new booking# ${result.BOOKING_NO}`, "success", $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                    sender.destroy();
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Save failed, please contact system administrator!", "error",
                        $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                },
            });
        }
    }

}