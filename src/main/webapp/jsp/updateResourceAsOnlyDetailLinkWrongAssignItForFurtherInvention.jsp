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
	String feedback = "3";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>ONLY DETAIL LINKS ARE WRONG...LEAVE IT INTO THE DB FOR LATER INSPECTION-ASSIGN NAV_PAT==3 AND  MAKE INVALID ITS JOBS</title>
</head>
<body>
<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection ("jdbc:mysql://localhost/"+database, "root", "salle20mimis");
	    
		ps = con.prepareStatement("update navigation_pattern set feedback = "+ feedback  +" where id=?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();
				
		
		ps = null;
		
		/*
		DELETE all the job posts form this navigation id...
		*/
		ps = con.prepareStatement("update  job_post set valid = 0  where navigation_id = ?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();

		ps = null;
		
		
		
		%>
			Database successfully Updated!  <br>ONLY DETAIL LINKS ARE WRONG...LEAVE IT INTO THE DB FOR LATER INSPECTION-
			<br>ASSIGN NAV_PAT==3 AND  MAKE INVALID ITS JOBS<br>  
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