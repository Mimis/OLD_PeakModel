package edu.ngram.lucene.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Helper {
	/**
	 * Save a string to a file and append a newline character to that string.
	 * 
	 * @param filename
	 *            The filename to save to.
	 * @param text
	 *            The text to save.
	 * @param append
	 *            Whether to append to existing file.
	 * @throws IOException
	 *             On error.
	 */
	public static void writeToFile(String filename, String text, boolean append) throws IOException{
//		FileWriter fw = new FileWriter(filename, append);
//		fw.write(text);
//		fw.close();
//		
		
		BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filename,append),"UTF8"));
		out.write(text);
		out.close();
	}

    /**
     * Read the given file line by lien and return a list of strings
     * @param fileToRead
     * @return list of strings with each string taht exist in the file
     */
    public static List<String> readFileLineByLineReturnListOfLineString(String fileToRead){
		List<String> lineWords = new ArrayList<String>();
		File file = new File(fileToRead);
		try {
			BufferedReader input = new BufferedReader(new FileReader(file));
			try {
				String line = null; // not declared within while loop
				while ((line = input.readLine()) != null) {
					if(line.length()>0)
						lineWords.add(line.trim().replaceAll("\\n",""));
				}
			} finally {
				input.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return lineWords;
	
    }
    
    public static String readFileReturnWholeText(String fileToRead){
    	StringBuilder buf = new StringBuilder();
    	File file = new File(fileToRead);
		try {
			BufferedReader input = new BufferedReader(new FileReader(file));
			try {
				String line = null; // not declared within while loop
				while ((line = input.readLine()) != null) {
					if(line.length()>0)
						buf.append(line.trim().replaceAll("\\n","")+" ");
				}
			} finally {
				input.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return buf.toString();
	
    }
    
    /**
     * read file line by line, split each line via the given separator and save it to the map
     * @param fileToRead
     * @param separator
     * @return Map<String,String>
     */
    public static Map<String,String> readFileLineByLineReturnMapOfLineString(String fileToRead,String separator){
		HashMap<String,String> lineWords = new HashMap<String,String>();
		File file = new File(fileToRead);
		try {
			BufferedReader input = new BufferedReader(new FileReader(file));
			try {
				String line = null; // not declared within while loop
				while ((line = input.readLine()) != null) {
					if(line.length()>0){
						line = line.trim().replaceAll("\\n","");
						String[] seedUrlToCashUrl = line.split(separator);
						lineWords.put(seedUrlToCashUrl[0], seedUrlToCashUrl.length==2?seedUrlToCashUrl[1]:null );
					}
				}
			} finally {
				input.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return lineWords;
	
    }

}

