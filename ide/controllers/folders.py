import os
import shutil
import json
import uuid

from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide import models
from ide.decorators import login_required


@login_required
@post('/folder_create/')
def folder_create():
    '''
    Adds new folder into project.
    '''

    user = User()
    project_id = request.POST.get("id")
    item = models.Project.find_one({"id": project_id})

    if user.id != item.user_id:
        return json.dumps({"msg": "User ID not match with project ID!"})

    title = request.POST.get("title")
    rel_dir = request.POST.get("dir")

    if not title:
        return json.dumps({"msg": "Specify name for folder!"})

    path = "%s%i/" % (settings.PROJECTS_ROOT, item.user_id)
    if rel_dir:
        path += rel_dir + "/"

    if os.path.exists(path + title):
        return json.dumps({"msg": 'Directory "%s" already exists!' % title})

    # FS
    os.makedirs(path + title)

    c = {
        "id": uuid.uuid4().hex,
        "is_folder": True,
        "title": title,
        "project": project_id,
        "path": models.join(rel_dir, title),
        "dir": rel_dir,
        "files": {}
    }

    return json.dumps(c)


@login_required
@post("/folder_rename/")
def folder_rename():
    '''
    Rename folder
    '''

    user_id = User().id
    path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
    file_path = request.POST.get("path")
    new_title = request.POST.get("new_title")
    rel_dir = request.POST.get("dir", "")

    if not file_path:
        return json.dumps({"msg": "Specify folder name!"})

    if new_title:
        try:
            os.rename(path + file_path, path + rel_dir + "/" + new_title)
        except:
            return json.dumps({"msg": "Error renaming folder!"})

    return "{}"


@login_required
@post('/folder_remove/')
def folder_remove():
    '''
    Removes folder from FS.
    NOT REVERTABLE.
    '''

    user_id = User().id
    path = "%s%i/" % (settings.PROJECTS_ROOT, user_id)
    file_path = request.POST.get("path")

    if not file_path:
        return json.dumps({"msg": "Specify folder name!"})

    # Remove on FS
    if os.path.exists(path + file_path):
        try:
            shutil.rmtree(path + file_path)
        except:
            return json.dumps({"msg": "Removing on FS failed!"})

    return "{}"