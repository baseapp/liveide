import os
import uuid

import goatfish
import sqlite3

import settings


# joins path and removes trailing slash
join = lambda *args: os.path.normpath(os.path.join(*args))


class User(goatfish.Model):
    class Meta:
        # This is so we know where to connect.
        connection = sqlite3.connect(settings.DATABASE)
        indexes = (
            #("email",),
            #("email", "password"),
        )

    def __unicode__(self):
        return self.email


class Project(goatfish.Model):
    class Meta:
        # This is so we know where to connect.
        connection = sqlite3.connect(settings.DATABASE)
        indexes = (
            #("user_id",),
            #("title",)
        )

    def __unicode__(self):
        return self.title

    def file_obj(self, filename, root=""):
        fid = uuid.uuid4().hex
        rel_dir = root.replace(self.projects_root(), "")[1:] if root else ""

        return {fid: {
                "id": fid,
                "title": filename,
                "project": self.id,
                "path": join(rel_dir, filename),
                "dir": rel_dir
            }
        }

    def dir_obj(self, name, root="", files={}):
        fid = "folder_" + uuid.uuid4().hex
        rel_dir = root.replace(self.projects_root(), "")[1:] if root else ""

        return {fid: {
                "is_folder": True,
                "id": fid,
                "title": name,
                "project": self.id,
                "path": join(rel_dir, name),
                "dir": rel_dir,
                "files": files
            }
        }

    def get_files(self, total_dir="", cur_dir=""):
        "Recursive function to build project dirs/files tree"

        root = total_dir or self.abs_path()
        res = {}

        for item in os.listdir(join(root, cur_dir)):
            if os.path.isdir(join(root, cur_dir, item)):
                #print "DIR", root, item
                res = dict(res, **self.dir_obj(item, root, self.get_files(join(root, cur_dir), item)))
            else:
                #print "FILE", root, item
                res = dict(res, **self.file_obj(item, join(root, cur_dir)))

        return res


        # for (dirpath, dirs, files) in os.walk(join(self.abs_path(), dir)):
        #     print dirpath

        #     # files in dir
        #     f = dict(self.file_obj(x, dir) for x in files)

        #     # if this is subdir
        #     if dir:
        #         f = self.dir_obj(dir, cur_dir, f)

        #     # next walk dirs in this dir
        #     for x in dirs:
        #         f = dict(f, **self.get_files(join(dir, x), x))

        #     return f
        # return {}

    def json(self):
        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "tree": self.get_files()
        }

    def projects_root(self):
        return "%s%i" % (settings.PROJECTS_ROOT, self.user_id)

    def abs_path(self):
        #return "%s%i/%i" % (settings.PROJECTS_ROOT, self.user_id, self.id)
        return join(self.projects_root(), self.title)

# Create the necessary tables. If they exist, do nothing.
User.initialize()
Project.initialize()