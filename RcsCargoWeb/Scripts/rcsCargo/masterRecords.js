export default class {
    constructor() {
    }

    initMasterRecords = function (pageSetting) {
        this.initGridControls(pageSetting);
    }

    initGridControls = function (pageSetting) {
        var grid = $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"]`).data("kendoGrid");

        //Create
        $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"] .k-grid-new`).click(function () {
            utils.alertMessage(controllers.masterRecords.renderControls(pageSetting, "create"),
                `Create`, null, null, true, "controllers.masterRecords.editSaveClick");
            controls.kendo.renderFormControl_kendoUI({
                id: `${utils.getFormId()}`,
                schema: pageSetting.schema,
            }, true);
        });

        grid.bind("dataBound", function (e) {

            //Edit
            $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"] i.k-icon.k-i-pencil`).each(function () {
                $(this).unbind("click");
                $(this).click(function () {
                    var key = $(this).attr("data-attr");

                    if (pageSetting.gridConfig.linkIdPrefix != null) {
                        var id = `${pageSetting.gridConfig.linkIdPrefix}_${key}_${data.companyId}`;
                        controls.append_tabStripMain(`${pageSetting.gridConfig.linkTabTitle}${key}`, id, pageSetting.pageName);
                    } else {
                        utils.alertMessage(controllers.masterRecords.renderControls(pageSetting, "edit"),
                            `Edit: ${key}`, null, null, true, "controllers.masterRecords.editSaveClick");
                        controls.kendo.renderFormControl_kendoUI({
                            id: `${utils.getFormId()}`,
                            schema: pageSetting.schema,
                        }, true);
                        controllers.masterRecords.setValuesToControls(pageSetting, key);
                    }
                });
            });

            //Delete
            $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"] i.k-icon.k-i-trash`).each(function () {
                $(this).unbind("click");
                $(this).click(function () {
                    var key = $(this).attr("data-attr");
                    utils.confirmMessage(`Are you sure to delete this record: ${key}?`,
                        { pageSetting: pageSetting, key: key }, "controllers.masterRecords.deleteConfirmClick");
                });
            });
        });
    }

    renderControls = function (pageSetting, mode) {
        var html = "";
        if (pageSetting.schema != null) {
            pageSetting.schema.fields.forEach(function (field) {
                var required = field["required"] == null ? "" : "required";
                var readonlyAttr = "";
                if (field.readonly != null) {
                    if (mode == "edit") {
                        if (field.readonly == "always" || field.readonly == "edit") {
                            readonlyAttr = "readonly";
                        }
                    } else {
                        if (field.readonly == "always") {
                            readonlyAttr = "readonly";
                        }
                    }
                }

                if (field.type == "customerAddr") {
                    html += `
                        <label class="col-sm-3 col-form-label">${field.label}</label>
                        <div class="col-sm-9">
                            <${utils.getFormControlType(field.type)} type="${field.type}" class="${utils.getFormControlClass(field.type)}" name="${field.name}" ${required} />
                            <input type="hidden" name="${field.name}_CODE" />
                            <input type="hidden" name="${field.name}_BRANCH" />
                            <input type="hidden" name="${field.name}_SHORT_DESC" />
                            <input type="text" class="form-control" name="${field.name}_ADDR1" readonly />
                            <input type="text" class="form-control" name="${field.name}_ADDR2" readonly />
                            <input type="text" class="form-control" name="${field.name}_ADDR3" readonly />
                            <input type="text" class="form-control" name="${field.name}_ADDR4" readonly style="margin-bottom: 4px" />
                        </div>
                    `;
                } else {
                    html += `
                        <label class="col-sm-3 col-form-label">${field.label}</label>
                        <div class="col-sm-9">
                            <${utils.getFormControlType(field.type)} type="${field.type == null ? "text" : field.type}" class="${utils.getFormControlClass(field.type)}" name="${field.name}" ${readonlyAttr} ${required} />
                        </div>
                    `;
                }
            });
        }
        return `<div class="row col-sm-12" id="${utils.getFormId()}_gridEdit" style="width: 600px">${html}</div>`;
    }

    setValuesToControls = function (pageSetting, key) {
        var grid = $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"]`).data("kendoGrid");
        var dataItems = grid.dataItems();
        var domId = `${utils.getFormId()}`;

        if (pageSetting.schema != null) {
            var dataItem = dataItems.filter(a => a[pageSetting.schema.keyField] == key)[0];

            pageSetting.schema.fields.forEach(function (field) {
                if (data.dropdownlistControls.indexOf(field.type) == -1)
                    $(`#${domId} [name="${field.name}"]`).val(dataItem[field.name]);
                else
                    $(`#${domId} [name="${field.name}"]`).data("kendoDropDownList").value(dataItem[field.name]);

                if (field.type == "number" || field.type == "numberInt")
                    $(`#${domId} [name="${field.name}"]`).data("kendoNumericTextBox").value(dataItem[field.name]);

                if (field.type == "customerAddr") {
                    var ddl = $(`#${domId} [name="${field.name}"]`).data("kendoDropDownList");
                    ddl.search(dataItem[`${field.name}_CODE`]);
                    ddl.bind("dataBound", function (e) {
                        var ddlName = $(e.sender.element).attr("name");     //very important to get the correct control name!! the dropDropList search is a async function
                        var items = ddl.dataSource.data();

                        console.log(ddlName, items, dataItem);
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].BRANCH_CODE == dataItem[`${ddlName}_BRANCH`] && items[i].SHORT_DESC == dataItem[`${ddlName}_SHORT_DESC`]) {
                                console.log(dataItem[`${ddlName}_CODE`]);
                                this.select(i + 1);
                                this.trigger("select");
                                break;
                            }
                        }
                    });
                }
            });
        }
    }

    getValuesFromControls = function (pageSetting, mode, key) {
        var model = {};
        if (pageSetting.schema != null) {
            var grid = $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"]`).data("kendoGrid");
            var modelData = grid.dataItems().filter(a => a[pageSetting.schema.keyField] == key)[0];
            var domId = `${utils.getFormId()}`;

            pageSetting.schema.fields.forEach(function (field) {
                model[field.name] = utils.formatText($(`#${domId} [name="${field.name}"]`).val());

                if (field.type == "customerAddr") {
                    var value = $(`#${domId} [name=${field.name}]`).val().split("-")[0];
                    if (!controls.isEmptyString(value)) {
                        var text = $(`#${domId} [name=${field.name}]`).data("kendoDropDownList").text().replace(`${value} - `, ``)
                            .replace(` - ${$(`#${domId} [name=${field.name}_BRANCH]`).val()}`, ``);

                        model[`${field.name}_CODE`] = utils.formatText(value);
                        model[`${field.name}_BRANCH`] = utils.formatText($(`#${domId} [name=${field.name}_BRANCH]`).val());
                        model[`${field.name}_SHORT_DESC`] = utils.formatText($(`#${domId} [name=${field.name}_SHORT_DESC]`).val());
                        model[`${field.name}_DESC`] = utils.formatText(text);
                    }
                }
            });

            if (mode == "create") {
                model["CREATE_USER"] = data.user.USER_ID;
                model["CREATE_DATE"] = utils.convertDateToISOString(new Date());
                model["MODIFY_USER"] = data.user.USER_ID;
                model["MODIFY_DATE"] = utils.convertDateToISOString(new Date());
            } else {
                if (modelData.CREATE_USER != null) {
                    model["CREATE_USER"] = modelData.CREATE_USER;
                    model["CREATE_DATE"] = utils.convertDateToISOString(kendo.parseDate(modelData.CREATE_DATE));
                }
                model["MODIFY_USER"] = data.user.USER_ID;
                model["MODIFY_DATE"] = utils.convertDateToISOString(new Date());
            }
            model["COMPANY_ID"] = data.companyId;
        }
        return model;
    }

    editSaveClick = function (sender) {
        var mode = $(sender.options.title).text().trim().startsWith("Edit:") ? "edit" : "create";
        var key = $(sender.options.title).text().replace("Edit:", "").trim();
        var domId = `#${utils.getFormId()}`;
        var validator = $(domId).data("kendoValidator");
        if (!validator.validate()) {
            return;
        } else {
            var pageSetting = utils.getMasterForm();
            pageSetting.id = pageSetting.id.replace("_gridEdit", "");
            var grid = $(`#${pageSetting.id} [name="${pageSetting.gridConfig.gridName}"]`).data("kendoGrid");
            var model = controllers.masterRecords.getValuesFromControls(pageSetting, mode, key);
            $.ajax({
                url: pageSetting.updateUrl,
                type: "post",
                data: { model: model, mode: mode },
                beforeSend: function () {
                    kendo.ui.progress($(domId), true);
                },
                success: function (result) {
                    console.log(result);
                    utils.showNotification("Save success", "success");
                },
                error: function (err) {
                    console.log(err);
                    utils.showNotification("Save failed, please contact system administrator!", "error");
                },
                complete: function () {
                    grid.dataSource.read();
                    kendo.ui.progress($(domId), false);
                    sender.destroy();
                }
            });
        }
    }

    deleteConfirmClick = function (e) {
        console.log(e);
        var grid = $(`#${utils.getFormId()} [name="${e.pageSetting.gridConfig.gridName}"]`).data("kendoGrid");
        var domId = `#${utils.getFormId()}`;
        $.ajax({
            url: e.pageSetting.deleteUrl,
            type: "post",
            dataType: "text",
            data: { id: e.key },
            beforeSend: function () {
                kendo.ui.progress($(domId), true);
            },
            success: function (result) {
                console.log(result);
                utils.showNotification("Record deleted", "success");
            },
            error: function (err) {
                console.log(err);
                utils.showNotification("Delete failed, please contact system administrator!", "error");
            },
            complete: function () {
                grid.dataSource.read();
                kendo.ui.progress($(domId), false);
            }
        });
    }
}