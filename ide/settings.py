# Settings for LiveIDE
#
# Please override values in ide/local_settings.py
# Look at ide/local_settings.def
#
# -----------------------------------------------------------------------------

import os

DEBUG = False

HOST = "localhost"
PORT = 8080

DATABASE = "liveide.db"

APP_URL = "/"
APP_PATH = os.path.dirname(os.path.abspath(__file__))

STATIC_URL = "/static"

COOKIE_SECRET_KEY = "ds34-er33-wer46-gh76"

# Override this to the safe location for users' files
PROJECTS_ROOT = os.path.dirname(os.path.abspath(__file__)) + "/userdata/"

# Disable sign up if you created users and don't want 3rd party to sign up.
SIGNUP_ENABLED = True

# Override settings with local values if present
try:
    from ide.local_settings import *
except:
    pass
