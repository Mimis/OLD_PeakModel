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
	
	String database = "test";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>DUPLICATION or a job board RESOURCE - Updating Database  assign feedback to 2 into the navigation patterns</title>
</head>
<body>
<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection ("jdbc:mysql://localhost/"+database, "root", "salle20mimis");
	    
		ps = con.prepareStatement("update navigation_pattern set feedback = 2 where id=?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();
				
		
		ps = null;
		
		/*
		DELETE all the job posts form this navigation id...
		TODO assign as in valid...
		*/
		ps = con.prepareStatement("update  job_post set valid = 0  where navigation_id = ?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();
		
		/* ps = con.prepareStatement("delete from job_post where navigation_id = ?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate(); */
		
		ps = null;
		
		
		
		%>
			Database successfully Updated!  <br>Assign all extracted jobs as In valid <br>Assign the navigation_patterns with FEEDBACK to 2<br>  
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