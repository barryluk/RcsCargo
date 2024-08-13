//Global variables
var take = 50;
var indexGridPageSize = 25;
var companyId = "RCSHKG";
var dateFormat = "M/d/yyyy";
var dateTimeFormat = "M/d/yyyy HH:mm";
var dateTimeLongFormat = "M/d/yyyy HH:mm:ss";
var chargeQtyUnit = ["KGS", "SHP", "HAWB", "MAWB", "TRUCK", "PLT", "SETS", "SET", "MTH", "JOB", "CBM", "CTNS", "LBS", "PCS"];
var packageUnit = ["CTNS", "PLT", "PKG", "ROLLS", "PCS"];
var dropdownlistControls = ["airline", "port", "customer", "customerAddr", "customerAddrEditable", "pkgUnit", "charge", "qtyUnit", "currency", "chargeTemplate"];
var currencies;
//for testing only
var testObj, testObj1, testObj2;


var htmlElements = {
    indexPage: function (title) {
        return `
            <div>
                <h3>${title}</h3>
                <div class="search-control row"></div>
                <div name="gridIndex"></div>
            </div>`;
    },
    editPage: function (title) {
        return `
            <div>
                <h3>${title}</h3>
                <div class="toolbar"></div>
                <section class="content">
                    <div class="container-fluid">
                        <div class="row form_group">
                        </div>
                    </div>
                </section>
            </div>`;
    },
    card: function (title = "", htmlContent = "", colWidth = 6, colorName = "primary") {
        return `
            <div class="col-md-${colWidth}">
                <div class="card card-${colorName} card-outline shadow">
                    <div class="card-header">
                        <h4 class="card-title">${title}</h4>
                        <div class="card-tools">
                            <button type="button" class="btn btn-tool" data-card-widget="collapse">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                        <div class="card-body">
                            <div class="row">
                                ${htmlContent}
                            </div>
                        </div>
                </div>
            </div>`;
    },
};

var indexPages = [
    {
        pageName: "airMawb",
        id: "",
        title: "MAWB",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "Flight Date", type: "dateRange", name: "flightDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "MAWB# / Airline / Flight#" },
        ],
        gridConfig: {
            gridName: "gridIndex",
            dataSourceUrl: "/Air/Mawb/GridMawb_Read",
            linkIdPrefix: "AirMawb",
            linkTabTitle: "MAWB# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "MAWB", title: "MAWB#", attributes: { style: "cursor: pointer" } },
                { field: "JOB", title: "Job#" },
                { field: "JOB_TYPE", title: "Type",
                    template: function (dataItem) {
                        if (!isEmptyString(dataItem.JOB_TYPE)) {
                            return dataItem.JOB_TYPE == "C" ? "Consol" : "Direct";
                        } else {
                            return "";
                        }
                    }
                },
                { field: "AIRLINE_CODE", title: "Airline" },
                { field: "FLIGHT_NO", title: "Flight#" },
                { field: "FLIGHT_DATE", title: "Flight Date" },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "ETA", title: "ETA" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "AGENT_DESC", title: "Agent" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date" },
            ],
        },
    },
    {
        pageName: "airBooking"
    },
    {
        pageName: "airHawb"
    },
    {
        pageName: "airInvoice"
    },
];

var masterForms = [
    {
        formName: "airMawb",
        mode: "edit",   //create / edit
        id: "",
        targetForm: {},
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { text: "Print MAWB", icon: "file-txt" },
                    { text: "Preview MAWB", icon: "file-report" }
                ]
            },
        ],
        formTabs: [
            {
                title: "MAWB Information",
                name: "mawbInfo",
                formGroups: ["mainInfo", "2nd3rdFlights"]
            },
            {
                title: "Load Plan",
                name: "loadPlan",
                formGroups: ["contactMain", "contactOthers"]
            },
            {
                title: "Direct Job",
                name: "directJob",
                formGroups: ["contactMain", "prepaidCharges", "collectCharges"]
            },
        ],
        schema: {
            hiddenFields: ["COMPANY_ID", "FRT_MODE", "JOB_TYPE"],
            readonlyFields: [
                { name: "MAWB", readonly: "edit" },
                { name: "JOB", readonly: "always" }],
        },
        formGroups: [
            {
                name: "mainInfo",
                title: "General Information",
                colWidth: 5,
                formControls: [
                    { label: "First Flight", type: "label" },
                    { label: "MAWB #", type: "text", name: "MAWB" },
                    { label: "Job #", type: "text", name: "JOB" },
                    { label: "Job Type", type: "buttonGroup", name: "JOB_TYPE", dataType: "jobType" },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE" },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO" },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE" },
                    { label: "Origin", type: "port", name: "ORIGIN_CODE" },
                    { label: "Destination", type: "port", name: "DEST_CODE" },
                    { label: "Arrival Date / Time", type: "label" },
                    { label: "Estimate Arrival Date", type: "dateTime", name: "ETA" },
                    { label: "Execution Date", type: "dateTime", name: "EX_DATE" },
                    { label: "Issue Date", type: "dateTime", name: "ISSUE_DATE" },
                    { label: "Co-Loader", type: "customer", name: "COLOADER_CODE" },
                    { label: "Package", type: "numberInt", name: "CTNS" },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT" },
                    { label: "G/wts", type: "number", name: "GWTS" },
                    { label: "V/wts", type: "number", name: "VWTS" },
                    { label: "Remarks", type: "textArea", name: "REMARKS" },
                ]
            },
            {
                name: "2nd3rdFlights",
                title: "Second / Third Flights",
                colWidth: 5,
                formControls: [
                    { label: "Second Flight", type: "label" },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE2" },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO2" },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE2" },
                    { label: "Destination", type: "port", name: "DEST_CODE2" },
                    { label: "Third Flight", type: "label" },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE3" },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO3" },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE3" },
                    { label: "Destination", type: "port", name: "DEST_CODE3" },
                ]
            },
            {
                name: "contactMain",
                title: "Contact Information",
                colWidth: 6,
                formControls: [
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER" },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE" },
                    { label: "Notify Party", type: "customerAddr", name: "NOTIFY" },
                ]
            },
            {
                name: "contactOthers",
                title: "Contact Information",
                colWidth: 6,
                formControls: [
                    { label: "Agent", type: "customerAddr", name: "AGENT" },
                    { label: "Issuing Carrier", type: "customerAddr", name: "ISSUE" },
                ]
            },
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    { label: "Currency", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 3 },
                    { label: "Charge Template", type: "chargeTemplate", targetControl: "grid_MawbChargesPrepaid" },
                    {
                        label: "Prepaid Charges", type: "grid", name: "MawbChargesPrepaid",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 250,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { renderGridEditorQtyUnit(container, options) }
                            },
                            { title: "Min. Charge", field: "MIN_CHARGE", width: 90 },
                            { title: "Amount", field: "AMOUNT", width: 90 },
                            { title: "Total Amt.", field: "AMOUNT_HOME", width: 90 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CHARGE_CODE: { validation: { required: true } },
                            CHARGE_DESC: { defaultValue: "" },
                            PAYMENT_TYPE: { defaultValue: "P" },
                            CURR_CODE: { validation: { required: true } },
                            PRICE: { type: "number", validation: { required: true } },
                            QTY: { type: "number", validation: { required: true } },
                            QTY_UNIT: { validation: { required: true } },
                            MIN_CHARGE: { type: "number", validation: { required: true }, defaultValue: 1 },
                            EX_RATE: { type: "number", editable: false },
                            AMOUNT: { type: "number", editable: false },
                            AMOUNT_HOME: { type: "number", editable: false, validation: { required: true } },
                        },
                        formulas: [
                            { fieldName: "AMOUNT", formula: "{PRICE}*{QTY}" },
                            { fieldName: "AMOUNT_HOME", formula: "{PRICE}*{EX_RATE}*{QTY}" },
                        ],
                    },
                ]
            },
            {
                name: "collectCharges",
                title: "Collect Charges",
                colWidth: 12,
                formControls: [
                    {
                        label: "Prepaid Charges", type: "grid", name: "MawbChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 250,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { renderGridEditorQtyUnit(container, options) }
                            },
                            { title: "Min. Charge", field: "MIN_CHARGE", width: 90 },
                            { title: "Amount", field: "AMOUNT", width: 90 },
                            { title: "Total Amt.", field: "AMOUNT_HOME", width: 90 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CHARGE_CODE: { validation: { required: true } },
                            CHARGE_DESC: { defaultValue: "" },
                            PAYMENT_TYPE: { defaultValue: "C" },
                            CURR_CODE: { validation: { required: true } },
                            PRICE: { type: "number", validation: { required: true } },
                            QTY: { type: "number", validation: { required: true } },
                            QTY_UNIT: { validation: { required: true } },
                            MIN_CHARGE: { type: "number", validation: { required: true }, defaultValue: 1 },
                            EX_RATE: { type: "number", editable: false },
                            AMOUNT: { type: "number", editable: false },
                            AMOUNT_HOME: { type: "number", editable: false, validation: { required: true } },
                        },
                        formulas: [
                            { fieldName: "AMOUNT", formula: "{PRICE}*{QTY}" },
                            { fieldName: "AMOUNT_HOME", formula: "{PRICE}*{EX_RATE}*{QTY}" },
                        ],
                    },
                ]
            }
        ]
    },
    {
        formName: "airBooking",
        mode: "edit",   //create / edit
        id: "",
        targetForm: $(`#${this.id}`).find(".container-fluid .row.form_group"),
        formGroups: [
            {
                title: "General Information",
                colWidth: 5,
                formControls: [
                    { label: "First Flight", type: "label" },
                    { label: "MAWB", type: "text", name: "MAWB" },
                    { label: "Job", type: "text", name: "JOB" },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE" },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO" },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE" },
                    { label: "Origin", type: "port", name: "ORIGIN_CODE" },
                    { label: "Destination", type: "port", name: "DEST_CODE" },
                    { label: "Arrival Date / Time", type: "label" },
                    { label: "Estimate Arrival Date", type: "dateTime", name: "ETA" },
                    { label: "Execution Date", type: "dateTime", name: "EX_DATE" },
                    { label: "Issue Date", type: "dateTime", name: "ISSUE_DATE" },
                    { label: "Co-Loader", type: "customer", name: "COLOADER_CODE" },
                    { label: "Remarks", type: "textArea", name: "REMARKS" },
                ]
            },
            {
                title: "Second / Third Flights",
                colWidth: 5,
                formControls: [
                    { label: "Second Flight", type: "label" },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE2" },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO2" },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE2" },
                    { label: "Destination", type: "port", name: "DEST_CODE2" },
                    { label: "Third Flight", type: "label" },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE3" },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO3" },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE3" },
                    { label: "Destination", type: "port", name: "DEST_CODE3" },
                ]
            },
            {
                title: "Contact Information",
                colWidth: 5,
                formControls: [
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER" },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE" },
                    { label: "Notify Party", type: "customerAddr", name: "NOTIFY" },
                ]
            },
            {
                title: "Contact Information",
                colWidth: 5,
                formControls: [
                    { label: "Agent", type: "customerAddr", name: "AGENT" },
                    { label: "Issuing Carrier", type: "customerAddr", name: "ISSUE" },
                ]
            }
        ]
    },
]; 