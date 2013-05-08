package org.ngram.solr.searchComponent;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import org.apache.lucene.index.FieldInfo;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.StoredFieldVisitor;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.Terms;
import org.apache.lucene.index.TermsEnum;
import org.apache.lucene.util.BytesRef;
import org.apache.solr.common.SolrException;
import org.apache.solr.common.params.CommonParams;
import org.apache.solr.common.params.SolrParams;
import org.apache.solr.common.params.TermVectorParams;
import org.apache.solr.common.util.NamedList;
import org.apache.solr.core.SolrCore;
import org.apache.solr.handler.component.ResponseBuilder;
import org.apache.solr.handler.component.SearchComponent;
import org.apache.solr.handler.component.ShardRequest;
import org.apache.solr.handler.component.ShardResponse;
import org.apache.solr.schema.IndexSchema;
import org.apache.solr.schema.SchemaField;
import org.apache.solr.search.DocList;
import org.apache.solr.search.DocListAndSet;
import org.apache.solr.search.ReturnFields;
import org.apache.solr.search.SolrIndexSearcher;
import org.apache.solr.search.SolrReturnFields;
import org.apache.solr.util.SolrPluginUtils;
import org.apache.solr.util.plugin.SolrCoreAware;

/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 
 * TEST QUERIES: 
 *  one core:
 * http://localhost:8080/solr/core1950/select?q=nederland&wt=xml&indent=true&fl=id,article_title&ng=true&tv.fl=article_title,paragraph&tv.tf=true&tv.df=true 
	multi-core:
 * FACET:http://localhost:8080/solr/core1950/select?shards=localhost:8080/solr/core1950,localhost:8080/solr/core1960,localhost:8080/solr/core1970,localhost:8080/solr/core1980,localhost:8080/solr/core1990&shards.info=true&fl=id,article_title&tv.fl=paragraph&tv.tf=true&tv.df=true&rows=20&facet=true&facet.field=article_title&facet.limit=10&facet.mincount=1&facet.offset=0&q=nederland
 * http://localhost:8080/solr/core1950/select?shards=localhost:8080/solr/core1950,localhost:8080/solr/core1960,localhost:8080/solr/core1970,localhost:8080/solr/core1980,localhost:8080/solr/core1990&shards.info=true&fl=id,article_title&tv.fl=article_title,paragraph&tv.tf=true&tv.df=true&q=nederland
 * 
 * Return term vectors for the documents in a query result set.
 * <p/>
 * Info available: term, frequency, position, offset, IDF.
 * <p/>
 * <b>Note</b> Returning IDF can be expensive.
 * 
 * <pre class="prettyprint">
 * &lt;searchComponent name="tvComponent" class="solr.TermVectorComponent"/&gt;
 * 
 * &lt;requestHandler name="/terms" class="solr.SearchHandler"&gt;
 *   &lt;lst name="defaults"&gt;
 *     &lt;bool name="tv"&gt;true&lt;/bool&gt;
 *   &lt;/lst&gt;
 *   &lt;arr name="last-component"&gt;
 *     &lt;str&gt;tvComponent&lt;/str&gt;
 *   &lt;/arr&gt;
 * &lt;/requestHandler&gt;
 * </pre>
 * 
 * 
 */
public class NGrammComponent extends SearchComponent implements SolrCoreAware {

	private static final Logger LOGGER = Logger.getLogger(NGrammComponent.class
			.getName());
	static final String LOG_PROPERTIES_FILE = "./logs/log4j_NGrammComponent.properties";

	public static final String COMPONENT_NAME = "ng";
	public static final String RETURN_TOP_N = "ng.topN";
	public static final String SORT_NGRAMM = "ng.sort";
	public static final String TOTAL_DOCS = "totalDocs";
	
	protected NamedList initParams;
	// THIS THE NAME OF THE SOLR RESPONCE XML ELEMENT THAT CONTAINS OUR
	// COMPONENTS OUTPUT
	public static final String TERM_VECTORS = "ngramm";

	@Override
	public void process(ResponseBuilder rb) throws IOException {
		long startTime = System.currentTimeMillis();

		SolrParams params = rb.req.getParams();
		if (!params.getBool(COMPONENT_NAME, false)) {
			return;
		}

		NamedList<Object> termVectors = new NamedList<Object>();
		// data structures to keep fields terms' statistics
		Map<String, Map<String, NGrammStats>> fieldToTermStatsMap = new HashMap<String, Map<String, NGrammStats>>();

		rb.rsp.add(TERM_VECTORS, termVectors);

		IndexSchema schema = rb.req.getSchema();
		SchemaField keyField = schema.getUniqueKeyField();
		String uniqFieldName = null;
		if (keyField != null) {
			uniqFieldName = keyField.getName();
//			termVectors.add("uniqueKeyFieldName", uniqFieldName);
		}

		FieldOptions allFields = new FieldOptions();
		// figure out what options we have, and try to get the appropriate
		// vector
		allFields.termFreq = params.getBool(TermVectorParams.TF, false);
		allFields.docFreq = params.getBool(TermVectorParams.DF, false);
		allFields.tfIdf = params.getBool(TermVectorParams.TF_IDF, false);
		// boolean cacheIdf = params.getBool(TermVectorParams.IDF, false);
		// short cut to all values.
		if (params.getBool(TermVectorParams.ALL, false)) {
			allFields.termFreq = true;
			allFields.docFreq = true;
			allFields.tfIdf = true;
		}

		// Build up our per field mapping
		Map<String, FieldOptions> fieldOptions = new HashMap<String, FieldOptions>();
		NamedList<List<String>> warnings = new NamedList<List<String>>();
		List<String> noTV = new ArrayList<String>();
		List<String> noPos = new ArrayList<String>();
		List<String> noOff = new ArrayList<String>();

		Set<String> fields = getFields(rb);
		if (null != fields) {
			// we have specific fields to retrieve, or no fields
			for (String field : fields) {

				// workarround SOLR-3523
				if (null == field || "score".equals(field))
					continue;

				// we don't want to issue warnings about the uniqueKey field
				// since it can cause lots of confusion in distributed requests
				// where the uniqueKey field is injected into the fl for merging
				final boolean fieldIsUniqueKey = field.equals(uniqFieldName);

				SchemaField sf = schema.getFieldOrNull(field);
				if (sf != null) {
					if (sf.storeTermVector()) {
						FieldOptions option = fieldOptions.get(field);
						if (option == null) {
							option = new FieldOptions();
							option.fieldName = field;
							fieldOptions.put(field, option);
						}
						// get the per field mappings
						option.termFreq = params.getFieldBool(field,
								TermVectorParams.TF, allFields.termFreq);
						option.docFreq = params.getFieldBool(field,
								TermVectorParams.DF, allFields.docFreq);
						option.tfIdf = params.getFieldBool(field,
								TermVectorParams.TF_IDF, allFields.tfIdf);

					} else {// field doesn't have term vectors
						if (!fieldIsUniqueKey)
							noTV.add(field);
					}
				} else {
					// field doesn't exist
					throw new SolrException(
							SolrException.ErrorCode.BAD_REQUEST,
							"undefined field: " + field);
				}
			}
		} // else, deal with all fields

		// NOTE: currently all typs of warnings are schema driven, and garunteed
		// to be consistent across all shards - if additional types of warnings
		// are added that might be differnet between shards, finishStage() needs
		// to be changed to account for that.
		boolean hasWarnings = false;
		if (!noTV.isEmpty()) {
			warnings.add("noTermVectors", noTV);
			hasWarnings = true;
		}
		if (!noPos.isEmpty()) {
			warnings.add("noPositions", noPos);
			hasWarnings = true;
		}
		if (!noOff.isEmpty()) {
			warnings.add("noOffsets", noOff);
			hasWarnings = true;
		}
		if (hasWarnings) {
			termVectors.add("warnings", warnings);
		}

		DocListAndSet listAndSet = rb.getResults();
		List<Integer> docIds = getInts(params
				.getParams(TermVectorParams.DOC_IDS));
		Iterator<Integer> iter;
		if (docIds != null && !docIds.isEmpty()) {
			iter = docIds.iterator();
		} else {
			DocList list = listAndSet.docList;
			iter = list.iterator();
		}
		SolrIndexSearcher searcher = rb.req.getSearcher();
		IndexReader reader = searcher.getIndexReader();


		// the TVMapper is a TermVectorMapper which can be used to optimize
		// loading of Term Vectors

		// Only load the id field to get the uniqueKey of that
		// field

		final String finalUniqFieldName = uniqFieldName;

		final List<String> uniqValues = new ArrayList<String>();

		// TODO: is this required to be single-valued? if so, we should STOP
		// once we find it...
		final StoredFieldVisitor getUniqValue = new StoredFieldVisitor() {
			@Override
			public void stringField(FieldInfo fieldInfo, String value) {
				uniqValues.add(value);
			}

			@Override
			public void intField(FieldInfo fieldInfo, int value) {
				uniqValues.add(Integer.toString(value));
			}

			@Override
			public void longField(FieldInfo fieldInfo, long value) {
				uniqValues.add(Long.toString(value));
			}

			@Override
			public Status needsField(FieldInfo fieldInfo) {
				return (fieldInfo.name.equals(finalUniqFieldName)) ? Status.YES	: Status.NO;
			}
		};
		
		/**
		 * Main... 1)iterate all responded docs 2) For each asked Field get its
		 * Terms 3) For each Term => mapOneVector() 4) Get its term and doc
		 * frequencies
		 * 
		 * ngrams: 1)keep only a {doc} with {field} {word} {tf} {doc}
		 */
		NamedList<Object> docNL = new NamedList<Object>();
		TermsEnum termsEnum = null;
		int c=0;
		while (iter.hasNext()) {
			Integer docId = iter.next();
//			LOGGER.info("docId:" + docId);

			// get unique key of current doc
			if (keyField != null && c==0) {
				reader.document(docId, getUniqValue);
				String uniqVal = null;
				if (uniqValues.size() != 0) {
					uniqVal = uniqValues.get(0);
					uniqValues.clear();
					docNL.add("uniqueKey", uniqVal);
//					termVectors.add(uniqVal, docNL);
					c++;
				}
			}
			// for each field of the current document get its termEnum
			if (null != fields) {
				for (Map.Entry<String, FieldOptions> entry : fieldOptions.entrySet()) {
					final String field = entry.getKey();
					final Terms vector = reader.getTermVector(docId, field);
					
					if (vector != null) {
						if (!fieldToTermStatsMap.containsKey(field)) 
							fieldToTermStatsMap.put(field,new HashMap<String, NGrammStats>());						
						Map<String, NGrammStats> fieldTotalTermStats = fieldToTermStatsMap.get(field);
						
						termsEnum = vector.iterator(termsEnum);
						// Get its term and doc frequencie
//						mapOneVector(docNL, entry.getValue(), reader,termsEnum, field);
						mapFieldTermStats(reader, termsEnum, fieldTotalTermStats,field);
					}
				}
			}
			if(c!=0)
				c++;
		}
		//displayTotalTermStats(fieldToTermStatsMap);
		String shards_parameter = rb.req.getParams().get("shards");
		//if its a not distributed query then sort TV by given method and return top N
		if(shards_parameter == null){
			int topN = rb.req.getParams().getInt(RETURN_TOP_N);
			String sortMethod = rb.req.getParams().get(SORT_NGRAMM);
		    int totalDocs = rb.req.getParams().getInt(TOTAL_DOCS);
			Map<String,Map<String, NGrammStats>> fieldToTermStatsMapSorted = sortByAndGetTopN(sortMethod, fieldToTermStatsMap, topN, totalDocs);
			mapToNameList(termVectors, fieldToTermStatsMapSorted, true);
		}
		else{
			mapToNameList(termVectors, fieldToTermStatsMap, true);
		}
		LOGGER.info("Process DocsIteratorSize:" + c +"\tProcess Time:" + getTimeMS(startTime)+"\t"+rb.getDebugInfo());
	}

	/**
	 * map the given map to doc NameList
	 * @param docNL
	 * @param fieldToTermStatsMap
	 */
	private void mapToNameList(NamedList<Object> termVectors, Map<String, Map<String, NGrammStats>> fieldToTermStatsMap,boolean idf){
		
		for(Map.Entry<String, Map<String, NGrammStats>> entry :fieldToTermStatsMap.entrySet()){
			NamedList<Object> fieldNL = new NamedList<Object>();
			termVectors.add(entry.getKey(), fieldNL);

			Map<String, NGrammStats> terms  = entry.getValue();
			LOGGER.info("Field:"+entry.getKey()+"\tNrOfTerms:"+terms.size());
			for(Map.Entry<String, NGrammStats> termStas :terms.entrySet()){
				NamedList<Object> termInfo = new NamedList<Object>();
				fieldNL.add(termStas.getKey(), termInfo);
				termInfo.add("tf", termStas.getValue().getTf());
				termInfo.add("df", termStas.getValue().getDf());
				if(idf)
					termInfo.add("idf", termStas.getValue().getIdf());
			}
		}
		
	}


	
	/**
	 * keep the doc frequencies for the whole collection 
	 * and in the result list of the top N 'relevant' documents
	 * @param reader
	 * @param termsEnum
	 * @param fieldTotalTermStats
	 * @param field
	 * @throws IOException
	 */
	private void mapFieldTermStats( IndexReader reader, TermsEnum termsEnum,Map<String, NGrammStats> fieldTotalTermStats,String field) throws IOException {
		BytesRef text;
		while ((text = termsEnum.next()) != null) {
			String term = text.utf8ToString();

			NGrammStats termStats = fieldTotalTermStats.get(term);
			if(termStats != null){
				termStats.increaseTf(1);
			}
			else{
				int df = reader.docFreq(new Term(field, text));
				fieldTotalTermStats.put(term, new NGrammStats(1, df));
			}
		}
	}

	/**
	 * Get for each given TermEnumaration its Term and Doc Frequency
	 * 
	 * @param docNL
	 * @param fieldOptions
	 * @param reader
	 * @param termsEnum
	 * @param field
	 * @throws IOException
	 */
	private void mapOneVector(NamedList<Object> docNL,FieldOptions fieldOptions, IndexReader reader, TermsEnum termsEnum,String field) throws IOException {
		NamedList<Object> fieldNL = new NamedList<Object>();
		docNL.add(field, fieldNL);

		BytesRef text;
		while ((text = termsEnum.next()) != null) {
			String term = text.utf8ToString();
			NamedList<Object> termInfo = new NamedList<Object>();
			fieldNL.add(term, termInfo);
			termInfo.add("tf", 1);
		
			int df = 0;
			if (fieldOptions.docFreq || fieldOptions.tfIdf) {
				df = reader.docFreq(new Term(field, text));
			}

			if (fieldOptions.docFreq) {
				termInfo.add("df", df);
			}
		}
	}

	/**
	 * 1. Get solr responces from all the Shardes 2. Save each doc in initial
	 * empty array in theindex of its rank 3. return the sorted array with the
	 * docs.. and add them in the final Component's responce
	 */
	@Override
	public void finishStage(ResponseBuilder rb) {
		if (rb.stage == ResponseBuilder.STAGE_GET_FIELDS) {
			long startTime = System.currentTimeMillis();

			int topN = 10; //default
			String sortMethod = "tf";
			Map<String, Map<String, NGrammStats>> fieldToTermStatsMap = new HashMap<String, Map<String, NGrammStats>>();
			NamedList<Object> termVectors = new NamedList<Object>();
			
			topN = rb.req.getParams().getInt(RETURN_TOP_N);
			sortMethod = rb.req.getParams().get(SORT_NGRAMM);
		    int totalDocs = rb.req.getParams().getInt(TOTAL_DOCS);
		    
			for (ShardRequest sreq : rb.finished) {
				if ((sreq.purpose & ShardRequest.PURPOSE_GET_FIELDS) == 0 || !sreq.params.getBool(COMPONENT_NAME, false)) {
					continue;
				}
				for (ShardResponse srsp : sreq.responses) {
					// map<field,termVector>
					NamedList<Object> nl = (NamedList<Object>) srsp.getSolrResponse().getResponse().get(TERM_VECTORS);
					LOGGER.info("\tsrsp.getNodeName()" + srsp.getShard() + "\tfinishStage Docs Size:" + nl.size());

					/*
					 * iterate all over the fields terms and save them in a temp Map
					 */
					sumUpTermFreqStatsPerField(nl, fieldToTermStatsMap);
				}				
			}
			//map to termVector and save it/ TODO here we need to procees the final result set.i.e. top N most frequent terms
			NamedList<Object> docNL = new NamedList<Object> ();
			
			//Sort by..and get the top N
			Map<String,Map<String, NGrammStats>> fieldToTermStatsMapSorted = sortByAndGetTopN(sortMethod, fieldToTermStatsMap, topN, totalDocs);
			
			mapToNameList(termVectors, fieldToTermStatsMapSorted,true);
			rb.rsp.add(TERM_VECTORS, termVectors);
			// timer
			LOGGER.info("finishStage Time:" + getTimeMS(startTime));
		}
	}
	
	private Map<String,Map<String, NGrammStats>> sortByAndGetTopN(String sortMethod,Map<String, Map<String, NGrammStats>>  fieldToTermStatsMap,int topN,int totalDocs){
		Map<String,Map<String, NGrammStats>> fieldToTermStatsMapSorted = new HashMap<String,Map<String, NGrammStats>>(); 
		if(sortMethod.equals("df"))
			fieldToTermStatsMapSorted = sortFieldToTermStatsMapByGetTopN(fieldToTermStatsMap,"df",topN);
		else if(sortMethod.equals("tf"))
			fieldToTermStatsMapSorted = sortFieldToTermStatsMapByGetTopN(fieldToTermStatsMap,"tf",topN);
		else if(sortMethod.equals("idf")){
			calculateIdfScores(fieldToTermStatsMap,totalDocs);
			fieldToTermStatsMapSorted = sortFieldToTermStatsMapByGetTopN(fieldToTermStatsMap,"idf",topN);
		}
		return fieldToTermStatsMapSorted;
	}
	
	private void calculateIdfScores(Map<String, Map<String, NGrammStats>> fieldToTermStatsMap,int totalDocs){
		for(Map.Entry<String,Map<String, NGrammStats>> entry : fieldToTermStatsMap.entrySet()){
			Map<String, NGrammStats> termStatsMap = entry.getValue();
			for(Map.Entry<String, NGrammStats> entryTerms : termStatsMap.entrySet()){
				NGrammStats termStats = entryTerms.getValue();
				double idf = Math.log10((double) totalDocs / termStats.getDf());
				termStats.setIdf(idf);
			}
		}
	}
	
	
	/**
	 * 
	 * @param fieldToTermStatsMap
	 * @param sortField
	 * @return the given map sorted by the given field 
	 */
	private Map<String,Map<String, NGrammStats>> sortFieldToTermStatsMapByGetTopN(Map<String,Map<String, NGrammStats>> fieldToTermStatsMap,String sortField,int topN){
		Map<String,Map<String, NGrammStats>> fieldToTermStatsMapSorted = new HashMap<String,Map<String, NGrammStats>> ();
		for(Map.Entry<String,Map<String, NGrammStats>> entry : fieldToTermStatsMap.entrySet()){
			String field = entry.getKey();
			Map<String, NGrammStats> termStatsMap = entry.getValue();
			if(sortField.equals("tf"))
				termStatsMap = sortMapByTFValue(termStatsMap,topN);
			else if(sortField.equals("df"))
				termStatsMap = sortMapByDFValue(termStatsMap,topN);
			else if(sortField.equals("idf"))
				termStatsMap = sortMapByIDFValue(termStatsMap,topN);
			fieldToTermStatsMapSorted.put(field, termStatsMap);
		}
		return fieldToTermStatsMapSorted;
	}
	
	

	
	/**
	 * Save/Appenf Term frequencies to the given fieldToTermStatsMap
	 * @param nl2
	 * @param fieldToTermStatsMap
	 */
	private void sumUpTermFreqStatsPerField(NamedList<Object> nl2,Map<String, Map<String, NGrammStats>> fieldToTermStatsMap){
		for (int y = 0; y < nl2.size(); y++) {
			String field = nl2.getName(y);
			if(!field.equals("uniqueKey")){
				NamedList<Object> nl3 = (NamedList<Object>) nl2.getVal(y);
				
				if (!fieldToTermStatsMap.containsKey(field)) 
					fieldToTermStatsMap.put(field,new HashMap<String, NGrammStats>());
				Map<String, NGrammStats> fieldTotalTermStats = fieldToTermStatsMap.get(field);

				
				for (int z = 0; z< nl3.size(); z++) {
					String term = nl3.getName(z);
					NGrammStats termStats = fieldTotalTermStats.get(term);
					NamedList<Object> nl4 = (NamedList<Object>) nl3.getVal(z);
					
					NGrammStats ngrammStats = new NGrammStats();
					for (int c = 0; c< nl4.size(); c++) {
						String TermStatName = nl4.getName(c);
						if(TermStatName.equals("idf"))
							ngrammStats.setIdf((Double)nl4.getVal(c));
						else
							ngrammStats.add(TermStatName, (Integer)nl4.getVal(c));
					}
					
					if(termStats != null){
						termStats.appendStats(ngrammStats);
					}
					else{
						fieldTotalTermStats.put(term, ngrammStats);
					}					
				}
				
			}
		}

	}

	private List<Integer> getInts(String[] vals) {
		List<Integer> result = null;
		if (vals != null && vals.length > 0) {
			result = new ArrayList<Integer>(vals.length);
			for (int i = 0; i < vals.length; i++) {
				try {
					result.add(new Integer(vals[i]));
				} catch (NumberFormatException e) {
					throw new SolrException(
							SolrException.ErrorCode.BAD_REQUEST,
							e.getMessage(), e);
				}
			}
		}
		return result;
	}

	@Override
	public void prepare(ResponseBuilder rb) throws IOException {

	}

	// ////////////////////// NamedListInitializedPlugin methods
	// //////////////////////

	@Override
	public void init(NamedList args) {
		super.init(args);
		this.initParams = args;
	}

	@Override
	public void inform(SolrCore core) {

	}

	@Override
	public String getSource() {
		return "$URL: https://svn.apache.org/repos/asf/lucene/dev/branches/lucene_solr_4_2/solr/core/src/java/org/apache/solr/handler/component/TermVectorComponent.java $";
	}

	@Override
	public String getDescription() {
		return "A Component for working with Term Vectors";
	}

	// ////////////////////// utilities methids ///////////////////////
	private long getTimeMS(long startTime) {
		// timer
		long endTime = System.currentTimeMillis();
		return endTime - startTime;
	}

	/**
	 * Helper method for determining the list of fields that we should try to
	 * find term vectors on.
	 * <p>
	 * Does simple (non-glob-supporting) parsing on the
	 * {@link TermVectorParams#FIELDS} param if specified, otherwise it returns
	 * the concrete field values specified in {@link CommonParams#FL} --
	 * ignoring functions, transformers, or literals.
	 * </p>java.lang.ClassCastException: java.lang.Double cannot be cast to java.lang.Integer at org.ngram.solr.searchComponent.NGrammComponent.sumUpTermFreqStatsPerField(NGrammComponent.java:523) at org.ngram.solr.searchComponent.NGrammComponent.finishStage(NGrammComponent.java:436) at org.apache.solr.handler.component.SearchHandler.handleRequestBody(SearchHandler.java:317) at org.apache.solr.handler.RequestHandlerBase.handleRequest(RequestHandlerBase.java:135) at org.apache.solr.core.SolrCore.execute(SolrCore.java:1817) at org.apache.solr.servlet.SolrDispatchFilter.execute(SolrDispatchFilter.java:639) at org.apache.solr.servlet.SolrDispatchFilter.doFilter(SolrDispatchFilter.java:345) at org.apache.solr.servlet.SolrDispatchFilter.doFilter(SolrDispatchFilter.java:141) at org.eclipse.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1291) at org.eclipse.jetty.servlet.ServletHandler.doHandle(ServletHandler.java:443) at org.eclipse.jetty.server.handler.ScopedHandler.handle(ScopedHandler.java:137) at org.eclipse.jetty.security.SecurityHandler.handle(SecurityHandler.java:556) at org.eclipse.jetty.server.session.SessionHandler.doHandle(SessionHandler.java:227) at org.eclipse.jetty.server.handler.ContextHandler.doHandle(ContextHandler.java:1044) at org.eclipse.jetty.servlet.ServletHandler.doScope(ServletHandler.java:372) at org.eclipse.jetty.server.session.SessionHandler.doScope(SessionHandler.java:189) at org.eclipse.jetty.server.handler.ContextHandler.doScope(ContextHandler.java:978) at org.eclipse.jetty.server.handler.ScopedHandler.handle(ScopedHandler.java:135) at org.eclipse.jetty.server.handler.ContextHandlerCollection.handle(ContextHandlerCollection.java:255) at org.eclipse.jetty.server.handler.HandlerCollection.handle(HandlerCollection.java:154) at org.eclipse.jetty.server.handler.HandlerWrapper.handle(HandlerWrapper.java:116) at org.eclipse.jetty.server.Server.handle(Server.java:367) at org.eclipse.jetty.server.AbstractHttpConnection.handleRequest(AbstractHttpConnection.java:486) at org.eclipse.jetty.server.AbstractHttpConnection.headerComplete(AbstractHttpConnection.java:926) at org.eclipse.jetty.server.AbstractHttpConnection$RequestHandler.headerComplete(AbstractHttpConnection.java:988) at org.eclipse.jetty.http.HttpParser.parseNext(HttpParser.java:640) at org.eclipse.jetty.http.HttpParser.parseAvailable(HttpParser.java:235) at org.eclipse.jetty.server.AsyncHttpConnection.handle(AsyncHttpConnection.java:82) at org.eclipse.jetty.io.nio.SelectChannelEndPoint.handle(SelectChannelEndPoint.java:628) at org.eclipse.jetty.io.nio.SelectChannelEndPoint$1.run(SelectChannelEndPoint.java:52) at org.eclipse.jetty.util.thread.QueuedThreadPool.runJob(QueuedThreadPool.java:608) at org.eclipse.jetty.util.thread.QueuedThreadPool$3.run(QueuedThreadPool.java:543) at java.lang.Thread.run(Thread.java:662)

	 * <p>
	 * If "fl=*" is used, or neither param is specified, then <code>null</code>
	 * will be returned. If the empty set is returned, it means the "fl"
	 * specified consisted entirely of things that are not real fields (ie:
	 * functions, transformers, partial-globs, score, etc...) and not supported
	 * by this component.
	 * </p>
	 */
	private Set<String> getFields(ResponseBuilder rb) {
		SolrParams params = rb.req.getParams();
		String[] fldLst = params.getParams(TermVectorParams.FIELDS);
		if (null == fldLst || 0 == fldLst.length
				|| (1 == fldLst.length && 0 == fldLst[0].length())) {

			// no tv.fl, parse the main fl
			ReturnFields rf = new SolrReturnFields(params
					.getParams(CommonParams.FL), rb.req);

			if (rf.wantsAllFields()) {
				return null;
			}

			Set<String> fieldNames = rf.getLuceneFieldNames();
			return (null != fieldNames) ? fieldNames :
			// return empty set indicating no fields should be used
					Collections.<String> emptySet();
		}

		// otherwise us the raw fldList as is, no special parsing or globs
		Set<String> fieldNames = new LinkedHashSet<String>();
		for (String fl : fldLst) {
			fieldNames.addAll(Arrays.asList(SolrPluginUtils.split(fl)));
		}
		return fieldNames;
	}
	
	/**
	 * only for debuging reasons display the content of the map
	 * @param fieldToTermStatsMap
	 */
	private void displayTotalTermStats(Map<String, Map<String, NGrammStats>> fieldToTermStatsMap){
		for(Map.Entry<String, Map<String, NGrammStats>> entry :fieldToTermStatsMap.entrySet()){
			LOGGER.info("Field:"+entry.getKey());
			Map<String, NGrammStats> terms  = entry.getValue();
			for(Map.Entry<String, NGrammStats> termStas :terms.entrySet()){
				LOGGER.info("\tTerm:"+termStas.getKey()+"\t"+termStas.getValue().toString());	
			}
		}
	}
	
	
	/**
	 * BADD duplication here
	 * @param <K>
	 * @param <V>
	 * @param map
	 * @param topN
	 * @return
	 */
	public static <K, V extends Comparable<? super V>> Map<String, NGrammStats> sortMapByTFValue( Map<String, NGrammStats> map,int topN) {
        List<Map.Entry<String, NGrammStats>> list = new LinkedList<Map.Entry<String, NGrammStats>>( map.entrySet());
        Collections.sort(list, new Comparator<Map.Entry<String, NGrammStats>>() {
            public int compare(Map.Entry<String, NGrammStats> o1, Map.Entry<String, NGrammStats> o2) {
                return (new Integer(o2.getValue().getTf())).compareTo(new Integer(o1.getValue().getTf()));
            }
        });

        int c=1;
        Map<String, NGrammStats> result = new LinkedHashMap<String, NGrammStats>();
        for (Map.Entry<String, NGrammStats> entry : list) {
            result.put(entry.getKey(), entry.getValue());
            if(c++ >= topN)
            	break;
        }
        return result;
    }
	public static <K, V extends Comparable<? super V>> Map<String, NGrammStats> sortMapByDFValue( Map<String, NGrammStats> map,int topN) {
        List<Map.Entry<String, NGrammStats>> list = new LinkedList<Map.Entry<String, NGrammStats>>( map.entrySet());
        Collections.sort(list, new Comparator<Map.Entry<String, NGrammStats>>() {
            public int compare(Map.Entry<String, NGrammStats> o1, Map.Entry<String, NGrammStats> o2) {
                return (new Integer(o2.getValue().getDf())).compareTo(new Integer(o1.getValue().getDf()));
            }
        });
        int c=1;
        Map<String, NGrammStats> result = new LinkedHashMap<String, NGrammStats>();
        for (Map.Entry<String, NGrammStats> entry : list) {
            result.put(entry.getKey(), entry.getValue());
            if(c++ >= topN)
            	break;
        }
        return result;
    }
	
	public static <K, V extends Comparable<? super V>> Map<String, NGrammStats> sortMapByIDFValue( Map<String, NGrammStats> map,int topN) {
        List<Map.Entry<String, NGrammStats>> list = new LinkedList<Map.Entry<String, NGrammStats>>( map.entrySet());
        Collections.sort(list, new Comparator<Map.Entry<String, NGrammStats>>() {
            public int compare(Map.Entry<String, NGrammStats> o1, Map.Entry<String, NGrammStats> o2) {
                return (o2.getValue().getIdf()).compareTo(o1.getValue().getIdf());
            }
        });
        int c=1;
        Map<String, NGrammStats> result = new LinkedHashMap<String, NGrammStats>();
        for (Map.Entry<String, NGrammStats> entry : list) {
            result.put(entry.getKey(), entry.getValue());
            if(c++ >= topN)
            	break;
        }
        return result;
    }

}

class NGrammStats {
	private int tf;// we count an single term occurence for each doc no matter
					// how many times occur in
	private int df;
	private double idf;
	public NGrammStats(int tf, int df) {
		super();
		this.tf = tf;
		this.df = df;
		this.idf = 0.0;
	}

	
	public NGrammStats() {
		super();
	}


	public int getTf() {
		return tf;
	}

	public void setTf(int tf) {
		this.tf = tf;
	}
	
	public void setIdf(double idf) {
		this.idf = idf;
	}

	public Double getIdf(){
		return this.idf;
	}
	public int getDf() {
		return df;
	}

	public void setDf(int df) {
		this.df = df;
	}
	
	public void increaseTf(int value){
		this.tf += value;
	}

	public void add(String key,int value){
		if(key.equals("tf"))
			this.tf = value;
		else if(key.equals("df"))
			this.df = value;
	}
	
	public void appendStats(NGrammStats nGrammStats){
		this.tf += nGrammStats.getTf();
		this.df += nGrammStats.getDf();
	}
	
	@Override
	public String toString() {
		return "NGrammStats [df=" + df + ", tf=" + tf + "]";
	}
	
}

class FieldOptions {
	String fieldName;
	boolean termFreq, docFreq, tfIdf;
}

class By {
	public String tf = "tf";
	public String df = "df";
}
