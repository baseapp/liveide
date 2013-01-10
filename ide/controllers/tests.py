import os
import shutil
import json
import uuid
import subprocess

from ide.bottle import *
from ide.bottleauth import User
from ide import settings
from ide import models
from ide.decorators import login_required


@get('/tests/')
@view('tests.tpl')
@login_required
def tests():
    '''
    QTests
    '''

    return {
        "user": User(),
        "static_url": settings.STATIC_URL
    }
