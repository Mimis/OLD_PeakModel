(function($) {

	
	AjaxSolr.ShowResultInfoWidget = AjaxSolr.AbstractWidget.extend({
		start: 0,

		beforeRequest : function() {
			$(this.target).empty();
		},

		afterRequest : function() {		
		    var solr_responceTimeMs = this.manager.response.responseHeader.QTime;
		    var solr_responceTimeSecs = solr_responceTimeMs / 1000;
		    var totalResults = parseInt(this.manager.response.response.numFound);
		    $(this.target).text( totalResults + ' Articles ' +	' in ' + solr_responceTimeSecs +' secs ');
		}			
	});

})(jQuery);