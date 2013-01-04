import goatfish
import sqlite3

import settings


class User(goatfish.Model):
    class Meta:
        # This is so we know where to connect.
        connection = sqlite3.connect(settings.DATABASE)
        indexes = (
            ("email",),
        )


class Project(goatfish.Model):
    class Meta:
        # This is so we know where to connect.
        connection = sqlite3.connect(settings.DATABASE)
        indexes = (
            ("user",),
            ("title",)
        )

# Create the necessary tables. If they exist, do nothing.
User.initialize()
Project.initialize()