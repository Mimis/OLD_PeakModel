(function($) {

	// For a TextWidget that uses the q parameter, see:
	// https://github.com/evolvingweb/ajax-solr/blob/gh-pages/examples/reuters/widgets/TextWidget.q.js: WE SHOULD USE THE SET FUNCTION
	AjaxSolr.TextWidget = AjaxSolr.AbstractTextWidget.extend({

		/**
		 * Unlike the tagcloud widget, we cannot use the handy clickHandler API method in the jQuery bind function, because the bind and click handlers behave differently. Instead, we use the AbstractFacetWidget add API method directly. add returns true if the filter query was successfully added 
		 * (a filter query will not be added if it has already been added). Here, if it returns true, the widget sends a request the Solr.
		 */
		init : function() {
			var self = this;
			//find the element 'input' in the Target element(id="search") - keydown is probably when we push enter
			$(this.target).find('input').bind('keydown', function(e) {
				if (e.which == 13) {
					var value = $(this).val();
					//add a filter query if it is not seen before and send a request to Solr
					if (value && self.set(value)) {
						self.manager.doRequest(0);
					}
				}
//				//search button
//				if (self.requestSent === false) {					
//					var value = $(self.target).find('input').val();
//					if (value && self.set(value)){
//						self.manager.doRequest(0);
//					}
//				}

			});
		},

		/**
		 * Delete the content of the Target/Search Element after Query!
		 */
		afterRequest : function() {
			$(this.target).find('input').val('');
		}
	});

})(jQuery);
