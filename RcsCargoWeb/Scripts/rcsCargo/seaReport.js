export default class {
    constructor() {
    }

    initSeaReport = function (pageSetting) {
        //linkIdPrefix: seaMawb / seaBooking
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}

        $(`#${pageSetting.id} .menuButton`).each(function () {
            $(this).click(function () {
                let reportName = "";
                let paras = controllers.seaReport.getCommonParas();
                //testObj = $(this);
                switch ($(this).attr("name")) {
                    case "dailyBooking":
                        reportName = "SeaDailyBooking";
                        paras.push({ name: "fileFormat", value: "excel" });
                        utils.getExcelReport(reportName, paras, "Daily Booking");
                        break;

                    case "shipmentReport":
                        controllers.seaReport.dialogShipmentReport();
                        break;

                    case "customizeShipmentReport":
                        controllers.seaReport.dialogCustomizeShipmentReport();
                        break;

                    case "carrierReport":
                        controllers.seaReport.dialogCarrierReport();
                        break;

                    case "jobProfitLoss":
                        controllers.seaReport.dialogJobProfitLossReport();
                        break;

                    case "summaryProfitLoss":
                        controllers.seaReport.dialogSummaryProfitLossReport();
                        break;

                    case "invoiceReport":
                        controllers.seaReport.dialogInvoiceReport();
                        break;

                    case "invoiceReportOtherJob":
                        utils.getExcelReport("SeaOtherJobInvoiceReport", paras, "Invoice Report (Other Job)");
                        break;

                    case "pvReport":
                        controllers.seaReport.dialogPvReport();
                        break;

                    case "shaReport":
                        controllers.seaReport.dialogShaReport();
                        break;

                    case "usSummaryInvoiceReport":
                        utils.getExcelReport("SeaUsSummaryInvoiceReport", paras, "USLAX Invoice Summary Report");
                        break;
                }
            });
        });
    }

    dialogShipmentReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_shipmentReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Shipper</label>
                <div class="col-md-8">
                    <input type="customer" class="form-control-dropdownlist" name="shipmentReport_shipper" />
                </div>
                <label class="col-sm-4 col-form-label">Consignee</label>
                <div class="col-md-8">
                    <input type="customer" class="form-control-dropdownlist" name="shipmentReport_consignee" />
                </div>
                <label class="col-sm-4 col-form-label">Agent</label>
                <div class="col-md-8">
                    <input type="customer" class="form-control-dropdownlist" name="shipmentReport_agent" />
                </div>
                <label class="col-sm-4 col-form-label">Loading Port</label>
                <div class="col-md-8">
                    <input type="port" class="form-control-dropdownlist" name="shipmentReport_loadingPort" />
                </div>
                <label class="col-sm-4 col-form-label">Discharge Port</label>
                <div class="col-md-8">
                    <input type="port" class="form-control-dropdownlist" name="shipmentReport_dischargePort" />
                </div>
                <label class="col-sm-4 col-form-label">Sorting Order</label>
                <div class="col-md-8">
                    <input class="form-control-dropdownlist" name="shipmentReport_sortingOrder" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="shipmentReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="shipmentReport_PrintExcel"><span class="k-icon k-i-excel"></span>Excel</span>
            </div>`;

        utils.alertMessage(html, "Shipment Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
        $(`[name="shipmentReport_sortingOrder"]`).kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: {
                data: [
                    { text: "Shipper", value: "Shipper" },
                    { text: "Consignee", value: "Consignee" },
                    { text: "Agent", value: "Agent" },
                    { text: "Job #", value: "JobNo" },
                    { text: "HBL #", value: "HblNo" },
                    { text: "Loading Port", value: "LoadingPort" },
                    { text: "Discharge Port", value: "DischargePort" },
                    { text: "ETD", value: "LoadingPortDate" },
                ]
            }
        });

        $(`[name^="shipmentReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let buttonName = $(this).attr("name");
            let shipper = $(`[name="shipmentReport_shipper"]`).data("kendoDropDownList").value();
            let consignee = $(`[name="shipmentReport_consignee"]`).data("kendoDropDownList").value();
            let agent = $(`[name="shipmentReport_agent"]`).data("kendoDropDownList").value();
            let loadingPort = $(`[name="shipmentReport_loadingPort"]`).data("kendoDropDownList").value();
            let dischargePort = $(`[name="shipmentReport_dischargePort"]`).data("kendoDropDownList").value();
            let sortingOrder = $(`[name="shipmentReport_sortingOrder"]`).data("kendoDropDownList").value();

            paras.push({ name: "ShipperCode", value: utils.isEmptyString(shipper) ? "%" : shipper });
            paras.push({ name: "ConsigneeCode", value: utils.isEmptyString(consignee) ? "%" : consignee });
            paras.push({ name: "AgentCode", value: utils.isEmptyString(agent) ? "%" : agent });
            paras.push({ name: "LoadingPort", value: utils.isEmptyString(loadingPort) ? "%" : loadingPort });
            paras.push({ name: "DischargePort", value: utils.isEmptyString(dischargePort) ? "%" : dischargePort });
            paras.push({ name: "SortingOrder", value: sortingOrder });
            paras.push({ name: "filename", value: "Shipment Report" });

            if (buttonName == "shipmentReport_Print") {
                controls.openReportViewer("SeaShipmentReport", paras);
            } else if (buttonName == "shipmentReport_PrintExcel") {
                paras.push({ name: "fileFormat", value: "excel" });
                utils.getRdlcExcelReport("SeaShipmentReport", paras, "Shipment Report");
            }
        });
    }

    dialogCustomizeShipmentReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_customizeShipmentReport" style="width: 600px">
                <label class="col-sm-3 col-form-label">Group Code</label>
                <div class="col-md-9">
                    <input type="groupCode" class="form-control-dropdownlist" name="customizeShipmentReport_groupCode" />
                </div>
                <label class="col-sm-3 col-form-label">Shipper</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="customizeShipmentReport_shipper" />
                </div>
                <label class="col-sm-3 col-form-label">Consignee</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="customizeShipmentReport_consignee" />
                </div>
                <label class="col-sm-3 col-form-label">Agent</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="customizeShipmentReport_agent" />
                </div>
                <label class="col-sm-3 col-form-label">Loading Port</label>
                <div class="col-md-9">
                    <input type="port" class="form-control-dropdownlist" name="customizeShipmentReport_loadingPort" />
                </div>
                <label class="col-sm-3 col-form-label">Discharge Port</label>
                <div class="col-md-9">
                    <input type="port" class="form-control-dropdownlist" name="customizeShipmentReport_dischargePort" />
                </div>
                <label class="col-sm-3 col-form-label">Report Fields</label>
                <div class="col-md-9">
                    <select id="customizeShipmentReport_allFields" style="width: 200px; height: 260px; margin-bottom: 6px; margin-left: 2px;" />
                    <select id="customizeShipmentReport_selectedFields" style="width: 180px; height: 260px; margin-left: 6px;" />
                </div>
                <label class="col-sm-3 col-form-label">Sorting Order</label>
                <div class="col-md-9">
                    <input class="form-control-dropdownlist" name="customizeShipmentReport_sortingOrder" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="customizeShipmentReport_Print"><span class="k-icon k-i-excel"></span>Excel</span>
            </div>`;

        utils.alertMessage(html, "Customize Shipment Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="customizeShipmentReport_sortingOrder"]`).kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: {
                data: [
                    { text: "HB/L #", value: "HBL_NO" },
                    { text: "Invoice #", value: "INV_NO" },
                    { text: "ETD", value: "LOADING_PORT_DATE" },
                    { text: "Job #", value: "JOB_NO" },
                ]
            }
        });
        $(`#customizeShipmentReport_allFields`).kendoListBox({
            dataSource: [
                { value: "HBL_NO|HblNo", text: "HB/L #" },
                { value: "MASTER_HBL_NO|MasterHblNo", text: "MB/L #" },
                { value: "JOB_NO|JobNo", text: "Job no." },
                { value: "SHIPPER_DESC|ShipperDesc", text: "Shipper" },
                { value: "CONSIGNEE_DESC|ConsigneeDesc", text: "Consignee" },
                { value: "AGENT_DESC|AgentDesc", text: "Agent" },
                { value: "CARRIER|Carrier", text: "Carrier" },
                { value: "VES_DESC|VesDesc", text: "Vessel" },
                { value: "VOYAGE|Voyage", text: "Voyage" },
                { value: "LOADING_PORT|LoadingPort", text: "Loading Port" },
                { value: "DISCHARGE_PORT|DischargePort", text: "Discharge Port" },
                { value: "LOADING_COUNTRY|LoadingCountry", text: "Loading Country" },
                { value: "DISCHARGE_COUNTRY|DischargeCountry", text: "Discharge Country" },
                { value: "LOADING_PORT_DATE|LoadingPortDate", text: "ETD" },
                { value: "DISCHARGE_PORT_DATE|DischargePortDate", text: "ETA" },
                { value: "FRT_TERM|FrtTerm", text: "Frt Term" },
                { value: "PO_NO|PoNo", text: "P.O." },
                { value: "STYLE_NO|StyleNo", text: "Style" },
                { value: "CONTAINER_NO|ContainerNo", text: "Container #" },
                { value: "KGS|Kgs", text: "Kgs" },
                { value: "CBM|Cbm", text: "CBM" },
                { value: "INV_NO|InvNo", text: "Invoice no." },
                { value: "INV_DATE|InvDate", text: "Invoice Date" },
                { value: "FRT_RATE|FrtRate", text: "Frt. Rate" },
                { value: "AMOUNT_HOME|AmountHome", text: "Invoice Amount" },
                { value: "ContainerType|ContainerType", text: "Container Type" },
                { value: "CONTRACT|Contract", text: "Contract" },
                { value: "CONTRACT_NO|ContractNo", text: "Contract No." },
                { value: "PS_AMT|PsAmt", text: "Profit share amount" },
                { value: "PLS_AMT|PlsAmt", text: "Loss share amount" },
            ],
            connectWith: "customizeShipmentReport_selectedFields",
            dataTextField: "text",
            dataValueField: "value",
            draggable: true,
            selectable: "single",
            toolbar: {
                tools: [
                    "transferTo",
                    "transferFrom",
                    "transferAllTo",
                    "transferAllFrom",
                ]
            }
        });

        $(`#customizeShipmentReport_selectedFields`).kendoListBox({
            connectWith: "customizeShipmentReport_allFields",
            dropSources: ["customizeShipmentReport_allFields"],
            draggable: true,
            selectable: "single",
        });

        $(`[name="customizeShipmentReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let groupCode = $(`[name="customizeShipmentReport_groupCode"]`).data("kendoDropDownList").value();
            let shipper = $(`[name="customizeShipmentReport_shipper"]`).data("kendoDropDownList").value();
            let consignee = $(`[name="customizeShipmentReport_consignee"]`).data("kendoDropDownList").value();
            let agent = $(`[name="customizeShipmentReport_agent"]`).data("kendoDropDownList").value();
            let loadingPort = $(`[name="customizeShipmentReport_loadingPort"]`).data("kendoDropDownList").value();
            let dischargePort = $(`[name="customizeShipmentReport_dischargePort"]`).data("kendoDropDownList").value();
            let sortingOrder = $(`[name="customizeShipmentReport_sortingOrder"]`).data("kendoDropDownList").value();
            let selectedItems = $(`#customizeShipmentReport_selectedFields`).data("kendoListBox").items();
            let dataItems = $(`#customizeShipmentReport_selectedFields`).data("kendoListBox").dataItems();
            let selectedFields = [];

            selectedItems.each(function () {
                selectedFields.push({
                    name: $(this).text(),
                    value: dataItems.filter(a => a.text == $(this).text())[0].value,
                });
            });

            paras.push({ name: "GroupCode", value: utils.isEmptyString(groupCode) ? "%" : groupCode });
            paras.push({ name: "ShipperCode", value: utils.isEmptyString(shipper) ? "%" : shipper });
            paras.push({ name: "ConsigneeCode", value: utils.isEmptyString(consignee) ? "%" : consignee });
            paras.push({ name: "AgentCode", value: utils.isEmptyString(agent) ? "%" : agent });
            paras.push({ name: "LoadingPort", value: utils.isEmptyString(loadingPort) ? "%" : loadingPort });
            paras.push({ name: "DischargePort", value: utils.isEmptyString(dischargePort) ? "%" : dischargePort });
            paras.push({ name: "SelectedFields", value: selectedFields });
            paras.push({ name: "SortingOrder", value: sortingOrder });
            utils.getExcelReport("SeaCustomizeShipmentReport", paras, "Customize Shipment Report");
        });
    }

    dialogCarrierReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_shipmentReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Carrier</label>
                <div class="col-md-8">
                    <input type="carrier" class="form-control-dropdownlist" name="carrierReport_carrier" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="carrierReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Carrier Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name^="carrierReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let buttonName = $(this).attr("name");
            let carrier = $(`[name="carrierReport_carrier"]`).data("kendoDropDownList");

            paras.push({ name: "CarrierCode", value: utils.isEmptyString(carrier.value()) ? "%" : carrier.value() });
            paras.push({ name: "Carrier", value: utils.isEmptyString(carrier.value()) ? "" : carrier.text().replace(carrier.value() + " - ", "") });
            //paras.push({ name: "filename", value: "Carrier Report" });
            //controls.openReportViewer("SeaCarrierReport", paras);
            utils.getRdlcExcelReport("SeaInvoiceReSeaCarrierReportportVat", paras, "Carrier Report");
        });
    }

    dialogCustomerTonnageReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_customerTonnage" style="width: 460px">
                <label class="col-sm-3 col-form-label">Group code</label>
                <div class="col-md-9">
                    <input type="groupCode" class="form-control-dropdownlist" name="pvReport_groupCode" />
                </div>
                <label class="col-sm-3 col-form-label">Vendor</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="pvReport_vendor" />
                </div>
                <label class="col-sm-3 col-form-label">Consignee</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="pvReport_consignee" />
                </div>
                <label class="col-sm-3 col-form-label">Origin Invoice Type</label>
                <div class="col-sm-9">
                    <input name="pvReport_originInvType" />
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="pvReport_print"><span class="k-icon k-i-excel"></span>Print</span>
                </div>
            </div>`;

        utils.alertMessage(html, "Job Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
    }

    dialogJobProfitLossReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_jobProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Job #</label>
                <div class="col-sm-8">
                    <input type="selectJob" class="form-control-dropdownlist" name="jobProfitLossReport_jobNo" />
                </div>
                <label class="col-sm-4 col-form-label">MAWB#</label>
                <div class="col-md-8">
                    <input type="selectMawb" class="form-control-dropdownlist" name="jobProfitLossReport_mawbNo" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="jobProfitLossReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Job Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="jobProfitLossReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let jobNo = $(`[name="jobProfitLossReport_jobNo"]`).data("kendoDropDownList").value();
            let mawbNo = $(`[name="jobProfitLossReport_mawbNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "JobNo", value: jobNo });
            paras.push({ name: "MawbNo", value: mawbNo });
            paras.push({ name: "Remarks", value: "" });
            paras.push({ name: "filename", value: "Profit & Loss Report" });
            controls.openReportViewer("SeaProfitLoss", paras);
        });
    }

    dialogOtherJobProfitLossReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_otherJobProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Job #</label>
                <div class="col-sm-8">
                    <input type="selectJob" class="form-control-dropdownlist" name="otherJobProfitLossReport_jobNo" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="otherJobProfitLossReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Other Job Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="otherJobProfitLossReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let jobNo = $(`[name="otherJobProfitLossReport_jobNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "JobNo", value: jobNo });
            paras.push({ name: "filename", value: "Other Job Profit & Loss Report" });
            controls.openReportViewer("SeaOtherJobProfitLoss", paras);
        });
    }

    dialogLotProfitLossReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_lotProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Lot #</label>
                <div class="col-sm-8">
                    <input type="selectLot" class="form-control-dropdownlist" name="lotProfitLossReport_lotNo" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="lotProfitLossReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Lot Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="lotProfitLossReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let lotNo = $(`[name="lotProfitLossReport_lotNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "LotNo", value: lotNo });
            paras.push({ name: "filename", value: "Lot Profit & Loss Report" });
            controls.openReportViewer("SeaLotProfitLoss", paras);
        });
    }

    dialogSummaryProfitLossReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_summaryProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Sealine</label>
                <div class="col-sm-8">
                    <input type="sealine" class="form-control-dropdownlist" name="summaryProfitLossReport_sealine" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="summaryProfitLossReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="summaryProfitLossReport_PrintSealine"><span class="k-icon k-i-pdf"></span>Print (Sealine)</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="summaryProfitLossReport_PrintBreakdown"><span class="k-icon k-i-excel"></span>Print (Breakdown)</span>
            </div>`;

        utils.alertMessage(html, "Summary Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name^="summaryProfitLossReport_Print"]`).click(function () {
            let buttonName = $(this).attr("name");
            let paras = controllers.seaReport.getCommonParas("yyyyMMdd");
            let sealine = $(`[name="summaryProfitLossReport_sealine"]`).data("kendoDropDownList").value();

            if (buttonName == "summaryProfitLossReport_Print") {
                paras.push({ name: "Sealine", value: utils.isEmptyString(sealine) ? "%" : sealine });
                paras.push({ name: "filename", value: "Summary Profit & Loss Report" });
                controls.openReportViewer("SeaSummaryProfitLoss", paras);
            } else if (buttonName == "summaryProfitLossReport_PrintSealine") {
                paras.push({ name: "Sealine", value: utils.isEmptyString(sealine) ? "%" : sealine });
                paras.push({ name: "filename", value: "Summary Profit & Loss Report (Sealine)" });
                controls.openReportViewer("SeaSummarySealineProfitLoss", paras);
            } else if (buttonName == "summaryProfitLossReport_PrintBreakdown") {
                paras = controllers.seaReport.getCommonParas();
                paras.push({ name: "Sealine", value: utils.isEmptyString(sealine) ? "%" : sealine });
                utils.getExcelReport("SeaSummaryProfitLossBreakDown", paras, "Summary Profit Loss Report (Breakdown)");
            }
        });
    }

    dialogOffshoreSummaryProfitLoss = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_offShoreSummaryProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Origins</label>
                <div class="col-sm-8">
                    <div name="offShoreSummaryProfitLossReport_origins" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="offshoreSummaryProfitLossReport_Print"><span class="k-icon k-i-excel"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="offshoreSummaryProfitLossReport_PrintHKG"><span class="k-icon k-i-excel"></span>Print (HKG)</span>
            </div>`;

        utils.alertMessage(html, "Offshore/HKG Summary Profit & Loss Report", null, null, false);
        $.ajax({
            url: "../Home/GetOffshoreOrigins",
            success(result) {
                let origins = [];
                result.forEach(function (origin) {
                    origins.push({ label: origin, themeColor: "info" });
                });

                $(`#${utils.getFormId()} [name="offShoreSummaryProfitLossReport_origins"]`).kendoChipList({
                    selectable: 'multiple',
                    itemSize: "small",
                    items: origins,
                });
            }
        });

        $(`[name^="offshoreSummaryProfitLossReport_Print"]`).click(function () {
            let buttonName = $(this).attr("name");
            let paras = controllers.seaReport.getCommonParas();
            let origins = [];
            $(`#${utils.getFormId()}_offShoreSummaryProfitLossReport [name="offShoreSummaryProfitLossReport_origins"]`).data("kendoChipList").items().each(function () {
                if ($(this).hasClass("k-selected"))
                    origins.push($(this).text())
            });

            if (buttonName == "offshoreSummaryProfitLossReport_Print") {
                paras.push({ name: "Origins", value: origins });
                utils.getExcelReport("SeaOffshoreSummaryJobProfitLoss", paras, "Offshore Summary Profit Loss Report");
            } else if (buttonName == "offshoreSummaryProfitLossReport_PrintHKG") {
                utils.getExcelReport("SeaHKGSummaryJobProfitLoss", paras, "HKG Summary Profit Loss Report");
            }
        });

        
    }

    dialogInvoiceReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_invoiceReport" style="width: 460px">
                <label class="col-sm-3 col-form-label">Payee</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="invoiceReport_payee" />
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="invoiceReport_print"><span class="k-icon k-i-pdf"></span>Print</span>
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="invoiceReport_printVat"><span class="k-icon k-i-pdf"></span>Print (VAT)</span>
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="invoiceReport_hkgSummary"><span class="k-icon k-i-excel"></span>HKG Billing Summary</span>
                </div>
            </div>`;

        utils.alertMessage(html, "Invoice Reports", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`#${utils.getFormId()} [name="invoiceReport_print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas("yyyyMMdd");
            paras.push({ name: "fileFormat", value: "excel" });
            utils.getRdlcExcelReport("SeaInvoiceReport", paras, "Invoice Report");
        });

        $(`#${utils.getFormId()} [name="invoiceReport_printVat"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas("yyyyMMdd");
            paras.push({ name: "fileFormat", value: "excel" });
            utils.getRdlcExcelReport("SeaInvoiceReportVat", paras, "Invoice Report (VAT)");
        });

        $(`#${utils.getFormId()} [name="invoiceReport_hkgSummary"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            paras.push({ name: "CustomerCode", value: $(`#${utils.getFormId()} [name=invoiceReport_payee]`).data("kendoDropDownList").value() });
            utils.getExcelReport("SeaInvoiceReport_HKG_Summary", paras, "HKG BillingSummaryReport");
        });
    }

    dialogPvReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_pvReport" style="width: 460px">
                <label class="col-sm-3 col-form-label">Group code</label>
                <div class="col-md-9">
                    <input type="groupCode" class="form-control-dropdownlist" name="pvReport_groupCode" />
                </div>
                <label class="col-sm-3 col-form-label">Vendor</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="pvReport_vendor" />
                </div>
                <label class="col-sm-3 col-form-label">Consignee</label>
                <div class="col-md-9">
                    <input type="customer" class="form-control-dropdownlist" name="pvReport_consignee" />
                </div>
                <label class="col-sm-3 col-form-label">Origin Invoice Type</label>
                <div class="col-sm-9">
                    <input name="pvReport_originInvType" />
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="pvReport_print"><span class="k-icon k-i-excel"></span>Print</span>
                </div>
            </div>`;

        utils.alertMessage(html, "Payment Voucher Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`#${utils.getFormId()} [name="pvReport_originInvType"]`).kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: {
                data: [{ text: "ALL", value: "" },
                    { text: "Origin Debit Note", value: "OD" },
                    { text: "Origin Credit Note", value: "OC" },
                    { text: "Destination PV", value: "DestPV" },
                ]
            }
        });

        $(`#${utils.getFormId()} [name="pvReport_print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            paras.push({ name: "OriginPvType", value: $(`#${utils.getFormId()} [name=pvReport_originInvType]`).data("kendoDropDownList").value() });
            paras.push({ name: "GroupCode", value: utils.formatSearchText($(`#${utils.getFormId()} [name=pvReport_groupCode]`).data("kendoDropDownList").value()) });
            paras.push({ name: "VendorCode", value: utils.formatSearchText($(`#${utils.getFormId()} [name=pvReport_vendor]`).data("kendoDropDownList").value()) });
            paras.push({ name: "ConsigneeCode", value: utils.formatSearchText($(`#${utils.getFormId()} [name=pvReport_consignee]`).data("kendoDropDownList").value()) });
            paras.push({ name: "fileFormat", value: "excel" });

            if (utils.isEmptyString($(`#${utils.getFormId()} [name=pvReport_originInvType]`).data("kendoDropDownList").value()))
                utils.getExcelReport("SeaPVReport", paras, `PV Report-${kendo.toString(new Date(), "MMM dd")}`);
            else
                utils.getRdlcExcelReport("SeaPvTypeReport", paras, `PV Type Report-${kendo.toString(new Date(), "MMM dd")}`);
        });
    }

    dialogShaReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_shaReport" style="width: 460px">
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="shaReport_account"><span class="k-icon k-i-excel"></span>出口开票明细</span>
                    &nbsp;
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="shaReport_accountImport"><span class="k-icon k-i-excel"></span>进口开票明细</span>
                    &nbsp;
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="shaReport_payment"><span class="k-icon k-i-excel"></span>付款账单明细</span>
                </div>
                <label class="col-lg-12 col-form-label"><h5>对账单</h5></label>
                <label class="col-sm-3 col-form-label">HAWB #</label>
                <div class="col-sm-9">
                    <input type="selectHawbAllOrigin" name="shaReport_hawb" />
                </div>
                <label class="col-sm-3 col-form-label">Charge Template</label>
                <div class="col-sm-9">
                    <input name="shaReport_chargeTemplate" />
                </div>
                <label class="col-sm-3 col-form-label">USD Ex. Rate</label>
                <div class="col-sm-9">
                    <input type="number" class="form-control-number" name="shaReport_usdExRate" />
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="shaReport_accountStatement"><span class="k-icon k-i-excel"></span>生成对账单</span>
                </div>
            </div>`;

        utils.alertMessage(html, "SHA / CN Reports", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
        $(`#${utils.getFormId()} [name="shaReport_chargeTemplate"]`).kendoDropDownList({
            dataSource: { data: ["SHA_1", "SZX_1", "TAO_1"] }
        });

        $(`#${utils.getFormId()} [name="shaReport_account"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let dateStr = kendo.toString($(`#${utils.getMasterFormId()} [name=dateRange]`).data("kendoDateRangePicker").range().start, "yyyy-MM")
            utils.getExcelReport("SeaInvoiceReport_SHA_Account", paras, `${dateStr}开票`);
        });
        $(`#${utils.getFormId()} [name="shaReport_accountImport"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let dateStr = kendo.toString($(`#${utils.getMasterFormId()} [name=dateRange]`).data("kendoDateRangePicker").range().start, "yyyy-MM")
            utils.getExcelReport("SeaInvoiceReport_SHA_Account_Import", paras, `${dateStr}进口开票`);
        });
        $(`#${utils.getFormId()} [name="shaReport_payment"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let dateStr = kendo.toString($(`#${utils.getMasterFormId()} [name=dateRange]`).data("kendoDateRangePicker").range().start, "yyyy-MM")
            paras.push({ name: "USD", value: $(`#${utils.getFormId()} [name=shaReport_usdExRate]`).data("kendoNumericTextBox").value() ?? 0 });
            utils.getExcelReport("SeaPaymentReport_SHA_Account", paras, `${dateStr}付款账单明细`);
        });
        $(`#${utils.getFormId()} [name="shaReport_accountStatement"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let hawbNo = $(`#${utils.getFormId()} [name=shaReport_hawb]`).data("kendoDropDownList").value();

            if (utils.isEmptyString(hawbNo)) {
                utils.showValidateNotification("Please select HAWB#", $(`#${utils.getFormId()} [name=shaReport_hawb]`).parent());
                return;
            }
            paras.push({ name: "HawbNo", value: hawbNo });
            paras.push({ name: "ChargeTemplateName", value: $(`#${utils.getFormId()} [name=shaReport_chargeTemplate]`).data("kendoDropDownList").value() });
            utils.getExcelReport("SeaInvoiceReport_SHA_DN", paras, `${hawbNo}账单`);
        });
    }

    getCommonParas = function (dateFormat = "yyyy/M/d") {
        let id = utils.getMasterFormId();
        let companyName = data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].COMPANY_NAME;
        return [
            { name: "CompanyId", value: data.companyId },
            { name: "FrtMode", value: utils.getFrtMode() },
            { name: "CompanyName", value: companyName },
            { name: "DateFrom", value: kendo.toString($(`#${id} [name=dateRange]`).data("kendoDateRangePicker").range().start, dateFormat) },
            { name: "DateTo", value: kendo.toString($(`#${id} [name=dateRange]`).data("kendoDateRangePicker").range().end, dateFormat) },
        ];
    }
}