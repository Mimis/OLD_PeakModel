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
			
			/*
			 * if there is no the ACTIOn field then is  
			 * a normal Query which got a list of response Documents
			 */ 
			if(this.manager.response.responseHeader.params.fl.split(',').length > 3 ){
				$(this.target).empty();
				
				for ( var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
					// get the current result document
					var doc = this.manager.response.response.docs[i];
										
					/*
					 *  1.html wrapper Template for the whole job snippet 
					 */
					var company_img_logo_path = 'http://178.79.168.58/company_logo/'+ doc.company_snapshot_path;
							var description_text = this.manager.response.highlighting[doc.id] != null
									&& this.manager.response.highlighting[doc.id].description != null ? this.manager.response.highlighting[doc.id].description.toString()
									: doc.description;
					var descriptions = this.getTwoColumnDescription(description_text);
					//$(this.target).append(AjaxSolr.theme('result_prismatic', doc, AjaxSolr.theme('snippetBootstrapTab', doc,AjaxSolr.theme('two_column_content', descriptions.left,descriptions.right))));
					$(this.target).append(AjaxSolr.theme('result_companyLogo', doc, company_img_logo_path, AjaxSolr.theme('two_column_content', descriptions.left,descriptions.right)));

					
					
					/*
					 * insert JOB TITLE => Link to Detail Page SnapShot
					 */
					var header_id = '#header_' + doc.id;	
					var detail_pageModal_href = 'detailPageModal_' + doc.id;
					var explanationTitleLinkText = "See SnapShot Of the job Detail Page!";
					//fancy box aporach:
					//$(header_id).append(AjaxSolr.theme('title_link',  doc.job_title , this.detailHandler('id',doc.id),explanationTitleLinkText,detail_pageModal_href));
							var job_title_text = this.manager.response.highlighting[doc.id] != null
									&& this.manager.response.highlighting[doc.id].job_title != null ? this.manager.response.highlighting[doc.id].job_title.toString()
									: doc.job_title;
					$(header_id).append(AjaxSolr.theme('title_link',  job_title_text , null,explanationTitleLinkText,detail_pageModal_href));
					
					/*
					 * Job Detail page Preview Modal window:Create and append to this.Target(#Docs)
					 */
					var detail_page_img_src = 'http://178.79.168.58/screenshots/'+ doc.detail_page_snapshot_path.replace(/.*SCREENSHOTS\//,"");
					$(this.target).append(AjaxSolr.theme('modal', doc, detail_page_img_src));
					
					
					/*
					 * insert COMPANY NAME => Link for facet query by Company Seed Url(we retreive all the companys jobs);
					 * we may try with different facet values instead of Seed Url, such as doc.seed_name, doc.resource_url
					 */ 
					var company_id = '#company_' + doc.id;	
					var explanationCompanyNameLinkText = "Get all Jobs from this Company!";
					var company_name_Anchor =  typeof doc.company_name === "undefined" ?  "undefined" : doc.company_name;
					$(company_id).append(AjaxSolr.theme('moreinfo_link',  company_name_Anchor , this.facetHandler('company_name', doc.company_name),explanationCompanyNameLinkText));
										

					/*
					 * insert LOCATION  => Link for facet query by Location(we retreive all the jobs from this location);
					 */ 
					var location_id = '#location_' + doc.id;	
					var explanationLocationLinkText = "Get all Jobs from this Location!";
					$(location_id).append(AjaxSolr.theme('moreinfo_link',  doc.location , this.facetHandler('location', doc.location),explanationLocationLinkText));
					
					
					/*
					 * insert ApplyLink => Link to original job detail page
					 */ 
					var detailPage_id = '#detailPage_' + doc.id;	
					var explanationDetailPage_idLinkText = "Go to original job page!";
					$(detailPage_id).append(AjaxSolr.theme('go_to_link',  doc.detail_page_url , "Apply", explanationDetailPage_idLinkText));
					
					
					
					/*
					 * #NOT IN USE ANYMORE...only into test front-end
					 * Display the Company name, extraction date, view all, more info buttons...
					 */
					//FacetLinks: Let’s display each document’s tags. Add the following code inside thefor-loop in afterRequest:
					var items = [];
					//append the SeedName and the Extraction Date tbefore the more info links..
					items = items.concat(AjaxSolr.theme('CompanyNameAndExtarctionDate',  doc.company_name , Utils.parse_date(doc.extraction_date)));
//					items = items.concat(this.facetLinks('seed_url',doc.seed_url , 'View All'));
					items = items.concat(this.detailLinks('id', doc.id, 'More Info'));
					//to be removed - jobs only fron this resource
//					items = items.concat(this.facetLinks('navigation_id',doc.navigation_id, 'resource - to be removed'));	
					//ADD TO THE LIST THE CURRENT ITEM...
					AjaxSolr.theme('list_items', '#links_' + doc.id, items, " - ");
				
					//DetailPageLink theme!! the detail link theme is similar with the facetLink
					//$(this.target).append(AjaxSolr.theme('detail_link',  'More Info' , this.detailHandler('id',doc.id)));
				}
			}
		},

		/**
		 * Make the two column description output: 
		 * 	1)Baseline: get the 2000 characters(if length>2000) and divide by 2 for each column respectively
		 */
		getTwoColumnDescription : function(description){
		   if (description == null || description.length == 0){
			   return {
		        'left': null,
		        'right': null
		    	};  
//		   }else if(url.length < maxLength){
//			   return url;
		   }
		   else{
			   var description_length = description.length;
				if (description_length > 2000) {					
				   return {
					   'left': description.substring(0, 1000),
					   'right': description.substring(1000, 2000)
				   };
				}
				else{
					var boarder_index = Math.round(Math.floor(description_length/2));
					return {
				        'left': description.substring(0, boarder_index),
				        'right': description.substring(boarder_index, description_length)
					};
				}
		   }
		},

				
		/**
		 * Create the Detail Page Links
		 * this function may be useless-may we can put it straightaway to the links var
		 */
		detailLinks : function(detail_field, detail_values, anchorText) {
			var links = [];
			if (detail_values) {
				links.push(AjaxSolr.theme('moreinfo_link',  anchorText , this.detailHandler(detail_field, detail_values)));
			}
			return links;
		},
		//Detail Page - More info link...
		detailHandler : function(detail_field, detail_value) {
			var self = this;
			return function() {

				/**
				 * I think we should not to do facet query here...but if i add facet=false then i got a error in tagCloud Widget
				 */
				var flArray = self.manager.store.get('fl').value;
				//query Solr by Doc Id in order to find the Detail page
				self.manager.store.addByValue('facet', false);
				self.manager.store.addByValue('q', detail_field + ':' + detail_value);
				//here we change bettween html source code and url 
				self.manager.store.addByValue('fl', ['id','detail_page_snapshot_path','detail_page_url']);
				self.manager.doRequest(0);
				
				//reset the query paramaters
				//use the ParameterStore addByValue API method right now to build a basic query:
				self.manager.store.addByValue('facet', true);
				self.manager.store.addByValue('q', '*:*');
				//Mimis: add specific fields to return(we dont want the detail pages text everytime we search)
				//self.manager.store.addByValue('fl', ['id','navigation_id','job_title','recordText','extraction_date','resource_url','seed_url','detail_page_url','seed_name'])
				self.manager.store.addByValue('fl', flArray)

				return false;
			};
		},
		
		
		
		/**
		 * To get the afterRequest to run, we’ll need to define the method facetLinks and its helper facetHandler:
		 * The below creates links for browsing by topic, organization, or exchange. Clicking a link will reset the filter queries, 
		 * add a filter query, and send a Solr request, setting the Solr start parameter to 0.
		 * See the ParameterStore remove and addByValue, and the AbstractManager doRequest API methods.
		 * 
		 * These Functions Create the links in the result theme for making new searched 
		 * with input the tag field that we choose  at the afterRequest function above!
		 */
		facetLinks : function(facet_field, facet_values, anchorText) {
			var links = [];
			if (facet_values) {
//				for ( var i = 0, l = facet_values.length; i < l; i++) {
					//links.push(AjaxSolr.theme('facet_link',  facet_values[i], this.facetHandler(facet_field, facet_values[i])));
					links.push(AjaxSolr.theme('moreinfo_link',  anchorText , this.facetHandler(facet_field, facet_values)));
//				}
			}
			return links;
		},

		/**
		 * Create The (Filter)Query
		 */
		facetHandler : function(facet_field, facet_value) {
			var self = this;
			return function() {
				self.manager.store.remove('fq');
				//escape Special Characters
				self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));	
				self.manager.doRequest(0);
				return false;
			};
		},

		
		
		/**
		 * To implement the “more” link, we implement another abstract method: init. 
		 * A widget’s init method is called once when the Manager’s init method is called.
		 * 
		 * Dependecy:
		 * Add the JavaScript file for jQuery’s livequery plugin (in jQuery 1.3, you can use jQuery.live):
		 *<script type="text/javascript" src="js/jquery.livequery.js"></script>
		 */
		init : function() {
			$('a.more').livequery(function() {
				$(this).toggle(function() {
					$(this).parent().find('span').show();
					$(this).text('less');
					return false;
				}, function() {
					$(this).parent().find('span').hide();
					$(this).text('more');
					return false;
				});
			});
		}
	});

})(jQuery);