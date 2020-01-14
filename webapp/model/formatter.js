sap.ui.define([
	"sap/ui/unified/library"], function (unifiedLibrary) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return {
		Time: function(time) {     
			if(time !== undefined){
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm"});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;                             
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));    
			}
			return timeStr;    
			
		},
		
		
		Datuma: function(gadi){
			var pop = new Date() - new Date(gadi);
			var years = pop / 1000 / 60 / 60 / 24 / 30 / 12;
			var month = pop / 1000 / 60 / 60 / 24 / 30;
			var days = pop / 1000 / 60 / 60 / 24;
			if( parseInt(years, 10) !== 0){
				var y =  parseInt(years, 10) + " Years";
				return y;
			} else {
				if( parseInt(month, 10) !== 0){
				var m =  parseInt(month, 10) + " Month";
				return m;
			} else {
				var d =  parseInt(days, 10) + " Days";
				return d;
			}
			
			}
		},
		
		TrainingDate: function(date){
			var parts = date.match(/\d+/g);
            var dateFormatted = new Date(parts[0] , parts[1] - 1 , parts[2] , parts[3] , parts[4]);
            	return dateFormatted;
		},
		
		TrainingType: function(type){
			var tt;
			if (type === "Not Bad!"){
				tt = CalendarDayType.Type10;
			}else if(type === "Loser."){
				tt = CalendarDayType.Type06;
			}else if(type === "Monster!"){
				tt = CalendarDayType.Type02;
			}else if(type === "Who are you?"){
				tt = CalendarDayType.Type03;	}
				else {	tt = CalendarDayType.Type17;	}	
				return tt;
		}
	};
});