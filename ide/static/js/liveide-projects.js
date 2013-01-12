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

        /* Rename folder */
        rename_folder: function (folder) {
            bootbox.prompt("Rename " + folder.title + " as", function(title) {
                if (!title) return;

                $.post("/folder_rename/", {"path": folder.path, "dir": folder.dir, "new_title": title}, function (data) {
                    var v = $.parseJSON(data),
                    old_title = folder.title;

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }

                    folder.title = title;

                    // Change attrs for files in this folder
                    $.each(folder.files, function (k, v) {
                        v.dir = v.dir.replace(old_title, title);
                        v.path = v.path.replace(old_title, title);
                    });

                    that.active.dir = folder.path;
                    that.dom.project.active.html(folder.path);
                    that.dom.project.tree.find(".folder-click[data-id='" + folder.id + "']").html(title); 
                    that.flash("Folder renamed");
                });
            });
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