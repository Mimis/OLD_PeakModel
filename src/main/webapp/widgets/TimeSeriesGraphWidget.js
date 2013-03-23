(function($) {

	AjaxSolr.TimeSeriesGraphWidget = AjaxSolr.AbstractFacetWidget.extend({
			 
		beforeRequest : function() {
			$('#'+this.target).empty();
		},

		afterRequest : function() {
			// empty the Html target element
			$('#'+this.target).empty();

			//in case of the display of the detail pages we dont have any facet count...
			if (this.manager.response.facet_counts === undefined) {
				return;
			}
			
			if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
				$('#'+this.target).html(AjaxSolr.theme('no_items_found'));
				return;
			}
			
            morrisTemplate = {
                    element: this.target,
                    data: [
                    ],
                    xkey: 'facet',
                    ykeys: ['count'],
                    labels: ['Frequency'],
                    parseTime: this.parseTime 
                  }
                  
      	    var objectedItems = [];
            var index = 0;
            for ( var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
            	var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
            	//if its date then round date on months and SumUp Counts for the same month
            	var previousCount = 0;
            	if(this.parseTime){
            		facet = facet.substring(0,7) + '-01'
            		var hist = objectedItems.filter(function (f) { return f.facet === facet });
            		if(hist[0] !== undefined){
            			previousCount = hist[0].count;
            			objectedItems[hist[0].index].count = count + previousCount;
            		}
            	}
            	//if is a new facet
            	if(previousCount === 0){
	            	objectedItems.push({
	            		facet : facet,
	            		count : count,
	            		index : index++
	            	});
            	}
            }            
            morrisTemplate.data = objectedItems;
            Morris.Line(morrisTemplate);
		}
	});

})(jQuery);
