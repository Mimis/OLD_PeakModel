/**
 * This class is the main of the project. is where initialize the Manager here
 */

var Manager;

(function($) {

	$(function() {
		
		//this our all the shards
		var shards = [ 'core1950','core1960','core1970','core1980','core1990'];

		//In AJAX Solr, the Manager sends these requests, and passes the responses to each widget for handling.
		Manager = new AjaxSolr.Manager({
			//set url: http://groups.google.com/group/ajax-solr/browse_thread/thread/2e7c6f359234cc59/d2cff193e02fd9cd?lnk=gst&q=solrUrl#d2cff193e02fd9cd
			solrUrl : 'http://localhost:8080/solr/'
		});
 

			//NOT IN USE FOR SEMANTIC VIEW
//		/**
//		 * Any widget inheriting from AbstractFacetWidget takes a required field property, 
//		 * identifying the facet field the widget will handle. Note that, in our example, 
//		 * the target HTML element is conveniently named after the Solr field. This may not 
//		 * be the case in your application; set your field property accordingly.
//		 * 
//		 */
//		//Before we define any methods on the widget, let’s add an instance of the widget to the Manager in reuters.js:
//		Manager.addWidget(new AjaxSolr.ResultWidget({
//			id : 'result',    //Every widget takes a required id, to identify the widget, and an optional target
//			target : '#docs'  //The target is usually the CSS selector for the HTML element that the widget updates after each Solr request.
//		}));
//		
//				
//		//PAGINATORS!!!  only BOTTOM
//		Manager.addWidget(new AjaxSolr.PagerWidget({
//			id: 'pager2',
//		    target: '#pager2',
//		    prevLabel: '&larr; Previous',
//		    nextLabel: 'Next &rarr;',
//		    innerWindow: 1,
//		    mini_sum_results_target: '#mini_result_message'
//		}));
		

		
		Manager.addWidget(new AjaxSolr.ShowResultInfoWidget({
			id: 'showResults',
		    target: '#mini_result_message'
		}));

		/*
		 * TagcloudWidget
		 */
		var fields = ['article_title' ];
		for (var i = 0, l = fields.length; i < l; i++) {
		  Manager.addWidget(new AjaxSolr.TagcloudWidget({
		    id: 'tagcloud' + fields[i],
		    target: '#' + fields[i],
		    field: fields[i]
		  }));
		}

		/*
		 * Time Series GraphWidget
		 */	
		Manager.addWidget(new AjaxSolr.TimeSeriesGraphWidget({
			id: 'graph_date',
			target: 'date',
			field: 'date',
			parseTime:true
		}));
		Manager.addWidget(new AjaxSolr.TimeSeriesGraphWidget({
			id: 'graph_title',
			target: 'tf-rank',
			field: 'article_title',
			parseTime:false
		}));
		
		
		
		/*
		 * Current Search Widget ; Facet Holder part
		 */		
		Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
			id : 'currentsearch',
			target : '#facet_holder'
		}));
		
		/*
		 * Date Search Widget -  
		 */	
		Manager.addWidget(new AjaxSolr.DateWidget({
			id : 'dateFilter',
			target : '#date_query',
			field : 'date',
			shards : shards, 
			form_target : '#search_form',
			range_target : '#range_query'	
		}));
		
		/*
		 * Text Search Widget 
		 */		
		Manager.addWidget(new AjaxSolr.TextWidget({
			id : 'text',
			target : '#keyword_query',
			form_target : '#search_form'
		}));
		
		
		
		
		
		/**
		 * Browser Back Button/Bookmark: Exposing parameters on url
		 */
		Manager.setStore(new AjaxSolr.ParameterHashStore());
		//Finally, list the parameters that your widgets allow the user to change under the store’s exposed property, for example:
		Manager.store.exposed = [ 'fq', 'q', 'start', 'group.field', 'fl', 'shards' ];
		
		
		/*
		 *  once the DOM is ready, we’ll initialize a instance of the Manager. (
		 *  Here we call the Init functions of the Widgets!!!!
		 */
		Manager.init();
		
		//use the ParameterStore addByValue API method right now to build a basic query
		Manager.store.addByValue('q', 'democratie');
//		sort by extraction date:
//		Manager.store.addByValue('sort', 'extraction_date desc');
		//sort by score...example
		Manager.store.addByValue('sort', 'score desc');
				
		
		
		//Mimis: add specific fields to return
		Manager.store.addByValue('fl', ['id','score','article_url','article_title']);  
		
		/*
		 * First, add the Solr parameters to the Manager for faceting in reuters.js:
		 */
		var params = {
			facet : true,
			'facet.field' : ['article_title', 'date'], //These fields are out facet fields
			'facet.limit' : 100, //display only 10 facet values
			'facet.offset' : 0,
			'facet.mincount' : 1,
			'json.nl' : 'map',
			'rows' : '0'   //THIS IS THE NUMBER OF RESULTS THAT WE RETURN EVERY QUERY
		};
		for ( var name in params) {
			Manager.store.addByValue(name, params[name]);
		}
		
		//set an initial core for servlet
		Manager.setServlet(shards[0]+'/select');
		//To finish this iteration, check if we can talk to Solr using the AbstractManager doRequest API method(use the first shard to search):
		Manager.doRequest();
	});

})(jQuery);
