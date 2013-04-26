package org.ngram.solr.searchComponent;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import org.apache.lucene.index.FieldInfo;
import org.apache.lucene.index.Fields;
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
import org.apache.solr.handler.component.ShardDoc;
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
 * PERFORMANCE: the main delay function is the process(rb) and mapOneVector()
 * 
 * 
 * TEST QUERIES: 
 * 		one core: http://localhost:8080/solr/core1950/select?q=nederland&wt=xml&indent=true&fl=id&ng=true&tv.fl=article_title,paragraph&tv.tf=true&tv.df=true
 *    multi-core: http://localhost:8080/solr/core1950/select?shards=localhost:8080/solr/core1950,localhost:8080/solr/core1960,localhost:8080/solr/core1970,localhost:8080/solr/core1980,localhost:8080/solr/core1990&q=paok&fl=id&tv.fl=article_title&tv.tf=true&tv.df=true
 *    
 *    
 * Return term vectors for the documents in a query result set.
 * <p/>
 * Info available:
 * term, frequency, position, offset, IDF.
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
 * &lt;/requestHandler&gt;</pre>
 *
 *
 */
public class NGrammComponent extends SearchComponent implements SolrCoreAware {

	private static final Logger LOGGER = Logger.getLogger(NGrammComponent.class.getName());
    static final String LOG_PROPERTIES_FILE = "./logs/log4j_NGrammComponent.properties";

	//TOPO remove that in our component..keep things simple
  public static final String COMPONENT_NAME = "ng";

  protected NamedList initParams;
  //THIS THE NAME OF THE SOLR RESPONCE XML ELEMENT THAT CONTAINS OUR COMPONENTS OUTPUT
  public static final String TERM_VECTORS = "ngramm";

  
  
  
  /**
   * Helper method for determining the list of fields that we should 
   * try to find term vectors on.  
   * <p>
   * Does simple (non-glob-supporting) parsing on the 
   * {@link TermVectorParams#FIELDS} param if specified, otherwise it returns 
   * the concrete field values specified in {@link CommonParams#FL} -- 
   * ignoring functions, transformers, or literals.  
   * </p>
   * <p>
   * If "fl=*" is used, or neither param is specified, then <code>null</code> 
   * will be returned.  If the empty set is returned, it means the "fl" 
   * specified consisted entirely of things that are not real fields 
   * (ie: functions, transformers, partial-globs, score, etc...) and not 
   * supported by this component. 
   * </p>
   */
  private Set<String> getFields(ResponseBuilder rb) {
    SolrParams params = rb.req.getParams();
    String[] fldLst = params.getParams(TermVectorParams.FIELDS);
    if (null == fldLst || 0 == fldLst.length || 
        (1 == fldLst.length && 0 == fldLst[0].length())) {

      // no tv.fl, parse the main fl
      ReturnFields rf = new SolrReturnFields
        (params.getParams(CommonParams.FL), rb.req);

      if (rf.wantsAllFields()) {
        return null;
      }

      Set<String> fieldNames = rf.getLuceneFieldNames();
      return (null != fieldNames) ?
        fieldNames :
        // return empty set indicating no fields should be used
        Collections.<String>emptySet();
    }

    // otherwise us the raw fldList as is, no special parsing or globs
    Set<String> fieldNames = new LinkedHashSet<String>();
    for (String fl : fldLst) {
      fieldNames.addAll(Arrays.asList(SolrPluginUtils.split(fl)));
    }
    return fieldNames;
  }

  @Override
  public void process(ResponseBuilder rb) throws IOException {
      long startTime = System.currentTimeMillis();

    SolrParams params = rb.req.getParams();
    if (!params.getBool(COMPONENT_NAME, false)) {
      return;
    }

    NamedList<Object> termVectors = new NamedList<Object>();
    rb.rsp.add(TERM_VECTORS, termVectors);

    IndexSchema schema = rb.req.getSchema();
    SchemaField keyField = schema.getUniqueKeyField();
    String uniqFieldName = null;
    if (keyField != null) {
      uniqFieldName = keyField.getName();
      termVectors.add("uniqueKeyFieldName", uniqFieldName);
    }

    FieldOptions allFields = new FieldOptions();
    //figure out what options we have, and try to get the appropriate vector
    allFields.termFreq = params.getBool(TermVectorParams.TF, false);
    allFields.docFreq = params.getBool(TermVectorParams.DF, false);
    allFields.tfIdf = params.getBool(TermVectorParams.TF_IDF, false);
    //boolean cacheIdf = params.getBool(TermVectorParams.IDF, false);
    //short cut to all values.
    if (params.getBool(TermVectorParams.ALL, false)) {
      allFields.termFreq = true;
      allFields.docFreq = true;
      allFields.tfIdf = true;
    }

    //Build up our per field mapping
    Map<String, FieldOptions> fieldOptions = new HashMap<String, FieldOptions>();
    NamedList<List<String>> warnings = new NamedList<List<String>>();
    List<String>  noTV = new ArrayList<String>();
    List<String>  noPos = new ArrayList<String>();
    List<String>  noOff = new ArrayList<String>();

    Set<String> fields = getFields(rb);
    if ( null != fields ) {
      //we have specific fields to retrieve, or no fields
      for (String field : fields) {

        // workarround SOLR-3523
        if (null == field || "score".equals(field)) continue; 

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
            //get the per field mappings
            option.termFreq = params.getFieldBool(field, TermVectorParams.TF, allFields.termFreq);
            option.docFreq = params.getFieldBool(field, TermVectorParams.DF, allFields.docFreq);
            option.tfIdf = params.getFieldBool(field, TermVectorParams.TF_IDF, allFields.tfIdf);
            //Validate these are even an option
            
          } else {//field doesn't have term vectors
            if (!fieldIsUniqueKey) noTV.add(field);
          }
        } else {
          //field doesn't exist
          throw new SolrException(SolrException.ErrorCode.BAD_REQUEST, "undefined field: " + field);
        }
      }
    } //else, deal with all fields

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
    List<Integer> docIds = getInts(params.getParams(TermVectorParams.DOC_IDS));
    Iterator<Integer> iter;
    if (docIds != null && !docIds.isEmpty()) {
      iter = docIds.iterator();
    } else {
      DocList list = listAndSet.docList;
      iter = list.iterator();
    }
    SolrIndexSearcher searcher = rb.req.getSearcher();

    IndexReader reader = searcher.getIndexReader();
    //the TVMapper is a TermVectorMapper which can be used to optimize loading of Term Vectors

    //Only load the id field to get the uniqueKey of that
    //field

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
        return (fieldInfo.name.equals(finalUniqFieldName)) ? Status.YES : Status.NO;
      }
    };
    LOGGER.info("Get parameters and options shits Time:"+getTimeMS(startTime));

    
    /**
     * Main...
     * 	1)iterate all responded docs
     * 	2)	For each asked Field get its Terms
     * 	3)		For each Term => mapOneVector()
     * 	4)			Get its term and doc frequencies	
     * 
     * ngrams:
     * 	1)keep only a {doc} with {field} {word} {tf} {doc}
     */
    TermsEnum termsEnum = null;
    NamedList<Object> docNL = new NamedList<Object>();
    
    while (iter.hasNext()) {
      Integer docId = iter.next();
      
      //get unique key of current doc
      if (keyField != null) {
        reader.document(docId, getUniqValue);
        String uniqVal = null;
        if (uniqValues.size() != 0) {
          uniqVal = uniqValues.get(0);
          uniqValues.clear();
          docNL.add("uniqueKey", uniqVal);
          termVectors.add(uniqVal, docNL);
        }
      } else {
        // support for schemas w/o a unique key,
        termVectors.add("doc-" + docId, docNL);
      }
      //for each field of the current document get its termEnum
      if ( null != fields ) {
        for (Map.Entry<String, FieldOptions> entry : fieldOptions.entrySet()) {
          final String field = entry.getKey();
          long startTime3 = System.currentTimeMillis();
          final Terms vector = reader.getTermVector(docId, field);
          LOGGER.info("getTermVector Time:"+getTimeMS(startTime3));

          
          if (vector != null) {
            termsEnum = vector.iterator(termsEnum);
            //Get its term and doc frequencies
            long startTime1 = System.currentTimeMillis();
            mapOneVector(docNL, entry.getValue(), reader, docId, termsEnum, field);
            LOGGER.info("mapOneVector Time:"+getTimeMS(startTime1));
          }
        }
      } else {
        // extract all fields
        final Fields vectors = reader.getTermVectors(docId);
        for (String field : vectors) {
          Terms terms = vectors.terms(field);
          if (terms != null) {
            termsEnum = terms.iterator(termsEnum);
            //Get its term and doc frequencies
            long startTime2 = System.currentTimeMillis();
            mapOneVector(docNL, allFields, reader, docId, termsEnum, field);
            LOGGER.info("mapOneVector Time:"+getTimeMS(startTime2));
          }
        }
      }
    }
    
    LOGGER.info("Process Time:"+getTimeMS(startTime));
  }

  private long getTimeMS(long startTime){
	//timer
	    long endTime   = System.currentTimeMillis();
	    return  endTime - startTime;	  
  }
  
  /**
   *  Get for each given TermEnumaration its Term and Doc Frequency 
   * @param docNL
   * @param fieldOptions
   * @param reader
   * @param docID
   * @param termsEnum
   * @param field
   * @throws IOException
   */
  private void mapOneVector(NamedList<Object> docNL, FieldOptions fieldOptions, IndexReader reader, int docID, TermsEnum termsEnum, String field) throws IOException {
    NamedList<Object> fieldNL = new NamedList<Object>();
    docNL.add(field, fieldNL);

    BytesRef text;
    while((text = termsEnum.next()) != null) {
      String term = text.utf8ToString();
      NamedList<Object> termInfo = new NamedList<Object>();
      fieldNL.add(term, termInfo);
      final int freq = (int) termsEnum.totalTermFreq();
      if (fieldOptions.termFreq == true) {
        termInfo.add("tf", freq);
      }
     
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
   * 1. Get solr responces from all the Shardes
   * 2. Save each doc in initial empty array in theindex of its rank
   * 3. return the sorted array with the docs..   
   * and add them in the final Component's responce
   */
  @Override
  public void finishStage(ResponseBuilder rb) {
    if (rb.stage == ResponseBuilder.STAGE_GET_FIELDS) {
      long startTime = System.currentTimeMillis();

      
      NamedList termVectors = new NamedList<Object>();
      Map.Entry<String, Object>[] arr = new NamedList.NamedListEntry[rb.resultIds.size()];

      
      for (ShardRequest sreq : rb.finished) {
        if ((sreq.purpose & ShardRequest.PURPOSE_GET_FIELDS) == 0 || !sreq.params.getBool(COMPONENT_NAME, false)) {
          continue;
        }
        for (ShardResponse srsp : sreq.responses) {
        	//map<docId,tv>
          NamedList<Object> nl = (NamedList<Object>)srsp.getSolrResponse().getResponse().get(TERM_VECTORS);
          
          LOGGER.info("\tsrsp.getNodeName()"+srsp.getShard()+"\tfinishStage Docs Size:"+nl.size());
          
          for (int i=0; i < nl.size(); i++) {
        	String key = nl.getName(i);
            ShardDoc sdoc = rb.resultIds.get(key);
            if (null == sdoc) {
              // metadata, only need from one node, leave in order
              if (termVectors.indexOf(key,0) < 0) {
                termVectors.add(key, nl.getVal(i));
              }
            } else {
              int idx = sdoc.positionInResponse;
              arr[idx] = new NamedList.NamedListEntry<Object>(key, nl.getVal(i));
            }
          }
        }
      }
      // remove nulls in case not all docs were able to be retrieved
      termVectors.addAll(SolrPluginUtils.removeNulls(new NamedList<Object>(arr)));
      rb.rsp.add(TERM_VECTORS, termVectors);
      //timer
      LOGGER.info("finishStage Time:"+getTimeMS(startTime));
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
	          throw new SolrException(SolrException.ErrorCode.BAD_REQUEST, e.getMessage(), e);
	        }
	      }
	    }
	    return result;
	  }

  @Override
  public void prepare(ResponseBuilder rb) throws IOException {

  }

  //////////////////////// NamedListInitializedPlugin methods //////////////////////

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
}

class FieldOptions {
  String fieldName;
  boolean termFreq, docFreq, tfIdf;
}
