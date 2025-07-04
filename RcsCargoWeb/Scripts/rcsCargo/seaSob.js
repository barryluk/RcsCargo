export default class {
    constructor() {
    }

    initSeaSob = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        let sobNo = masterForm.id.split("_")[1];
        let companyId = data.companyId;
        let frtMode = utils.getFrtMode();
        let createType = "";
        let hblNo = "";

        if (sobNo == "NEW" && masterForm.id.split("_")[4] != null) {
            createType = masterForm.id.split("_")[4];
            hblNo = masterForm.id.split("_")[5];

            $.ajax({
                url: "../Sea/Hbl/GetHbl",
                data: {
                    id: utils.decodeId(hblNo),
                    companyId: companyId,
                    frtMode: frtMode,
                    byJob: createType == "HBL" ? false : true
                },
                success: function (result) {
                    result.SobCargos = result.SeaHblCargos;
                    result.SobContainers = result.SeaHblContainers;
                    result.SobSos = result.SeaHblSos;
                    $(`#${masterForm.id}`).attr("modelData", JSON.stringify(result));
                    controls.setValuesToFormControls(masterForm, result);
                },
                complete: function () {
                    kendo.ui.progress($(`#${masterForm.id}`).parent(), false);
                }
            });
        }

        $(`#${masterForm.id} [name="TO_ORDER_FLAG"]`).parent().attr("style", "width: 90px");

        let printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            let buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            let reportName = "";
            let reportType = buttonConfig.type;
            let filename = `SOB# ${sobNo}`;
            masterForm = utils.getMasterForm();
            let model = controls.getValuesFromFormControls(masterForm);
            let goodsDesc = "";
            let marksNo = "";
            model.SobCargos.forEach(function (cargo) {
                goodsDesc += cargo.GOODS_DESC.trim() + "\n";
                marksNo += cargo.MARKS_NO.trim() + "\n";
            });
            let showAttached = utils.showHblAttachedList(goodsDesc.trim(), marksNo.trim(), model.NOTIFY2_DESC);
            let paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "SobNo", value: sobNo },
                { name: "ContainerWords", value: model.ENTRY_WORD1 },
                { name: "ShowAttached", value: showAttached }];

            if (e.id == "printSob") {
                paras.push({ name: "filename", value: filename });
                reportName = "SeaSob";
            } else if (e.id == "printAttachedList") {
                paras.push({ name: "filename", value: `SOB Attached List - ${sobNo}`});
                paras.push({ name: "Vessel", value: data.masterRecords.vessels.filter(a => a.VES_CODE == $(`#${masterForm.id} [name=VES_CODE]`).val())[0].VES_DESC });
                paras.push({ name: "Voyage", value: $(`#${masterForm.id} [name=VOYAGE]`).val() });
                paras.push({ name: "LoadingPort", value: data.masterRecords.seaPorts.filter(a => a.PORT_CODE == $(`#${masterForm.id} [name=LOADING_PORT]`).val())[0].PORT_DESC });
                paras.push({ name: "DischargePort", value: data.masterRecords.seaPorts.filter(a => a.PORT_CODE == $(`#${masterForm.id} [name=DISCHARGE_PORT]`).val())[0].PORT_DESC });
                paras.push({ name: "LoadingPortDate", value: $(`#${masterForm.id} [name="LOADING_PORT_DATE"]`).data("kendoDatePicker").value().toISOString() });
                reportName = "SeaSobAttachList";
            }

            if (reportType == "pdf") {
                controls.openReportViewer(reportName, paras);
            } else if (reportType == "xlsx") {
                utils.getExcelReport(reportName, paras);
            }
        });
    }
}