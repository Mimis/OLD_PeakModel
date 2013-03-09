<%@page contentType="text/html" pageEncoding="UTF-8"%>



<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	
	<title>PeakModel</title>
	
	
	
	<!-- JQUERY -->
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.1/jquery-ui.min.js"></script> 
	
    <!-- BOOTSTRAP TWITTER - Bootstrap-MODAL-->
	<!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <link href="./css/bootstrap.css" rel="stylesheet">
   	<script type="text/javascript" src="js/bootstrap/bootstrap.min.js"></script>
    <!-- BOOTSTRAP TWITTER END -->
    
    
    <script type="text/javascript" src="lib/utilities/Utils.js"></script>
	<link rel="stylesheet" type="text/css" href="css/reuters.css" media="screen" />
	<link rel="stylesheet" type="text/css" href="ext/smoothness/ui.theme.css" media="screen" />
	<link rel="stylesheet" type="text/css" href="ext/smoothness/jquery-ui.css" media="screen" />
	<script type="text/javascript" src="js/reuters.1.js"></script>
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
	<script type="text/javascript" src="lib/widgets/jquery/PagerWidget.js"></script>
	<script type="text/javascript" src="lib/core/AbstractFacetWidget.js"></script>
	<script type="text/javascript" src="widgets/TagcloudWidget.js"></script> 
	<script type="text/javascript" src="widgets/CurrentSearchWidget.js"></script>
	<script type="text/javascript" src="widgets/TextWidget.js"></script> 
	<script type="text/javascript" src="widgets/DateWidget.js"></script> 		
	<script type="text/javascript" src="lib/core/ParameterHashStore.js"></script>
	
	<!-- Jquery Append -->
	<script type="text/javascript"> 
		$(document).ready(function(){ 						
			$(".show_resources2").click(function(){
				$("#panel2").slideToggle("slow");
				$(this).toggleClass("active"); 
				return false;
			});

			//WE EXTEND BY DEFAULT THIS RESOURCE
			$("#panel2").slideToggle("slow");
			$(this).toggleClass("active"); 
		    		     		    
		});
	</script> 		
</head>






<body>
	
    <div class="container">    
    	<div class="content">
    	
    	
    	    <!-- SEARCH INTERFACE -->
        	<div class="page-header hero-unit">
        	
        		<form class="form-inline" id="search_form">
        			<!-- LOGO link -->
        			<a href="/app" id="homepage_link"  title="Go to HomePage"><strong>KB search engine</strong></a>
        			<!-- Search Box and Buttons-->
        			<span id="keyword_query">
        				<input  class="search-query" type=text   placeholder="Enter query"/>
        			</span>        			
        			<span id="date_query">
        				<input  class="date-query" type=text   placeholder="Enter date"/>
        			</span>
			      	<button type="submit" class="btn btn-large" id="search_button">Search</button>				  		 
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
							<div class="pagination pagination-centered" id="navigation">
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
						<h3 class="show_resources2">Title</h3>
						<div id="panel2">
							<div class="tagcloud hero-unit" id="article_title"></div>
						</div>
						
						<div class="clear"></div>
					</div>
					<div class="clear"></div>
	        	</div>
 
		               	
        		
	        </div>
      </div>

      <footer>
        <p>&copy; KB 2013</p>
      </footer>

    </div> <!-- /container -->

</body>
</html>
