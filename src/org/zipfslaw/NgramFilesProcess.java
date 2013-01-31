package edu.ngram.general;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import edu.ngram.lucene.util.Helper;

public class NgramFilesProcess {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String fileToRead=args[0];
		String outputFile=args[1];
		
		long startTime = System.currentTimeMillis();
		int countLines=0;
		String lastGram=null;
		int lastGramTotalFreq=0;
		File file = new File(fileToRead);
		try {
			BufferedReader input = new BufferedReader(new FileReader(file));
			try {
				String line = null; // not declared within while loop
				while ((line = input.readLine()) != null) {
					if(line.length()>0){
						String a[] = line.split("\t");

						//new ngram
						if(lastGram==null || !lastGram.equals(a[0])){
							
							if(lastGram!=null){
								Helper.writeToFile(outputFile, lastGramTotalFreq+";"+lastGram+"\n", true);
							}
							
							lastGram=a[0];
							lastGramTotalFreq=Integer.parseInt(a[2]);
						}
						//already seen ngram
						else{
							lastGramTotalFreq+=Integer.parseInt(a[2]);
						}
						
						if(countLines++ % 100000000 == 0)
							System.out.println(countLines +"\t"+line);
					}
				}
			} finally {
				Helper.writeToFile(outputFile, lastGramTotalFreq+";"+lastGram+"\n", true);
				input.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		
        long endTime = System.currentTimeMillis();
	    System.out.println("# Total run time:"+ (endTime-startTime)/1000);

	}
}
