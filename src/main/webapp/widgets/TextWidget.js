(function($) {
	
	AjaxSolr.TextWidget = AjaxSolr.AbstractTextWidget.extend({

		init : function() {
			var self = this;
			
            $(this.form_target).bind('submit', function() {
                var value = $(self.target).find('input') .val();
                if (value) { 
                	self.set(value);
                }
                self.manager.doRequest(0);
                return false;
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
