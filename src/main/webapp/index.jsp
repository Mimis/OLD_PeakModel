<%@page contentType="text/html" pageEncoding="UTF-8"%>



<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	
	<title>Amedoo</title>
	
	
	
	<!-- JQUERY -->
	<!-- 	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script> -->
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/jquery-ui.min.js"></script> 
	
    <!-- BOOTSTRAP TWITTER - Bootstrap-MODAL-->
	<!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <link href="./css/bootstrap.css" rel="stylesheet">
    <link href="./css/bootstrap-modal.css" rel="stylesheet">
   	<script type="text/javascript" src="js/bootstrap/bootstrap.min.js"></script>
   	<script type="text/javascript" src="js/bootstrap_modal/bootstrap-modalmanager.js"></script>
   	<script type="text/javascript" src="js/bootstrap_modal/bootstrap-modal.js"></script>
    <!-- BOOTSTRAP TWITTER END -->
    
    
    
    
    
    
    	
	<!-- Utilities Functions -->
	<script type="text/javascript" src="lib/utilities/Utils.js"></script>
	
	<!-- Step 1: -->
	<link rel="stylesheet" type="text/css" href="css/reuters.css" media="screen" />
	<link rel="stylesheet" type="text/css" href="ext/smoothness/ui.theme.css" media="screen" />
	<link rel="stylesheet" type="text/css" href="ext/smoothness/jquery-ui.css" media="screen" />
	<script type="text/javascript" src="js/reuters.1.js"></script>
	
	
	<!-- Step 2: Display Results-->
	<script type="text/javascript" src="lib/core/Core.js"></script>
	<script type="text/javascript" src="lib/core/AbstractWidget.js"></script>
	
	<script type="text/javascript" src="lib/core/AbstractManager.js"></script>
	<script type="text/javascript" src="lib/managers/Manager.jquery.js"></script>
	<script type="text/javascript" src="lib/core/Parameter.js"></script>
	<script type="text/javascript" src="lib/core/ParameterStore.js"></script>
	
	<script type="text/javascript" src="lib/core/AbstractTextWidget.js"></script>
	
	<script type="text/javascript" src="widgets/ResultWidget.js"></script>
	<script type="text/javascript" src="js/reuters.theme.js"></script>
	<script type="text/javascript" src="lib/helpers/jquery/ajaxsolr.theme.js"></script>
	<script type="text/javascript" src="lib/helpers/ajaxsolr.support.js"></script>
    <script type="text/javascript" src="lib/helpers/ajaxsolr.theme.js"></script>
	<script type="text/javascript" src="js/jquery.livequery.js"></script>
	
	
	<!--  Step 3:  Paginator-->
	<script type="text/javascript" src="lib/widgets/jquery/PagerWidget.js"></script>
	
	<!-- Step 4: Tag Cloud -->
	<script type="text/javascript" src="lib/core/AbstractFacetWidget.js"></script>
	<script type="text/javascript" src="widgets/TagcloudWidget.js"></script> 
	
	<!-- Step 5: Display the current filters -->
	<script type="text/javascript" src="widgets/CurrentSearchWidget.js"></script>
	
	<!-- Step 6: Free Text Widget -->
	<script type="text/javascript" src="widgets/TextWidget.js"></script> 
	
	<!-- Step 7: AutoComplete -->
	<link rel="stylesheet" type="text/css" href="ext/jquery.autocomplete.css" media="screen" />
	<script type="text/javascript" src="ext/jquery.autocomplete.js"></script>
	<script type="text/javascript" src="widgets/AutocompleteWidget.js"></script>
	
	<!-- Exposed Url Parameters -->
	<script type="text/javascript" src="lib/core/ParameterHashStore.js"></script>
	
	
	<!-- Jquery Append -->
	<script type="text/javascript"> 
		$(document).ready(function(){
 						
			$(".show_resources1").click(function(){
				$("#panel1").slideToggle("slow");
				$(this).toggleClass("active"); 
				return false;
			});	 
			$(".show_resources2").click(function(){
				$("#panel2").slideToggle("slow");
				$(this).toggleClass("active"); 
				return false;
			});
			$(".show_resources3").click(function(){
				$("#panel3").slideToggle("slow");
				$(this).toggleClass("active"); 
				return false;
			});

			for (var i=1;i<=3;i++){
/* 				$(".show_resources"+i).click(function(){
					$("#panel"+i).slideToggle("slow");
					 $(this).toggleClass("active");
					return false;
				});
 */				
				//WE EXTEND BY DEFAULT THIS RESOURCE
				$("#panel"+i).slideToggle("slow");
				$(this).toggleClass("active"); 
			}


			
		  	
			//activate tooltips
		    $('body').tooltip({
		        selector: '[rel=tooltip]'
		    });
		    		     		    
		});
	</script> 
		
	<!-- Opens in a new full screen window the form job titles -->
	<script type="text/javascript">
		function popup(url) 
		{
 			params  = 'width='+screen.width;
 			params += ', height='+screen.height;
 			params += ', top=0, left=0'
 			params += ', fullscreen=yes';

 			newwin=window.open(url,'Form_Navigation', params);
 			if (window.focus) {newwin.focus()}
 				return false;
			}
	</script>
	
	
	<!-- paginator: go to given page -->
	<script type="text/javascript">
		function goToGivenPage(){
			  var pageNumber = parseInt(document.go_to_page.pageNumber.value);
	 	      if(typeof(pageNumber) == 'undefined' && pageNumber != null){
	 	    	 alert("You must enter a possitive integer-you enter: " + pageNumber);  
	 	      }
	 	      else{
	 	    	 this.Manager.store.get('start').val((pageNumber - 1) * (this.Manager.response.responseHeader.params && this.Manager.response.responseHeader.params.rows || 10));
	 	    	 this.Manager.doRequest(); 
	 	      }
		   	  return false;
	    }
    </script>
</head>






<body>
	
    <div class="container">
	    <!-- FEEDBACK BUTTON!!!
        <a href="mailto:amedoo.app@gmail.com" class="btn btn-small btn-info" title="[GMCP] Compose a new mail to this one" onclick="window.open('https://mail.google.com/mail/u/0/?view=cm&amp;fs=1&amp;tf=1&amp;to=amedoo.app@gmail.com','Compose new message','width=640,height=480');return false" rel="noreferrer">
	        <i class="icon-comment icon-white"></i>
	         Feedback
        </a> -->
    
    	<div class="content">
    	
    	
    	    <!-- SEARCH INTERFACE -->
        	<div class="page-header hero-unit">
        	
        		<form class="form-inline" id="search_form">
        			<!-- LOGO link -->
        			<a href="/app3" id="homepage_link"  rel="tooltip" data-placement="bottom" data-original-title="Go to HomePage"><strong>Amedoo</strong></a>
        			<!-- Search Box and Buttons(AutocompleteWidget) -->
        			<span id="keyword_query"><input  class="input-large search-query" type=text   placeholder="Job Title, keyword"/></span>
        			<span id="location_query"><input  class="input-large search-query" type=text   placeholder="location"/></span>
			      	<button type="submit" class="btn" id="search_button">Search</button>				  		 
        		</form>
        		<!-- CurrentSearchWidget -->
		      	<span  id="facet_holder" class="offset2"></span>
        	
        	
			</div>          		
      
        	<div class="row">
        	
        		 <!--  MIMIS-LEFT RESULT DIV -->	        	
	            <div class="span10" id="result_list">
					<div class="left">
					
						<!-- <div id="result"> -->
						
							<!-- display number of total results -->
							<div id="mini_result_message" class="muted"></div>
							
							<!-- RESULTS ELEMENT -->
							<div id="docs"></div>
							
							<!-- PAGINATION botom -->
							<div class="pagination pagination-centered pagination-large" id="navigation">
								<ul id="pager2"></ul>
							</div>
							
						<!-- </div> -->
					</div>
					<!-- <!-- ONLY FOR TEST - go to given page -->
					<!-- <div id="goToPage"></div> --> 
						
				</div>
        		
		      
		        <!--  MIMIS-RIGHT DIV -->
	        	<div class="span4">
	        	   
	        	    <div class="right">
						
						
						<!-- ATTENTION IN CASE WE CHANGE THE SOLR VARIABLES WE HAVE TO CHANGE THESE ONES ALSO(I.E. here we change the id from "form_url" to "resource_url") 				-->
						<h3 class="show_resources2">Tags</h3>
						<div id="panel2">
							<div class="tagcloud hero-unit" id="job_title"></div>
						</div>
						
						<h3 class="show_resources1">Company</h3>
						<div id="panel1">
							<div class="tagcloud hero-unit" id="company_name"></div>
						</div>
						
						<h3 class="show_resources3">Location</h3>
						<div id="panel3">
							<div class="tagcloud hero-unit" id="location"></div>
						</div>			
						
						<div class="clear"></div>
					</div>
					<div class="clear"></div>
	        	</div>
 
		               	
        		
	        </div>
      </div>

      <footer>
        <p>&copy; Amedoo 2013</p>
      </footer>

    </div> <!-- /container -->

</body>
</html>
