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
    

   	<script type="text/javascript" src="js/jQCloud/jqcloud.js"></script>
    <link href="./css/jqcloud.css" rel="stylesheet">

    
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
	<script type="text/javascript" src="lib/core/AbstractFacetWidget.js"></script>
	<script type="text/javascript" src="widgets/DateWidget.js"></script> 		
	<script type="text/javascript" src="lib/core/ParameterHashStore.js"></script>
	<script type="text/javascript" src="widgets/RawTF_TagcloudWidget.js"></script>
	<script type="text/javascript" src="widgets/IDF_TagcloudWidget.js"></script>
	<script type="text/javascript" src="widgets/TimeSeriesGraphWidget.js"></script>
	<script type="text/javascript" src="widgets/CurrentSearchWidget.js"></script>
	<script type="text/javascript" src="widgets/TextWidget.js"></script> 
	<script type="text/javascript" src="lib/widgets/jquery/PagerWidget.js"></script>
	<script type="text/javascript" src="widgets/ShowResultInfoWidget.js"></script>
	
	<!-- morris js graphs -->
	<link rel="stylesheet" href="http://cdn.oesmith.co.uk/morris-0.4.1.min.css">
   	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
   	<script type="text/javascript" src="http://cdn.oesmith.co.uk/morris-0.4.1.min.js"></script>
    	
	<!-- Jquery Append -->
	<script type="text/javascript"> 
		$(document).ready(function(){ 	
							
			
			//SWITCH RESULT VIEW BUTTONS
<!--			$(".show_classic_view_but").click(function(){-->
<!--				$('.wordCloud_result_view').hide('fast');		-->
<!--				$('.classic_result_view').show('fast');-->
<!--				-->
<!--				$('.show_classic_view_but').addClass('disabled');-->
<!--				$('.show_wordCloud_view_but').removeClass('disabled');-->
<!--				return false;-->
<!--			});-->
<!--			-->
<!--			$(".show_wordCloud_view_but").click(function(){						    		     		    -->
<!--				$('.classic_result_view').hide('fast');-->
<!--				$('.wordCloud_result_view').show('fast');-->
<!--				-->
<!--				$('.show_wordCloud_view_but').addClass('disabled');-->
<!--				$('.show_classic_view_but').removeClass('disabled');-->
<!--				return false;-->
<!--			});-->
<!--			//Default result view is the Semantic one;hide rest by default-->
<!--			$('.classic_result_view').hide('fast');-->
<!--			$('.show_wordCloud_view_but').addClass('disabled');-->
			
			
			//tag cloud on classic result list
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
			$(".show_resources4").click(function(){
				$("#panel4").slideToggle("slow");
				$(this).toggleClass("active"); 
				return false;
			});
			$("#panel1").slideToggle("slow");
			$("#panel2").slideToggle("slow"); 
			$("#panel3").slideToggle("slow");
			$("#panel4").slideToggle("slow");
			$(this).toggleClass("active");	
		
		});
	</script> 		
</head>






<body>
    <div class="container">    
    	<div class="content">
    	    	
    	    <!--         
			  ** THIS THE PAGE HEADER WHERE SEARCH INTERFACE EXISTS **
			-->
        	<div class="page-header hero-unit">
        		<form class="form-inline" id="search_form">
        			<!-- LOGO link -->
        			<a href="/semantic" id="homepage_link"  title="Go to HomePage"><strong>KB search engine</strong></a>
        			<!-- Search Box and Buttons-->
        			<span id="keyword_query">
        				<input  class="search-query" type=text   placeholder="Enter query"/>
        			</span>        			
        			<span id="date_query">
        				<input  class="date-query" type=text   placeholder="Year(YYYY)"/>
        			</span>
        			<span id="range_query">
        				<input  class="range-query" type=text   placeholder="Range(Y)"/>
        			</span>
			      	<button type="submit" class="btn btn-large" id="search_button">Search</button>				  		 
        		</form>
        		
        		<!-- BUTTONS TO CHANGE RESULT VIEW-->
<!--        		<div class="switch_result_view">-->
<!--				  <button class="btn show_classic_view_but" type="button">Show Classic View</button>-->
<!--				  <button class="btn show_wordCloud_view_but" type="button">Show Semantic View</button>-->
<!--				</div>-->
			</div>          		
      		<!--         
			  ** HERE WE SHOW THE CURRENT QUERY PARAMETERS(FACETS) **
			-->
      		<div id="facets">
                <div class="row">
                    <div id="facet_holder"></div>
                </div>
            </div>
            
			<!-- display number of total results -->            
            <div id="results-count">
				<div id="mini_result_message" class="muted">&nbsp;</div>
			</div>
            
            
            
			<!--         
			  ** THIS THE CLASSIC RESULT SET WITH PAGINATION **
			-->
<!--        	<div class="row classic_result_view">-->
<!--        	    <div class="span12" id="result_list">-->
<!--					<div class="left">-->
<!--						<div id="docs"></div>-->
<!--						<div class="pagination pagination-centered" id="navigation">-->
<!--							<ul id="pager2"></ul>-->
<!--						</div>-->
<!--					</div>					-->
<!--				</div>-->
<!--	        </div>-->
	        
	        
	        <!--         
			  ** THIS THE SEMANTIC(world cloud,charts) RESULT SET FOR THE CURRENT SEARCH **
			-->
        	<div class="row-fluid wordCloud_result_view">
		    	<div class="span12">
		    		<div class="facet">
		    		    <h3 class="show_resources1">Title Raw Term Frequency Word Cloud</h3>
						<div id="panel1">
							<div class="tagcloud" id="raw_article_title"></div>
						</div>
					</div>
					<div class="facet">
		    		    <h3 class="show_resources2">Title Inverse Document Frequency Word Cloud</h3>
						<div id="panel2">
							<div class="tagcloud" id="idf_article_title"></div>
						</div>
					</div>
					<div class="facet">
						<h3 class="show_resources3">Title Term Frequency Graph</h3>
						<div id="panel3">
							<div class="timeGraph" id="tf-rank"></div>
						</div>
					</div>
					<div class="facet">
						<h3 class="show_resources4">Article Date Graph</h3>
						<div id="panel4">
							<div class="timeGraph" id="date"></div>
						</div>
					</div>
	        	</div>
	        </div>
      </div>


		
      <footer>
        <p>&copy; KB 2013</p>
      </footer>
    </div> 

</body>
</html>
