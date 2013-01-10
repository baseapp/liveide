/*
    LiveIDE
    DOM events handlers.

    Online IDE for Python projects.
    Homepage and documentation: https://github.com/baseapp/liveide/

    Copyright (c) 2013, BaseApp, V. Sergeyev.
*/

(function(){
    var LiveIDE = this.LiveIDE || {},
        that = LiveIDE;

    /* Project operations */
    LiveIDE.handle = {
    	project_click: function (e, $th) {
            //e.preventDefault();
            var $this = $th || $(this);

            if ($this.data("id")) {
                that.active.project = that.projects[$this.data("id")];
                that.active.dir = that.active.project.title;
                that.active.folder = null;
                that.dom.project.active.html(that.active.project.title);
            } else {
                // Root Projects tree item - mean no active project
                that.active.project = null;
                that.active.dir = "";
                that.active.folder = null;
                that.dom.project.active.html("");
            }
        },

        folder_click: function (e, $th) {
            //e.preventDefault();
            var $this = $th || $(this);

            that.active.project = that.projects[$this.data("project")];
            that.active.dir = $this.data("path");
            that.active.folder = that.active.project.folders[$this.data("id")];
            that.dom.project.active.html(that.active.dir);

            //return false;
        },

        file_click: function (e, $th) {
            //e.preventDefault();
            var id,
                file,
                $this = $th || $(this);
            id = $this.data("id");

            $(that.dom.file.tree_item).removeClass("active");
            $this.addClass("active");

            if ($this.data("project")) {
                that.active.project = that.projects[$this.data("project")];
                file = that.active.project.files[id];
            } else {
                that.active.project = null;
                file = that.files[id];
            }

            that.active.dir = file.dir;
            that.active.folder = file.folder;
            that.active.file = file;
            that.dom.project.active.html(that.active.dir);

            if (!that.editors[id]) {
                if (file.content)
                    that.add_editor(file, file.title, file.content)
                else
                    $.get("/file_content/", {path: file.path}, function (data) {
                        file.content = data;
                        that.add_editor(file, file.title, file.content)
                    })
            } else
                that.focus_editor(id);

            return false;
        },

        focus_editor: function(e) {
            e.preventDefault();

            $(that.dom.file.tree_item).removeClass("active");
            $(that.dom.file.tree_item + "[data-id='" + $(this).data("id") + "']").addClass("active");

            that.focus_editor($(this).data("id"));
        },

        close_editor: function(e) {
            e.preventDefault();
            that.file.close(that.editors[$(this).data("id")]);

            return false; // stop propagating event to underlying el (tab)
        }
    }
	

	this.LiveIDE = LiveIDE;
}).call(this);