sap.ui.define([], function () {
	"use strict";

	return {
		Time: function(time) {     
			if(time !== undefined){
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm"});
			var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;                             
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));    
			}
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
		},
		
		TrainingDate: function(date){
			// var year = new Date(date).getFullYear();
			// var month = new Date(date).getMonth();
			// var day = new Date(date).getDay();
			// var hours = new Date(date).getHours();
			// var minut = new Date(date).getMinutes();
			// var str = new Date(year, month, day, hours, minut);
			// var full = str.toString().substring(0,21);
			// return full;
			var parts = date.match(/\d+/g);
            var dateFormatted = new Date(parts[0] , parts[1] - 1 , parts[2] , parts[3] , parts[4]);
            return dateFormatted;
		}
	};
});