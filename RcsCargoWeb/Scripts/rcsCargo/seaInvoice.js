export default class {
    constructor() {
    }

    initSeaInvoice = function (masterForm) {
        //masterForm.id format: linkIdPrefix_{keyValue}_{companyId}_{frtMode}
        masterForm.id = utils.getFormId();
        var invNo = masterForm.id.split("_")[1];
        var companyId = masterForm.id.split("_")[2];
        var frtMode = masterForm.id.split("_")[3];

        var printButton = $(`#${masterForm.id} [aria-label="Print dropdownbutton"]`).data("kendoDropDownButton");
        var invCategoryBtn = $(`#${masterForm.id} [name="INV_CATEGORY"]`).data("kendoButtonGroup");

        //(Print) dropdownbutton events
        printButton.bind("click", function (e) {
            var buttonConfig = masterForm.toolbar.filter(a => a.text == "Print")[0].menuButtons.filter(a => a.id == e.id)[0];
            var reportName = e.id;
            var filename = `Invoice# ${invNo}`;

            var paras = [
                { name: "CompanyId", value: companyId },
                { name: "FrtMode", value: frtMode },
                { name: "InvNo", value: invNo },
                { name: "IsPreview", value: "N" },
                { name: "IsEmail", value: "N" },
                { name: "ShowFlightDate", value: utils.isEmptyString($(`#${masterForm.id} [name="FLIGHT_DATE"]`).val()) ? "N" : "Y" },
                { name: "AddressCode", value: "" },
                { name: "filename", value: filename }];
            controls.openReportViewer(reportName, paras);
        });

        //HBL list
        
        $(`#${masterForm.id} [name="selectHbl"]`).parent().after(`<span class="k-input k-input-solid k-input-md k-rounded-md" style="max-width: 270px; padding: 2px;"><div id="${masterForm.id}_hblNoList"></div></span>`);
        let chipHblNos = $(`#${masterForm.id}_hblNoList`).kendoChipList({
            itemSize: "small",
            removable: true,
        }).data("kendoChipList");

        JSON.parse($(`#${utils.getFormId()}`).attr("modeldata")).SeaInvoiceRefNos.forEach(function (refNo) {
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

            if (!hblNoExist)
                chipHblNos.add({ label: e.dataItem.HBL_NO, themeColor: "info" });
        });
    }
}