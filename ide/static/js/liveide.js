/*
    LiveIDE

    Online IDE for Python projects.
    Homepage and documentation: https://github.com/baseapp/liveide/

    Copyright (c) 2013, BaseApp, V. Sergeyev.
*/

(function(){
    var LiveIDE = {
        /* DOM manipulation */
        helpers: {
            /* Appends tree item into projects tree */
            render_project: function (v) {
                LiveIDE.dom.project.tree.append('<li class="liveide-project" data-id="' + v.id 
                    + '"><input type="checkbox" checked id="project-' + v.id + '" />' 
                    + '<label for="project-' + v.id + '">' + v.title + '</label><ul class="project-' + v.id + '"></ul></li>');

                $.each(v.files, function (i, f) {
                    LiveIDE.helpers.render_file(f);
                });
            },

            /* Remoes project item from projects tree */
            remove_project: function (id) {
                $(".liveide-project[data-id='" + id + "']").remove();
            },

            /* Appends file item into project tree */
            render_file: function (v) {
                if (v.project) {
                    $(".project-" + v.project).append('<li class="liveide-file" data-id="' + v.id 
                        + '" data-project="' + v.project + '">' + v.title + '</li>');
                } else {
                    LiveIDE.dom.project.tree.append('<li class="liveide-file" data-id="' + v.id 
                        + '">' + v.title + '</li>');
                }
            }
        },

        /* Layout.js init and DOM classes for UI controls to use by LiveIDE */
    	init_layout: function () {
    		var that = this;

    		this.editorLayout = $('.body-main').layout({ 
				west__size : 220,
				center__childOptions: {
					south__size : .20 ,	
					onresize : function() {
						that.editor.resize();
					}
				},
				onresize : function() {
					that.editor.resize();
				}
			});

    		// Selectors constants
			this.dom = {
                file: {
                    create: $(".liveide-file-new"),
                    save: $(".liveide-file-save"),
                    close: $(".liveide-file-close"),
                    tree_item: ".liveide-file"
                },

				project: {
                    active: $(".liveide-active-project"),
					create: $(".liveide-project-new"),
                    remove: $(".liveide-project-remove"),
					tree: $(".liveide-projects-tree"),
                    tree_item: ".liveide-project"
				}
			};
    	},

        /* Ace editor init */
    	init_editor: function () {
    		this.editor = ace.edit("editor");
			this.editor.setTheme("ace/theme/twilight");
			this.editor.getSession().setMode("ace/mode/python");
    	},

        /* Event handlers bindings */
        // TODO: consider to move to separate file
    	init_handlers: function () {
    		var that = this;

            /* File -> New File */
            this.dom.file.create.on("click", function (e) {
                e.preventDefault();

                var project = "",
                    title = prompt('New File name:', 'Untitled');

                // File can be assigned or not assigned to project
                if (that.active.project)
                    project = that.active.project.id;

                if (title) {
                    $.post("/file_create/", {"title": title, "project": project}, function (data) {
                        var v = $.parseJSON(data);

                        if (v.msg) {
                            alert(v.msg);
                            return;
                        }

                        if (that.active.project) // Push this file to list of project files
                            that.active.project.files[v.id] = v;
                        else // ... or, if no project specified - to list of user files not assigned to any project
                            that.files[v.id] = v;

                        that.helpers.render_file(v);
                    });
                }
            });

    		/* Project -> Create Project */
    		this.dom.project.create.on("click", function (e) {
    			e.preventDefault();

    			var title = prompt('New project title:', 'Untitled project');

    			if (title) {
    				$.post("/project_create/", {"title": title}, function (data) {
                        var v = $.parseJSON(data);

                        if (v.msg) {
                            alert(v.msg);
                            return;
                        }

                        that.projects[v.id] = v;
                        that.helpers.render_project(v);
    				});
    			}
    		});

            /* Project -> Remove Project */
            this.dom.project.remove.on("click", function (e) {
                e.preventDefault();

                if (that.active.project)
                    if (confirm("Project and it's files will be vanished. Do you want to continue?")) {
                        var id = that.active.project.id;

                        $.post("/project_remove/", {"id": id}, function (data) {
                            var v = $.parseJSON(data);

                            if (v.msg) {
                                alert(v.msg);
                                return;
                            }
                            
                            that.projects[id] = null;
                            that.helpers.remove_project(id);

                            alert("Project removed");
                        });

                        that.active.project = null;
                        that.dom.project.active.html("");
                    }
            });

            /* Click on project in tree - Select project as active */
            $(document).on("click", this.dom.project.tree_item, function (e) {
                //e.preventDefault();

                $(that.dom.project.tree_item).removeClass("active");
                $(that.dom.file.tree_item).removeClass("active");
                $(this).addClass("active");

                if ($(this).data("id")) {
                    that.active.project = that.projects[$(this).data("id")];
                    that.dom.project.active.html(that.active.project.title);
                } else {
                    // Root Projects tree item - mean no active project
                    that.active.project = null;
                    that.dom.project.active.html("");
                }
            });

            /* Click on file in tree - Open file */
            $(document).on("click", this.dom.file.tree_item, function (e) {
                //e.preventDefault();

                $(that.dom.project.tree_item).removeClass("active");
                $(that.dom.file.tree_item).removeClass("active");
                $(this).addClass("active");

                if ($(this).data("project")) {
                    that.active.project = that.projects[$(this).data("project")];
                    that.dom.project.active.html(that.active.project.title);

                    // TODO that.active.file = that.active.project.files[$(this).data("id")];
                } else {
                    that.active.project = null;
                    that.dom.project.active.html("");

                    // TODO that.active.file = that.files[$(this).data("id")];
                }
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

    		this.init_layout();
    		this.init_editor();
    		this.init_handlers();

            // Currently active Project / File
            this.active = {
                project: "",
                file: ""
            };

            // Loaded data
            // User projects
            this.projects = {};
            // Files without project
            this.files = {};

            this.load_projects();
            this.load_files();
    	}
    };
	
	this.LiveIDE = LiveIDE;
}).call(this);