(function($) {

	AjaxSolr.RawTF_TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
		
		beforeRequest : function() {
			$(this.target).html(AjaxSolr.theme('ajax_loader'));		
			$(this.target_desc).empty();
		},

		afterRequest : function() {
			//in case of the display of the detail pages we dont have any facet count...
			if (this.manager.response.facet_counts === undefined) {
				return;
			}
			if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
				$(this.target).html(AjaxSolr.theme('no_items_found'));
				return;
			}


			var q = this.manager.response.responseHeader.params.q;
			//[EXCLUDE QUERY 'Q']get all values into an array in order to get the MAximum frequency(needs for cloud weight)
			var maxCount = this.getMaxCount(Manager.response.facet_counts.facet_fields.article_title,q);
			
			var objectedItems = [];
			for ( var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
				if(facet !== q && !this.isNumber(facet)){
					var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
					//var tag_text = facet + '(' + count + ')';
					objectedItems.push({
						text : facet, 
						weight : parseInt(count/ maxCount * 10), 
						count : count,
						handlers: {click: this.clickHandler(facet)}
					});
				}
			}
			// empty the Html target element and construct the Cloud
			$(this.target).empty();
			var facetLength = objectedItems.length;

			/*
			* Display First N 
			*/
			objectedItems.sort(function (a, b) {   return b.count < a.count ? -1 : 1;   });
			var objectedItemsTopN = objectedItems.slice(0, this.final_nr_docs < facetLength ? this.final_nr_docs : facetLength);	
			$(this.target).jQCloud(objectedItemsTopN);			

			/*
			* Display Bottom N 
			*/
			var startIndex = facetLength - this.final_nr_docs <= 0 ? 0 : facetLength - this.final_nr_docs;
			var objectedItemsBottomN = objectedItems.slice(startIndex, facetLength);	
			$(this.target_desc).jQCloud(objectedItemsBottomN);			
		},
		
		
		
		/**
		 * Get the maximun count from the given article title object
		 */
		getMaxCount: function (article_title_response, q) {
			
			var arr = Object.keys( article_title_response ).map(
					function ( key ) { 
						if(key !== q) {return article_title_response[key]}
						else {return false;}
					}
				);
			return Math.max.apply( null, arr );			
		},

		isNumber: function (n) {
		  return !isNaN(parseFloat(n)) && isFinite(n);
		}

	});

})(jQuery);
