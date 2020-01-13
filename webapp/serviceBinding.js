function initModel() {
	var sUrl = "/com/GYM/Service/GYM.xsodata/com/GYM/Service/GYM.xsodata/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}