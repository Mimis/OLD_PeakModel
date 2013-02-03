(function ($) {

	//http://docs.jquery.com/Plugins/Autocomplete/autocomplete#url_or_dataoptions
	
AjaxSolr.AutocompleteWidget = AjaxSolr.AbstractFacetWidget.extend({
  
	/**
	 * 	WHEN ENTER IS PRESSED , THERE IS SOME VALUE IN THE INPUT BOX and THERE IS NOT REQUEST sENT!!!!!!!!
	 * 
	 * Author Comment about which query to keep from the input form!!!!!:
	 * The Autocomplete widget also allows free-text search. You probably
	 * typed in "ec" and selected the autocompletion "ecq". If you only want
	 * autocompletion of facet values, then remove the init() function from the widget.
	 */
	init : function() {
		var self = this;
		
		//SEARCH BUTTON CLICK MAKE REQUEST			
		$(this.button_target).find('button').bind('click', function(e) {
			if (self.requestSent === false) {
				
				var value = $(self.target).find('input').val();
				if (value && self.add(value)){
					self.manager.doRequest(0);
				}
			}
		});	
		
	},

	/**
	 * After a request action
	 */
	afterRequest: function () {
    $(this.target).find('input').unbind().removeData('events').val('');

    var self = this;

    var callback = function (response) {
      var list = [];
      for (var i = 0; i < self.fields.length; i++) {
        var field = self.fields[i];
        for (var facet in response.facet_counts.facet_fields[field]) {
          list.push({
            field: field,
            value: facet,
            text: facet + ' (' + response.facet_counts.facet_fields[field][facet] + ') - ' + field
          });
        }
      }

      self.requestSent = false;
      $(self.target).find('input').unautocomplete().autocomplete(list, {
    	 //Provides advanced markup for an item. For each row of results, this function will be called. The returned value will be displayed inside an LI element in the results list.
        formatItem: function(facet) {
          return facet.text;
        },
        //Similar to formatItem, but provides the formatting for the value to be put into the input field. 
        formatResult: function(facet) {
            return facet.value;
        }
      }).result(function(e, facet) {
    	  //dont save any parameter; we do that only from the search button action or(push the enter button)
    	  
        //self.requestSent = true;
        //if (self.manager.store.addByValue('fq', facet.field + ':' + AjaxSolr.Parameter.escapeValue(facet.value))) {
        	//cut the TWO self.doRequest(); in order not to execute a request when we select an autocomplte suggestion; Execute request only via SearchButton
          //self.doRequest();
        //}
      });

      // This has lower priority so that requestSent is set.
//      $(self.target).find('input').bind('keydown', function(e) {
//        if (self.requestSent === false && e.which == 13) {
//          var value = $(this).val();
//          if (value && self.add(value)) {
//            //self.doRequest();
//          }
//        }
//      });
    } // end callback
  
    
    //Mimis: specify the returned fields!!!
	var params = [ 'q=*:*&fl=id,job_title,recordText,extraction_date,form_url,seed_url,detail_page_url,seed_name&facet=true&facet.limit=-1&facet.mincount=1&json.nl=map' ];
	//original
    //var params = [ 'rows=0&facet=true&facet.limit=-1&facet.mincount=1&json.nl=map' ];
    for (var i = 0; i < this.fields.length; i++) {
      params.push('facet.field=' + this.fields[i]);
    }
    var values = this.manager.store.values('fq');
    for (var i = 0; i < values.length; i++) {
      params.push('fq=' + encodeURIComponent(values[i]));
    }
    params.push('q=' + this.manager.store.get('q').val());
    jQuery.getJSON(this.manager.solrUrl + 'select?' + params.join('&') + '&wt=json&json.wrf=?', {}, callback);
  }
});

})(jQuery);
