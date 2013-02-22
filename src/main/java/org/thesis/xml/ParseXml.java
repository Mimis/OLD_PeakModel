package org.thesis.xml;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ParseXml {

	/**
	 * @param args
	 */
	public static void main(String[] args) throws ParserConfigurationException,
			SAXException, IOException, XPathExpressionException {

		String xmlFile="/Users/mimis/Development/Thesis/PeakModel/src/main/benchmark/Bottom4000_uni_queries.xml";
		String xpath = "/response/lst[2]/lst/int/@name";
		executeXpath(xmlFile, xpath);
	}
	
	/**
	 * 
	 * @param xmlFile
	 * @param xpath
	 * @return list with the return values after executing the given xpath 
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 * @throws XPathExpressionException
	 */
	public static List<String> executeXpath(String xmlFile,String xpath) throws ParserConfigurationException, SAXException, IOException, XPathExpressionException{
		List<String> valuesList = new ArrayList<String>();
		DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance();
		domFactory.setNamespaceAware(true);
		DocumentBuilder builder = domFactory.newDocumentBuilder();
		Document doc = builder.parse(xmlFile);
		XPath xpathLib = XPathFactory.newInstance().newXPath();
		// XPath Query for showing all nodes value
		XPathExpression expr = xpathLib.compile(xpath);

		Object result = expr.evaluate(doc, XPathConstants.NODESET);
		NodeList nodes = (NodeList) result;
		for (int i = 0; i < nodes.getLength(); i++) {
			System.out.println(nodes.item(i).getNodeValue());
			valuesList.add(nodes.item(i).getNodeValue());
		}
		return valuesList;
	}
}
