// $Id$


// $Id$

/**
 * display_total_results
 */
AjaxSolr.theme.prototype.display_total_results = function (list, item) {
	jQuery(list).empty();
  	jQuery(list).append(item);
  
};

/**
 * just append to the given element the given item
 */
AjaxSolr.theme.prototype.list_items2 = function (list, items) {
  jQuery(list).empty();
  for (var i = 0, l = items.length; i < l; i++) {
   
    jQuery(list).append(items[i]);
  }
};


/**
 * Appends the given items to the given list, optionally inserting a separator
 * between the items in the list.
 *
 * @param {String} list The list to append items to.
 * @param {Array} items The list of items to append to the list.
 * @param {String} [separator] A string to add between the items.
 * @todo Return HTML rather than modify the DOM directly.
 */
AjaxSolr.theme.prototype.list_items = function (list, items, separator) {
  jQuery(list).empty();
  for (var i = 0, l = items.length; i < l; i++) {
    var li = jQuery('<li/>');
    if (AjaxSolr.isArray(items[i])) {
      for (var j = 0, m = items[i].length; j < m; j++) {
        if (separator && j > 0) {
          li.append(separator);
        }
        li.append(items[i][j]);
      }
    }
    else {
      if (separator && i > 0) {
        li.append(separator);
      }
      li.append(items[i]);
    }
    jQuery(list).append(li);
  }
};



//$Id$

/**
* Appends the given items to the given list, inserting a new line  separator every two elements
*
* @param {String} list The list to append items to.
* @param {Array} items The list of items to append to the list.
* @param {String} separator A string to add between the items.
* @todo Return HTML rather than modify the DOM directly.
*/
AjaxSolr.theme.prototype.list_pair_of_items = function (list, items, separator) {
jQuery(list).empty();
jQuery(list).css("background-color","#F5F5DC");

for (var i = 0, l = items.length; i < l; i++) {
  var li = jQuery('<li/>');
  if (AjaxSolr.isArray(items[i])) {
    for (var j = 0, m = items[i].length; j < m; j++) {
      if (separator && j > 0 && j%2 == 0) {
        li.append(separator);
      }
      li.append(items[i][j]);
    }
  }
  else {
    if (separator && i > 0 && i%2 == 0) {
      li.append(separator);
    }
    li.append(items[i]);
  }
  jQuery(list).append(li);
}
};
