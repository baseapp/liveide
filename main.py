import os 
import string

from bottle import route, run, template, static_file, redirect
from bottleauth import User

import settings


APP_URL = settings.APP_URL
APP_PATH = settings.APP_PATH
STATIC_URL = settings.STATIC_URL


# -- SERVE STATIC FILES --
@route('/static/<path:path>')
def server_static(path):
	return static_file(path, root=APP_PATH+'/static/')


# -- APP ROUTES --
@route('/')
def index():
	user = User()
	if not user.loggedin:
		redirect('/login/')

	context = {
		"static_url": STATIC_URL
	}
	return template('layout.tpl', context)


@route('/login/')
def login():
	context = {
		"static_url": STATIC_URL
	}
	return template('login.tpl', context)


run(host = settings.HOST,
	port = settings.PORT,
	debug = settings.DEBUG,
	reloader = True
)