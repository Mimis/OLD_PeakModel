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
	2)FAIL:	
		2.2) Website changed:	-	CRAWL AGAIN THE SEEDS and MAKE THE RESOURCE ON PRODUCTION AS DUPLICATE IN ORDER NOT TO UPDATE IT AGAIN....
			*UPDATE LOGS on PRODUCTIONs
				*FAIL msg:	'WEBSITE CHANGED - RESOURCE IS INVALID!'  		
			*PRODUCTION.FEEDBACK = 2 IS DUPLICATE...
			*DELETE RESOURCE's records from Maintance
			*Test DB: make the seed of the current resource as not navigated
			
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
	
	//the   log_messages to update the navigation_pattern in Production in order to make the pattern INVALID FOR EVER
	String failLogMessage = "WEBSITE CHANGED - RESOURCE IS INVALID!";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>Crawl again the Seed</title>
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
			String list_id=null;
			String form_id=null;
		    stmt=conSourceDB.createStatement();
			rst = stmt.executeQuery("SELECT * FROM navigation_pattern where id = " + navigation_id);
			if(rst.first()){
				list_id = rst.getString("list_id");
				form_id = rst.getString("form_id");
			}
		
		
			
			
			/**
				1) UPDATE THE LOGG MESSAGE to WEBSITE CHANGED - RESOURCE IS INVALID! and FEDDBACK to 2 in order not to Update it again
			*/
			ps = null;
			ps = conTargetDB.prepareStatement("update  navigation_pattern set log_message = \""+failLogMessage+"\", feedback=2  where id = ?");
			ps.setInt(1, Integer.parseInt(navigation_id));
			ps.executeUpdate();

			
			
			
			
			
			
			
			/*
				2)DELETE RESOURCE'S RECORDS FROM MAINTANCE DATABASE(SOURCE DB)
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
			
			
			
			
			
			
			/*
				3)Test DB: make the resource's seed as not Crawled!'
			*/
			//FIND FIRST THE SEED_ID
			String seed_id=null;
			stmt = null;rst = null;
			if(list_id == null){
			    stmt=conTargetDB.createStatement();
			    rst = stmt.executeQuery("SELECT * FROM form_table where id = " + form_id);
			}
			else{ 								  //is a LIST_PAGE RESOURCE
				stmt=conTargetDB.createStatement();
				rst = stmt.executeQuery("SELECT * FROM list_page where id = " + list_id);
			}
			if(rst.first())
				seed_id = rst.getString("seed_id");
			//UPDATE THE SEED AS NOT CRAWLED ON TEST DB
			ps = null;
			ps = conTargetDB.prepareStatement("update  test.seeds set crawled=0  where id = ?");
			ps.setInt(1, Integer.parseInt(seed_id));
			ps.executeUpdate();


			
			
			
			
		
			
			%>
				WEBSITE CHANGED: Make resource as not invalid and crawl again its seed!
				<br>1)Delete resource in Maintance
				<br>2)Update logs in the Production=>'WEBSITE CHANGED - RESOURCE IS INVALID!'
				<br>3)Update PRODUCTION.FEEDBACK = 2 (DUPLICATE) in order not to navigate again...
				<br>4)Test DB: make the resource's seed as not Crawled!'
				  
			<%
		
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