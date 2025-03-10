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
var hawbGoodDescLineCount = 9;
var hawbMarksNoLineCount = 12;
var hawbDimDisplayCount = 6;
var hblMarksNoLineCount = 13;
var masterRecords = {
    lastUpdateTime: null,
    region: [{ text: "NORTH AMERICA", value: "1" }, { text: "EUROPE", value: "2" }, { text: "ASIA", value: "3" }, { text: "OCEANIA", value: "4" }, { text: "AFRICA", value: "5" }, { text: "SOUTH AMERICA", value: "6" }, { text: "ANTARCTICA", value: "7" }],
    chargeQtyUnit: ["KGS", "SHP", "HAWB", "MAWB", "TRUCK", "PLT", "SETS", "SET", "MTH", "JOB", "CBM", "CTNS", "LBS", "PCS", "PACKAGES"],
    packageUnit: ["CTNS", "PLT", "PKG", "ROLLS", "PCS"],
    jobType: [{ text: "Consol", value: "C" }, { text: "Direct", value: "D" }],
    bookingType: [{ text: "Flat Pack", value: "F" }, { text: "GOH", value: "G" }, { text: "Flat Pack + GOH", value: "O" }],
    ediTerminal: ["HACTL", "AAT"],
    vwtsFactor: [6000, 6500, 7000, 9000],
    incoterm: ["FOB", "EXW", "FCA", "CPT", "CIP", "DAT", "DAP", "DDP", "FAS", "CFR", "CIF"],
    customerType: [{ text: "Customer" }, { text: "Agent" }, { text: "Carrier" }, { text: "Vendor" }],
    paymentTerms: [{ text: "Prepaid", value: "P" }, { text: "Collect", value: "C" }],
    printDateType: [{ text: "Flight Date", value: "F" }, { text: "Invoice Date", value: "I" }],
    showCharges: [{ text: "Prepaid", value: "P" }, { text: "Collect", value: "C" }, { text: "Prepaid + Collect", value: "PC" }],
    invoiceType: [{ text: "Invoice", value: "I" }, { text: "Debit Note", value: "D" }, { text: "Credit Note", value: "C" }],
    invoiceCategory: [{ text: "HAWB", value: "H" }, { text: "MAWB", value: "M" }, { text: "Job", value: "J" }, { text: "Lot", value: "L" }],
    seaInvoiceCategory: [{ text: "HB/L", value: "H" }, { text: "Job", value: "J" }, { text: "Container", value: "C" }],
    seaInvoiceFormat: [{ text: "Shipper Invoice", value: "I" }, { text: "Profit Share", value: "P" }],
    pvType: [{ text: "Payment Voucher", value: "P" }, { text: "Credit Voucher", value: "C" }],
    fltServiceType: [{ text: "Standard", value: "S" }, { text: "Express", value: "E" }, { text: "Deferred", value: "D" }, { text: "Hub", value: "H" }, { text: "Direct", value: "R" }],
    seaServiceType: ["CFS/CFS", "CY/CFS", "CY/CY", "CY/DOOR", "DOOR/CY", "CFS/CY", "DR/CFS"],
    toOrder: ["TO ORDER", "TO THE ORDER", "TO THIS ORDER"],
    printOnHbl: ["THIS SHIPMENT CONTAINS NO SOLID WOOD PACKING MATERIALS", "THIS SHIPMENT CONTAINS HEAT TREATED WOODEN PALLETS WHICH ARE COMPLIED THE STANDARD OF ISPM 15", "SHIPMENT CONTAINS REGULATED WOOD PACKAGING MATERIALS WITH IPPC LOGO MARKED", "PALLETS THAT HAVE TREATED AND MARKED IN COMPLIANCE WITH IPPC 15 STANDARD (WITH IPPC LOGO)"],
    equipCodes: {}, currencies: {}, sysCompanies: {}, airlines: {}, charges: {}, chargeTemplates: {}, countries: {}, ports: {}, customers: {}, groupCodes: {}, commodities: {},
    powerSearchSettings: {}, powerSearchTemplates: {}, menuItems: {}, seqTypes: {}, seaPorts: {}, carriers: {}, carrierContracts: {},
    vessels: {}, cargoUnits: {}, containerSize: {}, seaChargeQtyUnit: {}, 
};
var dropdownlistControls = ["airline", "ediTerminal", "region", "port", "seaPort", "country", "groupCode", "customer", "customerAddr", "customerAddrEditable", "pkgUnit", "charge", "chargeQtyUnit", "currency",
    "chargeTemplate", "vwtsFactor", "incoterm", "paymentTerms", "showCharges", "invoiceType", "invoiceCategory", "pvType", "fltServiceType", "carrierContract", "commodity",
    "unUsedBooking", "selectMawb", "selectHawb", "selectJob", "selectLot", "logFiles", "seqType", "sysCompany", "carrier", "vessel", "seaServiceType", "toOrder",
    "printOnHbl", "unUsedSeaBooking", "selectSeaJob", "selectHbl", "selectVoyage", "selectContainer", "transferSysCompany", "seaInvoiceCategory", "seaInvoiceFormat" ];

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
                            <span class="k-icon k-i-user" style="color: #C2C7D0; font-size: 18pt;"></span>
                        </div>
                        <div class="info">
                            <span class="d-block user-name handCursor" style="color: #C2C7D0; font-size: 1.2em;"></span>
                        </div>
                    </div>

                    <div class="form-inline">
                        <div class="input-group"> <!-- data-widget="sidebar-search" -->
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
                                        Dashboard
                                    </p>
                                </a>
                            </li>`;

        var defaultIcon = "fa-circle";
        menuItems.forEach(function (folder) {
            if (folder.TYPE == "folder") {
                let newBadge = `<span class="badge badge-danger">New</span>`;
                html += `
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-controller="${folder.CONTROLLER}" data-action="${folder.ACTION}" data-id="${folder.DATA_ID}" data-userType="${folder.USER_TYPE}">
                            <i class="nav-icon fa ${folder.ICON}"></i>
                            <p>
                                ${folder.DISPLAY_NAME}
                                <i class="${data.isEmptyString(folder.CONTROLLER) ? "fas fa-angle-left right" : ""}"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview" style="display: none;">`;
                        
                menuItems.forEach(function (item) {
                    if (item.TYPE == "menu" && item.PARENT_ID == folder.MODULE_ID && !data.isEmptyString(item.CONTROLLER) && item.ENABLE == "Y") {
                        html += `
                            <li class="nav-item">
                                <a href="javascript:void(0)" data-controller="${item.CONTROLLER}" data-action="${item.ACTION}" data-id="${item.DATA_ID}" data-userType="${folder.USER_TYPE}" class="nav-link">
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
        var gridHtml = gridName != null ? `<div name="${gridName}"></div>` : "";
        return `
            <div>
                <h3>${title}</h3>
                <div class="search-control row"></div>
                ${gridHtml}
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
    card: function (title = "", htmlContent = "", colWidth = 6, colorName = "primary", justifyContent = "left") {
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
                            <div class="row" style="justify-content: ${justifyContent};">
                                ${htmlContent}
                            </div>
                        </div>
                </div>
            </div>`;
    },
};

var indexPages = [
    {
        pageName: "country",
        id: "",
        title: "Country",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Country/UpdateCountry",
        deleteUrl: "../MasterRecord/Country/DeleteCountry",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Country Code / Name" },
        ],
        gridConfig: {
            gridName: "gridCountryIndex",
            dataSourceUrl: "../MasterRecord/Country/GridCountry_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "COUNTRY_CODE", title: "Code" },
                { field: "COUNTRY_DESC", title: "Name" },
                {
                    field: "REGION_CODE", title: "Region", template: function (dataItem) {
                        var region = data.masterRecords.region.filter(a => a.value == dataItem.REGION_CODE)[0];
                        return region == null ? "" : region.text;
                    }
                },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ COUNTRY_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${COUNTRY_CODE}"></i>`, width: 30 },
                { template: ({ COUNTRY_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${COUNTRY_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "COUNTRY_CODE",
            fields: [
                { name: "COUNTRY_CODE", label: "Country Code", readonly: "edit", required: "true" },
                { name: "COUNTRY_DESC", label: "Country Name", required: "true" },
                { name: "REGION_CODE", label: "Region", type: "region" },
            ],
            validation: {
                rules: {
                    countryCodeExistsRule: function (input) {
                        if (input.is("[name=COUNTRY_CODE]")) {
                            return !utils.isExistingCountryCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { countryCodeExistsRule: "Country code already exists in the database!", },
            },
        },
    },
    {
        pageName: "port",
        id: "",
        title: "Port",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Port/UpdatePort",
        deleteUrl: "../MasterRecord/Port/DeletePort",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Port Code / Name" },
        ],
        gridConfig: {
            gridName: "gridPortIndex",
            dataSourceUrl: "../MasterRecord/Port/GridPort_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "PORT_CODE", title: "Code" },
                { field: "PORT_DESC", title: "Name" },
                {
                    field: "COUNTRY_CODE", title: "Country", template: function (dataItem) {
                        var country = data.masterRecords.countries.filter(a => a.COUNTRY_CODE == dataItem.COUNTRY_CODE)[0];
                        return country == null ? "" : country.COUNTRY_DESC;
                    }
                },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ PORT_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${PORT_CODE}"></i>`, width: 30 },
                { template: ({ PORT_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${PORT_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "PORT_CODE",
            fields: [
                { name: "PORT_CODE", label: "Port Code", readonly: "edit", required: "true" },
                { name: "PORT_DESC", label: "Port Name", required: "true" },
                { name: "COUNTRY_CODE", label: "Country", type: "country", required: "true" },
            ],
            validation: {
                rules: {
                    portCodeExistsRule: function (input) {
                        if (input.is("[name=PORT_CODE]")) {
                            return !utils.isExistingPortCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { portCodeExistsRule: "Port code already exists in the database!", },
            },
        },
    },
    {
        pageName: "seaPort",
        id: "",
        title: "Sea Port",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/SeaPort/UpdateSeaPort",
        deleteUrl: "../MasterRecord/SeaPort/DeleteSeaPort",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Port Code / Name" },
        ],
        gridConfig: {
            gridName: "gridSeaPortIndex",
            dataSourceUrl: "../MasterRecord/SeaPort/GridSeaPort_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "PORT_CODE", title: "Code" },
                { field: "PORT_DESC", title: "Name" },
                {
                    field: "COUNTRY_CODE", title: "Country", template: function (dataItem) {
                        var country = data.masterRecords.countries.filter(a => a.COUNTRY_CODE == dataItem.COUNTRY_CODE)[0];
                        return country == null ? "" : country.COUNTRY_DESC;
                    }
                },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ PORT_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${PORT_CODE}"></i>`, width: 30 },
                { template: ({ PORT_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${PORT_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "PORT_CODE",
            fields: [
                { name: "PORT_CODE", label: "Port Code", readonly: "edit", required: "true" },
                { name: "PORT_DESC", label: "Port Name", required: "true" },
                { name: "COUNTRY_CODE", label: "Country", type: "country", required: "true" },
            ],
            validation: {
                rules: {
                    seaPortCodeExistsRule: function (input) {
                        if (input.is("[name=PORT_CODE]")) {
                            return !utils.isExistingSeaPortCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { seaPortCodeExistsRule: "Port code already exists in the database!", },
            },
        },
    },
    {
        pageName: "airline",
        id: "",
        title: "Airline",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Airline/UpdateAirline",
        deleteUrl: "../MasterRecord/Airline/DeleteAirline",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Airline Code / Name" },
        ],
        gridConfig: {
            gridName: "gridAirlineIndex",
            dataSourceUrl: "../MasterRecord/Airline/GridAirline_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "AIRLINE_CODE", title: "Code" },
                { field: "AIRLINE_DESC", title: "Name" },
                { field: "MAWB_PREFIX", title: "MAWB Prefix" },
                { field: "EDI_TERMINAL", title: "EDI Terminal" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ AIRLINE_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${AIRLINE_CODE}"></i>`, width: 30 },
                { template: ({ AIRLINE_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${AIRLINE_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "AIRLINE_CODE",
            fields: [
                { name: "AIRLINE_CODE", label: "Airline Code", readonly: "edit", required: "true" },
                { name: "AIRLINE_DESC", label: "Airline Name", required: "true" },
                { name: "MAWB_PREFIX", label: "MAWB Prefix", required: "true" },
                { name: "EDI_TERMINAL", label: "EDI Terminal", type: "ediTerminal", required: "true" },
                { name: "CUSTOMER", label: "Customer", type: "customerAddr" },
            ],
            validation: {
                rules: {
                    airlineCodeExistsRule: function (input) {
                        if (input.is("[name=AIRLINE_CODE]")) {
                            return !utils.isExistingAirlineCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { airlineCodeExistsRule: "Airline code already exists in the database!", },
            },
        },
    },
    {
        pageName: "carrier",
        id: "",
        title: "Carrier",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Carrier/UpdateCarrier",
        deleteUrl: "../MasterRecord/Carrier/DeleteCarrier",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Carrier Code / Name" },
        ],
        gridConfig: {
            gridName: "gridCarrierIndex",
            dataSourceUrl: "../MasterRecord/Carrier/GridCarrier_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "CARRIER_CODE", title: "Code" },
                { field: "CARRIER_DESC", title: "Name" },
                { field: "SCAC", title: "SCAC" },
                { field: "CW1_CODE", title: "CW1 Code" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ CARRIER_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${CARRIER_CODE}"></i>`, width: 30 },
                { template: ({ CARRIER_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${CARRIER_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "CARRIER_CODE",
            fields: [
                { name: "CARRIER_CODE", label: "Carrier Code", readonly: "edit", required: "true" },
                { name: "CARRIER_DESC", label: "Carrier Name", required: "true" },
                { name: "SCAC", label: "SCAC" },
                { name: "CW1_CODE", label: "CW1 Code" },
            ],
            validation: {
                rules: {
                    carrierCodeExistsRule: function (input) {
                        if (input.is("[name=CARRIER_CODE]")) {
                            return !utils.isExistingCarrierCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { carrierCodeExistsRule: "Carrier code already exists in the database!", },
            },
        },
    },
    {
        pageName: "vessel",
        id: "",
        title: "Vessel",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Vessel/UpdateVessel",
        deleteUrl: "../MasterRecord/Vessel/DeleteVessel",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Vessel Code / Name" },
        ],
        gridConfig: {
            gridName: "gridVesselIndex",
            dataSourceUrl: "../MasterRecord/Vessel/GridVessel_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "VES_CODE", title: "Code" },
                { field: "VES_DESC", title: "Name" },
                { field: "LLOYD_CODE", title: "Lloyd Code" },
                { field: "COUNTRY_FLAG", title: "Country Flag" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ VES_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${VES_CODE}"></i>`, width: 30 },
                { template: ({ VES_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${VES_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "VES_CODE",
            fields: [
                { name: "VES_CODE", label: "Vessel Code", readonly: "edit", required: "true" },
                { name: "VES_DESC", label: "Vessel Name", required: "true" },
                { name: "LLOYD_CODE", label: "Lloyd Code" },
                { name: "COUNTRY_FLAG", label: "Country Flag", type: "country" },
            ],
            validation: {
                rules: {
                    vesselCodeExistsRule: function (input) {
                        if (input.is("[name=VES_CODE]")) {
                            return !utils.isExistingVesselCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { vesselCodeExistsRule: "Vessel code already exists in the database!", },
            },
        },
    },
    {
        pageName: "currency",
        id: "",
        title: "Currency",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Currency/UpdateCurrency",
        deleteUrl: "../MasterRecord/Currency/DeleteCurrency",
        targetContainer: {},
        searchControls: [],
        gridConfig: {
            gridName: "gridCurrencyIndex",
            dataSourceUrl: "../MasterRecord/Currency/GridCurrency_Read",
            serverSorting: false,
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "CURR_CODE", title: "Code" },
                { field: "CURR_DESC", title: "Currency Name" },
                { field: "EX_RATE", title: "Exchange Rate" },
                { field: "DECIMAL_PLACE", title: "Decimal Places" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ CURR_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${CURR_CODE}"></i>`, width: 30 },
                { template: ({ CURR_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${CURR_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "CURR_CODE",
            fields: [
                { name: "CURR_CODE", label: "Currency Code", readonly: "edit", required: "true" },
                { name: "CURR_DESC", label: "Currency Name", required: "true" },
                { name: "EX_RATE", label: "Exchange Rate", type: "number", required: "true" },
                { name: "DECIMAL_PLACE", label: "Decimal Places", type: "numberInt", required: "true" },
            ],
            validation: {
                rules: {
                    currencyCodeExistsRule: function (input) {
                        if (input.is("[name=CURR_CODE]")) {
                            return !utils.isExistingCurrencyCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { currencyCodeExistsRule: "Currency already exists in the database!", },
            },
        },
    },
    {
        pageName: "charge",
        id: "",
        title: "Charge",
        additionalScript: "initMasterRecords",
        updateUrl: "../MasterRecord/Charge/UpdateCharge",
        deleteUrl: "../MasterRecord/Charge/DeleteCharge",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Charge Code / Description" },
        ],
        gridConfig: {
            gridName: "gridChargeIndex",
            dataSourceUrl: "../MasterRecord/Charge/GridCharge_Read",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "CHARGE_CODE", title: "Code" },
                { field: "CHARGE_DESC", title: "Description" },
                { field: "CHARGE_BASE", title: "Unit" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
                { field: "MODIFY_DATE", title: "Modify Date", template: ({ MODIFY_DATE }) => data.formatDateTime(MODIFY_DATE, "dateTimeLong") },
                { template: ({ CHARGE_CODE }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${CHARGE_CODE}"></i>`, width: 30 },
                { template: ({ CHARGE_CODE }) => `<i class="k-icon k-i-trash handCursor" data-attr="${CHARGE_CODE}"></i>`, width: 30 },
            ],
        },
        schema: {
            keyField: "CHARGE_CODE",
            fields: [
                { name: "CHARGE_CODE", label: "Charge Code", readonly: "edit", required: "true" },
                { name: "CHARGE_DESC", label: "Description", required: "true" },
                { name: "CHARGE_BASE", label: "Unit", type: "chargeQtyUnit" },
            ],
            validation: {
                rules: {
                    chargeCodeExistsRule: function (input) {
                        if (input.is("[name=CHARGE_CODE]")) {
                            return !utils.isExistingChargeCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: { chargeCodeExistsRule: "Charge code already exists in the database!", },
            },
        },
    },
    {
        pageName: "chargeTemplate",
        id: "",
        title: "Charge Template",
        additionalScript: "initMasterRecords",
        deleteUrl: "../MasterRecord/ChargeTemplate/DeleteChargeTemplate",
        targetContainer: {},
        searchControls: [
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Template name" },
        ],
        gridConfig: {
            gridName: "gridChargeTemplateIndex",
            dataSourceUrl: "../MasterRecord/ChargeTemplate/GridChargeTemplate_Read",
            linkIdPrefix: "chargeTemplate",
            linkTabTitle: "Template: ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "TEMPLATE_NAME", title: "Template name" },
                { field: "CHARGE_CODES", title: "Charges" },
                { template: ({ TEMPLATE_NAME }) => `<i class="k-icon k-i-pencil handCursor" data-attr="${TEMPLATE_NAME}"></i>`, width: 30 },
                { template: ({ TEMPLATE_NAME }) => `<i class="k-icon k-i-trash handCursor" data-attr="${TEMPLATE_NAME}"></i>`, width: 30 },
            ],
        },
    },
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
                { field: "CONSIGNEE_DESC", title: "Consignee" },
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
                { name: "batchPv", text: "Batch PV", iconClass: "k-icon k-i-copy", callbackFunction: "controllers.airPv.batchPv" },
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
        pageName: "airBatchPv",
        searchControls: [],
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
                { field: "MBL_NO", title: "MAWB" },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "airReport",
        id: "",
        title: "Air Reports",
        additionalScript: "initAirReport",
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode" },
            { label: "Date Range", type: "dateRange", name: "dateRange", daysBefore: 30 },
        ],
        groups: [
            {
                name: "shipmentReports",
                title: "Shipment Reports",
                colWidth: 4,
                controls: [
                    { label: "Booking Report", name: "bookingReport", icon: "k-i-excel" },
                    { label: "Booking DSR", name: "bookingDsr", icon: "k-i-excel" },
                    { label: "Daily Booking", name: "dailyBooking", icon: "k-i-pdf" },
                    { label: "Daily Booking For Overseas", name: "dailyBookingOverseas", icon: "k-i-excel" },
                    { label: "Shipment Report", name: "shipmentReport", icon: "k-i-pdf" },
                    { label: "Shipment Tracking Report", name: "shipmentTrackingReport", icon: "k-i-excel" },
                    { label: "Customize Shipment Report", name: "customizeShipmentReport", icon: "k-i-excel" },
                    { label: "Customer Tonnage Report", name: "customerTonnageReport", disabled: true },
                    { label: "Weekly Tonnage Report", name: "weeklyTonnageReport", disabled: true },
                ]
            },
            {
                name: "profitLossReports",
                title: "Profit & Loss Reports",
                colWidth: 4,
                controls: [
                    { label: "Job Profit & Loss", name: "jobProfitLoss", icon: "k-i-pdf" },
                    { label: "Other Job Profit & Loss", name: "otherJobProfitLoss", icon: "k-i-pdf" },
                    { label: "Other Job Summary Profit & Loss", name: "otherJobSummaryProfitLoss", icon: "k-i-excel" },
                    { label: "Lot Profit & Loss", name: "lotProfitLoss", icon: "k-i-pdf" },
                    { label: "Summary Profit & Loss", name: "summaryProfitLoss", icon: "k-i-pdf" },
                    { label: "Offshore/HKG Summary Profit & Loss", name: "offshoreSummaryProfitLoss", icon: "k-i-excel" },
                    { label: "Charter Flight Profit & Loss", name: "charterFlightProfitLoss", disabled: true },
                    { label: "Project Profit & Loss", name: "projectProfitLoss", disabled: true },
                    { label: "Consignee Profit & Loss", name: "consigneeProfitLoss", disabled: true },
                    { label: "MAWB Shipper Profit & Loss", name: "MawbShipperProfitLoss", disabled: true },
                    { label: "Draft Profit & Loss", name: "draftProfitLoss", disabled: true },
                ]
            },
            {
                name: "generalReports",
                title: "General Reports",
                colWidth: 4,
                controls: [
                    { label: "GOH Load Plan", name: "gohLoadplan", disabled: true },
                    { label: "Shipper List Report", name: "shipperListReport", disabled: true },
                    { label: "Weight Difference Report", name: "weightDifferenceReport", disabled: true },
                    { label: "X-Ray Report", name: "xrayReport", disabled: true },
                    { label: "Missing Invoice Report", name: "missingInvoiceReport", disabled: true },
                    { label: "Invoice Report", name: "invoiceReport", icon: "k-i-pdf" },
                    { label: "Invoice Report (Other Job)", name: "invoiceReportOtherJob", icon: "k-i-excel" },
                    { label: "Payment Voucher Report", name: "pvReport", icon: "k-i-excel" },
                    { label: "SHA / CN Reports", name: "shaReport", icon: "k-i-excel" },
                    { label: "RCSCFSLAX Reports", name: "RCSCFSLAX_Reports", icon: "k-i-excel" },
                ]
            },
            {
                name: "dailyReport",
                title: "Daily Status Reports & Documents",
                colWidth: 4,
                controls: [
                    { label: "Daily Status Report", name: "dailyStatusReport", disabled: true },
                    { label: "Auto Report", name: "autoReport", disabled: true },
                    { label: "CN-DN Breakdown Report", name: "cnDnBreakdownReport", disabled: true },
                    { label: "Cargo Release", name: "cargoRelease", disabled: true },
                    { label: "Certificate of Origin", name: "certificateOfOrigin", disabled: true },
                    { label: "Shipper Export Declaration", name: "exportDeclaration", disabled: true },
                ]
            },
        ],
    },
    {
        pageName: "airTransfer",
        id: "",
        title: "Internal Transfer (Air)",
        initScript: "controllers.airTransfer.initTransfer",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "frtMode", enable: false },
            { label: "Flight Date", type: "dateRange", name: "flightDateRange" },
            { label: "MAWB #", type: "selectMawb", name: "mawbNo" },
            { label: "HAWB #", type: "selectHawb", name: "hawbNo" },
            { label: "Transfer To", type: "transferSysCompany", name: "targetCompanyId" },
            { label: "Transfer To Offshore", type: "switch", name: "transferOffshore" },
            { label: "", type: "emptyBlock", name: "commandButtons" },
        ],
        gridConfig: {
            gridName: "gridAirTransferIndex",
            dataSourceUrl: "../Air/Transfer/GridTransferList_Read",
            linkIdPrefix: "",
            linkTabTitle: "",
            toolbar: [
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                {
                    template: function (dataItem) {
                        let disable = "";
                        if (dataItem.IS_TRANSFERRED == "Y")
                            disable = "disabled='disabled'";

                        return `<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md" hawbNo="${dataItem.HAWB_NO}" ${disable} />`;
                    },
                    headerTemplate: '<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md ckb-select-all" />',
                    width: 20
                },
                { field: "HAWB_NO", title: "HAWB#" },
                { field: "MAWB_NO", title: "MAWB#" },
                { field: "FLIGHT_DATE", title: "Flight Date", template: ({ FLIGHT_DATE }) => data.formatDateTime(FLIGHT_DATE, "dateTime") },
                { field: "ORIGIN_CODE", title: "Origin" },
                { field: "DEST_CODE", title: "Destination" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "IS_TRANSFERRED", title: "Transferred?" },
            ],
        },
    },
    {
        pageName: "seaVoyage",
        id: "",
        title: "Vessel Voyage",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "Departure Date", type: "dateRange", name: "departureDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Vessel / Voyage" },
        ],
        gridConfig: {
            gridName: "gridSeaVoyageIndex",
            dataSourceUrl: "../Sea/Voyage/GridVoyage_Read",
            linkIdPrefix: "seaVoyage",
            linkTabTitle: "Vessel / Voyage ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { title: "Vessel / Voyage", template: ({ VES_CODE, VES_DESC, VOYAGE }) => `${VES_CODE} / ${VES_DESC} / ${VOYAGE}`, attributes: { "class": "link-cell" } },
                { field: "LOADING_PORT", title: "Loading Port" },
                { field: "DISCHARGE_PORT", title: "Discharge Port" },
                { field: "LOADING_PORT_DATE", title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE, "date") },
                { field: "DISCHARGE_PORT_DATE", title: "Arrival Date", template: ({ DISCHARGE_PORT_DATE }) => data.formatDateTime(DISCHARGE_PORT_DATE, "date") },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "seaBooking",
        id: "",
        title: "Booking",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "Departure Date", type: "dateRange", name: "departureDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Booking# / Vessel / Voyage / Shipper / Consignee" },
        ],
        gridConfig: {
            gridName: "gridSeaBookingIndex",
            dataSourceUrl: "../Sea/Booking/GridBooking_Read",
            linkIdPrefix: "seaBooking",
            linkTabTitle: "Booking ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "BOOKING_NO", title: "Booking#", attributes: { "class": "link-cell" } },
                { title: "Vessel / Voyage", template: ({ VES_DESC, VOYAGE }) => `${VES_DESC} / ${VOYAGE}` },
                { field: "LOADING_PORT", title: "Loading Port" },
                { field: "DISCHARGE_PORT", title: "Discharge Port" },
                { field: "LOADING_PORT_DATE", title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE, "date") },
                { field: "DISCHARGE_PORT_DATE", title: "Arrival Date", template: ({ DISCHARGE_PORT_DATE }) => data.formatDateTime(DISCHARGE_PORT_DATE, "date") },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "seaHbl",
        id: "",
        title: "House Bill",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "Departure Date", type: "dateRange", name: "departureDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "HB/L# / Vessel / Voyage / Shipper / Consignee" },
        ],
        gridConfig: {
            gridName: "gridSeaHblIndex",
            dataSourceUrl: "../Sea/Hbl/GridHbl_Read",
            linkIdPrefix: "seaHbl",
            linkTabTitle: "HB/L ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "HBL_NO", title: "HB/L#", attributes: { "class": "link-cell" } },
                { field: "BOOKING_NO", title: "Booking#" },
                { title: "Vessel / Voyage", template: ({ VES_DESC, VOYAGE }) => `${VES_DESC} / ${VOYAGE}` },
                { field: "LOADING_PORT", title: "Loading Port" },
                { field: "DISCHARGE_PORT", title: "Discharge Port" },
                { field: "LOADING_PORT_DATE", title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE, "date") },
                { field: "DISCHARGE_PORT_DATE", title: "Arrival Date", template: ({ DISCHARGE_PORT_DATE }) => data.formatDateTime(DISCHARGE_PORT_DATE, "date") },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "seaSob",
        id: "",
        title: "Sample Ocean Bill",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "Departure Date", type: "dateRange", name: "departureDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "SOB# / HB/L# / Vessel / Voyage / Shipper / Consignee" },
        ],
        gridConfig: {
            gridName: "gridSeaSobIndex",
            dataSourceUrl: "../Sea/Sob/GridSob_Read",
            linkIdPrefix: "seaSob",
            linkTabTitle: "SOB# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "SOB_NO", title: "SOB#", attributes: { "class": "link-cell" } },
                { field: "HBL_NO", title: "HB/L#" },
                { field: "BOOKING_NO", title: "Booking#" },
                { title: "Vessel / Voyage", template: ({ VES_DESC, VOYAGE }) => `${VES_DESC} / ${VOYAGE}` },
                { field: "LOADING_PORT", title: "Loading Port" },
                { field: "DISCHARGE_PORT", title: "Discharge Port" },
                { field: "LOADING_PORT_DATE", title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE, "date") },
                { field: "DISCHARGE_PORT_DATE", title: "Arrival Date", template: ({ DISCHARGE_PORT_DATE }) => data.formatDateTime(DISCHARGE_PORT_DATE, "date") },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "seaInvoice",
        id: "",
        title: "Invoice",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "Invoice Date", type: "dateRange", name: "invoiceDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "Invoice# / Job# / Vessel Voyage / Customer" },
        ],
        gridConfig: {
            gridName: "gridSeaInvoiceIndex",
            dataSourceUrl: "../Sea/Invoice/GridInvoice_Read",
            linkIdPrefix: "seaInvoice",
            linkTabTitle: "Invoice# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "INV_NO", title: "Invoice#", attributes: { "class": "link-cell" } },
                { field: "JOB_NO", title: "Job#" },
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
                { title: "Vessel Voyage", template: ({ VES_CODE, VOYAGE }) => `${VES_CODE} / ${VOYAGE}` },
                { title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE, "date") },
                { field: "CUSTOMER_DESC", title: "Customer" },
                { field: "CURR_CODE", title: "Curr." },
                { field: "AMOUNT", title: "Amount" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "seaPv",
        id: "",
        title: "Payment Voucher",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "PV Date", type: "dateRange", name: "pvDateRange" },
            { label: "Search for", type: "searchInput", name: "searchInput", searchLabel: "PV# / Job# / Vessel Voyage / Customer" },
        ],
        gridConfig: {
            gridName: "gridSeaPvIndex",
            dataSourceUrl: "../Sea/Pv/GridPv_Read",
            linkIdPrefix: "seaPv",
            linkTabTitle: "PV# ",
            toolbar: [
                { name: "new", text: "New", iconClass: "k-icon k-i-file-add" },
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                { field: "PV_NO", title: "PV#", attributes: { "class": "link-cell" } },
                { field: "JOB_NO", title: "Job#" },
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
                { title: "Vessel Voyage", template: ({ VES_CODE, VOYAGE }) => `${VES_CODE} / ${VOYAGE}` },
                { title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE, "date") },
                { field: "CUSTOMER_DESC", title: "Customer" },
                { field: "CURR_CODE", title: "Curr." },
                { field: "AMOUNT", title: "Amount" },
                { field: "CREATE_USER", title: "Create User" },
                { field: "CREATE_DATE", title: "Create Date", template: ({ CREATE_DATE }) => data.formatDateTime(CREATE_DATE, "dateTimeLong") },
            ],
        },
    },
    {
        pageName: "seaReport",
        id: "",
        title: "Sea Reports",
        additionalScript: "initSeaReport",
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode" },
            { label: "Date Range", type: "dateRange", name: "dateRange", daysBefore: 30 },
        ],
        groups: [
            {
                name: "shipmentReports",
                title: "Shipment Reports",
                colWidth: 4,
                controls: [
                    { label: "Daily Booking", name: "dailyBooking", icon: "k-i-excel" },
                    { label: "Shipment Report", name: "shipmentReport", icon: "k-i-pdf" },
                    { label: "Customize Shipment Report", name: "customizeShipmentReport", icon: "k-i-excel" },
                    { label: "Carrier Report", name: "carrierReport", icon: "k-i-pdf" },
                ]
            },
            {
                name: "profitLossReports",
                title: "Profit & Loss Reports",
                colWidth: 4,
                controls: [
                    { label: "Job Profit & Loss", name: "jobProfitLoss", icon: "k-i-pdf" },
                    { label: "Summary Profit & Loss", name: "summaryProfitLoss", icon: "k-i-pdf" },
                    { label: "Summary Profit & Loss (Excel)", name: "summaryProfitLossXls", icon: "k-i-excel" },
                ]
            },
            {
                name: "generalReports",
                title: "General Reports",
                colWidth: 4,
                controls: [
                    { label: "Container Manifest", name: "containerManifest", icon: "k-i-pdf" },
                    { label: "Invoice Report", name: "invoiceReport", icon: "k-i-excel" },
                    { label: "Missing Invoice Report", name: "missingInvoiceReport", icon: "k-i-excel" },
                    { label: "Certificate of Origin", name: "certificateOrigin", icon: "k-i-pdf" },
                ]
            },
        ],
    },
    {
        pageName: "seaTransfer",
        id: "",
        title: "Internal Transfer (Sea)",
        initScript: "controllers.seaTransfer.initTransfer",
        targetContainer: {},
        searchControls: [
            { label: "Freight Mode", type: "buttonGroup", name: "frtMode", dataType: "seaFrtMode", enable: false },
            { label: "Departure Date", type: "dateRange", name: "departureDateRange" },
            { label: "HB/L#", type: "selectHbl", name: "hblNo" },
            { label: "Vessel", type: "selectVoyage", name: "VES_CODE" },
            { label: "Transfer To", type: "transferSysCompany", name: "targetCompanyId" },
            { label: "Transfer To Offshore", type: "switch", name: "transferOffshore" },
            { label: "", type: "emptyBlock", name: "commandButtons" },
        ],
        gridConfig: {
            gridName: "gridSeaTransferIndex",
            dataSourceUrl: "../Sea/Transfer/GridTransferList_Read",
            linkIdPrefix: "",
            linkTabTitle: "",
            toolbar: [
                { name: "excel", text: "Export Excel" },
                { name: "autoFitColumns", text: "Auto Width", iconClass: "k-icon k-i-max-width" },
            ],
            columns: [
                {
                    template: function (dataItem) {
                        let disable = "";
                        if (dataItem.IS_TRANSFERRED == "Y")
                            disable = "disabled='disabled'";

                        return `<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md" hblNo="${dataItem.HBL_NO}" ${disable} />`;
                    },
                    headerTemplate: '<input type="checkbox" class="k-checkbox k-checkbox-sm k-rounded-md ckb-select-all" />',
                    width: 20
                },
                { field: "HBL_NO", title: "HB/L#" },
                { field: "VES_DESC", title: "Vessel / Voyage", template: ({ VES_DESC, VOYAGE }) => `${VES_DESC} / ${VOYAGE}` },
                { field: "LOADING_PORT_DATE", title: "Departure Date", template: ({ LOADING_PORT_DATE }) => data.formatDateTime(LOADING_PORT_DATE) },
                { field: "LOADING_PORT", title: "POL" },
                { field: "DISCHARGE_PORT", title: "POD" },
                { field: "SHIPPER_DESC", title: "Shipper" },
                { field: "CONSIGNEE_DESC", title: "Consignee" },
                { field: "IS_TRANSFERRED", title: "Transferred?" },
            ],
        },
    },
    {
        pageName: "fileStation",
        id: "",
        title: "File Station",
        additionalScript: "initFileStation",
    },
    {
        pageName: "sysConsole",
        id: "",
        title: "System Console",
        additionalScript: "initSysConsole",
        groups: [
            {
                name: "userCompanies",
                title: "Users / User Group / Companies",
                colWidth: 4,
                controls: [
                    { label: "Users", name: "users" },
                    { label: "User Group", name: "userGroups" },
                    { label: "System Companies", name: "sysCompanies" },
                ]
            },
            {
                name: "systemSetting",
                title: "System Setting",
                colWidth: 4,
                controls: [
                    { label: "System Module", name: "sysModules" },
                    { label: "Sequence Number Setup", name: "seqNoSetup" },
                    { label: "System Parameters", name: "sysParas" },
                ]
            },
            {
                name: "emptyGroup",
                colWidth: 4,
            },
            {
                name: "serverStatus",
                title: "Server Status",
                colWidth: 4,
                controls: [
                    { label: "User Logs", name: "userLogs" },
                    { label: "System Logs", name: "sysLogs" },
                    { label: "Database", name: "database" },
                ]
            },
            {
                name: "tools",
                title: "Tools",
                colWidth: 4,
                controls: [
                    { label: "SQL Developer", name: "sqlDeveloper" },
                    { label: "Guid / Password / Encrypt", name: "stringTools" },
                    { label: "Get Sequence Numbers", name: "getSeqNo" },
                ]
            },
        ],
    },
    {
        pageName: "sysLogs",
        id: "",
        title: "System Logs",
        initScript: "controllers.sysConsole.initSysLogs",
        controls: [
            { label: "Log file", type: "logFiles", name: "logFiles", colWidth: 4 },
            { type: "emptyBlock", name: "logContent", colWidth: 12 },
        ],
    },
    {
        pageName: "getSeqNo",
        id: "",
        title: "Generate Sequence #",
        initScript: "controllers.sysConsole.initGetSeqNo",
        controls: [
            { label: "Sequence # Type", type: "seqType", name: "seqType", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Company ID", type: "sysCompany", name: "sysCompanyId", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Origin", type: "port", name: "origin", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Key Value", type: "text", name: "keyValue", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Destination", type: "port", name: "dest", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Flight Date", type: "date", name: "date", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Seq. number count", type: "numberInt", name: "seqNoCount", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "", text: "Generate Number", type: "button", name: "genSeqNo", colWidth: 4 },
            { type: "emptyBlock", colWidth: 8 },
            { label: "Sequence Number(s)", type: "textArea", name: "seqNoResult", readonly: true, colWidth: 4 },
        ],
    },
];

var masterForms = [
    {
        formName: "chargeTemplate",
        mode: "edit",   //create / edit
        title: "Charge Template:",
        readUrl: "../MasterRecord/ChargeTemplate/GetChargeTemplate",
        updateUrl: "../MasterRecord/ChargeTemplate/UpdateChargeTemplate",
        idField: "TEMPLATE_NAME",
        id: "",
        additionalScript: "initChargeTemplate",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
        ],
        schema: {
            fields: [
                { name: "TEMPLATE_NAME", readonly: "edit" },
                { name: "charges", required: "true" },
            ],
        },
        formTabs: [
            {
                title: "Charge Template",
                name: "mainInfo",
                formGroups: ["main"]
            },
        ],
        formGroups: [
            {
                name: "main",
                title: "Charge Template",
                colWidth: 10,
                formControls: [
                    { label: "Template Name", type: "text", name: "TEMPLATE_NAME", colWidth: 6 },
                    {
                        label: "", type: "grid", name: "Charges",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options) }
                            },
                            { title: "Price", field: "PRICE", width: 90 },
                            {
                                title: "Unit", field: "UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
                            },
                            { title: "Min. Charge", field: "MIN_AMOUNT", width: 90 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CHARGE_CODE: { validation: { required: true } },
                            CHARGE_DESC: { defaultValue: "" },
                            CURR_CODE: { validation: { required: true } },
                            PRICE: { type: "number", validation: { required: true } },
                            UNIT: { validation: { required: true } },
                            MIN_AMOUNT: { type: "number", validation: { required: true }, defaultValue: 1 },
                        },
                    },
                ]
            },
        ],
    },
    {
        formName: "customer",
        mode: "edit",   //create / edit
        title: "Customer:",
        readUrl: "../MasterRecord/Customer/GetCustomer",
        updateUrl: "../MasterRecord/Customer/UpdateCustomer",
        additionalScript: "initCustomer",
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
            validation: {
                rules: {
                    customerCodeExistsRule: function (input) {
                        if (input.is("[name=CUSTOMER_CODE]")) {
                            return !utils.isExistingCustomerCode(input.val());
                        } else {
                            return true;
                        }
                    }
                },
                messages: {
                    customerCodeExistsRule: "Customer code already exists in the database!",
                },
            },
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
                                editor: function (container, options) { controls.renderGridEditorCountry(container, options) }
                            },
                            {
                                title: "Port", field: "PORT_CODE", width: 90,
                                editor: function (container, options) { controls.renderGridEditorPort(container, options) }
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
                    { label: "Invoice Due Days ", type: "numberInt", name: "INV_DUE_DAYS", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
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
                                editor: function (container, options) { controls.renderGridEditorBranch(container, options) }
                            },
                            {
                                title: "Short Name", field: "SHORT_DESC", width: 160,
                                editor: function (container, options) { controls.renderGridEditorShortDesc(container, options) }
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
        voidUrl: "../Air/Mawb/VoidMawb",
        additionalScript: "initAirMawb",
        idField: "MAWB",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
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
                { name: "VWTS_FACTOR", required: "true", defaultValue: "6000" },
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
                colWidth: 6,
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
                colWidth: 6,
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
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE", colWidth: 6 },
                    { label: "Notify Party", type: "customerAddr", name: "NOTIFY", colWidth: 6 },
                ]
            },
            {
                name: "contactOthers",
                title: "Other Contact Information",
                colWidth: 6,
                formControls: [
                    { label: "Agent", type: "customerAddr", name: "AGENT", colWidth: 6 },
                    { label: "Issuing Carrier", type: "customerAddr", name: "ISSUE", colWidth: 6 },
                ]
            },
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    { label: "Currency", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 3 },
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "P_EX_RATE", targetControl: "grid_MawbChargesPrepaid" },
                    {
                        label: "", type: "grid", name: "MawbChargesPrepaid",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "P_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "C_EX_RATE", targetControl: "grid_MawbChargesCollect" },
                    {
                        label: "", type: "grid", name: "MawbChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "C_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                                editor: function (container, options) { controls.renderGridEditorPackageQtyUnit(container, options) }
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
                                editor: function (container, options) { controls.renderGridEditorLoadplanEquipHawbNos(container, options) }
                            },
                            {
                                title: "Equipment", field: "EQUIP_CODE", width: 250,
                                template: function (dataItem) { return `${dataItem.EQUIP_CODE} / ${dataItem.EQUIP_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorLoadplanEquips(container, options) }
                            },
                            { title: "Packages", field: "PACKAGE", width: 100 },
                            {
                                title: "Type", field: "PACKAGE_UNIT", width: 100,
                                editor: function (container, options) { controls.renderGridEditorPackageQtyUnit(container, options) }
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
        voidUrl: "../Air/Booking/VoidBooking",
        additionalScript: "initAirBooking",
        idField: "BOOKING_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
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
                { name: "VWTS_FACTOR", required: "true", defaultValue: "6000" },
                { name: "P_CURR_CODE", defaultValue: "currency" },
                { name: "C_CURR_CODE", defaultValue: "currency" },
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
                    { label: "Shipper", type: "customerAddr", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddr", name: "CONSIGNEE", colWidth: 6 },
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
                    { label: "Prepaid Curr.", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 6 },
                    { label: "Collect Curr.", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 6 },
                    { label: "Notify Party 1", type: "customerAddr", name: "NOTIFY1", colWidth: 6 },
                    { label: "Notify Party 2", type: "customerAddr", name: "NOTIFY2", colWidth: 6 },
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
                        toolbar: ["create", "cancel", { name: "pasteToPo", text: "Paste From Excel", iconClass: "k-icon k-i-clipboard-text", callbackFunction: "controllers.airBooking.pasteToPo" },],
                        columns: [
                            { title: "PO#", field: "PO_NO", width: 120 },
                            { title: "Style #", field: "STYLE_NO", width: 120 },
                            { title: "Material #", field: "MATERIAL_NO", width: 120 },
                            { title: "SKU", field: "SKU", width: 120 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorPackageQtyUnit(container, options) }
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
                            QTY: { type: "number" },
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
                        toolbar: ["create", "cancel", { name: "pasteToWarehouse", text: "Paste From Excel", iconClass: "k-icon k-i-clipboard-text", callbackFunction: "controllers.airBooking.pasteToWarehouse" },],
                        columns: [
                            { title: "Ctns", field: "CTNS", width: 90 },
                            {
                                title: "Type", field: "PACKAGE_TYPE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorPackageQtyUnit(container, options) }
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
                                editor: function (container, options) { controls.renderGridEditorCheckBox(container, options) },
                                template: function (dataItem) {
                                    if (dataItem.IS_PICKUP == "true" || dataItem.IS_PICKUP == "Y")
                                        return "Y";
                                    else
                                        return "N";
                                }
                            },
                            {
                                title: "Delivered", field: "IS_DEL", width: 60,
                                editor: function (container, options) { controls.renderGridEditorCheckBox(container, options) },
                                template: function (dataItem) {
                                    if (dataItem.IS_DEL == "true" || dataItem.IS_DEL == "Y")
                                        return "Y";
                                    else
                                        return "N";
                                }
                            },
                            {
                                title: "Damaged", field: "IS_DAM", width: 60,
                                editor: function (container, options) { controls.renderGridEditorCheckBox(container, options) },
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
                            SEQ: { type: "lineNo" },
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
                            CREATE_USER: { type: "string" },
                            MODIFY_USER: { type: "string" },
                            MODIFY_DATE: { defaultValue: new Date().toISOString() },
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
        voidUrl: "../Air/Hawb/VoidHawb",
        additionalScript: "initAirHawb",
        idField: "HAWB_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
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
                { name: "BOOKING_TYPE", hidden: "true", defaultValue: "F" },
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
                { name: "P_CURR_CODE", required: "true", defaultValue: "currency" },
                { name: "C_CURR_CODE", required: "true", defaultValue: "currency" },
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
                    { label: "Shipper", type: "customerAddrEditable", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddrEditable", name: "CONSIGNEE", colWidth: 6 },
                    { label: "Notify Party", type: "customerAddrEditable", name: "NOTIFY", colWidth: 6 },
                    { label: "Agent", type: "customerAddrEditable", name: "AGENT", colWidth: 6 },
                ]
            },
            {
                name: "otherContacts",
                title: "Other Contacts",
                collapse: true,
                colWidth: 8,
                formControls: [
                    { label: "Notify Party 1", type: "customerAddrEditable", name: "NOTIFY1", colWidth: 6 },
                    { label: "Notify Party 2", type: "customerAddrEditable", name: "NOTIFY2", colWidth: 6 },
                    { label: "Notify Party 3", type: "customerAddrEditable", name: "NOTIFY3", colWidth: 6 },
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
                                editor: function (container, options) { controls.renderGridEditorPackageQtyUnit(container, options) }
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "P_EX_RATE", targetControl: "grid_HawbChargesPrepaid" },
                    {
                        label: "", type: "grid", name: "HawbChargesPrepaid",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "P_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "C_EX_RATE", targetControl: "grid_HawbChargesCollect" },
                    {
                        label: "", type: "grid", name: "HawbChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "C_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                                editor: function (container, options) { controls.renderGridEditorPackageQtyUnit(container, options) }
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
                            QTY: { type: "number" },
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
        voidUrl: "../Air/Invoice/VoidInvoice",
        additionalScript: "initAirInvoice",
        idField: "INV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "AirInvoicePreview", text: "Print Invoice", icon: "file-txt", type: "pdf" },
                    { id: "AirInvoice", text: "Preview Invoice", icon: "file-report", type: "pdf" },
                    { id: "AirInvoice_RCSLAX", text: "Print Invoice (LAX)", icon: "file-txt", type: "pdf" },
                    { id: "AirInvoice_Wecan", text: "Print Invoice (Wecan)", icon: "file-txt", type: "pdf" },
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
                { name: "IS_VAT", hidden: "true", defaultValue: "N" },
                { name: "InvoiceHawbs", hidden: "true" },
                { name: "INV_DATE", required: "true", defaultValue: new Date() },
                { name: "INV_TYPE", required: "true", readonly: "edit" },
                { name: "INV_CATEGORY", required: "true" },
                { name: "SHOW_DATE_TYPE", required: "true" },
                { name: "FLIGHT_DATE", required: "true" },
                { name: "CURR_CODE", required: "true", defaultValue: "currency" },
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
                    { label: "Invoice #", type: "text", name: "INV_NO", colWidth: 4 },
                    { label: "Invoice Date", type: "date", name: "INV_DATE", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Invoice Type", type: "buttonGroup", name: "INV_TYPE", dataType: "invoiceType", colWidth: 4 },
                    { label: "Category", type: "buttonGroup", name: "INV_CATEGORY", dataType: "invoiceCategory", colWidth: 4 },
                    { label: "Print Date", type: "buttonGroup", name: "SHOW_DATE_TYPE", dataType: "printDateType", colWidth: 4 },
                    { label: "HAWB #", type: "selectHawb", name: "HAWB_NO", callbackFunction: "controllers.airInvoice.selectHawb", colWidth: 3 },
                    { label: "MAWB #", type: "selectMawb", name: "MAWB_NO", callbackFunction: "controllers.airInvoice.selectMawb", colWidth: 3 },
                    { label: "Job #", type: "selectJob", name: "JOB_NO", callbackFunction: "controllers.airInvoice.selectJob", colWidth: 3 },
                    { label: "Lot #", type: "selectLot", name: "LOT_NO", callbackFunction: "controllers.airInvoice.selectLot", colWidth: 3 },
                    { label: "Customer", type: "customerAddrEditable", name: "CUSTOMER", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 8 },
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "EX_RATE", targetControl: "grid_InvoiceItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "InvoiceItems",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
        voidUrl: "../Air/Pv/VoidPv",
        additionalScript: "initAirPv",
        idField: "PV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
            { type: "button", text: "Save as Invoice", icon: "track-changes", click: function () { controllers.airPv.saveAsInvoiceDialog() } },
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
                { name: "PV_DATE", required: "true", defaultValue: new Date() },
                { name: "PV_TYPE", required: "true", readonly: "edit" },
                { name: "PV_CATEGORY", required: "true" },
                { name: "FLIGHT_DATE", required: "true" },
                { name: "CURR_CODE", required: "true", defaultValue: "currency" },
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
                    { label: "Customer", type: "customerAddr", name: "CUSTOMER", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 8 },
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "EX_RATE", targetControl: "grid_PvItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "PvItems",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
        formName: "airBatchPv",
        mode: "create",   //create
        title: "Batch create PV",
        readUrl: "../Air/Pv/GetPv",
        updateUrl: "../Air/Pv/UpdateBatchPv",
        //voidUrl: "../Air/Pv/VoidPv",
        additionalScript: "initAirPv",
        idField: "PV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "IS_PRINTED", hidden: "true", defaultValue: "N" },
                { name: "IS_POSTED", hidden: "true", defaultValue: "N" },
                { name: "PV_DATE", required: "true", defaultValue: new Date() },
                { name: "PV_TYPE", required: "true" },
                { name: "CURR_CODE", required: "true", defaultValue: "currency" },
                { name: "CUSTOMER", required: "true" },
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
                    { label: "Pv Date", type: "date", name: "PV_DATE", colWidth: 4 },
                    { label: "Pv Type", type: "buttonGroup", name: "PV_TYPE", dataType: "pvType", colWidth: 4 },
                    { label: "Vendor Inv.#", type: "text", name: "VENDOR_INV_NO", colWidth: 4 },
                    { label: "HAWB #", type: "selectHawb", name: "HAWB_NO", callbackFunction: "controllers.airPv.selectHawb", colWidth: 4 },
                    { label: "Cr Invoice", type: "switch", name: "IS_CR_INVOICE", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Customer", type: "customerAddr", name: "CUSTOMER", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 8 },
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "EX_RATE", targetControl: "grid_PvItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "PvItems",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
        additionalScript: "initAirOtherJob",
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
                { name: "CURR_CODE", required: "true", defaultValue: "currency" },
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
                    { label: "Origin", type: "port", name: "ORIGIN_CODE", colWidth: 4 },
                    { label: "Destination", type: "port", name: "DEST_CODE", colWidth: 4 },
                    { label: "Master B/L #", type: "text", name: "MBL_NO", colWidth: 4 },
                    { label: "Container #", type: "text", name: "CONTAINER_NO", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Currency", type: "currency", name: "CURR_CODE", exRateName: "EX_RATE", colWidth: 4 },
                    { label: "Package", type: "numberInt", name: "PACKAGE", colWidth: 4 },
                    { label: "Package Unit", type: "pkgUnit", name: "PACKAGE_UNIT", colWidth: 4 },
                    { label: "G/Wts", type: "number", name: "GWTS", colWidth: 4 },
                    { label: "V/Wts", type: "number", name: "VWTS", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Remarks", type: "textArea", name: "REMARK", colWidth: 4 },
                ]
            },
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "P_EX_RATE", targetControl: "grid_OtherJobChargesPrepaid", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "OtherJobChargesPrepaid",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "P_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "C_EX_RATE", targetControl: "grid_OtherJobChargesCollect", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "OtherJobChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "C_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
    {
        formName: "seaVoyage",
        mode: "edit",   //create / edit
        title: "Vessel / Voyage:",
        readUrl: "../Sea/Voyage/GetVoyage",
        updateUrl: "../Sea/Voyage/UpdateVoyage",
        //additionalScript: "initAirOtherJob",
        idField: "VES_CODE,VOYAGE",
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
                { name: "VES_CODE", required: "true", readonly: "edit" },
                { name: "VOYAGE", required: "true", readonly: "edit" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "MainInfo",
                formGroups: ["vesselVoy", "loadingPort", "dischargePort"]
            },
        ],
        formGroups: [
            {
                name: "vesselVoy",
                title: "Vessel Information",
                colWidth: 12,
                formControls: [
                    { label: "Vessel", type: "vessel", name: "VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Carrier", type: "carrier", name: "CARRIER_CODE", colWidth: 4 },
                ]
            },
            {
                name: "loadingPort",
                title: "Loading Port",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "LoadingPorts",
                        columns: [
                            {
                                title: "Country", field: "COUNTRY_CODE", width: 180,
                                template: function (dataItem) { return data.isEmptyString(dataItem.COUNTRY_CODE) ? "" : data.masterRecords.countries.filter(a => a.COUNTRY_CODE == dataItem.COUNTRY_CODE)[0].COUNTRY_DESC_DISPLAY; },
                                editor: function (container, options) { controls.renderGridEditorCountry(container, options) }
                            },
                            {
                                title: "Port", field: "PORT_CODE", width: 180,
                                template: function (dataItem) { return data.isEmptyString(dataItem.PORT_CODE) ? "" : data.masterRecords.seaPorts.filter(a => a.PORT_CODE == dataItem.PORT_CODE)[0].PORT_DESC_DISPLAY; },
                                editor: function (container, options) { controls.renderGridEditorSeaPort(container, options) }
                            },
                            { title: "Arrival Date", field: "ARRIVAL_DATE", format: `{0: ${dateFormat}}`, width: 120 },
                            { title: "Departure Date", field: "DEPARTURE_DATE", format: `{0: ${dateFormat}}`, width: 120 },
                            { title: "Closing Date (CY)", field: "CY_CLOSING_DATE", format: `{0: ${dateFormat}}`, width: 120 },
                            { title: "Closing Date (CFS)", field: "CFS_CLOSING_DATE", format: `{0: ${dateFormat}}`, width: 120 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            COUNTRY_CODE: { validation: { required: true } },
                            PORT_CODE: { validation: { required: true } },
                            ORIGIN_DEST: { defaultValue: "O" },
                            ARRIVAL_DATE: { type: "date", validation: { required: true } },
                            DEPARTURE_DATE: { type: "date", validation: { required: true } },
                            CY_CLOSING_DATE: { type: "date" },
                            CFS_CLOSING_DATE: { type: "date" },
                        },
                    },
                ]
            },
            {
                name: "dischargePort",
                title: "Discharge Port",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "DischargePorts",
                        columns: [
                            {
                                title: "Country", field: "COUNTRY_CODE", width: 180,
                                template: function (dataItem) { return data.isEmptyString(dataItem.COUNTRY_CODE) ? "" : data.masterRecords.countries.filter(a => a.COUNTRY_CODE == dataItem.COUNTRY_CODE)[0].COUNTRY_DESC_DISPLAY; },
                                editor: function (container, options) { controls.renderGridEditorCountry(container, options) }
                            },
                            {
                                title: "Port", field: "PORT_CODE", width: 180,
                                template: function (dataItem) { return data.isEmptyString(dataItem.PORT_CODE) ? "" : data.masterRecords.seaPorts.filter(a => a.PORT_CODE == dataItem.PORT_CODE)[0].PORT_DESC_DISPLAY; },
                                editor: function (container, options) { controls.renderGridEditorSeaPort(container, options) }
                            },
                            { title: "Arrival Date", field: "ARRIVAL_DATE", format: `{0: ${dateFormat}}`, width: 120 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            COUNTRY_CODE: { validation: { required: true } },
                            PORT_CODE: { validation: { required: true } },
                            ORIGIN_DEST: { defaultValue: "D" },
                            ARRIVAL_DATE: { type: "date", validation: { required: true } },
                        },
                    },
                ]
            },
        ],
    },
    {
        formName: "seaBooking",
        mode: "edit",   //create / edit
        title: "Booking#",
        readUrl: "../Sea/Booking/GetBooking",
        updateUrl: "../Sea/Booking/UpdateBooking",
        additionalScript: "initSeaBooking",
        idField: "BOOKING_NO",
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
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "BOOKING_NO", readonly: "always", required: "true" },
                { name: "SHIPPER", required: "true" },
                { name: "CONSIGNEE", required: "true" },
                { name: "VES_CODE", required: "true" },
                { name: "VOYAGE", required: "true", readonly: "always" },
                { name: "INIT_VOYAGE", readonly: "always" },
                { name: "LOADING_PORT", required: "true" },
                { name: "DISCHARGE_PORT", required: "true" },
                { name: "LOADING_PORT_DATE", required: "true" },
                { name: "DISCHARGE_PORT_DATE", required: "true" },
                { name: "IS_CONSOL", required: "true", defaultValue: "Y" },
                { name: "FRT_TERM", required: "true" },
                { name: "SERVICE", required: "true" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "MainInfo",
                formGroups: ["main", "notifyParties"]
            },
            {
                title: "Cargo / PO",
                name: "cargoPo",
                formGroups: ["generalDesc", "cargo", "po"]
            }
        ],
        formGroups: [
            {
                name: "main",
                title: "Booking Information",
                colWidth: 12,
                formControls: [
                    { label: "Booking #", type: "text", name: "BOOKING_NO", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Shipper", type: "customerAddrEditable", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddrEditable", name: "CONSIGNEE", colWidth: 6 },
                    { label: "Notify Party", type: "customerAddrEditable", name: "NOTIFY", colWidth: 6 },
                    { label: "Agent", type: "customerAddrEditable", name: "AGENT", colWidth: 6 },
                    { label: "Init. Carriage", type: "selectVoyage", name: "INIT_VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "INIT_VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Vessel", type: "selectVoyage", name: "VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Place of Receipt", type: "seaPort", name: "RECEIPT_PORT", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Place of Loading", type: "seaPort", name: "LOADING_PORT", colWidth: 6 },
                    { label: "Departure Date", type: "date", name: "LOADING_PORT_DATE", colWidth: 3 },
                    { label: "Place of Discharge", type: "seaPort", name: "DISCHARGE_PORT", colWidth: 6 },
                    { label: "Arrival Date", type: "date", name: "DISCHARGE_PORT_DATE", colWidth: 3 },
                    { label: "Place of Delivery", type: "seaPort", name: "DELIVERY_PORT", colWidth: 6},
                    { label: "Arrival Date", type: "date", name: "DELIVERY_PORT_DATE", colWidth: 3 },
                    { label: "Final Destination", type: "seaPort", name: "DEST_PORT", colWidth: 6 },
                    { label: "Cargo Ready Date", type: "date", name: "CARGO_READY_DATE", colWidth: 3 },
                ]
            },
            {
                name: "notifyParties",
                title: "Notify Party",
                colWidth: 12,
                collapse: true,
                formControls: [
                    { label: "Notify Party 2", type: "customerAddrEditable", name: "NOTIFY2", colWidth: 6 },
                    { label: "Notify Party 3", type: "customerAddrEditable", name: "NOTIFY3", colWidth: 6 },
                ]
            },
            {
                name: "generalDesc",
                title: "General Description",
                colWidth: 12,
                formControls: [
                    { label: "Liner", type: "carrier", name: "LINER", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Coloader", type: "customer", name: "NOTIFY3", colWidth: 6 },
                    { label: "Delivery Agent", type: "customer", name: "DEL_AGENT", colWidth: 6 },
                    {
                        label: "S/O", type: "grid", name: "SeaBookingSos", colWidth: 6,
                        columns: [
                            { title: "S/O #", field: "SO_NO", width: 180 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            SO_NO: { validation: { required: true } },
                        },
                    },
                    { label: "Freight Payment", type: "paymentTerms", name: "FRT_TERM", colWidth: 6 },
                    { label: "Freight Payable At", type: "text", name: "FRT_PAYABLE_AT", colWidth: 6 },
                    { label: "Commodity", type: "text", name: "COMMODITY", colWidth: 6 },
                    { label: "Consol", type: "switch", name: "IS_CONSOL", colWidth: 6 },
                    { label: "Service", type: "seaServiceType", name: "SERVICE", colWidth: 4 },
                    { label: "20'", type: "numberInt", name: "C20F", colWidth: 2 },
                    { label: "40'", type: "numberInt", name: "C40F", colWidth: 2 },
                    { label: "40HQ", type: "numberInt", name: "C40HQ", colWidth: 2 },
                    { label: "45'", type: "numberInt", name: "C45F", colWidth: 2 },
                    { label: "CFS Close Date/Time", type: "dateTime", name: "CFS_CLOSING_DATE", colWidth: 6 },
                    { label: "CY Close Date/Time", type: "dateTime", name: "CY_CLOSING_DATE", colWidth: 6 },
                ]
            },
            {
                name: "cargo",
                title: "Cargo",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SeaBookingCargos",
                        columns: [
                            { title: "Marks #", field: "MARKS_NO", width: 200, editor: function (container, options) { controls.renderGridEditorTextArea(container, options) } },
                            { title: "Goods Description", field: "GOODS_DESC", width: 200, editor: function (container, options) { controls.renderGridEditorTextArea(container, options) } },
                            { title: "Qty", field: "QTY", width: 120 },
                            {
                                title: "Unit", field: "UNIT", width: 100,
                                editor: function (container, options) { controls.renderGridEditorCargoUnits(container, options) }
                            },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            MARKS_NO: { type: "string" },
                            GOODS_DESC: { type: "string" },
                            QTY: { type: "number" },
                            UNIT: { type: "string" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                        },
                    },
                ]
            },
            {
                name: "po",
                title: "PO Information",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SeaBookingPos",
                        columns: [
                            { title: "From", field: "CTN_FROM", width: 80 },
                            { title: "To", field: "CTN_TO", width: 80 },
                            { title: "PO #", field: "PO_NO", width: 120 },
                            { title: "SI # / Contract", field: "SI_NO", width: 120 },
                            { title: "Item #", field: "ITEM_NO", width: 120 },
                            { title: "Style #", field: "STYLE_NO", width: 120 },
                            { title: "Qty", field: "QTY", width: 120 },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120, editor: function (container, options) { controls.renderGridEditorNumericTextBox(container, options, 3) } },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CTN_FROM: { type: "number" },
                            CTN_TO: { type: "number" },
                            PO_NO: { type: "string" },
                            SI_NO: { type: "string" },
                            ITEM_NO: { type: "string" },
                            STYLE_NO: { type: "string" },
                            QTY: { type: "number" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                        },
                    },
                ]
            },
        ],
    },
    {
        formName: "seaHbl",
        mode: "edit",   //create / edit
        title: "HB/L#",
        readUrl: "../Sea/Hbl/GetHbl",
        updateUrl: "../Sea/Hbl/UpdateHbl",
        additionalScript: "initSeaHbl",
        idField: "HBL_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "previewHbl", text: "Preview HBL", icon: "file-report", type: "pdf" },
                    { id: "previewHblA4", text: "Preview HBL (A4)", icon: "file-report", type: "pdf" },
                    { id: "printHbl", text: "Print HBL", icon: "file-report", type: "pdf" },
                    { id: "printHblA4", text: "Print HBL (A4 - Original)", icon: "file-report", type: "pdf" },
                    { id: "printHblA4Copy", text: "Print HBL (A4 - Copy)", icon: "file-report", type: "pdf" },
                    { id: "printFcr", text: "Print FCR", icon: "file-report", type: "pdf" },
                    { id: "printUS", text: "Print US Original", icon: "file-report", type: "pdf" },
                    { id: "printUSCopy", text: "Print US Copy", icon: "file-report", type: "pdf" },
                ]
            },
            {
                type: "dropDownButton", text: "SOB", icon: "file-txt", menuButtons: [
                    { id: "createSob", text: "Create SOB", icon: "file-add" },
                    { id: "createJobSob", text: "Create SOB by Job", icon: "file-add" },
                ]
            },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "IS_MASTER_HBL", hidden: "true", defaultValue: "N" },
                { name: "HBL_NO", readonly: "always", required: "true" },
                { name: "BOOKING_NO", readonly: "edit", required: "true" },
                { name: "JOB_NO", readonly: "edit", required: "true" },
                { name: "SHIPPER", required: "true" },
                { name: "CONSIGNEE", required: "true" },
                { name: "VES_CODE", required: "true" },
                { name: "VOYAGE", required: "true", readonly: "always" },
                { name: "INIT_VOYAGE", readonly: "always" },
                { name: "LOADING_PORT", required: "true" },
                { name: "DISCHARGE_PORT", required: "true" },
                { name: "LOADING_PORT_DATE", required: "true" },
                { name: "DISCHARGE_PORT_DATE", required: "true" },
                { name: "IS_CONSOL", required: "true", defaultValue: "Y" },
                { name: "FRT_TERM", required: "true" },
                { name: "SERVICE", required: "true" },
                { name: "P_CURR_CODE", required: "true", defaultValue: "currency" },
                { name: "C_CURR_CODE", required: "true", defaultValue: "currency" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "mainInfo",
                formGroups: ["mainInfo"]
            },
            {
                title: "Other Info.",
                name: "otherInfo",
                formGroups: ["generalDesc", "otherInfo"]
            },
            {
                title: "Container / Cargo / PO",
                name: "cargoPo",
                formGroups: ["container", "cargo", "po"]
            },
            {
                title: "Charges",
                name: "charges",
                formGroups: ["prepaidCharges", "collectCharges"]
            },
            {
                title: "Docs / Status",
                name: "docStatus",
                formGroups: ["doc", "status"]
            },
        ],
        formGroups: [
            {
                name: "mainInfo",
                title: "Hbl Information",
                colWidth: 12,
                formControls: [
                    { label: "HB/L #", type: "text", name: "HBL_NO", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Booking #", type: "unUsedSeaBooking", name: "BOOKING_NO", colWidth: 6 },                    
                    { label: "MB/L #", type: "text", name: "MASTER_HBL_NO", colWidth: 6 },
                    { label: "Job #", type: "selectSeaJob", name: "JOB_NO", colWidth: 6 },
                    { label: "AMS MB/L #", type: "text", name: "AMS_MASTER_HBL_NO", colWidth: 6 },
                    { label: "Contract #", type: "switch", name: "CONTRACT", type2: "carrierContract", name2: "CONTRACT_NO", colWidth: 6 },
                    { label: "To Order", type: "toOrder", name: "TO_ORDER_FLAG", type2: "text", name2: "TO_ORDER", colWidth: 6 },
                    { label: "Shipper", type: "customerAddrEditable", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddrEditable", name: "CONSIGNEE", colWidth: 6 },
                    { label: "Notify Party", type: "customerAddrEditable", name: "NOTIFY", colWidth: 6 },
                    { label: "Agent", type: "customerAddrEditable", name: "AGENT", colWidth: 6 },
                    { label: "Notify Party 2", type: "customerAddrEditable", name: "NOTIFY2", colWidth: 6 },
                    { label: "Notify Party 3", type: "customerAddrEditable", name: "NOTIFY3", colWidth: 6 },
                    { label: "Init. Carriage", type: "selectVoyage", name: "INIT_VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "INIT_VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Vessel", type: "selectVoyage", name: "VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Place of Receipt", type: "seaPort", name: "RECEIPT_PORT", colWidth: 6 },
                    { label: "Departure Date", type: "date", name: "RECEIPT_PORT_DATE", colWidth: 3 },
                    { label: "Place of Loading", type: "seaPort", name: "LOADING_PORT", colWidth: 6 },
                    { label: "Departure Date", type: "date", name: "LOADING_PORT_DATE", colWidth: 3 },
                    { label: "Place of Discharge", type: "seaPort", name: "DISCHARGE_PORT", colWidth: 6 },
                    { label: "Arrival Date", type: "date", name: "DISCHARGE_PORT_DATE", colWidth: 3 },
                    { label: "Place of Delivery", type: "seaPort", name: "DELIVERY_PORT", colWidth: 6 },
                    { label: "Arrival Date", type: "date", name: "DELIVERY_PORT_DATE", colWidth: 3 },
                    { label: "Final Destination", type: "seaPort", name: "DEST_PORT", colWidth: 6 },
                    { label: "Last Foreign Port", type: "seaPort", name: "LAST_FOREIGN_PORT", colWidth: 3 },
                    { label: "ISF Date", type: "date", name: "ISF_DATE", colWidth: 4 },
                    { label: "Container Gate in Date", type: "date", name: "CNTR_GATE_IN_DATE", colWidth: 4 },
                    { label: "VGM Date", type: "date", name: "VGM_DATE", colWidth: 4 },
                ]
            },
            {
                name: "generalDesc",
                title: "General Description",
                colWidth: 12,
                formControls: [
                    { label: "Liner", type: "carrier", name: "LINER", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Coloader", type: "customer", name: "NOTIFY3", colWidth: 6 },
                    { label: "Delivery Agent", type: "customer", name: "DEL_AGENT", colWidth: 6 },
                    {
                        label: "S/O", type: "grid", name: "SeaHblSos", colWidth: 6,
                        columns: [
                            { title: "S/O #", field: "SO_NO", width: 180 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            SO_NO: { validation: { required: true } },
                        },
                    },
                    { label: "Freight Payment", type: "paymentTerms", name: "FRT_TERM", colWidth: 6 },
                    { label: "Freight Payable At", type: "text", name: "FRT_PAYABLE_AT", colWidth: 6 },
                    { label: "Issue Place", type: "text", name: "ISSUE_PLACE", colWidth: 6 },
                    { label: "Issue Date", type: "date", name: "ISSUE_DATE", colWidth: 6 },
                    { label: "As Agent For", type: "text", name: "AS_AGENT_FOR", colWidth: 6 },
                    { label: "HBL By", type: "text", name: "HBL_BY", colWidth: 6 },
                    { label: "Commodity", type: "text", name: "COMMODITY", colWidth: 6 },
                    { label: "Cargo Rcvd Date", type: "date", name: "CARGO_REC_DATE", colWidth: 6 },
                    { label: "Service", type: "seaServiceType", name: "SERVICE", colWidth: 2 },
                    { label: "Consol'", type: "switch", name: "IS_CONSOL", colWidth: 2 },
                    { label: "20'", type: "numberInt", name: "C20F", colWidth: 2 },
                    { label: "40'", type: "numberInt", name: "C40F", colWidth: 2 },
                    { label: "40HQ", type: "numberInt", name: "C40HQ", colWidth: 2 },
                    { label: "45'", type: "numberInt", name: "C45F", colWidth: 2 },
                    { label: "CFS Close Date/Time", type: "dateTime", name: "CFS_CLOSING_DATE", colWidth: 6 },
                    { label: "CY Close Date/Time", type: "dateTime", name: "CY_CLOSING_DATE", colWidth: 6 },
                    { label: "Prepaid Curr.", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 6 },
                    { label: "Collect Curr.", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 6 },
                    { label: "Incoterm", type: "incoterm", name: "INCOTERM", colWidth: 6 },
                    { label: "Port", type: "seaPort", name: "INCOTERM_PORT", colWidth: 6 },
                ]
            },
            {
                name: "otherInfo",
                title: "Other Information",
                colWidth: 12,
                formControls: [
                    { label: "Print on HBL", type: "printOnHbl", name: "PRINT_ON_HBL", colWidth: 6 },
                    { label: "Country of Origin", type: "text", name: "COUNTRY_OF_ORIGIN", colWidth: 6 },
                    { label: "Entry Word Line 1", type: "text", name: "ENTRY_WORD1", colWidth: 6 },
                    { label: "Entry Word Line 2", type: "text", name: "ENTRY_WORD2", colWidth: 6 },
                    { label: "Remarks", type: "textArea", name: "REMARKS", readonly: true, colWidth: 6 },
                    { label: "Special Instruction", type: "textArea", name: "SPECIAL_INST", readonly: true, colWidth: 6 },
                    { label: "Print Remarks", type: "switch", name: "PRINT_REMARKS", colWidth: 6 },
                    { label: "Print Special Instruction", type: "switch", name: "PRINT_SPECIAL_INST", colWidth: 6 },
                    { label: "OTI License #", type2: "text", name2: "FMC_NO", type: "switch", name: "PRINT_FMC_NO", colWidth: 6 },
                    { label: "IT #", type: "text", name: "IT_NO", colWidth: 6 },
                    { label: "Submitted Date", type: "date", name: "SUBMIT_DATE", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Approved At", type: "seaPort", name: "APPROVED_AT", colWidth: 6 },
                    { label: "Pay At", type: "country", name: "PAY_COUNTRY", colWidth: 6 },
                ]
            },
            {
                name: "container",
                title: "Container",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SeaHblContainers",
                        columns: [
                            { title: "Container #", field: "CONTAINER_NO", width: 120 },
                            { title: "Seal", field: "SEAL", width: 80 },
                            { title: "Size", field: "CONTAINER_SIZE", width: 100, editor: function (container, options) { controls.renderGridEditorContainerSize(container, options) } },
                            { title: "Package", field: "PACKAGE", width: 120 },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120, editor: function (container, options) { controls.renderGridEditorNumericTextBox(container, options, 3) } },
                            { title: "S/O #", field: "SO_NO", width: 120 },
                            { title: "Service", field: "SERVICE", width: 120, editor: function (container, options) { controls.renderGridEditorService(container, options) } },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CONTAINER_NO: { type: "string" },
                            SEAL: { type: "string" },
                            CONTAINER_SIZE: { type: "string" },
                            PACKAGE: { type: "number" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                            SO_NO: { type: "string" },
                            SERVICE: { type: "string" },
                        },
                    },
                ]
            },
            {
                name: "cargo",
                title: "Cargo",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SeaHblCargos",
                        columns: [
                            { title: "Container #", field: "CONTAINER_NO", width: 120, editor: function (container, options) { controls.renderGridEditorHblContainerNo(container, options) } },
                            { title: "Marks #", field: "MARKS_NO", width: 200, editor: function (container, options) { controls.renderGridEditorTextArea(container, options) } },
                            { title: "Goods Description", field: "GOODS_DESC", width: 200, editor: function (container, options) { controls.renderGridEditorTextArea(container, options) } },
                            { title: "Qty", field: "QTY", width: 120 },
                            {
                                title: "Unit", field: "UNIT", width: 100,
                                editor: function (container, options) { controls.renderGridEditorCargoUnits(container, options) }
                            },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120, editor: function (container, options) { controls.renderGridEditorNumericTextBox(container, options, 3) } },
                            { title: "Commodity", field: "COMMODITY", width: 180, editor: function (container, options) { controls.renderGridEditorCommodities(container, options) } },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            MARKS_NO: { type: "string" },
                            GOODS_DESC: { type: "string" },
                            QTY: { type: "number" },
                            UNIT: { type: "string" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                            COMMODITY: { type: "string" },
                        },
                    },
                ]
            },
            {
                name: "po",
                title: "PO Information",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SeaHblPos",
                        columns: [
                            { title: "From", field: "CTN_FROM", width: 80 },
                            { title: "To", field: "CTN_TO", width: 80 },
                            { title: "PO #", field: "PO_NO", width: 120 },
                            { title: "SI # / Contract", field: "SI_NO", width: 120 },
                            { title: "Item #", field: "ITEM_NO", width: 120 },
                            { title: "Style #", field: "STYLE_NO", width: 120 },
                            { title: "Qty", field: "QTY", width: 120 },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120, editor: function (container, options) { controls.renderGridEditorNumericTextBox(container, options, 3) } },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CTN_FROM: { type: "number" },
                            CTN_TO: { type: "number" },
                            PO_NO: { type: "string" },
                            SI_NO: { type: "string" },
                            ITEM_NO: { type: "string" },
                            STYLE_NO: { type: "string" },
                            QTY: { type: "number" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                        },
                    },
                ]
            },
            {
                name: "prepaidCharges",
                title: "Prepaid Charges",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SeaHblChargesPrepaid",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "P_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorSeaChargeQtyUnit(container, options) }
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
                    {
                        label: "", type: "grid", name: "SeaHblChargesCollect",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "C_EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorSeaChargeQtyUnit(container, options) }
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
                name: "doc",
                title: "Documents",
                colWidth: 12,
                formControls: [
                    {
                        label: "",
                        type: "grid",
                        name: "SeaHblDocs",
                        deleteCallbackFunction: "controllers.seaHbl.gridHblDocsDelete",
                        toolbar: [
                            { name: "uploadFile", text: "Upload File", iconClass: "k-icon k-i-file-add", callbackFunction: "controllers.seaHbl.uploadFiles" },
                            { name: "save", callbackFunction: "controllers.seaHbl.gridHawbDocsConfirmSaveChanges" },
                            { name: "cancel" },
                        ],
                        columns: [
                            //{ title: "Document Name", field: "DOC_NAME", attributes: { "class": "link-cell" }, width: 220 },
                            { title: "", template: (dataItem) => `<i class="k-icon k-i-download handCursor" onclick="controllers.seaHbl.downloadFile(this, '${dataItem.DOC_ID}')"></i>`, width: 24 },
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
                        label: "", type: "grid", name: "SeaHblStatuses",
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
        ],
    },
    {
        formName: "seaSob",
        mode: "edit",   //create / edit
        title: "SOB#",
        readUrl: "../Sea/Sob/GetSob",
        updateUrl: "../Sea/Sob/UpdateSob",
        additionalScript: "initSeaSob",
        idField: "SOB_NO",
        id: "",
        toolbar: [
            //{ type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            //{ type: "button", text: "Save New", icon: "copy" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "printSob", text: "Print SOB", icon: "file-report", type: "pdf" },
                    { id: "printAttachedList", text: "Attached List", icon: "file-report", type: "pdf" },
                ]
            },
        ],
        schema: {
            fields: [
                { name: "COMPANY_ID", hidden: "true" },
                { name: "FRT_MODE", hidden: "true" },
                { name: "IS_VOIDED", hidden: "true", defaultValue: "N" },
                { name: "IS_MASTER_HBL", hidden: "true", defaultValue: "N" },
                { name: "SOB_NO", readonly: "always", required: "true" },
                { name: "HBL_NO", readonly: "always", required: "true" },
                { name: "BOOKING_NO", readonly: "always" },
                { name: "JOB_NO", readonly: "always", required: "true" },
                { name: "SHIPPER", required: "true" },
                { name: "CONSIGNEE", required: "true" },
                { name: "VES_CODE", required: "true" },
                { name: "VOYAGE", required: "true", readonly: "always" },
                { name: "INIT_VOYAGE", readonly: "always" },
                { name: "LOADING_PORT", required: "true" },
                { name: "DISCHARGE_PORT", required: "true" },
                { name: "LOADING_PORT_DATE", required: "true" },
                { name: "DISCHARGE_PORT_DATE", required: "true" },
                { name: "IS_CONSOL", required: "true", defaultValue: "Y" },
                { name: "PRINT_REMARKS", required: "true", defaultValue: "Y" },
                { name: "PRINT_FMC_NO", required: "true", defaultValue: "Y" },
                { name: "PRINT_SPECIAL_INST", required: "true", defaultValue: "Y" },
                { name: "FRT_TERM", required: "true" },
                { name: "SERVICE", required: "true" },
                { name: "P_CURR_CODE", required: "true", defaultValue: "currency" },
                { name: "C_CURR_CODE", required: "true", defaultValue: "currency" },
            ],
        },
        formTabs: [
            {
                title: "Main Info.",
                name: "mainInfo",
                formGroups: ["mainInfo"]
            },
            {
                title: "Other Info.",
                name: "otherInfo",
                formGroups: ["generalDesc", "otherInfo"]
            },
            {
                title: "Container / Cargo",
                name: "cargoPo",
                formGroups: ["container", "cargo" ]
            },
        ],
        formGroups: [
            {
                name: "mainInfo",
                title: "Sob Information",
                colWidth: 12,
                formControls: [
                    { label: "SOB #", type: "text", name: "SOB_NO", colWidth: 6 },
                    { label: "HB/L #", type: "text", name: "HBL_NO", colWidth: 6 },
                    { label: "Booking #", type: "text", name: "BOOKING_NO", colWidth: 6 },
                    { label: "MB/L #", type: "text", name: "MASTER_SOB_NO", colWidth: 6 },
                    { label: "Job #", type: "text", name: "JOB_NO", colWidth: 6 },
                    { label: "To Order", type: "toOrder", name: "TO_ORDER_FLAG", type2: "text", name2: "TO_ORDER", colWidth: 6 },
                    { label: "Shipper", type: "customerAddrEditable", name: "SHIPPER", colWidth: 6 },
                    { label: "Consignee", type: "customerAddrEditable", name: "CONSIGNEE", colWidth: 6 },
                    { label: "Notify Party", type: "customerAddrEditable", name: "NOTIFY", colWidth: 6 },
                    { label: "Agent", type: "customerAddrEditable", name: "AGENT", colWidth: 6 },
                    { label: "Notify Party 2", type: "customerAddrEditable", name: "NOTIFY2", colWidth: 6 },
                    { label: "Notify Party 3", type: "customerAddrEditable", name: "NOTIFY3", colWidth: 6 },
                    { label: "Init. Carriage", type: "vessel", name: "INIT_VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "INIT_VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Vessel", type: "vessel", name: "VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "VOYAGE", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Place of Receipt", type: "seaPort", name: "RECEIPT_PORT", colWidth: 6 },
                    { label: "Departure Date", type: "date", name: "RECEIPT_PORT_DATE", colWidth: 3 },
                    { label: "Place of Loading", type: "seaPort", name: "LOADING_PORT", colWidth: 6 },
                    { label: "Departure Date", type: "date", name: "LOADING_PORT_DATE", colWidth: 3 },
                    { label: "Place of Discharge", type: "seaPort", name: "DISCHARGE_PORT", colWidth: 6 },
                    { label: "Arrival Date", type: "date", name: "DISCHARGE_PORT_DATE", colWidth: 3 },
                    { label: "Place of Delivery", type: "seaPort", name: "DELIVERY_PORT", colWidth: 6 },
                    { label: "Arrival Date", type: "date", name: "DELIVERY_PORT_DATE", colWidth: 3 },
                    { label: "Final Destination", type: "seaPort", name: "DEST_PORT", colWidth: 6 },
                ]
            },
            {
                name: "generalDesc",
                title: "General Description",
                colWidth: 12,
                formControls: [
                    { label: "Liner", type: "carrier", name: "LINER", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Coloader", type: "customer", name: "NOTIFY3", colWidth: 6 },
                    { label: "Delivery Agent", type: "customer", name: "DEL_AGENT", colWidth: 6 },
                    {
                        label: "S/O", type: "grid", name: "SobSos", colWidth: 6,
                        columns: [
                            { title: "S/O #", field: "SO_NO", width: 180 },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            SO_NO: { validation: { required: true } },
                        },
                    },
                    { label: "Freight Payment", type: "paymentTerms", name: "FRT_TERM", colWidth: 6 },
                    { label: "Freight Payable At", type: "text", name: "FRT_PAYABLE_AT", colWidth: 6 },
                    { label: "Issue Place", type: "text", name: "ISSUE_PLACE", colWidth: 6 },
                    { label: "Issue Date", type: "date", name: "ISSUE_DATE", colWidth: 6 },
                    { label: "As Agent For", type: "text", name: "AS_AGENT_FOR", colWidth: 6 },
                    { label: "HBL By", type: "text", name: "HBL_BY", colWidth: 6 },
                    { label: "Cargo Rcvd Date", type: "date", name: "CARGO_REC_DATE", colWidth: 6 },
                    { label: "Service", type: "seaServiceType", name: "SERVICE", colWidth: 6 },
                    { label: "Consol'", type: "switch", name: "IS_CONSOL", colWidth: 2 },
                    { label: "20'", type: "numberInt", name: "C20F", colWidth: 2 },
                    { label: "40'", type: "numberInt", name: "C40F", colWidth: 2 },
                    { label: "40HQ", type: "numberInt", name: "C40HQ", colWidth: 2 },
                    { label: "45'", type: "numberInt", name: "C45F", colWidth: 2 },
                    { label: "", type: "emptyBlock", colWidth: 2 },
                    { label: "CFS Close Date/Time", type: "dateTime", name: "CFS_CLOSING_DATE", colWidth: 6 },
                    { label: "CY Close Date/Time", type: "dateTime", name: "CY_CLOSING_DATE", colWidth: 6 },
                    { label: "Prepaid Curr.", type: "currency", name: "P_CURR_CODE", exRateName: "P_EX_RATE", colWidth: 6 },
                    { label: "Collect Curr.", type: "currency", name: "C_CURR_CODE", exRateName: "C_EX_RATE", colWidth: 6 },
                ]
            },
            {
                name: "otherInfo",
                title: "Other Information",
                colWidth: 12,
                formControls: [
                    { label: "Entry Word Line 1", type: "text", name: "ENTRY_WORD1", colWidth: 6 },
                    { label: "Entry Word Line 2", type: "text", name: "ENTRY_WORD2", colWidth: 6 },
                    { label: "Country of Origin", type: "text", name: "COUNTRY_OF_ORIGIN", colWidth: 6 },
                    { label: "", type: "emptyBlock", colWidth: 6 },
                    { label: "Remarks", type: "textArea", name: "REMARKS", type2: "switch", name2: "PRINT_REMARKS", colWidth: 6 },
                    { label: "Special Instruction", type: "textArea", name: "SPECIAL_INST", type2: "switch", name2: "PRINT_SPECIAL_INST", colWidth: 6 },
                    { label: "FMC #", type: "text", name: "FMC_NO", type2: "switch", name2: "PRINT_FMC_NO", colWidth: 6 },
                ]
            },
            {
                name: "container",
                title: "Container",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SobContainers",
                        columns: [
                            { title: "Container #", field: "CONTAINER_NO", width: 120 },
                            { title: "Seal", field: "SEAL", width: 80 },
                            { title: "Size", field: "CONTAINER_SIZE", width: 100, editor: function (container, options) { controls.renderGridEditorContainerSize(container, options) } },
                            { title: "Package", field: "PACKAGE", width: 120 },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120, editor: function (container, options) { controls.renderGridEditorNumericTextBox(container, options, 3) } },
                            { title: "S/O #", field: "SO_NO", width: 120 },
                            { title: "Service", field: "SERVICE", width: 120, editor: function (container, options) { controls.renderGridEditorService(container, options) } },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            CONTAINER_NO: { type: "string" },
                            SEAL: { type: "string" },
                            CONTAINER_SIZE: { type: "string" },
                            PACKAGE: { type: "number" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                            SO_NO: { type: "string" },
                            SERVICE: { type: "string" },
                        },
                    },
                ]
            },
            {
                name: "cargo",
                title: "Cargo",
                colWidth: 12,
                formControls: [
                    {
                        label: "", type: "grid", name: "SobCargos",
                        columns: [
                            { title: "Container #", field: "CONTAINER_NO", width: 120, editor: function (container, options) { controls.renderGridEditorSobContainerNo(container, options) } },
                            { title: "Marks #", field: "MARKS_NO", width: 200, editor: function (container, options) { controls.renderGridEditorTextArea(container, options) } },
                            { title: "Goods Description", field: "GOODS_DESC", width: 200, editor: function (container, options) { controls.renderGridEditorTextArea(container, options) } },
                            { title: "Qty", field: "QTY", width: 120 },
                            {
                                title: "Unit", field: "UNIT", width: 100,
                                editor: function (container, options) { controls.renderGridEditorCargoUnits(container, options) }
                            },
                            { title: "Kgs", field: "KGS", width: 120 },
                            { title: "CBM", field: "CBM", width: 120, editor: function (container, options) { controls.renderGridEditorNumericTextBox(container, options, 3) } },
                            { title: "Commodity", field: "COMMODITY", width: 180, editor: function (container, options) { controls.renderGridEditorCommodities(container, options) } },
                            { command: [{ className: "btn-destroy", name: "destroy", text: " " }] },
                        ],
                        fields: {
                            MARKS_NO: { type: "string" },
                            GOODS_DESC: { type: "string" },
                            QTY: { type: "number" },
                            UNIT: { type: "string" },
                            KGS: { type: "number" },
                            CBM: { type: "number" },
                            COMMODITY: { type: "string" },
                        },
                    },
                ]
            },
        ],
    },
    {
        formName: "seaInvoice",
        mode: "edit",   //create / edit
        title: "Invoice#",
        readUrl: "../Sea/Invoice/GetInvoice",
        updateUrl: "../Sea/Invoice/UpdateInvoice",
        voidUrl: "../Sea/Invoice/VoidInvoice",
        additionalScript: "initSeaInvoice",
        idField: "INV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "SeaInvoicePreview", text: "Preview Invoice", icon: "file-report", type: "pdf" },
                    { id: "SeaInvoice", text: "Print Invoice", icon: "file-report", type: "pdf" },
                    { id: "SeaInvoiceA4", text: "Print Invoice (A4)", icon: "file-report", type: "pdf" },
                    { id: "SeaInvoicePreview_RCSLAX", text: "Print Invoice (LAX)", icon: "file-report", type: "pdf" },
                    { id: "SeaInvoicePreview_Wecan", text: "Print Invoice (Wecan)", icon: "file-report", type: "pdf" },
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
                { name: "IS_VAT", hidden: "true", defaultValue: "N" },
                { name: "INV_DATE", required: "true", defaultValue: new Date() },
                { name: "INV_TYPE", required: "true", readonly: "edit" },
                { name: "INV_CATEGORY", required: "true" },
                { name: "INV_FORMAT", required: "true" },
                { name: "CURR_CODE", required: "true", defaultValue: "currency" },
                { name: "CUSTOMER", required: "true" },
                { name: "PACKAGE_UNIT", required: "true" },
                { name: "FRT_PAYMENT_PC", required: "true" },
                { name: "JOB_NO", required: "true" },
                { name: "INV_NO", readonly: "always" },
                { name: "AMOUNT", readonly: "always" },
                { name: "AMOUNT_HOME", readonly: "always" },
                { name: "VES_CODE", required: "true" },
                { name: "VOYAGE", required: "true", readonly: "always" },
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
                    { label: "Invoice #", type: "text", name: "INV_NO", colWidth: 4 },
                    { label: "Invoice Date", type: "date", name: "INV_DATE", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Invoice Type", type: "buttonGroup", name: "INV_TYPE", dataType: "invoiceType", colWidth: 4 },
                    { label: "Category", type: "buttonGroup", name: "INV_CATEGORY", dataType: "seaInvoiceCategory", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Carrier", type: "carrier", name: "CARRIER_CODE", colWidth: 4 },
                    { label: "Vessel", type: "selectVoyage", name: "VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "VOYAGE", colWidth: 4 },
                    { label: "Departure Date", type: "date", name: "LOADING_PORT_DATE", colWidth: 4 },
                    { label: "Estimate Arrival Date", type: "date", name: "DISCHARGE_PORT_DATE", colWidth: 4 },
                    { label: "Prepaid/Collect", type: "paymentTerms", name: "FRT_PAYMENT_PC", colWidth: 4 },
                    { label: "HB/L", type: "selectHbl", name: "selectHbl", colWidth: 4 },
                    { label: "Job#", type: "selectSeaJob", name: "JOB_NO", colWidth: 4 },
                    { label: "Container", type: "selectContainer", name: "CONTAINER_NO", colWidth: 4 },
                    { label: "Customer", type: "customerAddrEditable", name: "CUSTOMER", colWidth: 4 },
                    { label: "Remarks", type: "textArea", name: "REMARKS", colWidth: 4 },
                    { label: "Payment Terms", type: "text", name: "PAYMENT_TERMS", colWidth: 4 },
                    { label: "Invoice Format", type: "buttonGroup", name: "INV_FORMAT", dataType: "seaInvoiceFormat", colWidth: 4 },
                    { label: "Commodity", type: "text", name: "COMMODITY", colWidth: 4 },
                    { label: "Reference No.", type: "text", name: "REF_NO", colWidth: 4 },
                    { label: "PS Ratio", type: "text", name: "PS_RATIO", colWidth: 4 },
                    { label: "VAT Invoice Rate", type2: "text", name2: "VAT_RATE", type: "switch", name: "IS_VAT", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Currency", type: "currency", name: "CURR_CODE", exRateName: "EX_RATE", colWidth: 4 },
                    { label: "Amount", type: "text", name: "AMOUNT", colWidth: 4 },
                    { label: "Amount Home", type: "text", name: "AMOUNT_HOME", colWidth: 4 },
                ]
            },
            {
                name: "charges",
                title: "Charge Items",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "EX_RATE", targetControl: "grid_SeaInvoiceItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "SeaInvoiceItems",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                            AMOUNT_HOME: { type: "number", editable: false, validation: { required: true } },
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
        formName: "seaPv",
        mode: "edit",   //create / edit
        title: "PV#",
        readUrl: "../Sea/Pv/GetPv",
        updateUrl: "../Sea/Pv/UpdatePv",
        voidUrl: "../Sea/Pv/VoidPv",
        additionalScript: "initSeaPv",
        idField: "PV_NO",
        id: "",
        toolbar: [
            { type: "button", text: "New", icon: "file-add" },
            { type: "button", text: "Save", icon: "save" },
            { type: "button", text: "Save New", icon: "copy" },
            { type: "button", text: "Void", icon: "cancel" },
            {
                type: "dropDownButton", text: "Print", icon: "print", menuButtons: [
                    { id: "SeaPvPreview", text: "Preview Pv", icon: "file-report", type: "pdf" },
                    { id: "SeaPv", text: "Print Pv", icon: "file-report", type: "pdf" },
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
                { name: "IS_VAT", hidden: "true", defaultValue: "N" },
                { name: "PV_DATE", required: "true", defaultValue: new Date() },
                { name: "PV_TYPE", required: "true", readonly: "edit" },
                { name: "PV_CATEGORY", required: "true" },
                { name: "CURR_CODE", required: "true", defaultValue: "currency" },
                { name: "CUSTOMER", required: "true" },
                { name: "PACKAGE_UNIT", required: "true" },
                { name: "FRT_PAYMENT_PC", required: "true" },
                { name: "JOB_NO", required: "true" },
                { name: "PV_NO", readonly: "always" },
                { name: "AMOUNT", readonly: "always" },
                { name: "AMOUNT_HOME", readonly: "always" },
                { name: "VOYAGE", readonly: "always" },
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
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Pv Type", type: "buttonGroup", name: "PV_TYPE", dataType: "pvType", colWidth: 4 },
                    { label: "Category", type: "buttonGroup", name: "PV_CATEGORY", dataType: "seaInvoiceCategory", colWidth: 4 },
                    { label: "Vendor Invoice #", type: "text", name: "VENDOR_INV_NO", colWidth: 4 },
                    { label: "Vessel", type: "vessel", name: "VES_CODE", colWidth: 4 },
                    { label: "Voyage", type: "text", name: "VOYAGE", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Departure Date", type: "date", name: "LOADING_PORT_DATE", colWidth: 4 },
                    { label: "Estimate Arrival Date", type: "date", name: "DISCHARGE_PORT_DATE", colWidth: 4 },
                    { label: "Prepaid/Collect", type: "paymentTerms", name: "FRT_PAYMENT_PC", colWidth: 4 },
                    { label: "HB/L", type: "selectHbl", name: "selectHbl", colWidth: 4 },
                    { label: "Job#", type: "selectSeaJob", name: "JOB_NO", colWidth: 4 },
                    { label: "Container", type: "selectContainer", name: "CONTAINER_NO", colWidth: 4 },
                    { label: "Customer", type: "customerAddrEditable", name: "CUSTOMER", colWidth: 4 },
                    { label: "Remarks", type: "textArea", name: "REMARK", colWidth: 4 },
                    { label: "", type: "emptyBlock", colWidth: 4 },
                    { label: "Currency", type: "currency", name: "CURR_CODE", exRateName: "EX_RATE", colWidth: 4 },
                    { label: "Amount", type: "text", name: "AMOUNT", colWidth: 4 },
                    { label: "Amount Home", type: "text", name: "AMOUNT_HOME", colWidth: 4 },
                ]
            },
            {
                name: "charges",
                title: "Charge Items",
                colWidth: 12,
                formControls: [
                    { label: "Charge Template", type: "chargeTemplate", name: "chargeTemplate", exRateName: "EX_RATE", targetControl: "grid_SeaPvItems", colWidth: 4 },
                    {
                        label: "", type: "grid", name: "SeaPvItems",
                        columns: [
                            {
                                title: "Charge", field: "CHARGE_CODE", width: 280,
                                template: function (dataItem) { return `${dataItem.CHARGE_CODE} - ${dataItem.CHARGE_DESC}`; },
                                editor: function (container, options) { controls.renderGridEditorCharges(container, options) }
                            },
                            {
                                title: "Currency", field: "CURR_CODE", width: 80,
                                editor: function (container, options) { controls.renderGridEditorCurrency(container, options, "EX_RATE") }
                            },
                            { title: "Ex. Rate", field: "EX_RATE", width: 80 },
                            { title: "Price", field: "PRICE", width: 90 },
                            { title: "Qty", field: "QTY", width: 90 },
                            {
                                title: "Unit", field: "QTY_UNIT", width: 80,
                                editor: function (container, options) { controls.renderGridEditorChargeQtyUnit(container, options) }
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
                            AMOUNT_HOME: { type: "number", editable: false, validation: { required: true } },
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
];

export default class {
    constructor() {
        if (localStorage.user == null)
            window.open("../Home/Login", "_self");
        else {
            user = JSON.parse(localStorage.user);
            sessionId = localStorage.sessionId;
            this.prefetchGlobalVariables().then(function () {
                console.log("Prefetch completed: ", new Date());
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

                        //Remove the companyId if the user do not have the access right
                        if (!data.isEmptyString(localStorage.companyId)) {
                            if (data.user.UserCompanies.filter(a => a.COMPANY_ID == localStorage.companyId).length == 0)
                                localStorage.companyId = "";
                        }
                        
                        if (!data.isEmptyString(localStorage.companyId)) {
                            companyId = localStorage.companyId;
                        } else {
                            if (data.isEmptyString(user.DEFAULT_COMPANY))
                                companyId = user.UserCompanies[0].COMPANY_ID;
                            else
                                companyId = user.DEFAULT_COMPANY;
                        }

                        if ($("#dashboardMain").length == 0) {
                            $.ajax({
                                url: "../Home/GetSysModules",
                                success: function (menuItems) {
                                    data.masterRecords.menuItems = menuItems;
                                    controls.initNavbar();
                                    controls.initControlSidebar();
                                    controls.initSidebar(menuItems);
                                    controls.initTabstripMain();

                                    $(window).on("resize", function () {
                                        var height = $(".content-wrapper").height();
                                        $("#tabStripMain").css({ "height": (height - 5), "position": "relative", "top": "-20px" });
                                    });
                                    $(window).trigger("resize");

                                    $(".nav-item.dropdown").bind("click", function () {
                                        $(this).toggleClass("open");
                                    });
                                    $(".nav-item.dropdown.sysCompany").hover(function () {
                                        $(this).find(".fa-house-user").toggleClass("fa-shake");
                                    });
                                    $(".dropdown.sysCompany .dropdown-item").bind("click", function (sender) {
                                        //console.log(sender.target);
                                        data.companyId = $(sender.target).text().trim();
                                        localStorage.companyId = data.companyId;
                                        $(".dropdown.sysCompany span.currentSystemCompany").text(data.companyId);
                                        //refresh the GlobalVariables after change company
                                        data.prefetchGlobalVariables();
                                    });
                                    $("[data-widget='control-logout']").bind("click", function () {
                                        $.ajax({
                                            url: "/Admin/Account/Logout",
                                            data: { userId: data.user.USER_ID },
                                            success: function (result) {
                                                localStorage.removeItem("user");
                                                localStorage.removeItem("sessionId");
                                                localStorage.removeItem("tabStrips");
                                                window.open("../Home/Login", "_self");
                                            }
                                        });
                                    });
                                    $("[data-toggle='tooltip']").kendoTooltip();
                                }
                            });
                        }

                        //Load the last opened tabs
                        if (localStorage.tabStrips != null) {
                            var tabStrips = JSON.parse(localStorage.tabStrips);
                            setTimeout(function () {
                                tabStrips.forEach(function (id) { loadTabPage(id); });
                                $("[data-widget='control-sidebar']").trigger("click");
                                //try { calendar.updateSize(); } catch { }
                                $(".loadingOverlay").addClass("hidden");
                            }, 500);

                            //Simulate the loading open effects
                            function loadTabPage(id) {
                                if ($(`#${id}`).length > 0)
                                    return;

                                setTimeout(function () {
                                    var controller = id.split("_")[0];
                                    var pageSetting = utils.getMasterFormByName(controller);
                                    if (controller.endsWith("Index"))
                                        controls.append_tabStripMain(pageSetting.title, id, controller.replace("Index", ""));
                                    else {
                                        if (id.startsWith("airBatchPv"))
                                            controls.append_tabStripMain(`${pageSetting.title}`, id, controller);
                                        else
                                            controls.append_tabStripMain(`${pageSetting.title} ${utils.decodeId(id.split("_")[1])}`, id, controller);
                                    }
                                }, 500 * (tabStrips.indexOf(id) + 1));
                            }
                        } else { $(".loadingOverlay").addClass("hidden"); }
                    }
                });
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
    get hawbGoodDescLineCount() { return hawbGoodDescLineCount; }
    get hawbMarksNoLineCount() { return hawbMarksNoLineCount; }
    get hawbDimDisplayCount() { return hawbDimDisplayCount; }
    get hblMarksNoLineCount() { return hblMarksNoLineCount; }
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

    prefetchGlobalVariables = async function () {
        if (!this.isEmptyString(localStorage.companyId)) {
            this.companyId = localStorage.companyId;
        } else {
            if (this.isEmptyString(user.DEFAULT_COMPANY))
                this.companyId = user.UserCompanies[0].COMPANY_ID;
            else
                this.companyId = user.DEFAULT_COMPANY;
        }

        await $.ajax({
            url: "../Admin/Account/GetUser",
            data: { userId: user.USER_ID },
            success: function (result) {
                user = result;
            }
        });

        await $.ajax({
            url: "../Home/GetSysCompanies",
            success: function (result) {
                masterRecords.sysCompanies = result;
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
            url: "../Home/GetSeaPortsView",
            success: function (result) {
                for (var i in result) {
                    result[i].PORT_DESC_DISPLAY = result[i].PORT_CODE + " - " + result[i].PORT_DESC;
                }
                masterRecords.seaPorts = result;
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
            url: "../Home/GetCarriersView",
            success: function (result) {
                for (var i in result) {
                    result[i].CARRIER_DESC_DISPLAY = result[i].CARRIER_CODE + " - " + result[i].CARRIER_DESC;
                }
                masterRecords.carriers = result;
            }
        });

        $.ajax({
            url: "../Home/GetCarrierContracts",
            success: function (result) {
                for (var i in result) {
                    result[i].CONTRACT_NO_DISPLAY = result[i].CARRIER + " / " + result[i].CONTRACT_NO;
                }
                masterRecords.carrierContracts = result;
            }
        });

        $.ajax({
            url: "../Home/GetVesselsView",
            success: function (result) {
                for (var i in result) {
                    result[i].VES_DESC_DISPLAY = result[i].VES_CODE + " - " + result[i].VES_DESC;
                }
                masterRecords.vessels = result;
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
            }
        });

        $.ajax({
            url: "../Home/GetGroupCodes",
            success: function (result) {
                masterRecords.groupCodes = result;
            }
        });

        $.ajax({
            url: "../Home/GetCargoUnits",
            success: function (result) {
                masterRecords.cargoUnits = result;
            }
        });

        $.ajax({
            url: "../Home/GetContainerSize",
            success: function (result) {
                masterRecords.containerSize = result;
            }
        });

        $.ajax({
            url: "../Home/GetSeaChargeQtyUnit",
            success: function (result) {
                masterRecords.seaChargeQtyUnit = result;
            }
        });

        $.ajax({
            url: "../Home/GetCommodities",
            success: function (result) {
                masterRecords.commodities = result;
            }
        });

        $.ajax({
            url: "../Admin/System/GetSeqTypes",
            success: function (result) {
                masterRecords.seqTypes = result;
            }
        });

        $.ajax({
            url: "../MasterRecord/PowerSearch/GetPowerSearchSettings",
            success: function (result) {
                masterRecords.powerSearchSettings = result;
            }
        });

        $.ajax({
            url: "../MasterRecord/PowerSearch/GetPowerSearchTemplates",
            success: function (result) {
                masterRecords.powerSearchTemplates = result;
            },
            complete: function () {
                masterRecords.lastUpdateTime = new Date();
            }
        });
    }
}