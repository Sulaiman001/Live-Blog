'''
Created on May 4, 2012

@package: livedesk
@copyright: 2012 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Gabriel Nistor

API specifications for livedesk blog posts.
'''

from .blog import Blog
from ally.api.config import service, call, INSERT, query, UPDATE, extension
from ally.api.criteria import AsRangeOrdered, AsBoolean, AsLike, AsEqual
from ally.api.extension import IterPart
from ally.api.type import Iter, Reference
from livedesk.api.domain_livedesk import modelLiveDesk
from superdesk.collaborator.api.collaborator import Collaborator
from superdesk.person.api.person import Person
from superdesk.post.api.post import Post, QPostUnpublished, QPost, IPostService
from superdesk.post.api.type import PostType
from superdesk.user.api.user import User
from livedesk.api.blog_collaborator_group import BlogCollaboratorGroup
from superdesk.source.api.source import Source

# --------------------------------------------------------------------

@modelLiveDesk(name=Post)
class BlogPost(Post):
    '''
    Provides the blog post model.
    '''
    CId = int
    Order = float
    Blog = Blog
    AuthorPerson = Person
    AuthorName = str
    AuthorImage = Reference

# --------------------------------------------------------------------

@query(BlogPost)
class QWithCId:
    '''
    Provides the query for cId.
    '''
    id = AsRangeOrdered
    cId = AsRangeOrdered
    search = AsLike
    status = AsEqual
    checker = AsEqual

@query(BlogPost)
class QBlogPostUnpublished(QPostUnpublished, QWithCId):
    '''
    Provides the blog post message query.
    '''
    isDeleted = AsBoolean
    order = AsRangeOrdered

@query(BlogPost)
class QBlogPostPublished(QPost, QWithCId):
    '''
    Provides the blog post message query.
    '''
    order = AsRangeOrdered

@query(BlogPost)
class QBlogPost(QPost, QWithCId):
    '''
    Provides the blog post message query.
    '''
    isPublished = AsBoolean

# --------------------------------------------------------------------

@extension
class IterPost(IterPart):
    '''
    The post iterable that provides extended information on the posts collection.
    The offsetMore parameter was removed to limit the query count that the client generates otherwise.
    '''
    lastCId = int

# --------------------------------------------------------------------

@service
class IBlogPostService:
    '''
    Provides the service methods for the blog posts.
    '''

    @call
    def getById(self, blogId:Blog, postId:BlogPost, thumbSize:str=None) -> BlogPost:
        '''
        Provides the blog post based on the id.
        '''

    @call(webName='Published')
    def getPublished(self, blogId:Blog, typeId:PostType=None, creatorId:User=None, authorId:Collaborator=None, thumbSize:str=None,
                     offset:int=None, limit:int=None, detailed:bool=True, q:QBlogPostPublished=None) -> Iter(BlogPost):
        '''
        Provides all the blogs published posts. The detailed iterator will return a @see: IterPost.
        '''

    @call(webName='Unpublished')
    def getUnpublished(self, blogId:Blog, typeId:PostType=None, creatorId:User=None, authorId:Collaborator=None, thumbSize:str=None,
                       offset:int=None, limit:int=None, detailed:bool=True, q:QBlogPostUnpublished=None) -> Iter(BlogPost):
        '''
        Provides all the unpublished blogs posts.
        '''
        
    @call(webName='SourceUnpublished')
    def getUnpublishedBySource(self, sourceId:Source.Id, thumbSize:str=None, offset:int=None, limit:int=None, detailed:bool=True, 
                               q:QBlogPostUnpublished=None) -> Iter(BlogPost):
        '''
        Provides all the unpublished blog posts for a given source.
        '''    
    
    @call(webName='GroupUnpublished')
    def getGroupUnpublished(self, blogId:Blog, groupId:BlogCollaboratorGroup, typeId:PostType=None, authorId:Collaborator=None, thumbSize:str=None,
                       offset:int=None, limit:int=None, q:QBlogPostUnpublished=None) -> Iter(BlogPost):
        '''
        Provides all the unpublished blogs posts for current blog colllaborator group.
        '''

    @call(webName='Owned')
    def getOwned(self, blogId:Blog, creatorId:User, typeId:PostType=None, thumbSize:str=None, offset:int=None, limit:int=None,
                 q:QBlogPost=None) -> Iter(BlogPost):
        '''
        Provides all the unpublished blogs posts that belong to the creator, this means that the posts will not have
        an Author.
        '''

    @call
    def getAll(self, blogId:Blog, typeId:PostType=None, creatorId:User=None, authorId:Collaborator=None, thumbSize:str=None,
                       offset:int=None, limit:int=None, q:QBlogPost=None) -> Iter(BlogPost):
        '''
        Provides all the unpublished blogs posts.
        '''

    @call
    def insert(self, blogId:Blog.Id, post:Post) -> BlogPost.Id:
        '''
        Inserts the post in the blog.
        '''

    @call(method=INSERT, webName='Publish')
    def publish(self, blogId:Blog.Id, postId:BlogPost.Id) -> BlogPost.Id:
        '''
        Publishes the post in the blog.
        '''
    
    @call(method=INSERT, webName='CId')
    def updateCid(self, blogId:Blog.Id, postId:BlogPost.Id) -> BlogPost.Id:
        '''
        Update the Cid for the blog post.
        ''' 
            
    @call(method=INSERT, webName='Hide')
    def hide(self, blogId:Blog.Id, postId:BlogPost.Id) -> BlogPost.Id:
        '''
        Hide the post from the blog.
        '''    
        
    @call(method=INSERT, webName='Unhide')
    def unhide(self, blogId:Blog.Id, postId:BlogPost.Id) -> BlogPost.Id:
        '''
        Unhide the post from the blog.
        '''    
    
    @call(webName='Published')
    def insertAndPublish(self, blogId:Blog.Id, post:Post) -> BlogPost.Id:
        '''
        Inserts and publishes the post in the blog.
        '''

    @call(method=INSERT, webName='Unpublish')
    def unpublish(self, blogId:Blog.Id, postId:BlogPost.Id) -> BlogPost.Id:
        '''
        Unpublishes the post in the blog.
        '''

    @call
    def update(self, blogId:Blog.Id, post:Post):
        '''
        Update the post for the blog.
        '''

    @call(method=UPDATE, webName='Reorder')
    def reorder(self, blogId:Blog.Id, postId:Post.Id, refPostId:Post.Id, before:bool=True):
        '''
        Reorder the post.
        '''

    @call(replaceFor=IPostService)
    def delete(self, id:Post.Id) -> bool:
        '''
        Delete the post for the provided id.

        @param id: integer
            The id of the post to be deleted.

        @return: True if the delete is successful, false otherwise.
        '''
