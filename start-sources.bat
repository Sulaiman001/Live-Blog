@ECHO OFF
setlocal
SET ALLYPATH=..\
SET ALLYCOM=%ALLYPATH%components\

set PYTHONPATH=%ALLYCOM%ally
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-plugin
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-api
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-core
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-core-http
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-core-sqlalchemy
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-http
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-http-asyncore-server
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%ally-http-mongrel2-server
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%service-cdm
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%service-gateway
set PYTHONPATH=%PYTHONPATH%;%ALLYCOM%service-gateway-recaptcha

SET ALLYPLUG=%ALLYPATH%plugins\

set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%administration
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%gateway
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%gateway_captcha
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%gui-action
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%gui-core
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%gui-security
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%internationalization
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%security
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%security-rbac
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%support-acl
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%support-cdm
set PYTHONPATH=%PYTHONPATH%;%ALLYPLUG%support-sqlalchemy

SET FULLPATH=
SET SUPERPLUG=%FULLPATH%plugins\
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%livedesk
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%livedesk-sync
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%livedesk-embed
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%media-archive
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%media-archive-audio
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%media-archive-image
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%media-archive-video
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-security
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-collaborator
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-language
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-person
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-person-icon
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-post
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-source
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-user
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-verification
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%support
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%url-info
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%frontline
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%frontline-inlet
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%superdesk-verification
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%general-setting
set PYTHONPATH=%PYTHONPATH%;%SUPERPLUG%livedesk-seo

IF NOT EXIST distribution\application.properties python distribution\application.py -dump

python distribution\application.py
