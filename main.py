import os 
import string

from bottle import *
from bottleauth import User
import settings
from controllers.auth import *


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