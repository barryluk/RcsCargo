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
                        paras.push({ name: "filename", value: "Summary Profit & Loss Report" });
                        controls.openReportViewer("SeaSummaryProfitLoss", paras);
                        break;

                    case "summaryProfitLossXls":
                        paras.push({ name: "fileFormat", value: "excel" });
                        utils.getRdlcExcelReport("SeaSummaryProfitLossXls", paras, "Summary Profit and Loss Report");
                        break;

                    case "containerManifest":
                        controllers.seaReport.dialogContainerManifest();
                        break;

                    case "invoiceReport":
                        controllers.seaReport.dialogInvoiceReport();
                        break;

                    case "missingInvoiceReport":
                        paras.push({ name: "fileFormat", value: "excel" });
                        utils.getRdlcExcelReport("SeaAutoReport_MissingInvoiceReport", paras, "Missing Invoice Report");
                        break;

                    case "certificateOrigin":
                        controllers.seaReport.dialogCertificateOrigin();
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
            paras.push({ name: "fileFormat", value: "excel" });
            utils.getRdlcExcelReport("SeaCarrierReport", paras, "Carrier Report");
        });
    }

    dialogJobProfitLossReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_jobProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Job #</label>
                <div class="col-sm-8">
                    <input type="selectSeaJob" class="form-control-dropdownlist" name="jobProfitLossReport_jobNo" />
                </div>
                <label class="col-sm-4 col-form-label">USD Ex. Rate</label>
                <div class="col-md-8">
                    <input type="number" class="form-control-number" name="jobProfitLossReport_usd" />
                </div>
                <label class="col-sm-4 col-form-label">HKD Ex. Rate</label>
                <div class="col-md-8">
                    <input type="number" class="form-control-number" name="jobProfitLossReport_hkd" />
                </div>
                <label class="col-sm-4 col-form-label">CNY Ex. Rate</label>
                <div class="col-md-8">
                    <input type="number" class="form-control-number" name="jobProfitLossReport_cny" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="jobProfitLossReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Job Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
        $(`[name="jobProfitLossReport_usd"]`).data("kendoNumericTextBox").value(data.masterRecords.currencies.filter(a => a.CURR_CODE == "USD")[0].EX_RATE);
        $(`[name="jobProfitLossReport_hkd"]`).data("kendoNumericTextBox").value(data.masterRecords.currencies.filter(a => a.CURR_CODE == "HKD")[0].EX_RATE);
        $(`[name="jobProfitLossReport_cny"]`).data("kendoNumericTextBox").value(data.masterRecords.currencies.filter(a => a.CURR_CODE == "CNY")[0].EX_RATE);

        $(`[name="jobProfitLossReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let jobNo = $(`[name="jobProfitLossReport_jobNo"]`).data("kendoDropDownList").value();
            let homeCurr = utils.getFrtMode() == "SE" ? data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].EX_CURR_CODE :
                data.masterRecords.sysCompanies.filter(a => a.COMPANY_ID == data.companyId)[0].IM_CURR_CODE;
            let usd = $(`[name="jobProfitLossReport_usd"]`).data("kendoNumericTextBox").value();
            let hkd = $(`[name="jobProfitLossReport_hkd"]`).data("kendoNumericTextBox").value();
            let cny = $(`[name="jobProfitLossReport_cny"]`).data("kendoNumericTextBox").value();

            paras.push({ name: "JobNo", value: jobNo });
            paras.push({ name: "CurrCode", value: homeCurr });
            paras.push({ name: "USD_ExRate", value: usd });
            paras.push({ name: "HKD_ExRate", value: hkd });
            paras.push({ name: "RMB_ExRate", value: cny });
            paras.push({ name: "filename", value: "Profit & Loss Report" });

            if (data.companyId == "RCSHKG_OFF")
                controls.openReportViewer("SeaProfitLoss_RCSHKG_OFF", paras);
            else if (data.companyId == "RCSHKG")
                controls.openReportViewer("SeaProfitLoss_RCSHKG", paras);
            else
                controls.openReportViewer("SeaProfitLoss", paras);
        });
    }

    dialogContainerManifest = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_containerManifest" style="width: 460px">
                <label class="col-sm-4 col-form-label">Vessel Voyage</label>
                <div class="col-sm-6">
                    <input type="selectVoyage" class="form-control-dropdownlist" name="containerManifest_VES_CODE" />
                </div>
                <div class="col-sm-2">
                    <input type="text" class="form-control readonlyInput" readonly="readonly" name="containerManifest_VOYAGE" />
                    <input type="hidden" name="LOADING_PORT" />
                    <input type="hidden" name="LOADING_PORT_DATE" />
                    <input type="hidden" name="DISCHARGE_PORT" />
                    <input type="hidden" name="DISCHARGE_PORT_DATE" />
                </div>
                <label class="col-sm-4 col-form-label">Job #</label>
                <div class="col-sm-8">
                    <input type="selectSeaJob" class="form-control-dropdownlist" name="containerManifest_jobNo" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="containerManifest_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Container Manifest", null, null, false);
        let formSetting = {
            id: `${utils.getFormId()}_containerManifest`,
            formGroups: [
                {
                    formControls: [
                        { name: "LOADING_PORT" },
                        { name: "LOADING_PORT_DATE" },
                        { name: "DISCHARGE_PORT" },
                        { name: "DISCHARGE_PORT_DATE" },
                    ],
                }],
        };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="containerManifest_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let jobNo = $(`[name="containerManifest_jobNo"]`).data("kendoDropDownList").value();
            let vesselName = $(`[name="containerManifest_VES_CODE"]`).data("kendoDropDownList").text();
            let voyage = $(`[name="containerManifest_VOYAGE"]`).val();
            let loadingPort = $(`#${utils.getFormId()} [name="LOADING_PORT"]`).val();
            let loadingPortDate = kendo.toString(utils.convertJsonToDate($(`#${utils.getFormId()} [name="LOADING_PORT_DATE"]`).val()), "yyyy/M/d");
            let dischargePort = $(`#${utils.getFormId()} [name="DISCHARGE_PORT"]`).val();
            let dischargePortDate = kendo.toString(utils.convertJsonToDate($(`#${utils.getFormId()} [name="DISCHARGE_PORT_DATE"]`).val()), "yyyy/M/d");

            paras.push({ name: "JobNo", value: jobNo });
            paras.push({ name: "VesselName", value: vesselName });
            paras.push({ name: "Voyage", value: voyage });
            paras.push({ name: "LoadingPort", value: loadingPort });
            paras.push({ name: "DischargePort", value: dischargePort });
            paras.push({ name: "ETD", value: loadingPortDate });
            paras.push({ name: "ETA", value: dischargePortDate });
            paras.push({ name: "filename", value: "Container Manifest" });

            controls.openReportViewer("SeaContainerManifest", paras);
        });
    }

    dialogInvoiceReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_invoiceReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Customer</label>
                <div class="col-md-8">
                    <input type="customer" class="form-control-dropdownlist" name="invoiceReport_customer" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="invoiceReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="invoiceReport_PrintVat"><span class="k-icon k-i-pdf"></span>Print (VAT)</span>
            </div>`;

        utils.alertMessage(html, "Invoice Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name^="invoiceReport_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let buttonName = $(this).attr("name");
            let customer = $(`[name="invoiceReport_customer"]`).data("kendoDropDownList").value();

            paras.push({ name: "CustomerCode", value: utils.isEmptyString(customer) ? "%" : customer });
            paras.push({ name: "fileFormat", value: "excel" });

            if (buttonName == "invoiceReport_Print") {
                utils.getRdlcExcelReport("SeaInvoiceReport", paras, "Invoice Report");
            } else if (buttonName == "invoiceReport_PrintVat") {
                utils.getRdlcExcelReport("SeaInvoiceReportVat", paras, "Invoice Report (VAT)");
            }
        });
    }

    dialogCertificateOrigin = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_certificateOrigin" style="width: 460px">
                <label class="col-sm-4 col-form-label">HB/L#</label>
                <div class="col-md-8">
                    <input type="selectHbl" class="form-control-dropdownlist" name="certificateOrigin_hblNo" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="certificateOrigin_Print"><span class="k-icon k-i-pdf"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Certificate of Origin", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name^="certificateOrigin_Print"]`).click(function () {
            let paras = controllers.seaReport.getCommonParas();
            let hblNo = $(`[name="certificateOrigin_hblNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "HblNo", value: hblNo });
            paras.push({ name: "filename", value: "Certificate of Origin" });
            controls.openReportViewer("SeaCertOrigin", paras);
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