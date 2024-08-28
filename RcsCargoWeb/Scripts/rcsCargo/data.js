//Global variables
var user;
var sessionId;
var intervalId;
var take = 40;
var indexGridPageSize = 40;
var companyId = "RCSHKG";
var dateFormat = "M/d/yyyy";
var dateTimeFormat = "M/d/yyyy HH:mm";
var dateTimeLongFormat = "M/d/yyyy HH:mm:ss";
var masterRecords = {
    chargeQtyUnit: ["KGS", "SHP", "HAWB", "MAWB", "TRUCK", "PLT", "SETS", "SET", "MTH", "JOB", "CBM", "CTNS", "LBS", "PCS"],
    packageUnit: ["CTNS", "PLT", "PKG", "ROLLS", "PCS"],
    bookingType: [{ text: "Flat Pack", value: "F" }, { text: "GOH", value: "G" }, { text: "Flat Pack + GOH", value: "O" }],
    vwtsFactor: [6000, 6500, 7000, 9000],
    incoterm: ["FOB", "EXW", "FCA", "CPT", "CIP", "DAT", "DAP", "DDP", "FAS", "CFR", "CIF"],
    paymentTerms: [{ text: "Prepaid", value: "P" }, { text: "Collect", value: "C" }],
    showCharges: [{ text: "Prepaid", value: "P" }, { text: "Collect", value: "C" }, { text: "Prepaid + Collect", value: "PC" }],
    invoiceType: [{ text: "Invoice", value: "I" }, { text: "Debit Note", value: "D" }, { text: "Credit Note", value: "C" }],
    invoiceCategory: [{ text: "HAWB", value: "H" }, { text: "MAWB", value: "M" }, { text: "Job", value: "J" }, { text: "Lot", value: "L" }],
    fltServiceType: [{ text: "Standard", value: "S" }, { text: "Express", value: "E" }, { text: "Deferred", value: "D" }, { text: "Hub", value: "H" }, { text: "Direct", value: "R" }],
    equipCodes: {}, currencies: {}, sysCompanies: {}, airlines: {}, charges: {}, chargeTemplates: {}, ports: {}, customers: {},
};
var dropdownlistControls = ["airline", "port", "customer", "customerAddr", "customerAddrEditable", "pkgUnit", "charge", "qtyUnit", "currency",
    "chargeTemplate", "vwtsFactor", "incoterm", "paymentTerms", "showCharges", "invoiceType", "invoiceCategory", "fltServiceType"];

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
    navbar: function (sysCompanies) {
        var htmlsysCompanies = "";
        sysCompanies.forEach(function (sysCompany) {
            if (sysCompanies.indexOf(sysCompany) != 0)
                htmlsysCompanies += `<div class="dropdown-divider"></div>`;

            htmlsysCompanies += `
                <a href="#" class="dropdown-item">
                    <i class="fa-solid fa-building-circle-arrow-right"></i> ${sysCompany.COMPANY_ID}
                </a>`;
        });

        var html =
            `<nav class="main-header navbar navbar-expand navbar-white navbar-light">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
                    </li>
                    <li class="nav-item d-none d-sm-inline-block">
                        <a href="#" class="nav-link"><span style="font-size: 1.6rem; left: -1rem; top: -0.5rem; position: relative">RCS Cargo System</span></a>
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

                    <li class="nav-item dropdown sysCompany">
                        <a class="nav-link" data-toggle="dropdown" href="#">
                            <i class="fa fa-house-user"></i>
                            <span class="currentSystemCompany">${companyId}</span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-md dropdown-menu-left">
                            ${htmlsysCompanies}
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
                    <li class="nav-item">
                        <a class="nav-link" data-widget="control-lockscreen" href="#" role="button" data-toggle="tooltip" title="Lock Screen">
                            <i class="fa-solid fa-lock"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-widget="control-logout" href="#" role="button" data-toggle="tooltip" title="Logout">
                            <i class="fa-solid fa-right-from-bracket"></i>
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
            linkIdPrefix: "airMawb",
            linkTabTitle: "MAWB# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "MAWB", title: "MAWB#", attributes: { "class": "link-cell" } },
                { field: "JOB", title: "Job#" },
                {
                    field: "JOB_TYPE", title: "Type",
                    template: function (dataItem) {
                        if (!utils.isEmptyString(dataItem.JOB_TYPE)) {
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
            linkIdPrefix: "airBooking",
            linkTabTitle: "Booking# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "BOOKING_NO", title: "Booking#", attributes: { "class": "link-cell" } },
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
        pageName: "airHawb",
        id: "",
        title: "HAWB",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "Flight Date", type: "dateRange", name: "flightDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "HAWB# / MAWB# / Job# / Shipper / Consignee" },
        ],
        gridConfig: {
            gridName: "gridAirHawbIndex",
            dataSourceUrl: "../Air/Hawb/GridHawb_Read",
            linkIdPrefix: "airHawb",
            linkTabTitle: "HAWB# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "HAWB_NO", title: "HAWB#", attributes: { "class": "link-cell" } },
                { field: "JOB_NO", title: "Job#" },
                { field: "MAWB_NO", title: "MAWB#" },
                { field: "AIRLINE_CODE", title: "Airline" },
                { field: "FLIGHT_NO", title: "Flight#" },
                { field: "FLIGHT_DATE", title: "Flight Date" },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "PACKAGE", title: "Package" },
                { field: "GWTS", title: "G/Wts" },
                { field: "CWTS", title: "C/Wts" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date" },
            ],
        },
    },
    {
        pageName: "airInvoice"
    },
];

var masterForms = [
    {
        formName: "airMawb",
        mode: "edit",   //create / edit
        title: "MAWB#",
        readUrl: "../Air/Mawb/GetMawb",
        updateUrl: "../Air/Mawb/UpdateMawb",
        additionalScript: "initAirMawb",
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
                formGroups: ["contactMain", "contactOthers", "loadplanBookingList", "loadplanHawbList", "loadplanHawbEquip"]
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
                    { label: "V/wts Factor", type: "vwtsFactor", name: "VWTS_FACTOR" },
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
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.kendo.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorChargeQtyUnit(container, options) }
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
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.kendo.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorChargeQtyUnit(container, options) }
                            },
                            { title: "Min. Charge", field: "MIN_CHARGE", width: 90 },
                            { title: "Amount", field: "AMOUNT", width: 90 },
                            { title: "Total Amt.", field: "AMOUNT_HOME", width: 90 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            //data type of the field {number|string|boolean|date} default is string
                            //set validation rules, defaultValue, editable, validation: { required: true, min: 1 }
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
                                editor: function (container, options) { controls.kendo.renderGridEditorPackageQtyUnit(container, options) }
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
                            { fieldName: "VWTS", formula: `utils.calcVwts({LENGTH},{WIDTH},{HEIGHT},{CTNS})` },
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
                        toolbar: [
                            { name: "searchBooking", text: "Search Booking", iconClass: "k-icon k-i-search", callbackFunction: "controllers.airMawb.searchBookingClick" },
                        ],
                        columns: [
                            { title: "Booking #", field: "BOOKING_NO", width: 90 },
                            { title: "Shipper", field: "SHIPPER_DESC", width: 220 },
                            { title: "Consignee", field: "CONSIGNEE_DESC", width: 220 },
                            { title: "Packages", field: "PACKAGE", width: 80 },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                            { title: "Doc Rcvd?", field: "IS_DOC_REC", width: 80 },
                            { title: "Approved?", field: "IS_BOOKING_APP", width: 80 },
                            { title: "Received?", field: "IS_RECEIVED", width: 80 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
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
            {
                name: "loadplanHawbList",
                title: "HAWB List",
                colWidth: 12,
                formControls: [
                    {
                        label: "HAWB List", type: "grid", name: "LoadplanHawbListViews",
                        toolbar: [],
                        columns: [
                            { title: "HAWB #", field: "HAWB_NO", width: 90 },
                            { title: "Shipper", field: "SHIPPER_DESC", width: 220 },
                            { title: "Consignee", field: "CONSIGNEE_DESC", width: 220 },
                            { title: "Packages", field: "PACKAGE", width: 80 },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                        ],
                        fields: {
                            HAWB_NO: { editable: false },
                            SHIPPER_DESC: { editable: false },
                            CONSIGNEE_DESC: { editable: false },
                            PACKAGE: { editable: false },
                            GWTS: { editable: false },
                            VWTS: { editable: false },
                        },
                    },
                ]
            },
            {
                name: "loadplanHawbEquip",
                title: "Equipment List",
                colWidth: 12,
                formControls: [
                    {
                        toolbar: ["create", "cancel", { name: "checkData", text: "Check Data", iconClass: "k-icon k-i-tick", callbackFunction: "controllers.airMawb.checkDataClick" },],
                        label: "Equipment List", type: "grid", name: "LoadplanHawbEquips",
                        columns: [
                            {
                                title: "HAWB #", field: "HAWB_NO", width: 100,
                                editor: function (container, options) { controls.kendo.renderGridEditorLoadplanEquipHawbNos(container, options) }
                            },
                            {
                                title: "Equipment", field: "EQUIP_CODE", width: 250,
                                template: function (dataItem) { return `${dataItem.EQUIP_CODE} / ${dataItem.EQUIP_DESC}`; },
                                editor: function (container, options) { controls.kendo.renderGridEditorLoadplanEquips(container, options) }
                            },
                            { title: "Packages", field: "PACKAGE", width: 100 },
                            {
                                title: "Type", field: "PACKAGE_UNIT", width: 100,
                                editor: function (container, options) { controls.kendo.renderGridEditorPackageQtyUnit(container, options) }
                            },
                            { title: "G/Wts", field: "GWTS", width: 100 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
                        ],
                        fields: {
                            HAWB_NO: { validation: { required: true } },
                            EQUIP_CODE: { validation: { required: true } },
                            EQUIP_DESC: { validation: { required: true } },
                            PACKAGE: { type: "number", validation: { required: true } },
                            PACKAGE_UNIT: { validation: { required: true } },
                            GWTS: { type: "number" },
                        },
                    },
                ]
            },
        ]
    },
    {
        formName: "airBooking",
        mode: "edit",   //create / edit
        title: "Booking#",
        readUrl: "../Air/Booking/GetBooking",
        updateUrl: "../Air/Booking/UpdateBooking",
        additionalScript: "initAirBooking",
        id: "",
        targetForm: {},
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "printBooking", text: "Booking", icon: "file-report" },
                    { id: "printBookingHawb", text: "Booking (HAWB)", icon: "file-report" },
                    { id: "printWarehouseReceipt", text: "Warehouse Receipt", icon: "file-report" },
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
                formGroups: ["pos"]
            },
            {
                title: "Warehouse",
                name: "warehouse",
                formGroups: ["warehouse"]
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
                    { label: "Booking #", type: "text", name: "BOOKING_NO", colWidth: 6 },
                    { label: "Booking Type", type: "buttonGroup", dataType: "bookingType", name: "BOOKING_TYPE", colWidth: 6 },
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER" },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE" },
                    { label: "Document Received", type: "switch", name: "IS_DOC_REC", colWidth: 6 },
                    { label: "Booking Approved", type: "switch", name: "IS_BOOKING_APP", colWidth: 6 },
                    { label: "Approval #", type: "text", name: "APPROVAL_NO", colWidth: 6 },
                    { label: "Plan Flight Date", type: "date", name: "PLAN_FLIGHT_DATE", colWidth: 6 },
                    { label: "Origin", type: "port", name: "ORIGIN_CODE", colWidth: 6 },
                    { label: "Destination", type: "port", name: "DEST_CODE", colWidth: 6 },
                    { label: "Booking Rcvd Date", type: "date", name: "BOOKING_REC_DATE", colWidth: 6 },
                    { label: "Document Rcvd Date", type: "dateTime", name: "DOC_REC_DATE", colWidth: 6 },
                    { label: "Cargo Ready Date", type: "date", name: "CARGO_READY_DATE", colWidth: 6 },
                    { label: "Cargo Rcvd Date", type: "dateTime", name: "CARGO_REC_DATE", colWidth: 6 },
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 6 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 6 },
                    { label: "Second Package", type: "numberInt", name: "SEC_PACKAGE", colWidth: 6 },
                    { label: "Package Unit", type: "pkgUnit", name: "SEC_PACKAGE_UNIT", colWidth: 6 },
                    { label: "V/Wts Factor", type: "vwtsFactor", name: "VWTS_FACTOR", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "G/Wts", type: "number", name: "GWTS", colWidth: 6 },
                    { label: "V/Wts", type: "number", name: "VWTS", colWidth: 6 },
                    { label: "CBM", type: "number", name: "CBM", colWidth: 6 },
                    { label: "Cubic Feet", type: "number", name: "CUFT", colWidth: 6 },
                    { label: "Incoterm", type: "incoterm", name: "INCOTERM_2012", colWidth: 6 },
                    { label: "Port", type: "port", name: "INCOTERM_2012_PORT", colWidth: 6 },
                    /*{ label: "", type: "emptyBlock", colWidth: 6 },*/
                    { label: "Notify Party 1", type: "customerAddr", name: "NOTIFY1" },
                    { label: "Notify Party 2", type: "customerAddr", name: "NOTIFY2" },
                    { label: "Handle Information", type: "textArea", name: "HANDLE_INFO", colWidth: 6 },
                    { label: "Marks & Numbers", type: "textArea", name: "MARKS_NO", colWidth: 6 },
                    { label: "Goods Description", type: "textArea", name: "GOOD_DESC", colWidth: 6 },
                    { label: "Remarks", type: "textArea", name: "REMARKS", colWidth: 6 },
                    { label: "PO", type: "text", name: "PO", colWidth: 6 },
                    { label: "S/R", type: "text", name: "SR", colWidth: 6 },
                    { label: "Style", type: "text", name: "STYLE", colWidth: 6 },
                ]
            },
            {
                name: "pos",
                title: "PO Information",
                colWidth: 12,
                formControls: [
                    {
                        label: "PO Information", type: "grid", name: "BookingPos",
                        columns: [
                            { title: "PO#", field: "PO_NO", width: 120 },
                            { title: "Style #", field: "STYLE_NO", width: 120 },
                            { title: "Material #", field: "MATERIAL_NO", width: 120 },
                            { title: "SKU", field: "SKU", width: 120 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "UNIT", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorPackageQtyUnit(container, options) }
                            },
                            { title: "Pcs", field: "PCS", width: 80 },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                            { title: "C/Wts", field: "CWTS", width: 80 },
                            { title: "Cu.ft.", field: "CUFT", width: 80 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            PO_NO: { validation: { required: true } },
                            STYLE_NO: { type: "string" },
                            MATERIAL_NO: { type: "string" },
                            SKU: { type: "string" },
                            QTY: { type: "number", validation: { required: true } },
                            UNIT: { validation: { required: true } },
                            PCS: { type: "number" },
                            GWTS: { type: "number" },
                            VWTS: { type: "number" },
                            CWTS: { type: "number" },
                            CUFT: { type: "number" },
                        },
                    },
                ]
            },
            {
                name: "warehouse",
                title: "Warehouse",
                colWidth: 12,
                formControls: [
                    {
                        label: "Warehouse", type: "grid", name: "WarehouseHistories",
                        columns: [
                            { title: "Ctns", field: "CTNS", width: 90 },
                            {
                                title: "Type", field: "PACKAGE_TYPE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorPackageQtyUnit(container, options) }
                            },
                            { title: "Date/Time", field: "CREATE_DATE", width: 120, template: ({ CREATE_DATE }) => `${kendo.toString(CREATE_DATE, data.dateTimeFormat)}` },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "Length", field: "LENGTH", width: 80 },
                            { title: "Width", field: "WIDTH", width: 80 },
                            { title: "Height", field: "HEIGHT", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                            { title: "Dimension", field: "DIMENSION", width: 160 },
                            {
                                title: "Pickup", field: "IS_PICKUP", width: 60,
                                editor: function (container, options) { controls.kendo.renderGridEditorCheckBox(container, options) },
                                template: function (dataItem) {
                                    if (dataItem.IS_PICKUP == "true" || dataItem.IS_PICKUP == "Y")
                                        return "Y";
                                    else
                                        return "N";
                                }
                            },
                            {
                                title: "Delivered", field: "IS_DEL", width: 60,
                                editor: function (container, options) { controls.kendo.renderGridEditorCheckBox(container, options) },
                                template: function (dataItem) {
                                    if (dataItem.IS_DEL == "true" || dataItem.IS_DEL == "Y")
                                        return "Y";
                                    else
                                        return "N";
                                }
                            },
                            {
                                title: "Damaged", field: "IS_DAM", width: 60,
                                editor: function (container, options) { controls.kendo.renderGridEditorCheckBox(container, options) },
                                template: function (dataItem) {
                                    if (dataItem.IS_DAM == "true" || dataItem.IS_DAM == "Y")
                                        return "Y";
                                    else
                                        return "N";
                                }
                            },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CTNS: { type: "number", validation: { required: true } },
                            PACKAGE_TYPE: { validation: { required: true } },
                            CREATE_DATE: { type: "date", validation: { required: true } },
                            LENGTH: { type: "number", validation: { required: true } },
                            WIDTH: { type: "number", validation: { required: true } },
                            HEIGHT: { type: "number", validation: { required: true } },
                            MEASURE_UNIT: { type: "string", defaultValue: "C" },
                            GWTS: { type: "number", validation: { required: true } },
                            VWTS: { type: "number", validation: { required: true } },
                            DIMENSION: { editable: false },
                            IS_PICKUP: { type: "string", controlType: "checkBox" },
                            IS_DEL: { type: "string", controlType: "checkBox" },
                            IS_DAM: { type: "string", controlType: "checkBox" },
                        },
                        formulas: [
                            { fieldName: "DIMENSION", formula: `{LENGTH}x{WIDTH}x{HEIGHT}C\\{CTNS}` },
                            { fieldName: "VWTS", formula: `utils.calcVwts({LENGTH},{WIDTH},{HEIGHT},{CTNS})` },
                        ],
                    },
                ]
            },
        ]
    },
    {
        formName: "airHawb",
        mode: "edit",   //create / edit
        title: "HAWB#",
        readUrl: "../Air/Hawb/GetHawb",
        updateUrl: "../Air/Hawb/UpdateHawb",
        additionalScript: "initAirHawb",
        id: "",
        targetForm: {},
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "printHawb", text: "Print HAWB", icon: "file-txt" },
                    { id: "previewHawb", text: "Preview HAWB", icon: "file-report" },
                ]
            },
        ],
        formTabs: [
            {
                title: "Main Info.",
                name: "MainInfo",
                formGroups: ["mainInfo", "detail", "otherContacts"]
            },
            {
                title: "Cargo / Manifest",
                name: "CargoManifest",
                formGroups: ["measure", "dimension", "cargo", "licNo", "manifest"]
            },
            {
                title: "Charges / Invoice",
                name: "charges",
                formGroups: ["prepaidCharges", "collectCharges", "invoice"]
            },
            {
                title: "PO / Documents / Shipment Status",
                name: "poStatus",
                formGroups: ["po", "doc", "status" ]
            },
        ],
        schema: {
            hiddenFields: ["COMPANY_ID", "FRT_MODE"],
            readonlyFields: [
                { name: "HAWB_NO", readonly: "always" },
                { name: "MAWB_NO", readonly: "edit" },
                { name: "BOOKING_NO", readonly: "edit" },
                { name: "JOB_NO", readonly: "always" },
                { name: "CWTS", readonly: "always" }],
        },
        formGroups: [
            {
                name: "mainInfo",
                title: "Main Information",
                colWidth: 8,
                formControls: [
                    { label: "HAWB #", type: "text", name: "HAWB_NO", colWidth: 6 },
                    { label: "MAWB #", type: "text", name: "MAWB_NO", colWidth: 6 },
                    { label: "Booking #", type: "text", name: "BOOKING_NO", colWidth: 6 },
                    { label: "Job #", type: "text", name: "JOB_NO", colWidth: 6 },
                    { label: "Shipper", type: "customerAddrEditable", name: "SHIPPER" },
                    { label: "Consignee", type: "customerAddrEditable", name: "CONSIGNEE" },
                    { label: "Notify Party", type: "customerAddrEditable", name: "NOTIFY" },
                    { label: "Agent", type: "customerAddrEditable", name: "AGENT" },
                ]
            },
            {
                name: "otherContacts",
                title: "Other Contacts",
                collapse: true,
                colWidth: 8,
                formControls: [
                    { label: "Notify Party 1", type: "customerAddrEditable", name: "NOTIFY1" },
                    { label: "Notify Party 2", type: "customerAddrEditable", name: "NOTIFY2" },
                    { label: "Notify Party 3", type: "customerAddrEditable", name: "NOTIFY3" },
                ]
            },
            {
                name: "detail",
                title: "HAWB Details",
                colWidth: 8,
                formControls: [
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO", colWidth: 6 },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE", colWidth: 6 },
                    { label: "Origin", type: "port", name: "ORIGIN_CODE", colWidth: 6 },
                    { label: "Destination", type: "port", name: "DEST_CODE", colWidth: 6 },
                    { label: "Onboard Date", type: "date", name: "ONBOARD_DATE", colWidth: 6 },
                    { label: "Quoted Date", type: "date", name: "QUOTED_DATE", colWidth: 6 },
                    { label: "Prepaid Curr.", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 6 },
                    { label: "Collect Curr.", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 6 },
                    { label: "Freight Payment", type: "paymentTerms", name: "FRT_PAYMENT_PC", colWidth: 6 },
                    { label: "Other Payment", type: "paymentTerms", name: "OTHER_PAYMENT_PC", colWidth: 6 },
                    { label: "Show Frt Charge", type: "showCharges", name: "SHOW_FRT_CHG", colWidth: 6 },
                    { label: "Show Other Charge", type: "showCharges", name: "SHOW_OTHER_CHG", colWidth: 6 },
                    { label: "Selling Rate", type: "text", name: "SELLING_RATE", colWidth: 6 },
                    { label: "Insurance Amount", type: "text", name: "AMOUNT_OF_INS", colWidth: 6 },
                    { label: "DV Custom", type: "text", name: "DV_CUSTOM", colWidth: 6 },
                    { label: "DV Carriage", type: "text", name: "DV_CARRIAGE", colWidth: 6 },
                    { label: "Booking Rcvd Date", type: "date", name: "BOOKING_REC_DATE", colWidth: 6 },
                    { label: "Execution Date", type: "date", name: "EX_DATE", colWidth: 6 },
                    { label: "Cargo Rcvd Date", type: "dateTime", name: "CARGO_REC_DATE", colWidth: 6 },
                    { label: "Document Rcvd Date", type: "dateTime", name: "DOC_REC_DATE", colWidth: 6 },
                    { label: "NDC Date", type: "date", name: "NDC_DATE", colWidth: 6 },
                    { label: "Ship Cancel Date", type: "date", name: "SHIP_CANCEL_DATE", colWidth: 6 },
                    { label: "Division Code", type: "text", name: "DIV_CODE", colWidth: 6 },
                    { label: "Flight Services Type", type: "fltServiceType", name: "FLT_SERVICE_TYPE", colWidth: 6 },
                    { label: "Shipment Ref.#", type: "text", name: "DIV_CODE", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Incoterm", type: "incoterm", name: "INCOTERM_2012", colWidth: 6 },
                    { label: "Port", type: "port", name: "INCOTERM_2012_PORT", colWidth: 6 },
                ]
            },
            {
                name: "measure",
                title: "Measurement",
                colWidth: 8,
                formControls: [
                    { label: "Show LB", type: "switch", name: "SHOW_LB", colWidth: 3 },
                    { label: "Show OZ", type: "switch", name: "SHOW_OZ", colWidth: 3 },
                    { label: "Hide KG", type: "switch", name: "HIDE_KG", colWidth: 3 },
                    { label: "V/Wts Factor", type: "vwtsFactor", name: "VWTS_FACTOR", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "G/Wts", type: "number", name: "GWTS", colWidth: 6 },
                    { label: "V/Wts", type: "number", name: "VWTS", colWidth: 6 },
                    { label: "Total Volume", type: "number", name: "TOTAL_VOL", colWidth: 6 },
                    { label: "CBM", type: "number", name: "CBM", colWidth: 6 },
                    { label: "C/Wts", type: "number", name: "CWTS", colWidth: 6 },
                    { label: "Show Cargo Rcvd Date", type: "switch", name: "SHOW_CARGO_REC_DATE", colWidth: 6 },
                ],
            },
            {
                name: "dimension",
                title: "Dimension",
                colWidth: 8,
                formControls: [
                    //example of adding buttons to the form
                    //{ label: "Update From Warehouse", type: "button", name: "updateFromWarehouse", icon: "refresh", callbackFunction: "controllers.airHawb.updateFromWarehouse", colWidth: 2 },
                    {
                        label: "Dimension", type: "grid", name: "HawbDims",
                        toolbar: ["create", "cancel", { name: "updateFromWarehouse", text: "Update From Warehouse", iconClass: "k-icon k-i-refresh", callbackFunction: "controllers.airHawb.updateFromWarehouse" },],
                        columns: [
                            { title: "Ctns", field: "CTNS", width: 90 },
                            {
                                title: "Type", field: "PACKAGE_TYPE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorPackageQtyUnit(container, options) }
                            },
                            { title: "Length", field: "LENGTH", width: 90 },
                            { title: "Width", field: "WIDTH", width: 90 },
                            { title: "Height", field: "HEIGHT", width: 90 },
                            { title: "V/Wts", field: "VWTS", width: 90 },
                            { title: "Dimension", field: "DIMENSION", width: 160 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
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
                            { fieldName: "VWTS", formula: `utils.calcVwts({LENGTH},{WIDTH},{HEIGHT},{CTNS})` },
                        ],
                    },

                ],
            },
            {
                name: "cargo",
                title: "Cargo Information",
                colWidth: 8,
                formControls: [
                    { label: "Handle Information", type: "textArea", name: "HANDLE_INFO", colWidth: 6 },
                    { label: "Goods Description", type: "textArea", name: "GOOD_DESC", colWidth: 6 },
                    { label: "Marks and Nos on HAWB	", type: "textArea", name: "MARKS_NO_HAWB", colWidth: 6 },
                    { label: "Marks and Nos", type: "textArea", name: "MARKS_NO", colWidth: 6 },
                    { label: "As Agents for the Carrier", type: "text", name: "AS_AGENT_FOR_CARRIER", colWidth: 6 },
                ]
            },
            {
                name: "licNo",
                title: "License No.",
                colWidth: 8,
                formControls: [
                    {
                        label: "License No.", type: "grid", name: "HawbLics",
                        columns: [
                            { title: "Issue Date", field: "ISSUE_DATE", width: 100, template: ({ ISSUE_DATE }) => `${kendo.toString(ISSUE_DATE, data.dateTimeFormat)}` },
                            { title: "License No.", field: "LIC_NO", width: 160 },
                            { title: "Expiry Date", field: "EXP_DATE", width: 100, template: ({ EXP_DATE }) => `${kendo.toString(EXP_DATE, data.dateTimeFormat)}` },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
                        ],
                        fields: {
                            ISSUE_DATE: { type: "date", validation: { required: true } },
                            LIC_NO: { type: "string", validation: { required: true } },
                            EXP_DATE: { type: "date", validation: { required: true } },
                        },
                    },

                ],
            },
            {
                name: "manifest",
                title: "Manifest Information",
                colWidth: 8,
                formControls: [
                    { label: "Shipper", type: "customerAddrEditable", name: "MAN_SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddrEditable", name: "MAN_CONSIGNEE", colWidth: 6 },
                    { label: "Print Contact and Fax", type: "switch", name: "MAN_PRINT_SHIPPER_CONTACT", colWidth: 6 },
                    { label: "Print Contact and Fax", type: "switch", name: "MAN_PRINT_CONSIGNEE_CONTACT", colWidth: 6 },
                    { label: "Goods Description", type: "textArea", name: "MAN_GOOD_DESC", colWidth: 6 },
                    { label: "Remarks", type: "textArea", name: "MAN_REMARKS", colWidth: 6 },
                ]
            },
            ,
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    /*{ label: "Currency", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 3 },*/
                    { label: "Charge Template", type: "chargeTemplate", targetControl: "grid_HawbChargesPrepaid" },
                    {
                        label: "Prepaid Charges", type: "grid", name: "HawbChargesPrepaid",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.kendo.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorChargeQtyUnit(container, options) }
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
                    /*{ label: "Currency", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 3 },*/
                    { label: "Charge Template", type: "chargeTemplate", targetControl: "grid_HawbChargesCollect" },
                    {
                        label: "Prepaid Charges", type: "grid", name: "HawbChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.kendo.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorChargeQtyUnit(container, options) }
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
                name: "invoice",
                title: "Invoice",
                colWidth: 12,
                formControls: [
                    {
                        label: "Invoice", type: "grid", name: "Invoices", editable: false,
                        toolbar: [
                            { name: "createInvoice", text: "Create Invoice", iconClass: "k-icon k-i-file-add" },
                        ],
                        columns: [
                            { title: "Invoice #", field: "INV_NO", attributes: { "class": "link-cell" }, width: 80 },
                            { title: "Customer", field: "CUSTOMER_DESC", width: 260 },
                            { title: "Curr.", field: "CURR_CODE", width: 60 },
                            { title: "Amount", field: "AMOUNT", width: 90 },
                            { title: "Total Amt.", field: "AMOUNT_HOME", width: 90 },
                        ],
                    },
                ]
            },
            {
                name: "po",
                title: "PO Information",
                colWidth: 12,
                formControls: [
                    {
                        label: "PO Information", type: "grid", name: "HawbPos",
                        columns: [
                            { title: "PO#", field: "PO_NO", width: 120 },
                            { title: "Style #", field: "STYLE_NO", width: 120 },
                            { title: "Material #", field: "MATERIAL_NO", width: 120 },
                            { title: "SKU", field: "SKU", width: 120 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "UNIT", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorPackageQtyUnit(container, options) }
                            },
                            { title: "Pcs", field: "PCS", width: 80 },
                            { title: "G/Wts", field: "GWTS", width: 80 },
                            { title: "V/Wts", field: "VWTS", width: 80 },
                            { title: "C/Wts", field: "CWTS", width: 80 },
                            { title: "Cu.ft.", field: "CUFT", width: 80 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
                        ],
                        fields: {
                            PO_NO: { validation: { required: true } },
                            STYLE_NO: { type: "string" },
                            MATERIAL_NO: { type: "string" },
                            SKU: { type: "string" },
                            QTY: { type: "number", validation: { required: true } },
                            UNIT: { validation: { required: true } },
                            PCS: { type: "number" },
                            GWTS: { type: "number" },
                            VWTS: { type: "number" },
                            CWTS: { type: "number" },
                            CUFT: { type: "number" },
                        },
                    }
                ]
            },
            {
                name: "doc",
                title: "Documents",
                colWidth: 12,
                formControls: [
                    {
                        label: "Documents", type: "grid", name: "HawbDocs",
                        toolbar: [
                            { name: "uploadFile", text: "Upload File", iconClass: "k-icon k-i-file-add" },
                        ],
                        columns: [
                            { title: "Document Name", field: "DOC_NAME", attributes: { "class": "link-cell" }, width: 220 },
                            { title: "Size", field: "DOC_SIZE", width: 60 },
                            { title: "Comments", field: "COMMENTS", width: 260 },
                            { title: "Create", template: function (dataItem) { return `${dataItem.CREATE_USER} - ${kendo.toString(dataItem.CREATE_DATE, data.dateTimeLongFormat)}`; }, width: 160 },
                            { title: "Modify", template: function (dataItem) { return `${dataItem.CREATE_USER} - ${kendo.toString(dataItem.CREATE_DATE, data.dateTimeLongFormat)}`; }, width: 160 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
                        ],
                        fields: {
                            DOC_NAME: { validation: { required: true }, editable: false },
                            DOC_SIZE: { type: "number", editable: false },
                            COMMENTS: { type: "string" },
                            CREATE_USER: { editable: false },
                            CREATE_DATE: { type: "date", editable: false },
                            MODIFY_USER: { editable: false },
                            MODIFY_DATE: { type: "date", editable: false },
                        },
                    },
                ]
            },
            {
                name: "status",
                title: "Shipment Status",
                colWidth: 12,
                formControls: [
                    {
                        label: "Shipment Status", type: "grid", name: "HawbStatuses",
                        columns: [
                            { title: "Status", field: "STATUS_CODE", width: 120 },
                            { title: "Date/Time", field: "STATUS_DATE", template: function (dataItem) { return `${kendo.toString(dataItem.STATUS_DATE, data.dateTimeFormat)}`; }, width: 100 },
                            { title: "Remarks", field: "REMARKS", width: 220 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
                        ],
                        fields: {
                            STATUS_CODE: { validation: { required: true } },
                            STATUS_DATE: { type: "date" },
                            REMARKS: { type: "string" },
                        },
                    },
                ]
            },
        ]
    },
    {
        formName: "airInvoice",
        mode: "edit",   //create / edit
        title: "Invoice#",
        readUrl: "../Air/Invoice/GetInvoice",
        updateUrl: "../Air/Invoice/UpdateInvoice",
        //additionalScript: "initAirInvoice",
        id: "",
        targetForm: {},
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "printInvoice", text: "Print Invoice", icon: "file-txt" },
                    { id: "previewInvoice", text: "Preview Invoice", icon: "file-report" },
                ]
            },
        ],
        schema: {},
    }
];

export default class {
    constructor() {
        if (localStorage.user == null)
            window.open("../Home/Login", "_self");
        else {
            user = JSON.parse(localStorage.user);
            sessionId = localStorage.sessionId;
            $.ajax({
                url: "/Admin/Account/GetSessionStatus",
                type: "post",
                dataType: "json",
                data: { userId: user.USER_ID },
                success: function (result) {
                    if (result.result == "success") {
                        //get the latest sessionId from server
                        localStorage.sessionId = result.sessionId;
                        data.sessionId = result.sessionId;
                    } else if (result.result == "error") {
                        //if userlog has removed this session, clear localStorage and redirect to login
                        localStorage.removeItem("user");
                        localStorage.removeItem("sessionId");
                        window.open("../Home/Login", "_self");
                    }
                }
            });
        }

        this.prefetchGlobalVariables();
    }

    //getters
    get user() { return user; }
    get sessionId() { return sessionId; }
    get intervalId() { return intervalId; }
    get take() { return take; }
    get indexGridPageSize() { return indexGridPageSize; }
    get companyId() { return companyId; }
    get dateFormat() { return dateFormat; }
    get dateTimeFormat() { return dateTimeFormat; }
    get dateTimeLongFormat() { return dateTimeLongFormat; }
    get masterRecords() { return masterRecords; }
    get dropdownlistControls() { return dropdownlistControls; }
    get frameworkHtmlElements() { return frameworkHtmlElements; }
    get htmlElements() { return htmlElements; }
    get indexPages() { return indexPages; }
    get masterForms() { return masterForms; }

    //setters
    set user(val) { user = val; }
    set sessionId(val) { sessionId = val; }
    set intervalId(val) { intervalId = val; }
    set take(val) { take = val; }
    set indexGridPageSize(val) { indexGridPageSize = val; }
    set companyId(val) { companyId = val; }
    set dateFormat(val) { dateFormat = val; }
    set dateTimeFormat(val) { dateTimeFormat = val; }
    set dateTimeLongFormat(val) { dateTimeLongFormat = val; }
    set masterRecords(val) { masterRecords = val; }
    set frameworkHtmlElements(val) { frameworkHtmlElements = val; }
    set htmlElements(val) { htmlElements = val; }
    set indexPages(val) { indexPages = val; }
    set masterForms(val) { masterForms = val; }

    prefetchGlobalVariables = function() {
        $.ajax({
            url: "../Home/GetCurrencies",
            data: { companyId: companyId },
            success: function (result) {
                masterRecords.currencies = result;
            }
        });

        $.ajax({
            url: "../Home/GetSysCompanies",
            success: function (result) {
                masterRecords.sysCompanies = result;
            }
        });

        $.ajax({
            url: "../Home/GetChargeTemplates",
            data: { companyId: companyId },
            success: function (result) {
                masterRecords.chargeTemplates = result;
            }
        });

        $.ajax({
            url: "../Home/GetChargesView",
            success: function (result) {
                for (var i in result) {
                    result[i].CHARGE_DESC_DISPLAY = result[i].CHARGE_CODE + " - " + result[i].CHARGE_DESC;
                }
                masterRecords.charges = result;
            }
        });

        $.ajax({
            url: "../Home/GetEquipCodes",
            success: function (result) {
                masterRecords.equipCodes = result;
            }
        });

        $.ajax({
            url: "../Home/GetPortsView",
            success: function (result) {
                for (var i in result) {
                    result[i].PORT_DESC_DISPLAY = result[i].PORT_CODE + " - " + result[i].PORT_DESC;
                }
                masterRecords.ports = result;
            }
        });

        $.ajax({
            url: "../Home/GetAirlinesView",
            success: function (result) {
                for (var i in result) {
                    result[i].AIRLINE_DESC_DISPLAY = result[i].AIRLINE_CODE + " - " + result[i].AIRLINE_DESC;
                }
                masterRecords.airlines = result;
            }
        });
    }
}