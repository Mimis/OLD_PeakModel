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
	*)SUCCESS:Maintance_moveResourcesToProduction.jsp
				*MOVE RESOURCE TO PRODUCTION;problem with duplicate unique keys,i need to move only the change patterns:
				*UPDATE LOGS:
					*SUCCESS msg: 'UPDATE CODE:0.0.0'    	=> 		MAKE IT AVAILABLE FOR UPDATE AGAIN IN PRODUCTION
				*DELETE RESOURCE's records from Maintance

	1)move navigation patterns to Production DB
	2)update the log_message of resource in order to make available for updating
	3)delete resource from Maintance DB
*/

	Connection conSourceDB = null;
	Connection conTargetDB = null;
	
	PreparedStatement ps = null;
	ResultSet rst=null;
	Statement stmt=null;

	String formValue = request.getParameter("form_navigation_id");
	//we save it as form:navigation_id
	String navigation_id = formValue.split(":")[1]; 
	String form_url = request.getParameter("form_url");
	
	//databases' name; Test DB is the one that we get the resource to move and Production is the one to insert into.
	String database_source = "Maintance";
	String database_target = "Production";
	
	//the  suceess log_messages to update the navigation_pattern in Production in order to make the pattern available for update again..
	String succesLogMessage = "UPDATE CODE:0.0.0";
	
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
		conSourceDB = DriverManager.getConnection ("jdbc:mysql://localhost/"+database_source, "root", "salle20mimis");
		conTargetDB = DriverManager.getConnection ("jdbc:mysql://localhost/"+database_target, "root", "salle20mimis");
	    
		
		
		ps = null;
		/**
		0) CHECK IF THE NAVIGATION PATTERNS ARE CORRECT(detail_link_xpatyh_diff == 0)
		if not then do not allow the transformation to the Production DB!!!!
		*/
		int detail_links_xpath_difference=-1;
		String list_id=null;
		String form_id=null;
	    stmt=conSourceDB.createStatement();
		rst = stmt.executeQuery("SELECT * FROM navigation_pattern where id = " + navigation_id);
		if(rst.first()){
			detail_links_xpath_difference = rst.getInt("detail_links_xpath_difference");
			list_id = rst.getString("list_id");
			form_id = rst.getString("form_id");
		}
		
		
		/*
			if the detail_link_xpath_diff is ZERO then do not allow the transformation..and display the appropriate message
		*/
		if(detail_links_xpath_difference == 0){
			%>
			The resource with id = <%=navigation_id%> dont have appropriate navigation patterns<br>
			detail_links_xpath_difference is equal to ZERO<br>  
			<%
		}
		else{		
			/*
				1.1) UPDATE THE NEW NAVIGATION PATTERNS TO 'PRODUCTION' DB
			*/
			String detail_links_ctp = prepareValueForMySqlInsert(rst.getString("detail_links_ctp"));
			String navigation_links_ctp = prepareValueForMySqlInsert(rst.getString("navigation_links_ctp"));
			String first_detail_link_xpath = prepareValueForMySqlInsert(rst.getString("first_detail_link_xpath"));
			String detail_pages_mainContentElement_Xpath = prepareValueForMySqlInsert(rst.getString("detail_pages_mainContentElement_Xpath"));
			String detailClusterWidthRatio = prepareValueForMySqlInsert(rst.getString("detailClusterWidthRatio"));
			String detailLinkfeatures = prepareValueForMySqlInsert(rst.getString("detailLinkfeatures"));
			String detail_cluster_is_clonos = prepareValueForMySqlInsert(rst.getString("detail_cluster_is_clonos"));

			
			String updateNavPattQuery = 
				"UPDATE navigation_pattern SET "+
				"detail_links_ctp = "+ detail_links_ctp + "," +
				"navigation_links_ctp = "+ navigation_links_ctp + "," +
				"first_detail_link_xpath = "+ first_detail_link_xpath + "," +
				"detail_links_xpath_difference = '"+ detail_links_xpath_difference + "'," +
				"detail_pages_mainContentElement_Xpath = "+ detail_pages_mainContentElement_Xpath + "," +
				"detailClusterWidthRatio = "+ detailClusterWidthRatio + "," +
				"detailLinkfeatures = "+ detailLinkfeatures + "," +
				"detail_cluster_is_clonos = "+ detail_cluster_is_clonos + 
				" WHERE id="+navigation_id;

			stmt = null;
		    stmt=conTargetDB.createStatement();
	        stmt.executeUpdate(updateNavPattQuery);	        

	        /*
				1.2) IF resource is FORM_table UPDATE THE NEW search button patterns TO 'PRODUCTION' DB
			*/
			if(form_id != null){
				stmt = null;
				rst	= null;
			    stmt=conSourceDB.createStatement();
				rst = stmt.executeQuery("SELECT * FROM form_table where id = " + form_id);
				if(rst.first()){
					String search_button_xpath = prepareValueForMySqlInsert(rst.getString("search_button_xpath"));
					String search_button_text = prepareValueForMySqlInsert(rst.getString("search_button_text"));
					String search_button_attributes = prepareValueForMySqlInsert(rst.getString("search_button_attributes"));
					
					String updateFormTableQuery = 
						"UPDATE form_table SET "+
						"search_button_xpath = "+ search_button_xpath + "," +
						"search_button_text = "+ search_button_text + "," +
						"search_button_attributes = "+ search_button_attributes +
						" WHERE id="+form_id;

					stmt = null;
				    stmt=conTargetDB.createStatement();
			        stmt.executeUpdate(updateFormTableQuery);
				}
			}
			
			/*
				2) UPDATE THE LOGG MESSAGE OF THE NAVIGATION PATTERN IN PRODUCTION(TARGET DB)
			*/
			ps = null;
			ps = conTargetDB.prepareStatement("update  navigation_pattern set log_message = \""+succesLogMessage+"\"  where id = ?");
			ps.setInt(1, Integer.parseInt(navigation_id));
			ps.executeUpdate();

			
			/*
				3)DELETE RESOURCE'S RECORDS FROM MAINTANCE DATABASE(SOURCE DB)
			*/
			//DELETE all the job posts form this navigation id...
			ps = null;
			ps = conSourceDB.prepareStatement("delete from job_post where navigation_id = ?");
			ps.setInt(1, Integer.parseInt(navigation_id));
			ps.executeUpdate();
			/*
			DELETE the navigation pattern becasue we are not allowed navig_pat with the same forefign key
			*/
			ps = null;
			ps = conSourceDB.prepareStatement("delete from navigation_pattern where id = ?");
			ps.setInt(1, Integer.parseInt(navigation_id));
			ps.executeUpdate();
			//DELETE THE RESOURCE - FORM or LIST 
			ps = null;
			if(list_id != null){
				ps = conSourceDB.prepareStatement("delete from list_page where id = ?");
				ps.setInt(1, Integer.parseInt(list_id));
				ps.executeUpdate();
			}
			else{
				ps = conSourceDB.prepareStatement("delete from form_table where id = ?");
				ps.setInt(1, Integer.parseInt(form_id));
				ps.executeUpdate();
			}
			
			
			
			
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
			if(stmt!=null){
				stmt.close();
				stmt=null;
			}
			if(ps != null) {
				ps.close();
				ps = null;
			}
			if(conSourceDB != null) {
				conSourceDB.close();
				conSourceDB = null;
			}
			if(conTargetDB != null) {
				conTargetDB.close();
				conTargetDB = null;
			}
		} catch (SQLException e) {
			out.println(e);
			throw new SQLException( e);
		}
	}
%>




<%!
/**
@return the given value on "'" quotes, in case that thevalue is null then dont add the "'" uround them..return just null
*/
public String prepareValueForMySqlInsert(String valueForInsert){
    return valueForInsert  == null ? valueForInsert : "'"+valueForInsert+"'";
}
%>

</body>
</html>