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
			solrUrl : 'http://localhost:8080/solr/'
		});


		//Show total results and response time: 5125546 Articles in 13.007 secs
		Manager.addWidget(new AjaxSolr.ShowResultInfoWidget({
			id: 'showResults',
		    target: '#mini_result_message'
		}));
		
		

		/*
		 * TagcloudWidget 
		 */
		
		var fields = [ 'article_title', 'paragraph' ];
		for (var i = 0, l = fields.length; i < l; i++) {
		 	Manager.addWidget(new AjaxSolr.TagcloudWidget({
			    id: 'ngram_tag_'+fields[i],
			    target: '#ngram_tag_'+fields[i],
			    field: fields[i]
			}));
		}

		/*
		 * Select Method Widget
		 */
		var fields 		= [ 'method','topNgrams','topDocs'];
		var solr_param  = [ 'ng.sort','ng.topN','rows'];
		for (var i = 0, l = fields.length; i < l; i++) {
		 	Manager.addWidget(new AjaxSolr.SelectWidget({
			    id: 'select_'+fields[i],
			    target: '#select_'+fields[i],
			    solr_param: solr_param[i]
			}));
		}
		
		 
	

		/*
		 * Time Series GraphWidget
		*/
		Manager.addWidget(new AjaxSolr.TimeSeriesGraphWidget({
			id: 'graph_date',
			target: 'date',
			field: 'date',
			parseTime: true
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
		Manager.addWidget(new AjaxSolr.SearchDateWidget({
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
		Manager.store.addByValue('q', 'test');
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
			facet : false,
			'facet.field' : ['date'], //These fields are out facet fields
			'facet.limit' : 100,
			'facet.offset' : 0,
			'facet.mincount' : 1,
			'json.nl' : 'map',				
			'tv.fl' :  ['article_title','paragraph'],
			'tv.tf' : true,
			'tv.df' : true,
			'ng.sort' : 'tf',
			'ng.topN' : 10,
			'rows' : '10'   //THIS IS THE NUMBER OF RESULTS THAT WE RETURN EVERY QUER by default
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
