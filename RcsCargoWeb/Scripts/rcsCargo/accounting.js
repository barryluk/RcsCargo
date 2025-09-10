export default class {
    constructor() {
    }

    initSysConsole = function (pageSetting) {
        $(`#${pageSetting.id} .menuButton`).each(function () {
            $(this).click(function () {
                switch ($(this).attr("name")) {
                    case "users": controls.append_tabStripMain("Users", "usersIndex", "users"); break;
                    case "sysCompanies": controls.append_tabStripMain("System Companies", "sysCompaniesIndex", "sysCompanies"); break;
                    case "userLogs": controls.append_tabStripMain("User Logs", "userLogsIndex", "userLogs"); break;
                    case "sysLogs": controls.append_tabStripMain("System Logs", "sysLogsIndex", "sysLogs"); break;
                    case "camRecords": controls.append_tabStripMain("SHA Camera Records", "camRecordsIndex", "camRecords"); break;
                    case "getSeqNo": controls.append_tabStripMain("Generate Sequence #", "getSeqNoIndex", "getSeqNo"); break;
                }
            });
        });
    }

    initLedgerAccount = function () {
    }

    initVoucher = function () {
        let formId = utils.getFormId();
        $(`#${formId} [name="voucherDateRange"]`).append(`<span class="k-icon k-i-refresh" name="reloadData" style="cursor: pointer; margin-bottom: 6px"></span>`);
        $(`#${formId} [name="voucherDateRange"]`).click(function () {
            var ds = $(`#${formId} [name="gridVoucherIndex"]`).data("kendoGrid").dataSource;
            $(`#${formId} [name="gridVoucherIndex"]`).data("kendoGrid").setDataSource(ds);
        });
    }

    loadVoucher = function (id) {
        let year = id.split('-')[0];
        let period = id.split('-')[1];
        let voucherNo = id.split('-')[2];
        $.ajax({
            url: "../Accounting/Voucher/GetVoucher",
            data: { year: year, period: period, voucherNo: voucherNo },
            dataType: "json",
            type: "post",
            success: function (result) {
                //console.log(result);
                let html = `<table style="width: 700px">
                    <tr><td style="text-align: center"><h3>记 账 凭 证</h3></td></tr>
                    <tr>
                        <th>${result[0].VOUCHER_TYPE} - 字 - ${result[0].VOUCHER_NO.toString().padStart(4, "0")} 
                        &nbsp;&nbsp;&nbsp;&nbsp;制单日期: <span><input name="voucherDate" style="width: 170px"/></span></th>
                    </tr>
                    <tr>
                        <td><div name="gridVoucherItem"></div></td>
                    </tr>
                    <tr>
                        <td><span name="voucherDetail"></span></td>
                    </tr>
                    <tr>
                        <td style="text-align: right"><span name="voucherFooter">制单: ${result[0].CBILL} &nbsp;&nbsp; 审核: ${result[0].CCHECK}</span></td>
                    </tr>
                </table>`;

                $("[name='kendo-window-alertMessage-content']").html(html);
                $("[name='kendo-window-alertMessage-content'] [name='voucherDate']").kendoDatePicker({ value: result[0].VOUCHER_DATE });
                $("[name='kendo-window-alertMessage-content'] [name='gridVoucherItem']").kendoGrid({
                    editable: { mode: "incell", confirmation: false, createAt: "bottom" },
                    resizable: true,
                    navigatable: true,
                    selectable: "row",
                    columns: [
                        {
                            field: "DESC_TEXT",
                            editor: function (container, options) { controls.renderGridEditorVoucherDesc(container, options) },
                            title: "Description"
                        },
                        {
                            field: "AC_CODE",
                            template: ({ AC_CODE, AC_NAME }) => `${AC_CODE} - ${AC_NAME}`,
                            editor: function (container, options) { controls.renderGridEditorLedgerAccount(container, options) },
                            title: "Account Name"
                        },
                        { field: "DR_AMT", title: "Debit Amount", footerTemplate: ({ DR_AMT }) => `${kendo.toString(DR_AMT.sum, "n")}` },
                        { field: "CR_AMT", title: "Credit Amount", footerTemplate: ({ CR_AMT }) => `${kendo.toString(CR_AMT.sum, "n")}` }
                    ],
                    dataSource: {
                        type: "json",
                        data: result,
                        aggregate: [
                            { field: "DR_AMT", aggregate: "sum" },
                            { field: "CR_AMT", aggregate: "sum" }
                        ]
                    },
                    cellClose: function (e) {
                        e.model.AC_NAME = data.masterRecords.ledgerAccounts.filter(a => a.AC_CODE == e.model.AC_CODE)[0].AC_NAME;
                    },
                    change: function (e) {
                        let ddlCtrl = "";
                        let grid = this;
                        let dataItem = grid.dataItem(grid.select()[0]);

                        if (!utils.isEmptyString(dataItem.CUSTOMER_CODE)) {
                            ddlCtrl = `客户: <input name="CUSTOMER_CODE" />`;
                        } else if (!utils.isEmptyString(dataItem.VENDOR_CODE)) {
                            ddlCtrl = `供应商: <input name="VENDOR_CODE" />`;
                        }

                        let detailHtml = `票号: <input name="invNo" style="width: 220px" />
                            <br>日期: <input name="invDate" style="width: 170px" />
                            <br>${ddlCtrl}`;

                        $(`[name="kendo-window-alertMessage-content"] [name="voucherDetail"]`).html(detailHtml);
                        $(`[name="kendo-window-alertMessage-content"] [name="invNo"]`).kendoTextBox({ value: dataItem.INV_NO });
                        $(`[name="kendo-window-alertMessage-content"] [name="invDate"]`).kendoDatePicker({ value: dataItem.INV_DATE });
                        $(`[name="kendo-window-alertMessage-content"] [name="CUSTOMER_CODE"]`).kendoDropDownList({
                            filter: "startswith",
                            dataTextField: "CUSTOMER_NAME",
                            dataValueField: "CUSTOMER_CODE",
                            optionLabel: `Select for Customer...`,
                            dataSource: {
                                type: "json",
                                serverFiltering: true,
                                transport: {
                                    read: function (options) {
                                        let filterValue = dataItem.CUSTOMER_CODE;
                                        if (options.data.filter != null) {
                                            try { filterValue = options.data.filter.filters[0].value; } catch { }
                                        }
                                        $.ajax({
                                            url: "../Accounting/SystemSetting/GetCustomers",
                                            data: { searchValue: filterValue },
                                            dataType: "json",
                                            type: "post",
                                            success: function (result) {
                                                options.success(result);
                                                $(`[name="kendo-window-alertMessage-content"] [name="CUSTOMER_CODE"]`).data("kendoDropDownList").select(1);
                                            }
                                        });
                                    },
                                }
                            },
                        });

                        $(`[name="kendo-window-alertMessage-content"] [name="VENDOR_CODE"]`).kendoDropDownList({
                            filter: "startswith",
                            dataTextField: "VENDOR_NAME",
                            dataValueField: "VENDOR_CODE",
                            optionLabel: `Select for Vendor...`,
                            dataSource: {
                                type: "json",
                                serverFiltering: true,
                                transport: {
                                    read: function (options) {
                                        let filterValue = dataItem.VENDOR_CODE;
                                        if (options.data.filter != null) {
                                            try { filterValue = options.data.filter.filters[0].value; } catch { }
                                        }
                                        $.ajax({
                                            url: "../Accounting/SystemSetting/GetVendors",
                                            data: { searchValue: filterValue },
                                            dataType: "json",
                                            type: "post",
                                            success: function (result) {
                                                options.success(result);
                                                $(`[name="kendo-window-alertMessage-content"] [name="VENDOR_CODE"]`).data("kendoDropDownList").select(1);
                                            }
                                        });
                                    },
                                }
                            },
                        });
                    }
                });
            }
        });
    }
}