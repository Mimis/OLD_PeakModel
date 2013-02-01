package org.thesis.java.xml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class ProcessKBxml {
	public static void main(String args[]) throws IOException {
		String fileToRead = "./data/1991.xml";
		removeXmlAttributeNamespaces(args[0]);
//		TokenizeString(string, false, false);
	}
	
    
	public static void removeXmlAttributeNamespaces(String xmlText) throws IOException{
		long startTime = System.currentTimeMillis();

		String fileToReplace = xmlText;
		File file = new File(fileToReplace);
		File tempFile = new File("temp.txt");

		BufferedReader reader = new BufferedReader(
				new FileReader(fileToReplace));
		PrintWriter writer = new PrintWriter(tempFile);
		String line = null;
		String matchRegex = "pm:source";
		String replacement = "source";
		String matchRegex2 = "pm:description";
		String replacement2 = "description";

		while ((line = reader.readLine()) != null) {
			line = line.trim();
			line = line.replaceAll(matchRegex, replacement);
			line = line.replaceAll(matchRegex2, replacement2);
			writer.println(line);
		}
		reader.close();
		writer.close();

		if (file.delete())
			System.out.println(file.getName() + " is deleted!");
		if (tempFile.renameTo(file))
			System.out.println(file.getName() + " renamed!");
		
        long endTime = System.currentTimeMillis();
	    System.out.println("#Total run time:"+ (endTime-startTime)/1000);

	}
	
	public static List<String> TokenizeString(String string,boolean omitDigits,boolean omitPunct) {
		List<String> tokens = new ArrayList<String>();
		
		if(string == null || string.matches("\\s*") )
			return null;
		
		int cursor = 0;
		while (cursor < string.length()) {
			char ch = string.charAt(cursor);
			
			if (Character.isWhitespace(ch)) {
				cursor++;
			} 
			else if (Character.isLetter(ch)) {
				StringBuilder buf = new StringBuilder();
				while (cursor < string.length()	&& (Character.isLetter(string.charAt(cursor)) || Character.isDigit(string.charAt(cursor)))) {
					buf.append(string.charAt(cursor));
					cursor++;
				}
				String token = buf.toString();
				tokens.add(token);
			} 
			else if (Character.isDigit(ch) && !omitDigits) {
				StringBuilder buf = new StringBuilder();
				while (cursor < string.length()	&& (Character.isLetter(string.charAt(cursor)) || Character.isDigit(string.charAt(cursor)))) {
					buf.append(string.charAt(cursor));
					cursor++;
				}
				String token = buf.toString();
				tokens.add(token);
			} 
			else if(!omitPunct){
				//SAVE PUNCT token
				tokens.add(Character.toString(ch));
				cursor++;
			}
			else
				cursor++;
		}
		return tokens;
	}

}
