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
 	//get the seed url
	String seed_url = request.getParameter("seed_url");
 	
	String database = "test";
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>Updating Database Assign the seed as Not Crawled</title>
</head>
<body>
<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection ("jdbc:mysql://localhost/"+database, "root", "salle20mimis");

				  
		ps = null;
		
	    /*
	    ASSIGN THE CURRENT SEED URL AS NOT NAVIGATED...
	    */
	    stmt=con.createStatement();
	    rst=stmt.executeQuery("SELECT id FROM seeds where url = '"+seed_url+"';");
		String seed_id = null;
		while (rst.next()) {
			seed_id = rst.getString("id");
		}
		
		
		if(seed_id != null){
			ps = con.prepareStatement("update seeds set crawled = 0 where id=?");
			ps.setInt(1, Integer.parseInt(seed_id));
			ps.executeUpdate();
			
			ps=null;
			
			
		}
		
		
		%>
			Database successfully Updated! <br>Assign the Seed as Non Navigate in order to crawl it again!!! (CRAWLED=0)
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