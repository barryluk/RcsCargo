export default class {
    constructor() {
    }

    //Render form controls (KendoUI)
    renderFormControl_kendoUI = function (masterForm, enableValidation = false) {
        masterForm.id = utils.getFormId();
        //kendoValidator
        var validator = $(`#${masterForm.id}`).data("kendoValidator");
        if (validator == null && enableValidation) {
            var rules = {
                chipListRequired: function (input) {
                    var result = true;
                    if (input.is("[type=chipList]")) {
                        if (input.is("[required-checking='true']")) {
                            if (input.data("kendoButtonGroup").data("kendoChipList").items().length == 0)
                                result = false;
                        }
                    }
                    return result;
                },
                buttonGroupRequired: function (input) {
                    var result = true;
                    if (input.is("[type=buttonGroup]")) {
                        if (input.is("[required-checking='true']")) {
                            if (input.data("kendoButtonGroup").current().length == 0)
                                result = false;
                        }
                    }
                    return result;
                },
                gridRequired: function (input) {
                    var result = true;
                    if (input.is("[type=grid]")) {
                        if (input.is("[required-checking='true']")) {
                            if (input.data("kendoGrid").dataSource.data().length == 0)
                                result = false;
                            else {
                                var rowsCount = 0;
                                input.data("kendoGrid").dataSource.data().forEach(function (row) {
                                    if (!utils.isGridRowDeleted(input.data("kendoGrid"),
                                        input.data("kendoGrid").dataSource.data().indexOf(row))) {
                                        rowsCount++;
                                    }
                                });
                                if (rowsCount == 0)
                                    result = false;
                            }
                        }
                    }
                    return result;
                },
                gridDataValidate: function (input) {
                    var result = true;
                    if (input.is("[type=grid]")) {
                        var grid = input.data("kendoGrid");
                        var gridConfig = utils.getFormControlByName(input.attr("name").replace("grid_", ""));

                        grid.dataSource.data().forEach(function (item) {
                            for (var i in gridConfig.fields) {
                                if (gridConfig.fields[i].validation != null) {
                                    if (gridConfig.fields[i].validation.required == true) {
                                        try {
                                            if (utils.isEmptyString(item[i])) {
                                                result = false;
                                            }
                                        } catch {
                                            console.log("err", i);
                                            //result = false;
                                        }
                                    }
                                }
                            }
                        });
                    }
                    return result;
                },
            };

            function getGridDataValidateMessage(input) {
                var result = "The following field(s) are required: ";
                if (input.is("[type=grid]")) {
                    var grid = input.data("kendoGrid");
                    var gridConfig = utils.getFormControlByName(input.attr("name").replace("grid_", ""));

                    grid.dataSource.data().forEach(function (item) {
                        for (var i in gridConfig.fields) {
                            if (gridConfig.fields[i].validation != null) {
                                if (gridConfig.fields[i].validation.required == true) {
                                    try {
                                        if (utils.isEmptyString(item[i])) {
                                            console.log(item, i);
                                            if (result.indexOf(i) == -1)
                                                result += i + ", ";
                                        }
                                    } catch {
                                        console.log("err", item, i);
                                        if (result.indexOf(i) == -1)
                                            result += i + ", ";
                                    }
                                }
                            }
                        }
                    });
                }
                return result.substring(0, result.length - 2);
            }

            var messages = {
                chipListRequired: "At least 1 record must be added.",
                buttonGroupRequired: "At least 1 option must be selected.",
                gridRequired: "At least 1 record must be added.",
                gridDataValidate: function (input) {
                    return getGridDataValidateMessage(input);
                },
            };

            if (masterForm.schema.validation != null) {
                rules = Object.assign({}, rules, masterForm.schema.validation.rules);
                messages = Object.assign({}, messages, masterForm.schema.validation.messages);
            }

            validator = $(`#${masterForm.id}`).kendoValidator({
                rules: rules,
                messages: messages,
                errorTemplate: ({ message }) => utils.validatorErrorTemplate(message),
                validate: function (e) {
                    if (!e.valid) {
                        setTimeout(function () {
                            validator.hideMessages();
                        }, 1000 * 6);
                    }
                }
            }).data("kendoValidator");

            validator._inputSelector = "[type=grid],[type=buttonGroup],[type=chipList],:input:not(:button,[type=submit],[type=reset],[disabled],[readonly])[data-validate!=false]";
            testObj = validator;
        }
        
        //kendoToolBar
        $(`#${masterForm.id} div.toolbar`).each(function () {
            $(this).kendoToolBar({
                items: masterForm.toolbar
            });
        });
        $(`#${masterForm.id} [data-role=dropdownbutton]`).append(`<span class="k-icon k-i-arrow-s k-button-icon"></span>`);

        if (masterForm.schema != null) {
            if (masterForm.schema.fields.filter(a => a.name == "FRT_MODE").length == 0)
                $(`#${masterForm.id} .toolbar.k-toolbar`).append(`<span class="toolbar-status"></span>`);
            else
                $(`#${masterForm.id} .toolbar.k-toolbar`).append(`<span class="toolbar-frtMode"></span><span class="toolbar-status"></span>`);
        }

        //New button click event
        $(`#${masterForm.id} button .k-i-file-add`).parent().bind("click", function () {
            var formId = utils.getFormId($(this));
            if (formId.split("_")[1] == "NEW") {
                $("#btnRefresh_" + formId).trigger("click");
            } else {
                var controller = formId.split("_")[0];
                controls.append_tabStripMain(`${masterForm.title} NEW`, `${controller}_NEW_${data.companyId}_${utils.getFrtMode()}`, controller);
            }
        });

        //Save button click event
        $(`#${masterForm.id} button .k-i-save`).parent().bind("click", function () {
            //Get the masterForm settings from id element
            masterForm = utils.getMasterForm();
            if (!validator.validate()) {
                return;
            } else {
                var model = controls.getValuesFromFormControls(masterForm);
                console.log(masterForm, model);
                //return;

                $.ajax({
                    url: masterForm.updateUrl,
                    type: "post",
                    data: { model: model, mode: masterForm.mode },
                    beforeSend: function () {
                        kendo.ui.progress($(`#${masterForm.id}`), true);
                    },
                    success: function (result) {
                        console.log(result);
                        if (masterForm.mode == "edit") {
                            $(`#btnRefresh_${masterForm.id}`).trigger("click");
                        } else {
                            var controller = masterForm.id.split("_")[0];
                            var newId = `${controller}_${utils.encodeId(result[masterForm.idField])}_${data.companyId}_${utils.getFrtMode()}`;

                            //Change the form control values
                            var tabHtml = $(`#btnRefresh_${masterForm.id}`).parent().html();
                            tabHtml = tabHtml.replaceAll("NEW", utils.encodeId(result[masterForm.idField]));
                            tabHtml = tabHtml.replace(masterForm.title + " " + utils.encodeId(result[masterForm.idField]), masterForm.title + " " + result[masterForm.idField]);
                            $(`#btnRefresh_${masterForm.id}`).parent().html(tabHtml);
                            $(`#${masterForm.id}`).attr("id", newId);
                            $(`#${newId} h3`).text(`${masterForm.title} ${utils.encodeId(result[masterForm.idField])}`);

                            $("#btnClose_" + newId).click(function () {
                                var tabStrip = $("#tabStripMain").data("kendoTabStrip");
                                tabStrip.remove(tabStrip.tabGroup.find("[id='btnClose_" + newId + "']").parent().parent());
                                tabStrip.activateTab("li:last");
                            });

                            $("#btnRefresh_" + newId).click(function () {
                                kendo.ui.progress($(`#${newId}`), true);
                                controls.edit.initEditPage(newId);
                            });

                            $("#btnRefresh_" + newId).trigger("click");
                        }
                        utils.showNotification("Save success", "success");
                    },
                    error: function (err) {
                        console.log(err);
                        utils.showNotification("Save failed, please contact system administrator!", "error");
                    },
                    complete: function () {
                        kendo.ui.progress($(`#${utils.getFormId()}`), false);
                    }
                });
            }
        });

        //kendoDatePicker
        $(`#${masterForm.id} input[type=date]`).each(function () {
            $(this).kendoDatePicker({
                format: data.dateFormat
            });
        });

        //kendoDateTimePicker
        $(`#${masterForm.id} input[type=dateTime]`).each(function () {
            $(this).kendoDateTimePicker({
                format: data.dateTimeFormat
            });
        });

        //kendoDateRangePicker
        $(`#${masterForm.id} div[type=dateRange]`).each(function () {
            $(this).kendoDateRangePicker({
                labels: false,
                format: data.dateFormat,
                range: {
                    start: utils.addDays(new Date(), -60),
                    end: new Date()
                }
            });

            $(this).find("span").eq(2).html(`<i class="fa-solid fa-arrows-left-right"></i>`)
        });

        //kendoButtonGroup for customerType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=customerType]`).each(function () {
            var control = $(this);
            $(this).kendoButtonGroup({
                selection: "multiple",
                items: data.masterRecords.customerType,
                select: function (e) {
                    //var frtMode = this.current().text() == "Export" ? "AE" : "AI";
                    //$(`#${masterForm.id} input[name="FRT_MODE"]`).val(frtMode);
                }
            });
        });

        //kendoButtonGroup for frtMode
        $(`#${masterForm.id} div[type=buttonGroup][dataType=frtMode], #${masterForm.id} .toolbar-frtMode`).each(function () {
            $(this).kendoButtonGroup({
                items: [
                    { text: "Export", iconClass: "fa fa-plane-departure", selected: true },
                    { text: "Import", iconClass: "fa fa-plane-arrival" },
                ],
                select: function (e) {
                    var frtMode = this.current().text() == "Export" ? "AE" : "AI";
                    $(`#${masterForm.id} input[name="FRT_MODE"]`).val(frtMode);
                }
            });
        });

        //kendoButtonGroup for bookingType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=bookingType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.bookingType,
                index: 0
            });
        });

        //kendoButtonGroup for jobType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=jobType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.jobType,
                select: function (e) {
                    try {
                        eval(`controllers.airMawb.changedJobType(e.sender)`);
                    } catch { }
                },
                index: 0
            });
        });

        //kendoButtonGroup for printDateType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=printDateType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.printDateType,
                index: 0
            });
        });

        //kendoButtonGroup for invoiceType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=invoiceType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.invoiceType,
                index: 0
            });
        });

        //kendoButtonGroup for invoiceCategory
        $(`#${masterForm.id} div[type=buttonGroup][dataType=invoiceCategory]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.invoiceCategory,
                index: 0
            });
        });

        //kendoButtonGroup for pvType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=pvType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.masterRecords.pvType,
                index: 0
            });
        });

        //kendoSwitch
        $(`#${masterForm.id} input[type=switch]`).each(function () {
            $(this).kendoSwitch({
                messages: {
                    checked: "yes",
                    unchecked: "no"
                },
                size: "small",
                checked: true
            });
        });

        //kendoTextArea
        $(`#${masterForm.id} textarea[type=textArea]`).each(function () {
            $(this).kendoTextArea({
                rows: 8,
                maxLength: 1000
            });

            $(this).attr("style", $(this).attr("style") + "height: 100%;");
        });

        //kendoNumericTextBox
        $(`#${masterForm.id} input[type*=number]`).each(function () {
            var decimal = 2;
            var format = "n";
            if ($(this).attr("type") == "numberInt") {
                decimal = 0;
                format = "n0";
            }
            $(this).kendoNumericTextBox({
                decimals: decimal,
                restrictDecimals: true,
                format: format,
            });
        });

        //kendoDropDownList for CustomerView
        $(`#${masterForm.id} input[type=customer]`).each(function () {
            var filterValue = "";
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "CUSTOMER_DESC",
                dataValueField: "CUSTOMER_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Home/GetCustomers",
                                    data: { searchValue: filterValue, take: data.take },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        for (var i in result) {
                                            result[i].CUSTOMER_DESC = result[i].CUSTOMER_CODE + " - " + result[i].CUSTOMER_DESC + " - " + result[i].BRANCH_CODE;
                                            result[i].CUSTOMER_CODE = result[i].CUSTOMER_CODE + "-" + result[i].BRANCH_CODE + "-" + result[i].SHORT_DESC;
                                        }
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                }
            });
        });

        //kendoDropDownList for CustomerView (with address)
        $(`#${masterForm.id} input[type*=customerAddr]`).each(function () {
            var filterValue = "";
            let ddl = $(this);
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "CUSTOMER_DESC",
                dataValueField: "CUSTOMER_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                autoWidth: true,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success(data.masterRecords.customers);
                            else {
                                let searchValue = utils.formatText(filterValue);
                                let customers = data.masterRecords.customers.filter(a =>
                                    a.CUSTOMER_CODE.startsWith(searchValue) || a.CUSTOMER_DESC.indexOf(searchValue) != -1 || a.SHORT_DESC.startsWith(searchValue)
                                );
                                if (customers.length > 0) {
                                    options.success(customers);
                                } else {
                                    $.ajax({
                                        url: "../Home/GetCustomers",
                                        data: { searchValue: filterValue, take: data.take },
                                        dataType: "json",
                                        type: "post",
                                        success: function (result) {
                                            for (var i in result) {
                                                result[i].CUSTOMER_DESC = result[i].CUSTOMER_CODE + " - " + result[i].CUSTOMER_DESC + " - " + result[i].BRANCH_CODE;
                                                result[i].CUSTOMER_CODE = result[i].CUSTOMER_CODE + "-" + result[i].BRANCH_CODE + "-" + result[i].SHORT_DESC;
                                            }
                                            options.success(result);
                                        }
                                    });
                                }
                            }
                        },
                    }
                },
                select: function (e) {
                    //console.log(masterForm.id);
                    if (!masterForm.id.endsWith("_createInvoice"))
                        masterForm.id = utils.getFormId(this.element);
                    var item = e.dataItem;
                    if (item == null) {
                        item = e.sender.dataSource.data()[e.sender.selectedIndex - 1];
                    }
                    //console.log(item);
                    var controlName = $(this.element).attr("name");
                    //$(`#${masterForm.id} input[name=${controlName}]`).val(item.CUSTOMER_DESC);
                    $(`#${masterForm.id} input[name=${controlName}_CODE]`).val(item.CUSTOMER_CODE);
                    $(`#${masterForm.id} input[name=${controlName}_BRANCH]`).val(item.BRANCH_CODE);
                    $(`#${masterForm.id} input[name=${controlName}_SHORT_DESC]`).val(item.SHORT_DESC);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR1]`).val(item.ADDR1);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR2]`).val(item.ADDR2);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR3]`).val(item.ADDR3);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR4]`).val(item.ADDR4);

                    if (data.masterRecords.customers.filter(a => a.CUSTOMER_CODE == item.CUSTOMER_CODE).length == 0) {
                        data.masterRecords.customers.push({
                            CUSTOMER_CODE: item.CUSTOMER_CODE,
                            CUSTOMER_DESC: item.CUSTOMER_DESC,
                            BRANCH_CODE: item.BRANCH_CODE,
                            SHORT_DESC: item.SHORT_DESC,
                            ADDR1: item.ADDR1,
                            ADDR2: item.ADDR2,
                            ADDR3: item.ADDR3,
                            ADDR4: item.ADDR4,
                        });
                    }
                },
                open: function (e) {
                    var value = $(e.sender.element[0]).parent().next().val().split("-")[0];
                    $(e.sender.filterInput).val(value);
                }
            });
        });

        //kendoDropDownList for Country
        $(`#${masterForm.id} input[type=country]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "COUNTRY_DESC",
                dataValueField: "COUNTRY_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.countries },
            });
        });

        //kendoDropDownList for Port
        $(`#${masterForm.id} input[type=port]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "PORT_DESC_DISPLAY",
                dataValueField: "PORT_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.ports },
            });
        });

        //kendoDropDownList for Airline
        $(`#${masterForm.id} input[type=airline]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "AIRLINE_DESC_DISPLAY",
                dataValueField: "AIRLINE_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.airlines },
            });
        })

        //kendoDropDownList for EDI Terminal
        $(`#${masterForm.id} input[type=ediTerminal]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: { data: data.masterRecords.ediTerminal },
            });
        })

        //kendoDropDownList for vwts factor
        $(`#${masterForm.id} input[type=vwtsFactor]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.vwtsFactor
            });
        });

        //kendoDropDownList for incoterm
        $(`#${masterForm.id} input[type=incoterm]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.masterRecords.incoterm
            });
        });

        //kendoDropDownList for payment terms
        $(`#${masterForm.id} input[type=paymentTerms]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: data.masterRecords.paymentTerms
            });
        });

        //kendoDropDownList for show charges
        $(`#${masterForm.id} input[type=showCharges]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataTextField: "text",
                dataValueField: "value",
                dataSource: data.masterRecords.showCharges
            });
        });

        //kendoDropDownList for flight service type
        $(`#${masterForm.id} input[type=fltServiceType]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                dataSource: data.masterRecords.fltServiceType
            });
        });

        //kendoDropDownList for selectMawb
        $(`#${masterForm.id} input[type=selectMawb]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "MAWB_NO",
                dataValueField: "MAWB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: (dataItem) => `${dataItem.MAWB_NO} / ${dataItem.JOB_NO} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
                    ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Hawb/GetMawbs",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.MAWB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectJob
        $(`#${masterForm.id} input[type=selectJob]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "JOB_NO",
                dataValueField: "JOB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: function (dataItem) {
                    if (dataItem.MAWB_NO == null) {
                        if (dataItem.DEST_CODE == null)
                            dataItem.DEST_CODE = "-";
                        return `${dataItem.JOB_NO}, ${dataItem.DEST_CODE}, ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`;
                    } else {
                        return `${dataItem.JOB_NO}, ${dataItem.MAWB_NO}, ${dataItem.DEST_CODE}, ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`;
                    }
                },
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Invoice/GetJobNos",
                                    data: {
                                        searchValue: utils.formatText(filterValue),
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.JOB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectLot
        $(`#${masterForm.id} input[type=selectLot]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "LOT_NO",
                dataValueField: "LOT_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: (dataItem) => `${dataItem.LOT_NO} / ${dataItem.ORIGIN_CODE} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
                    ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Mawb/GetLotNos",
                                    data: {
                                        searchValue: utils.formatText(filterValue),
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.LOT_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for selectHawb
        $(`#${masterForm.id} input[type=selectHawb]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "HAWB_NO",
                dataValueField: "HAWB_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: (dataItem) => `${dataItem.HAWB_NO} / ${dataItem.MAWB_NO} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
                    ${kendo.toString(kendo.parseDate(dataItem.FLIGHT_DATE), data.dateFormat)}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    //console.log(options.data.filter.filters[0].value, ddl.optionLabel.text());
                                    if (options.data.filter.filters[0].value.toUpperCase() != ddl.optionLabel.text().toUpperCase())
                                        filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Hawb/GetHawbs",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                },
                select: function (e) {
                    filterValue = e.dataItem.HAWB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                }
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for unUsedBooking
        $(`#${masterForm.id} input[type=unUsedBooking]`).each(function () {
            var filterValue = "";
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                filter: "startswith",
                dataTextField: "BOOKING_NO",
                dataValueField: "BOOKING_NO",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                template: ({ BOOKING_NO, ORIGIN_CODE, DEST_CODE, CONSIGNEE_DESC }) => `${BOOKING_NO} / ${ORIGIN_CODE} - ${DEST_CODE} / ${CONSIGNEE_DESC}`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            if (options.data.filter != null) {
                                try {
                                    filterValue = options.data.filter.filters[0].value;
                                } catch { }
                            }
                            if (filterValue == "")
                                options.success([]);
                            else {
                                $.ajax({
                                    url: "../Air/Hawb/GetUnusedBooking",
                                    data: {
                                        searchValue: filterValue,
                                        companyId: data.companyId,
                                        frtMode: utils.getFrtMode(masterForm.id)
                                    },
                                    dataType: "json",
                                    type: "post",
                                    success: function (result) {
                                        options.success(result);
                                    }
                                });
                            }
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                },
                select: function (e) {
                    var callbackFunction = data.masterForms.filter(a => a.formName == "airHawb")[0]
                        .formGroups.filter(a => a.name == "mainInfo")[0]
                        .formControls.filter(a => a.name == "BOOKING_NO")[0].callbackFunction;
                    eval(`${callbackFunction}(e)`);
                },
            }).data("kendoDropDownList");
        });

        //kendoDropDownList for log files
        $(`#${masterForm.id} input[type=logFiles]`).each(function () {
            var ddl = $(this).kendoDropDownList({
                autoWidth: true,
                optionLabel: "Select log file",
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: "../Admin/System/GetLogFiles",
                                success: function (result) {
                                    options.success(result);
                                }
                            });
                        },
                    }
                },
                select: function (e) {
                    $.ajax({
                        url: "../Admin/System/GetLog",
                        dataType: "text",
                        data: { fileName: e.dataItem },
                        success: function (result) {
                            $(`#${utils.getFormId()} [name="logContent"]`).html(result.replaceAll("\r\n", "<br>"));
                        }
                    });
                },
            }).data("kendoDropDownList");
        });

        //kendoButton
        $(`#${masterForm.id} button[type=button].customButton`).each(function () {
            var icon = $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1).length == 1 ?
                $(this).attr("class").split(" ").filter(a => a.indexOf("button-icon-") != -1)[0].replace("button-icon-", "") : "";
            $(this).kendoButton({ icon: icon });
        });

        //kendoDropDownList for currency
        $(`#${masterForm.id} input[type=currency]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "CURR_CODE",
                dataValueField: "CURR_CODE",
                optionLabel: " ",
                dataSource: data.masterRecords.currencies,
                cascade: function (e) {
                    //e.sender._cascadedValue => selected value
                    if (e.userTriggered == true) {
                        testObj = e;
                        var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                        var formControl = utils.getFormControlByName(e.sender.element.attr("name"));
                        if (formControl != null) {
                            if (formControl.exRateName != null) {
                                $(`[name="${formControl.exRateName}"]`).val(exRate);
                            }
                        }
                    }
                },
            });
        });

        //kendoDropDownList for charge template
        $(`#${masterForm.id} input[type=chargeTemplate]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: "Select for charge template...",
                filter: "startswith",
                dataSource: { data: data.masterRecords.chargeTemplates },
                select: function (e) {
                    if (e.dataItem != null) {
                        var templateName = e.dataItem;
                        var grid = $(`#${masterForm.id} [name=${e.sender.element.attr("targetControl")}]`).data("kendoGrid");
                        var cwts = utils.getFormValue("CWTS", e.sender.element);

                        $.ajax({
                            url: "../Home/GetChargeTemplate",
                            data: { companyId: data.companyId, templateName: templateName },
                            dataType: "json",
                            success: function (templateItems) {
                                templateItems.forEach(function (item) {
                                    item.EX_RATE = utils.getExRate(item.CURR_CODE);
                                    item.QTY = item.UNIT == "KGS" ? cwts : 1;
                                    item.QTY_UNIT = item.UNIT;
                                    item.MIN_CHARGE = item.MIN_AMOUNT;
                                    item.AMOUNT = item.QTY * item.PRICE;
                                    item.AMOUNT = item.MIN_AMOUNT > item.AMOUNT ? item.MIN_AMOUNT : item.AMOUNT;
                                    item.AMOUNT_HOME = utils.roundUp(item.AMOUNT * item.EX_RATE, 0);

                                    //dirty visual effects
                                    grid.dataSource.data().push(item);
                                    var dsItem = grid.dataSource.data()[grid.dataSource.data().length - 1];
                                    dsItem.dirty = true;
                                    dsItem.dirtyFields = { CHARGE_CODE: true, CURR_CODE: true, EX_RATE: true, QTY: true, QTY_UNIT: true, PRICE: true, MIN_CHARGE: true, AMOUNT: true, AMOUNT_HOME: true };
                                });
                                grid.dataSource.trigger("change");
                                //trigger the formula event
                                grid.editCell(`#${utils.getFormId()} [name="${$(grid.element[0]).attr("name")}"] tr:last td:first`);
                                grid.closeCell();
                            }
                        });
                    }
                },
            });
        });

        //kendoDropDownList for Region
        $(`#${masterForm.id} input[type=region]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                optionLabel: " ",
                dataSource: data.masterRecords.region,
            });
        });

        //kendoDropDownList for PACKAGE_UNIT
        $(`#${masterForm.id} input[type=pkgUnit]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.packageUnit
            });
        });

        //kendoDropDownList for ChargeUnit
        $(`#${masterForm.id} input[type=chargeQtyUnit]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.masterRecords.chargeQtyUnit
            });
        });

        //kendoDropDownList for GroupCode
        $(`#${masterForm.id} input[type=groupCode]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                filter: "startswith",
                dataSource: data.masterRecords.groupCodes
            });
        });

        //kendoGrid
        $(`#${masterForm.id} div[type=grid]`).each(function () {
            var editable = { mode: "incell", confirmation: false };
            var controlName = $(this).attr("name");
            var gridConfig = utils.getFormControlByName(controlName.replace("grid_", ""));
            if (gridConfig.editable == false)
                editable = false;

            if (gridConfig.toolbar == null)
                gridConfig.toolbar = ["create", "cancel"];     //default buttons
            else if (gridConfig.toolbar.length == 0)
                gridConfig.toolbar = null;                     //disable the toolbar if don't want to show (toolbar: [] in the setting js)

            //Calculate the grid width, 
            var gridWidth = 25;     //initial width
            gridConfig.columns.forEach(function (col) {
                gridWidth += col.width == null ? 70 : col.width;
            });
            $(this).kendoGrid({
                toolbar: gridConfig.toolbar,
                columns: gridConfig.columns,
                editable: editable,
                resizable: true,
                navigatable: true,
                width: gridWidth,
                selectable: "cell",
                dataBound: function (e) {

                    //Toolbar custom button events
                    if (gridConfig.toolbar != null) {
                        gridConfig.toolbar.forEach(function (button) {
                            if (button != "create" && button != "cancel") {
                                if (button.callbackFunction != null) {
                                    var formId = utils.getFormId($(e.sender.element));
                                    //remove all bindings for the control, to prevent duplicated events
                                    $(`#${masterForm.id} [name="${controlName}"] button.k-grid-${button.name}`).unbind();
                                    $(`#${masterForm.id} [name="${controlName}"] button.k-grid-${button.name}`).bind("click", function (e) {
                                        eval(`${button.callbackFunction}(e.target)`);
                                    });
                                }
                            }
                        })
                    }

                    if (gridConfig.events != null) {
                        if (gridConfig.events.filter(a => a.eventType == "dataBound").length == 1) {
                            var event = events.filter(a => a.eventType == "dataBound")[0];
                            eval(`${event.callbackFunction}(e)`);
                        }
                    }

                    //Cancel edit will trigger dataBound event, calculate the total amount
                    if (gridConfig.formulas != null) {
                        gridConfig.formulas.forEach(function (formula) {
                            if (formula.fieldName.startsWith("master.")) {
                                var gridCell = $(`#${utils.getFormId()} [name="${controlName}"] tr:last td:first`);
                                controls.kendo.gridFormula(gridCell, formula.fieldName, formula.formula);
                            }
                        });
                    }
                },
                cellClose: function (e) {
                    if (gridConfig.formulas != null) {
                        gridConfig.formulas.forEach(function (formula) {
                            controls.kendo.gridFormula(e.container, formula.fieldName, formula.formula);
                        });
                    }
                },
                saveChanges: function (e) {
                    e.preventDefault();
                    if (gridConfig.toolbar != null) {
                        if (gridConfig.toolbar.filter(a => a.name == "save").length == 1) {
                            if (gridConfig.toolbar.filter(a => a.name == "save")[0].callbackFunction != null)
                                eval(`${gridConfig.toolbar.filter(a => a.name == "save")[0].callbackFunction}(e)`);
                        }
                    }
                },
                remove: function (e) {
                    e.preventDefault();

                    //calculate the total amount when row deleted
                    if (gridConfig.formulas != null) {
                        gridConfig.formulas.forEach(function (formula) {
                            if (formula.fieldName.startsWith("master.")) {
                                var gridCell = $(`#${utils.getFormId()} [name="${controlName}"] tr:last td:first`);
                                controls.kendo.gridFormula(gridCell, formula.fieldName, formula.formula);
                            }
                        });
                    }

                    if (gridConfig.deleteCallbackFunction != null) {
                        eval(`${gridConfig.deleteCallbackFunction}(e)`);
                    }
                },
                change: function (e) {
                    var grid = this;
                    var selectedCell = this.select()[0];
                    if ($(selectedCell).hasClass("link-cell")) {
                        var id = $(selectedCell).text();
                        id = `${gridConfig.linkIdPrefix}_${id}_${data.companyId}_${utils.getFrtMode()}`;
                        controls.append_tabStripMain(`${gridConfig.linkTabTitle} ${$(selectedCell).text()}`, id, gridConfig.linkIdPrefix);
                        grid.clearSelection();
                    }
                },
            });
        });
    }

    //kendoGrid related functions
    gridFormula = function (container, fieldName, formula) {
        //console.log(container, fieldName, formula);
        if (fieldName.startsWith("master.")) {
            if (formula.startsWith("SUM(")) {
                formula = formula.replace("SUM(", "");
                formula = formula.substr(0, formula.length - 1);

                formula.split("{").forEach(function (field) {
                    if (field.length > 0) {
                        var field = field.substring(0, field.indexOf("}"));
                        var sum = 0;
                        if (field.startsWith("master.")) {
                            sum = $(`#${utils.getFormId()} [name="${field.replace("master.", "")}"]`).val();
                        } else {
                            controls.kendo.gridGetCellValues(container, field).forEach(function (value) { sum += value });
                        }
                        formula = formula.replace(`{${field}}`, sum);
                    }
                });

                try { $(`#${utils.getFormId()} [name="${fieldName.replace("master.", "")}"]`).val(utils.roundUp(eval(formula), 2)); }
                catch { }
                //console.log(formula, eval(formula));
            }
        } else {
            formula.split("{").forEach(function (field) {
                if (field.length > 0) {
                    var field = field.substring(0, field.indexOf("}"));
                    formula = formula.replace(`{${field}}`, controls.kendo.gridGetCellValue(container, field));
                }
            });

            //console.log(formula);

            if (formula.indexOf("*") != -1 || formula.indexOf("/") != -1)
                controls.kendo.gridSetCellValue(container, fieldName, utils.roundUp(eval(formula), 2));
            else {
                try {
                    controls.kendo.gridSetCellValue(container, fieldName, eval(formula));
                }
                catch {
                    controls.kendo.gridSetCellValue(container, fieldName, formula);
                }
            }
        }
    }

    gridGetCellValues = function (container, fieldName) {
        var grid = $(container).closest("div[type=grid]").data("kendoGrid");
        var values = [];

        if (grid != null) {
            grid.dataSource.data().forEach(function (dataItem) {
                if (!utils.isGridRowDeleted(grid, (grid.dataSource.data().indexOf(dataItem)))) {
                    values.push(dataItem[fieldName]);
                }
            })
        }
        return values;
    }

    gridGetCellValue = function (container, fieldName) {
        var grid = $(container).closest("div[type=grid]").data("kendoGrid");
        var uid = $(container).parent().attr("data-uid");
        if (uid != null) {
            return grid.dataSource._data.filter(a => a.uid == uid)[0][fieldName];
        }
    }

    //kendoGrid update cell value and dataSource in the same row
    gridSetCellValue = function (container, fieldName, value) {
        var grid = $(container).closest("div[type=grid]").data("kendoGrid");
        var uid = $(container).parent().attr("data-uid");
        var colIndex = $(container).closest("div[type=grid]").find(`th[scope=col][data-field=${fieldName}]`).attr("data-index");
        if (colIndex != null) {
            $(container).parent().find("td").eq(colIndex).addClass("k-dirty-cell");
            $(container).parent().find("td").eq(colIndex).html(`<span class="k-dirty"></span>${value}`);
        }
        if (uid != null) {
            grid.dataSource._data.filter(a => a.uid == uid)[0][fieldName] = value;
        }
    }

    //kendoGrid kendoDropDownList for Charges
    renderGridEditorCharges = function (container, options) {
        var filterValue = options.model.CHARGE_CODE;
        var ddl = $(`<input name="${options.field}" style="width: 80px; margin-right: 5px;" />`);
        var txt = $(`<input name="CHARGE_DESC" style="width: 170px" />`);
        ddl.appendTo(container);
        txt.appendTo(container);
        txt.kendoTextBox();

        ddl.kendoDropDownList({
            autoWidth: true,
            filter: "startswith",
            dataTextField: "CHARGE_DESC_DISPLAY",
            dataValueField: "CHARGE_CODE",
            optionLabel: `Select charges ...`,
            dataSource: {
                type: "json",
                data: data.masterRecords.charges,
            },
            open: function (e) {
                $(e.sender.filterInput).val(filterValue);
            },
            select: function (e) {
                $(txt).data("kendoTextBox").value(e.dataItem.CHARGE_DESC);
                controls.kendo.gridSetCellValue(container, "CHARGE_DESC", e.dataItem.CHARGE_DESC);
            }
        });
    }

    //kendoGrid kendoDropDownList for Currency
    renderGridEditorCurrency = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            dataTextField: "CURR_CODE",
            dataValueField: "CURR_CODE",
            dataSource: data.masterRecords.currencies,
            cascade: function (e) {
                //e.sender._cascadedValue => selected value
                if (e.userTriggered == true) {
                    var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                    controls.kendo.gridSetCellValue(container, "EX_RATE", exRate);
                }
            },
        });
    }

    //kendoGrid kendoDropDownList for Country
    renderGridEditorCountry = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            filter: "startswith",
            dataTextField: "COUNTRY_CODE",
            dataValueField: "COUNTRY_CODE",
            dataSource: data.masterRecords.countries,
        });
    }

    //kendoGrid kendoDropDownList for Port
    renderGridEditorPort = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            filter: "startswith",
            dataTextField: "PORT_CODE",
            dataValueField: "PORT_CODE",
            dataSource: data.masterRecords.ports,
        });
    }

    //kendoGrid kendoCheckBox
    renderGridEditorCheckBox = function (container, options) {
        var ckb = $(`<input name="${options.field}" />`);
        ckb.appendTo(container);
        ckb.kendoCheckBox({
            checked: options.model[options.field] == "Y" ? true : false,
        });
    }

    //kendoGrid kendoDropDownList for Package Qty Unit
    renderGridEditorPackageQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.packageUnit
        });
    }

    //kendoGrid kendoDropDownList for Charge Qty Unit
    renderGridEditorChargeQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataSource: data.masterRecords.chargeQtyUnit
        });
    }

    //kendoGrid special controls from Loadplan Equipments
    renderGridEditorLoadplanEquipHawbNos = function (container, options) {
        var formId = utils.getFormId($(container));
        var gridHawbList = $(`#${formId} [name="grid_LoadplanHawbListViews"]`).data("kendoGrid");
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            dataTextField: "HAWB_NO",
            dataValueField: "HAWB_NO",
            dataSource: gridHawbList.dataSource.data(),
        });
    }

    renderGridEditorLoadplanEquips = function (container, options) {
        var cbb = $(`<input name="${options.field}" style="width: 80px; height: 25.6px; margin-right: 5px;" />`);
        var txt = $(`<input name="EQUIP_DESC" style="width: 150px" />`);
        cbb.appendTo(container);
        txt.appendTo(container);

        txt.kendoTextBox();
        cbb.kendoComboBox({
            autoWidth: true,
            size: "small",
            dataSource: data.masterRecords.equipCodes
        });
    }

    renderGridEditorBranch = function (container, options) {
        var formId = utils.getFormId($(container));
        var gridCustomerName = $(`#${formId} [name="grid_CustomerNames"]`).data("kendoGrid");
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            optionLabel: " ",
            dataTextField: "BRANCH_CODE",
            dataValueField: "BRANCH_CODE",
            dataSource: gridCustomerName.dataSource.data(),
        });
    }

    renderGridEditorShortDesc = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        var formId = utils.getFormId($(container));
        var gridCustomerName = $(`#${formId} [name="grid_CustomerNames"]`).data("kendoGrid");
        ddl.appendTo(container);
        ddl.kendoDropDownList({
            optionLabel: " ",
            dataTextField: "SHORT_DESC",
            dataValueField: "SHORT_DESC",
            dataSource: gridCustomerName.dataSource.data(),
        });
    }

    gridAutoFitColumns = function (grid) {
        //kendoTabStrip animation issue, disable the animation of the tabStrip will not need the setTimeout anymore
        //setTimeout(function () {
        var colMaxWidth = grid.thead.find("th").length > 5 ? 280 : 600;
        var row = [];
        var colIndex = 0;
        var tableWidth = 0;
        var font = utils.getCanvasFont(grid.thead.find(".k-column-title")[0]);
        
        //get the text width from table header
        grid.thead.find("th").each(function () {
            if (this.style.display != "none") {
                var width = utils.getTextWidth(this.innerText, font) + 18;
                if (width > colMaxWidth) {
                    width = colMaxWidth;
                }
                row.push({ colIndex: colIndex, width: width });
                colIndex++;
            }
        });

        //get the text width from table body
        grid.tbody.find("tr").each(function () {
            colIndex = 0;
            $(this).find("td").each(function () {
                if (this.style.display != "none") {
                    if (!utils.isEmptyString(this.innerText)) {
                        var width = utils.getTextWidth(this.innerText, font) + 15;
                        if (width > colMaxWidth) {
                            width = colMaxWidth;
                        }
                        if (width > row[colIndex].width) {
                            row[colIndex].width = width;
                        }
                    }
                    colIndex++;
                }
            });
        });

        for (var i in row) {
            tableWidth += row[i].width;
            //Set column width in table header
            grid.wrapper.find("colgroup").eq(0).find("col")[i].style.width = `${row[i].width}px`;
            //Set column width in table body
            grid.wrapper.find("colgroup").eq(1).find("col")[i].style.width = `${row[i].width}px`;
        }

        grid.wrapper.find("table").each(function () {
            this.style.width = `${tableWidth}px`;
        });

        //}, 100);
    }
}