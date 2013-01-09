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

    def file_obj(self, filename, rel_dir=""):
        fid = uuid.uuid4().hex

        return {fid: {
                "id": fid,
                "title": filename,
                "project": self.id,
                "path": join(self.title, rel_dir, filename),
                "dir": join(self.title, rel_dir)
            }
        }

    def dir_obj(self, name, files, rel_dir=""):
        fid = "folder_" + uuid.uuid4().hex

        return {fid: {
                "is_folder": True,
                "id": fid,
                "title": name,
                "project": self.id,
                "path": join(self.title, rel_dir, name),
                "dir": join(self.title, rel_dir),
                "files": files
            }
        }

    def get_files(self, dir=""):
        "Recursive function to build project dirs/files tree"
        for (dirpath, dirs, files) in os.walk(join(self.abs_path(), dir)):
            # files in root dir
            f = dict(self.file_obj(x) for x in files)
            if dir:
                f = self.dir_obj(dir, f)
                print f
            for x in dirs:
                f = dict(f, **dict(self.get_files(x)))
            return f

    def json(self):
        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "files": self.get_files()
        }

    def abs_path(self):
        #return "%s%i/%i" % (settings.PROJECTS_ROOT, self.user_id, self.id)
        return "%s%i/%s" % (settings.PROJECTS_ROOT, self.user_id, self.title)

# Create the necessary tables. If they exist, do nothing.
User.initialize()
Project.initialize()