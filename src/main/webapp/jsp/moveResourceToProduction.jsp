<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"
	import="java.io.*"
	import="java.sql.*"
	import="java.util.*"
	import="javax.sql.*"
	import = "java.sql.ResultSet"
	import = "java.sql.Statement"
	import = "java.sql.Connection"
	import = "java.sql.DriverManager"
	import = "java.sql.SQLException"
%>
<%
/*
	1)move seed(if not exist),resource,navigation_pattern to Production DB
	2)make invalide the job posts from the moving resource into the Test DB
*/

	Connection conTestDB = null;
	Connection conProductionDB = null;
	
	PreparedStatement ps = null;
	ResultSet rst=null;
	ResultSet rstTemp=null;
	
	ResultSet resultSet_Navigation_pattern = null;
	ResultSet resultSet_Resource = null;
	Statement stmt=null;

	String formValue = request.getParameter("form_navigation_id");
	//we save it as form:navigation_id
	String navigation_id = formValue.split(":")[1]; 
	String form_url = request.getParameter("form_url");
	
	//databases' name; Test DB is the one that we get the resource to move and Production is the one to insert into.
	String database_source = "test";
	String database_target = "Production";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>MOVE RESOURCE TO THE PRODUCTION PART BECAUSE IS GOOD</title>
</head>
<body>
<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		conTestDB = DriverManager.getConnection ("jdbc:mysql://localhost/"+database_source, "root", "salle20mimis");
		conProductionDB = DriverManager.getConnection ("jdbc:mysql://localhost/"+database_target, "root", "salle20mimis");
	    
		
		
		ps = null;
		/**
		0) CHECK IF THE NAVIGATION PATTERNS ARE CORRECT(detail_link_xpatyh_diff == 0)
		if not then do not allow the transformation to the Production DB!!!!
		*/
		int detail_links_xpath_difference=-1;
	    stmt=conTestDB.createStatement();
		rst = stmt.executeQuery("SELECT detail_links_xpath_difference FROM navigation_pattern where id = " + navigation_id);
		if(rst.first()){
			detail_links_xpath_difference = rst.getInt("detail_links_xpath_difference");
		}
		rst = null;		
		stmt = null;
		ps = null;
		
		
		//if the detail_link_xpath_diff is ZERO then do not allow the transformation..and display the appropriate message
		if(detail_links_xpath_difference == 0){
			%>
			The resource with id = <%=navigation_id%> dont have appropriate navigation patterns<br>
			detail_links_xpath_difference is equal to ZERO<br>  
		<%
		}
		else{
			/*
			1) SET ALL THE JOBS FROM THE CURRENT RESOURCE TO NOT VALID in the TEST DATABASE
			*/
			ps = conTestDB.prepareStatement("update  job_post set valid = 0  where navigation_id = ?");
			ps.setInt(1, Integer.parseInt(navigation_id));
			ps.executeUpdate();
			
			ps = null;
			
			
			
			
			
			/*
			2) GET THE SEED,RESOURCE AND NAVIGATION_PATTERN RECORDS from the TEST DATABASE 
			*/
			// 2.1 GET THE NAVIGATION_PATTERN RECORD
		    stmt=conTestDB.createStatement();
			resultSet_Navigation_pattern = stmt.executeQuery("SELECT * FROM navigation_pattern where id = " + navigation_id);
			
		    
			
			
		    //2.2 GET THE RESOURCE RECORD
			stmt = null;rst = null;boolean isFormResource = false;
			if(resultSet_Navigation_pattern.first()){
				if(resultSet_Navigation_pattern.getString("form_id") != null){ //is a FORM RESOURCE
				    stmt=conTestDB.createStatement();
				    resultSet_Resource = stmt.executeQuery("SELECT * FROM form_table where id = " + resultSet_Navigation_pattern.getString("form_id"));
				    isFormResource = true;
				}
				else{ 								  //is a LIST_PAGE RESOURCE
					stmt=conTestDB.createStatement();
					resultSet_Resource = stmt.executeQuery("SELECT * FROM list_page where id = " + resultSet_Navigation_pattern.getString("list_id"));
				}
			}
			
			
			
			
			//2.3 GET THE SEED RESOURCE RECORD
			stmt = null;rst = null;
			if(resultSet_Resource.first()){
				stmt=conTestDB.createStatement();
				rst=stmt.executeQuery("SELECT * FROM seeds where id = " + resultSet_Resource.getString("seed_id"));
			}
			
			
			
			
			/*
			  2.4 INSERT THE DATA INTO THE PRODUCTION TABLE
			  Save the resource into the PRODUCTION table...
			*/
			//INSERT SEED RECORD IF DOESNT EXIST ALREADY
			stmt = null;
			if(rst.first()){
			    stmt=conProductionDB.createStatement();
			    rstTemp = stmt.executeQuery("SELECT * FROM seeds where id = " + rst.getString("id"));
			    stmt = null;
				String seed_id = rst.getString("id");
				if(!rstTemp.first()){
					String description = rst.getString("description") == null ? rst.getString("description") : "\""+ rst.getString("description") +"\"";
					String language = rst.getString("language") == null ? rst.getString("language") : "'"+ rst.getString("language") +"'";
					String name = rst.getString("name") == null ? rst.getString("name") : "\""+ rst.getString("name") +"\"";
					String InsertSeedRecordQuery = "INSERT seeds "+
					"(id,url,name,description,language,crawled)"+
					" VALUES('"  + seed_id + 
							"','"+ rst.getString("url") +
							"'," + name +
							"," + description + 
							","  + language + 
							",'" + rst.getString("crawled") + "')";
					
				    stmt=conProductionDB.createStatement();
				    stmt.executeUpdate(InsertSeedRecordQuery);
				}
			}
			rstTemp = null;stmt = null;
			
			
			
			
			//INSERT THE form PAGE
			if(resultSet_Resource.first()){
				 if(isFormResource){
					String action = resultSet_Resource.getString("action") == null ? resultSet_Resource.getString("action") : "'"+ resultSet_Resource.getString("action") +"'";
					String url = resultSet_Resource.getString("url") == null ? resultSet_Resource.getString("url") : "'"+ resultSet_Resource.getString("url") +"'";
					String method = resultSet_Resource.getString("method") == null ? resultSet_Resource.getString("method") : "'"+ resultSet_Resource.getString("method") +"'";
					String formText = resultSet_Resource.getString("formText") == null ? resultSet_Resource.getString("formText") : "'"+ resultSet_Resource.getString("formText") +"'";
					String buttonsText = resultSet_Resource.getString("buttonsText") == null ? resultSet_Resource.getString("buttonsText") : "'"+ resultSet_Resource.getString("buttonsText") +"'";
					String name = resultSet_Resource.getString("name") == null ? resultSet_Resource.getString("name") : "'"+ resultSet_Resource.getString("name") +"'";
					String formID = resultSet_Resource.getString("formID") == null ? resultSet_Resource.getString("formID") : "'"+ resultSet_Resource.getString("formID") +"'";
					String XPATHS = resultSet_Resource.getString("XPATHS") == null ? resultSet_Resource.getString("XPATHS") : "'"+ resultSet_Resource.getString("XPATHS") +"'";
					String linksFeatureTokensToThisState = resultSet_Resource.getString("linksFeatureTokensToThisState") == null ? resultSet_Resource.getString("linksFeatureTokensToThisState") : "'"+ resultSet_Resource.getString("linksFeatureTokensToThisState") +"'";
					String form_xpath = resultSet_Resource.getString("form_xpath") == null ? resultSet_Resource.getString("form_xpath") : "'"+ resultSet_Resource.getString("form_xpath") +"'";
					String search_button_xpath = resultSet_Resource.getString("search_button_xpath") == null ? resultSet_Resource.getString("search_button_xpath") : "'"+ resultSet_Resource.getString("search_button_xpath") +"'";
					String search_button_text = resultSet_Resource.getString("search_button_text") == null ? resultSet_Resource.getString("search_button_text") : "'"+ resultSet_Resource.getString("search_button_text") +"'";
					
					String InsertReSourceRecordQuery = "INSERT form_table "+
					"(id,seed_id,action,url,method,formText,buttonsText,name,formID,textGotRelativeTerms,textGotNegativeTerms,actionNameGotRelativeTerms,actionNameGotNegativeTerms,nr_input_button,nr_input_hidden,nr_input_radio,nr_input_checkbox,nr_input_password,nr_input_reset,nr_input_file,nr_input_textbox,nr_input_image,nr_input_submit,nr_select,nr_select_items,nr_text_area,nr_label,nr_button,visible_fields,XPATHS,linksFeatureTokensToThisState,access_type, form_xpath,search_button_xpath,search_button_text,class,navigated)" +
					" VALUES('" + resultSet_Resource.getString("id") + 
							"','"+ resultSet_Resource.getString("seed_id") +
							"',"+ action + 
							","+ url +
							","+ method + 
							","+ formText + 
							","+ buttonsText +
							","+ name + 
							","+ formID +
							",'"+ resultSet_Resource.getString("textGotRelativeTerms") +
							"','"+ resultSet_Resource.getString("textGotNegativeTerms") + 
							"','"+ resultSet_Resource.getString("actionNameGotRelativeTerms") + 
							"','"+ resultSet_Resource.getString("actionNameGotNegativeTerms") +			
							"','"+ resultSet_Resource.getString("nr_input_button") +
							"','"+ resultSet_Resource.getString("nr_input_hidden") +
							"','"+ resultSet_Resource.getString("nr_input_radio") +
							"','"+ resultSet_Resource.getString("nr_input_checkbox") +
							"','"+ resultSet_Resource.getString("nr_input_password") +
							"','"+ resultSet_Resource.getString("nr_input_reset") +
							"','"+ resultSet_Resource.getString("nr_input_file") 	+
							"','"+ resultSet_Resource.getString("nr_input_textbox") +
							"','"+ resultSet_Resource.getString("nr_input_image") +
							"','"+ resultSet_Resource.getString("nr_input_submit")	+
							"','"+ resultSet_Resource.getString("nr_select") +
							"','"+ resultSet_Resource.getString("nr_select_items") +
							"','"+ resultSet_Resource.getString("nr_text_area") +
							"','"+ resultSet_Resource.getString("nr_label") +
							"','"+ resultSet_Resource.getString("nr_button") +
							"','"+ resultSet_Resource.getString("visible_fields")+
							"',"+ XPATHS+
							","+ linksFeatureTokensToThisState+
							",'" + resultSet_Resource.getString("access_type") +
							"',"+ form_xpath+
							","+ search_button_xpath+
							","+ search_button_text+
							",'"+ resultSet_Resource.getString("class")+
							"','"+ resultSet_Resource.getString("navigated")+"')";
		
					
					stmt=conProductionDB.createStatement();
				    stmt.executeUpdate(InsertReSourceRecordQuery);	
				    
				 
				}
				//INSERT LIST_PAGE 
				else{
					String urlTokens = resultSet_Resource.getString("urlTokens") == null ? resultSet_Resource.getString("urlTokens") : "'"+ resultSet_Resource.getString("urlTokens") +"'";
					String title = resultSet_Resource.getString("title") == null ? resultSet_Resource.getString("title") : "'"+ resultSet_Resource.getString("title") +"'";
					String description = resultSet_Resource.getString("description") == null ? resultSet_Resource.getString("description") : "'"+ resultSet_Resource.getString("description") +"'";
					String keywords = resultSet_Resource.getString("keywords") == null ? resultSet_Resource.getString("keywords") : "'"+ resultSet_Resource.getString("keywords") +"'";
					String body = resultSet_Resource.getString("body") == null ? resultSet_Resource.getString("body") : "'"+ resultSet_Resource.getString("body") +"'";
					String XPATHS = resultSet_Resource.getString("XPATHS") == null ? resultSet_Resource.getString("XPATHS") : "'"+ resultSet_Resource.getString("XPATHS") +"'";
					String linksFeatureTokensToThisState = resultSet_Resource.getString("linksFeatureTokensToThisState") == null ? resultSet_Resource.getString("linksFeatureTokensToThisState") : "'"+ resultSet_Resource.getString("linksFeatureTokensToThisState") +"'";
					
					String InsertReSourceRecordQuery = "INSERT list_page "+
					"(id,seed_id,url,urlTokens,title,description,keywords,body,access_type,XPATHS,linksFeatureTokensToThisState,class,navigated)" +
					" VALUES('" + resultSet_Resource.getString("id") + 
							"','" + resultSet_Resource.getString("seed_id") +
							"','" + resultSet_Resource.getString("url") + 
							"'," + urlTokens +
							"," + title + 
							"," + description + 
							"," + keywords +
							"," + body + 
							",'" + resultSet_Resource.getString("access_type") +
							"'," + XPATHS 	+
							"," + linksFeatureTokensToThisState 	+
							",'" + resultSet_Resource.getString("class") +
							"','" + resultSet_Resource.getString("navigated") +"')";			
					  
					  
					stmt=conProductionDB.createStatement();
				    stmt.executeUpdate(InsertReSourceRecordQuery);
				 
				}
			}
			rst = null;stmt = null;
			
			
			
			
			
			//INSERT RESOURCE RECORD
			if(resultSet_Navigation_pattern.first()){
				String navigation_links_ctp = resultSet_Navigation_pattern.getString("navigation_links_ctp") == null ? resultSet_Navigation_pattern.getString("navigation_links_ctp") : "'"+ resultSet_Navigation_pattern.getString("navigation_links_ctp") +"'";
				String form_id = resultSet_Navigation_pattern.getString("form_id") == null ? resultSet_Navigation_pattern.getString("form_id") : "'"+ resultSet_Navigation_pattern.getString("form_id") +"'";
				String list_id = resultSet_Navigation_pattern.getString("list_id") == null ? resultSet_Navigation_pattern.getString("list_id") : "'"+ resultSet_Navigation_pattern.getString("list_id") +"'";
				String detail_pages_mainContentElement_Xpath = resultSet_Navigation_pattern.getString("detail_pages_mainContentElement_Xpath") == null ? resultSet_Navigation_pattern.getString("detail_pages_mainContentElement_Xpath") : "'"+ resultSet_Navigation_pattern.getString("detail_pages_mainContentElement_Xpath") +"'";
				String detailLinkfeatures = resultSet_Navigation_pattern.getString("detailLinkfeatures") == null ? resultSet_Navigation_pattern.getString("detailLinkfeatures") : "'"+ resultSet_Navigation_pattern.getString("detailLinkfeatures") +"'";
				String location_detector = resultSet_Navigation_pattern.getString("location_detector") == null ? resultSet_Navigation_pattern.getString("location_detector") : "'"+ resultSet_Navigation_pattern.getString("location_detector") +"'";
				
				String detail_cluster_is_clonos = resultSet_Navigation_pattern.getString("detail_cluster_is_clonos");
				
				String InsertNavigationRecordQuery = "INSERT navigation_pattern "+
					"(id,form_id,list_id,detail_links_ctp,navigation_links_ctp,first_detail_link_xpath,detail_links_xpath_difference,detail_pages_mainContentElement_Xpath,detailClusterWidthRatio,detailLinkfeatures,location_detector,detail_cluster_is_clonos,last_update,feedback)" +
					" VALUES('" + resultSet_Navigation_pattern.getString("id") + 
							"'," + form_id +
							"," + list_id +
							",'" + resultSet_Navigation_pattern.getString("detail_links_ctp") + 
							"'," + navigation_links_ctp +
							",'" + resultSet_Navigation_pattern.getString("first_detail_link_xpath") +
							"','" + resultSet_Navigation_pattern.getString("detail_links_xpath_difference") +
							"'," + detail_pages_mainContentElement_Xpath +
							",'" + resultSet_Navigation_pattern.getString("detailClusterWidthRatio") +
							"'," + detailLinkfeatures + 
							"," + location_detector +
							"," + detail_cluster_is_clonos +
							",'" + resultSet_Navigation_pattern.getString("last_update") +
							"','" + resultSet_Navigation_pattern.getString("feedback") +"')";
				
				stmt=conProductionDB.createStatement();
				stmt.executeUpdate(InsertNavigationRecordQuery);
				}
			
			resultSet_Navigation_pattern=null;
			resultSet_Resource=null;
			rst = null;
			
			%>
				Move resource to the production part(is good)
				<br>1)move seed(if not exist),resource,navigation_pattern to Production DB
				<br>2)make invalid the job posts from the moving resource into the Test DB
				<br>  
			<%
		}		
		
	} catch (SQLException e) {
		out.println(e);
		throw new SQLException( e);
	} finally {
		try {
			if(rst!=null){
				rst.close();
				rst=null;
			}
			if(resultSet_Navigation_pattern!=null){
				resultSet_Navigation_pattern.close();
				resultSet_Navigation_pattern=null;
			}
			if(resultSet_Resource!=null){
				resultSet_Resource.close();
				resultSet_Resource=null;
			}
			if(rstTemp!=null){
				rstTemp.close();
				rstTemp=null;
			}
			if(stmt!=null){
				stmt.close();
				stmt=null;
			}
			if(ps != null) {
				ps.close();
				ps = null;
			}
			if(conTestDB != null) {
				conTestDB.close();
				conTestDB = null;
			}
			if(conProductionDB != null) {
				conProductionDB.close();
				conProductionDB = null;
			}
		} catch (SQLException e) {
			out.println(e);
			throw new SQLException( e);
		}
	}
%>
</body>
</html>