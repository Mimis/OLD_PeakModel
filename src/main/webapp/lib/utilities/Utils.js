/**
 * Utilitie functions
 */
/**
		 *  
		 */
		

var Utils = {
				
		

		getAllShardsAsSolrParamater : function(shards)
		{
			var shardParameterVal = 'localhost:8080/solr/'+shards[0];
			for(var i=1;i<shards.length;i++){
				shardParameterVal =  shardParameterVal + ",localhost:8080/solr/"+ shards[i];
			}
			return shardParameterVal;
		},
		
		
		
		getDomain : function(url)
		{
			if(url.match(/:\/\/(.[^/]+)/) == null)
				console.log(url);
			return url.match(/:\/\/(.[^/]+)/)[1].replace('www.','').split('.')[0];
//			return (url.match(/:\/\/(.[^/]+)/)[1]).replace('www.','');
		},
		
		/**
		 * return the index of the given string in the Array
		 */
		findStringInArray : function (string, array) {
		    for (var i = 0, j = array.length; i < j; i++) {
		        if (array[i].search(string) != -1)
		            return i;
		    }
		    return -1;
		  },
		
		
		escapeDots : function (text) {
		    return text.replace(/\/\./g, "\\$&");
		},
		  
//		getDomain : function(url,maxLength)
//		{
//		   if (url == null || url.length == 0)
//		      return "";
//		   
//		   //skip the 'HTTP://' 
//		   url = url.substring(7);
//		   if(url.length < maxLength){
//			   return url;
//		   }
//		   else{
//			   return url.substring(0,maxLength);
//		   }
//		},
		
		
		getLastCharactersOfUrl : function(url,maxLength)
		{
		   if (url == null || url.length == 0)
		      return "";
		   
		   if(url.length < maxLength){
			   return url;
		   }
		   else{
			   var fromIndex = url.length - maxLength;
			   return url.substring(fromIndex);
		   }
		},
		
		getFirstCharactersOfUrl : function(url,maxLength)
		{
		   if (url == null || url.length == 0)
		      return "";
		   
		   if(url.length < maxLength){
			   return url;
		   }
		   else{
			   return url.substring(0,maxLength) + "...";
		   }
		},
		
//		input: 2011-12-10T23:00:00Z 
		parse_date : function(string) {
//		    var date = new Date();
//		    var parts = String(string).split(/[- : T Z]/);
//
//		    date.setFullYear(parts[0]);
//		    date.setMonth(parts[1]);
//		    date.setDate(parts[2]);
//		    date.setHours(parts[3]);
//		    date.setMinutes(parts[4]);
//		    date.setSeconds(parts[5]);
//		    date.setMilliseconds(0);
//		    return date;
		    
		    return humaneDate(string);
		},
		
	
	
};


/*
* JavaScript Pretty Date
* Copyright (c) 2008 John Resig (jquery.com)
* Licensed under the MIT license.
*/
 
// Takes an js date
// long ago the date represents.
function prettyDate(time) {

    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ){
        return;
    }

    return day_diff == 0 && (
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
} 


/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 *
 * Licensed under the MIT license.
 */

function humaneDate(date, compareTo){

    if(!date) {
        return;
    }

    var lang = {
            ago: 'Ago',
            from: '',
            now: 'Just Now',
            minute: 'Minute',
            minutes: 'Minutes',
            hour: 'Hour',
            hours: 'Hours',
            day: 'Day',
            days: 'Days',
            week: 'Week',
            weeks: 'Weeks',
            month: 'Month',
            months: 'Months',
            year: 'Year',
            years: 'Years'
        },
        formats = [
            [60, lang.now],
            [3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
            [86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
            [604800, lang.day, lang.days, 86400], // 7 days, 1 day
            [2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
            [31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
            [Infinity, lang.year, lang.years, 31536000] // Infinity, 1 year
        ],
        isString = typeof date == 'string',
        date = isString ?
                    new Date(('' + date).replace(/-/g,"/").replace(/[TZ]/g," ")) :
                    date,
        compareTo = compareTo || new Date,
        seconds = (compareTo - date +
                        (compareTo.getTimezoneOffset() -
                            // if we received a GMT time from a string, doesn't include time zone bias
                            // if we got a date object, the time zone is built in, we need to remove it.
                            (isString ? 0 : date.getTimezoneOffset())
                        ) * 60000
                    ) / 1000,
        token;

    if(seconds < 0) {
        seconds = Math.abs(seconds);
        token = lang.from ? ' ' + lang.from : '';
    } else {
        token = lang.ago ? ' ' + lang.ago : '';
    }

    /*
     * 0 seconds && < 60 seconds        Now
     * 60 seconds                       1 Minute
     * > 60 seconds && < 60 minutes     X Minutes
     * 60 minutes                       1 Hour
     * > 60 minutes && < 24 hours       X Hours
     * 24 hours                         1 Day
     * > 24 hours && < 7 days           X Days
     * 7 days                           1 Week
     * > 7 days && < ~ 1 Month          X Weeks
     * ~ 1 Month                        1 Month
     * > ~ 1 Month && < 1 Year          X Months
     * 1 Year                           1 Year
     * > 1 Year                         X Years
     *
     * Single units are +10%. 1 Year shows first at 1 Year + 10%
     */

    function normalize(val, single)
    {
        var margin = 0.1;
        if(val >= single && val <= single * (1+margin)) {
            return single;
        }
        return val;
    }

    for(var i = 0, format = formats[0]; formats[i]; format = formats[++i]) {
        if(seconds < format[0]) {
            if(i === 0) {
                // Now
                return format[1];
            }

            var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
            return val +
                    ' ' +
                    (val != 1 ? format[2] : format[1]) +
                    (i > 0 ? token : '');
        }
    }
};



function cleanUrl(str, bDeleteDomain)
{
   if (str == null || str.length == 0)
   //   return "";
      
   var i = str.indexOf("http://");
   
   if (i == 0)
   {
      str = str.substr(7);
   }
   else
   {
      i = str.indexOf("https://");
      
      if (i == 0)
      {
         str = str.substr(8);
      }
   }
            
   i = str.indexOf("?");
   if ( i > -1 )
      str = str.substring(0,i);
      
   i = str.indexOf("&");
   if ( i > -1 )
      str = str.substring(0,i);

   for (;;)
   {
      i = str.lastIndexOf("/");
      
      if ( i == -1 || i < (str.length -1) )
         break;
         
      str = str.substring(0,i);         
   }
   
   while (str.indexOf("/") == 0)
      str = str.substring(1);
                              
   if (bDeleteDomain)
   {
      i = str.indexOf("/");
      if ( i > -1 )
      {
         str = str.substring(i+1);   
      }
   }
      
   for (;;)
   {   
      i = str.indexOf("//");
      if (i == -1)
         break;
      str = str.replace(/\/\//g, "/");
   }
   
   return str;
}



