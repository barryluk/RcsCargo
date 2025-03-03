export default class {
    constructor() {
    }

    initAirReport = function (pageSetting) {
        //linkIdPrefix: airMawb / airBooking
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}

        $(`#${pageSetting.id} .menuButton`).each(function () {
            $(this).click(function () {
                let reportName = "";
                let paras = controllers.airReport.getCommonParas();
                //testObj = $(this);
                switch ($(this).attr("name")) {
                    case "bookingReport":
                        reportName = "AirBookingReport";
                        paras.push({ name: "fileFormat", value: "excel" });
                        utils.getRdlcExcelReport(reportName, paras, "Booking Report");
                        break;

                    case "bookingDsr":
                        reportName = "AirBookingDSR";
                        utils.getExcelReport(reportName, paras, "Booking DSR");
                        break;

                    case "dailyBooking":
                        controllers.airReport.dialogDailyBooking();
                        break;

                    case "dailyBookingOverseas":
                        controllers.airReport.dialogDailyBookingOverseas();
                        break;

                    case "shipmentReport":
                        controllers.airReport.dialogShipmentReport();
                        break;

                    case "shipmentTrackingReport":
                        controllers.airReport.dialogShipmentTrackingReport();
                        break;

                    case "customizeShipmentReport":
                        controllers.airReport.dialogCustomizeShipmentReport();
                        break;

                    case "customerTonnageReport":
                        controllers.airReport.dialogCustomerTonnageReport();
                        break;

                    case "jobProfitLoss":
                        controllers.airReport.dialogJobProfitLossReport();
                        break;

                    case "otherJobProfitLoss":
                        controllers.airReport.dialogOtherJobProfitLossReport();
                        break;

                    case "otherJobSummaryProfitLoss":
                        utils.getExcelReport("AirSummaryOtherJobProfitLoss", paras, "Other Job Profit Loss Report");
                        break;

                    case "lotProfitLoss":
                        controllers.airReport.dialogLotProfitLossReport();
                        break;

                    case "summaryProfitLoss":
                        controllers.airReport.dialogSummaryProfitLossReport();
                        break;

                    case "offshoreSummaryProfitLoss":
                        controllers.airReport.dialogOffshoreSummaryProfitLoss();
                        break;

                    case "invoiceReport":
                        controllers.airReport.dialogInvoiceReport();
                        break;

                    case "invoiceReportOtherJob":
                        utils.getExcelReport("AirOtherJobInvoiceReport", paras, "Invoice Report (Other Job)");
                        break;

                    case "pvReport":
                        controllers.airReport.dialogPvReport();
                        break;

                    case "shaReport":
                        controllers.airReport.dialogShaReport();
                        break;

                    case "RCSCFSLAX_Reports":
                        controllers.airReport.dialogRCSCFSLAX_Report();
                        break;
                }
            });
        });
    }

    dialogDailyBooking = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_dailyBooking" style="width: 460px">
                <label class="col-sm-4 col-form-label">Reference Date</label>
                <div class="col-sm-8">
                    <input type="date" class="form-control-dateTime" name="dailyBooking_refDate" />
                </div>
                <label class="col-sm-4 col-form-label">Days after ref. date</label>
                <div class="col-md-8">
                    <input type="numberInt" class="form-control-number" name="dailyBooking_days" />
                </div>
                <label class="col-sm-4 col-form-label">Origin</label>
                <div class="col-md-8">
                    <input type="port" class="form-control-dropdownlist" name="dailyBooking_origin" />
                </div>
                <label class="col-sm-4 col-form-label">Destination</label>
                <div class="col-md-8">
                    <input type="port" class="form-control-dropdownlist" name="dailyBooking_dest" />
                </div>
                <label class="col-sm-4 col-form-label">Excluded ports</label>
                <div class="col-md-8">
                    <input type="text" class="form-control" name="dailyBooking_excludedPorts" placeholder="Use comma (,) to separate ports" />
                </div>
                <label class="col-sm-4 col-form-label">Show S/R</label>
                <div class="col-md-8">
                    <input type="switch" name="dailyBooking_showSr" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="dailyBooking_Print"><span class="k-icon k-i-pdf"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="dailyBooking_PrintExcel"><span class="k-icon k-i-excel"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="dailyBooking_PrintCbm"><span class="k-icon k-i-pdf"></span>Print (CBM)</span>
            </div>`;

        utils.alertMessage(html, "Daily Booking", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
        $(`[name="dailyBooking_refDate"]`).data("kendoDatePicker").value(new Date());
        $(`[name="dailyBooking_days"]`).data("kendoNumericTextBox").value(2);

        $(`[name^="dailyBooking_Print"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let buttonName = $(this).attr("name");
            let refDate = $(`[name="dailyBooking_refDate"]`).data("kendoDatePicker").value() ?? new Date();
            let days = $(`[name="dailyBooking_days"]`).data("kendoNumericTextBox").value() ?? 0;
            let origin = $(`[name="dailyBooking_origin"]`).data("kendoDropDownList").value();
            let dest = $(`[name="dailyBooking_dest"]`).data("kendoDropDownList").value();
            let exceptPorts = $(`[name="dailyBooking_excludedPorts"]`).val();
            let showSr = $(`[name="dailyBooking_showSr"]`).data("kendoSwitch").value();

            paras.filter(a => a.name == "DateTo")[0].value = kendo.toString(utils.addDays(refDate, days), "yyyy/M/d");
            paras.push({ name: "Origin", value: utils.isEmptyString(origin) ? "%" : origin });
            paras.push({ name: "Dest", value: utils.isEmptyString(dest) ? "%" : dest });
            paras.push({ name: "ExceptPorts", value: utils.formatText(exceptPorts) });
            paras.push({ name: "filename", value: "Daily Booking" });

            if (buttonName == "dailyBooking_Print") {
                if (showSr)
                    controls.openReportViewer("AirDailyBooking", paras);
                else
                    controls.openReportViewer("AirDailyBooking_NoSR", paras);
            } else if (buttonName == "dailyBooking_PrintExcel") {
                //let sender = $(this).parentsUntil(".k-widget.k-window").last();
                utils.getExcelReport("AirDailyBookingExcel", paras, "Daily Booking");
            } else if (buttonName == "dailyBooking_PrintCbm") {
                controls.openReportViewer("AirDailyBookingCBM", paras);
            }

        });
    }

    dialogDailyBookingOverseas = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_dailyBookingOverseas" style="width: 460px">
                <label class="col-sm-4 col-form-label">Reference Date</label>
                <div class="col-sm-8">
                    <input type="date" class="form-control-dateTime" name="dailyBookingOverseas_refDate" />
                </div>
                <label class="col-sm-4 col-form-label">Days before ref. date</label>
                <div class="col-md-8">
                    <input type="numberInt" class="form-control-number" name="dailyBookingOverseas_beforeDays" />
                </div>
                <label class="col-sm-4 col-form-label">Days after ref. date</label>
                <div class="col-md-8">
                    <input type="numberInt" class="form-control-number" name="dailyBookingOverseas_afterDays" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="dailyBookingOverseas_Print"><span class="k-icon k-i-excel"></span>Print</span>
            </div>`;

        utils.alertMessage(html, "Daily Booking For Overseas", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);
        $(`[name="dailyBookingOverseas_refDate"]`).data("kendoDatePicker").value(new Date());
        $(`[name="dailyBookingOverseas_beforeDays"]`).data("kendoNumericTextBox").value(2);
        $(`[name="dailyBookingOverseas_afterDays"]`).data("kendoNumericTextBox").value(2);

        $(`[name="dailyBookingOverseas_Print"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let refDate = $(`[name="dailyBookingOverseas_refDate"]`).data("kendoDatePicker").value() ?? new Date();
            let beforeDays = $(`[name="dailyBookingOverseas_beforeDays"]`).data("kendoNumericTextBox").value() ?? 2;
            let afterDays = $(`[name="dailyBookingOverseas_afterDays"]`).data("kendoNumericTextBox").value() ?? 2;

            paras.push({ name: "ReferenceDate", value: refDate.toISOString() });
            paras.filter(a => a.name == "DateFrom")[0].value = utils.addDays(refDate, beforeDays * -1).toISOString();
            paras.filter(a => a.name == "DateTo")[0].value = utils.addDays(refDate, afterDays).toISOString();
            paras.push({ name: "fileFormat", value: "excel" });

            utils.getRdlcExcelReport("AirDailyBooking_Oversea", paras, "Daily Booking For Overseas");
        });
    }

    dialogShipmentReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_shipmentReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Group Code</label>
                <div class="col-sm-8">
                    <input type="groupCode" class="form-control-dropdownlist" name="shipmentReport_groupCode" />
                </div>
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
                <label class="col-sm-4 col-form-label">Origin</label>
                <div class="col-md-8">
                    <input type="port" class="form-control-dropdownlist" name="shipmentReport_origin" />
                </div>
                <label class="col-sm-4 col-form-label">Destination</label>
                <div class="col-md-8">
                    <input type="port" class="form-control-dropdownlist" name="shipmentReport_dest" />
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
                    { text: "Flight Date", value: "FlightDate" },
                    { text: "Shipper", value: "Shipper" },
                    { text: "Consignee", value: "Consignee" },
                    { text: "Agent", value: "Agent" },
                    { text: "Job #", value: "JobNo" },
                    { text: "HAWB #", value: "HawbNo" },
                    { text: "MAWB #", value: "MawbNo" },
                    { text: "Origin", value: "Origin" },
                    { text: "Destination", value: "Dest" },
                ]
            }
        });

        $(`[name^="shipmentReport_Print"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let buttonName = $(this).attr("name");
            let groupCode = $(`[name="shipmentReport_groupCode"]`).data("kendoDropDownList").value();
            let shipper = $(`[name="shipmentReport_shipper"]`).data("kendoDropDownList").value();
            let consignee = $(`[name="shipmentReport_consignee"]`).data("kendoDropDownList").value();
            let agent = $(`[name="shipmentReport_agent"]`).data("kendoDropDownList").value();
            let origin = $(`[name="shipmentReport_origin"]`).data("kendoDropDownList").value();
            let dest = $(`[name="shipmentReport_dest"]`).data("kendoDropDownList").value();
            let sortingOrder = $(`[name="shipmentReport_sortingOrder"]`).data("kendoDropDownList").value();

            paras.push({ name: "GroupCode", value: utils.isEmptyString(groupCode) ? "%" : groupCode });
            paras.push({ name: "ShipperCode", value: utils.isEmptyString(shipper) ? "%" : shipper });
            paras.push({ name: "ConsigneeCode", value: utils.isEmptyString(consignee) ? "%" : consignee });
            paras.push({ name: "AgentCode", value: utils.isEmptyString(agent) ? "%" : agent });
            paras.push({ name: "OriginCode", value: utils.isEmptyString(origin) ? "%" : origin });
            paras.push({ name: "DestCode", value: utils.isEmptyString(dest) ? "%" : dest });
            paras.push({ name: "OriginRegion", value: "%" });
            paras.push({ name: "DestRegion", value: "%" });
            paras.push({ name: "SortingOrder", value: sortingOrder });
            paras.push({ name: "filename", value: "Shipment Report" });

            if (buttonName == "shipmentReport_Print") {
                controls.openReportViewer("AirShipmentReport", paras);
            } else if (buttonName == "shipmentReport_PrintExcel") {
                paras.push({ name: "fileFormat", value: "excel" });
                utils.getRdlcExcelReport("AirShipmentReport", paras, "Shipment Report");
            }
        });
    }

    dialogShipmentTrackingReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_shipmentTrackingReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Group Code</label>
                <div class="col-sm-8">
                    <input type="groupCode" class="form-control-dropdownlist" name="shipmentTrackingReport_groupCode" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 20%" name="shipmentTrackingReport_Print"><span class="k-icon k-i-excel"></span>Excel</span>
            </div>`;

        utils.alertMessage(html, "Shipment Tracking Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name="shipmentTrackingReport_Print"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let groupCode = $(`[name="shipmentTrackingReport_groupCode"]`).data("kendoDropDownList").value();
            paras.push({ name: "GroupCode", value: utils.isEmptyString(groupCode) ? "%" : groupCode });
            paras.push({ name: "fileFormat", value: "excel" });
            utils.getRdlcExcelReport("AirShipmentTrackingReport", paras, "Shipment Tracking Report");
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
                    { text: "Flight Date", value: "FLIGHT_DATE" },
                    { text: "HAWB #", value: "HAWB_NO" },
                    { text: "MAWB #", value: "MAWB_NO" },
                    { text: "Job #", value: "JOB_NO" },
                    { text: "Invoice #", value: "INV_NO" },
                ]
            }
        });
        $(`#customizeShipmentReport_allFields`).kendoListBox({
            dataSource: [
                { value: "HAWB_NO|HawbNo", text: "HAWB" },
                { value: "MAWB_NO|MawbNo", text: "MAWB" },
                { value: "INV_NO|InvNo", text: "Invoice no." },
                { value: "INV_DATE|InvDate", text: "Invoice Date" },
                { value: "FLIGHT_DATE|FlightDate", text: "Flight Date" },
                { value: "ETA|Eta", text: "Estimated Time of Arrival" },
                { value: "ATD|Atd", text: "Actual Departure Date" },
                { value: "ATA|Ata", text: "Actual Arrival Date" },
                { value: "FLIGHT_NO|FlightNo", text: "Flight no." },
                { value: "PO_NO|PoNo", text: "P.O." },
                { value: "STYLE_NO|StyleNo", text: "Style" },
                { value: "PCS|Pcs", text: "Pcs" },
                { value: "GWTS|Gwts", text: "Gross Weight" },
                { value: "VWTS|Vwts", text: "Volume Weight" },
                { value: "CWTS|Cwts", text: "Chargeable Weight" },
                { value: "CUFT|Cuft", text: "CU.FT." },
                { value: "SHIPPER_DESC|ShipperDesc", text: "Shipper" },
                { value: "CONSIGNEE_DESC|ConsigneeDesc", text: "Consignee" },
                { value: "AGENT_DESC|AgentDesc", text: "Agent" },
                { value: "ORIGIN_CODE|OriginCode", text: "MAWB Origin" },
                { value: "HAWB_ORIGIN|HawbOrigin", text: "HAWB Origin" },
                { value: "DEST_CODE|DestCode", text: "MAWB Destination" },
                { value: "HAWB_DEST|HawbDest", text: "HAWB Destination" },
                { value: "INCOTERM|Incoterm", text: "Incoterm" },
                { value: "DC_CODE|DcCode", text: "DC Code" },
                { value: "DC_ADDR|DcAddr", text: "DC Address" },
                { value: "DELIVERY_ADDR|DeliveryAddr", text: "Delivery Address" },
                { value: "SHIPMENT_REF_NO|ShipmentRefNo", text: "Shipment Ref. No." },
                { value: "CARGO_REC_DATE|CargoRecDate", text: "Cargo Received Date" },
                { value: "PICKUP_DATE|PickupDate", text: "Pickup Date" },
                { value: "PACKAGE|Package", text: "No. of Package" },
                { value: "PACKAGE_UNIT|PackageUnit", text: "Package Unit" },
                { value: "CBM|Cbm", text: "CBM" },
                { value: "SEC_PACKAGE|SecPackage", text: "No. of Package (Second)" },
                { value: "SEC_PACKAGE_UNIT|SecPackageUnit", text: "Package Unit (Second)" },
                { value: "JOB_NO|JobNo", text: "Job no." },
                { value: "FRT_PAYMENT_PC|FrtPaymentPC", text: "Freight Payment(PP/CC)" },
                { value: "INV_CURR|CurrCode", text: "Currency" },
                { value: "EX_RATE|ExRate", text: "Exchange Rate" },
                { value: "FRT_RATE|FrtRate", text: "Freight Rate" },
                { value: "FRT_AMT|FrtAmt", text: "Freight Amount" },
                { value: "PS_RATE|PsRate", text: "PS Rate" },
                { value: "PS_AMT|PsAmt", text: "PS Amount" },
                { value: "FSC_RATE|FscRate", text: "FSC Rate" },
                { value: "FSC_AMT|FscAmt", text: "FSC Amount" },
                { value: "SEC_RATE|SecRate", text: "SEC Rate" },
                { value: "SEC_AMT|SecAmt", text: "SEC Amount" },
                { value: "PROFIT_RATE|ProfitRate", text: "Agent Profit Rate" },
                { value: "PROFIT_AMT|ProfitAmt", text: "Agent Profit Amount" },
                { value: "IPS_RATE|IpsRate", text: "IPS Rate" },
                { value: "IPS_AMT|IpsAmt", text: "IPS Amount" },
                { value: "AMOUNT|Amount", text: "Inv. Amount" },
                { value: "DOC_REC_DATE|DocRecDate", text: "Document Received Date" },
                { value: "ORIGIN_COUNTRY_DESC|OriginCountry", text: "Origin Country" },
                { value: "DEST_COUNTRY_DESC|DestCountry", text: "Dest Country" },
                { value: "NDC_DATE|NdcDate", text: "NDC Date" },
                { value: "SHIPMENT_COMPLETE_DATE|ShipmentCompleteDate", text: "Shipment Complete Date" },
                { value: "ARRIVAL_DATE|ArrivalDate", text: "Arrival Date" },
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
            let paras = controllers.airReport.getCommonParas();
            let groupCode = $(`[name="customizeShipmentReport_groupCode"]`).data("kendoDropDownList").value();
            let shipper = $(`[name="customizeShipmentReport_shipper"]`).data("kendoDropDownList").value();
            let consignee = $(`[name="customizeShipmentReport_consignee"]`).data("kendoDropDownList").value();
            let agent = $(`[name="customizeShipmentReport_agent"]`).data("kendoDropDownList").value();
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
            paras.push({ name: "SelectedFields", value: selectedFields });
            paras.push({ name: "SortingOrder", value: sortingOrder });
            utils.getExcelReport("AirCustomizeShipmentReport", paras, "Customize Shipment Report");
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
            let paras = controllers.airReport.getCommonParas();
            let jobNo = $(`[name="jobProfitLossReport_jobNo"]`).data("kendoDropDownList").value();
            let mawbNo = $(`[name="jobProfitLossReport_mawbNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "JobNo", value: jobNo });
            paras.push({ name: "MawbNo", value: mawbNo });
            paras.push({ name: "Remarks", value: "" });
            paras.push({ name: "filename", value: "Profit & Loss Report" });
            controls.openReportViewer("AirProfitLoss", paras);
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
            let paras = controllers.airReport.getCommonParas();
            let jobNo = $(`[name="otherJobProfitLossReport_jobNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "JobNo", value: jobNo });
            paras.push({ name: "filename", value: "Other Job Profit & Loss Report" });
            controls.openReportViewer("AirOtherJobProfitLoss", paras);
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
            let paras = controllers.airReport.getCommonParas();
            let lotNo = $(`[name="lotProfitLossReport_lotNo"]`).data("kendoDropDownList").value();

            paras.push({ name: "LotNo", value: lotNo });
            paras.push({ name: "filename", value: "Lot Profit & Loss Report" });
            controls.openReportViewer("AirLotProfitLoss", paras);
        });
    }

    dialogSummaryProfitLossReport = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_summaryProfitLossReport" style="width: 460px">
                <label class="col-sm-4 col-form-label">Airline</label>
                <div class="col-sm-8">
                    <input type="airline" class="form-control-dropdownlist" name="summaryProfitLossReport_airline" />
                </div>
            </div>
            <br>
            <div class="col-md-12 dialogFooter">
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="summaryProfitLossReport_Print"><span class="k-icon k-i-pdf"></span>Print</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="summaryProfitLossReport_PrintAirline"><span class="k-icon k-i-pdf"></span>Print (Airline)</span>
                <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" name="summaryProfitLossReport_PrintBreakdown"><span class="k-icon k-i-excel"></span>Print (Breakdown)</span>
            </div>`;

        utils.alertMessage(html, "Summary Profit & Loss Report", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`[name^="summaryProfitLossReport_Print"]`).click(function () {
            let buttonName = $(this).attr("name");
            let paras = controllers.airReport.getCommonParas("yyyyMMdd");
            let airline = $(`[name="summaryProfitLossReport_airline"]`).data("kendoDropDownList").value();

            if (buttonName == "summaryProfitLossReport_Print") {
                paras.push({ name: "Airline", value: utils.isEmptyString(airline) ? "%" : airline });
                paras.push({ name: "filename", value: "Summary Profit & Loss Report" });
                controls.openReportViewer("AirSummaryProfitLoss", paras);
            } else if (buttonName == "summaryProfitLossReport_PrintAirline") {
                paras.push({ name: "Airline", value: utils.isEmptyString(airline) ? "%" : airline });
                paras.push({ name: "filename", value: "Summary Profit & Loss Report (Airline)" });
                controls.openReportViewer("AirSummaryAirlineProfitLoss", paras);
            } else if (buttonName == "summaryProfitLossReport_PrintBreakdown") {
                paras = controllers.airReport.getCommonParas();
                paras.push({ name: "Airline", value: utils.isEmptyString(airline) ? "%" : airline });
                utils.getExcelReport("AirSummaryProfitLossBreakDown", paras, "Summary Profit Loss Report (Breakdown)");
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
            let paras = controllers.airReport.getCommonParas();
            let origins = [];
            $(`#${utils.getFormId()}_offShoreSummaryProfitLossReport [name="offShoreSummaryProfitLossReport_origins"]`).data("kendoChipList").items().each(function () {
                if ($(this).hasClass("k-selected"))
                    origins.push($(this).text())
            });

            if (buttonName == "offshoreSummaryProfitLossReport_Print") {
                paras.push({ name: "Origins", value: origins });
                utils.getExcelReport("AirOffshoreSummaryJobProfitLoss", paras, "Offshore Summary Profit Loss Report");
            } else if (buttonName == "offshoreSummaryProfitLossReport_PrintHKG") {
                utils.getExcelReport("AirHKGSummaryJobProfitLoss", paras, "HKG Summary Profit Loss Report");
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
            let paras = controllers.airReport.getCommonParas("yyyyMMdd");
            paras.push({ name: "fileFormat", value: "excel" });
            utils.getRdlcExcelReport("AirInvoiceReport", paras, "Invoice Report");
        });

        $(`#${utils.getFormId()} [name="invoiceReport_printVat"]`).click(function () {
            let paras = controllers.airReport.getCommonParas("yyyyMMdd");
            paras.push({ name: "fileFormat", value: "excel" });
            utils.getRdlcExcelReport("AirInvoiceReportVat", paras, "Invoice Report (VAT)");
        });

        $(`#${utils.getFormId()} [name="invoiceReport_hkgSummary"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            paras.push({ name: "CustomerCode", value: $(`#${utils.getFormId()} [name=invoiceReport_payee]`).data("kendoDropDownList").value() });
            utils.getExcelReport("AirInvoiceReport_HKG_Summary", paras, "HKG BillingSummaryReport");
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
            let paras = controllers.airReport.getCommonParas();
            paras.push({ name: "OriginPvType", value: $(`#${utils.getFormId()} [name=pvReport_originInvType]`).data("kendoDropDownList").value() });
            paras.push({ name: "GroupCode", value: utils.formatSearchText($(`#${utils.getFormId()} [name=pvReport_groupCode]`).data("kendoDropDownList").value()) });
            paras.push({ name: "VendorCode", value: utils.formatSearchText($(`#${utils.getFormId()} [name=pvReport_vendor]`).data("kendoDropDownList").value()) });
            paras.push({ name: "ConsigneeCode", value: utils.formatSearchText($(`#${utils.getFormId()} [name=pvReport_consignee]`).data("kendoDropDownList").value()) });
            paras.push({ name: "fileFormat", value: "excel" });

            if (utils.isEmptyString($(`#${utils.getFormId()} [name=pvReport_originInvType]`).data("kendoDropDownList").value()))
                utils.getExcelReport("AirPVReport", paras, `PV Report-${kendo.toString(new Date(), "MMM dd")}`);
            else
                utils.getRdlcExcelReport("AirPvTypeReport", paras, `PV Type Report-${kendo.toString(new Date(), "MMM dd")}`);
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
            let paras = controllers.airReport.getCommonParas();
            let dateStr = kendo.toString($(`#${utils.getMasterFormId()} [name=dateRange]`).data("kendoDateRangePicker").range().start, "yyyy-MM")
            utils.getExcelReport("AirInvoiceReport_SHA_Account", paras, `${dateStr}开票`);
        });
        $(`#${utils.getFormId()} [name="shaReport_accountImport"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let dateStr = kendo.toString($(`#${utils.getMasterFormId()} [name=dateRange]`).data("kendoDateRangePicker").range().start, "yyyy-MM")
            utils.getExcelReport("AirInvoiceReport_SHA_Account_Import", paras, `${dateStr}进口开票`);
        });
        $(`#${utils.getFormId()} [name="shaReport_payment"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let dateStr = kendo.toString($(`#${utils.getMasterFormId()} [name=dateRange]`).data("kendoDateRangePicker").range().start, "yyyy-MM")
            paras.push({ name: "USD", value: $(`#${utils.getFormId()} [name=shaReport_usdExRate]`).data("kendoNumericTextBox").value() ?? 0 });
            utils.getExcelReport("AirPaymentReport_SHA_Account", paras, `${dateStr}付款账单明细`);
        });
        $(`#${utils.getFormId()} [name="shaReport_accountStatement"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            let hawbNo = $(`#${utils.getFormId()} [name=shaReport_hawb]`).data("kendoDropDownList").value();

            if (utils.isEmptyString(hawbNo)) {
                utils.showValidateNotification("Please select HAWB#", $(`#${utils.getFormId()} [name=shaReport_hawb]`).parent());
                return;
            }
            paras.push({ name: "HawbNo", value: hawbNo });
            paras.push({ name: "ChargeTemplateName", value: $(`#${utils.getFormId()} [name=shaReport_chargeTemplate]`).data("kendoDropDownList").value() });
            utils.getExcelReport("AirInvoiceReport_SHA_DN", paras, `${hawbNo}账单`);
        });
    }

    dialogRCSCFSLAX_Report = function () {
        let html = `
            <div class="row col-sm-12" id="${utils.getFormId()}_RCSCFSLAX_Report" style="width: 460px">
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 220px" name="RCSCFSLAX_summaryReport"><span class="k-icon k-i-excel"></span>Summary Report</span>
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 220px" name="RCSCFSLAX_dailyReport_RCS"><span class="k-icon k-i-excel"></span>Daily Report (RCSCFS)</span>
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 220px" name="RCSCFSLAX_dailyReport_WFF"><span class="k-icon k-i-excel"></span>Daily Report (Wecan)</span>
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 220px" name="RCSCFSLAX_monthlyReport"><span class="k-icon k-i-excel"></span>Monthly Report</span>
                </div>
                <div class="col-sm-12 dialogFooter">
                    <span class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" style="width: 220px" name="RCSCFSLAX_weeklyReport"><span class="k-icon k-i-excel"></span>Weekly Report (Wecan) </span>
                </div>
            </div>`;

        utils.alertMessage(html, "RCSCFSLAX Reports", null, null, false);
        let formSetting = { id: utils.getFormId() };
        controls.renderFormControl_kendoUI(formSetting);

        $(`#${utils.getFormId()} [name="RCSCFSLAX_summaryReport"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            utils.getExcelReport("AirUsSummaryInvoiceReport", paras, `USLAX Invoice Summary Report`);
        });

        $(`#${utils.getFormId()} [name="RCSCFSLAX_dailyReport_RCS"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            paras.push({ name: "days", value: 60 });
            paras.push({ name: "customerType", value: "RCS" });
            utils.getExcelReport("RCSCFSLAX_InvoiceReport", paras, `RCS InvoiceReport`);
        });

        $(`#${utils.getFormId()} [name="RCSCFSLAX_dailyReport_WFF"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            paras.push({ name: "days", value: 60 });
            paras.push({ name: "customerType", value: "WFF" });
            utils.getExcelReport("RCSCFSLAX_InvoiceReport", paras, `WFF InvoiceReport`);
        });

        $(`#${utils.getFormId()} [name="RCSCFSLAX_weeklyReport"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            utils.getExcelReport("RCSCFSLAX_InvoiceReport_Charges", paras, `WECAN InvoiceReport`);
        });

        $(`#${utils.getFormId()} [name="RCSCFSLAX_monthlyReport"]`).click(function () {
            let paras = controllers.airReport.getCommonParas();
            utils.getExcelReport("RCSCFSLAX_SummaryInvoiceReport", paras, `USLAX Monthly Invoice Report`);
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