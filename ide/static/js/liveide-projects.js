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
    }
    
    this.LiveIDE = LiveIDE;
}).call(this);