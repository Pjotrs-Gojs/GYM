sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.GYM.GYM.controller.Master", {
		
		formatter: formatter,
		
		onInit: function () {
				// Control state model
			var oList = this.byId("list"),
				oViewModel = this._createViewModel(),
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();


			this._oList = oList;
			this._oListFilterState = {
				aFilter : [],
				aSearch : []
			};

			this.setModel(oViewModel, "masterView");
			
			oList.attachEventOnce("updateFinished", function(){
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
				}.bind(this)
			});

			this.getRouter().getRoute("Master").attachPatternMatched(this._onMasterMatched, this);
		},
		
		_createViewModel : function() {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "ZNAME",
				groupBy: "None"
			});
		},
		
		createGroupHeader : function (oGroup) {
		},
		
		dropDownSelect: function(oEvent){
			var oView = this.getView();
			var oFilter = [];
			var gymKey = oView.byId("dropDown").getSelectedItem().getKey();
			var oModel = this.getModel();
	        	oModel.read("/ZTrainer", {
				    success: function(oData, oResponse){
		    				oFilter.push(new Filter("LOCATION","EQ",gymKey));
		    				var oList = oView.byId("list");
							var oBinding = oList.getBinding("items");
							oBinding.filter(oFilter);
				    }
				    });
		},
		
		removeSelection: function(){
			var oView = this.getView();
			oView.byId("dropDown").clearSelection();
			oView.byId("dropDown").setSelectedItem(null);
			var oList = oView.byId("list");
			var oBinding = oList.getBinding("items");
				oBinding.filter(null);
		},
		
		onSelectionChange: function(oEvent) {
			var sPath = oEvent.getSource().getSelectedItem().getBindingContext().getObject().TRAINERID;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
		var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Details",{
				TrainerID: sPath
			});
		},
		_onMasterMatched :  function() {
			this.getModel("appView").setProperty("/layout", "OneColumn");
		}
	});
});