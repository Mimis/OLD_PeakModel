/**
 * This class is the main of the project. is where initialize the Manager here
 */

var Manager;

(function($) {

	$(function() {
		
		
		
		//In AJAX Solr, the Manager sends these requests, and passes the responses to each widget for handling.
		Manager = new AjaxSolr.Manager({
			//set url: http://groups.google.com/group/ajax-solr/browse_thread/thread/2e7c6f359234cc59/d2cff193e02fd9cd?lnk=gst&q=solrUrl#d2cff193e02fd9cd
//			solrUrl : 'http://localhost:8080/solr/core0/'
			solrUrl : 'http://178.79.168.58/solr/core1/'
		});

		
		/**
		 * Any widget inheriting from AbstractFacetWidget takes a required field property, 
		 * identifying the facet field the widget will handle. Note that, in our example, 
		 * the target HTML element is conveniently named after the Solr field. This may not 
		 * be the case in your application; set your field property accordingly.
		 * 
		 */
		//Before we define any methods on the widget, let’s add an instance of the widget to the Manager in reuters.js:
		Manager.addWidget(new AjaxSolr.ResultWidget({
			id : 'result',    //Every widget takes a required id, to identify the widget, and an optional target
			target : '#docs'  //The target is usually the CSS selector for the HTML element that the widget updates after each Solr request.
		}));
		
		
		

			 
		  
		
		//PAGINATORS!!!  only BOTTOM
		Manager.addWidget(new AjaxSolr.PagerWidget({
			id: 'pager2',
		    target: '#pager2',
		    prevLabel: '&larr; Previous',
		    nextLabel: 'Next &rarr;',
		    innerWindow: 1,
		    mini_sum_results_target: '#mini_result_message'
		    //OLD IMPLEMENTATION FOR #mini_result_message
//		    renderHeader: function (perPage, offset, total) {
//		    	$('#mini_result_message').html($('<small/>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total + ' jobs'));
//		    }
		}));
		
		
		/*
		 * Now, add three TagcloudWidget instances, one for each facet field:
		 */
		var fields = [ 'company_name', 'job_title','location' ];
		for (var i = 0, l = fields.length; i < l; i++) {
		  Manager.addWidget(new AjaxSolr.TagcloudWidget({
		    id: fields[i],
		    target: '#' + fields[i],
		    field: fields[i],
		    maxLength : 15 //max number of characters to display for each Tag
		  }));
		}

		/*
		 * Current Search Widjet ; Facet Holder part
		 */		
		Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
			id : 'currentsearch',
			target : '#facet_holder' //previous element id:#selection
		}));
		

		/*
		 * Text Widget - Search the 'AllText' field 
		 */		
		Manager.addWidget(new AjaxSolr.TextWidget({
			id : 'text',
			target : '#keyword_query',
			button_target : '#search_form'
		}));
		
		/*SEARCH BOXES!!ONE FOR KEYWORDS AND ONE FOR LOCATION
		 * AutoComplete Search - The autocompletion widget will take a custom fields parameter,
		 * listing the facet fields on which to perform auto-completion. By not hard-coding these
		 * facet fields, we make the widget re-usable.
		 */
//		Manager.addWidget(new AjaxSolr.AutocompleteWidget({
//			id : 'text',
//			target : '#keyword_query', 
//			button_target : '#search_form',
//			field : 'allText',
//			fields : [ 'company_name', 'job_title' ]
//		}));
		
		Manager.addWidget(new AjaxSolr.AutocompleteWidget({
			id : 'text2',
			target : '#location_query', 
			button_target : '#search_form',
			field : 'location',
			fields : [  'location' ]
		}));
		
		
		
		
		/**
		 * Browser Back Button/Bookmark: Exposing parameters on url
		 */
		Manager.setStore(new AjaxSolr.ParameterHashStore());
		//Finally, list the parameters that your widgets allow the user to change under the store’s exposed property, for example:
		Manager.store.exposed = [ 'fq', 'q', 'start', 'group.field', 'fl' ];
		
		
		/*
		 *  once the DOM is ready, we’ll initialize a instance of the Manager. (
		 *  Here we call the Init functions of the Widgets!!!!
		 */
		Manager.init();
		
		//use the ParameterStore addByValue API method right now to build a basic query
		Manager.store.addByValue('q', '*:*');
//		sort by extraction date:
//		Manager.store.addByValue('sort', 'extraction_date desc');
		//sort by score...example
		Manager.store.addByValue('sort', 'score desc');
				
		
		
		//Mimis: add specific fields to return(we dont want the detail pages text everytime we search)
		Manager.store.addByValue('fl', ['id','score','job_title','recordText','homepage_url','extraction_date','company_name','location','description','detail_page_url','detail_page_snapshot_path','company_snapshot_path'])
		
		/*
		 * First, add the Solr parameters to the Manager for faceting in reuters.js:
		 */
		var params = {
			facet : true,
			'facet.field' : [ 'company_name','job_title' ,'location'], //These fields are out facet fields
			'facet.limit' : 10, //display only 10 facet values
			'facet.offset' : 0,
			'facet.mincount' : 1,
			'json.nl' : 'map',
			'rows' : 10   //THIS IS THE NUMBER OF RESULTS THAT WE RETURN EVERY QUERY
		};
		for ( var name in params) {
			Manager.store.addByValue(name, params[name]);
		}
		//To finish this iteration, check if we can talk to Solr using the AbstractManager doRequest API method:
		Manager.doRequest();
	});

})(jQuery);
