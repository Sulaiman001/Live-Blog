'''
Created on Aug 23, 2012

@package: superdesk media archive
@copyright: 2012 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Ioan v. Pocol

SQL Alchemy based implementation for the video data API. 
'''

from ally.container.ioc import injected
from ally.container.support import setup
from superdesk.media_archive.core.spec import IMetaDataHandler, IMetaDataReferencer,\
    IThumbnailManager
from superdesk.media_archive.api.video_data import IVideoDataService, QVideoData
from superdesk.media_archive.meta.meta_data import MetaDataMapped
from cdm.spec import ICDM
from ally.container import wire
from superdesk.media_archive.core.impl.meta_service_base import MetaDataServiceBaseAlchemy
from superdesk.media_archive.meta.video_data import VideoDataMapped


# --------------------------------------------------------------------

@injected
@setup(IVideoDataService)
class VideoDataServiceAlchemy(MetaDataServiceBaseAlchemy, IMetaDataReferencer, IVideoDataService):
    '''
    @see: IVideoDataService
    '''

    handler = IMetaDataHandler
    
    cdmArchive = ICDM
    # The archive CDM.
    thumbnailManager = IThumbnailManager; wire.entity('thumbnailManager')
    # Provides the thumbnail referencer

    def __init__(self):
        assert isinstance(self.handler, IMetaDataHandler), 'Invalid handler %s' % self.handler
        assert isinstance(self.cdmArchive, ICDM), 'Invalid archive CDM %s' % self.cdmArchive
        assert isinstance(self.thumbnailManager, IThumbnailManager), 'Invalid thumbnail manager %s' % self.thumbnailManager
       
        MetaDataServiceBaseAlchemy.__init__(self, VideoDataMapped, QVideoData, self)
    
    # ----------------------------------------------------------------

    def populate(self, metaData, scheme, thumbSize=None):
        '''
        @see: IMetaDataReferencer.populate
        '''
        assert isinstance(metaData, MetaDataMapped), 'Invalid meta data %s' % metaData
        metaData.Content = self.cdmArchive.getURI(metaData.content, scheme)
        self.thumbnailManager.populate(metaData, scheme, thumbSize)

        return metaData
    
    # ----------------------------------------------------------------
