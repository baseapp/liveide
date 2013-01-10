/*
    LiveIDE

    Online IDE for Python projects.
    Homepage and documentation: https://github.com/baseapp/liveide/

    Copyright (c) 2013, BaseApp, V. Sergeyev.
*/

(function(){
    var LiveIDE = {
        about_text: "BaseApp LiveIDE v.0.02",

        /* Constants for DOM selectors */
        init_dom: function () {
            this.dom = {
                alert: $("#notification-box"), // Flashing alert box on top
                editor: "liveide-editor", // ID for ace-editor PRE
                editors: $(".liveide-editors"), // Wrapper for all editors
                tabs: $(".liveide-tabs"), // Wrapper for tabs
                console: $(".liveide-console"),
                file: {
                    create: $(".liveide-file-new"),
                    save: $(".liveide-file-save"),
                    save_as: $(".liveide-file-save-as"),
                    close: $(".liveide-file-close"),
                    remove: $(".liveide-file-remove"),
                    tree_item: ".liveide-file",
                    run: $(".liveide-file-run")
                },

                edit: {
                    command: $(".liveide-edit-command"),
                    syntax: $(".liveide-edit-syntax")
                },

                project: {
                    active: $(".liveide-active-project"),
                    create: $(".liveide-project-new"),
                    rename: $(".liveide-project-rename"),
                    remove: $(".liveide-project-remove"),
                    tree: $(".liveide-projects-tree"),
                    tree_item: ".liveide-project"
                },

                folder: {
                    create: $(".liveide-folder-new"),
                    rename: $(".liveide-folder-rename"),
                    remove: $(".liveide-folder-remove"),
                    tree_item: ".liveide-folder"
                },

                help: {
                    about: $(".liveide-about")
                }
            }
        },

        /* DOM manipulation */
        helpers: {
            // -- PROJECTS TREE -----------------------------------------------
            
            /* Appends project */
            render_project: function (v) {
                LiveIDE.dom.project.tree.append('<li class="liveide-project"><input type="checkbox" id="project-' + v.id + '" />'
                    + '<label data-context-menu="#liveide-project-menu" data-id="' + v.id + '" class="project-click" for="project-' + v.id + '">' + v.title + '</label><ul class="project-' + v.id
                    + '"></ul></li>');

                $(".project-click").contextmenu();

                v.files = {}; // rels to all files in project
                v.folders = {}; // rels to all folders in project
                $.each(v.tree, function (i, f) {
                    if (f.is_folder)
                        LiveIDE.helpers.render_folder(f)
                    else
                        LiveIDE.helpers.render_file(f);
                });
            },

            /* Removes project */
            remove_project: function (id) {
                $(".project-click[data-id='" + id + "']").parent().remove();
            },

            /* Appends file */
            render_file: function (v, parent) {
                if (v.project) {
                    var root = parent ? $(".folder-" + parent.id) : $(".project-" + v.project);
                        //folder_id = parent ? ' data-folder="' + parent.id + '"' : '';

                    if (parent) v.folder = parent;

                    LiveIDE.projects[v.project].files[v.id] = v;

                    root.append('<li class="liveide-file" data-id="' + v.id 
                        + '" data-project="' + v.project + '" data-context-menu="#liveide-file-menu">' + v.title + '</li>');
                } else {
                    LiveIDE.dom.project.tree.append('<li class="liveide-file" data-id="' + v.id 
                        + '" data-context-menu="#liveide-file-menu">' + v.title + '</li>');
                }

                $(".liveide-file").contextmenu();
            },

            /* Removes file */
            remove_file: function (id) {
                $(".liveide-file[data-id='" + id + "']").remove();
            },

            /* Appends folder */
            render_folder: function (v, parent) {
                var root = parent ? $(".folder-" + parent.id) : $(".project-" + v.project);

                LiveIDE.projects[v.project].folders[v.id] = v;

                root.append('<li class="liveide-folder"><input type="checkbox" id="folder-' + v.id + '" />'
                        + '<label data-context-menu="#liveide-folder-menu" data-id="' + v.id + '" data-project="' + v.project + '" data-path="' + v.path + '" class="folder-click" for="folder-' + v.id + '">'
                        + v.title + '</label><ul class="folder-' + v.id + '"></ul></li>');
                
                $(".folder-click").contextmenu();

                $.each(v.files, function (i, f) {
                    if (f.is_folder)
                        LiveIDE.helpers.render_folder(f, v)
                    else
                        LiveIDE.helpers.render_file(f, v);
                });
            },

            /* Removes folder */
            remove_folder: function (id) {
                $(".folder-click[data-id='" + id + "']").parent().remove();
            }
        },

        /* Shorthand for $.post() with alert on error */
        post: function (url, params, callback) {
            var that = this;

            $.post(url, params, function (data) {
                var v = $.parseJSON(data);

                if (v.msg) {
                    that.flash(v.msg, true);
                    return;
                }

                if (callback) callback(v);
            });
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
                is_modified = "", //file ? "" : "*",
                project,
                ed;

            // Project. For new file project is project active in tree
            if (file && file.project)
                project = this.projects[file.project]
            else
                project = that.active.project;

            tab_title = title;
            if (file && file.dir)
                tab_title += " - " + file.dir;

            this.dom.editors.append('<pre id="' + dom_id + '"></pre>');
            this.dom.tabs.append('<li class="active" data-id="' + id + '"><span class="close" data-id="' + id + '">&times;</span> <a href="#">' + tab_title + " <sup>" + is_modified + '</sup></a></li>');

            ed = {
                id: id,
                dom_id: dom_id,
                // file and project - for files already saved on FS
                file: file,
                project: project,
                // title and dir - counts for new file
                title: title,
                dir: dir,
                folder: that.active.folder,
                // ace editor object
                editor: ace.edit(dom_id),
                modified: false // file ? false : true
            };
            this.editors[id] = ed;

            ed.editor.setValue(content || "");

            ed.editor.getSession().on('change', function(e) {
                // // Cut event
                // if (e.data.action == "removeText")
                //    that.clipboardData = e.data.text; 

                ed.modified = true;
                that.dom.tabs.find("li[data-id='" + id + "']").find("sup").html("*");
            });

            // ed.editor.getSession().on('cut', function(text) {
            //     console.log(text)
            //     that.clipboardData = text;
            // });

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
            
            this.dom.editors.find("pre").css("z-index", "0");
            $("#" + this.dom.editor + id).css("z-index", "1");
            
            //ed.editor.focus();

            if (ed.file)
                this.active.file = ed.file;
            else
                this.active.file = null;

            this.active.project = ed.project ? this.projects[ed.project] : null;
            this.active.dir = ed.dir;
            this.active.folder = ed.folder;
            this.dom.project.active.html(this.active.dir);
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
                that.file.create();
            });

            /* File -> Save */
            this.dom.file.save.on("click", function (e) {
                var ed = that.active.editor;
                e.preventDefault();
                if (!ed) return;
                
                if (ed.file) // Existing file modified
                    that.file.save_existing(ed)
                else // New file
                    that.file.save_new(ed);
            });

            /* File -> Save as ... */
            this.dom.file.save_as.on("click", function (e) {
                e.preventDefault();

                var ed = that.active.editor;
                if (!ed) return;
                
                if (ed.file)
                    that.file.save_as_existing(ed)
                else
                    that.file.save_as_new(ed);
            });

            /* File -> Delete File */
            this.dom.file.remove.on("click", function (e) {
                e.preventDefault();
                that.file.remove(that.active.file);
            });

            /* File -> Close File */
            this.dom.file.close.on("click", function (e) {
                e.preventDefault();
                that.file.close(that.active.editor);
            });

            /* File -> Run */
            this.dom.file.run.on("click", function (e) {
                e.preventDefault();
                that.file.run(that.active.editor);
            });            

            /* -- MENU EDIT ------------------------------------------------ */

            this.dom.edit.command.on("click", function (e) {
                e.preventDefault();
                var id = $(this).data("id"),
                    ed = that.active.editor ? that.active.editor.editor : null;

                if (!ed) return;

                switch (id) {
                    case "undo":
                        ed.undo();
                        break;
                    case "redo":
                        ed.redo();
                        break;
                    case "cut":
                        that.clipboardData = ed.getCopyText();
                        ed.commands.commands.cut.exec(ed);
                        break;
                    case "copy":
                        that.clipboardData = ed.getCopyText();
                        break;
                    case "paste":
                        ed.insert(that.clipboardData, true);
                        break;
                    case "find":
                        ed.commands.commands.find.exec(ed);
                        break;
                    case "findnext":
                        ed.commands.commands.findnext.exec(ed);
                        break;
                    case "findprevious":
                        ed.commands.commands.findprevious.exec(ed);
                        break;
                    case "replace":
                        ed.commands.commands.replace.exec(ed);
                        break;
                    case "replaceall":
                        ed.commands.commands.replaceall.exec(ed);
                        break;
                }
            });

            this.dom.edit.syntax.on("click", function (e) {
                e.preventDefault();
                if (that.active.editor)
                    that.active.editor.editor.getSession().setMode("ace/mode/" + $(this).data("id"));
            });

            /* -- MENU PROJECT --------------------------------------------- */

    		/* Project -> Create Project */
    		this.dom.project.create.on("click", function (e) {
    			e.preventDefault();
    			that.project.create();
    		});

            /* Project -> Rename... */
            this.dom.project.rename.on("click", function (e) {
                e.preventDefault();
                if (that.active.project)
                    that.project.rename(that.active.project);
            });

            /* Project -> Delete Project */
            this.dom.project.remove.on("click", function (e) {
                e.preventDefault();
                if (that.active.project)
                    that.project.remove(that.active.project);
            });

            /* Folder -> New */
            this.dom.folder.create.on("click", function (e) {
                e.preventDefault();
                if (that.active.project)
                    that.project.create_folder(that.active.project, that.active.folder);
            });

            /* Folder -> Rename */
            this.dom.folder.rename.on("click", function (e) {
                e.preventDefault();
                if (that.active.folder)
                    that.project.rename_folder(that.active.folder);
            });

            /* Folder -> Remove */
            this.dom.folder.remove.on("click", function (e) {
                e.preventDefault();
                if (that.active.folder)
                    that.project.remove_folder(that.active.folder);
            });

            /* -- MENU HELP ------------------------------------------------ */
            
            /* Help -> About */
            this.dom.help.about.on("click", function (e) {
                e.preventDefault();

                bootbox.alert(that.about_text);
            });

            /* -- DOM ------------------------------------------------------ */
            
            /* Project -> Click */
            /* Click on project in tree - Select project as active */
            $(document).on("click", this.dom.project.tree_item + " label.project-click", that.handle.project_click);

            /* Folder -> Click */
            /* Click on folder in tree - Select folder and it's project as active */
            $(document).on("click", this.dom.folder.tree_item + " label.folder-click", that.handle.folder_click);

            /* File -> Click */
            /* Click on file in tree - Open file */
            $(document).on("click", this.dom.file.tree_item, that.handle.file_click);

            /* Click on tab - switch editor */
            this.dom.tabs.on("click", "li", that.handle.focus_editor);

            /* Click on Close tab - close editor */
            this.dom.tabs.on("click", ".close", that.handle.close_editor);

            // TODO: find a better way to track Cut event in editor
            $(document).on("cut", ".liveide-editors", function (e) {
                var t = that.active.editor.editor.getSession().$undoManager.$undoStack;
                that.clipboardData = t[t.length-1][0].deltas[0].text;
                //console.log(that.clipboardData);
            });

            $(document).on("copy", ".liveide-editors", function (e) {
                that.clipboardData = that.active.editor.editor.getCopyText();
                //console.log(that.clipboardData);
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
            this.params = params || {};

            this.init_dom();

            // Open ace editor instances
            // hash key is ID of open file
            this.editors = {};

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
                // folder object
                folder: "",
                // editor object, ace aditor is `editor` property of editor
                editor: null
            };

            // Loaded data
            // User projects
            this.projects = {};
            // Files without project
            this.files = {};

            this.clipboardData = "";

            if (this.params.is_test) return true;

            // Load data
            this.init_layout();
            this.init_handlers();
            this.load_projects();
            this.load_files();
            this.add_editor(null, 'Untitled') //, 'print "Hello World!"');            

            return true;
    	}
    };
	
	this.LiveIDE = LiveIDE;
}).call(this);