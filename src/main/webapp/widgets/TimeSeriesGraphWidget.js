(function($) {

	AjaxSolr.TimeSeriesGraphWidget = AjaxSolr.AbstractFacetWidget.extend({
			 
		beforeRequest : function() {
			$(this.target).empty();
		},

		afterRequest : function() {
			// empty the Html target element
			$(this.target).empty();

			//in case of the display of the detail pages we dont have any facet count...
			if (this.manager.response.facet_counts === undefined) {
				return;
			}
			
			if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
				$(this.target).html(AjaxSolr.theme('no_items_found'));
				return;
			}
			
            morrisTemplate = {
                    element: this.field,
                    data: [
                    ],
                    xkey: 'facet',
                    xLabels: "Date",
                    ykeys: ['count'],
                    labels: ['Frequency']
                  }
                  
      	    var objectedItems = [];
            for ( var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
            	var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
            	objectedItems.push({
            		facet : facet,
            		count : count
            	});
            }
            morrisTemplate.data = objectedItems;
            Morris.Line(morrisTemplate);
		}
	});

})(jQuery);
