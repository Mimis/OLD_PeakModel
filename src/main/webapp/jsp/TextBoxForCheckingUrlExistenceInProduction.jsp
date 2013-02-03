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

	String input_data = request.getParameter("INPUT_DATA").trim();
	String database = "Production";
	
%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">


<html>
<head>
	<title>Check given Url existence in Production </title>
</head>
<body>

<%
	try {
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection ("jdbc:mysql://localhost/"+database, "root", "salle20mimis");
				  
		ps = null;
	    stmt=con.createStatement();
	    rst=stmt.executeQuery("SELECT url FROM form_table where url like \"%"+input_data+"%\"   and id IN (select form_id from navigation_pattern where feedback=1);");
	    StringBuffer urlsFormTable = new StringBuffer();
		while (rst.next()) {
			String currentUrl = rst.getString("url");
			urlsFormTable.append(currentUrl + "\n");
		}
		
		ps = null;
		rst = null;
		stmt=null;
	    stmt=con.createStatement();
	    rst=stmt.executeQuery("SELECT url FROM list_page where url like \"%"+input_data+"%\"  and id IN (select list_id from navigation_pattern where feedback=1);");
	    StringBuffer urlsListPage = new StringBuffer();
		while (rst.next()) {
			String currentUrl = rst.getString("url");
			urlsListPage.append(currentUrl + "<br>");
		}
		
		String listUrl = urlsListPage.toString();
		String formUrl = urlsFormTable.toString();
		%>
			In the Production we got: <br>Lists: <%= listUrl %>  <br> Forms: <%= formUrl %>
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