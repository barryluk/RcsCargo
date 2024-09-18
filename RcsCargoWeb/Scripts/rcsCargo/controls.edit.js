export default class {
    constructor() {
    }

    initEditPage = function (id, originalId, mode = "edit", para) {
        //linkIdPrefix: airMawb / airBooking
        //id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        var formName = id.split("_")[0];
        this.keyValue = utils.isEmptyString(originalId) ? id.split("_")[1] : originalId.split("_")[1];
        this.companyId = id.split("_")[2];
        this.frtMode = id.split("_")[3];

        //if (!utils.isEmptyString(originalId))
        console.log(this.keyValue);

        if (this.keyValue == "NEW")
            mode = "create";

        var masterForm = data.masterForms.filter(a => a.formName == formName)[0];
        masterForm.id = id;
        masterForm.mode = mode;
        masterForm.targetForm = `#${id} .container-fluid .row.form_group`;
        $(`#${id}`).html(data.htmlElements.editPage(`${masterForm.title} ${formName == "airMawb" ? utils.formatMawbNo(this.keyValue) : this.keyValue}`));
        //console.log("form ID:", id);
        this.renderFormControls(masterForm);
        this.getModelData(masterForm, para);
    }

    //Get model data
    getModelData = function (masterForm, para) {
        var requestParas = {
            id: this.keyValue,
            companyId: this.companyId,
            frtMode: this.frtMode
        };
        if (para != null)
            $.extend(requestParas, para);

        if (masterForm.mode == "edit" || masterForm.mode == "create") {
            $.ajax({
                url: masterForm.readUrl,
                data: requestParas,
                success: function (result) {
                    masterForm.modelData = result;
                    controls.setValuesToFormControls(masterForm, result);
                    if (masterForm.additionalScript != null)
                        eval(`controllers.${masterForm.formName}.${masterForm.additionalScript}(masterForm);`);
                },
                complete: function () {
                    kendo.ui.progress($(`#${masterForm.id}`).parent(), false);
                }
            });
        }
    }

    //Render form controls
    renderFormControls = function (masterForm) {
        var html = "";

        //Hidden fields
        if (masterForm.schema.hiddenFields != null) {
            masterForm.schema.hiddenFields.forEach(function (item) {
                html += ` <input type="hidden" name="${item}" />`;
            });
            $(masterForm.targetForm).append(html);
        }

        //Form tabStrip
        if (masterForm.formTabs != null) {
            $(`#${masterForm.id} .row.form_group`).append(`<div class="formGroupTab"></div>`);
            var formGroupTab = $(`#${masterForm.id} .row.form_group .formGroupTab`).kendoTabStrip({ animation: false }).data("kendoTabStrip");

            //Hide the tab title if only 1 tab in this form
            if (masterForm.formTabs.length == 1)
                $(`#${masterForm.id} .k-tabstrip-items`).attr("style", "display: none");

            masterForm.formTabs.forEach(function (tab) {
                formGroupTab.append({ text: tab.title, content: `<div name="${tab.name}" class="row"></div>` });

                if (tab.formGroups == null)
                    return;

                tab.formGroups.forEach(function (formGroupName) {
                    var formGroup = masterForm.formGroups.filter(a => a.name == formGroupName)[0];
                    html = "";

                    if (formGroup == null)
                        return;

                    for (var j in formGroup.formControls) {
                        var control = formGroup.formControls[j];
                        var formControlClass = "form-control";
                        var formControlType = "input";
                        var required = "";
                        if (control.name == null)   //skip for empty blocks
                            continue;

                        if (masterForm.schema.requiredFields != null) {
                            required = masterForm.schema.requiredFields.indexOf(control.name) == -1 ? "" : "required";
                        }
                        
                        if (control.type == "date" || control.type == "dateTime") {
                            formControlClass = "form-control-dateTime";
                        } else if (control.type.startsWith("number")) {
                            formControlClass = "form-control-number";
                        } else if (data.dropdownlistControls.includes(control.type)) {
                            formControlClass = "form-control-dropdownlist";
                        } else if (control.type == "textArea") {
                            formControlClass = "form-control-textArea";
                            formControlType = "textarea";
                        } else if (control.type == "dateRange" || control.type == "buttonGroup" || control.type == "emptyBlock") {
                            formControlType = "div";
                        } else if (control.type == "switch") {
                            formControlClass = "";
                        }

                        if (control.type == "label") {
                            html += `
                                <div class="row">
                                    <label class="col-lg-12 col-form-label"><h5>${control.label}</h5></label>
                                </div>`;
                        } else if (control.type == "buttonGroup") {
                            var colWidth = "";
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;
                            html += `
                                <div class="row ${colWidth}">
                                    <label class="col-sm-3 col-form-label">${control.label}</label>
                                    <div class="col-sm-9">
                                        <${formControlType} type="${control.type}" name="${control.name}" dataType="${control.dataType}" ${!utils.isEmptyString(required) ? "required-checking='true'" : ""} />
                                    </div>
                                </div>`;
                        } else if (control.type == "grid") {
                            var colWidth = "";
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                            if (!utils.isEmptyString(control.label)) {
                                html += `
                                    <div class="row col-xl-12 col-lg-12">
                                        <div class="row ${colWidth}">
                                            <label class="col-sm-3 col-form-label">${control.label}</label>
                                                <div class="col-sm-9">
                                                <div name="grid_${control.name}" type="${control.type}" ${!utils.isEmptyString(required) ? "required-checking='true'" : ""} />
                                            </div>
                                        </div>
                                    </div>`;
                            } else {
                                html += `
                                    <div class="row">
                                        <div name="grid_${control.name}" type="${control.type}" ${!utils.isEmptyString(required) ? "required-checking='true'" : ""} />
                                    </div>`;
                            }
                        } else if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                            var readonlyAttr = "";
                            if (control.type == "customerAddr" || control.type == "customerAddrEditable") {
                                if (control.type == "customerAddr") {
                                    readonlyAttr = "readonly";
                                }
                                html += `
                                    <div class="row col-xl-6 col-lg-12">
                                        <label class="col-sm-3 col-form-label">${control.label}</label>
                                        <div class="col-sm-9">
                                            <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${required} />
                                            <input type="hidden" name="${control.name}_CODE" />
                                            <input type="hidden" name="${control.name}_BRANCH" />
                                            <input type="hidden" name="${control.name}_SHORT_DESC" />
                                            <input type="text" class="form-control" name="${control.name}_ADDR1" ${readonlyAttr} />
                                            <input type="text" class="form-control" name="${control.name}_ADDR2" ${readonlyAttr} />
                                            <input type="text" class="form-control" name="${control.name}_ADDR3" ${readonlyAttr} />
                                            <input type="text" class="form-control" name="${control.name}_ADDR4" ${readonlyAttr} style="margin-bottom: 4px" />
                                        </div>
                                    </div>`;
                            }
                        } else if (control.type == "currency") {
                            if (control.exRateName != null) {
                                var colWidth = control.colWidth != null ? control.colWidth : "3";
                                html += `
                                    <div class="row col-xl-${colWidth} col-lg-${colWidth * 2 > 12 ? 12 : colWidth * 2}">
                                        <label class="col-sm-3 col-form-label">${control.label}</label>
                                        <div class="row col-sm-9">
                                            <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" style="margin-left: 9.5px; width: 95px; height: 28.79px" ${required} />
                                            &nbsp;
                                            <${formControlType} class="form-control" name="${control.exRateName}" style="width: 80px;" readonly ${required} />
                                        </div>
                                    </div>`;
                            }
                        } else if (control.type == "chargeTemplate") {
                            var colWidth = control.colWidth != null ? control.colWidth : "3";
                            html += `
                                <div class="row col-xl-${colWidth} col-lg-${colWidth * 2 > 12 ? 12 : colWidth * 2}">
                                    <label class="col-sm-4 col-form-label">${control.label}</label>
                                    <div class="row col-sm-8">
                                        <${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" targetControl="${control.targetControl}" />
                                    </div>
                                </div>`;
                        } else if (control.type == "button") {
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;

                            html += `
                                <div class="row ${colWidth}">
                                    <button type="button" class="customButton button-icon-${control.icon}" name="${control.name}" style="margin: 4px;">${control.label}</button>
                                </div>`;
                        } else {
                            var colWidth = "";
                            var callbackFunction = "";
                            var controlHtml = "";

                            if (control.callbackFunction != null)
                                callbackFunction = `callbackFunction="${control.callbackFunction}"`;
                            if (control.type != "emptyBlock")
                                controlHtml = `<${formControlType} type="${control.type}" class="${formControlClass}" name="${control.name}" ${callbackFunction} ${required} />`;
                            if (control.colWidth != null)
                                colWidth = `col-xl-${control.colWidth} col-lg-${control.colWidth * 2 > 12 ? 12 : control.colWidth * 2}`;
                            
                            html += `
                                <div class="row ${colWidth}">
                                    <label class="col-sm-3 col-form-label">${control.label}</label>
                                    <div class="col-sm-9">
                                        ${controlHtml}
                                    </div>
                                </div>`;
                        }
                    }

                    $(`#${masterForm.id} .formGroupTab [name=${tab.name}]`).append(data.htmlElements.card(formGroup.title, html, formGroup.colWidth));
                    //$(`#${masterForm.id} .formGroupTab [name=${tab.name}]`).append(html);
                });
            });
            formGroupTab.activateTab($(`#${masterForm.id} .formGroupTab li`).eq(0));
        }
        //console.log(masterForm.id);
        controls.kendo.renderFormControl_kendoUI(masterForm, true);

        //readonly fields
        if (masterForm.schema.readonlyFields != null) {
            masterForm.schema.readonlyFields.forEach(function (item) {
                if (item.readonly == "always") {
                    $(`#${masterForm.id} [name=${item.name}]`).attr("readonly", "readonly");
                } else if (item.readonly == "edit" && masterForm.mode == "edit") {
                    $(`#${masterForm.id} [name=${item.name}]`).attr("readonly", "readonly");
                }
            });
        }

        //Readonly kendo controls
        $(`#${masterForm.id} input[readonly=readonly], div[readonly=readonly]`).each(function () {
            var ctrlType = $(this).attr("data-role");
            switch (ctrlType) {
                case "dropdownlist":
                    $(this).data("kendoDropDownList").enable(false);
                    break;
                case "datetimepicker":
                    $(this).data("kendoDateTimePicker").enable(false);
                    break;
                case "datepicker":
                    $(this).data("kendoDatePicker").enable(false);
                    break;
                case "numerictextbox":
                    $(this).data("kendoNumericTextBox").enable(false);
                    break;
                case "buttongroup":
                    $(this).data("kendoButtonGroup").enable(false);
                    break;
            }
        });

        //collapse cards
        if (masterForm.formGroups != null) {
            masterForm.formGroups.forEach(function (formGroup) {
                if (formGroup.collapse == true) {
                    $(`.card-title:contains("${formGroup.title}")`).CardWidget("collapse");
                }
            });
        }
    }
}