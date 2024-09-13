export default class {
    constructor() {
    }

    initAirMawb = function (masterForm) {
        //linkIdPrefix: airMawb / airBooking
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        var mawbNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        $(`#${masterForm.id} div[type=buttonGroup][dataType=jobType]`).data("kendoButtonGroup").trigger("select");
        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var reportName = "";
            var filename = `MAWB# ${utils.formatMawbNo(mawbNo)}`;
            if (e.id == "printMawb") {
                reportName = "AirMawb";
            } else if (e.id == "previewMawb") {
                reportName = "AirMawbPreview";
            } else if (e.id == "loadplan") {
                reportName = "AirLoadPlan";
                filename = `Loadplan ${utils.formatMawbNo(mawbNo)}`;
            } else if (e.id == "manifest") {
                reportName = "AirCargoManifest";
                filename = `CargoManifest ${utils.formatMawbNo(mawbNo)}`;
            }
            controls.openReportViewer(reportName, [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "MawbNo", value: mawbNo },
                { name: "JobNo", value: utils.getFormValue("JOB") },
                { name: "CompanyName", value: data.companyId },
                { name: "filename", value: filename },]);
        });

        //multiple MAWB# (only available in create mode)
        if (masterForm.mode == "create") {
            $(`#${masterForm.id} [name="MAWB"]`).attr("class", "k-input k-input-solid k-input-md k-rounded-md");
            $(`#${masterForm.id} [name="MAWB"]`).after(`<button type="button" name="multipleMawbNo" style="margin: 4px;">Multiple MAWB#</button>`);
            $("[name='multipleMawbNo']").kendoButton({ icon: "ungroup" });
            $("[name='multipleMawbNo']").bind("click", function () {
                var html = `
                <span class="k-input k-textarea k-input-solid k-input-md k-rounded-md k-resize-none">
		            <textarea type="textArea" class="!k-overflow-y-auto k-input-inner" name="multipleMawbNo" maxlength="1000" rows="9" placeholder="Each MAWB# separated by new line..." style="width: 90%; resize: none; height: 100%;"></textarea>
	            </span>
                <div style="text-align: center; padding-top: 4px">
	            <button type="button" name="${masterForm.id}_processMultipleMawbNo" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base">
                    <span class="k-icon k-i-gears k-button-icon"></span>
                &nbsp;&nbsp;OK</button></div><span class="notification"></span>`;
                utils.alertMessage(html, "Multiple MAWB#", "info", "small");

                $(`button[name="${masterForm.id}_processMultipleMawbNo"]`).bind("click", function () {
                    if (utils.isEmptyString($("textarea[name='multipleMawbNo']").val().trim())) {
                        var notification = $(".kendo-window-alertMessage span.notification").kendoNotification({
                            width: 190,
                            position: {
                                top: $("textarea[name='multipleMawbNo']").offset().top + 50,
                                left: $("textarea[name='multipleMawbNo']").offset().left + 130,
                            }
                        }).data("kendoNotification");
                        notification.show("MAWB# should not be empty.", "error");
                        return;
                    }

                    kendo.ui.progress($(`[name="kendo-window-alertMessage-content"]`), true);

                    if ($(`#${masterForm.id}_mawbNoList`).length == 0)
                        $(`#${masterForm.id} [name="MAWB"]`).before(`<span class="k-input k-input-solid k-input-md k-rounded-md" style="max-width: 340px; padding: 2px;"><div id="${masterForm.id}_mawbNoList"></div></span>`);
                    else
                        $(`#${masterForm.id}_mawbNoList`).parent().removeClass("hidden");
                        

                    $(`#${masterForm.id} [name="MAWB"]`).addClass("hidden");
                    var mawbNos = [];
                    $("textarea[name='multipleMawbNo']").val().split("\n").forEach(function (mawbNo) {
                        if (!utils.isEmptyString(mawbNo.trim())) {
                            if (!utils.isValidMawbNo(mawbNo.trim())) {
                                $(`#${masterForm.id} [name="MAWB"]`).val(mawbNo.trim());
                                mawbNos.push({ label: mawbNo.trim(), themeColor: "error", attributes: { "toolip-data-val": "Invalid MAWB#" } });
                            } else if (utils.isExistingMawbNo(mawbNo.trim())) {
                                $(`#${masterForm.id} [name="MAWB"]`).val(mawbNo.trim());
                                mawbNos.push({ label: mawbNo.trim(), themeColor: "error", attributes: { "toolip-data-val": "MAWB# already exists" } });
                            } else {
                                if (utils.isEmptyString($(`#${masterForm.id} [name="MAWB"]`).val().trim()))
                                    $(`#${masterForm.id} [name="MAWB"]`).val(mawbNo.trim());

                                mawbNos.push({ label: mawbNo.trim(), themeColor: "info" });
                            }
                        }
                    });

                    if ($(`#${masterForm.id}_mawbNoList`).data("kendoChipList") == null) {
                        $(`#${masterForm.id}_mawbNoList`).kendoChipList({
                            itemSize: "small",
                            removable: true,
                            items: mawbNos,
                            remove: function (e) {
                                //setTimeout trigger this function after item has been removed
                                setTimeout(function () {
                                    $(`#${masterForm.id} .k-chip.k-chip-solid-info span.k-chip-label`).each(function () {
                                        $(`#${masterForm.id} [name="MAWB"]`).val($(this).text());
                                    });
                                    $(`#${masterForm.id} .k-chip.k-chip-solid-error span.k-chip-label`).each(function () {
                                        $(`#${masterForm.id} [name="MAWB"]`).val($(this).text());
                                    });

                                    var validator = $(`#${masterForm.id}`).data("kendoValidator");
                                    validator.hideMessages();

                                    if ($("div.k-chip").length == 0) {
                                        $(`#${masterForm.id}_mawbNoList`).parent().addClass("hidden");
                                        $(`#${masterForm.id} [name="MAWB"]`).val("");
                                        $(`#${masterForm.id} [name="MAWB"]`).removeClass("hidden");
                                    }

                                }, 500);
                            }
                        });
                    } else {
                        var chipList = $(`#${masterForm.id}_mawbNoList`).data("kendoChipList");
                        $("div.k-chip").each(function () {
                            chipList.remove($(this));
                        });
                        mawbNos.forEach(function (item) {
                            chipList.add(item);
                        });
                    }

                    $(`#${masterForm.id} [toolip-data-val]`).each(function () {
                        var content = $(this).attr("toolip-data-val");
                        $(this).kendoTooltip({
                            //autoHide: false,
                            content: content,
                            show: function (e) {
                                e.sender.popup.element.addClass("red-tooltip");
                            }
                        });
                    })

                    var validator = $(`#${masterForm.id}`).data("kendoValidator");
                    validator.hideMessages();

                    kendo.ui.progress($(`[name="kendo-window-alertMessage-content"]`), false);
                    var dialog = $(".kendo-window-alertMessage").data("kendoWindow");
                    dialog.destroy();
                });
            });
        }
    }

    changedJobType = function (selector) {
        //testObj = selector;
        var formId = utils.getFormId(selector.element);
        var selectedJobType = selector.selectedIndices[0] == 0 ? "C" : "D";     //0: Consol, 1: Direct
        //console.log(formId, selectedJobType);

        var tabStrip = $(`#${formId} .formGroupTab`).data("kendoTabStrip");
        var tabConsol = $(`#${formId} span:contains("Load Plan")`).parent();
        var tabDirect = $(`#${formId} span:contains("Direct Job")`).parent();

        if (selectedJobType == "C") {
            tabConsol.removeAttr("style");
            tabDirect.attr("style", "display: none");
        } else {
            tabConsol.attr("style", "display: none");
            tabDirect.removeAttr("style");
        }

        //console.log(selectedJobType, tabConsol, tabDirect);

        //var buttonGroup = $(`#${masterForm.id} div[type=buttonGroup][name=JOB_TYPE]`).data("kendoButtonGroup");
        //buttonGroup.bind("select", function (e) {
        //    //0: Consol, 1: Direct
        //    //Handle change Job Type
        //    var selectedJobType = e.sender.selectedIndices[0] == 0 ? "C" : "D";
        //    console.log(selectedJobType);
        //    if (selectedJobType != $(`#${masterForm.id} input[name=JOB_TYPE]`).val()) {
        //        controls.edit.initEditPage(masterForm.id, "edit", { changedJobType: selectedJobType });
        //        //$(`#${masterForm.id} input[name=JOB_TYPE]`).val(selectedJobType);
        //        //controllers.airMawb.initAirMawb(masterForm);
        //        return;
        //    }

        //    var tabStrip = $(`#${masterForm.id} .formGroupTab`).data("kendoTabStrip");
        //    var tabConsol = $(`#${masterForm.id} span:contains("Load Plan")`).parent();
        //    var tabDirect = $(`#${masterForm.id} span:contains("Direct Job")`).parent();
        //    console.log(selectedJobType);
        //    testObj = e.sender;
        //    if (e.sender.selectedIndices[0] == 0) {
        //        tabStrip.remove(tabDirect);
        //    } else {
        //        tabStrip.remove(tabConsol);
        //    }
        //});

        //buttonGroup.trigger("select");
    }

    searchBookingClick = function (selector) {
        var formId = utils.getFormId(selector);
        var targetGridName = "grid_LoadplanBookingListViews";

            var html = `<div class='kendo-window-loadplan-booking'>
                <div name="gridSearchBooking"></div>
            </div>`;

            $(".content-wrapper").append(html);
            var searchWin = $(".kendo-window-loadplan-booking").kendoWindow({
                title: "Search Booking",
                modal: true,
                //content: html,
                width: "40%",
                height: "40%",
                close: function (e) {
                    searchWin.destroy();
                },
            }).data("kendoWindow");

            searchWin.center().open();

            kendo.ui.progress($(`.kendo-window-loadplan-booking`), true);
            $.ajax({
                url: "../Air/Mawb/SearchBooking",
                data: { dest: utils.getFormValue("DEST_CODE"), companyId: data.companyId },
                success: function (result) {
                    setTimeout(function () {
                        var grid = $(`.kendo-window-loadplan-booking [name="gridSearchBooking"]`).kendoGrid({
                            toolbar: [
                                { name: "selectAll", text: "Select All", iconClass: "k-icon k-i-tick" },
                                { name: "selectBooking", text: "Add to loadplan", iconClass: "k-icon k-i-plus" }],
                            columns: [
                                {
                                    template: `<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md" />`
                                },
                                { field: "BOOKING_NO", title: "Booking #" },
                                { field: "SHIPPER_DESC", title: "Shipper" },
                                { field: "CONSIGNEE_DESC", title: "Consignee" },
                                { field: "PACKAGE", title: "Packages" },
                                { field: "GWTS", title: "G/Wts" },
                                { field: "VWTS", title: "V/Wts" },
                                { field: "IS_DOC_REC", title: "Doc Rcvd?" },
                                { field: "IS_BOOKING_APP", title: "Approved?" },
                                { field: "IS_RECEIVED", title: "Rcvd?" },
                            ],
                            dataSource: { data: result },
                            resizable: true,
                            height: $(".kendo-window-loadplan-booking.k-window-content").height(),
                            dataBound: function (e) {
                                $("[name=gridSearchBooking]").data("kendoGrid").autoFitColumns();
                            }
                        });
                    
                        kendo.ui.progress($(`.kendo-window-loadplan-booking`), false);

                        $(".kendo-window-loadplan-booking .k-grid-selectAll").bind("click", function (e) {
                            $(".kendo-window-loadplan-booking [name=gridSearchBooking] tbody .k-checkbox").attr("checked", "checked");
                        });

                        $(".kendo-window-loadplan-booking .k-grid-selectBooking").bind("click", function (e) {
                            var bookingData = $("[name=gridSearchBooking]").data("kendoGrid").dataSource.data();
                            var selectedBookings = [];
                            $(".kendo-window-loadplan-booking [name=gridSearchBooking] tbody .k-checkbox").each(function () {
                                if ($(this).is(":checked")) {
                                    var dataRow = bookingData.filter(a => a.BOOKING_NO == $(this).parent().next().text())[0];
                                    selectedBookings.push({
                                        BOOKING_NO: dataRow.BOOKING_NO,
                                        SHIPPER_DESC: dataRow.SHIPPER_DESC,
                                        CONSIGNEE_DESC: dataRow.CONSIGNEE_DESC,
                                        ORIGIN_CODE: dataRow.ORIGIN_CODE,
                                        DEST_CODE: dataRow.DEST_CODE,
                                        PACKAGE: dataRow.PACKAGE,
                                        GWTS: dataRow.GWTS,
                                        VWTS: dataRow.VWTS,
                                        IS_DOC_REC: dataRow.IS_DOC_REC,
                                        IS_BOOKING_APP: dataRow.IS_BOOKING_APP,
                                        IS_RECEIVED: dataRow.IS_RECEIVED,
                                    });
                                }
                            });

                            var targetGrid = $(`#${formId} [name="${targetGridName}"]`).data("kendoGrid");
                            var dataSource = targetGrid.dataSource;
                            dataSource.data(selectedBookings);
                            targetGrid.setDataSource(dataSource);
                            searchWin.close();
                        });
                    }, 500);
                    
                }
            });
    }

    checkDataClick = function (selector) {
        var formId = utils.getFormId(selector);
        var gridHawbData = $(`#${formId} [name="grid_LoadplanHawbListViews"]`).data("kendoGrid").dataSource.data();
        var gridEquipData = $(`#${formId} [name="grid_LoadplanHawbEquips"]`).data("kendoGrid").dataSource.data();
        var result = [];
        //console.log(gridHawbData);
        //console.log(gridEquipData);
        gridHawbData.forEach(function (hawb) {
            var pkgs = 0;
            gridEquipData.forEach(function (equip) {
                if (hawb.HAWB_NO == equip.HAWB_NO)
                    pkgs += equip.PACKAGE;
            });

            if (hawb.PACKAGE != pkgs)
                result.push({ HAWB_NO: hawb.HAWB_NO, PACKAGE: hawb.PACKAGE, PKGS: pkgs });
        });

        //console.log(result);
        if (result.length > 0) {
            var msg = "Equipments no. of packages doesn't match with HAWB packages:<br>";
            result.forEach(function (item) {
                msg += `HAWB: ${item.HAWB_NO}, Packages: ${item.PACKAGE}, wrong packages: <span style="color: red">${item.PKGS}</span><br>`;
            });
            utils.alertMessage(msg, "", "warning");
        } else {
            utils.alertMessage("All data entries are correct.");
        }
    }
}