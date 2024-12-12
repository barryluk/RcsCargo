export default class {
    constructor() {
    }

    initTransfer = function (masterForm) {
        masterForm.id = utils.getFormId();

        $(`#${masterForm.id} [name="commandButtons"]`).attr("style", "margin-bottom: 4px");
        $(`#${masterForm.id} [name="commandButtons"]`).append(`
            <button type="button" name="btnSearch" class="menuButton k-button k-button-md k-rounded-md k-button-solid k-button-solid-base">
                <span class="k-icon k-i-search k-button-icon"></span>
                Search
            </button>
            <button type="button" name="btnTransfer" class="menuButton k-button k-button-md k-rounded-md k-button-solid k-button-solid-base">
                <span class="k-icon k-i-chevron-double-right k-button-icon"></span>
                Transfer
            </button>`);

        $(`#${masterForm.id} .ckb-select-all`).parent().parent().attr("style", "padding: 4px;");
        $(`#${masterForm.id} .ckb-select-all`).change(function () {
            if (this.checked) {
                $(`#${masterForm.id} .k-checkbox`).each(function () {
                    let ckb = $(this);
                    if (!utils.isEmptyString(ckb.attr("hawbno")) && ckb.attr("disabled") == null) {
                        ckb.prop("checked", true);
                    }
                });
            } else {
                $(`#${masterForm.id} .k-checkbox`).each(function () {
                    let ckb = $(this);
                    if (!utils.isEmptyString(ckb.attr("hawbno")) && ckb.attr("disabled") == null) {
                        ckb.prop("checked", false);
                    }
                });
            }
        });

        $(`#${masterForm.id} [name="btnSearch"]`).click(function () {
            let ds = $(`#${masterForm.id} [name=${masterForm.gridConfig.gridName}]`).data("kendoGrid").dataSource;
            $(`#${masterForm.id} [name=${masterForm.gridConfig.gridName}]`).data("kendoGrid").setDataSource(ds);
        });

        $(`#${masterForm.id} [name="btnTransfer"]`).click(function () {
            let hawbNos = [];
            $(`.k-checkbox`).each(function () {
                let ckb = $(this);
                if (!utils.isEmptyString(ckb.attr("hawbno")) && ckb.attr("disabled") == null && ckb.prop("checked")) {
                    hawbNos.push(ckb.attr("hawbNo"));
                }
            });
            if (hawbNos.length == 0) {
                utils.alertMessage("Please select the HAWB(s) to transfer", "", "warning", "small");
                return;
            }

            utils.confirmMessage(`Are you sure to transfer the selected shipments to ${$(`#${masterForm.id} [name=targetCompanyId]`).val()}?`,
                hawbNos, "controllers.airTransfer.transferShipments");
        });
    }

    transferShipments = function (hawbNos) {
        let formId = utils.getFormId();
        let masterForm = utils.getMasterForm();
        $.ajax({
            url: "../Air/Transfer/TransferShipments",
            data: {
                userId: data.user.USER_ID,
                companyId: data.companyId,
                hawbNos: hawbNos,
                targetCompanyId: $(`#${formId} [name=targetCompanyId]`).val(),
                transferOffshore: $(`#${formId} [name=transferOffshore]`).data("kendoSwitch").value(),
            },
            dataType: "text",
            type: "post",
            success: function (result) {
                if (result == "success")
                    utils.alertMessage("Shipment(s) transfer success.", "", "info", "small");
                else
                    utils.alertMessage("Error: " + result, "", "error", "small");

                //refresh grid
                let ds = $(`#${formId} [name=${masterForm.gridConfig.gridName}]`).data("kendoGrid").dataSource;
                $(`#${formId} [name=${masterForm.gridConfig.gridName}]`).data("kendoGrid").setDataSource(ds);
            },
            beforeSend: function () { kendo.ui.progress($(".wrapper"), true); },
            complete: function () { kendo.ui.progress($(".wrapper"), false); },
        });
    }
}