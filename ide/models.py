import os
import uuid

import goatfish
import sqlite3

import settings


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

    def get_files(self):
        "Returns list of files in project"
        f = {}
        for (dirpath, dirname, filenames) in os.walk(self.abs_path()):
            for x in filenames:
                fid = uuid.uuid4().hex
                f[fid] = {
                    "id": fid,
                    "title": x,
                    "project": self.id
                }
            break
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