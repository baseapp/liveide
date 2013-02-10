Live IDE
========

Online / Offline browser based IDE for Python (and not only).
Powered with projects management and code intellisense :)

Try LiveIDE on heroku: http://liveide.herokuapp.com


Requirements
============

 * Python 2.7

LiveIDE use `bottle.py` framework. It is included in project.

Users and projects metadata is stored in SQLite DB.


Run on server
=============

    python main.py


Configure (settings.py / local_settings.py)
===========================================

To make your own configuration use `ide/local_settings.def` as a template
for `ide/local_settings.py`.

 * By default root dir to store projects is `liveide/ide/userdata`.

 * By default `python main.py` will run it with host set to `localhost` and `8080` port.

 * By default registration for new users is available to all. You may first create your users and then restrict registration by disabling `SIGNUP_ENABLED` option in settings.


IDE Features
============

 * Create and manage projects with subdirectories and files.
 * Upload existing projects into IDE
 * Run file with python interpreter on server and display output and errors in IDE console.
 * Edit files with Ace editor (syntax highlighing, code formatting, etc).
 * Code intellisense by Ctrl+Space (Python)

Feedback
========

Have a word to say? Write us :)
