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
                    var v = $.parseJSON(data);

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }

                    project.title = title;
                    that.dom.project.tree.find("li[data-id='" + project.id + "']").find("label").html(title); 
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
                that.dom.project.active.html("");
            });
        },

        create_folder: function (project, dir) {
            bootbox.prompt("New folder name", function(title) {
                if (!title) return;
                
                that.post("/folder_create/", {"id": project.id, "title": title, "dir": dir}, function (v) {
                    that.helpers.render_folder(v);
                    that.flash("Folder created");
                });
            });
        },
    }
    
    this.LiveIDE = LiveIDE;
}).call(this);