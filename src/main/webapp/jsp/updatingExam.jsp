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
	Connection con = null;  
	PreparedStatement ps = null;
	ResultSet rst=null;
	Statement stmt=null;

	String formText = request.getParameter("form_navigation_id");
	//we save it as form:form_navigation_id
	String form_navigation_id = formText.split(":")[1]; 
	String form_url = request.getParameter("form_url");
	
	//String database_code = request.getParameter("database_code").split(":")[1];
	String database = "test";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>...</title>
</head>
<body>
<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection ("jdbc:mysql://localhost/"+database, "root", "root");
				  
		ps = null;
		
	    /*
	    FIND FIRST IF THE CURRENT RESOURCE IS A LIST PAGE OR A FORM
	    */
	    stmt=con.createStatement();
	    rst=stmt.executeQuery("SELECT form_id FROM table2 where id = "+form_navigation_id);
		String form_id = null;
		while (rst.next()) {
			form_id = rst.getString("form_id");
		}
		
		
		
		//IS FORM  set it as not navigated in order to do visit again
		if(form_id != null){
			ps = con.prepareStatement("update table2 set navigated = 3 where id=?");
			ps.setInt(1, Integer.parseInt(form_id));
			ps.executeUpdate();
			
			ps=null;
		}
		
		
		//else is a LIST PAGE
		else{
			ps = con.prepareStatement("update list_page set navigated = 3  where id=(SELECT list_id FROM navigation_pattern where id = ?)");
			ps.setInt(1, Integer.parseInt(form_navigation_id));
			ps.executeUpdate();
		}
		
		
		
		
		ps = null;
		
		/*
		DELETE all the job posts form this navigation id...
		*/
		ps = con.prepareStatement("delete from job_post where navigation_id = ?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();
		
		ps = null;
		
		/*
		DELETE the navigation pattern becasue we are not allowed navig_pat with the same forefign key
		*/
		ps = con.prepareStatement("delete from navigation_pattern where id = ?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();
		
		
		
		
		%>
			Database successfully Updated!  <br>Updating Database delete all the job posts and the navigation patterns and assign the resource page's navigation field to "3"<br>  
		<%
		
		
	} catch (SQLException e) {
		out.println(e);
		throw new SQLException("JDBC Driver not found.", e);
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
			if(con != null) {
				con.close();
				con = null;
			}
		} catch (SQLException e) {}
	}
%>
</body>
</html>