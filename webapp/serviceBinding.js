function initModel() {
	var sUrl = "/BB/com/GYM/Service/GYM.xsodata/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}