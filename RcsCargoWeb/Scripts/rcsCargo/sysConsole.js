export default class {
    constructor() {
    }

    initSysConsole = function (pageSetting) {
        $(`#${pageSetting.id} .menuButton`).each(function () {
            $(this).click(function () {
                switch ($(this).attr("name")) {
                    case "sysLogs": controls.append_tabStripMain("System Logs", "sysLogsIndex", "sysLogs"); break;
                    case "getSeqNo": controls.append_tabStripMain("Generate Sequence #", "getSeqNoIndex", "getSeqNo"); break;
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