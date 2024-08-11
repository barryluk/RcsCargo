function initAirMawbIndex(id) {
    $(`#${id}`).html(`
    <div>
        <h3>MAWB</h3>
        <div class="search-control row"></div>
        <br>
        <div name="gridMawb"></div>
    </div>`);
    
    var pageSetting = indexPages.filter(a => a.pageName == "airMawb")[0];
    pageSetting.id = id;

    renderSearchControls(pageSetting);
    renderIndexGrid(pageSetting);
}

function initAirMawb(id, mode = "edit") {
    //id format: AirMawb_{mawbNo}_{companyId}_{frtMode}
    var mawbNo = id.split("_")[1];
    var companyId = id.split("_")[2];
    var frtMode = id.split("_")[3];

    $(`#${id}`).html(`
    <div>
        <h3>MAWB# <span></span></h3>
        <div class="toolbar"></div>
        <section class="content">
            <div class="container-fluid">
                <div class="row form_group">
                </div>
            </div>
        </section>
    </div>`);

    $(`#${id}`).find("h3 span").eq(0).html(formatMawbNo(mawbNo));
    var masterForm = masterForms.filter(a => a.formName == "airMawb")[0];
    masterForm.id = id;
    masterForm.mode = mode;
    masterForm.targetForm = $(`#${id} .container-fluid .row.form_group`);
    renderFormControls(masterForm);

    var buttonGroup = $(`#${masterForm.id} [name=JOB_TYPE]`).data("kendoButtonGroup");
    buttonGroup.bind("select", function (e) {
        //0: Consol, 1: Direct
        var tabStrip = $(`#${masterForm.id} .formGroupTab`).data("kendoTabStrip");
        var tabConsol = $(`#${masterForm.id} span:contains("Load Plan")`).parent();
        var tabDirect = $(`#${masterForm.id} span:contains("Direct Job")`).parent();
        if (e.sender.selectedIndices[0] == 0) {
            tabStrip.remove(tabDirect);
        } else {
            tabStrip.remove(tabConsol);
        }
    });

    //Get model data
    if (mode == "edit") {
        $.ajax({
            url: "/Air/Mawb/GetMawb",
            type: "post",
            dataType: "json",
            data: {
                mawbNo: mawbNo,
                companyId: companyId,
                frtMode: frtMode
            },
            success: function (result) {
                setValuesToFormControls(masterForm, result);
                buttonGroup.trigger("select");
            }
        });
    }
}