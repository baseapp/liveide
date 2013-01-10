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