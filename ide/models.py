import goatfish
import sqlite3

import settings


class User(goatfish.Model):
    class Meta:
        # This is so we know where to connect.
        connection = sqlite3.connect(settings.DATABASE)
        indexes = (
            ("email",),
            ("email", "password"),
        )

    def __unicode__(self):
        return self.email


class Project(goatfish.Model):
    class Meta:
        # This is so we know where to connect.
        connection = sqlite3.connect(settings.DATABASE)
        indexes = (
            ("user_id",),
            ("title",)
        )

    def __unicode__(self):
        return self.title

    def json(self):
        return {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id
        }

# Create the necessary tables. If they exist, do nothing.
User.initialize()
Project.initialize()