/*
    LiveIDE

    Online IDE for Python projects.
    Homepage and documentation: https://github.com/baseapp/liveide/

    Copyright (c) 2013, BaseApp, V. Sergeyev.
*/

(function(){
    var LiveIDE = {
        /* Constants for DOM selectors */
        init_dom: function () {
            this.dom = {
                alert: $("#notification-box"), // Flashing alert box on top
                editor: "liveide-editor", // ID for ace-editor PRE
                editors: $(".liveide-editors"), // Wrapper for all editors
                tabs: $(".liveide-tabs"), // Wrapper for tabs
                file: {
                    create: $(".liveide-file-new"),
                    save: $(".liveide-file-save"),
                    close: $(".liveide-file-close"),
                    remove: $(".liveide-file-remove"),
                    tree_item: ".liveide-file"
                },

                project: {
                    active: $(".liveide-active-project"),
                    create: $(".liveide-project-new"),
                    remove: $(".liveide-project-remove"),
                    tree: $(".liveide-projects-tree"),
                    tree_item: ".liveide-project"
                },

                help: {
                    about: $(".liveide-about")
                }
            }
        },

        /* DOM manipulation */
        helpers: {
            /* Appends tree item into projects tree */
            render_project: function (v) {
                LiveIDE.dom.project.tree.append('<li class="liveide-project" data-id="' + v.id 
                    + '" data-context-menu="#liveide-project-menu"><input type="checkbox" checked id="project-' + v.id + '" />' 
                    + '<label for="project-' + v.id + '">' + v.title + '</label><ul class="project-' + v.id + '"></ul></li>');

                $(".liveide-project").contextmenu();

                $.each(v.files, function (i, f) {
                    LiveIDE.helpers.render_file(f);
                });
            },

            /* Removes project item from projects tree */
            remove_project: function (id) {
                $(".liveide-project[data-id='" + id + "']").remove();
            },

            /* Appends file item into project tree */
            render_file: function (v) {
                if (v.project) {
                    $(".project-" + v.project).append('<li class="liveide-file" data-id="' + v.id 
                        + '" data-project="' + v.project + '" data-context-menu="#liveide-file-menu">' + v.title + '</li>');
                } else {
                    LiveIDE.dom.project.tree.append('<li class="liveide-file" data-id="' + v.id 
                        + '" data-context-menu="#liveide-file-menu">' + v.title + '</li>');
                }

                $(".liveide-file").contextmenu();
            },

            /* Removes file item from projects tree */
            remove_file: function (id) {
                $(".liveide-file[data-id='" + id + "']").remove();
            },
        },

        /* Show notification box in header */
        flash: function(msg, err) {
            if (err)
                this.dom.alert.addClass("alert-error")
            else
                this.dom.alert.removeClass("alert-error");

            this.dom.alert.find("p").html(msg);
            this.dom.alert.show();
        },

        /* Layout.js init and DOM classes for UI controls to use by LiveIDE */
    	init_layout: function () {
    		var that = this;

    		this.editorLayout = $('.body-main').layout({ 
				west__size : 220,
				center__childOptions: {
					south__size : .20 ,	
					onresize : function() {
                        if (that.active.editor)
						  that.active.editor.editor.resize();
					}
				},
				onresize : function() {
                    if (that.active.editor)
					   that.active.editor.editor.resize();
				}
			});
    	},

        /* Add ace editor instance, open file or given content in it */
    	add_editor: function (file, title, content) {
            // Param `file` can be empty,
            // this means file not was saved/don't persists on FS
            // For those files temp id will be with `-` prefix.

            var that = this,
                id = file ? file.id : "-" + (new Date).getTime(),
                title = file ? file.title : title, //"Untitled",
                dir = file ? file.dir : that.active.dir,
                dom_id = this.dom.editor + id,
                tab_title,
                is_modified = file ? "" : "*",
                project,
                ed;

            // Project. For new file project is project active in tree
            if (file && file.project)
                project = this.projects[file.project]
            else
                project = that.active.project;

            tab_title = title;
            if (project)
                tab_title += " - " + project.title;

            this.dom.editors.append('<pre id="' + dom_id + '"></pre>');
            this.dom.tabs.append('<li class="active" data-id="' + id + '"><a href="#">' + tab_title + " <sup>" + is_modified + '</sup></a></li>');

            ed = {
                id: id,
                dom_id: dom_id,
                // file and project - for files already saved on FS
                file: file,
                project: project,
                // title and dir - counts for new file
                title: title,
                dir: dir,
                // ace editor object
                editor: ace.edit(dom_id),
                modified: file ? false : true
            };
            this.editors[id] = ed;

            ed.editor.setValue(content || "");

            ed.editor.getSession().on('change', function(e) {
                ed.modified = true;
                that.dom.tabs.find("li[data-id='" + id + "']").find("sup").html("*");
            });

			ed.editor.setTheme("ace/theme/twilight");
			ed.editor.getSession().setMode("ace/mode/python");
            ed.editor.resize();

            // Switch to this editor
            this.active.editor = ed;
            this.focus_editor(id);
    	},

        /* Activate given editor instance in UI */
        focus_editor: function (id) {
            var ed = this.editors[id];

            this.active.editor = ed;

            this.dom.tabs.find("li").removeClass("active");
            this.dom.tabs.find("li[data-id='" + id + "']").addClass("active");
            
            this.dom.editors.find("pre").hide();
            $("#" + this.dom.editor + id).show();
            
            //ed.editor.focus();

            this.active.project = null;
            this.active.dir = "";

            if (ed.file) {
                // File from FS
                this.active.file = ed.file;

                if (ed.file.project) {
                    this.active.project = this.projects[ed.file.project];
                    this.active.dir = this.active.project.title;
                }
            } else {
                // Not persistent on FS file
                this.active.file = null;

                if (ed.project) {
                    this.active.project = this.projects[ed.project];
                    this.active.dir = this.active.project.title;
                }
            }

            if (this.active.project)
                this.dom.project.active.html(this.active.project.title)
            else
                this.dom.project.active.html("");
        },

        /* Event handlers bindings */
        // TODO: consider to move to separate file
    	init_handlers: function () {
    		var that = this;

            // Hide alert in 10 seconds
            setInterval(function() {
                $('#notification-box').fadeOut("slow");
            }, 10000);

            /* -- MENU FILE ------------------------------------------------ */

            /* File -> New File */
            this.dom.file.create.on("click", function (e) {
                e.preventDefault();

                // var project = "",
                //     title = 'Untitled'; //prompt('New File name:', 'Untitled');

                bootbox.prompt("New file name", function(title) {
                    if (!title) return;
                    that.add_editor(null, title);
                });
            });

            /* File -> Save */
            this.dom.file.save.on("click", function (e) {
                e.preventDefault();

                if (that.active.editor) {
                    var ed = that.active.editor,
                        content;
                    
                    content = ed.editor.getSession().getValue();

                    if (ed.file) // Existing file modified
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
                        })
                    else // New file
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
                        });
                }
            });

            /* File -> Delete File */
            this.dom.file.remove.on("click", function (e) {
                e.preventDefault();

                if (that.active.file)
                    bootbox.confirm(that.active.file.title + " will be vanished. Do you want to continue?", function(result) {
                        if (!result) return;

                        var file = that.active.file;

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
            });

            /* File -> Close File */
            this.dom.file.close.on("click", function (e) {
                e.preventDefault();

                if (that.active.editor) {
                    // TODO: add check if file was changed
                    // File can be not saved at all.
                    // In both cases we loose unsaved data

                    var editor = that.active.editor;

                    $("pre#" + editor.dom_id).remove();
                    that.dom.tabs.find("li[data-id='" + editor.id + "']").remove();
                    
                    that.editors[editor.id] = null;

                    that.active.editor = null;
                    that.active.file = null;
                }
            });

            /* -- MENU PROJECT --------------------------------------------- */

    		/* Project -> Create Project */
    		this.dom.project.create.on("click", function (e) {
    			e.preventDefault();

    			var title = 'Untitled project'; //prompt('New project title:', 'Untitled project');

                bootbox.prompt("New file name", function(result) {                
                    if (!result) return;

                    title = result;

    				$.post("/project_create/", {"title": title}, function (data) {
                        var v = $.parseJSON(data);

                        if (v.msg) {
                            that.flash(v.msg, true);
                            return;
                        }

                        that.projects[v.id] = v;
                        that.helpers.render_project(v);
    				});
    			});
    		});

            /* Project -> Delete Project */
            this.dom.project.remove.on("click", function (e) {
                e.preventDefault();

                if (that.active.project)
                    bootbox.confirm(that.active.project.title + " and it's files will be vanished. Do you want to continue?", function(result) {
                        if (!result) return;

                        var id = that.active.project.id;

                        $.post("/project_remove/", {"id": id}, function (data) {
                            var v = $.parseJSON(data);

                            if (v.msg) {
                                that.flash(v.msg, true);
                                return;
                            }
                            
                            that.projects[id] = null;
                            that.helpers.remove_project(id);

                            that.flash("Project removed");
                        });

                        that.active.project = null;
                        that.active.dir = "";
                        that.dom.project.active.html("");
                    });
            });

            /* Help -> About */
            this.dom.help.about.on("click", function (e) {
                e.preventDefault();

                bootbox.alert("BaseApp LiveIDE v.0.01");
            });

            /* -- DOM ------------------------------------------------------ */
            
            /* Project -> Click */
            /* Click on project in tree - Select project as active */
            $(document).on("click", this.dom.project.tree_item, function (e) {
                //e.preventDefault();

                if ($(this).data("id")) {
                    that.active.project = that.projects[$(this).data("id")];
                    that.active.dir = that.active.project.title;
                    that.dom.project.active.html(that.active.project.title);
                } else {
                    // Root Projects tree item - mean no active project
                    that.active.project = null;
                    that.active.dir = "";
                    that.dom.project.active.html("");
                }
            });

            /* File -> Click */
            /* Click on file in tree - Open file */
            $(document).on("click", this.dom.file.tree_item, function (e) {
                //e.preventDefault();

                var id = $(this).data("id"),
                    file;

                if ($(this).data("project")) {
                    that.active.project = that.projects[$(this).data("project")];
                    that.active.dir = that.active.project.title;
                    that.dom.project.active.html(that.active.project.title);

                    file = that.active.project.files[id];
                } else {
                    that.active.project = null;
                    that.active.dir = "";
                    that.dom.project.active.html("");

                    file = that.files[id];
                }

                that.active.file = file;
                that.active.dir = that.active.file.dir;

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
            });

            /* Click on tab - switch editor */
            this.dom.tabs.on("click", "li", function(e) {
                e.preventDefault();

                that.focus_editor($(this).data("id"));
            });
    	},

        load_projects: function () {
            var that = this;

            $.getJSON("/projects/", {}, function (data) {
                $.each(data, function (i, v) {
                    that.projects[v.id] = v;
                    that.helpers.render_project(v);
                });
            });
        },

        load_files: function () {
            var that = this;

            $.getJSON("/files/", {}, function (data) {
                $.each(data, function (i, v) {
                    that.files[v.id] = v;
                    that.helpers.render_file(v);
                });
            });
        },

    	init: function (params) {
            //$.ajaxSetup({ cache:false });

            this.init_dom();

            // Open ace editor instances
            // hash key is ID of open file
            this.editors = {};

    		this.init_layout();
    		this.init_handlers();

            // Currently active Project / Dir / File / Editor
            this.active = {
                // project object, with core dir, ex. "myproject"
                project: "",
                // dir is relative path from user root, ex. "myproject",
                // "myproject/myfolder", "myproject/myfolder/folder2"
                // dir include active project name too
                dir: "",
                // file object
                file: "",
                // editor object, ace aditor is `editor` property of editor
                editor: null
            };

            // Loaded data
            // User projects
            this.projects = {};
            // Files without project
            this.files = {};

            this.load_projects();
            this.load_files();

            this.add_editor(null, 'Untitled', 'print "Hello World!"');
    	}
    };
	
	this.LiveIDE = LiveIDE;
}).call(this);