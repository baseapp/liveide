import os
import json
import uuid

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

	f = {}
	for (dirpath, dirname, filenames) in os.walk(path):
		# TODO: consider to read content of file
		# File ID: uuid.uuid4().hex is one time ID for file
		# to make it possible to handle it in UI
		f = [{"id": uuid.uuid4().hex, "title": x} for x in filenames]
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
	project_id = request.POST.get("project")

	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	if project_id:
		project = models.Project.find_one({"id": project_id})
		if project:
			path += project.title + "/"
	path += title

	if not os.path.exists(path):
		try:
			fo = open(path, "wb")
			fo.write("")
		except:
			return json.dumps({"msg": "Error creating file!"})
		finally:
			fo.close()

		# uuid.uuid4().hex is just one time ID for file for UI usage only
		c = {
			"id": uuid.uuid4().hex,
			"title": title,
			"project": project_id,
			"content": ""
		}

		return json.dumps(c)

	return json.dumps({"msg": "File exists!"})
