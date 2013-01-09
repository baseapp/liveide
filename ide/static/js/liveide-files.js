/*
    LiveIDE
    File operations module.

    Online IDE for Python projects.
    Homepage and documentation: https://github.com/baseapp/liveide/

    Copyright (c) 2013, BaseApp, V. Sergeyev.
*/

(function(){
    var LiveIDE = this.LiveIDE || {},
        that = LiveIDE;

    /* File operations */
    LiveIDE.file = {
        /* Create */
        create: function () {
            bootbox.prompt("New file name", function(title) {
                if (!title) return;
                that.add_editor(null, title);
            });
        },

        /* Save new file */
        save_new: function (ed, close_on_success, run_on_success) {
            var content = ed.editor.getSession().getValue();

            $.post("/file_create/", {title: ed.title, project: ed.project ? ed.project.id : "", dir: ed.dir, content: content}, function (data) {
                var v = $.parseJSON(data);

                if (v.msg) {
                    that.flash(v.msg, true);
                    return;
                }
                
                v.id = ed.id; // this is one time ID, so no matter
                ed.file = v;
                ed.project = v.project ? that.projects[v.project] : null;
                that.dom.tabs.find("li[data-id='" + ed.id + "']").find("sup").html("");
                ed.modified = false;

                that.helpers.render_file(v);

                that.flash("File saved");

                if (close_on_success)
                    that.file.force_close(ed);

                if (run_on_success)
                    that.file.force_run(ed);
            });
        },

        /* Save new file as... */
        save_as_new: function (ed, close_on_success) {
            bootbox.prompt("Save " + ed.title + " as", function(title) {
                if (!title) return;

                var tab_title,
                    is_modified = ed.modified ? "*" : "";

                ed.title = title;
                tab_title = title;
                if (ed.project)
                    tab_title += ed.project.title;

                that.dom.tabs.find("li[data-id='" + ed.id + "']").find("a").html(tab_title + " <sup>" + is_modified + '</sup>');

                that.file.save_new(ed, close_on_success);
            });
        },

        /* Save existing file */
        save_existing: function (ed, close_on_success, run_on_success, new_title) {
            var content = ed.editor.getSession().getValue();

            $.post("/file_save/", {path: ed.file.path, dir: ed.file.dir, content: content, new_title: new_title}, function (data) {
                var v = $.parseJSON(data),
                    tab_title;

                if (v.msg) {
                    that.flash(v.msg, true);
                    return;
                }
                
                ed.file.content = content;
                that.dom.tabs.find("li[data-id='" + ed.file.id + "']").find("sup").html("");
                ed.modified = false;

                // If Save as...
                if (new_title) {
                    ed.title = new_title;
                    ed.file.title = new_title;
                    tab_title = new_title;
                    if (ed.file.dir)
                        tab_title += " - " + ed.file.dir;

                    that.dom.tabs.find("li[data-id='" + ed.id + "']").find("a").html(tab_title + " <sup></sup>");
                    $(that.dom.file.tree_item + "[data-id='" + ed.id + "']").html(new_title);
                }

                that.flash("File saved");

                if (close_on_success)
                    that.file.force_close(ed);

                if (run_on_success)
                    that.file.force_run(ed);
            });
        },

        /* Save existing file as... */
        save_as_existing: function (ed, close_on_success) {
            bootbox.prompt("Save " + ed.file.title + " as", function(title) {
                if (!title) return;
                that.file.save_existing(ed, close_on_success, false, title);
            });
        },

        /* Delete file */
        remove: function (file) {
            if (!file) return;

            bootbox.confirm(file.title + " will be vanished. Do you want to continue?", function(result) {
                if (!result) return;

                $("pre#" + that.dom.editor + file.id).remove();
                that.dom.tabs.find("li[data-id='" + file.id + "']").remove();
                that.editors[file.id] = null;

                $.post("/file_remove/", {path: file.path}, function (data) {
                    var v = $.parseJSON(data);

                    if (v.msg) {
                        that.flash(v.msg, true);
                        return;
                    }
                    
                    that.helpers.remove_file(file.id);
                    
                    if (file.project)
                        that.projects[file.project].files[file.id] = null
                    else
                        that.files[file.id] = null;

                    that.flash("File removed");
                });

                that.active.file = null;
            });
        },

        /* Close file (editor) */
        close: function (editor) {
            if (!editor) return;

            // TODO: add check if file was changed
            // File can be not saved at all.
            // In both cases we loose unsaved data

            if (editor.modified) {
                bootbox.confirm(editor.title + " modified. Save changes?", function(result) {
                    if (result) {
                        if (editor.file) // Existing file modified
                            that.file.save_existing(editor, true)
                        else // New file
                            that.file.save_new(editor, true);
                    } else
                        that.file.force_close(editor);
                });
            } else
                that.file.force_close(editor);
        },

        force_close: function (editor) {
            if (!editor) return;
            
            $("pre#" + editor.dom_id).remove();
            that.dom.tabs.find("li[data-id='" + editor.id + "']").remove();
            
            that.editors[editor.id] = null;

            that.active.editor = null;
            that.active.file = null;
        },

        run: function (editor) {
            if (!editor) return;
            
            if (editor.modified)
                bootbox.confirm("Save " + editor.title + " before run?", function(result) {
                    if (!result) {
                        // Run without saving
                        if (editor.file) // only if file on FS
                            that.file.force_run(editor);
                        return;
                    }

                    // Run after save succeed
                    if (editor.file)
                        that.file.save_existing(editor, false, true)
                    else
                        that.file.save_new(editor, false, true);
                });
            else
                that.file.force_run(editor);
        },

        force_run: function (editor) {
            if (!editor) return;

            $.get("/file_run/", {path: editor.file.path}, function (data) {
                    that.dom.console.append("<pre>" + data + "</pre>");
                    that.flash("Run complete");
                });
        }
    };    

    this.LiveIDE = LiveIDE;
}).call(this);