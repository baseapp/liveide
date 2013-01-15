import os
import shutil
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
	Created DB item and Directory on filesystem.
	'''

	title = request.POST.get("title")

	# DB
	item = models.Project()
	item.user_id = User().id
	item.title = title

	if os.path.exists(item.abs_path()):
		return json.dumps({"msg": 'Directory "%s" already exists!' % title})

	# DB save
	item.save()

	# FS
	os.makedirs(item.abs_path())

	try:
		fo = open(item.abs_path() + "/.liveideproject", "wb")
		fo.write(json.dumps({"title": item.title}))
	finally:
		fo.close()

	return json.dumps(item.json())

@login_required
@post('/project_remove/')
def project_remove():
	'''
	Removes project dir and record in DB.
	NOT REVERTABLE.
	'''

	user = User()
	item = models.Project.find_one({"id": request.POST.get("id")})

	if user.id != item.user_id:
		return json.dumps({"msg": "User ID not match with project ID!"})

	# Remove on FS
	if os.path.exists(item.abs_path()):
		try:
			shutil.rmtree(item.abs_path())
		except:
			return json.dumps({"msg": "Removing on FS failed!"})

	# Finally remove in DB
	item.delete()

	return "{}"
	#return json.dumps({"msg": "Project removed!"})


@login_required
@post('/project_rename/')
def project_rename():
	'''
	Renames (move) project dir and record in DB.
	'''

	user = User()
	item = models.Project.find_one({"id": request.POST.get("id")})

	if user.id != item.user_id:
		return json.dumps({"msg": "User ID not match with project ID!"})

	new_title = request.POST.get("new_title")

	if not new_title:
		return json.dumps({"msg": "Specify new name for project!"})

	try:
		path = "%s%i/" % (settings.PROJECTS_ROOT, item.user_id)
		os.rename(item.abs_path(), path + new_title)
	except:
		return json.dumps({"msg": "Error renaming project!"})

	item.title = new_title
	item.save()

	try:
		fo = open(item.abs_path() + "/.liveideproject", "r+")
		try:
			project_settings = json.loads(fo.read() or "{}")
		except:
			project_settings = {}
		project_settings["title"] = item.title
		fo.truncate(0)
		fo.write(json.dumps(project_settings))
	finally:
		fo.close()

	return "{}"


@login_required
@post('/project_settings/')
def project_settings():
	'''
	Saves project settings to `.liveideproject` file.
	'''

	user = User()
	item = models.Project.find_one({"id": request.POST.get("id")})

	if user.id != item.user_id:
		return json.dumps({"msg": "User ID not match with project ID!"})

	project_settings = dict(request.POST)

	#try:
	fo = open(item.abs_path() + "/.liveideproject", "r+")
	fo.truncate(0)
	fo.write(json.dumps(project_settings))
	#finally:
	fo.close()

	return json.dumps(project_settings)