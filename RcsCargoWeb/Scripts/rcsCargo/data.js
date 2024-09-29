//Global variables
var user;
var sessionId;
var scriptVersion;
var intervalId;
var take = 40;
var indexGridPageSize = 40;
var companyId = "";
var dateFormat = "M/d/yyyy";
var dateTimeFormat = "M/d/yyyy HH:mm";
var dateTimeLongFormat = "M/d/yyyy HH:mm:ss";
var lastActiveTabId = "";
var masterRecords = {
    lastUpdateTime: null,
    chargeQtyUnit: ["KGS", "SHP", "HAWB", "MAWB", "TRUCK", "PLT", "SETS", "SET", "MTH", "JOB", "CBM", "CTNS", "LBS", "PCS"],
    packageUnit: ["CTNS", "PLT", "PKG", "ROLLS", "PCS"],
    jobType: [{ text: "Consol", value: "C" }, { text: "Direct", value: "D" }],
    bookingType: [{ text: "Flat Pack", value: "F" }, { text: "GOH", value: "G" }, { text: "Flat Pack + GOH", value: "O" }],
    vwtsFactor: [6000, 6500, 7000, 9000],
    incoterm: ["FOB", "EXW", "FCA", "CPT", "CIP", "DAT", "DAP", "DDP", "FAS", "CFR", "CIF"],
    customerType: [{ text: "Customer" }, { text: "Agent" }, { text: "Carrier" }, { text: "Vendor" }],
    paymentTerms: [{ text: "Prepaid", value: "P" }, { text: "Collect", value: "C" }],
    printDateType: [{ text: "Flight Date", value: "F" }, { text: "Invoice Date", value: "I" }],
    showCharges: [{ text: "Prepaid", value: "P" }, { text: "Collect", value: "C" }, { text: "Prepaid + Collect", value: "PC" }],
    invoiceType: [{ text: "Invoice", value: "I" }, { text: "Debit Note", value: "D" }, { text: "Credit Note", value: "C" }],
    invoiceCategory: [{ text: "HAWB", value: "H" }, { text: "MAWB", value: "M" }, { text: "Job", value: "J" }, { text: "Lot", value: "L" }],
    pvType: [{ text: "Payment Voucher", value: "P" }, { text: "Credit Voucher", value: "C" }],
    fltServiceType: [{ text: "Standard", value: "S" }, { text: "Express", value: "E" }, { text: "Deferred", value: "D" }, { text: "Hub", value: "H" }, { text: "Direct", value: "R" }],
    equipCodes: {}, currencies: {}, sysCompanies: {}, airlines: {}, charges: {}, chargeTemplates: {}, countries: {}, ports: {}, customers: {},
};
var dropdownlistControls = ["airline", "port", "country", "customer", "customerAddr", "customerAddrEditable", "pkgUnit", "charge", "qtyUnit", "currency",
    "chargeTemplate", "vwtsFactor", "incoterm", "paymentTerms", "showCharges", "invoiceType", "invoiceCategory", "pvType", "fltServiceType",
    "unUsedBooking", "selectMawb", "selectHawb", "selectJob", "selectLot", "logFiles"];

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
                            <a href="#" class="d-block user-name"></a>
                        </div>
                    </div>

                    <div class="form-inline">
                        <div class="input-group" data-widget="sidebar-search">
                            <input class="form-control form-control-sidebar" type="search" placeholder="Search" aria-label="Search" style="margin: 0px; font-size: 12pt; height: 37px">
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
                    if (item.TYPE == "menu" && item.PARENT_ID == folder.MODULE_ID && !data.isEmptyString(item.CONTROLLER) && item.ENABLE == "Y") {
                        html += `
                            <li class="nav-item">
                                <a href="javascript:void(0)" data-controller="${item.CONTROLLER}" data-action="${item.ACTION}" data-id="${item.DATA_ID}" class="nav-link">
                                    <i class="far ${(data.isEmptyString(item.ICON) ? defaultIcon : item.ICON)} nav-icon"></i>
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

                    <li class="nav-item dropdown hidden">
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
                    <li class="nav-item dropdown hidden">
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
                    <div class="toolbar">
                    </div>
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
        pageName: "customer",
        id: "",
        title: "Customer",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Customer Code / Name" },
        ],
        gridConfig: {
            gridName: "gridCustomerIndex",
            dataSourceUrl: "../MasterRecord/Customer/GridCustomer_Read",
            linkIdPrefix: "customer",
            linkTabTitle: "Customer: ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "CUSTOMER_CODE", title: "Customer Code", attributes: { "class": "link-cell" } },
                { field: "CUSTOMER_DESC", title: "Name" },
                { field: "BRANCH_CODE", title: "Branch Code" },
                { field: "SHORT_DESC", title: "Short name" },
                {
                    title: "Address", template: function (dataItem) {
                        return `${dataItem.ADDR1} 
                        ${data.isEmptyString(dataItem.ADDR2) ? "" : dataItem.ADDR2} 
                        ${data.isEmptyString(dataItem.ADDR3) ? "" : dataItem.ADDR3} 
                        ${data.isEmptyString(dataItem.ADDR4) ? "" : dataItem.ADDR4}`;
                    }, width: 350,
                },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
            ],
        },
    },
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
                { name: "lotAssignment", text: "Lot Assignment", iconClass: "k-icon k-i-inherited", callbackFunction: "controllers.airMawb.lotAssignment" },
            ],
            columns: [
                { field: "MAWB", title: "MAWB#", attributes: { "class": "link-cell" } },
                { field: "JOB", title: "Job#" },
                { field: "LOT_NO", title: "Lot#", attributes: { "class": "link-cell", callbackFunction: "controllers.airMawb.lotAssignment" } },
                {
                    field: "JOB_TYPE", title: "Type",
                    template: function (dataItem) {
                        if (!data.isEmptyString(dataItem.JOB_TYPE)) {
                            return dataItem.JOB_TYPE == "C" ? "Consol" : "Direct";
                        } else {
                            return "";
                        }
                    }
                },
                { field: "AIRLINE_CODE", title: "Airline" },
                { field: "FLIGHT_NO", title: "Flight#" },
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "ETA", title: "ETA", template: ({ ETA }) => data.formatDateTime(ETA, "dateTime") },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "AGENT_DESC", title: "Agent" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
            fields: {
                FLIGHT_DATE: { type: "date" },
                ETA: { type: "date" },
                CREATE_DATE: { type: "date" },
            },
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
                { field: "CARGO_READY_DATE", title: "Cargo Ready Date", template: ({ CARGO_READY_DATE }) => data.formatDateTime(CARGO_READY_DATE, "dateTime") },
                { field: "CARGO_REC_DATE", title: "Cargo Rcvd Date", template: ({ CARGO_REC_DATE }) => data.formatDateTime(CARGO_REC_DATE, "dateTime") },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
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
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "PACKAGE", title: "Package" },
                { field: "GWTS", title: "G/Wts" },
                { field: "CWTS", title: "C/Wts" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "airInvoice",
        id: "",
        title: "Invoice",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "Invoice Date", type: "dateRange", name: "invoiceDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Invoice# / MAWB# / HAWB# / Job# / Customer" },
        ],
        gridConfig: {
            gridName: "gridAirInvoiceIndex",
            dataSourceUrl: "../Air/Invoice/GridInvoice_Read",
            linkIdPrefix: "airInvoice",
            linkTabTitle: "Invoice# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "INV_NO", title: "Invoice#", attributes: { "class": "link-cell" } },
                { template: function (dataItem) { return dataItem.INV_CATEGORY == "L" ? dataItem.LOT_NO : dataItem.JOB_NO; }, title: "Job / Lot#" },
                {
                    field: "INV_TYPE", title: "Type",
                    template: function (dataItem) {
                        switch (dataItem.INV_TYPE) {
                            case "I":
                                return "Invoice";
                            case "D":
                                return "Debit Note";
                            case "C":
                                return "Credit Note";
                        }
                    }
                },
                { field: "MAWB_NO", title: "MAWB#" },
                { field: "HAWB_NO", title: "HAWB#" },
                { field: "FLIGHT_NO", title: "Flight#" },
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN", title: "Origin" },
                { field: "DEST", title: "Destination" },
                { field: "CUSTOMER_DESC", title: "Customer" },
                { field: "CURR_CODE", title: "Curr." },
                { field: "AMOUNT", title: "Amount" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "airPv",
        id: "",
        title: "Payment Voucher",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "PV Date", type: "dateRange", name: "pvDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "PV# / MAWB# / HAWB# / Job# / Customer" },
        ],
        gridConfig: {
            gridName: "gridAirPvIndex",
            dataSourceUrl: "../Air/Pv/GridPv_Read",
            linkIdPrefix: "airPv",
            linkTabTitle: "PV# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "PV_NO", title: "PV#", attributes: { "class": "link-cell" } },
                { template: function (dataItem) { return dataItem.PV_CATEGORY == "L" ? dataItem.LOT_NO : dataItem.JOB_NO; }, title: "Job / Lot#" },
                {
                    field: "PV_TYPE", title: "Type",
                    template: function (dataItem) {
                        switch (dataItem.PV_TYPE) {
                            case "P":
                                return "Payment Voucher";
                            case "C":
                                return "Credit Voucher";
                        }
                    }
                },
                { field: "MAWB_NO", title: "MAWB#" },
                { field: "HAWB_NO", title: "HAWB#" },
                { field: "FLIGHT_NO", title: "Flight#" },
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN", title: "Origin" },
                { field: "DEST", title: "Destination" },
                { field: "CUSTOMER_DESC", title: "Customer" },
                { field: "CURR_CODE", title: "Curr." },
                { field: "AMOUNT", title: "Amount" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "airOtherJob",
        id: "",
        title: "Other Job",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "Flight Date", type: "dateRange", name: "flightDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Job# / Lot# / Shipper / Consignee" },
        ],
        gridConfig: {
            gridName: "gridAirOtherJobIndex",
            dataSourceUrl: "../Air/OtherJob/GridOtherJob_Read",
            linkIdPrefix: "airOtherJob",
            linkTabTitle: "Other Job# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "JOB_NO", title: "Job#", attributes: { "class": "link-cell" } },
                { field: "LOT_NO", title: "Lot#" },
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN", title: "Origin" },
                { field: "DEST", title: "Destination" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "log",
        id: "",
        title: "System Log",
        additionalScript: "initLog",
        controls: [
            { label: "Log file", type: "logFiles", name: "logFiles", colWidth: 4 },
            { type: "emptyBlock", name: "logContent", colWidth: 12 },
        ],
    },
];

var masterForms = [
    {
        formName: "customer",
        mode: "edit",   //create / edit
        title: "Customer:",
        readUrl: "../MasterRecord/Customer/GetCustomer",
        updateUrl: "../MasterRecord/Customer/UpdateCustomer",
        //additionalScript: "initCustomer",
        idField: "CUSTOMER_CODE",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
        ],
        schema: {
            fields: [
                { name: "CUSTOMER_CODE", readonly: "always" },
                { name: "TYPE", required: "true" },
                { name: "CustomerNames", required: "true" },
                { name: "CustomerContacts", required: "true" },
            ],
        },
        formTabs: [
            {
                title: "Customer",
                name: "mainInfo",
                formGroups: ["mainInfo", "address"]
            },
        ],
        formGroups: [
            {
                name: "mainInfo",
                title: "Customer Name",
                colWidth: 10,
                formControls: [
                    { label: "Customer Code", type: "text", name: "CUSTOMER_CODE", colWidth: 6 },
                    { label: "Group Code", type: "text", name: "GROUP_CODE", colWidth: 6 },
                    { label: "Customer Type", type: "buttonGroup", dataType: "customerType", name: "TYPE", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    {
                        label: "Customer Name", type: "grid", name: "CustomerNames", colWidth: 6,
                        columns: [
                            {
                                title: "Country", field: "COUNTRY_CODE", width: 80,
                                editor: function (container, options) { controls.kendo.renderGridEditorCountry(container, options) }
                            },
                            {
                                title: "Port", field: "PORT_CODE", width: 90,
                                editor: function (container, options) { controls.kendo.renderGridEditorPort(container, options) }
                            },
                            { title: "Branch", field: "BRANCH_CODE", width: 90 },
                            { title: "Name", field: "CUSTOMER_DESC", width: 280 },
                            { title: "Short Name", field: "SHORT_DESC", width: 180 },
                        ],
                        fields: {
                            //CUSTOMER_CODE: { type: "string" },
                            COUNTRY_CODE: { validation: { required: true } },
                            PORT_CODE: { validation: { required: true } },
                            BRANCH_CODE: { validation: { required: true } },
                            CUSTOMER_DESC: { validation: { required: true } },
                            SHORT_DESC: { validation: { required: true } },
                        },
                    },
                    { label: "Air Instruction ", type: "textArea", name: "AIR_INST", colWidth: 6 },
                    { label: "Ocean Instruction ", type: "textArea", name: "OCEAN_INST", colWidth: 6 },
                ]
            },
            {
                name: "address",
                title: "Address",
                colWidth: 10,
                formControls: [
                    {
                        label: "", type: "grid", name: "CustomerContacts",
                        columns: [
                            {
                                title: "Branch", field: "BRANCH_CODE", width: 90,
                                editor: function (container, options) { controls.kendo.renderGridEditorBranch(container, options) }
                            },
                            {
                                title: "Short Name", field: "SHORT_DESC", width: 160,
                                editor: function (container, options) { controls.kendo.renderGridEditorShortDesc(container, options) }
                            },
                            {
                                title: "Contact/Email", field: "CONTACT",
                                template: (dataItem) => utils.removeNullString(`${dataItem.CONTACT}<br>${dataItem.EMAIL}`),
                                editor: function (container, options) {
                                    $(`<b>Contact:</b><br><input name="CONTACT" class="form-control" style="width: 100%" />
                                    <b>Email:</b><br><input name="EMAIL" class="form-control" style="width: 100%" />`).appendTo(container);
                                },
                                width: 120
                            },
                            {
                                title: "Tel/Fax", field: "TEL", template: (dataItem) => utils.removeNullString(`${dataItem.TEL}<br>${dataItem.FAX}`),
                                editor: function (container, options) {
                                    $(`<b>Tel:</b><br><input name="TEL" class="form-control" style="width: 100%" />
                                    <b>Fax:</b><br><input name="FAX" class="form-control" style="width: 100%" />`).appendTo(container);
                                },
                                width: 120
                            },
                            {
                                title: "Address", field: "ADDR_TYPE",
                                template: (dataItem) => utils.removeNullString(`<b>Address Type: ${dataItem.ADDR_TYPE == "D" ? "Delivery" : "Billing"}</b><br>${dataItem.ADDR1}<br>${dataItem.ADDR2}<br>${dataItem.ADDR3}<br>${dataItem.ADDR4}`),
                                editor: function (container, options) {
                                    $(`<b>Address Type:</b><input name="ADDR_TYPE" style="margin-left: 4px; width: 120px" /><br>
                                    <input name="ADDR1" class="form-control" style="width: 100%" />
                                    <input name="ADDR2" class="form-control" style="width: 100%" />
                                    <input name="ADDR3" class="form-control" style="width: 100%" />
                                    <input name="ADDR4" class="form-control" style="width: 100%" />`).appendTo(container);

                                    $(`input[name="ADDR_TYPE"]`).kendoDropDownList({
                                        dataTextField: "ADDR_TYPE_DESC",
                                        dataValueField: "ADDR_TYPE",
                                        dataSource: [{ ADDR_TYPE: "D", ADDR_TYPE_DESC: "Delivery" }, { ADDR_TYPE: "B", ADDR_TYPE_DESC: "Billing" }],
                                    });
                                },
                                width: 350
                            },
                            {
                                title: "City/State/Postal#", field: "CITY",
                                template: (dataItem) => utils.removeNullString(`${dataItem.CITY}<br>${dataItem.STATE}<br>${dataItem.POSTAL_CODE}`),
                                editor: function (container, options) {
                                    $(`<b>City:</b><br><input name="CITY" class="form-control" style="width: 100%" />
                                    <b>State:</b><br><input name="STATE" class="form-control" style="width: 100%" />
                                    <b>Postal #:</b><br><input name="POSTAL_CODE" class="form-control" style="width: 100%" />`).appendTo(container);
                                },
                                width: 180
                            },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }], width: 50 },
                        ],
                        fields: {
                            BRANCH_CODE: { validation: { required: true } },
                            SHORT_DESC: { validation: { required: true } },
                            CONTACT: { type: "string" },
                            EMAIL: { type: "string" },
                            TEL: { type: "string" },
                            FAX: { type: "string" },
                            ADDR1: { validation: { required: true } },
                            ADDR2: { type: "string" },
                            ADDR3: { type: "string" },
                            ADDR4: { type: "string" },
                            ADDR_TYPE: { type: "string", defaultValue: "D" },
                            CITY: { type: "string" },
                            STATE: { type: "string" },
                            POSTAL_CODE: { type: "string" },
                        },
                    },
                ]
            },
        ],
    },
    {
        formName: "airMawb",
        mode: "edit",   //create / edit
        title: "MAWB#",
        readUrl: "../Air/Mawb/GetMawb",
        updateUrl: "../Air/Mawb/UpdateMawb",
        additionalScript: "initAirMawb",
        idField: "MAWB",
        id: "",
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
                formGroups: ["mainInfo", "contactMain", "2nd3rdFlights"]
            },
            {
                title: "Load Plan",
                name: "loadPlan",
                formGroups: ["contactOthers", "loadplanBookingList", "loadplanHawbList", "loadplanHawbEquip"]
            },
            {
                title: "Direct Job",
                name: "directJob",
                formGroups: ["prepaidCharges", "collectCharges", "invoice", "dims"]
            },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "JOB", readonly: "always" },
                { name: "JOB_TYPE", hidden: "true", defaultValue: "C" },
                { name: "IS_PASSENGER_FLIGHT", hidden: "true", defaultValue: "N" },
                { name: "IS_X_RAY", hidden: "true", defaultValue: "N" },
                { name: "IS_SPLIT_SHIPMENT", hidden: "true", defaultValue: "N" },
                { name: "IS_CLOSED", hidden: "true", defaultValue: "N" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "FRT_PAYMENT_PC", hidden: "true", defaultValue: "P" },
                { name: "OTHER_PAYMENT_PC", hidden: "true", defaultValue: "P" },
                { name: "JOB_TYPE", hidden: "true" },
                { name: "MAWB", required: "true", readonly: "edit" },
                { name: "AIRLINE_CODE", required: "true" },
                { name: "FLIGHT_NO", required: "true" },
                { name: "FLIGHT_DATE", required: "true", defaultValue: new Date() },
                { name: "ISSUE_DATE", required: "true" },
                { name: "ORIGIN_CODE", required: "true" },
                { name: "DEST_CODE", required: "true" },
                { name: "VWTS_FACTOR", required: "true" },
            ],
            validation: {
                rules: {
                    mawbNoRule: function (input) {
                        if (input.is("[name=MAWB]")) {
                            return utils.isValidMawbNo(input.val());
                        }
                        return true;
                    },
                    mawbNoExistsRule: function (input) {
                        if (input.is("[name=MAWB]")) {
                            return !utils.isExistingMawbNo(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: {
                    mawbNoRule: "Invalid MAWB#!",
                    mawbNoExistsRule: "MAWB# already exists in the database!",
                },
            },
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
                collapse: true,
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
                title: "Main Contact Information",
                colWidth: 6,
                formControls: [
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER" },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE" },
                    { label: "Notify Party", type: "customerAddr", name: "NOTIFY" },
                ]
            },
            {
                name: "contactOthers",
                title: "Other Contact Information",
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_MawbChargesPrepaid" },
                    {
                        label: "", type: "grid", name: "MawbChargesPrepaid",
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
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_MawbChargesCollect" },
                    {
                        label: "", type: "grid", name: "MawbChargesCollect",
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
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
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
                        label: "", type: "grid", name: "Invoices", editable: false,
                        linkIdPrefix: "airInvoice",
                        linkTabTitle: "Invoice#",
                        toolbar: [
                            { name: "createInvoice", text: "Create Invoice", iconClass: "k-icon k-i-file-add", callbackFunction: "controllers.airMawb.createInvoiceClick" },
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
                name: "dims",
                title: "Dimension",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "MawbDims",
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
                        label: "", type: "grid", name: "LoadplanBookingListViews",
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
                        label: "", type: "grid", name: "LoadplanHawbListViews",
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
                        label: "", type: "grid", name: "LoadplanHawbEquips",
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
        idField: "BOOKING_NO",
        id: "",
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
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "BOOKING_NO", readonly: "always", required: "true" },
                { name: "SHIPPER", required: "true" },
                { name: "CONSIGNEE", required: "true" },
                { name: "ORIGIN_CODE", required: "true" },
                { name: "DEST_CODE", required: "true" },
                { name: "VWTS_FACTOR", required: "true" },
            ],
            validation: {
                rules: {
                    bookingNoExistsRule: function (input) {
                        if (input.is("[name=BOOKING_NO]")) {
                            return !utils.isExistingBookingNo(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: {
                    bookingNoExistsRule: "Booking# already exists in the database!",
                },
            },
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
                        label: "", type: "grid", name: "BookingPos",
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
                        label: "", type: "grid", name: "WarehouseHistories",
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
        idField: "HAWB_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "AirHawb", text: "Print HAWB", icon: "file-pdf", type: "pdf" },
                    { id: "AirHawbPreview", text: "Preview HAWB", icon: "file-report", type: "pdf" },
                    { id: "AirHawbAttachList_RCSLON", text: "Attached List", icon: "file-pdf", type: "pdf" },
                    { id: "AirFcr", text: "Forwarder Cargo Receipt", icon: "file-pdf", type: "pdf" },
                    { id: "CargoShippingInstructions", text: "Cargo Shipping Instructions", icon: "file-pdf", type: "pdf" },
                    { id: "SecurityScreeningReceipt", text: "Security Screening Receipt", icon: "file-excel", type: "xlsx" },
                    { id: "K4securityletter", text: "K4 security letter", icon: "file-pdf", type: "pdf" },
                    { id: "BatteryDeclaration", text: "Battery Declaration", icon: "file-pdf", type: "pdf" },
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
                formGroups: ["po", "doc", "status"]
            },
        ],
        schema: {
            fields: [
                { name: "HAWB_NO", readonly: "always" },
                { name: "BOOKING_NO", readonly: "edit" },
                { name: "JOB_NO", readonly: "always" },
                { name: "CWTS", readonly: "always" },
                { name: "FLIGHT_NO", readonly: "always" },
                { name: "FLIGHT_DATE", readonly: "always" },
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_MASTER_HAWB", hidden: "true", defaultValue: "N" },
                { name: "IS_SEA_AIR_JOB", hidden: "true", defaultValue: "N" },
                { name: "IS_PICKUP", hidden: "true", defaultValue: "N" },
                { name: "FRT_P_RATE", hidden: "true", defaultValue: 0 },
                { name: "FRT_C_RATE", hidden: "true", defaultValue: 100 },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "SHIPPER", required: "true" },
                { name: "CONSIGNEE", required: "true" },
                { name: "ORIGIN_CODE", required: "true" },
                { name: "DEST_CODE", required: "true" },
                { name: "P_CURR_CODE", required: "true" },
                { name: "C_CURR_CODE", required: "true" },
                { name: "FRT_PAYMENT_PC", required: "true" },
                { name: "OTHER_PAYMENT_PC", required: "true" },
            ],
        },
        formGroups: [
            {
                name: "mainInfo",
                title: "Main Information",
                colWidth: 8,
                formControls: [
                    { label: "HAWB #", type: "text", name: "HAWB_NO", colWidth: 6 },
                    { label: "MAWB #", type: "selectMawb", name: "MAWB_NO", callbackFunction: "controllers.airHawb.selectMawb", colWidth: 6 },
                    { label: "Booking #", type: "unUsedBooking", name: "BOOKING_NO", callbackFunction: "controllers.airHawb.selectUnusedBooking", colWidth: 6 },
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
                    { label: "Selling Rate", type: "number", name: "SELLING_RATE", colWidth: 6 },
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
                    { label: "Shipment Ref.#", type: "text", name: "SHIPMENT_REF_NO", colWidth: 6 },
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
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 6 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 6 },
                    { label: "Second Package", type: "numberInt", name: "PACKAGE2", colWidth: 6 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT2", colWidth: 6 },
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
                        label: "", type: "grid", name: "HawbDims",
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
                        label: "", type: "grid", name: "HawbLics",
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
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    /*{ label: "Currency", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 3 },*/
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_HawbChargesPrepaid" },
                    {
                        label: "", type: "grid", name: "HawbChargesPrepaid",
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
                            PAYMENT_TYPE: { type: "string", defaultValue: "P" },
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
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_HawbChargesCollect" },
                    {
                        label: "", type: "grid", name: "HawbChargesCollect",
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
                            PAYMENT_TYPE: { type: "string", defaultValue: "C" },
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
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
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
                        label: "", type: "grid", name: "Invoices", editable: false,
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
                        label: "", type: "grid", name: "HawbPos",
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
                        label: "",
                        type: "grid",
                        name: "HawbDocs",
                        deleteCallbackFunction: "controllers.airHawb.gridHawbDocsDelete",
                        toolbar: [
                            { name: "uploadFile", text: "Upload File", iconClass: "k-icon k-i-file-add", callbackFunction: "controllers.airHawb.uploadFiles" },
                            { name: "save", callbackFunction: "controllers.airHawb.gridHawbDocsConfirmSaveChanges" },
                            { name: "cancel" },
                        ],
                        columns: [
                            //{ title: "Document Name", field: "DOC_NAME", attributes: { "class": "link-cell" }, width: 220 },
                            { title: "", template: (dataItem) => `<i class="k-icon k-i-download handCursor" onclick="controllers.airHawb.downloadFile(this, '${dataItem.DOC_ID}')"></i>`, width: 24 },
                            { title: "Document Name", field: "DOC_NAME", width: 220 },
                            { title: "Size", field: "DOC_SIZE", width: 60 },
                            { title: "Comments", field: "COMMENTS", width: 260 },
                            { title: "Create", template: function (dataItem) { return `${dataItem.CREATE_USER} - ${kendo.toString(kendo.parseDate(dataItem.CREATE_DATE), data.dateTimeLongFormat)}`; }, width: 160 },
                            { title: "Modify", template: function (dataItem) { return `${dataItem.MODIFY_USER} - ${kendo.toString(kendo.parseDate(dataItem.MODIFY_DATE), data.dateTimeLongFormat)}`; }, width: 160 },
                            {
                                command: [{
                                    className: "btn-destroy", name: "destroy", text: " "
                                }], width: 50
                            },
                        ],
                        fields: {
                            DOC_ID: { type: "string" },
                            HAWB_NO: { type: "string" },
                            DOC_PATH: { type: "string" },
                            DOC_NAME: { validation: { required: true } },
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
                        label: "", type: "grid", name: "HawbStatuses",
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
        additionalScript: "initAirInvoice",
        idField: "INV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "AirInvoicePreview", text: "Print Invoice", icon: "file-txt", type: "pdf" },
                    { id: "AirInvoice", text: "Preview Invoice", icon: "file-report", type: "pdf" },
                ]
            },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "IS_PRINTED", hidden: "true", defaultValue: "N" },
                { name: "IS_POSTED", hidden: "true", defaultValue: "N" },
                { name: "IS_TRANSFERRED", hidden: "true", defaultValue: "N" },
                { name: "InvoiceHawbs", hidden: "true" },
                { name: "INV_DATE", required: "true", readonly: "edit", defaultValue: new Date() },
                { name: "INV_TYPE", required: "true", readonly: "edit" },
                { name: "INV_CATEGORY", required: "true" },
                { name: "SHOW_DATE_TYPE", required: "true" },
                { name: "FLIGHT_DATE", required: "true" },
                { name: "CURR_CODE", required: "true" },
                { name: "CUSTOMER", required: "true" },
                { name: "PACKAGE_UNIT", required: "true" },
                { name: "FRT_PAYMENT_PC", required: "true" },
                { name: "INV_NO", readonly: "always" },
                { name: "AMOUNT", readonly: "always" },
                { name: "AMOUNT_HOME", readonly: "always" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "MainInfo",
                formGroups: ["mainInfo", "charges"]
            },
        ],
        formGroups: [
            {
                name: "mainInfo",
                title: "Invoice Information",
                colWidth: 12,
                formControls: [
                    { label: "Invoice #", type: "text", name: "INV_NO", colWidth: 6 },
                    { label: "Invoice Date", type: "date", name: "INV_DATE", colWidth: 6 },
                    { label: "Invoice Type", type: "buttonGroup", name: "INV_TYPE", dataType: "invoiceType", colWidth: 4 },
                    { label: "Category", type: "buttonGroup", name: "INV_CATEGORY", dataType: "invoiceCategory", colWidth: 4 },
                    { label: "Print Date", type: "buttonGroup", name: "SHOW_DATE_TYPE", dataType: "printDateType", colWidth: 4 },
                    { label: "HAWB #", type: "selectHawb", name: "HAWB_NO", callbackFunction: "controllers.airInvoice.selectHawb", colWidth: 3 },
                    { label: "MAWB #", type: "selectMawb", name: "MAWB_NO", callbackFunction: "controllers.airInvoice.selectMawb", colWidth: 3 },
                    { label: "Job #", type: "selectJob", name: "JOB_NO", callbackFunction: "controllers.airInvoice.selectJob", colWidth: 3 },
                    { label: "Lot #", type: "selectLot", name: "LOT_NO", callbackFunction: "controllers.airInvoice.selectLot", colWidth: 3 },
                    { label: "Customer", type: "customerAddrEditable", name: "CUSTOMER", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE", colWidth: 4 },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO", colWidth: 4 },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE", colWidth: 4 },
                    { label: "Freight Charge", type: "paymentTerms", name: "FRT_PAYMENT_PC", colWidth: 4 },
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 4 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 4 },
                    { label: "G/Wts", type: "number", name: "GWTS", colWidth: 4 },
                    { label: "V/Wts", type: "number", name: "VWTS", colWidth: 4 },
                    { label: "C/Wts", type: "number", name: "CWTS", colWidth: 4 },
                    { label: "Origin", type: "port", name: "ORIGIN", colWidth: 4 },
                    { label: "Destination", type: "port", name: "DEST", colWidth: 4 },
                    { label: "Cr Invoice#", type: "text", name: "CR_INVOICE", colWidth: 4 },
                    { label: "Currency", type: "currency", name: "CURR_CODE", exRateName: "EX_RATE", colWidth: 4 },
                    { label: "Amount", type: "text", name: "AMOUNT", colWidth: 4 },
                    { label: "Amount Home", type: "text", name: "AMOUNT_HOME", colWidth: 4 },
                    { label: "Remarks", type: "textArea", name: "REMARK", colWidth: 4 },
                    { label: "Payment Terms", type: "text", name: "PAYMENT_TERMS", colWidth: 4 },
                ]
            },
            {
                name: "charges",
                title: "Charge Items",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_InvoiceItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "InvoiceItems",
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
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
                            { fieldName: "master.AMOUNT", formula: "SUM({AMOUNT_HOME})" },
                            { fieldName: "master.AMOUNT_HOME", formula: "SUM({AMOUNT_HOME}*{master.EX_RATE})" },
                        ],
                        //events: [
                        //    { eventType: "dataBound", callbackFunction: "controllers.airInvoice.grid_InvoiceItemsDataBound" },
                        //],
                    },
                ]
            },
        ],
    },
    {
        formName: "airPv",
        mode: "edit",   //create / edit
        title: "PV#",
        readUrl: "../Air/Pv/GetPv",
        updateUrl: "../Air/Pv/UpdatePv",
        additionalScript: "initAirPv",
        idField: "PV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "AirPaymentVoucherPreview", text: "Print PV", icon: "file-txt", type: "pdf" },
                    { id: "AirPaymentVoucherPreview1", text: "Preview PV", icon: "file-report", type: "pdf" },
                ]
            },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "IS_PRINTED", hidden: "true", defaultValue: "N" },
                { name: "IS_POSTED", hidden: "true", defaultValue: "N" },
                { name: "PV_DATE", required: "true", readonly: "edit", defaultValue: new Date() },
                { name: "PV_TYPE", required: "true", readonly: "edit" },
                { name: "PV_CATEGORY", required: "true" },
                { name: "FLIGHT_DATE", required: "true" },
                { name: "CURR_CODE", required: "true" },
                { name: "CUSTOMER", required: "true" },
                { name: "PACKAGE_UNIT", required: "true" },
                { name: "FRT_PAYMENT_PC", required: "true" },
                { name: "PV_NO", readonly: "always" },
                { name: "AMOUNT", readonly: "always" },
                { name: "AMOUNT_HOME", readonly: "always" },
                { name: "PvItems", required: "true" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "MainInfo",
                formGroups: ["mainInfo", "charges"]
            },
        ],
        formGroups: [
            {
                name: "mainInfo",
                title: "PV Information",
                colWidth: 12,
                formControls: [
                    { label: "Pv #", type: "text", name: "PV_NO", colWidth: 4 },
                    { label: "Pv Date", type: "date", name: "PV_DATE", colWidth: 4 },
                    { label: "Cr Invoice", type: "switch", name: "IS_CR_INVOICE", colWidth: 4 },
                    { label: "Pv Type", type: "buttonGroup", name: "PV_TYPE", dataType: "pvType", colWidth: 4 },
                    { label: "Category", type: "buttonGroup", name: "PV_CATEGORY", dataType: "invoiceCategory", colWidth: 4 },
                    { label: "Vendor Inv.#", type: "text", name: "VENDOR_INV_NO", colWidth: 4 },
                    { label: "HAWB #", type: "selectHawb", name: "HAWB_NO", callbackFunction: "controllers.airPv.selectHawb", colWidth: 3 },
                    { label: "MAWB #", type: "selectMawb", name: "MAWB_NO", callbackFunction: "controllers.airPv.selectMawb", colWidth: 3 },
                    { label: "Job #", type: "selectJob", name: "JOB_NO", callbackFunction: "controllers.airPv.selectJob", colWidth: 3 },
                    { label: "Lot #", type: "selectLot", name: "LOT_NO", callbackFunction: "controllers.airPv.selectLot", colWidth: 3 },
                    { label: "Customer", type: "customerAddrEditable", name: "CUSTOMER", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Airline", type: "airline", name: "AIRLINE_CODE", colWidth: 4 },
                    { label: "Flight #", type: "text", name: "FLIGHT_NO", colWidth: 4 },
                    { label: "Flight Date", type: "dateTime", name: "FLIGHT_DATE", colWidth: 4 },
                    { label: "Freight Charge", type: "paymentTerms", name: "FRT_PAYMENT_PC", colWidth: 4 },
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 4 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 4 },
                    { label: "G/Wts", type: "number", name: "GWTS", colWidth: 4 },
                    { label: "V/Wts", type: "number", name: "VWTS", colWidth: 4 },
                    { label: "C/Wts", type: "number", name: "CWTS", colWidth: 4 },
                    { label: "Origin", type: "port", name: "ORIGIN", colWidth: 4 },
                    { label: "Destination", type: "port", name: "DEST", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Currency", type: "currency", name: "CURR_CODE", exRateName: "EX_RATE", colWidth: 4 },
                    { label: "Amount", type: "text", name: "AMOUNT", colWidth: 4 },
                    { label: "Amount Home", type: "text", name: "AMOUNT_HOME", colWidth: 4 },
                    { label: "Remarks", type: "textArea", name: "REMARK", colWidth: 4 },
                ]
            },
            {
                name: "charges",
                title: "Charge Items",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_PvItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "PvItems",
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
                            { title: "Amount", field: "AMOUNT", width: 90 },
                            { title: "Total Amt.", field: "AMOUNT_HOME", width: 90 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CHARGE_CODE: { validation: { required: true } },
                            CHARGE_DESC: { defaultValue: "" },
                            CURR_CODE: { validation: { required: true } },
                            PRICE: { type: "number", validation: { required: true } },
                            QTY: { type: "number", validation: { required: true } },
                            QTY_UNIT: { validation: { required: true } },
                            EX_RATE: { type: "number", editable: false },
                            AMOUNT: { type: "number", editable: false },
                            AMOUNT_HOME: { type: "number", editable: false },
                        },
                        formulas: [
                            { fieldName: "AMOUNT", formula: "{PRICE}*{QTY}" },
                            { fieldName: "AMOUNT_HOME", formula: "{PRICE}*{QTY}*{EX_RATE}" },
                            { fieldName: "master.AMOUNT", formula: "SUM({AMOUNT_HOME})" },
                            { fieldName: "master.AMOUNT_HOME", formula: "SUM({AMOUNT_HOME}*{master.EX_RATE})" },
                        ],
                    },
                ]
            },
        ],
    },
    {
        formName: "airOtherJob",
        mode: "edit",   //create / edit
        title: "Job#",
        readUrl: "../Air/OtherJob/GetOtherJob",
        updateUrl: "../Air/OtherJob/UpdateOtherJob",
        //additionalScript: "initAirOtherJob",
        idField: "JOB_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "FLIGHT_DATE", required: "true" },
                { name: "CURR_CODE", required: "true" },
                { name: "SHIPPER_CODE", required: "true" },
                { name: "CONSIGNEE_CODE", required: "true" },
                { name: "PACKAGE_UNIT", required: "true" },
                { name: "JOB_NO", readonly: "always" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "MainInfo",
                formGroups: ["mainInfo", "prepaidCharges", "collectCharges", "invoice"]
            },
        ],
        formGroups: [
            {
                name: "mainInfo",
                title: "Other Job Information",
                colWidth: 12,
                formControls: [
                    { label: "Job #", type: "text", name: "JOB_NO", colWidth: 6 },
                    { label: "Lot #", type: "selectLot", name: "LOT_NO", callbackFunction: "controllers.airOtherJob.selectLot", colWidth: 6 },
                    { label: "Shipper", type: "customerAddrEditable", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddrEditable", name: "CONSIGNEE", colWidth: 6 },
                    { label: "Notify Party", type: "customerAddrEditable", name: "NOTIFY", colWidth: 6 },
                    { label: "Agent", type: "customerAddrEditable", name: "AGENT", colWidth: 6 },
                    { label: "Flight Date", type: "date", name: "FLIGHT_DATE", colWidth: 4 },
                    { label: "Origin", type: "port", name: "ORIGIN", colWidth: 4 },
                    { label: "Destination", type: "port", name: "DEST", colWidth: 4 },
                    { label: "Currency", type: "currency", name: "CURR_CODE", exRateName: "EX_RATE", colWidth: 4 },
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 4 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 4 },
                    { label: "G/Wts", type: "number", name: "GWTS", colWidth: 4 },
                    { label: "V/Wts", type: "number", name: "VWTS", colWidth: 4 },
                    { label: "C/Wts", type: "number", name: "CWTS", colWidth: 4 },
                    { label: "Remarks", type: "textArea", name: "REMARK", colWidth: 4 },
                ]
            },
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_OtherJobChargesPrepaid", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "OtherJobChargesPrepaid",
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
                            CURR_CODE: { validation: { required: true } },
                            PRICE: { type: "number", validation: { required: true } },
                            QTY: { type: "number", validation: { required: true } },
                            QTY_UNIT: { validation: { required: true } },
                            EX_RATE: { type: "number", editable: false },
                            MIN_CHARGE: { type: "number", validation: { required: true }, defaultValue: 1 },
                            AMOUNT: { type: "number", editable: false },
                            AMOUNT_HOME: { type: "number", editable: false, validation: { required: true } },
                        },
                        formulas: [
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
                        ],
                    },
                ]
            },
            {
                name: "collectCharges",
                title: "Collect Charges",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", targetControl: "grid_OtherJobChargesCollect", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "OtherJobChargesCollect",
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
                            CURR_CODE: { validation: { required: true } },
                            PRICE: { type: "number", validation: { required: true } },
                            QTY: { type: "number", validation: { required: true } },
                            QTY_UNIT: { validation: { required: true } },
                            EX_RATE: { type: "number", editable: false },
                            MIN_CHARGE: { type: "number", validation: { required: true }, defaultValue: 1 },
                            AMOUNT: { type: "number", editable: false },
                            AMOUNT_HOME: { type: "number", editable: false, validation: { required: true } },
                        },
                        formulas: [
                            { fieldName: "AMOUNT", formula: "({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE}" },
                            { fieldName: "AMOUNT_HOME", formula: "(({PRICE}*{QTY})>{MIN_CHARGE}?({PRICE}*{QTY}):{MIN_CHARGE})*{EX_RATE}" },
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
                        label: "", type: "grid", name: "Invoices", editable: false,
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
        ],
    },
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

                    if (data.isEmptyString(user.DEFAULT_COMPANY))
                        companyId = user.UserCompanies[0].COMPANY_ID;
                    else
                        companyId = user.DEFAULT_COMPANY;

                    data.prefetchGlobalVariables();
                }
            });
        }
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
    get lastActiveTabId() { return lastActiveTabId; }
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
    set lastActiveTabId(val) { lastActiveTabId = val; }
    set masterRecords(val) { masterRecords = val; }
    set frameworkHtmlElements(val) { frameworkHtmlElements = val; }
    set htmlElements(val) { htmlElements = val; }
    set indexPages(val) { indexPages = val; }
    set masterForms(val) { masterForms = val; }

    isEmptyString = function (str) {
        if (str == null)
            return true;
        if (typeof str != "string")
            return true;
        if (str.trim().length == 0)
            return true;

        return (!str || 0 === str.length);
    }

    formatDateTime = function (dataItem, format = "date") {
        if (format == "date")
            format = data.dateFormat;
        else if (format == "dateTime")
            format = data.dateTimeFormat;
        else if (format == "dateTimeLong")
            format = data.dateTimeLongFormat;

        return data.isEmptyString(dataItem) ? "" : kendo.toString(kendo.parseDate(dataItem), format);
    }

    prefetchGlobalVariables = function () {
        $.ajax({
            url: "../Admin/Account/GetUser",
            data: { userId: user.USER_ID },
            success: function (result) {
                user = result;
            }
        });

        $.ajax({
            url: "../Home/GetCurrencies",
            data: { companyId: this.companyId },
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
            data: { companyId: this.companyId },
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
            url: "../Home/GetCountriesView",
            success: function (result) {
                for (var i in result) {
                    result[i].COUNTRY_DESC_DISPLAY = result[i].COUNTRY_CODE + " - " + result[i].COUNTRY_DESC;
                }
                masterRecords.countries = result;
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

        $.ajax({
            url: "../Home/GetRecentCustomers",
            success: function (result) {
                for (var i in result) {
                    result[i].CUSTOMER_DESC = result[i].CUSTOMER_CODE + " - " + result[i].CUSTOMER_DESC + " - " + result[i].BRANCH_CODE;
                    result[i].CUSTOMER_CODE = result[i].CUSTOMER_CODE + "-" + result[i].BRANCH_CODE + "-" + result[i].SHORT_DESC;
                }
                masterRecords.customers = result;
            },
            complete: function () {
                masterRecords.lastUpdateTime = new Date();
            }
        });
    }
}