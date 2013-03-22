(function($) {

	AjaxSolr.DateWidget = AjaxSolr.AbstractFacetWidget.extend({

		init : function() {
			var self = this;						

            $(this.form_target).find('button').bind('click', function(e) {
                var dateValue = $(self.target).find('input').val();
                
                
        		//1.Get Date if not empty && Is in good Date format (YYYY)
				if(dateValue && dateValue.length == 4 && /^\d+$/.test(dateValue)){
					//Set servlet to coreYYY0 if exist in this.shards
					var CoreToUse = 'core' + dateValue.substring(0,3) + '0';
					if($.inArray(CoreToUse, self.shards) > -1){
						Manager.setServlet(CoreToUse + '/select');
						//get date range if any and add it as filter query
						var rangeDuration =  $(self.range_target).find('input').val();
						if(rangeDuration){
							var startYear = dateValue - rangeDuration;
							var endYear = parseInt(dateValue,10) + parseInt(rangeDuration,10);
							
							self.set('[' + startYear + ' TO ' + endYear + ']');
							//Add additional Shards if exist based on the duration/range
							self.manager.store.get('shards').val(Utils.getDateQueryShardsAsSolrParamater(startYear+'',endYear+'',self.shards));	
						}
						//remove shard parameters since e will use only one core and add filter query for only the given year 
						else { //if(self.isEmpty()){
							self.manager.store.get('shards').val('');	
							var startYear = dateValue + '-01-01';
							var endYear   = dateValue + '-12-31';
							self.set('[' + startYear + ' TO ' + endYear + ']');
						}
					}
				}
				//2.Query all shards
				else {//if(self.isEmpty()){
					Manager.setServlet(self.shards[0]+'/select');
					self.manager.store.get('shards').val(Utils.getAllShardsAsSolrParamater(self.shards));
				}
            });
		},
		
		
		/**
		 * Delete the content of the Target/Search Element after Query!
		 */
		afterRequest : function() {
			$(this.target).find('input').val('');
			$(this.range_target).find('input').val('');
		}
	});

})(jQuery);
