(function($) {

	
	/**
	 * Document Wrapper
	 */
	AjaxSolr.theme.prototype.doc_wrapper = function(doc,snippet,link_to_original_article) {
		var output = '<div class="doc hero-unit">';		
		//DOC HEADER:doc details and doc title
		output += 		'<div class="doc_header">';
		//title
		output += 			'<div class="doc_title">';
		output += 				'<h3 id="header_' + doc.id + '">' + doc.article_title + '</h3>';
		output += 			'</div>';
		//LEFT HEADER
		//doc details and actions
		output += 			'<div class="doc_details row">';
		output += 				'<div class="left">';
		//newspaper NAME 
		output += 					'<span class="newspaper_name label label-info"  id="newspaper_name_' + doc.id + '">' + doc.newspaper_name + '</span>';
		//article DATE
		output += 					'<span class="date">'+doc.date+'</span>';
		//article Subject => link to view all location's jobs
		output += 					'<span class="subject label label-info" id="subject_' + doc.id+'">'+ doc.subject +'</span>';
		output += 				'</div>';
		//RIGHT HEADER
		//link to GO to original article 
		output += 				'<div class="right">';
		output += 					'<div  class="doc_actions"  id="detailPage_' + doc.id+'"> ' + link_to_original_article + '</div>';
		output += 				'</div>';
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
	 *  Snippet Display Theme
	 */
	AjaxSolr.theme.prototype.snippet = function(paragraphArray) {
		var output = '';
		if (paragraphArray != null && paragraphArray.length > 1) {
			output +=  '<p>' + paragraphArray[0] +'</p>';
			output += '<span style="display:none;">';
			for (var i=1; i<paragraphArray.length; i++) {
				output +=  '<p>' + paragraphArray[i] +'</p>';
			}
			output += '</span> <a href="#" class="more">more</a>';
		} else if (paragraphArray != null){
			output +=  '<p>' + paragraphArray[0] +'</p>';
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
	 * make link to go to external page
	 */
	AjaxSolr.theme.prototype.go_to_link = function(url,anchor) {
		return '<a  class="external"  target="_blank"  href="'+url+'">'+anchor+'</a>';
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
