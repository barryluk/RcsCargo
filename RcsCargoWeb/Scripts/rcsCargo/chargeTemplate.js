export default class {
    constructor() {
    }

    initChargeTemplate = function (masterForm) {
        //id format: customer{customerCode}_{companyId}_{companyId}
        masterForm.id = utils.getFormId();

        //Save as new button click event
        $(`#${masterForm.id} button .k-i-copy`).parent().bind("click", function () {
            let html = `Are you sure to as new charge template?<br><br>
                <div class="row col-sm-12" style="width: 500px; margin-bottom: 20px">
                    <label class="col-sm-4 col-form-label">New template name</label>
                    <div class="col-sm-8">
                        <input type='text' class='form-control' name='saveAsNew_templateName' placeHolder='New template name.' />
                    </div>
                </div>`;

            utils.alertMessage(html, "Save as new charge template", "confirm", null, true, "controllers.chargeTemplate.saveAsNewChargeTemplateClick");
        });
    }

    saveAsNewChargeTemplateClick = function (sender) {
        let masterForm = utils.getMasterForm();
        let model = controls.getValuesFromFormControls(masterForm);
        model.mode = "create";
        model.TEMPLATE_NAME = utils.formatText($(`[name="saveAsNew_templateName"]`).val());
        for (var item in model.Charges) {
            model.Charges[item].TEMPLATE_NAME = model.TEMPLATE_NAME;
        }

        if (!utils.isEmptyString(model.TEMPLATE_NAME)) {
            if (utils.isExisitingChargeTemplateName(model.TEMPLATE_NAME)) {
                utils.showNotification("Template name already exist, please use a different name.", "error",
                    $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
                return;
            }
        }

        console.log(model);

        $.ajax({
            url: masterForm.updateUrl,
            type: "post",
            data: { model: model, mode: model.mode },
            beforeSend: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), true); },
            complete: function () { kendo.ui.progress($(`.kendo-window-alertMessage`), false); },
            success: function (result) {
                console.log(result);
                controls.append_tabStripMain(`${masterForm.title} ${result.TEMPLATE_NAME}`,
                    `${masterForm.formName}_${result.TEMPLATE_NAME}_${data.companyId}`, masterForm.formName);

                utils.showNotification(`Save success.`, "success", $(`.kendo-window-alertMessage`).parent().find(".k-i-close")[0]);
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