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
		2.1) Wrong Detail Links:	-	TRY TO SOLVE IT AGAIN....
			*UPDATE LOGS on PRODUCTIONs
				*FAIL msg: 'UPDATE ERROR CODE:1.0.0' + 'ERROR CODE:1.3.0	Part3. Extract Information '    	=> 		MAKE IT AVAILABLE FOR PATTERN SOLVING AGAIN IN PRODUCTION
			*DELETE RESOURCE's records from Maintance
			
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
	String failLogMessage = "UPDATE ERROR CODE:1.0.0' \n\t 'ERROR CODE:1.3.0  \n FAILED TO EXTRACT the correct INFO DURRING PATTERN SOLVER!";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>Navigate Again Resource</title>
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
		
		
			
			
			/*
				1) UPDATE THE LOGG MESSAGE OF THE NAVIGATION PATTERN IN PRODUCTION(TARGET DB) in order to try solve again this resource!
			*/
			ps = null;
			ps = conTargetDB.prepareStatement("update  navigation_pattern set log_message = \""+failLogMessage+"\"  where id = ?");
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
			
			
			
			
			%>
				Wrong Detail Extraction: Try to solve again this resource!
				<br>1)Delete resource in Maintance
				<br>2)Update logs in the Production=>UPDATE ERROR CODE:1.0.0' + 'ERROR CODE:1.3.0
				<br>  
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