(function($) {

	/**
	 * Here after each request we display the filter queries and 
	 * also given the link to remove them all by send another request to solr
	 */
	AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
		start: 0,

//		init : function() {
//			$(this.target).html(this.search_box);
//		},

		
		/*
		 * The above afterRequest method collects all the fq parameter values using 
		 * the ParameterStore values API method. For each parameter value, it creates 
		 * a link displaying the parameter value which, when clicked, removes the parameter 
		 * value (using the ParameterStore removeByValue API method) and sends a request to
		 * Solr. If any links were created, it displays the links. If no links were created,
		 * it displays the text “Viewing all documents!”
		 * 
		 */
		afterRequest : function() {
			var self = this;
			var links = [];

			
			
			 var q = this.manager.store.get('q').val();
			    if (q != '*:*') {
			      links.push($('<a class="badge badge-info" href="#"/>').text('(x) ' + q).click(function () {
			        self.manager.store.get('q').val('*:*');
			        self.doRequest();
			        return false;
			      }));
			    }

			   
			    
			    
			var fq = this.manager.store.values('fq');
			for ( var i = 0, l = fq.length; i < l; i++) {
				links.push($('<a class="badge badge-info" href="#"/>').text( fq[i] + ' (x) ').click(
						self.removeFacet(fq[i])));
			}
			
			
			/*
			 * Lastly, let’s add a link to remove all current filters TO THE BEGGINING OF THE LIST(unshift). 
			 * If more than one link was created, it creates a link displaying the words “remove all,” which, when clicked, 
			 * removes all fq parameters (using the ParameterStore remove API method) and sends a request to Solr.
			 */
			if (links.length > 1) {
				links.unshift($('<a class="badge badge-info" href="#"/>').text('all(x)').click(
						function() {
					        self.manager.store.get('q').val('*:*');
					        self.manager.store.remove('fq');
					        self.doRequest();
							return false;
						}));
			}

			
			if (links.length) {
				AjaxSolr.theme('list_items2', this.target, links);
			} else {
				//$(this.target).html('<div>Viewing all documents!</div>');
//				$(this.target).html(this.search_box);
				//here i need to remove only the <a> tags, not the Input element that we use for searching!!
//				$('a[class*="badge badge-info"]')
				$(this.target).html('');
			}
		},
		

		/*
		 * (The removeFacet method is necessary to work around JavaScript closures.)
		 */
		removeFacet : function(facet) {
			var self = this;
			return function() {
				if (self.manager.store.removeByValue('fq', facet)) {
					self.manager.doRequest(0);
				}
				return false;
			};
		}

	});

})(jQuery);
