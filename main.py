import os 
import string

from ide import bottle
from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide.controllers.auth import *


bottle.TEMPLATE_PATH.insert(0, "./ide/views/")
print bottle.TEMPLATE_PATH


# -- SERVE STATIC FILES --
@route('/static/<path:path>')
def server_static(path):
	return static_file(path, root=settings.APP_PATH+'/static/')


# -- APP ROUTES --
@route('/')
@view('layout.tpl')
def index():
	user = User()
	if not user.loggedin:
		redirect('/login/')

	return {
		"user": user,
		"static_url": settings.STATIC_URL
	}


if __name__=="__main__":
	run(host = settings.HOST,
		port = settings.PORT,
		debug = settings.DEBUG,
		reloader = True
	)