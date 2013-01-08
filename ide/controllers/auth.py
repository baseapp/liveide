from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide import models


@get('/login/')
@view('login.tpl')
def login():
	'''
	Renders login page.
	'''

	items = []
	if settings.DEBUG:
		items = models.User.find()

	return {
		"msg": request.GET.get("msg"),
		"debug": settings.DEBUG,
		"signup_enabled": settings.SIGNUP_ENABLED,
		"static_url": settings.STATIC_URL,
		"users": items
	}

@post('/login/')
def user_login():
	'''
	Auth user
	'''

	user = User()
	if not user.authenticate( 
        request.POST.getone('email'),
        request.POST.getone('password')
	):
		redirect('/login/?msg=Incorrect username or password')

	return '<meta http-equiv="refresh" content="0;url=/" />'


@get('/logout/')
def user_logout():
	'''
	Sign out
	'''

	User().logout()

	return '<meta http-equiv="refresh" content="0;url=/" />'


@get('/signup/')
@view('signup.tpl')
def signup():
	'''
	Renders registration page
	'''

	return {
		"signup_enabled": settings.SIGNUP_ENABLED,
		"static_url": settings.STATIC_URL
	}

@post('/signup/')
def user_signup():
	'''
	Writes new user to DB
	'''

	if not settings.SIGNUP_ENABLED:
		return "Sign up disabled in app settings!"

	email = request.POST.get('email'),
	password = request.POST.get('password')

	user = User()
	if user.register(email[0], password):
		redirect('/')

	redirect('/signup/')