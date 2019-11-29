sap.ui.define([
	"./BaseController",
	"../model/formatter"
], function (BaseController, formatter) {
	"use strict";

	return BaseController.extend("com.GYM.GYM.controller.Details", {
		
		formatter: formatter,
		
		onInit: function () {
		
		}
	});
});