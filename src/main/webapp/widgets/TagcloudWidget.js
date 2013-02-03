(function($) {

	AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
		afterRequest : function() {
			
			var textSize = 5;
			var maxLength = this.maxLength; //max number of characters to display for each Tag
			
			/*
			 * this.manager.response should be familiar from the
			 * ResultWidget in Step 2. this.field is the field property
			 * we set when adding the widget instance to the
			 * manager('seed_url' and 'form_url'). So, in this snippet,
			 * we are inspecting the facet data for that field in the
			 * Solr response.
			 */
			//in case of the display of te detail pages we dont have any facet count...
			if (this.manager.response.facet_counts === undefined) {
				return;
			}
			
			if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
				$(this.target).html(AjaxSolr.theme('no_items_found'));
				return;
			}

			/*
			 * i dont know what he does here
			 */
			var maxCount = 0;
			var objectedItems = [];
			for ( var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
				var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
				if (count > maxCount) {
					maxCount = count;
				}
				objectedItems.push({
					facet : facet,
					count : count
				});
			}
			//sort  them based on counts
			objectedItems.sort(function(a, b) {
				return a.count > b.count ? -1 : 1;
			});

			// empty the Html target element
			$(this.target).empty();
			for ( var i = 0, l = objectedItems.length; i < l; i++) {
				var facet = objectedItems[i].facet;
				var count = objectedItems[i].count;

				/*
				 * clickHandler is one of the convenient functions
				 * provided by AbstractFacetWidget. It tries to add a fq
				 * parameter corresponding to the widget’s facet field
				 * and the given facet value; if successful, it sends a
				 * request to Solr. For a full list of functions defined
				 * by AbstractFacetWidget, see the documentation.
				 */
				var tag_text = '';
				tag_text = facet;
//				if (this.field == "seed_name"){
//					tag_text = Utils.getFirstCharactersOfUrl(facet, maxLength);
//				}
				
				
				tag_text = tag_text + '(' + count + ')';
				$(this.target).append(AjaxSolr.theme('tag', tag_text ,textSize, this.clickHandler(facet)));
//				$(this.target).append(AjaxSolr.theme('tag', tag_text ,parseInt(objectedItems[i].count/ maxCount * 10), this.clickHandler(facet)));
				$(this.target).append('<br/>');
			}
		}
	});

})(jQuery);