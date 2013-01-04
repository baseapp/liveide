import os

DEBUG = False

HOST = "localhost"
PORT = 8080

APP_URL = "/"
APP_PATH = os.path.dirname(os.path.abspath(__file__))

STATIC_URL = "/static/"

# Override settings with local values if present
try:
    from local_settings import *
except:
    pass
