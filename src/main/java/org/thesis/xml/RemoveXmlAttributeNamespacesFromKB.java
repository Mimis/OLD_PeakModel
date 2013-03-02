
package org.thesis.xml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

public class RemoveXmlAttributeNamespacesFromKB {
	public static void main(String args[]) throws IOException {
		
		File file = new File(args[0]);
		if(file.isFile() && file.getName().endsWith(".xml")){
			System.out.println(file.getName());
			removeXmlAttributeNamespaces(file);
		}
		else if(file.isDirectory()){
			for (final File fileEntry : file.listFiles()) {
				if(fileEntry.getName().endsWith(".xml")){
					System.out.println(fileEntry.getName());
					removeXmlAttributeNamespaces(fileEntry);
				}
		    }
		}
	}
	
    
	public static void removeXmlAttributeNamespaces(File file) throws IOException{
		long startTime = System.currentTimeMillis();

		File tempFile = new File(file.getParent()+"/temp.txt");

		BufferedReader reader = new BufferedReader(new FileReader(file));
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
