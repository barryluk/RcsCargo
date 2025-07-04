export default class {
    constructor() {
    }

    initAirOtherJob = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var jobNo = masterForm.id.split("_")[1];
        var companyId = data.companyId;
        var frtMode = utils.getFrtMode();

        //Save as new button click event
        $(`#${masterForm.id} button .k-i-copy`).parent().bind("click", function () {
            let html = `Are you sure to as new job?<br><br>`;

            utils.alertMessage(html, "Save as new job", "confirm", null, true, "controllers.airOtherJob.saveAsNewOtherJobClick");
        });
    }

    saveAsNewOtherJobClick = function (sender) {
        let masterForm = utils.getMasterForm();
        let validator = $(`#${masterForm.id}`).data("kendoValidator");

        if (!validator.validate()) {
            utils.showNotification("Validation failed, please verify the data entry", "error",
                $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
            return;
        } else {
            masterForm.mode = "create";
            let model = controls.getValuesFromFormControls(masterForm);
            model.INV_NO = "";
            
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
                    controls.append_tabStripMain(`${masterForm.title} ${result.JOB_NO}`,
                        `${masterForm.formName}_${result.JOB_NO}_${data.companyId}_${result.FRT_MODE}`, masterForm.formName);

                    utils.showNotification(`Save success, new job# ${result.JOB_NO}`, "success", $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
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