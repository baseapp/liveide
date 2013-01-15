import os
import shutil
import json
import uuid
import subprocess
import fnmatch
import re

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

	IGNORE_FILES = r'|'.join([fnmatch.translate(x) \
		for x in settings.IGNORE_FILES]) or r'$.'

	f = {}
	for (dirpath, dirname, filenames) in os.walk(path):
		# TODO: consider to read content of file
		# File ID: uuid.uuid4().hex is one time ID for file
		# to make it possible to handle it in UI
		f = [{
			"id": uuid.uuid4().hex,
			"title": x,
			"path": x, # this is files in user's ROOT so path is filename
			"dir": ""
		} for x in filenames if not re.match(IGNORE_FILES, x)]

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
	
	title = request.POST.get("title")
	content = request.POST.get("content", "")
	rel_dir = request.POST.get("dir", "")
	file_path = title
	if rel_dir:
		file_path = rel_dir + "/" + file_path

	user_id = User().id
	project_id = request.POST.get("project")

	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	
	if project_id:
		project = models.Project.find_one({"id": project_id})

	if not os.path.exists(path):
		os.makedirs(path)

	if not os.path.exists(path + file_path):
		try:
			fo = open(path + file_path, "wb")
			fo.write(content)
		except:
			return json.dumps({"msg": "Error creating file!"})
		finally:
			fo.close()

		# uuid.uuid4().hex is just one time ID for file, for UI usage only
		c = {
			"id": uuid.uuid4().hex,
			"title": title,
			"project": project_id,
			"content": content,
			"path": file_path,
			"dir": rel_dir,
		}

		return json.dumps(c)

	return json.dumps({"msg": "File exists!"})


@login_required
@post('/file_remove/')
def file_remove():
	'''
	Removes file from FS.
	NOT REVERTABLE.
	'''

	user_id = User().id
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	file_path = request.POST.get("path")

	if not file_path:
		return json.dumps({"msg": "Specify file name!"})

	# Remove on FS
	if os.path.exists(path + file_path):
		try:
			os.remove(path + file_path)
		except:
			return json.dumps({"msg": "Removing on FS failed!"})

	return "{}"


@login_required
@get("/file_content/")
def file_content():
	'''
	Reads file on FS
	'''

	content = ""
	user_id = User().id
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	file_path = request.GET.get("path")

	if not file_path:
		return "Specify file name!"

	try:
		fo = open(path + file_path, "rb")
		content = fo.read()
	except:
		content = "Error reading file!"
	finally:
		fo.close()

	return content


@login_required
@post("/file_save/")
def file_save():
	'''
	Save / Save as... file on FS
	'''

	user_id = User().id
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	file_path = request.POST.get("path")
	content = request.POST.get("content")

	# If specified `new_title` - Save as...
	new_title = request.POST.get("new_title")
	rel_dir = request.POST.get("dir", "")

	if not file_path:
		return json.dumps({"msg": "Specify file name!"})

	try:
		fo = open(path + file_path, "wb")
		fo.write(content)
	except:
		return json.dumps({"msg": "Error writing file!"})
	finally:
		fo.close()

	# Save as...
	if new_title:
		try:
			os.rename(path + file_path, path + rel_dir + "/" + new_title)
		except:
			return json.dumps({"msg": "Error renaming file!"})

	return "{}"


@login_required
@get("/file_run/")
def file_run():
	'''
	Run file with interpreter and return output to UI
	'''

	user_id = User().id
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	file_path = request.GET.get("path")
	res = ""

	if not file_path:
		return "Specify file name!"

	p = subprocess.Popen(
		('python', '-u', path + file_path, 'x'),
		stdout=subprocess.PIPE,
		stderr=subprocess.PIPE
	)

	# while True:
	# 	nextline = p.stdout.readline()
 #        if nextline == '' and p.poll() != None:
 #            break
 #        yield nextline

 #    output = process.communicate()[0]
 #    exitCode = process.returncode

	output, errors = p.communicate()

	res += output + "\n"
	res += errors + "\n"

	# while p.poll() == None:
	# 	data = p.stdout.readline()
	# 	if data:
	# 		res += data + "\n"

	res += 'process ended with return code %i' % p.returncode

	return res


@login_required
@get("/file_downoad/")
def file_downoad():
	'''
	Download file
	'''

	user_id = User().id
	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
	file_path = request.GET.get("path")
	filename = request.GET.get("filename")

	if not file_path:
		return "Specify file name!"

	try:
		fo = open(path + file_path, "rb")
		content = fo.read()
	except:
		content = "Error reading file!"
	finally:
		fo.close()
	response.content_type = 'text/text'
	response.headers['Content-Disposition'] = 'attachment; filename="%s"' % filename
	return content


@login_required
@post("/file_upload/")
def file_upload():
	'''
	Upload file
	'''

	user_id = User().id
	f = request.POST.get("file")
	content = f.file.read()

	rel_dir = request.GET.get("dir")
	project_id = request.GET.get("project")

	file_path = f.filename
	if rel_dir:
		file_path = rel_dir + "/" + file_path

	path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)

	if not os.path.exists(path + file_path):
		try:
			fo = open(path + file_path, "wb")
			fo.write(content)
		except:
			return json.dumps({"msg": "Error uploading file!"})
		finally:
			fo.close()

		# uuid.uuid4().hex is just one time ID for file, for UI usage only
		c = {
			"id": uuid.uuid4().hex,
			"title": f.filename,
			"project": project_id,
			"content": content,
			"path": file_path,
			"dir": rel_dir,
		}

		return json.dumps(c)

	return json.dumps({"msg": "File exists!"})