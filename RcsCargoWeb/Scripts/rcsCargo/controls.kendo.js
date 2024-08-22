export default class {
    constructor() {
    }

    //Render form controls (KendoUI)
    renderFormControl_kendoUI = function (masterForm) {
        //kendoToolBar
        $(`#${masterForm.id} div.toolbar`).each(function () {
            $(this).kendoToolBar({
                items: masterForm.toolbar
            });
        });
        $(`#${masterForm.id} [data-role=dropdownbutton]`).append(`<span class="k-icon k-i-arrow-s k-button-icon"></span>`);
        $(`#${masterForm.id} .k-i-save`).parent().click(function () {
            var model = controls.getValuesFromFormControls(masterForm);
            console.log(model);

            $.ajax({
                url: "../Air/Mawb/TestModel",
                type: "post",
                data: model,
                success: function (result) {
                    console.log(result);
                }
            });
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
                    { text: "Export", icon: "export", selected: true },
                    { text: "Import", icon: "import" },
                ]
            });
        });

        //kendoButtonGroup for bookingType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=bookingType]`).each(function () {
            $(this).kendoButtonGroup({
                items: data.bookingType,
                index: 0
            });
        });

        //kendoButtonGroup for jobType
        $(`#${masterForm.id} div[type=buttonGroup][dataType=jobType]`).each(function () {
            $(this).kendoButtonGroup({
                items: [
                    { text: "Consol", value: "C" },
                    { text: "Direct", value: "D" },
                ],
                //index: 0
            });
        });

        //kendoSwitch
        $(`#${masterForm.id} input[type=switch]`).each(function () {
            $(this).kendoSwitch({
                messages: {
                    checked: "yes",
                    unchecked: "no"
                },
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
                        },
                    }
                },
                select: function (e) {
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
            var filterValue = "";
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "PORT_DESC",
                dataValueField: "PORT_CODE",
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
                            $.ajax({
                                url: "../Home/GetPorts",
                                data: { searchValue: filterValue, take: data.take },
                                dataType: "json",
                                type: "post",
                                success: function (result) {
                                    for (var i in result) {
                                        result[i].PORT_DESC = result[i].PORT_CODE + " - " + result[i].PORT_DESC;
                                    }
                                    options.success(result);
                                }
                            });
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                }
            });
        });

        //kendoDropDownList for AIRLINE
        $(`#${masterForm.id} input[type=airline]`).each(function () {
            var filterValue = "";
            $(this).kendoDropDownList({
                filter: "startswith",
                dataTextField: "AIRLINE_DESC",
                dataValueField: "AIRLINE_CODE",
                optionLabel: `Select for ${$(this).parentsUntil("label").prev().eq(0).html()} ...`,
                dataSource: {
                    type: "json",
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            try {
                                filterValue = options.data.filter.filters[0].value;
                            } catch { }

                            $.ajax({
                                url: "../Home/GetAirlines",
                                data: { searchValue: filterValue, take: data.take },
                                dataType: "json",
                                type: "post",
                                success: function (result) {
                                    for (var i in result) {
                                        result[i].AIRLINE_DESC = result[i].AIRLINE_CODE + " - " + result[i].AIRLINE_DESC;
                                    }
                                    options.success(result);
                                }
                            });
                        },
                    }
                },
                open: function (e) {
                    $(e.sender.filterInput).val(filterValue);
                }
            });
        })

        //kendoDropDownList for vwts factor
        $(`#${masterForm.id} input[type=vwtsFactor]`).each(function () {
            $(this).kendoDropDownList({
                dataSource: data.vwtsFactor
            });
        });

        //kendoDropDownList for incoterm
        $(`#${masterForm.id} input[type=incoterm]`).each(function () {
            $(this).kendoDropDownList({
                optionLabel: " ",
                dataSource: data.incoterm
            });
        });

        //kendoDropDownList for currency
        $(`#${masterForm.id} input[type=currency]`).each(function () {
            $(this).kendoDropDownList({
                dataTextField: "CURR_CODE",
                dataValueField: "CURR_CODE",
                optionLabel: " ",
                dataSource: data.currencies,
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
                dataSource: {
                    transport: {
                        read: {
                            url: "../Home/GetChargeTemplates",
                            data: { companyId: data.companyId },
                            dataType: "json"
                        }
                    }
                },
                cascade: function (e) {
                    //e.sender._cascadedValue => selected value
                    if (e.userTriggered == true) {
                        var templateName = e.sender._cascadedValue;
                        //var currencies;
                        var grid = $(`#${masterForm.id} [name=${e.sender.element.attr("targetControl")}]`).data("kendoGrid");
                        var cwts = utils.getFormValue("CWTS", e.sender.element);
                        testObj = grid;

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
                dataSource: data.packageUnit
            });
        });

        //kendoGrid
        $(`#${masterForm.id} div[type=grid]`).each(function () {
            var columns;
            var formulas;
            var controlName = $(this).attr("name");
            masterForm.formGroups.forEach(function (formGroup) {
                formGroup.formControls.forEach(function (control) {
                    if (control.type == "grid" && control.name == controlName.replace("grid_", "")) {
                        columns = control.columns;
                        formulas = control.formulas;
                    }
                })
            })

            //Calculate the grid width
            var gridWidth = 0;
            columns.forEach(function (col) {
                gridWidth += col.width == null ? 70 : col.width;
            });
            $(this).kendoGrid({
                toolbar: ["create", "cancel"],
                columns: columns,
                editable: { mode: "incell", confirmation: false },
                resizable: true,
                width: gridWidth,
                dataBound: function (e) {
                    $(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).removeAttr("style");
                    $(`#${masterForm.id} div[type=grid] .btn-destroy.k-grid-delete`).attr("style", "width: 26px; height: 18px");
                },
                cellClose: function (e) {
                    formulas.forEach(function (formula) {
                        controls.gridFormula(e.container, formula.fieldName, formula.formula);
                    });
                }
            });
        });
    }

    //kendoGrid related functions
    gridFormula = function (container, fieldName, formula) {
        formula.split("{").forEach(function (field) {
            if (field.length > 0) {
                var field = field.substring(0, field.indexOf("}"));
                formula = formula.replace(`{${field}}`, controls.gridGetCellValue(container, field));
            }
        });

        //console.log(formula);
        if (formula.indexOf("*") != -1 || formula.indexOf("/") != -1)
            controls.gridSetCellValue(container, fieldName, utils.roundUp(eval(formula), 2));
        else {
            try {
                controls.gridSetCellValue(container, fieldName, eval(formula));
            }
            catch {
                controls.gridSetCellValue(container, fieldName, formula);
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
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            filter: "startswith",
            dataTextField: "CHARGE_DESC_DISPLAY",
            dataValueField: "CHARGE_CODE",
            optionLabel: `Select charges ...`,
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
                        $.ajax({
                            url: "../Home/GetCharges",
                            data: { searchValue: filterValue, take: data.take },
                            dataType: "json",
                            type: "post",
                            success: function (result) {
                                for (var i in result) {
                                    result[i].CHARGE_DESC_DISPLAY = result[i].CHARGE_CODE + " - " + result[i].CHARGE_DESC;
                                }
                                options.success(result);
                            }
                        });
                    },
                }
            },
            open: function (e) {
                $(e.sender.filterInput).val(filterValue);
            },
            select: function (e) {
                controls.gridSetCellValue(container, "CHARGE_DESC", e.dataItem.CHARGE_DESC);
            }
        });
    }

    //kendoGrid kendoDropDownList for Currency
    renderGridEditorCurrency = function (container, options) {
        //testObj = container;
        //testObj2 = options;
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            dataTextField: "CURR_CODE",
            dataValueField: "CURR_CODE",
            dataSource: data.currencies,
            cascade: function (e) {
                //e.sender._cascadedValue => selected value
                if (e.userTriggered == true) {
                    var exRate = e.sender.dataSource._data.filter(a => a.CURR_CODE == e.sender._cascadedValue)[0]["EX_RATE"];
                    controls.gridSetCellValue(container, "EX_RATE", exRate);
                }
            },
        });
    }

    //kendoGrid kendoDropDownList for Qty Unit
    renderGridEditorQtyUnit = function (container, options) {
        var ddl = $(`<input name="${options.field}" />`);
        ddl.appendTo(container);

        ddl.kendoDropDownList({
            dataSource: data.chargeQtyUnit
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