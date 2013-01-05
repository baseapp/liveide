# Decorators to use with bottle.py

from ide.bottle import *
from ide.bottleauth import User


def validate_login():
	'''
	Relly on User class from `bottlepy-user-auth`
	'''
	return User().loggedin


def login_required(view, check_func=validate_login):
	'''
	Check if user has logined to app
	'''
	def wrapped(*args, **kwargs):
		auth = check_func()
		if auth:
			return view(*args, **kwargs)
		return redirect('/login/')
	return wrapped