define([
	'gizmo/superdesk',
	'collections/autocollection',
	'models/post'
], function(Gizmo) {
	return Gizmo.Register.AutoCollection.extend({
		parse: function(data){
			if(data.PostList)
				return data.PostList;
			return data;
		},
		parseAttributes: function(data){
			return {
				lastCId: data.lastCId,
				offset: data.offset,
				offsetMore: data.offsetMore,
				total: data.total,
				limit: data.limit
			};
		},
		isCollectionDeleted: function(model)
        {
           return model.get('IsPublished') === 'False';
        },
		model: Gizmo.Register.Post
	},{ register: 'Posts' });
});
