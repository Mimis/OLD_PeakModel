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
	<title>Updating Database Assign ALL as Negative except of the PAGE</title>
</head>
<body>
<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection ("jdbc:mysql://localhost/"+database, "root", "salle20mimis");
				  
		ps = null;
		
	    /*
	    FIND FIRST IF THE CURRENT RESOURCE IS A LIST PAGE OR A FORM
	    */
	    stmt=con.createStatement();
	    rst=stmt.executeQuery("SELECT form_id FROM navigation_pattern where id = "+form_navigation_id);
		String form_id = null;
		while (rst.next()) {
			form_id = rst.getString("form_id");
		}
		
		
		
		/*
		IS FORM so assing it as negative...but not the derived list page from this form because the page is Possitive
		Here i am loosing the LinkThat We Follow in order to find this page because we assign the form as negative and in the form table exist the links that we follow
		*/
		if(form_id != null){
			ps = con.prepareStatement("update form_table set class = -1 where id=?");
			ps.setInt(1, Integer.parseInt(form_id));
			ps.executeUpdate();
			
			ps=null;
			
			
		}
		
		
		//else is a LIST PAGE - in this case the PAGE is POSSITIVE so we dont assign it as NEGGATIVE
		else{
			
		}
		
		
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
		
		/*
		Set negative feed - assifn the feedback in the resource navigation pattern to 0
		*/
		ps = con.prepareStatement("update navigation_pattern set feedback = 0 where id = ?");
		ps.setInt(1, Integer.parseInt(form_navigation_id));
		ps.executeUpdate();
		
		
		
		
		%>
			Database successfully Updated! <br>Make InVAlid(equal to 0) all extracted jobs from this resource <br>Set the feedback at the navigation_patterns table equal to 0!<br>Assign as Negative the Form if the resource page is form<br>But do not assign as Negative the PAGE!!!
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