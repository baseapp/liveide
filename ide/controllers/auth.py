from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide import models


@get('/login/')
@view('login.tpl')
def login():
	return {
		"msg": request.GET.get("msg"),
		"static_url": settings.STATIC_URL,
		"users": models.User.find()
	}

@post('/login/')
def user_login():
	user = User()
	if not user.authenticate( 
        request.POST.getone('email'),
        request.POST.getone('password')
	):
		redirect('/login/?msg=Incorrect username or password')

	return '<meta http-equiv="refresh" content="0;url=/" />'


@get('/logout/')
def user_logout():
	User().logout()
	return '<meta http-equiv="refresh" content="0;url=/" />'


@get('/signup/')
@view('signup.tpl')
def signup():
	return {"static_url": settings.STATIC_URL}

@post('/signup/')
def user_signup():
	email = request.POST.get('email'),
	password = request.POST.get('password')

	user = User()
	if user.register(email[0], password):
		redirect('/')

	redirect('/signup/')