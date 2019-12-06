sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/ui/core/Fragment",
	"sap/m/SinglePlanningCalendarView"
], function (BaseController, formatter, JSONModel, unifiedLibrary, Fragment, SinglePlanningCalendarView) {
	"use strict";
	

	return BaseController.extend("com.GYM.GYM.controller.Details", {
		
		formatter: formatter,
		
		onInit: function (oEvent) {
			
			var oViewModel = new JSONModel({
				busy : false,
				delay : 0
			});
			this.getRouter().getRoute("Details").attachPatternMatched(this._onDetailsMatched, this);
			this.setModel(oViewModel, "detailsView");			
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			
			 
			// var oModel = new JSONModel();
			// oModel.setData({
			// 		startDate: new Date(),
			// 		appointments: [],
			// 		supportedAppointmentItems: []
			// });
		},
		
		_onDetailsMatched: function (oEvent) {
			var sObjectId = oEvent.getSource()._oRouter.oHashChanger.hash.substr(8);
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("ZTrainer", {
					TRAINERID: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
			
			var SPC = this.getView().byId("SPC1");
			SPC.bindElement({ path: "/ZTrainer(" +  sObjectId + ")" });
			var timeto = SPC.getBindingContext().getProperty().TIMETO,
				timefrom = SPC.getBindingContext().getProperty().TIMEFROM,
				diap1 = formatter.Time(timefrom),
				diap2 = formatter.Time(timeto);
			SPC.setStartHour(parseInt(diap1,10));
			SPC.setEndHour(parseInt(diap2,10));
		},
		
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailsView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;

			}

			var sPath = oElementBinding.getPath();
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
		},
		
		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailsView"),
				oLineItemTable = this.byId("list"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("Master");
		},
		
		onAdd: function () { // ADD FUNCTION
			var oView = this.getView();
			var oDialog = oView.byId("addAction");
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.GYM.GYM.view.fragment.newWorkout", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		dialogAfterclose: function (oEvent) {
			var oView = this.getView();
			var oDialog = oView.byId("addAction");
			oDialog.destroy();
		},

		onCloseDialog: function () {
			var oView = this.getView();
			var oDialog = oView.byId("addAction");
			oDialog.close();
		},
		
		onConfirmDialog: function () {
			var oView = this.getView(),
				oDialog = oView.byId("addAction"),
				sTrainingTypeID = oView.byId("selectTrainingTypeID").getSelectedKey(),
				sTrainingTime = oView.byId("inputTrainingTime").getValue(),
				sTrainingDate = oView.byId("inputTrainingDate").getValue(),
				sTraineeName = oView.byId("inputTraineeName").getValue(),
				sTraineeSurname = oView.byId("inputTraineeSurname").getValue(),
				iTrainerID = this.getView().getBindingContext().getObject().TRAINERID,
				oPayload = {};
				var iTrainingTypeID = parseInt(sTrainingTypeID, 10);
				var dTrainingDate = new Date(sTrainingDate);
				var oType = new sap.ui.model.odata.type.DateTime({pattern : "PThh'H'mm'M'ss'S'"});
				var a = dTrainingDate.toISOString().substring(0,10);
				var tTrainingTime = oType.formatValue(new Date(a + " " +sTrainingTime), 'string');
			oPayload = {
				TRAININGTYPEID: iTrainingTypeID,
				TRAININGTIME: tTrainingTime,
				TRAININGDATE: dTrainingDate,
				TRAINEENAME: sTraineeName,
				TRAINEESURNAME: sTraineeSurname,
				TRAININGID: 0,
				TRAINERID: iTrainerID
				};
			var that = this;
			oView.getModel().create("/ZTraining", oPayload, {
				success: function () {
					sap.m.MessageToast.show("Workout Accept");
					that.getView().getModel().refresh();
					oDialog.close();
				},
				error: function (oResponce) {
					sap.m.MessageToast.show("Something went wrong: " + oResponce);
				}
			});
		}
		
	});
});