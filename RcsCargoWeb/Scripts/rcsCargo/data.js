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

var frameworkHtmlElements = {
    sidebar: function (menuItems) {
        var html = `
            <aside class="main-sidebar sidebar-dark-primary elevation-4">
                <a href="../Home/Index" class="brand-link">
                    <img src="../Content/img/icon.png" alt="RCS Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
                    <span class="brand-text font-weight-light">RCS Cargo</span>
                </a>

                <div class="sidebar">
                    <div class="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div class="image">
                            <img src="../Content/img/user2-160x160.jpg" class="img-circle elevation-2" alt="User Image">
                        </div>
                        <div class="info">
                            <a href="#" class="d-block">Admin</a>
                        </div>
                    </div>

                    <div class="form-inline">
                        <div class="input-group" data-widget="sidebar-search">
                            <input class="form-control form-control-sidebar" type="search" placeholder="Search" aria-label="Search" style="font-size: 12pt; height: 37px">
                            <div class="input-group-append">
                                <button class="btn btn-sidebar">
                                    <i class="fas fa-search fa-fw"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <nav class="mt-2">
                        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            <li class="nav-item">
                                <a href="../Home/Index" class="nav-link">
                                    <i class="nav-icon fa fa-gauge-high"></i>
                                    <p>
                                        Dashboard<span class="right badge badge-danger">New</span>
                                    </p>
                                </a>
                            </li>`;

        var defaultIcon = "fa-circle";
        menuItems.forEach(function (folder) {
            if (folder.TYPE == "folder") {
                html += `
                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon fa ${folder.ICON}"></i>
                            <p>
                                ${folder.DISPLAY_NAME}
                                <i class="fas fa-angle-left right"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview" style="display: none;">`;
                        
                menuItems.forEach(function (item) {
                    if (item.TYPE == "menu" && item.PARENT_ID == folder.MODULE_ID && !utils.isEmptyString(item.CONTROLLER) && item.ENABLE == "Y") {
                        html += `
                            <li class="nav-item">
                                <a href="javascript:void(0)" data-controller="${item.CONTROLLER}" data-action="${item.ACTION}" data-id="${item.DATA_ID}" class="nav-link">
                                    <i class="far ${(utils.isEmptyString(item.ICON) ? defaultIcon : item.ICON)} nav-icon"></i>
                                    <p>${item.DISPLAY_NAME}</p>
                                </a>
                            </li>`;
                    }
                });

                html += `
                        </ul>
                    </li>`;
            }
        });

        html += `
                        </ul>
                    </nav>
                </div>
            </aside>`;

        return html;
    },
    navbar: function () {
        var html =
            `<nav class="main-header navbar navbar-expand navbar-white navbar-light">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
                    </li>
                    <li class="nav-item d-none d-sm-inline-block">
                        <a href="#" class="nav-link"><span style="font-weight:800; font-style: italic; font-size: 14pt">RCS Cargo System</span></a>
                    </li>
                </ul>

                <ul class="navbar-nav ml-auto">
                    <li class="nav-item">
                        <a class="nav-link" data-widget="navbar-search" href="#" role="button">
                            <i class="fas fa-search"></i>
                        </a>
                        <div class="navbar-search-block">
                            <form class="form-inline">
                                <div class="input-group input-group-sm">
                                    <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
                                    <div class="input-group-append">
                                        <button class="btn btn-navbar" type="submit">
                                            <i class="fas fa-search"></i>
                                        </button>
                                        <button class="btn btn-navbar" type="button" data-widget="navbar-search">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </li>

                    <li class="nav-item dropdown">
                        <a class="nav-link" data-toggle="dropdown" href="#">
                            <i class="far fa-comments"></i>
                            <span class="badge badge-danger navbar-badge">3</span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                            <a href="#" class="dropdown-item">
                                <div class="media">
                                    <img src="../Content/img/user1-128x128.jpg" alt="User Avatar" class="img-size-50 mr-3 img-circle">
                                    <div class="media-body">
                                        <h3 class="dropdown-item-title">
                                            Brad Diesel
                                            <span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>
                                        </h3>
                                        <p class="text-sm">Call me whenever you can...</p>
                                        <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                    </div>
                                </div>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item">
                                <div class="media">
                                    <img src="../Content/img/user8-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle mr-3">
                                    <div class="media-body">
                                        <h3 class="dropdown-item-title">
                                            John Pierce
                                            <span class="float-right text-sm text-muted"><i class="fas fa-star"></i></span>
                                        </h3>
                                        <p class="text-sm">I got your message bro</p>
                                        <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                    </div>
                                </div>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item">
                                <div class="media">
                                    <img src="../Content/img/user3-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle mr-3">
                                    <div class="media-body">
                                        <h3 class="dropdown-item-title">
                                            Nora Silvester
                                            <span class="float-right text-sm text-warning"><i class="fas fa-star"></i></span>
                                        </h3>
                                        <p class="text-sm">The subject goes here</p>
                                        <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                    </div>
                                </div>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
                        </div>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link" data-toggle="dropdown" href="#">
                            <i class="far fa-bell"></i>
                            <span class="badge badge-warning navbar-badge">15</span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                            <span class="dropdown-header">15 Notifications</span>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item">
                                <i class="fas fa-envelope mr-2"></i> 4 new messages
                                <span class="float-right text-muted text-sm">3 mins</span>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item">
                                <i class="fas fa-users mr-2"></i> 8 friend requests
                                <span class="float-right text-muted text-sm">12 hours</span>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item">
                                <i class="fas fa-file mr-2"></i> 3 new reports
                                <span class="float-right text-muted text-sm">2 days</span>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
                        </div>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-widget="fullscreen" href="#" role="button">
                            <i class="fas fa-expand-arrows-alt"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button">
                            <i class="fas fa-th-large"></i>
                        </a>
                    </li>
                </ul>
            </nav>`;

        return html;
    },
    controlSidebar: function () {
        return
            `<aside class="control-sidebar control-sidebar-dark">
                <div class="p-3">
                    <h5>Title</h5>
                    <p>Sidebar content</p>
                </div>
            </aside>`;
    },
};

var htmlElements = {
    indexPage: function (title, gridName) {
        return `
                <div>
                    <h3>${title}</h3>
                    <div class="search-control row"></div>
                    <div name="${gridName}"></div>
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
            gridName: "gridAirMawbIndex",
            dataSourceUrl: "../Air/Mawb/GridMawb_Read",
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
                {
                    field: "JOB_TYPE", title: "Type",
                    template: function (dataItem) {
                        if (!utils. isEmptyString(dataItem.JOB_TYPE)) {
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
        pageName: "airBooking",
        id: "",
        title: "Booking",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "Create Date", type: "dateRange", name: "createDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Booking# / Shipper / Consignee" },
        ],
        gridConfig: {
            gridName: "gridAirBookingIndex",
            dataSourceUrl: "../Air/Booking/GridBooking_Read",
            linkIdPrefix: "AirBooking",
            linkTabTitle: "Booking# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "BOOKING_NO", title: "Booking#", attributes: { style: "cursor: pointer" } },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "AGENT_DESC", title: "Consignee" },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "PACKAGE", title: "Packages" },
                { field: "GWTS", title: "G/Wts" },
                { field: "VWTS", title: "V/Wts" },
                { field: "CBM", title: "CBM" },
                { field: "CARGO_READY_DATE", title: "Cargo Ready Date" },
                { field: "CARGO_REC_DATE", title: "Cargo Rcvd Date" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date" },
            ],
        },
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
                    { id: "printMawb", text: "Print MAWB", icon: "file-txt" },
                    { id: "previewMawb", text: "Preview MAWB", icon: "file-report" },
                    { id: "loadplan", text: "Load Plan", icon: "file-txt" },
                    { id: "manifest", text: "Cargo Manifest", icon: "file-txt" },
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
                formGroups: ["contactMain", "contactOthers", "loadplanBookingList"]
            },
            {
                title: "Direct Job",
                name: "directJob",
                formGroups: ["contactMain", "prepaidCharges", "collectCharges", "dims"]
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
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorQtyUnit(container, options) }
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
                    { label: "Currency", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 3 },
                    { label: "Charge Template", type: "chargeTemplate", targetControl: "grid_MawbChargesCollect" },
                    {
                        label: "Prepaid Charges", type: "grid", name: "MawbChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 250,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorQtyUnit(container, options) }
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
            },
            {
                name: "dims",
                title: "Dimension",
                colWidth: 12,
                formControls: [
                    {
                        label: "Dimension", type: "grid", name: "MawbDims",
                        columns: [
                            { title: "Ctns", field: "CTNS", width: 90 },
                            {
                                title: "Type", field: "PACKAGE_TYPE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorQtyUnit(container, options) }
                            },
                            { title: "Length", field: "LENGTH", width: 90 },
                            { title: "Width", field: "WIDTH", width: 90 },
                            { title: "Height", field: "HEIGHT", width: 90 },
                            { title: "V/Wts", field: "VWTS", width: 90 },
                            { title: "Dimension", field: "DIMENSION", width: 160 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CTNS: { type: "number", validation: { required: true } },
                            PACKAGE_TYPE: { validation: { required: true } },
                            LENGTH: { type: "number", validation: { required: true } },
                            WIDTH: { type: "number", validation: { required: true } },
                            HEIGHT: { type: "number", validation: { required: true } },
                            VWTS: { type: "number", validation: { required: true } },
                            DIMENSION: { editable: false },
                        },
                        formulas: [
                            { fieldName: "DIMENSION", formula: `{LENGTH}x{WIDTH}x{HEIGHT}C\\{CTNS}` },
                        ],
                    },
                ]
            },
            {
                name: "loadplanBookingList",
                title: "Booking List",
                colWidth: 12,
                formControls: [
                    {
                        label: "Booking List", type: "grid", name: "LoadplanBookingListViews",
                        columns: [
                            { title: "Booking #", field: "BOOKING_NO", width: 90 },
                            { title: "Shipper", field: "SHIPPER_DESC", width: 200 },
                            { title: "Consignee", field: "CONSIGNEE_DESC", width: 200 },
                            { title: "Packages", field: "PACKAGE", width: 80 },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                            { title: "Doc Rcvd?", field: "IS_DOC_REC", width: 80 },
                            { title: "Approved?", field: "IS_BOOKING_APP", width: 80 },
                            { title: "Received?", field: "IS_RECEIVED", width: 80 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }]},
                        ],
                        fields: {
                            BOOKING_NO: { editable: false },
                            SHIPPER_DESC: { editable: false },
                            CONSIGNEE_DESC: { editable: false },
                            PACKAGE: { editable: false },
                            GWTS: { editable: false },
                            VWTS: { editable: false },
                            IS_DOC_REC: { editable: false },
                            IS_BOOKING_APP: { editable: false },
                            IS_RECEIVED: { editable: false },
                        },
                    },
                ]
            },
        ]
    },
    {
        formName: "airBooking",
        mode: "edit",   //create / edit
        id: "",
        targetForm: {},
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "printBooking", text: "Print MAWB", icon: "file-report" },
                    { id: "printBookingHawb", text: "Preview MAWB", icon: "file-report" },
                ]
            },
        ],
        formTabs: [
            {
                title: "Booking Information",
                name: "bookingInfo",
                formGroups: ["mainInfo"]
            },
            {
                title: "PO Information",
                name: "bookingPo",
                formGroups: ["contactMain", "contactOthers", "loadplanBookingList"]
            },
            {
                title: "Warehouse",
                name: "warehouse",
                formGroups: ["contactMain", "prepaidCharges", "collectCharges", "dims"]
            },
        ],
        schema: {
            hiddenFields: ["COMPANY_ID", "FRT_MODE"],
            readonlyFields: [
                { name: "BOOKING_NO", readonly: "always" }],
        },
        formGroups: [
            {
                name: "mainInfo",
                title: "Booking Information",
                colWidth: 8,
                formControls: [
                    { label: "MAWB #", type: "text", name: "BOOKING_NO", colWidth: 6 },
                    { label: "Booking Type", type: "bookingType", name: "BOOKING_TYPE", colWidth: 6 },
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER" },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE" },
                    { label: "Origin", type: "port", name: "ORIGIN_CODE", colWidth: 6 },
                    { label: "Destination", type: "port", name: "DEST_CODE", colWidth: 6 },
                    { label: "Execution Date", type: "dateTime", name: "EX_DATE", colWidth: 6 },
                    { label: "Issue Date", type: "dateTime", name: "ISSUE_DATE", colWidth: 6 },
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 6 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 6 },
                    { label: "Package", type: "numberInt", name: "SEC_PACKAGE", colWidth: 6 },
                    { label: "Package Unit", type: "pkgUnit", name: "SEC_PACKAGE_UNIT", colWidth: 6 },
                    { label: "G/wts", type: "number", name: "GWTS", colWidth: 6 },
                    { label: "V/wts", type: "number", name: "VWTS", colWidth: 6 },
                    { label: "Remarks", type: "textArea", name: "REMARKS" },
                    { label: "Notify Party 1", type: "customerAddr", name: "NOTIFY1" },
                    { label: "Notify Party 2", type: "customerAddr", name: "NOTIFY2" },
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
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorQtyUnit(container, options) }
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
                    { label: "Currency", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 3 },
                    { label: "Charge Template", type: "chargeTemplate", targetControl: "grid_MawbChargesCollect" },
                    {
                        label: "Prepaid Charges", type: "grid", name: "MawbChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 250,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorQtyUnit(container, options) }
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
            },
            {
                name: "dims",
                title: "Dimension",
                colWidth: 12,
                formControls: [
                    {
                        label: "Dimension", type: "grid", name: "MawbDims",
                        columns: [
                            { title: "Ctns", field: "CTNS", width: 90 },
                            {
                                title: "Type", field: "PACKAGE_TYPE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorQtyUnit(container, options) }
                            },
                            { title: "Length", field: "LENGTH", width: 90 },
                            { title: "Width", field: "WIDTH", width: 90 },
                            { title: "Height", field: "HEIGHT", width: 90 },
                            { title: "V/Wts", field: "VWTS", width: 90 },
                            { title: "Dimension", field: "DIMENSION", width: 160 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CTNS: { type: "number", validation: { required: true } },
                            PACKAGE_TYPE: { validation: { required: true } },
                            LENGTH: { type: "number", validation: { required: true } },
                            WIDTH: { type: "number", validation: { required: true } },
                            HEIGHT: { type: "number", validation: { required: true } },
                            VWTS: { type: "number", validation: { required: true } },
                            DIMENSION: { editable: false },
                        },
                        formulas: [
                            { fieldName: "DIMENSION", formula: `{LENGTH}x{WIDTH}x{HEIGHT}C\\{CTNS}` },
                        ],
                    },
                ]
            },
            {
                name: "loadplanBookingList",
                title: "Booking List",
                colWidth: 12,
                formControls: [
                    {
                        label: "Booking List", type: "grid", name: "LoadplanBookingListViews",
                        columns: [
                            { title: "Booking #", field: "BOOKING_NO", width: 90 },
                            { title: "Shipper", field: "SHIPPER_DESC", width: 200 },
                            { title: "Consignee", field: "CONSIGNEE_DESC", width: 200 },
                            { title: "Packages", field: "PACKAGE", width: 80 },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                            { title: "Doc Rcvd?", field: "IS_DOC_REC", width: 80 },
                            { title: "Approved?", field: "IS_BOOKING_APP", width: 80 },
                            { title: "Received?", field: "IS_RECEIVED", width: 80 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            BOOKING_NO: { editable: false },
                            SHIPPER_DESC: { editable: false },
                            CONSIGNEE_DESC: { editable: false },
                            PACKAGE: { editable: false },
                            GWTS: { editable: false },
                            VWTS: { editable: false },
                            IS_DOC_REC: { editable: false },
                            IS_BOOKING_APP: { editable: false },
                            IS_RECEIVED: { editable: false },
                        },
                    },
                ]
            },
        ]
    },
];

export default class {
    constructor() {
        this.prefetchGlobalVariables();
    }

    //getters
    get take() { return take; }
    get indexGridPageSize() { return indexGridPageSize; }
    get companyId() { return companyId; }
    get dateFormat() { return dateFormat; }
    get dateTimeFormat() { return dateTimeFormat; }
    get dateTimeLongFormat() { return dateTimeLongFormat; }
    get chargeQtyUnit() { return chargeQtyUnit; }
    get packageUnit() { return packageUnit; }
    get dropdownlistControls() { return dropdownlistControls; }
    get currencies() { return currencies; }
    get frameworkHtmlElements() { return frameworkHtmlElements; }
    get htmlElements() { return htmlElements; }
    get indexPages() { return indexPages; }
    get masterForms() { return masterForms; }

    //setters
    set take(val) { take = val; }
    set indexGridPageSize(val) { indexGridPageSize = val; }
    set companyId(val) { companyId = val; }
    set dateFormat(val) { dateFormat = val; }
    set dateTimeFormat(val) { dateTimeFormat = val; }
    set dateTimeLongFormat(val) { dateTimeLongFormat = val; }
    set chargeQtyUnit(val) { chargeQtyUnit = val; }
    set packageUnit(val) { packageUnit = val; }
    set dropdownlistControls(val) { dropdownlistControls = val; }
    set currencies(val) { currencies = val; }
    set frameworkHtmlElements(val) { frameworkHtmlElements = val; }
    set htmlElements(val) { htmlElements = val; }
    set indexPages(val) { indexPages = val; }
    set masterForms(val) { masterForms = val; }

    prefetchGlobalVariables = function() {
        $.ajax({
            url: "../Home/GetCurrencies",
            data: { companyId: companyId },
            dataType: "json",
            success: function (result) {
                currencies = result;
            }
        });
    }
}