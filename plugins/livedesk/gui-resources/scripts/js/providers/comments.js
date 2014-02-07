define([
	'providers',
	'jquery',
    'gizmo/superdesk',
    config.guiJs('livedesk', 'action'),
    'jquery/tmpl',
    'jqueryui/draggable',
    'providers/comments/adaptor',
    config.guiJs('livedesk', 'providers-templates'),
    'tmpl!livedesk>providers/comments',
    'tmpl!livedesk>items/item',
    'tmpl!livedesk>items/sources/comments',
    'tmpl!livedesk>items/implementors/sources/base',
    'tmpl!livedesk>items/implementors/sources/comments',
    'tmpl!livedesk>providers/no-results',
    'tmpl!livedesk>providers/generic-error',
    'tmpl!livedesk>providers/load-more',
    'tmpl!livedesk>providers/loading'
], function( providers, $, Gizmo, BlogAction) {
$.extend(providers.comments, {
    blogId: 0,
    data: [],
    topIds: 0,
    minId: Infinity,
    interval: 20000,
    keyword: '',
    extraInfos: 0,
    total: 0,
	init: function(blogUrl){
        var self = this;
        this.adaptor.init();
        self.data.comments = [];
        var srcUrl = typeof blogUrl === 'string' ? blogUrl : blogUrl[0]
        
        if ( srcUrl.indexOf( 'my' ) == -1 ) {
            var indexRes = srcUrl.indexOf('/LiveDesk');
            srcUrl = srcUrl.slice(0, indexRes) + '/my' + srcUrl.slice(indexRes);
        }
        $.ajax({
            url: srcUrl,
            headers: {'Authorization': localStorage.getItem('superdesk.login.session')}
        }).done(function(data){
            self.blogId = data.Id;
            self.render();
        });
    },
    render: function(){
        var self = this;
        self.el.tmpl('livedesk>providers/comments', {}, function(){
            //handle keyword search
            self.el.on('keyup','.comments-search-query', function( e ){
                var keycode = e.keyCode;
                var keyword = $('.comments-search-query').val();
                if ( keycode == 13 ) {
                    self.keyword = keyword;
                    self.getComments({cId: -1, clearResults: true});
                }
            });
            //show hidden 
            self.el.on('click','[data-type="hidden-toggle"]', function( e ){
                if ( $(this).attr('data-active') == 'false' ) {
                    $(this).attr('data-active', 'true');
                    $(this).css('background-color', '#DDDDDD');
                    //show hidden comments
                    self.getComments({cId: -1, clearResults: true});
                } else {
                    $(this).attr('data-active', 'false');
                    $(this).css('background-color', '#f2f2f2');
                    //hide hidden comments
                    self.getComments({cId: -1, clearResults: true});
                }
            });
            //temp remove the autoupdate
            var refInt = window.setInterval(function(){
                self.refreshComments();
            },self.interval);
            self.getComments({});
        });
        //dynamically get size of header and set top space for list
        var top_space = $('#comments .sms-header').outerHeight() + 20;
        $('.comments-results-holder').css({'top': top_space});     
    },
    refreshComments: function() {
        var self = this;
        var cId = self.topIds;
        //skip autoupdate for hidden items
        if ( $( document ).find('a[data-type="hidden-toggle"]').attr('data-active') != 'true' ) {
            self.getComments({cId: cId, prepend: true});
        }
        
    },
    getComments: function(paramObject) {
        var self = this;
        var dsd = {
            offset: 0,
            limit: 5,
            cId: -1,
            query: '',
            forceAppend: false,
            prepend: false,
            pagination: false,
            keyword: '',
            clearResults: false
        }

        var sd = $.extend({}, dsd, paramObject);
        //console.log(sd);
        var url = new Gizmo.Url('my/LiveDesk/Blog/' + self.blogId + '/Post/Comment/');
        var keywordSearch = '';
        if ( self.keyword.length > 0 ) {
            keywordSearch = '&content.ilike=' + encodeURIComponent('%' + self.keyword + '%')
        }

        var cIdText = '';
        var limitText = '&limit=' + sd.limit;
        if ( sd.cId != -1 ) {
            cIdText = '&cId.since=' + sd.cId;
            limitText = '';
        } else {
            self.topIds = -1;
            self.maxId = 0;
        }
        if ( sd.pagination ) {
            cIdText = '';
        }
        var deletedText = '';
        if ( $( document ).find('a[data-type="hidden-toggle"]').attr('data-active') == 'true' ) {
            var deletedText = '&isDeleted=true';
        }

        myUrl = url.get() + '?X-Filter=*&offset=' + sd.offset + limitText + cIdText + keywordSearch + deletedText + '&desc=id';
        $.ajax({
            url: myUrl,
            dataType: "json",
            headers: {'Authorization': localStorage.getItem('superdesk.login.session')}
        }).done(function(xdata){
            
            var data = xdata;
            if ( sd.cId == -1 ) {
                self.total = data.total;
                self.topIds = data.lastCId;
            }
            var comments = data.PostList;
            //clean the results
            if ( sd.clearResults) {
                self.data.comments = [];
                $('.comments-list').html('');
                $('.comments-load-more-holder').css('display','none').html('');
            }
            //prepare the data for dragging to timeline
            posts = [];
            for ( var i = 0; i < comments.length; i++ ) {
                var item = comments[i];
                item['message'] = item.Content;
                posts.push({ Meta: item });
                self.data.comments[item.Id] = item;
                //increase the 'cId' if necessary
                if ( parseInt(self.topIds) < parseInt(item.CId) ) {
                    self.topIds = parseInt(item.CId);
                }
                if ( sd.pagination ) {
                    if ( parseInt(self.minId) > parseInt(item.CId) ) {
                        self.minId = parseInt(item.Id);
                    }
                }
            }
            var newPosts = [];

            //go throught the comments and see if they are updates for what we already have
            for ( var i = 0; i < posts.length; i++ ) {
                var cmnt = posts[ i ];
                var updated = false;
                var Id = cmnt.Meta.Id;
                var unhideTxt = _("Unhide");
                var hideTxt = _("Hide");
                $('.comments-list').find('li.commentpost').each(function(){
                    if ( Id == $(this).attr('data-id') ) {
                        //we need to update the item
                        if ( cmnt.Meta.IsPublished == "True" ) {
                            //$( this ).attr('data-hidden', 'true').css('display', 'none');
                            $( this ).remove();
                            self.total -- ;
                            self.extraItems -- ;
                        } else {
                            if ( cmnt.Meta.DeletedOn ) {
                                //got deleted
                                $( this ).attr('data-hidden', 'true').css('display', 'none');
                                $( this ).find('a[href="#toggle-post"]').attr('data-action', 'unhide').text(unhideTxt);
                                self.total -- ;
                                self.extraItems -- ;
                            } else {
                                $( this ).attr('data-hidden', 'false').css('display', 'block');
                                $( this ).find('a[href="#toggle-post"]').attr('data-action', 'hide').text(hideTxt);
                                self.total ++ ;
                                self.extraItems ++ ;
                            }
                        }
                        updated = true;
                    }
                });

                if ( cmnt.Meta.hasOwnProperty('IsPublished') ) {
                    if ( cmnt.Meta.IsPublished == "True" ) {
                        cmnt.Meta.PublishedOn = "True";
                    }
                }

                if ( ( ! updated && ! cmnt.Meta.PublishedOn && ! cmnt.Meta.DeletedOn && self.minId > cmnt.Meta.Id ) || sd.cId == -1 ) {
                    newPosts.push(cmnt);
                }

            }
            posts = newPosts;
            if ( sd.cId == -1 || sd.forceAppend == true ) {
                self.extraItems = 0;
            } else {
                self.extraItems += newPosts.length;
            }

            if ( posts.length > 0 ) {
                //hide alert with no results message
                $('.comments-list div.alert').css('display', 'none');

                $.tmpl('livedesk>items/item', {
                    Post: posts,
                    Base: 'implementors/sources/comments',
                    Item: 'sources/comments'
                }, function(e, o) {
                    if ( sd.prepend ) {
                        el = $('.comments-list').prepend(o).find('.commentpost');
                    } else {
                        el = $('.comments-list').append(o).find('.commentpost');
                    }

                    el.on('click', 'a[href="#toggle-post"]', function(e){
                        e.preventDefault();
                        var cmntId = $(this).attr('data-id');
                        var action = $(this).attr('data-action');
                        if ( action == 'hide' ) {
                            self.hideComment(cmntId);
                        } else {
                            self.unhideComment(cmntId);
                        }
                    });

                    BlogAction.get('modules.livedesk.blog-post-publish').done(function(action) {
                        el.draggable(
                        {
                            revert: 'invalid',
                            //containment:'document',
                            helper: 'clone',
                            appendTo: 'body',
                            zIndex: 2700,
                            clone: true,
                            start: function(evt, ui) {
                                item = $(evt.currentTarget);
                                $(ui.helper).css('width', item.width());
                                var itemNo = $(this).attr('data-id');
                                $(this).data('post', itemNo );
                            }
                        });
                    }).fail(function(){
                        el.removeClass('draggable').css('cursor','');
                    });
                    if ( ( sd.offset + sd.limit + self.extraItems ) < self.total ) {
                        $('.comments-load-more-holder').css('display','block').tmpl('livedesk>providers/load-more', {name : 'comments-load-more'}, function(){
                            $(this).find('[name="comments-load-more"]').on('click', function(){
                                var offset = sd.offset + sd.limit + self.extraItems;
                                self.getComments( $.extend({}, sd, {offset: offset, forceAppend: true, clearResults: false, pagination: true}) );
                            });
                        });
                    } else {
                        $('.comments-load-more-holder').css('display','none').html('');
                    }
                }); 
            } else {
                //autoupdates may return 0 results and then we don't want to show 'no results message'
                if ( ! sd.prepend ) {
                    $.tmpl('livedesk>providers/no-results', {}, function(e,o) {
                        $('.comments-list').html(o);
                    });    
                }
                
            }
        });
    },
    toggleHidden: function(aspect) {

        if ( $( document ).find('a[data-type="hidden-toggle"]').attr('data-active') == 'false' ) {
            aspect = 'positive';
        } else {
            aspect = 'negative';
        }

        if ( aspect == "negative" ) {
            $( document ).find('li.commentpost[data-hidden="false"]').css('display', 'none');
            $( document ).find('li.commentpost[data-hidden="true"]').css('display', 'block');
        } else {
            $( document ).find('li.commentpost[data-hidden="true"]').css('display', 'none');
            $( document ).find('li.commentpost[data-hidden="false"]').css('display', 'block');
        }
    },
    hideComment: function(cmntId) {
        var self = this;
        var url = new Gizmo.Url('LiveDesk/Blog/' + self.blogId + '/Post/' + cmntId + '/Hide');
        $.post( url.get() , function( data ) {
            self.extraItems -- ;
            $( document ).find('li.commentpost[data-id="' + cmntId + '"]').remove();
        });
    },
    unhideComment: function(cmntId) {
        var self = this;
        var url = new Gizmo.Url('LiveDesk/Blog/' + self.blogId + '/Post/' + cmntId + '/Unhide');
        $.post( url.get() , function( data ) {
            $( document ).find('li.commentpost[data-id="' + cmntId + '"]').remove();
        });
    },
    toggleHidden: function(aspect) {

        if ( $( document ).find('a[data-type="hidden-toggle"]').attr('data-active') == 'false' ) {
            aspect = 'positive';
        } else {
            aspect = 'negative';
        }

        if ( aspect == "negative" ) {
            $( document ).find('li.commentpost[data-hidden="false"]').css('display', 'none');
            $( document ).find('li.commentpost[data-hidden="true"]').css('display', 'block');
        } else {
            $( document ).find('li.commentpost[data-hidden="true"]').css('display', 'none');
            $( document ).find('li.commentpost[data-hidden="false"]').css('display', 'block');
        }
    },
    hideComment: function(cmntId) {
        var msg = _("Are you sure you want to hide the comment?");
        var newText = _("Unhide");
        if ( confirm( msg ) ) {
            var url = new Gizmo.Url('LiveDesk/Blog/' + self.blogId + '/Post/' + cmntId + '/Hide');
            $.post( url.get() , function( data ) {
                $( document ).find('li.commentpost[data-id="' + cmntId + '"]').attr('data-hidden', 'true').css('display', 'none');
                $( document ).find('li.commentpost a[href="#toggle-post"][data-id="' + cmntId + '"]').attr('data-action', 'unhide').text(newText);
            });
        }
    },
    unhideComment: function(cmntId) {
        var msg = _("Are you sure you want to un-hide the comment?");
        var newText = _("Hide");
        if ( confirm( msg ) ) {
            var url = new Gizmo.Url('LiveDesk/Blog/' + self.blogId + '/Post/' + cmntId + '/Unhide');
            $.post( url.get() , function( data ) {
                $( document ).find('li.commentpost[data-id="' + cmntId + '"]').attr('data-hidden', 'false').css('display', 'none');
                $( document ).find('a[href="#toggle-post"][data-id="' + cmntId + '"]').attr('data-action', 'hide').text(newText);
            });
        }
    }
});
return providers;
});
