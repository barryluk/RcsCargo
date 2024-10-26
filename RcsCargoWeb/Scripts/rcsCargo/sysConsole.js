export default class {
    constructor() {
    }

    initSysConsole = function (pageSetting) {
        $(`#${pageSetting.id} .menuButton`).each(function () {
            $(this).click(function () {
                switch ($(this).attr("name")) {
                    case "sysLogs":
                        controls.append_tabStripMain("System Logs", "sysLogsIndex", "sysLogs");
                        break;
                }
            });
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

        $(`#${pageSetting.id} [name="logContent"]`).after(`
            <i id="systemLog-main-footer" />
            <div><img name="toTop" src="../Content/img/top.png" alt="back to top" /></div>`);

        $(`#${pageSetting.id} .k-i-refresh`).click(function () { $(`#${pageSetting.id} .logFilter`).first().trigger("click"); });
        
        $(`#${pageSetting.id} .logFilter`).click(function () {
            var filter = $(this).text().replace("[", "").replace("]", "").replace("ALL", "");
            $.ajax({
                url: "../Admin/System/GetLog",
                dataType: "text",
                data: {
                    fileName: $(`#${utils.getFormId()} [name="logFiles"]`).data("kendoDropDownList").dataItem(),
                    filter: filter,
                },
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
}