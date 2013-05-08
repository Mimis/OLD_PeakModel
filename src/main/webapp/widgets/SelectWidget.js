(function($) {
	
	AjaxSolr.SelectWidget = AjaxSolr.AbstractTextWidget.extend({

		init : function() {
			var self = this;
			
            $(this.target).change('select', function() {
                var methodSelected = $(self.target).find('select').val();
    	        self.manager.store.remove(self.solr_param);
		        self.manager.store.addByValue(self.solr_param, methodSelected);
		        self.doRequest();
                return false;
            });
		}
		
	});

})(jQuery);
