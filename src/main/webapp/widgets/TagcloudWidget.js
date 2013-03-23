(function($) {

	AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
		
		beforeRequest : function() {
			$(this.target).html(AjaxSolr.theme('ajax_loader'));		
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
			var arr = Object.keys( Manager.response.facet_counts.facet_fields.article_title ).map(
				function ( key ) { 
					if(key !== q) {return Manager.response.facet_counts.facet_fields.article_title[key]}
					else {return false;}
				}
			);
			var maxCount = Math.max.apply( null, arr );			
			
			var objectedItems = [];
			for ( var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
				if(facet !== q){
					var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
					//var tag_text = facet + '(' + count + ')';
					objectedItems.push({
						text : facet, 
						weight : parseInt(count/ maxCount * 10), 
						handlers: {click: this.clickHandler(facet)}
					});
				}
			}
			// empty the Html target element and construct the Cloud
			$(this.target).empty();
		    $(this.target).jQCloud(objectedItems);			
		}
	});

})(jQuery);
