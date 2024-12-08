export default class {
    constructor() {
    }

    initCustomer = function (masterForm) {
        //id format: customer{customerCode}_{companyId}_{companyId}
        masterForm.id = utils.getFormId();

        //Manual input Customer Code
        if (masterForm.mode == "create") {
            $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).removeClass("form-control");
            $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).addClass("form-control-text k-input-inner readonlyInput");
            $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).after(`<i class="k-icon k-i-change-manually handCursor" title="Manual input Customer code"></i>`);

            $(`#${masterForm.id} .k-i-change-manually`).bind("click", function () {
                console.log("click");
                if ($(`#${masterForm.id} [name="CUSTOMER_CODE"]`).attr("readonly") == null) {
                    $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).attr("readonly", "readonly");
                    $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).addClass("readonlyInput");
                }
                else {
                    $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).removeAttr("readonly", "readonly");
                    $(`#${masterForm.id} [name="CUSTOMER_CODE"]`).removeClass("readonlyInput");
                }
            });
        }
    }
}