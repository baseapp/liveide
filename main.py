"""
LiveIDE is online IDE for Python projects

Homepage and documentation: https://github.com/baseapp/liveide/

Copyright (c) 2013, BaseApp, V. Sergeyev.
License: MIT (see LICENSE for details)
"""

import os 
import string

from ide import bottle
from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide.decorators import login_required
# URLs handlers:
from ide.controllers import *

bottle.TEMPLATE_PATH.insert(0, "./ide/views/")


# -- SERVE STATIC FILES --
@route('/static/<path:path>')
def server_static(path):
	return static_file(path, root=settings.APP_PATH+'/static/')


# -- APP ROUTES --
@get('/')
@view('layout.tpl')
@login_required
def index():
	return {
		"user": User(),
		"static_url": settings.STATIC_URL
	}


if __name__=="__main__":
	run(host = settings.HOST,
		port = settings.PORT,
		debug = settings.DEBUG,
		reloader = True
	)