'''
Created on Aug 30, 2012

@package: livedesk
@copyright: 2012 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Mugur Rus

Contains the SQL alchemy meta for blog type post API.
'''

from sqlalchemy.schema import Column, ForeignKey
from superdesk.meta.metadata_superdesk import Base
from superdesk.post.meta.post import PostMapped
from sqlalchemy.types import REAL, String
from livedesk.api.blog_type_post import BlogTypePost
from livedesk.meta.blog_type import BlogTypeMapped
from sql_alchemy.support.util_meta import relationshipModel
from ally.api.validate import validate, ReadOnly
from sqlalchemy.ext.declarative import declared_attr

# --------------------------------------------------------------------

class BlogTypePostDefinition:
    __tablename__ = 'livedesk_blog_type_post'
    __table_args__ = dict(mysql_engine='InnoDB', mysql_charset='utf8')
    
    #BlogType = declared_attr(lambda cls:relationshipModel(BlogTypeMapped.id))
    Name = declared_attr(lambda cls: Column('name', String(190), nullable=False, unique=True))
    Order = declared_attr(lambda cls:Column('ordering', REAL))
    # Non REST model attribute --------------------------------------
    blogTypePostId = declared_attr(lambda cls:Column('fk_post_id', ForeignKey(PostMapped.Id, ondelete='CASCADE'), primary_key=True))
    # Never map over the inherited id

class BlogTypePostEntry(Base, BlogTypePostDefinition):
    '''
    Provides the mapping for BlogPost table where it keeps the connection between the post and the blog.
    '''
    #__tablename__ = 'livedesk_blog_type_post'
    #__table_args__ = dict(mysql_engine='InnoDB', mysql_charset='utf8')

    BlogType = relationshipModel(BlogTypeMapped.id)
    #Name = Column('name', String(190), nullable=False, unique=True)
    #Order = Column('ordering', REAL)
    # Non REST model attribute --------------------------------------
    #blogTypePostId = Column('fk_post_id', ForeignKey(PostMapped.Id, ondelete='CASCADE'), primary_key=True)
    # Never map over the inherited id

@validate(ReadOnly(BlogTypePost.Order))
#class BlogTypePostMapped(PostMapped, BlogTypePostEntry, BlogTypePost):
class BlogTypePostMapped(BlogTypePostDefinition, PostMapped, BlogTypePost):
    '''
    Provides the mapping for BlogPost in the form of extending the Post.
    '''
    BlogType = relationshipModel(BlogTypeMapped.id)
    __table_args__ = dict(BlogTypePostDefinition.__table_args__, extend_existing=True)
