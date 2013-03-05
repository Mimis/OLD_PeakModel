(function($) {

	// For a TextWidget that uses the q parameter, see:
	// https://github.com/evolvingweb/ajax-solr/blob/gh-pages/examples/reuters/widgets/TextWidget.q.js: WE SHOULD USE THE SET FUNCTION
	AjaxSolr.DateWidget = AjaxSolr.AbstractFacetWidget.extend({

		init : function() {
			var self = this;
			//find the element 'input' in the Target element(id="search") - keydown is  when we push enter
			$(this.target).find('input').bind('keydown', function(e) {
				if (e.which == 13) {
					var value = $(this).val();
				
					console.log('date:'+value+" "+self.shards);
					

//					1.Get Date
//					2.Is Date format OK?
//					3.Set servlet to coreYYY0 if exist in this.shards
//						Manager.setServlet('core'+self.shards[3]+'/select');
//					4. Add date filter query
//						self.field + ':[date TO date]'
//					5.Add additional Shards if exist based on the duration/range
						
					
					
					//add a filter query if it is not seen before and send a request to Solr
//					if (value && self.set(value)) {
//						self.manager.doRequest(0);
//					}
				}
			});
			//search button				
			$(this.button_target).find('button').bind('click', function(e) {
				var value = $(self.target).find('input').val();
				
				console.log('date:'+value);
//				if (value && self.set(value)){
//					self.manager.doRequest(0);
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
