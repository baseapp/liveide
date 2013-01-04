import os

DEBUG = False

HOST = "localhost"
PORT = 8080

DATABASE = "liveide.db"

APP_URL = "/"
APP_PATH = os.path.dirname(os.path.abspath(__file__))

STATIC_URL = "/static/"

COOKIE_SECRET_KEY = "ds34-er33-wer46-gh76"

# Override settings with local values if present
try:
    from local_settings import *
except:
    pass
