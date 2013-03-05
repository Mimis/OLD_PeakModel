(function($) {

	/*
	 * Let’s display the documents in the Solr response by creating a results
	 * widget. We can create a new widget, ResultWidget.js, by inheriting from
	 * AbstractWidget, (src="lib/core/AbstractWidget.js">) from which every AJAX
	 * Solr widget inherits.
	 */
	AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
		start: 0,

		/**
		 * We implement a final abstract method, beforeRequest, 
		 * to display a loading spinner while waiting for Solr to return a response.
		 */
		beforeRequest : function() {
			$(this.target).html(AjaxSolr.theme('ajax_loader'));	
		},

		/**
		 * Now, we implement the abstract method afterRequest, which each widget runs after the Manager receives the Solr
		 * response. The Manager stores the response in Manager.response  (which the widgets may access through this.manager.response).
		 */
		afterRequest : function() {
			

			/*
			 * Mimis: detect Query Responce or Detail Page Responce!!!
			 * get the fields that the responce got in order to check if is Query Responce or Detail Page Responce
			 */
			var queryFields = this.manager.response.responseHeader.params.fl;
//			var detalPageTextIndex = queryFields.search("detail_page_text");
			
			$(this.target).empty();
				
			for ( var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
				// get the current result document
				var doc = this.manager.response.response.docs[i];
									
				/*
				 *  1.html wrapper Template for the whole job snippet 
				 */
				var title = doc.article_title === '' ? 'Undefined' : doc.article_title; 
				$(this.target).append(AjaxSolr.theme('doc_wrapper',doc,AjaxSolr.theme('go_to_link',doc.article_url,title)));				
			}
		}	
		
	});

})(jQuery);