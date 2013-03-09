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
		//			1.Get Date if not empty && Is Date format OK?&& isGoodFormat()
					if(value ){
						console.log('SET FILTER QUERY + SHARDS;date.buton  => non emptydate:'+value);
		//				3.Set servlet to coreYYY0 if exist in this.shards
		//					Manager.setServlet('core'+self.shards[3]+'/select');
		//				4. Add date filter query
		//					self.field + ':[date TO date]'
		//				5.Add additional Shards if exist based on the duration/range
					}
		//			2. else Query ALL Shards
					else{
						console.log('SET ALL SHARDS 4 QUERY;date.buton  => emptydate:'+value);
						Manager.setServlet(self.shards[0]+'/select');
						console.log("allShards:" + Utils.getAllShardsAsSolrParamater(self.shards));
						self.manager.store.get('shards').val(Utils.getAllShardsAsSolrParamater(self.shards));
					    	self.manager.store.get('q').val('ini');

						self.manager.doRequest();
					}
				}
					//			if (value && self.set(value)){
					//				self.manager.doRequest(0);
					//			}
			});
			//search button				
//			$(this.button_target).find('button').bind('click', function(e) {
//				var value = $(self.target).find('input').val();
//				console.log('date:'+value+" "+self.shards);
//			});	
		},

		/**
		 * Delete the content of the Target/Search Element after Query!
		 */
		afterRequest : function() {
//			$(this.target).find('input').val('');
		}
	});

})(jQuery);
