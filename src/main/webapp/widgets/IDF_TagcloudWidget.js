(function($) {

	AjaxSolr.IDF_TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
		
		beforeRequest : function() {
			$(this.target).empty();
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

			//Calculate IDF scores: log10 |N| / df_t; exclude original query
			var objectedItems = [];
			for ( var facet in this.manager.response.facet_counts.facet_fields.article_title) {
				if(facet !== q){
					var count = parseInt(this.manager.response.facet_counts.facet_fields.article_title[facet]);
	                var idf_score = Math.log((this.totalNrDocs/count)) / Math.LN10;
					objectedItems.push({
						text : facet,
						idf: idf_score,
						handlers: {click: this.clickHandler(facet)}
					});
				}
			}
			//get max IDF score
			var maxIdf = this.getMaxIdf(objectedItems,q)
			//assign weights to each word
			for (var i = 0; i < objectedItems.length; i++) {
				var idf = objectedItems[i].idf;
			    objectedItems[i].weight = parseInt(idf/maxIdf * 10);
			}
			
			// empty the Html target element and construct the Cloud
			$(this.target).empty();
		    $(this.target).jQCloud(objectedItems);			
		},
		
		/**
		 * Get the maximun idf
		 */
		getMaxIdf: function (objectedItems, q) {
			var arr = Object.keys( objectedItems ).map(
					function ( key ) { 
						if(key !== q) {return objectedItems[key].idf}
						else {return false;}
					}
				);
			return Math.max.apply( null, arr );			
		}
	});

})(jQuery);
