sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/GYM/GYM/model/models",
	"./controller/ListSelector"
], function (UIComponent, Device, models, ListSelector) {
	"use strict";

	return UIComponent.extend("com.GYM.GYM.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			this.oListSelector = new ListSelector();
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();

			this.setModel(models.createDeviceModel(), "device");
		},
		
		destroy : function () {
			this.oListSelector.destroy();
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});