export default class {
    constructor() {
    }

    //Render form controls (KendoUI)
    renderFormControl_kendoUI = function (masterForm, enableValidation = false) {
        //kendoValidator
        var validator = $(`#${masterForm.id}`).data("kendoValidator");
        if (validator == null && enableValidation) {
            validator = $(`#${masterForm.id}`).kendoValidator({
                rules: masterForm.schema.validation == null ? {} : masterForm.schema.validation.rules,
                messages: masterForm.schema.validation == null ? {} : masterForm.schema.validation.messages,
                errorTemplate: ({ message }) => utils.validatorErrorTemplate(message)
            }).data("kendoValidator");
        }

        //kendoToolBar
        $(`#${masterForm.id} div.toolbar`).each(function () {
            $(this).kendoToolBar({
                items: masterForm.toolbar
            });
        });
        $(`#${masterForm.id} [data-role=dropdownbutton]`).append(`<span class="k-icon k-i-arrow-s k-button-icon"></span>`);

        $(`#${masterForm.id} .toolbar.k-toolbar`).append(`<span class="toolbar-status"></span>`);

        $(`#${masterForm.id} button .k-i-file-add`).parent().bind("click", function () {
            var formId = utils.getFormId($(this));
            if (formId.split("_")[1] == "NEW") {
                $("#btnRefresh_" + formId).trigger("click");
            } else {
                var controller = formId.split("_")[0];
                controls.append_tabStripMain(`${masterForm.title} NEW`, `${controller}_NEW_${data.companyId}_${utils.getFrtMode()}`, controller);
            }
        });

        $(`#${masterForm.id} button .k-i-save`).parent().bind("click", function () {
            if (!validator.validate()) {
                return;
            } else {
                var model = controls.getValuesFromFormControls(masterForm);
                console.log(masterForm, model);

                //$.ajax({
                //    url: "../Air/Mawb/TestModel",
                //    type: "post",
                //    data: model,
                //    success: function (result) {
                //        console.log(result);
                //    }
                //});
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

        //kendoButtonGroup for frtMode
        $(`#${masterForm.id} div[type=buttonGroup][dataType=frtMode]`).each(function () {
            $(this).kendoButtonGroup({
                items: [
                    { text: "Export", iconClass: "fa fa-plane-departure", selected: true },
                    { text: "Import", iconClass: "fa fa-plane-arrival" },
                ]
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
                //index: 0
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
                select: function (e) {
                    masterForm.id = utils.getFormId(this.element);
                    var item = e.dataItem;
                    if (item == null) {
                        item = e.sender.dataSource.data()[0];
                    }
                    var controlName = $(this.element).attr("name");
                    //$(`#${masterForm.id} input[name=${controlName}]`).val(item.CUSTOMER_DESC);
                    $(`#${masterForm.id} input[name=${controlName}_CODE]`).val(item.CUSTOMER_CODE);
                    $(`#${masterForm.id} input[name=${controlName}_BRANCH]`).val(item.BRANCH_CODE);
                    $(`#${masterForm.id} input[name=${controlName}_SHORT_DESC]`).val(item.SHORT_DESC);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR1]`).val(item.ADDR1);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR2]`).val(item.ADDR2);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR3]`).val(item.ADDR3);
                    $(`#${masterForm.id} input[name=${controlName}_ADDR4]`).val(item.ADDR4);
                },
                open: function (e) {
                    var value = $(e.sender.element[0]).parent().next().val().split("-")[0];
                    $(e.sender.filterInput).val(value);
                }
            });
        });

        //kendoDropDownList for PORT
        $(`#${masterForm.id} input[type=port]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "PORT_DESC_DISPLAY",
                dataValueField: "PORT_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.ports },
            });
        });

        //kendoDropDownList for AIRLINE
        $(`#${masterForm.id} input[type=airline]`).each(function () {
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "AIRLINE_DESC_DISPLAY",
                dataValueField: "AIRLINE_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: { data: data.masterRecords.airlines },
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

        //kendoDropDownList for invoice type
        //$(`#${masterForm.id} input[type=invoiceType]`).each(function () {
        //    $(this).kendoDropDownList({
        //        dataSource: data.masterRecords.invoiceType
        //    });
        //});

        //kendoDropDownList for invoice category
        //$(`#${masterForm.id} input[type=invoiceCategory]`).each(function () {
        //    $(this).kendoDropDownList({
        //        dataSource: data.masterRecords.invoiceCategory
        //    });
        //});

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
                template: (dataItem) => `${dataItem.JOB_NO} / ${dataItem.MAWB_NO} / ${dataItem.DEST_CODE} / ${dataItem.FLIGHT_NO} - 
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
                    //if (!utils.isEmptyString(e.sender.filterInput.val()) && e.sender.dataItems().length == 0) {
                    //    e.sender.search(e.sender.filterInput.val());
                    //}
                },
                select: function (e) {
                    filterValue = e.dataItem.HAWB_NO;
                    if (e.sender.element.attr("callbackFunction") != null) {
                        var callbackFunction = e.sender.element.attr("callbackFunction");
                        eval(`${callbackFunction}(e, filterValue)`);
                    }
                },
                dataBound: function (e) {
                    //if (!utils.isEmptyString(filterValue) && e.sender.dataItems().length > 0) {
                    //    e.sender.filterInput.val(utils.formatText(filterValue));
                    //    ddl.value(utils.formatText(filterValue));
                    //}
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
                        var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                        if (e.sender.element.parent().next("[name*=EX_RATE]").length == 1) {
                            e.sender.element.parent().next("[name*=EX_RATE]").val(exRate);
                        }
                    }
                },
            });
        });

        //kendoDropDownList for charge template
        $(`#${masterForm.id} input[type=chargeTemplate]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: "Select for charge template...",
                dataSource: { data: data.masterRecords.chargeTemplates },
                cascade: function (e) {
                    //e.sender._cascadedValue => selected value
                    if (e.userTriggered == true) {
                        var templateName = e.sender._cascadedValue;
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
                            }
                        });
                    }
                },
            });
        });

        //kendoDropDownList for PACKAGE_UNIT
        $(`#${masterForm.id} input[type=pkgUnit]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.masterRecords.packageUnit
            });
        });

        //kendoGrid
        $(`#${masterForm.id} div[type=grid]`).each(function () {
            var columns;
            var formulas;
            var toolbar;
            var deleteCallbackFunction;
            var editable = { mode: "incell", confirmation: false };
            var controlName = $(this).attr("name");
            masterForm.formGroups.forEach(function (formGroup) {
                formGroup.formControls.forEach(function (control) {
                    if (control.type == "grid" && control.name == controlName.replace("grid_", "")) {
                        columns = control.columns;
                        formulas = control.formulas;
                        toolbar = control.toolbar;
                        deleteCallbackFunction = control.deleteCallbackFunction;
                        if (control.editable == false)
                            editable = false;
                    }
                })
            })

            if (toolbar == null)
                toolbar = ["create", "cancel"];     //default buttons
            else if (toolbar.length == 0)
                toolbar = null;                     //disable the toolbar if don't want to show (toolbar: [] in the setting js)

            //Calculate the grid width, 
            var gridWidth = 25;     //initial width
            columns.forEach(function (col) {
                gridWidth += col.width == null ? 70 : col.width;
            });
            $(this).kendoGrid({
                toolbar: toolbar,
                columns: columns,
                editable: editable,
                resizable: true,
                width: gridWidth,
                dataBound: function (e) {
                    //$(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).removeAttr("style");
                    //$(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).attr("style", "width: 26px; height: 18px");

                    //Toolbar custom button events
                    if (toolbar != null) {
                        toolbar.forEach(function (button) {
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
                },
                cellClose: function (e) {
                    if (formulas != null) {
                        formulas.forEach(function (formula) {
                            controls.kendo.gridFormula(e.container, formula.fieldName, formula.formula);
                        });
                    }
                },
                saveChanges: function (e) {
                    e.preventDefault();
                    if (toolbar != null) {
                        if (toolbar.filter(a => a.name == "save").length == 1) {
                            if (toolbar.filter(a => a.name == "save")[0].callbackFunction != null)
                                eval(`${toolbar.filter(a => a.name == "save")[0].callbackFunction}(e)`);
                        }
                    }
                },
                remove: function (e) {
                    e.preventDefault();
                    if (deleteCallbackFunction != null) {
                        eval(`${deleteCallbackFunction}(e)`);
                    }
                },
            });
        });
    }

    //kendoGrid related functions
    gridFormula = function (container, fieldName, formula) {
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
                //serverFiltering: true,
                //transport: {
                //    read: function (options) {
                //        if (options.data.filter != null) {
                //            try {
                //                filterValue = options.data.filter.filters[0].value;
                //            } catch { }
                //        }
                //        $.ajax({
                //            url: "../Home/GetCharges",
                //            data: { searchValue: filterValue, take: data.take },
                //            dataType: "json",
                //            type: "post",
                //            success: function (result) {
                //                for (var i in result) {
                //                    result[i].CHARGE_DESC_DISPLAY = result[i].CHARGE_CODE + " - " + result[i].CHARGE_DESC;
                //                }
                //                options.success(result);
                //            }
                //        });
                //    },
                //}
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

    gridAutoFitColumns = function (grid) {
        setTimeout(function () {
            var colMaxWidth = 280;
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
            })
        }, 100);

    }
}