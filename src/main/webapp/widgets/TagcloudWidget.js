(function($) {

	AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
		
		beforeRequest : function() {
			$(this.target).html(AjaxSolr.theme('ajax_loader'));		
			$(this.target_desc).empty();
		},

		afterRequest : function() {
			//in case of the display of the detail pages we dont have any ngramm count...
			if (this.manager.response.ngramm === undefined) {
				$('#'+this.target).html(AjaxSolr.theme('no_ngrams_returned'));
				return;
			}
			if (this.manager.response.ngramm[this.field] === undefined) {
				$(this.target).html(AjaxSolr.theme('no_items_found'));
				return;
			}

			
			
			var objectedItems = [];
			for ( var term in this.manager.response.ngramm[this.field]) {
				var termStats = this.manager.response.ngramm[this.field][term];
				var idf = termStats.idf;
				var tf = termStats.tf;
				var df = termStats.df;
				
				objectedItems.push({
					text : term, 
					weight : 5,
					handlers: {click: this.clickHandler(term)}
				});
				
			}
			// empty the Html target element and construct the Cloud
			$(this.target).empty();
			$(this.target).jQCloud(objectedItems);			
		}
	});

})(jQuery);
