(function(){
    var LiveIDE = {
        helpers: {
            render_project: function (v) {
                LiveIDE.dom.project.tree.append('<li class="liveide-project" data-id="' + v.id 
                    + '"><input type="checkbox" checked id="project-' + v.id + '" />' 
                    + '<label for="project-' + v.id + '">' + v.title + '</label><ul></ul></li>');
            }
        },

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
				project: {
                    active: $(".liveide-active-project"),
					create: $(".liveide-project-new"),
					tree: $(".liveide-projects-tree"),
                    tree_item: ".liveide-project",
				}
			};
    	},

    	init_editor: function () {
    		this.editor = ace.edit("editor");
			this.editor.setTheme("ace/theme/twilight");
			this.editor.getSession().setMode("ace/mode/python");
    	},

    	init_handlers: function () {
    		var that = this;

    		/* Project -> Create Project */
    		this.dom.project.create.on("click", function (e) {
    			e.preventDefault();

    			var title = prompt('New project title:', 'Untitled project');

    			if (title) {
    				$.post("/project_create/", {"title": title}, function (data) {
                        var v = $.parseJSON(data);
                        that.projects[data.id] = v;
                        that.helpers.render_project(v);
    				});
    			}
    		});

            /* Click on project in tree - Select project as active */
            $(document).on("click", this.dom.project.tree_item, function (e) {
                e.preventDefault();

                that.active.project = that.projects[$(this).data("id")];
                that.dom.project.active.html(that.active.project.title);
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

    	init: function (params) {
            //$.ajaxSetup({ cache:false });

    		this.init_layout();
    		this.init_editor();
    		this.init_handlers();
            this.load_projects();

            // Currently active Project / File
            this.active = {
                project: "",
                file: ""
            };

            // Loaded data
            this.projects = {};
    	}
    };
	
	this.LiveIDE = LiveIDE;
}).call(this);