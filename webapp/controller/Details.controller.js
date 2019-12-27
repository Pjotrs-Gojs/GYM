sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/unified/library",
	"sap/ui/core/Fragment",
	"sap/m/SinglePlanningCalendarView"
], function (BaseController, formatter, JSONModel, DateFormat, unifiedLibrary, Fragment, SinglePlanningCalendarView) {
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
			
			this.oDialog = this.getView().byId("dialogAction");
			this.oAppDetails = this.getView().byId("AppointmentDetails");
			
			this.oComboBox = this.getView().byId("ComboBoxTypes");
			this.oButton = this.getView().byId("addType");
			this.oAdd = this.getView().byId("Add");
			this.oDelete = this.getView().byId("Delete");
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
		},
		
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("detailsView");

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
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;

			}

			var sPath = oElementBinding.getPath(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.TRAINERID;
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			var SPC = this.getView().byId("SPC1"); // Calendar ID
			SPC.bindElement({ path: "/ZTrainer(" +  sObjectId + ")" });
			var timeto = SPC.getBindingContext().getProperty().TIMETO,
				timefrom = SPC.getBindingContext().getProperty().TIMEFROM,
				diap1 = formatter.Time(timefrom),
				diap2 = formatter.Time(timeto);
			SPC.setStartHour(parseInt(diap1,10));
			SPC.setEndHour(parseInt(diap2,10));
		},
		
		_onMetadataLoaded: function () {
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailsView");
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/busy", true);
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("Master");
		},
		
		onSelectAppointment: function(oEvent){
			var oAppointment = oEvent.getParameter("appointment");
			var oView = this.getView();
				if(oView.byId("SPC1").getSelectedAppointments().length === 0){
					oView.byId("deleteWorkout").setEnabled(false);
					oView.byId("editWorkout").setEnabled(false);
					this.oAppDetails.close();
				} else {
					oView.byId("deleteWorkout").setEnabled(true);
					oView.byId("editWorkout").setEnabled(true);
					this.key = oEvent.getParameters().appointment.getKey();
					if (!this.oAppDetails) {
						Fragment.load({
							name: "com.GYM.GYM.view.fragment.AppointmentDetails",
							controller: this
						}).then(function(pPopover) {
							this.oAppDetails = pPopover;
							this.oAppDetails.setBindingContext(oAppointment.getBindingContext());
							this.getView().addDependent(this.oAppDetails);
							this.oAppDetails.openBy(oAppointment);
						}.bind(this));
					} else {
						this.oAppDetails.openBy(oAppointment);
						this.oAppDetails.setBindingContext(oAppointment.getBindingContext());
					}
				}
		},
		
		onDelete: function (oEvent) {
			var oView = this.getView(), path;
			if (oEvent.getParameters().id === "application-Test-url-component---Details--deleteWorkout") {
			path = this.getModel().createKey("/ZTraining", {
				TRAININGID: this.key
			});
			} else {
			path = this.getModel().createKey("/ZTrainingTypesPerTrainer", {
				ID: this.gID
			});
			}

			var that = this;
			oView.getModel().remove(path,  {
				method: "DELETE",
				success: function (oData, oResponse) {
					sap.m.MessageToast.show("Delete successful");
					that.getView().getModel().refresh();
					that.getView().byId("deleteWorkout").setEnabled(false);
					that.getView().byId("editWorkout").setEnabled(false);
					that.getView().byId("Delete").setEnabled(false);
					that.getView().byId("typeTable").removeSelections();
				},
				error: function (oResponse) {
					sap.m.MessageToast.show("Delete failed" + oResponse);
				}
			});
		},
		
		onOpen: function (oEvent) {
			var oModel = this.getModel(),
				oView = this.getView();
			if (oEvent.getParameters().id === "application-Test-url-component---Details--editWorkout"){
				
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "com.GYM.GYM.view.fragment.WorkoutDialog", this);
				oView.addDependent(this.oDialog);
			}
			this.oDialog.open();
			oModel.read("/ZTraining(" + this.key + ")", {
				    success: function(oData, oResponse){
				    
			var sName = oData.TRAINEENAME,
				sSurname = oData.TRAINEESURNAME,
				sTime = oData.TRAININGTIME,
				sDate = oData.TRAININGDATE,
				iTrainingTypeID = oData.TRAININGTYPEID,
				tTime = formatter.Time(sTime);
				var oType = new sap.ui.model.odata.type.DateTime({pattern: 'yyyy-MM-dd'});
				var dDate = oType.formatValue(new Date(sDate), 'string');
				
				
					oView.byId("selectTrainingTypeID").setSelectedKey(iTrainingTypeID);
					oView.byId("inputTrainingTime").setValue(tTime);
					oView.byId("inputTrainingDate").setValue(dDate);
					oView.byId("inputTraineeName").setValue(sName);
					oView.byId("inputTraineeSurname").setValue(sSurname);
					}
				});
			} else {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment(oView.getId(), "com.GYM.GYM.view.fragment.WorkoutDialog", this);
					oView.addDependent(this.oDialog);
				}
				this.oDialog.open();
			}
		},

		editDialogAfterclose: function () {
			this.oDialog.destroy();
			this.oDialog = null;
		},
		
		closeDialog: function () {
			this.oDialog.close();
		},
		
		onConfirmDialog: function (oEvent) {
			var oView = this.getView();
			var sName = oView.byId("inputTraineeName").getValue(),
				sSurname = oView.byId("inputTraineeSurname").getValue(),
				sDate = oView.byId("inputTrainingDate").getValue(),
				sTime = oView.byId("inputTrainingTime").getValue(),
				iTrainingTypeID = oView.byId("selectTrainingTypeID").getSelectedKey(),
				iTrainerID = this.getView().getBindingContext().getObject().TRAINERID;
				var oType = new sap.ui.model.odata.type.DateTime({pattern : "PTHH'H'mm'M'ss'S'"});
				var dDate = new Date(sDate);
				var a = dDate.toISOString().substring(0,10);
				var tTime = oType.formatValue(new Date(a + " " +sTime), 'string');
			var that = this;
			if (oEvent.getParameters().id === "application-Test-url-component---Details--editWorkout"){
				var oPayload = {
					TRAINEENAME: sName,
					TRAINEESURNAME: sSurname,
					TRAININGDATE: dDate,
					TRAININGTIME: tTime,
					TRAININGTYPEID: iTrainingTypeID,
					TRAININGID: this.key,
					TRAINERID: iTrainerID
				},
				path = this.getModel().createKey("/ZTraining", {
					TRAININGID: this.key,
					TRAINERID: iTrainerID
				});
			oView.getModel().update(path, oPayload, {
				success: function () {
					sap.m.MessageToast.show("Record updated");
					that.getView().getModel().refresh();
					that.oDialog.close();
					that.getView().byId("deleteWorkout").setEnabled(false);
					that.getView().byId("editWorkout").setEnabled(false);
				},
				error: function (oResponce) {
					sap.m.MessageToast.show("Something went wrong: " + oResponce);
					}
				});
			} else {
				oPayload = {
				TRAININGTYPEID: iTrainingTypeID,
				TRAININGTIME: tTime,
				TRAININGDATE: dDate,
				TRAINEENAME: sName,
				TRAINEESURNAME: sSurname,
				TRAININGID: 0,
				TRAINERID: iTrainerID
				};
				oView.getModel().create("/ZTraining", oPayload, {
				success: function () {
					sap.m.MessageToast.show("Workout Accept");
					that.getView().getModel().refresh();
					that.oDialog.close();
					that.getView().byId("deleteWorkout").setEnabled(false);
					that.getView().byId("editWorkout").setEnabled(false);
				},
				error: function (oResponce) {
					sap.m.MessageToast.show("Something went wrong: " + oResponce);
				}
			});
			}
		},
		
		onShowCB: function(){
			if(this.oComboBox.getVisible()){
			this.oComboBox.setVisible(false);
			this.oAdd.setVisible(false);
			this.oButton.setIcon("sap-icon://add");
			this.oButton.setType("Accept");
			}else{
			this.oComboBox.setVisible(true);
			this.oAdd.setVisible(true);
			this.oButton.setIcon("sap-icon://decline");
			this.oButton.setType("Reject");
			}
		},
		
		onAddType: function(){
			var oView = this.getView(),
				oModel = this.getModel(),
			iTrainingTypeID = this.oComboBox.getSelectedKey(),
			iTrainerID = this.getView().getBindingContext().getObject().TRAINERID,
			oPayload = {
				TRAININGTYPEID: iTrainingTypeID,
				ID: 0,
				TRAINERID: iTrainerID
				};
				var that = this;
				oModel.read("/ZTrainer(" + iTrainerID + ")/ZTrainerRef", {
					success: function(oData, oResponse){
						var aResults = oData.results;
				        var TableTrainingTypeID = aResults.map(function (oElement) { return oElement.TRAININGTYPEID; });
				        var accept = 0;
				        var TrainingTypeIDelement = parseInt(iTrainingTypeID,10);
				        TableTrainingTypeID.forEach(function(element){
				        		if( element === TrainingTypeIDelement){
				        			accept = accept + 1;
				        		}
				        });
						if(accept === 0){
							oView.getModel().create("/ZTrainingTypesPerTrainer", oPayload, {
								success: function () {
									sap.m.MessageToast.show("Adding Successfully");
									that.getView().getModel().refresh();
									oView.byId("ComboBoxTypes").clearSelection();
									oView.byId("ComboBoxTypes").setSelectedItem(null);
								},
								error: function (oResponce) {
									sap.m.MessageToast.show("Something went wrong: " + oResponce);
								}
							});	
						} else {
							sap.m.MessageToast.show("Type already exist for this trainer");
							oView.byId("ComboBoxTypes").setSelectedItem(null);
						}
					}
				});
		},
		
		onSelectRow: function(){
			var iID = this.getView().byId("typeTable").getSelectedItem().getBindingContext().getObject().ID;
			if (this.oDelete.getEnabled() && ((iID === null) || iID === this.gID)) {
				this.getView().byId("typeTable").removeSelections(true);
				this.oDelete.setEnabled(false);
			} else if (this.oDelete.getEnabled() && iID !== this.gID) {
				this.oDelete.setEnabled(true);
			} else {
				this.oDelete.setEnabled(true);
			}
			if (this.oDelete.getEnabled() === false) {
				this.gID = null;
			} else {
				this.gID = this.getView().byId("typeTable").getSelectedItem().getBindingContext().getObject().ID;

			}
		}
		
	});
});