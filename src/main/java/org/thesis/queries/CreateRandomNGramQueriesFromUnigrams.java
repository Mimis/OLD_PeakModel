package org.thesis.xml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class CreateRandomNGramQueriesFromUnigrams {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		String unigramQueriesFile = "/Users/mimis/Development/Thesis/PeakModel/src/main/benchmark/uni-queries";
		String outputNgramQueriesOutput = "/Users/mimis/Development/Thesis/PeakModel/src/main/benchmark/ngram-queries";
		int max_ngram_size = 10;
		createRamdomnnGramQueries(unigramQueriesFile, outputNgramQueriesOutput,max_ngram_size);
	}
	
	public static void createRamdomnnGramQueries(String unigramQueriesFile,String outputNgramQueriesOutput,int max_ngram_size) throws IOException{
		/*
		 * Read unigram file
		 */
		List<String> unigramsList = new ArrayList<String>();
		BufferedReader reader = new BufferedReader(new FileReader(unigramQueriesFile));
		String line = null;
		while ((line = reader.readLine()) != null) {
			line = line.trim();
			unigramsList.add(line);
		}
		reader.close();
		
		/*
		 * Create ngram queries  
		 */
		File outputFile = new File(outputNgramQueriesOutput);
		PrintWriter writer = new PrintWriter(outputFile);

		int unigramsSize = unigramsList.size();
		Random randomGenerator = new Random();
		for(String unig:unigramsList){
			StringBuilder buf = new StringBuilder();
			buf.append(unig+" ");
			int currentNgramSize = randomGenerator.nextInt(max_ngram_size)+1;
			for(int i=1;i<currentNgramSize;i++){
				String newUnig = unigramsList.get(randomGenerator.nextInt(unigramsSize));
				buf.append(newUnig+" ");
			}
			String finalNGramQuery = buf.toString().trim();
			System.out.println("initial unigram:"+unig+"\tfinalNgramQuery:"+finalNGramQuery);
			writer.println(finalNGramQuery);
		}
		writer.close();
	}
}
