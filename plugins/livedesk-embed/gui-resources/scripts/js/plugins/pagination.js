define([
	'jquery',
	'plugins',
	'dispatcher'
], function($, plugins){
	return plugins['pagination'] = function(config) {
		$.dispatcher.on('class.posts-view', function(evt){
			var view = this.prototype;
			if(liveblog.limit)
				view._config.collection.limit = parseInt(liveblog.limit);
			else
				view._config.collection.limit = 15;
			view._flags.loadingNextPage = false;
			view._flags.atEnd = false;
			view.beforePage = function(){
				var self = this;
				self._views = [];
				self.collection._list = [];						
				self.collection.resetStats();
				delete self._config.collection.end;
				$.each(self._config.collection, function(key, value) {
					if($.isArray(value))
						self.collection[key].apply(self.collection, value);
					else
						self.collection[key](value);
				});	
				return self.collection
					.sync({ data: self._config.data });
			}
			view.nextPage = function(){
				var self = this;
				if(self._flags.loadingNextPage || self._flags.atEnd ){
					return;	
				}
				$.dispatcher.triggerHandler('loading.posts-view', self);
				self._flags.loadingNextPage = true;
				$.each(self._config.collection, function(key, value) {
					if($.isArray(value))
						self.collection[key].apply(self.collection, value);
					else
						self.collection[key](value);
				});
				return self.collection
						.offset(self.collection._stats.offset)
						.sync({ data: self._config.data }).done(function(data) {
							var total = self.collection._stats.total;
							if(self._views.length >= total) {
								self._flags.atEnd = true;
							}
							self._flags.loadingNextPage = false;
							$.dispatcher.triggerHandler('loaded.posts-view', self);
						});
			}
			view.hasNextPage = function(){
				var self = this;
				return self._views.length < self.collection._stats.total;
			}
		});
	}
});
