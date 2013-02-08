package org.thesis.java.xml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

public class ProcessKBxml {
	public static void main(String args[]) throws IOException {
		removeXmlAttributeNamespaces(args[0]);
	}
	
    
	public static void removeXmlAttributeNamespaces(String fileForProcessing) throws IOException{
		long startTime = System.currentTimeMillis();

		String fileToReplace = fileForProcessing;
		File file = new File(fileToReplace);
		File tempFile = new File(file.getParent()+"/temp.txt");
		

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
}
