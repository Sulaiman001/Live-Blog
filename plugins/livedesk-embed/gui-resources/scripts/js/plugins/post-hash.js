define([
	'jquery',
	'plugins',
	'dispatcher'
], function($, plugins){
	return plugins['post-hash'] = function(config) {

		var location = window.location,
			href = location.href,
			hash = 'liveblog',
			hashMark = '?';
		$.dispatcher.on('class.post-view', function(evt){
			var view = this.prototype;
			view.getHash = function(options){
				var self = this,
					_hashMark = (options && options.hashMark )? options.hashMark : hashMark
					permalink = false,
					newHash = hash + '=' + parseFloat(self.model.get('Order'));
					
				if(href.indexOf(_hashMark) === -1) {
					permalink = href + _hashMark + newHash ;
				} else if(href.indexOf(hash+'=') !== -1) {
					regexHash = new RegExp(hash+'=[^&]*');
					permalink = href.replace(regexHash, newHash);
				} else {
					permalink = href + '&' + newHash;
				}
				return permalink;
			}
			view.data.permalink = view.getHash;
		});
		$.dispatcher.on('class.posts-view', function(evt){
			var view = this.prototype;
			//view._config.hashIdentifier = hash;
			/*!
			 * Find if the liveblog was accessed with a hash identifier
			 *   then use it as a prameter on the collection for the first request.
			 */
			if((hashIndex = href.indexOf(hash+'=')) !== -1) {
				view._flags.beforePage = true;
				view._config.collection.end = [ parseFloat(href.substr(hashIndex + hash.length + 1)), 'order'];
				view._flags.autoRender = 'false';
			}
		});
	}
});
