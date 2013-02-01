import os
import shutil
import json
import zipfile

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

	return json.dumps(item.json(with_tree=True))


@login_required
@get('/project_open/')
def project_open():
	'''
	Loads project tree
	'''

	user = User()
	item = models.Project.find_one({"id": request.GET.get("id")})

	if user.id != item.user_id:
		return json.dumps({"msg": "User ID not match with project ID!"})

	return json.dumps(item.get_files())


@login_required
@get('/project_downoad/')
def project_downoad():
	'''
	ZIPs project and returns resulting archive
	'''

	user = User()
	item = models.Project.find_one({"id": request.GET.get("id")})

	if user.id != item.user_id:
		return "User ID not match with project ID!"

	filename = shutil.make_archive(item.title, "zip", item.abs_path())

	try:
		fo = open(filename, "rb")
		content = fo.read()
	except:
		content = "Error reading file!"
	finally:
		fo.close()
		os.remove(filename)

	response.content_type = 'application/zip'
	response.headers['Content-Disposition'] = 'attachment; filename="%s.zip"' % item.title
	return content


@login_required
@post("/project_upload/")
def project_upload():
	'''
	Upload project as ZIP archive
	'''

	user_id = User().id
	f = request.POST.get("file")
	content = f.file.read()

	filename = f.filename
	title = filename.replace(".zip", "")
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)

	if not os.path.exists(path + title):
		with zipfile.ZipFile(f.file, "r") as z:
			z.extractall(path)

		item = models.Project()
		item.user_id = User().id
		item.title = title
		item.save()

		return json.dumps(item.json(with_tree=True))

	return json.dumps({"msg": "Directory exists!"})


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
@post('/project_copy/')
def project_copy():
	'''
	Copy project dir and record in DB.
	'''

	user = User()
	item = models.Project.find_one({"id": request.POST.get("id")})

	if user.id != item.user_id:
		return json.dumps({"msg": "User ID not match with project ID!"})

	new_title = request.POST.get("new_title")

	if not new_title:
		return json.dumps({"msg": "Specify new name for project!"})

	# New item record in DB
	new_item = models.Project()
	new_item.user_id = user.id
	new_item.title = new_title

	try:
		path = "%s%i/" % (settings.PROJECTS_ROOT, item.user_id)
		shutil.copytree(item.abs_path(), path + new_title)
	except:
		return json.dumps({"msg": "Error copying project!"})

	new_item.save()

	try:
		fo = open(new_item.abs_path() + "/.liveideproject", "r+")
		try:
			project_settings = json.loads(fo.read() or "{}")
		except:
			project_settings = {}
		project_settings["title"] = new_item.title
		fo.truncate(0)
		fo.write(json.dumps(project_settings))
	finally:
		fo.close()

	return json.dumps(new_item.json(with_tree=True))


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

	try:
		fo = open(item.abs_path() + "/.liveideproject", "r+")
		fo.truncate(0)
		fo.write(json.dumps(project_settings))
	finally:
		fo.close()

	return json.dumps(project_settings)


@login_required
@get("/project_build/")
def project_build():
	'''
	Execute project `build` command from Settings and return output to UI
	'''

	user_id = User().id
	item = models.Project.find_one({"id": request.GET.get("id")})
	res = ""

	if user_id != item.user_id:
		return "User ID not match with project ID!"

	settings = item.get_settings()
	if not "build" in settings:
		return "Specify build system in Settings first!"

	p = subprocess.Popen(
		(settings["build"]),
		cwd=item.abs_path(),
		stdout=subprocess.PIPE,
		stderr=subprocess.PIPE
	)
	
	output, errors = p.communicate()

	res += output + "\n"
	res += errors + "\n"

	res += 'process ended with return code %i' % p.returncode

	return res