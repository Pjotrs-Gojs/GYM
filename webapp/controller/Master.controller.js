sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.GYM.GYM.controller.Master", {
		
		formatter: formatter,
		
		onInit: function () {
				// Control state model
			var oList = this.byId("list"),
				oViewModel = this._createViewModel(),
				// Put down master list's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the master list is
				// taken care of by the master list itself.
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();


			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter : [],
				aSearch : []
			};

			this.setModel(oViewModel, "masterView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oList.attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for the list
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
				}.bind(this)
			});

			this.getRouter().getRoute("Master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
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
			//Set the layout property of the FCL control to 'OneColumn'
			this.getModel("appView").setProperty("/layout", "OneColumn");
		}
	});
});