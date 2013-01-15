/*
    LiveIDE
    Project operations module.

    Online IDE for Python projects.
    Homepage and documentation: https://github.com/baseapp/liveide/

    Copyright (c) 2013, BaseApp, V. Sergeyev.
*/

(function(){
    var LiveIDE = this.LiveIDE || {},
        that = LiveIDE;

    /* Project operations */
    LiveIDE.project = {
        /* Create */
        create: function () {
            bootbox.prompt("New project name", function(title) {
                if (!title) return;
                
                $.post("/project_create/", {"title": title}, function (data) {
                    var v = $.parseJSON(data);

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }

                    that.projects[v.id] = v;
                    that.helpers.render_project(v);
                    that.flash("Project created");
                });
            });
        },

        /* Rename */
        rename: function (project) {
            bootbox.prompt("Rename " + project.title + " as", function(title) {
                if (!title) return;

                $.post("/project_rename/", {"id": project.id, "new_title": title}, function (data) {
                    var v = $.parseJSON(data),
                        old_title = project.title;

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }

                    project.title = title;

                    // Change attrs for files and folders in this project
                    $.each(project.files, function (k, v) {
                        v.dir = v.dir.replace(old_title, title);
                        v.path = v.path.replace(old_title, title);
                    });
                    $.each(project.folders, function (k, v) {
                        v.dir = v.dir.replace(old_title, title);
                        v.path = v.path.replace(old_title, title);
                    });
                    that.dom.project.tree.find(".project-click[data-id='" + project.id + "']").html(title);
                    that.dom.project.active.html(project.title);
                    that.flash("Project renamed");
                });
            });
        },

        /* Delete project */
        remove: function (project) {
            if (!project) return;

            bootbox.confirm(project.title + " and it's files will be vanished. Do you want to continue?", function(result) {
                if (!result) return;

                $.post("/project_remove/", {"id": project.id}, function (data) {
                    var v = $.parseJSON(data);

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }
                    
                    that.helpers.remove_project(project.id);
                    that.projects[project.id] = null;

                    that.flash("Project removed");
                });

                that.active.project = null;
                that.active.dir = "";
                that.active.folder = null;
                that.dom.project.active.html("");
            });
        },

        /* Settings of project */
        settings: function (project) {
            var s = $.extend({
                    build: "python",
                    description: ""
                }, project.settings),
                form = $("<form></form>");
            form.append("<label>Build system:</label> <input type=text name='build' value='" + s.build + "' />");
            form.append("<label>Description:</label> <textarea name='description'>" + s.description + "</textarea>");

            bootbox.form("Project settings", form, function($form) {
                if (!$form) return;

                var settings = {};

                $form.find(':input[name]:enabled').each( function() {
                    var self = $(this);
                    var name = self.attr('name');
                    if (settings[name]) {
                        settings[name] = settings[name] + ',' + self.val();
                    } else {
                        settings[name] = self.val();
                    }
                });

                settings["id"] = project.id;
                settings["title"] = project.title;
                
                that.post("/project_settings/", settings, function (v) {
                    project.settings = v;
                    that.flash("Settings saved");
                });
            });
        },

        /* Create folder */
        create_folder: function (project, folder) {
            bootbox.prompt("New folder name", function(title) {
                if (!title) return;
                
                that.post("/folder_create/", {"id": project.id, "title": title, "dir": folder ? folder.path : project.title}, function (v) {
                    project.folders[v.id] = v;
                    that.helpers.render_folder(v, folder);
                    that.active.folder = v;
                    that.active.dir = v.path;
                    that.flash("Folder created");
                });
            });
        },

        /* Rename or Move folder */
        force_move: function (folder, title, target) {
            var dir = target ? target.path : "";

            $.post("/folder_rename/", {"path": folder.path, "dir": folder.dir, "new_title": title, "new_dir": dir}, function (data) {
                var v = $.parseJSON(data),
                    el = $(".folder-click[data-id='" + folder.id + "']"),
                    old_title = folder.title,
                    old_dir = folder.dir,
                    old_path = folder.path;

                if (v.msg) {
                    that.flash(v.msg, true);
                    return;
                }

                folder.title = title;
                if (target) {
                    folder.dir = dir;
                    // Moved to new project?
                    if (target.is_project) {
                        that.projects[folder.project].folders[folder.id] = null;
                        folder.project = target.id;
                    }
                }
                folder.path = folder.dir + "/" + folder.title;

                // Change attrs for files in this folder
                $.each(folder.files, function (k, v) {
                    v.dir = v.dir.replace(old_path, folder.path);
                    v.path = v.path.replace(old_path, folder.path);
                });

                that.active.dir = folder.path;
                that.dom.project.active.html(folder.path);
                
                // DOM
                el.html(title);
                if (target) {
                    that.helpers.remove_folder(folder.id);
                    that.helpers.render_folder(folder, target.is_project ? null : target);
                }
                
                that.flash("Folder renamed");
            });
        },

        /* Rename folder */
        rename_folder: function (folder) {
            bootbox.prompt("Rename " + folder.title + " as", function(title) {
                if (!title) return;

                that.project.force_move(folder, title, null);
            });
        },

        /* Drag and Drop folder */
        move_folder: function (folder, target) {
            if (!folder) return false;
            if (!target) return false;

            that.project.force_move(folder, folder.title, target);
        },

        /* Delete folder */
        remove_folder: function (folder) {
            if (!folder) return;

            bootbox.confirm(folder.title + " and it's files will be vanished. Do you want to continue?", function(result) {
                if (!result) return;

                $.post("/folder_remove/", {"path": folder.path}, function (data) {
                    var v = $.parseJSON(data);

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }
                    
                    that.helpers.remove_folder(folder.id);
                    that.projects[folder.project].folders[folder.id] = null;

                    that.flash("Folder removed");
                });

                that.active.project = null;
                that.active.dir = "";
                that.active.folder = null;
                that.dom.project.active.html("");
            });
        }
    }
    
    this.LiveIDE = LiveIDE;
}).call(this);