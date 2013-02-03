(function($) {

		
	/**
	 * Display CompanyName And ExtarctionDate next to the View All and More Info links
	 */
	AjaxSolr.theme.prototype.CompanyNameAndExtarctionDate = function(CompanyName,ExtractionDate) {
		var output = '<span class="source">'+CompanyName+'</span>';
		output += ' - ';
		output += '<span class="date">'+ExtractionDate+'</span>';
		return output;
	};


	
	/**
	 * AJAX Solr provides a AjaxSolr.theme utility to separate the HTML from the JavaScript.
	 * 
	 * Result Theme 
	 */
	AjaxSolr.theme.prototype.result = function(doc, snippet) {
		var output = '<div class="doc">';
		output += '<h3 id="header_' + doc.id + '"></h3>';
		output += '<span class="location">Location: '+doc.location+'</span>';
		output +=  snippet ;
		output += '<p id="links_' + doc.id + '" class="links"></p>';
		output += '</div>';
		return output;
	};
	
	/**
	 * Initial Result Snippet heavily inspired from Prismatic
	 */
	AjaxSolr.theme.prototype.result_prismatic = function(doc, snippet) {
		var output = '<div class="doc">';
		output += 		'<div class="doc_border"></div>';
		
		//DOC HEADER:doc details and doc title
		output += 		'<div class="doc_header">';
		//doc details and actions
		output += 			'<div class="doc_details">';
		output += 				'<div class="left">';
		//1.COMPANY LOGO
		//2.COMPANY NAME => link to view all companys' jobs
		output += 					'<span class="company_name"  id="company_' + doc.id + '"></span>';
		//items = items.concat(this.facetLinks('seed_url',doc.seed_url , 'View All'));		
		//3.DOC EXTRACTION DATE
		output += 					'<span class="date">'+Utils.parse_date(doc.extraction_date)+'</span>';
		//4.DOC LOCATION => link to view all location's jobs
		output += 					'<span class="location" id="location_' + doc.id+'"></span>';
		output += 				'</div>';	
		//right header doc details: icons for more info,snapsot and go to job's url actions
		//1.APLPLY BUTTON=LINK TO ORIGINAL JOB DETAIL WEB PAGE 
		output += 				'<div class="right">';
		output += 					'<div  class="apply doc_actions"  id="detailPage_' + doc.id+'"></div>';
		output += 				'</div>';
		output += 			'</div>';
		
		//title
		output += 			'<div class="doc_title">';
		output += 				'<h3 id="header_' + doc.id + '"></h3>';
		output += 			'</div>';
		output += 		'</div>';

		//DOC MAIN CONTENT
		output += 		'<div class="doc_content">';
		output +=  			snippet ;
		output += 		'</div>';
		
		
//		output += '<p id="links_' + doc.id + '" class="links"></p>';
		output += '</div>';
		return output;
	};

	/**
	 * Initial Result Snippet using Company Logo(Twiter Bootstrap MEDIA)
	 */
	AjaxSolr.theme.prototype.result_companyLogo = function(doc, company_img_logo_path, snippet) {
		var output = '<div class="doc hero-unit">';

		
		//DOC HEADER
		output += 		'<div class="doc_header">';
		output += 			'<div class="doc_details">';
		output += 				'<div class="media">';
		output +=				'  <a class="pull-left" href="'+ doc.homepage_url +'" target="_blank">';
		output +=				'		<img class="media-object img-polaroid" data-src="'+company_img_logo_path+'" src="'+company_img_logo_path+'">';
		output +=				'  </a>';
		output +=			    '  <div class="media-body">';
		//TITLE
		output += 				'		<p id="header_' + doc.id + '"></p>';

		output += 				'  		<div class="left">';
		output += 				'			<span class="company_name"  id="company_' + doc.id + '"></span>';
		output += 				'			<span class="date">'+Utils.parse_date(doc.extraction_date)+'</span>';
		output += 				'			<span class="location" id="location_' + doc.id+'"></span>';
		output +=			    '  		</div>';
		output += 				'  		<div class="right">';
		output += 				'			<div  class="apply doc_actions"  id="detailPage_' + doc.id+'"></div>';
		output +=			    '  		</div>';
		output +=			    '  </div>';
		output += 			'	</div>';
		output += 		'	</div>';

		output += 			'<div class="doc_title">';

		output += 			'</div>';

		output += 		'</div>';

		//DOC MAIN CONTENT
		output += 		'<div class="doc_content">';
		output +=  			snippet ;
		output += 		'</div>';
		
		
//		output += '<p id="links_' + doc.id + '" class="links"></p>';
		output += '</div>';
		return output;
	};

	
	
	
	
	/**
	 * Snippet Display Theme: bootstrap tab with fields:requirents,description,company
	 */
	AjaxSolr.theme.prototype.snippetBootstrapTab = function(doc,two_column_content) {
		var doc_id=doc.id;
		var output = '';
		//tabs;requirements(default active),description,company
		output += '<ul class="nav nav-tabs">';
		output += '  <li class="active"><a href="#description_' + doc_id + '" data-toggle="tab">Description</a></li>';
		output += '  <li class=""><a href="#about_company_' + doc_id + '" data-toggle="tab">About the Company</a></li>';
		output += '</ul>';
		//content
		output += '<div id="myTabContent" class="tab-content">';
		output +=    '<div class="tab-pane fade active in" id="description_' + doc_id + '">';
		output +=       two_column_content;
		output +=    '</div>';
		output +=    '<div class="tab-pane fade" id="about_company_' + doc_id + '">';
		output +=       '<p>Here must be the main content of the company\'s about page.</p>';
        output += 	 '</div>';
        output += '</div>';

		return output;
	};

	/**
	 * Main Job Description Content display:two columns,ideally each column will have to descriptions
	 * TODO:1)here i need to process the description by getting each paragraph
	 * 		2)The 'snippet' must exist only in a paragraph
	 */
	AjaxSolr.theme.prototype.two_column_content = function(left_description,right_description) {
		var output = '';
		//content
		output += '<div class="left">';
		output +=        left_description ;
		output += '</div>';
		
		output += '<div class="right">';
		//if the right description starts with a paragraph title '<dt>'
		output += right_description.lastIndexOf('<dt', 0) === 0 ? '' :'<br>';
		output +=        right_description ;
		output += '</div>';
		return output;
	};

	/**
	 * Display the resources list.. the SEED_URL for teh resources navigation
	 * Seed Url + link(See Seed's Search Interfaces)
	 */
	AjaxSolr.theme.prototype.resources = function(groupValue) {		
		var output = '<div><h3 id="header_' + groupValue +  '"></h3>';
		//form urls links
		output += '<p id="links_' + groupValue + '" class="links"></p></div>';		
		output += '</div>';
		return output;
	};
	
		

	
	
	
	/**
	 * OLD Snippet Display Theme
	 */
	AjaxSolr.theme.prototype.snippet = function(doc) {
		var output = '';
		if (doc.description.length > 500) {
//			output += '<p>' + ' RecordText:' + doc.recordText.substring(0, 300) + '</p>';
			output +=  doc.description.substring(0, 500);
			output += '<span style="display:none;">' + doc.description.substring(500);
			output += '</span> <a href="#" class="more">more</a>';
		} else {
//			output += '<p>' + ' RecordText:' + doc.recordText  + '</p>';
			output +=  doc.description;
			//record text...
			//output += doc.recordText;
			//extraction date...
			//output += '<br>' + doc.seed_name +' '+Utils.parse_date(doc.extraction_date)
		}
		return output;
	};
	
	/**
	 * Ajac loader html code
	 */
	AjaxSolr.theme.prototype.ajax_loader = function() {
		var ajax_loader_html =  '<div id="loader" class="span10" style="line-height: 115px; text-align: center; padding-top: 300px;">';
		ajax_loader_html +=    		'<img width="35" height="35" src="images/ajax-loader.gif">';
		ajax_loader_html +=     '</div>'
	   	return ajax_loader_html;
	};

	
	
	/**
	 * Modal window
	 */	
	AjaxSolr.theme.prototype.modal = function(doc,img_src) {
		var modal = '';
		modal += '<div id="detailPageModal_'+doc.id+'" class="modal container hide fade" tabindex="-1" style="display: none;" aria-hidden="true">';
		
		modal += '	<div class="modal-header">';
		modal += '			<strong>Job Detail page Snapshot!</strong>';
		modal += '			<a title="Apply!" target="_blank" class="btn btn-success" href="' + doc.detail_page_url + '">Apply!</a>';
		modal += '			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
		modal += '	</div>';
		
		modal += '	<div class="modal-body">';
		modal += '		<img src="'+img_src+'"  style="height: 1500px;width: 1500px;" alt="" title="" />';
		modal += '	</div>';
		
		modal += '	<div class="modal-footer">';
		modal += '		<button type="button" data-dismiss="modal" class="btn">Close</button>';
		modal += '	</div>';
		modal += '</div>';
	   	return modal;
	};
	
	
	
	/**
	 * make link to go to external page
	 */
	AjaxSolr.theme.prototype.go_to_link = function(url,anchor,explanationTextOfLink) {
		return $('<a  class="external" rel="tooltip" target="_blank" data-original-title="'+explanationTextOfLink+'" href="'+url+'"/>').text(anchor);
	};


	/**
	 * Links inside the Record - are going to be different than the tag cloud links
	 * explanationTextOfLink: help text abou tthe actuon of the link
	 */
	AjaxSolr.theme.prototype.moreinfo_link = function(value, handler,explanationTextOfLink) {
		return $('<a class="moreinfo" rel="tooltip" onclick="window.scrollTo(0,0);"  data-original-title="'+explanationTextOfLink+'" href="#"/>').text(value).click(handler);
	};
	
	
	/**
	 * Job Title link to Detail Page Display Theme
	 * explanationTextOfLink: help text abou tthe actuon of the link
	 */
	AjaxSolr.theme.prototype.title_link = function(value, handler,explanationTextOfLink,href) {
		
		return $('<a class="title" rel="tooltip" data-toggle="modal" href="#'+href+'"  data-original-title="'+explanationTextOfLink+'"/>').text(value).click(handler);
	};
	
	
	
	/**
	 * Durring resources navigation this is the link with the form url which opens a new window ...
	 * We save as current Url the previous storeString parameters..
	 */
	AjaxSolr.theme.prototype.form_navigation_new_window = function(query,value,storeString) { //TODO DELETE THIS - IS NOT IN USE...
		return $('<a class=moreinfo  href="#' + storeString + '" onclick="popup(\'' + query  +'\')" />').text(value);
//		return $('<a class=moreinfo  href="http://localhost:8080/jobweb/#"'+storedString+' onclick="popup(\'http://localhost:8080/jobweb/#' + storedString  +'\')" />').text(value).click(handler);
	};
	AjaxSolr.theme.prototype.create_form_navigation_new_window = function(query,value,storeString) {
		return '<a class=moreinfo  href="#' + storeString + '" onclick="popup(\'' + query  +'\')">'+ value +'</a>';
	};
	
	
	
	/**
	 * FEEDBACK to resources...durring seeds navigation
	 * @param jsp file where we handle the specific case of Feedback
	 */
	AjaxSolr.theme.prototype.feedbackToResource = function(jsp,anchorText,form_navigation_id, form_url, classOfButton) {
		var submitFeedback = '<FORM action="./jsp/'+ jsp +'" NAME="form_'+ form_navigation_id +'" METHOD="POST">'
					+'<INPUT class="'+classOfButton+ '" TYPE="SUBMIT" NAME="form_navigation_id" VALUE="'+anchorText + ' id:' +form_navigation_id+'"  onclick="this.form.target=\'_blank\';return true;">'
					+'<INPUT TYPE="hidden" NAME="form_url" VALUE="' + form_url + '"/>'
					+'</FORM>';
		return submitFeedback;
	};
	
	
	/**
	 * FEEDBACK to seeds
	 */
	AjaxSolr.theme.prototype.feedbackToSeed = function(jsp,anchorText,seed_url,classOfButton) {
		var submitFeedback = '<FORM action="./jsp/'+ jsp +'" NAME="form_'+ seed_url +'" METHOD="POST">'								
									+'<INPUT  class="' + classOfButton + '" TYPE="SUBMIT" NAME="form_navigation_id" VALUE="'+anchorText + '"  onclick="this.form.target=\'_blank\';return true;">'
								    +'<INPUT TYPE="hidden" NAME="seed_url" VALUE="' + seed_url + '"/>'
		    				+'</FORM>';
		return submitFeedback;
	};
	
	
	
	
	/**
	 * text box where we get as input a url and check it if exist a similar into the Production Database
	 * @param jsp file where we handle the specific case of Feedback
	 */
	AjaxSolr.theme.prototype.checkUrlIfExistInProduction = function(jsp,anchorText,form_navigation_id) {
		var submitFeedback = '<FORM action="./jsp/'+ jsp +'" NAME="form_'+ form_navigation_id +'" METHOD="GET">'
					+ anchorText + ': <input type="text" name="INPUT_DATA"  />'
					+' <input type="submit" value="Submit" onclick="this.form.target=\'_blank\';return true;" />'
					+'</FORM>';
		return submitFeedback;
	};
	
	
	

	/**
	 * Opens in a new window the url where exist the given url
	 */
	AjaxSolr.theme.prototype.goToUrl = function(anchorText,url) {
		var submitFeedback = '<FORM name="openFormUrl" target="_blank" action="'+ url +'" METHOD="POST">'
		+'<INPUT TYPE="SUBMIT" NAME="form_navigation_id" VALUE="'+anchorText + '"></FORM>';
		return submitFeedback;
	};
	
	
	
	

	
	
	/**
	 * Tag links theme
	 */
	AjaxSolr.theme.prototype.tag = function(value, weight, handler) {
		return $('<a href="#" class="tagcloud_item"/>').text(value).addClass(
				'tagcloud_size_' + weight).click(handler);
	};


	AjaxSolr.theme.prototype.resources_tag = function(value, handler) {
		//like more info
		return $('<a href="#" class="tagcloud"/>').text(value).click(handler);
	};

	
	
	AjaxSolr.theme.prototype.no_items_found = function() {
		return 'no items found in current selection';
	};

})(jQuery);
