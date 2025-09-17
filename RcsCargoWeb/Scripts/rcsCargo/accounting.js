export default class {
    constructor() {
    }

    initReport = function (pageSetting) {
        $(`#${utils.getFormId()} [name=main]`).html(`<div class="spreadSheetReport" style="width: 100%; height: 800px"></div>`);
        let spreadsheet = $(`#${utils.getFormId()} .spreadSheetReport`).kendoSpreadsheet({
            toolbar: {
                Reports: []
            }
        }).data("kendoSpreadsheet");

        $("button[aria-label='Open...']").addClass("hidden");   //Hidden the open file button
        $(`#${utils.getFormId()} .k-spreadsheet-tabstrip span:contains('undefined')`).text("Reports");
        $(`#${utils.getFormId()} .k-spreadsheet-tabstrip .k-spreadsheet-toolbar`).eq(3).html(`
            <span>Report: </span><input name="reportType" style="width: 180px" />
            <span>Accounting Year: </span><input name="accountingYear" />
            <span>Period: </span><input name="period" /> <button name="btnSave">Save</button>`);

        $(`#${utils.getFormId()} .spreadSheetReport [name="reportType"]`).kendoDropDownList({
            optionLabel: "--- Select Report ---",
            dataSource: ["Ledger Accounts Summary", "Balance Sheet", "Profit and Loss", "Bank Transactions", "Accounts Receivable"],
            cascade: function (e) {
                controllers.accounting.getAccountingReport(spreadsheet);
            }
        });
        $(`#${utils.getFormId()} .spreadSheetReport [name="accountingYear"]`).kendoDropDownList({
            dataSource: ["2025", "2024"],
            value: new Date().getFullYear(),
            cascade: function (e) {
                controllers.accounting.getAccountingReport(spreadsheet);
            }
        });
        $(`#${utils.getFormId()} .spreadSheetReport [name="period"]`).kendoDropDownList({
            dataSource: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            value: new Date().getMonth() + 1,
            cascade: function (e) {
                controllers.accounting.getAccountingReport(spreadsheet);
            }
        });
        $(`#${utils.getFormId()} .spreadSheetReport [name="btnSave"]`).kendoButton({
            icon: "save",
            click: function (e) {
                let reportType = $(`#${utils.getFormId()} .spreadSheetReport [name="reportType"]`).data("kendoDropDownList").value();
                let year = $(`#${utils.getFormId()} .spreadSheetReport [name="accountingYear"]`).data("kendoDropDownList").value();
                let period = $(`#${utils.getFormId()} .spreadSheetReport [name="period"]`).data("kendoDropDownList").value();

                if (utils.isEmptyString(reportType))
                    return;

                spreadsheet.options.excel.fileName = `${reportType} ${year}${period.toString().padStart(2, "0")}.xlsx`;
                spreadsheet.saveAsExcel();
            }
        });

        $(`#${utils.getFormId()} .k-spreadsheet-tabstrip`).data("kendoTabStrip").select(3);
    }

    getAccountingReport = function (spreadsheet) {
        if ($(`#${utils.getFormId()} .spreadSheetReport [name="reportType"]`).data("kendoDropDownList") != null &&
            $(`#${utils.getFormId()} .spreadSheetReport [name="accountingYear"]`).data("kendoDropDownList") != null &&
            $(`#${utils.getFormId()} .spreadSheetReport [name="period"]`).data("kendoDropDownList") != null) {
            let reportType = $(`#${utils.getFormId()} .spreadSheetReport [name="reportType"]`).data("kendoDropDownList").value();
            let year = $(`#${utils.getFormId()} .spreadSheetReport [name="accountingYear"]`).data("kendoDropDownList").value();
            let period = $(`#${utils.getFormId()} .spreadSheetReport [name="period"]`).data("kendoDropDownList").value();

            if (utils.isEmptyString(reportType))
                return;

            console.log(reportType, year, period);
            if (reportType == "Ledger Accounts Summary")
                controllers.accounting.getLedgerAccountSummaryReport(spreadsheet, year, period);
            else if (reportType == "Balance Sheet")
                controllers.accounting.getBalanceSheet(spreadsheet, year, period);
            else if (reportType == "Profit and Loss")
                controllers.accounting.getProfitLoss(spreadsheet, year, period);
            else
                utils.alertMessage("The selected report is not available at this moment, will be available soon...");
        }
    }

    getLedgerAccountSummaryReport = function (spreadsheet, year, period) {
        let classes = ["资产", "负债", "权益", "损益"];
        let reportData = {
            sheets: [{
                name: "科目余额表",
                showGridLines: true,
                defaultCellStyle: {
                    fontFamily: "Arial",
                    fontSize: 10
                },
                columns: [
                    { index: 0, width: 60 },
                    { index: 1, width: 60 },
                    { index: 2, width: 140 },
                    { index: 3, width: 60 },
                    { index: 4, width: 100 },
                    { index: 5, width: 100 },
                    { index: 6, width: 100 },
                    { index: 7, width: 100 },
                    { index: 8, width: 100 },
                    { index: 9, width: 100 },
                ],
                //mergedCells: [ "A1:G1" ],
                rows: [{
                    cells: [
                        { value: "会计期间" },
                        { value: "科目编码" },
                        { value: "科目名称" },
                        { value: "外币名称" },
                        { value: "期初借方" },
                        { value: "期初贷方" },
                        { value: "本期发生借方" },
                        { value: "本期发生贷方" },
                        { value: "期末借方" },
                        { value: "期末贷方" },
                    ]
                }]
            }]
        };

        for (let i in reportData.sheets[0].rows[0].cells) {
            let cell = reportData.sheets[0].rows[0].cells[i];
            cell.bold = true;
            if (i >= 4) {
                cell.textAlign = "right";
            }
        }

        $.ajax({
            url: "../Accounting/Ledger/GetLedgerAccountSummary",
            data: { year: year, period: period },
            dataType: "json",
            type: "post",
            success: function (result) {
                testObj = result;
                let openDrTotal = 0;
                let openCrTotal = 0;
                let currentDrTotal = 0;
                let currentCrTotal = 0;
                let closeDrTotal = 0;
                let closeCrTotal = 0;
                classes.forEach(function (cname) {
                    let filterResult = result.filter(a => a.CLASS == cname);
                    let openDrSubtotal = 0;
                    let openCrSubtotal = 0;
                    let currentDrSubtotal = 0;
                    let currentCrSubtotal = 0;
                    let closeDrSubtotal = 0;
                    let closeCrSubtotal = 0;

                    for (let i in filterResult) {
                        reportData.sheets[0].rows.push({
                            cells: [
                                { value: `${year}.${period.toString().padStart(2, "0")}` },
                                { value: filterResult[i].AC_CODE },
                                { value: filterResult[i].AC_NAME },
                                { value: filterResult[i].CURRENCY },
                                { value: filterResult[i].OPEN_DR },
                                { value: filterResult[i].OPEN_CR },
                                { value: filterResult[i].CURRENT_DR },
                                { value: filterResult[i].CURRENT_CR },
                                { value: filterResult[i].CLOSE_DR },
                                { value: filterResult[i].CLOSE_CR },
                            ]
                        });

                        if (filterResult[i].AC_CODE.length == 4) {
                            openDrSubtotal += filterResult[i].OPEN_DR;
                            openCrSubtotal += filterResult[i].OPEN_CR;
                            currentDrSubtotal += filterResult[i].CURRENT_DR;
                            currentCrSubtotal += filterResult[i].CURRENT_CR;
                            closeDrSubtotal += filterResult[i].CLOSE_DR;
                            closeCrSubtotal += filterResult[i].CLOSE_CR;
                        }
                    }

                    reportData.sheets[0].rows.push({
                        cells: [
                            { value: `${year}.${period.toString().padStart(2, "0")}` },
                            { value: `${cname}小计` },
                            { value: "" },
                            { value: "" },
                            { value: openDrSubtotal },
                            { value: openCrSubtotal },
                            { value: currentDrSubtotal },
                            { value: currentCrSubtotal },
                            { value: closeDrSubtotal },
                            { value: closeCrSubtotal },
                        ]
                    });
                    openDrTotal += openDrSubtotal;
                    openCrTotal += openCrSubtotal;
                    currentDrTotal += currentDrSubtotal;
                    currentCrTotal += currentCrSubtotal;
                    closeDrTotal += closeDrSubtotal;
                    closeCrTotal += closeCrSubtotal;
                });
                reportData.sheets[0].rows.push({
                    cells: [
                        { value: `${year}.${period.toString().padStart(2, "0")}` },
                        { value: "合计" },
                        { value: "" },
                        { value: "" },
                        { value: openDrTotal },
                        { value: openCrTotal },
                        { value: currentDrTotal },
                        { value: currentCrTotal },
                        { value: closeDrTotal },
                        { value: closeCrTotal },
                    ]
                });

                reportData.sheets[0].rows.forEach(function (row) {
                    row.cells.forEach(function (cell) {
                        if (row.cells.indexOf(cell) >= 4)
                            cell.format = "#,##0.00";
                    });
                })

                spreadsheet.fromJSON(reportData);
            }
        });
    }

    getBalanceSheet = function (spreadsheet, year, period) {
        let rowData = [
            { index: 1, text: "  货币资金", code: "1001,1002,1009", calcType: "+" },
            { index: 2, text: "  短期投资", code: "1101" },
            { index: 3, text: "  应收票据", code: "1111" },
            { index: 4, text: "  应收股利", code: "1121" },
            { index: 5, text: "  应收利息", code: "1122" },
            { index: 6, text: "  应收账款", code: "1131" },
            { index: 7, text: "  其它应收款", code: "1133" },
            { index: 8, text: "  预付账款", code: "1151" },
            { index: 9, text: "  应收补贴款", code: "1161" },
            { index: 10, text: "  存货", code: "" },
            { index: 11, text: "  待摊费用", code: "1301" },
            { index: 12, text: "  一年内到期的长期债权投资", code: "" },
            { index: 13, text: "  其它流动资产", code: "" },
            { index: 14, text: "  流动资产合计", code: "", formulaBeg: "SUM(C6:C18)", formulaEnd: "SUM(D6:D18)" },
            { index: 14.1, text: "长期投资：", code: "" },
            { index: 15, text: "  长期股权投资", code: "1401" },
            { index: 16, text: "  长期债权投资", code: "1402" },
            { index: 17, text: "  长期投资合计", code: "", formulaBeg: "C21+C22", formulaEnd: "D21+D22" },
            { index: 17.1, text: "固定资产：", code: "" },
            { index: 18, text: "  固定资产原价", code: "1501" },
            { index: 19, text: "   减：累计折价 ", code: "1502" },
            { index: 20, text: "  固定资产净值", code: "", formulaBeg: "C25-C26", formulaEnd: "D25-D26" },
            { index: 21, text: "   减：固定资产减值准备", code: "1505" },
            { index: 22, text: "  固定资产净额", code: "", formulaBeg: "C27-C28", formulaEnd: "D27-D28" },
            { index: 23, text: "  工程物资", code: "1601" },
            { index: 24, text: "  在建工程", code: "1603" },
            { index: 25, text: "  固定资产清理", code: "1701" },
            { index: 26, text: "  固定资产合计", code: "", formulaBeg: "SUM(C29:C32)", formulaEnd: "SUM(D29:D32)" },
            { index: 26.1, text: "无形资产及其他资产：", code: "1801,1805", calcType: "-" },
            { index: 27, text: "  无形资产", code: "1901" },
            { index: 28, text: "  长期待摊费用", code: "" },
            { index: 29, text: "  其它长期资产", code: "" },
            { index: 30, text: "无形资产及其他资产合计", code: "", formulaBeg: "SUM(C35:C37)", formulaEnd: "SUM(D35:D37)" },
            { index: 30.1, text: "", code: "" },
            { index: 30.2, text: "递延税项：", code: "" },
            { index: 31, text: "  递延税款借项", code: "2341" },
            { index: 32, text: "资产总计", code: "", formulaBeg: "C19+C23+C33+C38+C41", formulaEnd: "D19+D23+D33+D38+D41" },
            { index: 33, text: "  短期借款", code: "2101" },
            { index: 34, text: "  应付票据", code: "2111" },
            { index: 35, text: "  应付账款", code: "2121" },
            { index: 36, text: "  预收账款", code: "2131" },
            { index: 37, text: "  应付工资", code: "2151" },
            { index: 38, text: "  应付福利费", code: "2153" },
            { index: 39, text: "  应付股利", code: "2161" },
            { index: 40, text: "  应交税金", code: "2171" },
            { index: 41, text: "  其它应交款", code: "2176" },
            { index: 42, text: "  其它应付款", code: "2181" },
            { index: 43, text: "  预提费用", code: "2191" },
            { index: 44, text: "  预计负债", code: "2211" },
            { index: 45, text: "  一年内到期的长期负债", code: "" },
            { index: 46, text: "  其它流动负债", code: "" },
            { index: 46.1, text: "", code: "" },
            { index: 47, text: "  流动负债合计", code: "", formulaBeg: "SUM(G8:G20)", formulaEnd: "SUM(H8:H20)" },
            { index: 47.1, text: "长期负债：", code: "" },
            { index: 48, text: "  长期借款", code: "2301" },
            { index: 49, text: "  应付债券", code: "2311" },
            { index: 50, text: "  长期应付款", code: "2321" },
            { index: 51, text: "  专项应付款", code: "2331" },
            { index: 52, text: "  其他长期负债", code: "" },
            { index: 53, text: "  长期负债合计", code: "", formulaBeg: "SUM(G23:G27)", formulaEnd: "SUM(H23:H27)" },
            { index: 53.1, text: "递延税项：", code: "" },
            { index: 54, text: "  递延税款贷项", code: "2341" },
            { index: 55, text: "  负债合计", code: "", formulaBeg: "G21+G28+G30", formulaEnd: "H21+H28+H30" },
            { index: 55.1, text: "", code: "" },
            { index: 55.2, text: "所有者权益（或股东权益)：", code: "" },
            { index: 56, text: "  实收资本（或股本）", code: "3101" },
            { index: 57, text: "    减：已归还投资", code: "3103" },
            { index: 58, text: "  实收资本（或股本）净额", code: "", formulaBeg: "G34-G35", formulaEnd: "H34-H35" },
            { index: 59, text: "  资本公积", code: "3111" },
            { index: 60, text: "  盈余公积", code: "3121" },
            { index: 61, text: "    其中：法定公益金", code: "" },
            { index: 62, text: "  未分配利润", code: "3141,3131", calcType: "+" },
            { index: 63, text: "  所有者权益（或股东权益)合计", code: "", formulaBeg: "G36+G37+G38+G40", formulaEnd: "H36+H37+H38+H40" },
            { index: 64, text: "负债和所有者权益(或股东权益)总计", code: "", formulaBeg: "G31+G41", formulaEnd: "H31+H41" },
        ];
        let reportData = {
            sheets: [{
                name: "资产负债表",
                showGridLines: true,
                columns: [
                    { index: 0, width: 160 },
                    { index: 1, width: 35 },
                    { index: 2, width: 90 },
                    { index: 3, width: 90 },
                    { index: 4, width: 160 },
                    { index: 5, width: 35 },
                    { index: 6, width: 90 },
                    { index: 7, width: 90 }
                ],
                mergedCells: ["A1:H1", "B2:G2", "A3:D3"],
                rows: [
                    {
                        cells: [
                            { value: "资产负债表", textAlign: "center", bold: true },
                        ]
                    },
                    {
                        cells: [
                            { value: "" },
                            { value: `税款所属期起止: ${year}-01-01 至 ${kendo.toString(new Date(new Date(year, period, 1) - 1), "yyyy-MM-dd")}`, textAlign: "center" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "会企01表" },
                        ]
                    },
                    {
                        cells: [
                            { value: "编制单位:雅时恒迅国际货运代理(上海)有限公司" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "单位:元" },
                        ]
                    },
                    {
                        cells: [
                            { value: "资  产" },
                            { value: "行次" },
                            { value: "年初数" },
                            { value: "期末数" },
                            { value: "负债和所有者权益(或股东权益)" },
                            { value: "行次" },
                            { value: "年初数" },
                            { value: "期末数" },
                        ]
                    },
                    {
                        cells: [
                            { value: "流动资产:" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "流动负债:" },
                            { value: "" },
                            { value: "" },
                            { value: "" },
                        ]
                    },
                ]
            }]
        };

        $.ajax({
            url: "../Accounting/Ledger/GetLedgerAccountBegEndAmount",
            data: { year: year, period: period, isYearStart: true },
            dataType: "json",
            type: "post",
            success: function (results) {
                rowData.forEach(function (row) {
                    if (row.index <= 32) {
                        let row2 = rowData[rowData.indexOf(row) + 37];
                        let cells1 = controllers.accounting.createCells(results, row);
                        let cells2 = controllers.accounting.createCells(results, row2);
                        reportData.sheets[0].rows.push({
                            cells: cells1.concat(cells2)
                        });
                    }
                });

                reportData.sheets[0].rows.forEach(function (row) {
                    let rowIndex = reportData.sheets[0].rows.indexOf(row);
                    row.cells.forEach(function (cell) {
                        let cellIndex = row.cells.indexOf(cell);
                        let numCol = [2, 3, 6, 7];
                        if (rowIndex >= 3) {
                            cell.borderTop = { size: "0.5px" };
                            cell.borderBottom = { size: "0.5px" };
                            cell.borderLeft = { size: "0.5px" };
                            cell.borderRight = { size: "0.5px" };
                            if (rowIndex >= 5 && numCol.indexOf(cellIndex) != -1) {
                                cell.format = "#,##0.00";
                            }
                        }
                    });
                });

                spreadsheet.fromJSON(reportData);
            }
        });
    }

    getProfitLoss = function (spreadsheet, year, period) {
        let rowData = [
            { index: 1, text: "一、主营业务收入", code: "5101" },
            { index: 2, text: "  减：主营业务成本", code: "5401" },
            { index: 3, text: "      主营业务税金及附加", code: "5402" },
            { index: 4, text: "二、主营业务利润（亏损以“-”号填列)", code: "", formulaBeg: "C6-C7-C8", formulaEnd: "D6-D7-D8" },
            { index: 5, text: "  加：其他业务利润（亏损以“-”号填列） ", code: "5102" },
            { index: 6, text: "  减：营业费用", code: "5501" },
            { index: 7, text: "      管理费用", code: "5502" },
            { index: 8, text: "      财务费用", code: "5503" },
            { index: 9, text: "三、营业利润（亏损以“-”号填列） ", code: "", formulaBeg: "C9+C10-C11-C12-C13", formulaEnd: "D9+D10-D11-D12-D13" },
            { index: 10, text: "  加：投资收益（损失以“-”号填列）", code: "5201" },
            { index: 11, text: "     补贴收入", code: "5203" },
            { index: 12, text: "     营业外收入", code: "5301" },
            { index: 13, text: "  减：营业外支出", code: "5601" },
            { index: 14, text: "四、利润总额（亏损总额以“-”号填列）", code: "", formulaBeg: "SUM(C14:C17)-C18", formulaEnd: "SUM(D14:D17)-D18" },
            { index: 15, text: "  减：所得税", code: "5701" },
            { index: 16, text: "五、净利润（净亏损以“-”号填列）", code: "", formulaBeg: "C19-C20", formulaEnd: "D19-D20" }];
        let reportData = {
            sheets: [{
                name: "利润表",
                showGridLines: true,
                columns: [
                    { index: 0, width: 210 },
                    { index: 1, width: 40 },
                    { index: 2, width: 120 },
                    { index: 3, width: 120 },
                ],
                mergedCells: ["A1:D1", "A3:D3", "A4:C4"],
                rows: [
                    {
                        cells: [
                            { value: "利润表", textAlign: "center", bold: true },
                        ]
                    },
                    {
                        cells: [
                            { value: "" },
                            { value: "" },
                            { value: "" },
                            { value: "会企02表" },
                        ]
                    },
                    {
                        cells: [
                            { value: `税款所属期起止: ${year}-01-01 至 ${kendo.toString(new Date(new Date(year, period, 1) - 1), "yyyy-MM-dd")}`, textAlign: "center" },
                        ]
                    },
                    {
                        cells: [
                            { value: "编制单位:雅时恒迅国际货运代理(上海)有限公司" },
                            { value: "" },
                            { value: "" },
                            { value: "单位:元" },
                        ]
                    },
                    {
                        cells: [
                            { value: "项  目" },
                            { value: "行次" },
                            { value: "本月数" },
                            { value: "本年累计数" }
                        ]
                    },
                ]
            }]
        };

        $.ajax({
            url: "../Accounting/Ledger/GetProfitLossSummary",
            data: { year: year, period: period },
            dataType: "json",
            type: "post",
            success: function (results) {
                rowData.forEach(function (row) {
                    reportData.sheets[0].rows.push({
                        cells: controllers.accounting.createCells(results, row)
                    });
                });

                reportData.sheets[0].rows.forEach(function (row) {
                    let rowIndex = reportData.sheets[0].rows.indexOf(row);
                    row.cells.forEach(function (cell) {
                        let cellIndex = row.cells.indexOf(cell);
                        let numCol = [2, 3];
                        if (rowIndex >= 4) {
                            cell.borderTop = { size: "0.5px" };
                            cell.borderBottom = { size: "0.5px" };
                            cell.borderLeft = { size: "0.5px" };
                            cell.borderRight = { size: "0.5px" };
                            if (rowIndex >= 5 && numCol.indexOf(cellIndex) != -1) {
                                cell.format = "#,##0.00";
                            }
                        }
                    });
                });

                spreadsheet.fromJSON(reportData);
            }
        });
    }

    createCells = function (results, row) {
        if (row.index.toString().indexOf(".") != -1)
            return [{ value: row.text }, {}, {}, {}];

        let cells = [];
        cells.push({ value: row.text });
        cells.push({ value: row.index });
        if (utils.isEmptyString(row.code)) {
            if (row.formulaBeg != null)
                cells.push({ formula: row.formulaBeg });
            else
                cells.push({ value: 0 });
            if (row.formulaEnd != null)
                cells.push({ formula: row.formulaEnd });
            else
                cells.push({ value: 0 });
        } else {
            let amtBeg = 0;
            let amtEnd = 0;
            if (row.code.indexOf(",") == -1) {
                if (results.filter(a => a.AC_CODE == row.code).length > 0) {
                    let data = results.filter(a => a.AC_CODE == row.code)[0];
                    amtBeg = data.AMT_BEG;
                    amtEnd = data.AMT_END;
                }
            } else {
                row.code.split(',').forEach(function (code) {
                    if (results.filter(a => a.AC_CODE == code).length > 0) {
                        let data = results.filter(a => a.AC_CODE == code)[0];
                        amtBeg = eval(amtBeg + row.calcType + data.AMT_BEG);
                        amtEnd = eval(amtEnd + row.calcType + data.AMT_END);
                    }
                });
            }
            cells.push({ value: amtBeg });
            cells.push({ value: amtEnd });
        }
        return cells;
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
        $(`#${formId} [name="gridVoucherIndex"]`).data("kendoGrid").setOptions({ filterable: true });
    }

    loadVoucher = function (id, popupWin) {
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
                controllers.accounting.initVoucherControls(result);
                popupWin.center();
            }
        });
    }

    newVoucher = function (popupWin) {
        $.ajax({
            url: "../Accounting/Voucher/GetVoucherNo",
            data: { voucherDate: (new Date()).toISOString() },
            dataType: "text",
            type: "post",
            success: function (voucherNo) {
                let result = [{
                    VOUCHER_TYPE: "记",
                    VOUCHER_NO: voucherNo,
                    LINE_NO: 1,
                    AC_CODE: "",
                    DESC_TEXT: "",
                    DR_AMT: 0,
                    CR_AMT: 0,
                    INV_NO: "",
                    INV_DATE: null,
                    CUSTOMER_CODE: "",
                    VENDOR_CODE: "",
                    DEP_CODE: "",
                    PERSON_CODE: "",
                    RELATED_AC: "",
                    VOUCHER_DATE: new Date(),
                    CBILL: data.user.USER_ID,
                    CCHECK: "",
                    CCASHIER: "",
                    IBOOK: 0
                }];

                controllers.accounting.initVoucherControls(result);
                if (popupWin != null)
                    popupWin.center();
            }
        });

    }

    initVoucherControls = function (result) {
        let html = `<table style="width: 700px">
                    <tr><td style="text-align: center"><h3>记 账 凭 证</h3></td></tr>
                    <tr>
                        <th>${result[0].VOUCHER_TYPE} - 字 - <span>${result[0].VOUCHER_NO.toString().padStart(4, "0")}</span> 
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
        $("[name='kendo-window-alertMessage-content'] [name='voucherDate']").kendoDatePicker({
            value: result[0].VOUCHER_DATE,
            change: function () {
                if ($(".k-window-title b").first().text() == "New Voucher") {
                    let value = this.value();
                    $.ajax({
                        url: "../Accounting/Voucher/GetVoucherNo",
                        data: { voucherDate: value.toISOString() },
                        dataType: "text",
                        type: "post",
                        success: function (voucherNo) {
                            $("[name='kendo-window-alertMessage-content'] th span").first().text(voucherNo.toString().padStart(4, "0"));
                        }
                    });
                }
            }
        });
        $("[name='kendo-window-alertMessage-content'] [name='gridVoucherItem']").kendoGrid({
            toolbar: ["create", "cancel"],
            editable: { mode: "incell", confirmation: false, createAt: "bottom" },
            resizable: true,
            navigatable: true,
            selectable: "row",
            columns: [
                { field: "LINE_NO", hidden: true },
                {
                    field: "DESC_TEXT",
                    template: (dataItem) => utils.removeNullString(`${dataItem.DESC_TEXT}`),
                    editor: function (container, options) { controls.renderGridEditorVoucherDesc(container, options) },
                    title: "Description"
                },
                {
                    field: "AC_CODE",
                    template: (dataItem) => utils.removeNullString(`${dataItem.AC_CODE} - ${dataItem.AC_NAME}`),
                    editor: function (container, options) { controls.renderGridEditorLedgerAccount(container, options) },
                    title: "Account Name"
                },
                { field: "DR_AMT", title: "Debit Amount", footerTemplate: ({ DR_AMT }) => `${kendo.toString(DR_AMT.sum, "n")}` },
                { field: "CR_AMT", title: "Credit Amount", footerTemplate: ({ CR_AMT }) => `${kendo.toString(CR_AMT.sum, "n")}` }
            ],
            fields: {
                LINE_NO: { type: "number" },
                DESC_TEXT: { type: "string" },
                AC_CODE: { type: "string" },
                AC_NAME: { type: "string" },
                DR_AMT: { type: "number" },
                CR_AMT: { type: "number" },
            },
            dataSource: {
                type: "json",
                data: result,
                aggregate: [
                    { field: "DR_AMT", aggregate: "sum" },
                    { field: "CR_AMT", aggregate: "sum" }
                ]
            },
            edit: function (e) {
                if (e.model.LINE_NO == null) {
                    let grid = this;
                    e.model.LINE_NO = grid.dataSource.data().length;
                    e.model.DESC_TEXT = "";
                    e.model.AC_CODE = "";
                    e.model.AC_NAME = "";
                    e.model.DR_AMT = 0;
                    e.model.CR_AMT = 0;
                }
            },
            cellClose: function (e) {
                if (!utils.isEmptyString(e.model.DESC_TEXT)) {
                    if (e.model.DESC_TEXT.DESC_TEXT != null)
                        e.model.DESC_TEXT = e.model.DESC_TEXT.DESC_TEXT;
                }
                if (!utils.isEmptyString(e.model.AC_CODE)) {
                    if (e.model.AC_CODE.AC_CODE != null)
                        e.model.AC_CODE = e.model.AC_CODE.AC_CODE;

                    e.model.AC_NAME = data.masterRecords.ledgerAccounts.filter(a => a.AC_CODE == e.model.AC_CODE)[0].AC_NAME;
                    e.sender.trigger("change");
                }

                //refresh the grid footer
                let grid = this;
                let drAmt = 0;
                let crAmt = 0;
                for (let i = 0; i < grid.items().length; i++) {
                    let dataItem = grid.dataItems()[i];
                    drAmt += Number(dataItem.DR_AMT);
                    crAmt += Number(dataItem.CR_AMT);
                }
                $("[name='kendo-window-alertMessage-content'] [name='gridVoucherItem'] .k-footer-template td").eq(3).text(kendo.toString(drAmt, "n"));
                $("[name='kendo-window-alertMessage-content'] [name='gridVoucherItem'] .k-footer-template td").eq(4).text(kendo.toString(crAmt, "n"));
            },
            change: function (e) {
                let grid = this;
                let dataItem = grid.dataItem(grid.select()[0]);
                let ledgerAccount = data.masterRecords.ledgerAccounts.filter(a => a.AC_CODE == dataItem.AC_CODE)[0];

                if (ledgerAccount == null)
                    return;

                if (ledgerAccount.ADD_INFO == "CUSTOMER" || ledgerAccount.ADD_INFO == "VENDOR") {
                    let ddlCtrl = "";
                    if (ledgerAccount.ADD_INFO == "CUSTOMER") {
                        ddlCtrl = `客户: <input name="CUSTOMER_CODE" />`;
                    } else if (ledgerAccount.ADD_INFO == "VENDOR") {
                        ddlCtrl = `供应商: <input name="VENDOR_CODE" />`;
                    }
                    let detailHtml = `票号: <input name="invNo" style="width: 220px" />
                            <br>日期: <input name="invDate" style="width: 170px" />
                            <br>${ddlCtrl} &nbsp;&nbsp;
                            <button type="button" class="hidden customButton button-icon-check-outline k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                            style="margin: 4px;" data-role="button" role="button" aria-disabled="false" tabindex="0" name="updateDetails">
                            <span class="k-icon k-i-check-outline k-button-icon"></span><span class="k-button-text">Update Details</span></button>`;

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
                                            if ($(`[name="kendo-window-alertMessage-content"] [name="CUSTOMER_CODE"]`).data("kendoDropDownList") != null) {
                                                $(`[name="kendo-window-alertMessage-content"] [name="CUSTOMER_CODE"]`).data("kendoDropDownList").select(1);
                                            }
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
                                            if ($(`[name="kendo-window-alertMessage-content"] [name="VENDOR_CODE"]`).data("kendoDropDownList") != null) {
                                                $(`[name="kendo-window-alertMessage-content"] [name="VENDOR_CODE"]`).data("kendoDropDownList").select(1);
                                            }
                                        }
                                    });
                                },
                            }
                        },
                    });
                    $(`[name="kendo-window-alertMessage-content"] [name="updateDetails"]`).click(function () {
                        if (grid.select().length > 0) {
                            grid.dataItem(grid.select()[0]).INV_NO = $(`[name="kendo-window-alertMessage-content"] [name="invNo"]`).val();
                            grid.dataItem(grid.select()[0]).INV_DATE = $(`[name="kendo-window-alertMessage-content"] [name="invDate"]`).data("kendoDatePicker").value();
                            if ($(`[name="kendo-window-alertMessage-content"] [name="CUSTOMER_CODE"]`).length == 1)
                                grid.dataItem(grid.select()[0]).CUSTOMER_CODE = $(`[name="kendo-window-alertMessage-content"] [name="CUSTOMER_CODE"]`).data("kendoDropDownList").value();
                            if ($(`[name="kendo-window-alertMessage-content"] [name="VENDOR_CODE"]`).length == 1)
                                grid.dataItem(grid.select()[0]).VENDOR_CODE = $(`[name="kendo-window-alertMessage-content"] [name="VENDOR_CODE"]`).data("kendoDropDownList").value();
                        }
                    });

                    //Auto save the changes when focus out
                    $(`[name="kendo-window-alertMessage-content"] [name="voucherDetail"] input`).each(function () {
                        $(this).blur(function () {
                            $(`[name="kendo-window-alertMessage-content"] [name="updateDetails"]`).trigger("click");
                        });
                    })
                }
                else
                    $(`[name="kendo-window-alertMessage-content"] [name="voucherDetail"]`).html("");
            }
        });
    }

    saveVoucher = function (ctrl) {
        let grid = $("[name='kendo-window-alertMessage-content'] [name='gridVoucherItem']").data("kendoGrid");
        let vouchers = [];
        let voucherDate = $("[name='kendo-window-alertMessage-content'] [name='voucherDate']").data("kendoDatePicker").value();
        let drAmt = 0;
        let crAmt = 0;
        let valid = true;

        for (let i = 0; i < grid.items().length; i++) {
            let dataItem = grid.dataItems()[i];
            drAmt += Number(dataItem.DR_AMT);
            crAmt += Number(dataItem.CR_AMT);
            if (dataItem.INV_DATE != null) {
                if (new Date(dataItem.INV_DATE) == "Invalid Date")
                    dataItem.INV_DATE = utils.convertJsonToDate(dataItem.INV_DATE).toISOString();
                else
                    dataItem.INV_DATE = new Date(dataItem.INV_DATE).toISOString();
            }

            vouchers.push({
                LINE_NO: i + 1,
                AC_CODE: dataItem.AC_CODE,
                DESC_TEXT: dataItem.DESC_TEXT,
                DR_AMT: dataItem.DR_AMT,
                CR_AMT: dataItem.CR_AMT,
                INV_NO: dataItem.INV_NO,
                INV_DATE: dataItem.INV_DATE,
                CUSTOMER_CODE: dataItem.CUSTOMER_CODE,
                VENDOR_CODE: dataItem.VENDOR_CODE,
            });
        }

        //prevent JS bug: 361371.52999999997 -> 361371.53
        drAmt = utils.roundUp(drAmt, 2);
        crAmt = utils.roundUp(crAmt, 2);

        let model = {
            YEAR: voucherDate.getFullYear(),
            PERIOD: voucherDate.getMonth() + 1, //Jan = 0, Feb = 1
            VOUCHER_NO: $("[name='kendo-window-alertMessage-content'] th span").first().text(),
            VOUCHER_DATE: voucherDate.toISOString(),
            CBILL: data.user.USER_ID,
            Vouchers: vouchers
        };

        if (grid.items().length = 0) {
            utils.showNotification("You must input at least 1 record.", "error", ".k-window .k-i-close");
            valid = false;
        }

        if (drAmt != crAmt) {
            utils.showNotification("Credit and Debit amount must be equal.", "error", ".k-window .k-i-close");
            valid = false;
        }

        //valid = false;
        console.log(drAmt, crAmt, model, valid);

        if (valid) {
            kendo.ui.progress($(`#${utils.getFormId()}`), true);
            $.ajax({
                url: "../Accounting/Voucher/SaveVoucher",
                data: { voucherModel: model },
                dataType: "json",
                type: "post",
                success: function (result) {
                    console.log("success", model);
                    let formId = utils.getFormId();
                    var ds = $(`#${formId} [name="gridVoucherIndex"]`).data("kendoGrid").dataSource;
                    $(`#${formId} [name="gridVoucherIndex"]`).data("kendoGrid").setDataSource(ds);
                    ctrl.destroy();
                    kendo.ui.progress($(`#${utils.getFormId()}`), false);
                }
            });
        }

    }
}