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
        save_new: function (ed, close_on_success) {
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
            });
        },

        /* Save existing file */
        save_existing: function (ed, close_on_success) {
            var content = ed.editor.getSession().getValue();

            $.post("/file_save/", {path: ed.file.path, content: content}, function (data) {
                var v = $.parseJSON(data);

                if (v.msg) {
                    that.flash(v.msg, true);
                    return;
                }
                
                ed.file.content = content;
                that.dom.tabs.find("li[data-id='" + ed.file.id + "']").find("sup").html("");
                ed.modified = false;

                that.flash("File saved");

                if (close_on_success)
                    that.file.force_close(ed);
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
        }
    };    

    this.LiveIDE = LiveIDE;
}).call(this);