export default class {
    constructor() {
    }

    initSeaPv = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var pvNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        var pvCategoryBtn = $(`#${masterForm.id} [name="INV_CATEGORY"]`).data("kendoButtonGroup");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            var reportName = "SeaPaymentVoucherPreview";
            var filename = `Pv# ${pvNo}`;

            var paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "PvNo", value: pvNo },
                { name: "VesCode", value: $(`#${masterForm.id} [name="VES_CODE"]`).val() },
                { name: "Voyage", value: $(`#${masterForm.id} [name="VOYAGE"]`).val() },
                { name: "filename", value: filename }];

            switch (e.id) {
                case "SeaPvPreview":
                    paras.push({ name: "IsEmail", value: "Y" });
                    paras.push({ name: "IsPreview", value: "Y" });
                    break;
                case "SeaPv":
                    paras.push({ name: "IsEmail", value: "N" });
                    paras.push({ name: "IsPreview", value: "N" });
                    break;
            }
            controls.openReportViewer(reportName, paras);
        });

        //HBL list
        $(`#${masterForm.id} [name="selectHbl"]`).parent().after(`<span class="k-input k-input-solid k-input-md k-rounded-md" style="max-width: 270px; padding: 2px;"><div id="${masterForm.id}_hblNoList"></div></span>`);
        let chipHblNos = $(`#${masterForm.id}_hblNoList`).kendoChipList({
            itemSize: "small",
            removable: true,
        }).data("kendoChipList");

        JSON.parse($(`#${utils.getFormId()}`).attr("modeldata")).SeaPvRefNos.forEach(function (refNo) {
            chipHblNos.add({ label: refNo.REF_NO, themeColor: "info" });
        })

        //Select HBL event
        let ddl = $(`#${masterForm.id} [name="selectHbl"]`).data("kendoDropDownList");
        ddl.bind("select", function (e) {
            let hblNoExist = false;
            chipHblNos.items().each(function () {
                if ($(this).children().eq(0).text() == e.dataItem.HBL_NO)
                    hblNoExist = true;
            });

            if (!hblNoExist) {
                chipHblNos.add({ label: e.dataItem.HBL_NO, themeColor: "info" });

                let model = {
                    VES_CODE: e.dataItem.VES_CODE,
                    VOYAGE: e.dataItem.VOYAGE,
                    LOADING_PORT: e.dataItem.LOADING_PORT,
                    LOADING_PORT_DATE: e.dataItem.LOADING_PORT_DATE,
                    DISCHARGE_PORT: e.dataItem.DISCHARGE_PORT,
                    DISCHARGE_PORT_DATE: e.dataItem.DISCHARGE_PORT_DATE,
                    JOB_NO: e.dataItem.JOB_NO,
                };
                controls.setValuesToFormControls(masterForm, model, true);
            }
        });
    }
}