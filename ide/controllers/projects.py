import os
import json

from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide import models
from ide.decorators import login_required


@login_required
@get('/projects/')
def projects_list():
	#response.set_header('Cache-Control', 'no-cache, must-revalidate')

	user = User()
	items = models.Project.find({"user_id": user.id})
	
	return json.dumps([item.json() for item in items])


@login_required
@post('/project_create/')
def project_create():
	'''
	Adds new project for loggedin user.
	Created DB item and Directory on filesystem
	'''

	# DB
	item = models.Project()
	item.user_id = User().id
	item.title = request.POST.get("title")
	item.save()

	# FS
	if not os.path.exists(item.abs_path()):
		os.makedirs(item.abs_path())

		try:
			fo = open(item.abs_path() + "/.liveideproject", "wb")
			fo.write(item.title)
		finally:
			fo.close()

	return json.dumps(item.json())
