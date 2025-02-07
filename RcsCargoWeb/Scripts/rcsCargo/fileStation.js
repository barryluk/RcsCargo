export default class {
    constructor() {
    }

    initFileStation = function (pageSetting) {
        //console.log(pageSetting);

        $(`#${utils.getFormId()} .search-control.row`).append("<div id='fileManager'></div><p>&nbsp;</p><h5>Recent Uploaded Files</h5><div id='recentUploadedFiles'></div>")
        $("#fileManager").kendoFileManager({
            draggable: true,
            dataSource: {
                transport: {
                    read: {
                        type: "post",
                        url: "../FileStation/GetDirectories?userId=" + data.user.USER_ID
                    },
                    update: {
                        type: "post",
                        url: "../FileStation/Rename?userId=" + data.user.USER_ID
                    },
                    create: {
                        type: "post",
                        url: "../FileStation/Create?userId=" + data.user.USER_ID
                    },
                    destroy: {
                        type: "post",
                        url: "../FileStation/Delete?userId=" + data.user.USER_ID
                    },
                }
            },
            uploadUrl: "../FileStation/UploadFiles?userId=" + data.user.USER_ID,
            open: function (e) {
                //console.log("open", e);
                if (!e.entry.isDirectory)
                    window.open(`../FileStation/DownloadFile?path=${e.entry.path}&name=${e.entry.name}${e.entry.extension}`);
            },
            execute: function (e) {
                //console.log("execute", e);
                let accessType = "";
                if (e.command == "RenameCommand" || e.command == "MoveCommand" || e.command == "CopyCommand")
                    accessType = "MODIFY";
                else if (e.command == "DeleteCommand")
                    accessType = "DELETE";
                else if (e.command == "OpenDialogCommand")
                    accessType = "ADD";

                $.ajax({
                    url: "../FileStation/HasAccessRight",
                    data: { path: e.sender.path(), accessType: accessType, userId: data.user.USER_ID },
                    dataType: "text",
                    success: function (result) {
                        if (result == "False") {
                            $(".k-dialog a.k-dialog-close").click();
                            e.preventDefault();
                            if (accessType == "MODIFY")
                                utils.alertMessage("You don't have the access right to modify the file / folder.<p>&nbsp;</p>", null, "warning");
                            else if (accessType == "DELETE")
                                utils.alertMessage("You don't have the access right to delete the file / folder.<p>&nbsp;</p>", null, "warning");
                            else if (accessType == "ADD")
                                utils.alertMessage("You don't have the access right to update the file.<p>&nbsp;</p>", null, "warning");
                        }
                    }
                });
            },
            command: function (e) {
                console.log(e);
                if (e.action == "itemchange" || e.action == "add")
                    e.sender.refresh();
            },
        });

        var filemanager = $("#fileManager").data("kendoFileManager");
        filemanager.executeCommand({ command: "TogglePaneCommand", options: { type: "preview" } });
        $("#details-toggle").data("kendoSwitch").toggle();
        //$(`[title="List View"]`).first().addClass("k-selected");

        $.ajax({
            url: "../FileStation/GetRecentFiles",
            data: { userId: data.user.USER_ID },
            success: function (result) {
                $("#recentUploadedFiles").kendoGrid({
                    columns: [
                        { field: "name", title: "Name", attributes: { "class": "link-cell" } },
                        { field: "extension", title: "Extension" },
                        { field: "path", title: "Path" },
                        { field: "size", title: "Size (MB)", template: ({ size }) => utils.roundUp(size / 1024 / 1024, 2) },
                        //{ field: "USER_ID", title: "User ID" },
                        { field: "created", title: "Upload Time", template: ({ created }) => data.formatDateTime(created, "dateTimeLong") },
                    ],
                    dataSource: {
                        type: "json",
                        data: result,
                    },
                    dataBound: function (e) {
                        controls.gridAutoFitColumns(this);
                    },
                    change: function (e) {
                        let grid = this;
                        let selectedCell = this.select()[0];
                        if ($(selectedCell).hasClass("link-cell")) {
                            let data = this.dataItem(selectedCell.parentNode);
                            //console.log(data);
                            window.open(`../FileStation/DownloadFile?path=${data.path}&name=${data.name}`);
                        }
                    },
                    resizable: true,
                    sortable: true,
                    selectable: "cell",
                });
            }
        });
    }

}