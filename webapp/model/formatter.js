sap.ui.define([], function () {
	"use strict";

	return {
		Time: function(time) {                                                            
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm"});
			var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;                             
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));                      
			return timeStr;                                                                       
		},
		
		
		Datuma: function(gadi){
			var pop = new Date() - new Date(gadi);
			var years = pop/1000/60/60/24/30/12;
			var month = pop/1000/60/60/24/30;
			var days = pop/1000/60/60/24;
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
		}
	};
});