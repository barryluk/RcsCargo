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

    initUsers = function () {
        controllers.masterRecords.initGridControls(utils.getMasterForm());
    }

    initSysCompanies = function () {
        controllers.masterRecords.initGridControls(utils.getMasterForm());
    }

    initUserLogs = function () {

    }

    initCamRecords = function () {
        let gridHeight = $(".content-wrapper").height() - 232;
        let ctrlHtml = `<div class="row col-xl-12 col-lg-12"><label class="col-sm-1 col-form-label">Camera</label>
                        <div class="col-sm-2"><div class="camId" style="width: 120px"></div></div></div>
                        <div class="row col-xl-12 col-lg-12"><label class="col-sm-1 col-form-label">Date</label>
                        <div class="col-sm-2"><table><tr><td><div class="dateFolder" style="width: 120px"></div></td><td><span class="k-icon k-i-refresh handCursor" style="font-size: 10pt"></span></td></tr></table></div>
                        <div class="row col-xl-12 col-lg-12"><label class="col-sm-1 col-form-label">Record Files</label>
                        <div class="col-sm-8"><div class="gridFiles"></div></div></div>`;

        $("#camRecordsIndex .search-control.row").html(ctrlHtml);

        var ddlcamId = $("#camRecordsIndex .search-control.row .camId").kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: {
                data: [{ text: "Entrance", value: "78DF723EB876" },
                { text: "Office", value: "78DF723EAC16" }]
            },
            change: function (e) {
                console.log(e.sender.value());

                $.ajax({
                    url: "../FileStation/GetCamRecordDateFolders",
                    dataType: "json",
                    data: { camId: e.sender.value() },
                    success: function (result) {
                        let ds = new kendo.data.DataSource({ data: result });
                        ddlDateFolder.setDataSource(ds);
                        ddlDateFolder.trigger("change");
                    }
                });
            },
        }).data("kendoDropDownList");;

        var ddlDateFolder = $("#camRecordsIndex .search-control.row .dateFolder").kendoDropDownList({
            change: function (e) {
                console.log(e.sender.value());

                $.ajax({
                    url: "../FileStation/GetCamRecordFiles",
                    dataType: "json",
                    data: { camId: ddlcamId.value(), dateFolder: e.sender.value() },
                    success: function (result) {
                        let ds = new kendo.data.DataSource({ data: result });
                        gridFiles.setDataSource(ds);
                    }
                });
            }
        }).data("kendoDropDownList");

        var gridFiles = $("#camRecordsIndex .search-control.row .gridFiles").kendoGrid({
            columns: [
                { field: "FileName", title: "File Name", attributes: { "class": "link-cell" } },
                { field: "Size", title: "Size (MB)", template: ({ Size }) => utils.roundUp(Size / 1024 / 1024, 2) },
                { field: "CamId", title: "Camera ID" },
                { field: "DateFolder", title: "Folder" },
                { field: "CreateDate", title: "Create Date", template: ({ CreateDate }) => data.formatDateTime(CreateDate, "dateTimeLong") },
            ],
            resizable: true,
            sortable: true,
            height: gridHeight,
            scrollable: { endless: true },
            selectable: "cell",
            pageable: {
                numeric: false,
                previousNext: false
            },
            change: function (e) {
                let selectedCell = gridFiles.select()[0];
                if ($(selectedCell).hasClass("link-cell")) {
                    let id = $(selectedCell).text();
                    gridFiles.clearSelection();
                    console.log(id);

                    let videoHtml = `<video height="100%" controls autoplay>
                                        <source src="../CamRecords/${ddlcamId.value()}/${ddlDateFolder.value()}/${id}" type="video/mp4">
                                        Your browser does not support the video tag.
                                        </video>`;
                    utils.alertMessage(videoHtml, id, "info", "large", false);
                }
            },
        }).data("kendoGrid");

        ddlcamId.trigger("change");

        $("#camRecordsIndex .search-control.row .k-i-refresh").click(function () {
            ddlDateFolder.trigger("change");
        });
    }

    initSysLogs = function () {
        let pageSetting = data.indexPages.filter(a => a.pageName == "sysLogs")[0];
        pageSetting.id = "sysLogsIndex";

        $(`#${pageSetting.id} [name="logFiles"]`).parent().after(`
            <span class="k-icon k-i-refresh handCursor" style="font-size: 10pt"></span>
            <div class="form-group">
                <span class="logFilter">[ALL]</span>&nbsp&nbsp
                <span class="logFilter">[INFO]</span>&nbsp&nbsp
                <span class="logFilter">[DEBUG]</span>&nbsp&nbsp
                <span class="logFilter">[WARN]</span>&nbsp&nbsp
                <span class="logFilter">[ERROR]</span>&nbsp&nbsp
                <span class="logFilter">[FATAL]</span>&nbsp&nbsp
                <span><i class="k-icon k-i-arrow-end-down handCursor" name="toBottom"></i></span>
            </div>`);

        $($(`#${pageSetting.id} .k-picker.k-dropdownlist`)[0]).after(`&nbsp;<span class="k-icon k-i-download handCursor" title="Request Log from SHA"></span>`)

        $(`#${pageSetting.id} [name="logContent"]`).after(`
            <i id="systemLog-main-footer" />
            <div><span name="toTopRefresh" class="k-icon k-i-refresh" /><img name="toTop" src="../Content/img/top.png" alt="back to top" /></div>`);

        $(`#${pageSetting.id} .k-i-refresh.handCursor`).click(function () { $(`#${pageSetting.id} .logFilter`).first().trigger("click"); });

        $(`#${pageSetting.id} [name="toTopRefresh"]`).click(function () {
            $($(`#${pageSetting.id} .logFilter`)[0]).trigger("click");
        });

        $(`#${pageSetting.id} .k-icon.k-i-download`).click(function () {
            $.ajax({
                url: "../FileStation/RequestShaFileWatcherLog",
                dataType: "text",
                beforeSend: function () { kendo.ui.progress($(`#${pageSetting.id}`), true); },
                complete: function () { kendo.ui.progress($(`#${pageSetting.id}`), false); },
                success: function (result) {
                    utils.showNotification("Request sent, please wait a few minutes...", "success", `#${pageSetting.id} .k-icon.k-i-download`);
                }
            });
        });

        $(`#${pageSetting.id} .logFilter`).click(function () {
            let folder = $(`#${utils.getFormId()} input[type=logFolders]`).data("kendoDropDownList").value().split(",")[0];
            var filter = $(this).text().replace("[", "").replace("]", "").replace("ALL", "");
            $.ajax({
                url: "../Admin/System/GetLog",
                dataType: "text",
                data: {
                    path: folder,
                    fileName: $(`#${utils.getFormId()} [name="logFiles"]`).data("kendoDropDownList").dataItem(),
                    filter: filter,
                },
                beforeSend: function () { kendo.ui.progress($("[name='logContent']"), true); },
                complete: function () { kendo.ui.progress($("[name='logContent']"), false); },
                success: function (result) {
                    $(`#${utils.getFormId()} [name="logContent"]`).html(result.replaceAll("\r\n", "<br>"));
                }
            });
        });

        $(`#${pageSetting.id} [name="toBottom"]`).click(function () {
            $(`#${pageSetting.id}`).parent().scrollTop($("#systemLog-main-footer").offset().top);
        });

        $(`#${pageSetting.id} [name="toTop"]`).click(function () {
            $(`#${pageSetting.id}`).parent().scrollTop(0);
        });
    }

    initGetSeqNo = function () {
        let pageSetting = data.indexPages.filter(a => a.pageName == "getSeqNo")[0];
        pageSetting.id = "getSeqNoIndex";

        $(`#${utils.getFormId()} [name="sysCompanyId"]`).data("kendoDropDownList").value(data.companyId);
        $(`#${utils.getFormId()} [name="origin"]`).data("kendoDropDownList").value(data.companyId.substring(3, 6));
        $(`#${utils.getFormId()} [name="date"]`).data("kendoDatePicker").value(new Date());
        $(`#${utils.getFormId()} [name="seqNoCount"]`).data("kendoNumericTextBox").value(1);

        $(`#${utils.getFormId()} [name="genSeqNo"]`).click(function () {
            let origin = $(`#${utils.getFormId()} [name="origin"]`).data("kendoDropDownList").value();
            if (!utils.isEmptyString($(`#${utils.getFormId()} [name="keyValue"]`).val()))
                origin = $(`#${utils.getFormId()} [name="keyValue"]`).val();

            $.ajax({
                url: "../Admin/System/GetSeqNo",
                dataType: "text",
                data: {
                    seqType: $(`#${utils.getFormId()} [name="seqType"]`).data("kendoDropDownList").value(),
                    companyId: $(`#${utils.getFormId()} [name="sysCompanyId"]`).data("kendoDropDownList").value(),
                    origin: origin,
                    dest: $(`#${utils.getFormId()} [name="dest"]`).data("kendoDropDownList").value(),
                    date: $(`#${utils.getFormId()} [name="date"]`).data("kendoDatePicker").value(),
                    seqNoCount: $(`#${utils.getFormId()} [name="seqNoCount"]`).data("kendoNumericTextBox").value(),
                },
                success: function (result) {
                    $(`#${utils.getFormId()} [name="seqNoResult"]`).val(result.replaceAll(",", "\r\n"));
                }
            });
        });
    }
}