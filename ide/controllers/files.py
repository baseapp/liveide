import os
import json

from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide import models
from ide.decorators import login_required


@login_required
@get('/files/')
def files_list():
	'''
	Returns list of files in user top dir.
	E.g., files not assigned to any project.
	'''

	user_id = User().id
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)

	f = []
	for (dirpath, dirname, filenames) in os.walk(path):
	    f.extend(filenames)
	    break
	
	return json.dumps(f)


@login_required
@post('/file_create/')
def file_create():
	'''
	Adds new file for loggedin user.
	Creates file on FS.
	File can be assigned to project or not assigned.
	'''

	user_id = User().id
	title = request.POST.get("title")
	project = request.POST.get("project")

	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	if project:
		path += project + "/"
	path += title

	if not os.path.exists(path):
		try:
			fo = open(path, "wb")
			fo.write("")
		finally:
			fo.close()

		c = {
			"title": title,
			"project": project,
			"content": ""
		}

		return json.dumps(c)

	return json.dumps({"msg": "Error creating file!"})
