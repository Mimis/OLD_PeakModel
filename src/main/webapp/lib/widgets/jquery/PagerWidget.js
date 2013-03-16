// $Id$

(function ($) {

/**
 * A pager widget for jQuery.
 *
 * <p>Heavily inspired by the Ruby on Rails will_paginate gem.</p>
 *
 * @expects this.target to be a list.
 * @class PagerWidget
 * @augments AjaxSolr.AbstractWidget
 * @todo Don't use the manager to send the request. Request only the results,
 * not the facets. Update only itself and the results widget.
 */
AjaxSolr.PagerWidget = AjaxSolr.AbstractWidget.extend(
  /** @lends AjaxSolr.PagerWidget.prototype */
  {
  /**
   * How many links are shown around the current page.
   *
   * @field
   * @public
   * @type Number
   * @default 4
   */
  innerWindow: 4,

  /**
   * How many links are around the first and the last page.
   *
   * @field
   * @public
   * @type Number
   * @default 1
   */
  outerWindow: 1,

  /**
   * The previous page link label.
   *
   * @field
   * @public
   * @type String
   * @default "&laquo; previous"
   */
  prevLabel: '&laquo; Previous',

  /**
   * The next page link label.
   *
   * @field
   * @public
   * @type String
   * @default "next &raquo;"
   */
  nextLabel: 'Next &raquo;',

  /**
   * Separator between pagination links.
   *
   * @field
   * @public
   * @type String
   * @default ""
   */
  separator: ' ',

  /**
   * The current page number.
   *
   * @field
   * @private
   * @type Number
   */
  currentPage: null,

  /**
   * The total number of pages.
   *
   * @field
   * @private
   * @type Number
   */
  totalPages: null,
  
  /**
   * The solr respnce time in milliseconds
   *
   * @field
   * @private
   * @type Number
   */
  solr_responceTimeMs: null,

  /**
   * @returns {String} The gap in page links, which is represented by:
   *   <span class="pager-gap">&hellip;</span>
   */
  gapMarker: function () {
	  var a_link = $('<a href="#"  onclick="return false;"/>').html('&hellip;');
	  return $('<li/>').addClass('disabled').append(a_link);
	  //return '<span class="pager-gap">&hellip;</span>';
  },

  /**
   * @returns {Array} The links for the visible page numbers.
   */
  windowedLinks: function () {
    var links = [];

    var prev = null;

    visible = this.visiblePageNumbers();
    for (var i = 0, l = visible.length; i < l; i++) {
      if (prev && visible[i] > prev + 1) links.push(this.gapMarker());
      links.push(this.pageLinkOrSpan(visible[i], [ 'pager-current' ]));
      prev = visible[i];
    }

    return links;
  },

  /**
   * @returns {Array} The visible page numbers according to the window options.
   */ 
  visiblePageNumbers: function () {
    var windowFrom = this.currentPage - this.innerWindow;
    var windowTo = this.currentPage + this.innerWindow;

    // If the window is truncated on one side, make the other side longer
    if (windowTo > this.totalPages) {
      windowFrom = Math.max(0, windowFrom - (windowTo - this.totalPages));
      windowTo = this.totalPages;
    }
    if (windowFrom < 1) {
      windowTo = Math.min(this.totalPages, windowTo + (1 - windowFrom));
      windowFrom = 1;
    }

    var visible = [];

    // Always show the first page
    visible.push(1);
    // Don't add inner window pages twice
    for (var i = 2; i <= Math.min(1 + this.outerWindow, windowFrom - 1); i++) {
      visible.push(i);
    }
    // If the gap is just one page, close the gap
    if (1 + this.outerWindow == windowFrom - 2) {
      visible.push(windowFrom - 1);
    }
    // Don't add the first or last page twice
    for (var i = Math.max(2, windowFrom); i <= Math.min(windowTo, this.totalPages - 1); i++) {
      visible.push(i);
    }
    // If the gap is just one page, close the gap
    if (this.totalPages - this.outerWindow == windowTo + 2) {
      visible.push(windowTo + 1);
    }
    // Don't add inner window pages twice
    for (var i = Math.max(this.totalPages - this.outerWindow, windowTo + 1); i < this.totalPages; i++) {
      visible.push(i);
    }
    // Always show the last page, unless it's the first page
    if (this.totalPages > 1) {
      visible.push(this.totalPages);
    }

    return visible;
  },

  /**
   * @param {Number} page A page number.
   * @param {String} classnames CSS classes to add to the page link.
   * @param {String} text The inner HTML of the page link (optional).
   * @returns The link or span for the given page.
   */
  pageLinkOrSpan: function (page, classnames, text) {
	    text = text || page;

	    //if the given page is not the Current page
	    if (page && page != this.currentPage) {
	    	var a_link = $('<a  onclick=" window.scrollTo(0,0);" href="#"/>').html(text).attr('rel', this.relValue(page)).addClass(classnames[1]).click(this.clickHandler(page));
	    	return $('<li/>').append(a_link);
	    }
	    //the given page is the Current Page =>        <li class="active"><a href="#">1</a></li>
	    else {
	    	var a_link = $('<a href="#"  onclick="return false;"/>').html(text);
	    	return $('<li/>').addClass('active').append(a_link);
	    }
	  },
	  
	  /**
	   * Create the visible or invisible links for the NExt and Previous links...
	   * @param {Number} page A page number. if is null then is the current page so make it invisible..
	   * @param {String} classnames CSS classes to add to the page link.
	   * @param {String} text The inner HTML of the page link (optional).
	   * @returns The link or span for the given page.
	   */
	  nextorOrPrevLink: function (page, classnames, text) {
	    text = text || page;

	    //if the given page is not the Current page        <li class="next"><a href="#">Next &rarr;</a></li>
	    if (page && page != this.currentPage) {
	    	var a_link = $('<a  onclick=" window.scrollTo(0,0);" href="#"/>').html(text).attr('rel', this.relValue(page)).addClass(classnames[1]).click(this.clickHandler(page));
	    	return $('<li/>').addClass(classnames[0]).append(a_link);
	    }
	    //the given page is the Current Page =>               <li class="prev disabled"><a href="#">&larr;  Previous</a></li>
	    else {
	    	var a_link = $('<a href="#"  onclick="return false;"/>').html(text);
	    	return $('<li/>').addClass(classnames.join(' ')).append(a_link);
	    }
	  },
	  


  /**
   * @param {Number} page A page number.
   * @returns {Function} The click handler for the page link.
   */
  clickHandler: function (page) {
    var self = this;
    return function () {
      var start = (page - 1) * self.perPage();
      self.manager.store.get('start').val(start);
      self.doRequest();
      return false;
    }
  },

  /**
   * @param {Number} page A page number.
   * @returns {String} The <tt>rel</tt> attribute for the page link.
   */
  relValue: function (page) {
    switch (page) {
      case this.previousPage():
        return 'prev' + (page == 1 ? 'start' : '');
      case this.nextPage():
        return 'next';
      case 1:
        return 'start';
      default: 
        return '';
    }
  },

  /**
   * @returns {Number} The page number of the previous page or null if no previous page.
   */
  previousPage: function () {
    return this.currentPage > 1 ? (this.currentPage - 1) : null;
  },

  /**
   * @returns {Number} The page number of the next page or null if no next page.
   */
  nextPage: function () {
    return this.currentPage < this.totalPages ? (this.currentPage + 1) : null;
  },

  /**
   * An abstract hook for child implementations.
   *
   * @param {Number} perPage The number of items shown per results page.
   * @param {Number} offset The index in the result set of the first document to render.
   * @param {Number} total The total number of documents in the result set.
   */
  renderHeader: function (perPage, offset, total) {},

  /**
   * render the mini summary of the results on Top Right spot of the result div
   */
  renderSummaryOfResultsTopRight: function (target,perPage, offset, total,solr_responceTimeMs) {
	  var solr_responceTimeSecs = solr_responceTimeMs / 1000;
  	$(target).text( Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total +
  	' Articles ' +		
  			
  	' (' + solr_responceTimeSecs +' secs) ');
  },
  

  /**
   * Render the pagination links.
   *
   * @param {Array} links The links for the visible page numbers.
   */
  renderLinks: function (links) {
    if (this.totalPages) {
    	//add the Previous Link....
    	links.unshift(this.nextorOrPrevLink(this.previousPage(), [ 'prev', 'disabled' ], this.prevLabel));
    	//add the next link
    	links.push(this.nextorOrPrevLink(this.nextPage(), [ 'next', 'disabled' ], this.nextLabel));
    	AjaxSolr.theme('list_items2', this.target, links, this.separator);
    }
  },
  /**
   * @returns {Number} The number of results to display per page.
   */
  perPage: function () {
    return parseInt(this.manager.response.responseHeader && this.manager.response.responseHeader.params && this.manager.response.responseHeader.params.rows || this.manager.store.get('rows').val() || 10);
  },

  /**
   * @returns {Number} The Solr offset parameter's value.
   */
  getOffset: function () {
    return parseInt(this.manager.response.responseHeader && this.manager.response.responseHeader.params && this.manager.response.responseHeader.params.start || this.manager.store.get('start').val() || 0);
  },

  afterRequest: function () {
    var total   = parseInt(this.manager.response.response.numFound);

    var perPage = null;
	var offset = null;
	  /*
	   * 
	   * get the fields that the responce got 
	   */
	var queryFields = this.manager.response.responseHeader.params.fl;
		
	var perPage = this.perPage();
	var offset  = this.getOffset();

    this.totalResults = parseInt(this.manager.response.grouped && this.manager.response.grouped['seed_url'] && this.manager.response.grouped['seed_url'].ngroups || this.manager.response.response.numFound);
    // Normalize the offset to a multiple of perPage.
    offset = offset - offset % perPage;
    this.currentPage = Math.ceil((offset + 1) / perPage);
    this.totalPages = Math.ceil(this.totalResults / perPage);
    
    $(this.target).empty();
    
    this.renderLinks(this.windowedLinks());
    //DISPLAY MESSAGE WITH RESUTLS AND PAGE NUMBER: "Jobs 1 to 10 of 23,275 (N milliseconds)"
    this.solr_responceTimeMs = this.manager.response.responseHeader.QTime;
    this.renderSummaryOfResultsTopRight(this.mini_sum_results_target,perPage, offset, this.totalResults,this.solr_responceTimeMs);
	
  }
  
  
});

})(jQuery);
