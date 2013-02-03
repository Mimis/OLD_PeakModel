/**
 * Theme heavily inspired from Prismatic
 */

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
