%def header():
    <link href="{{static_url}}/css/layout.css" rel="stylesheet" media="screen">
    <link href="{{static_url}}/css/liveide.css" rel="stylesheet" media="screen">

    <script src="{{static_url}}/js/jquery.js"></script>
    <script src="{{static_url}}/js/jquery-ui.js"></script>
    <script src="{{static_url}}/js/bootstrap.js"></script>
    <script src="{{static_url}}/js/bootstrap-contextmenu.js"></script>
    <script src="{{static_url}}/js/bootbox.min.js"></script>
    <script src="{{static_url}}/js/layout.js"></script>
    <script src="{{static_url}}/js/ace/ace.js"></script>
    <script src="{{static_url}}/js/mousetrap.min.js"></script>

    <script src="{{static_url}}/js/liveide.js"></script>
    <script src="{{static_url}}/js/liveide-projects.js"></script>
    <script src="{{static_url}}/js/liveide-files.js"></script>
    <script src="{{static_url}}/js/liveide-handlers.js"></script>

    <script>
        $(document).ready(function () {
            LiveIDE.init({
                //
            });
        });
    </script>
%end

%def body():
    <div id="notification-box" class="alert alert-success alert-error hide">
        <a class="close" href="#" onclick="$('#notification-box').hide();return false;">&times;</a>
        <p></p>
    </div>

    <ul id="liveide-tree-menu" class="dropdown-menu context-menu liveide-dropdownmenu" role="menu">
        <li><a tabindex="-1" href="#" class="liveide-tree-refresh">Refresh</a></li>
    </ul>

    <ul id="liveide-file-menu" class="dropdown-menu context-menu liveide-dropdownmenu" role="menu">
        <li><a tabindex="-1" href="#" class="liveide-file-save-as">Rename...</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-file-remove">Delete</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-file-download">Download</a></li>
    </ul>

    <ul id="liveide-project-menu" class="dropdown-menu context-menu liveide-dropdownmenu" role="menu">
        <li><a tabindex="-1" href="#" class="liveide-file-new">New File</a></li>
        <li><a tabindex="-1" href="#" class="liveide-file-upload">Upload File</a></li>
        <li><a tabindex="-1" href="#" class="liveide-project-rename">Rename...</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-folder-new">New Folder</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-project-close">Close Project</a></li>
        <!--
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-project-remove">Delete Project</a></li>
        -->
    </ul>

    <ul id="liveide-folder-menu" class="dropdown-menu context-menu liveide-dropdownmenu" role="menu">
        <li><a tabindex="-1" href="#" class="liveide-file-new">New File</a></li>
        <li><a tabindex="-1" href="#" class="liveide-file-upload">Upload File</a></li>
        <li><a tabindex="-1" href="#" class="liveide-folder-rename">Rename...</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-folder-new">New Folder</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#" class="liveide-folder-remove">Delete Folder</a></li>
    </ul>
    
    <div class="header-top">    
        <div class="navbar navbar-fixed-top navbar-inverse row-fluid">
            <div class="sidebar">
                <a href="#" class="brand">BaseAPP LiveIDE</a>
            </div>
            <div class="liveide-menu navbar-inner">
                    <ul class="nav">
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">File</a>
                            <ul class="dropdown-menu">
                                <li><a href="#" class="liveide-file-new">New File</a></li>
                                <li><a href="#" class="liveide-folder-new">New Folder</a></li>
                                <li><a href="#" class="liveide-file-save">Save</a></li>
                                <li><a href="#" class="liveide-file-save-as">Save as...</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-file-download">Download</a></li>
                                <li><a href="#" class="liveide-file-upload">Upload</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-file-remove">Delete File</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-file-close">Close File</a></li>
                            </ul>
                        </li>
                        
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">Edit</a>
                            <ul class="dropdown-menu">
                                <li><a href="#" class="liveide-edit-command" data-id="undo">Undo</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="redo">Redo</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-edit-command" data-id="cut">Cut</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="copy">Copy</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="paste">Paste</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-edit-command" data-id="find">Find</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="findnext">Find Next</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="findprevious">Find Previous</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="replace">Replace</a></li>
                                <li><a href="#" class="liveide-edit-command" data-id="replaceall">Replace all</a></li>
                                <li class="divider"></li>
                                <li class="dropdown-submenu">
                                    <a href="#" class="liveide-edit-syntax">Syntax</a>
                                    <ul class="dropdown-menu">
                                        <li><a href="#" class="liveide-edit-syntax" data-id="python">Python</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="c_cpp">C</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="css">CSS</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="html">HTML</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="xml">XML</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="javascript">JavaScript</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="text">Text</a></li>
                                        <li><a href="#" class="liveide-edit-syntax" data-id="markdown">Markdown</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">Project</a>
                            <ul class="dropdown-menu">
                                <li><a href="#" class="liveide-project-new">Create Project</a></li>
                                <li class="dropdown-submenu">
                                    <a href="#" class="liveide-project-open">Open</a>
                                    <ul class="dropdown-menu">
                                        <!-- PLACEHOLDER FOR PROJECTS TO OPEN -->
                                    </ul>
                                </li>
                                <li><a href="#" class="liveide-project-rename">Rename...</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-project-close">Close Project</a></li>
                                <!--
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-project-remove">Delete Project</a></li>
                                -->
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-project-settings">Settings</a></li>
                            </ul>
                        </li>
                        
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">Help</a>
                            <ul class="dropdown-menu">
                                <li><a href="http://python.org/doc/" target=_blank>Python documentation</a></li>
                                <li class="divider"></li>
                                <li><a href="https://github.com/baseapp/liveide/" target=_blsnk>LiveIDE on GitHub</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-about">About LiveIDE</a></li>
                            </ul>
                        </li>
                        
                        <li>
                            <button class="btn btn-inverse liveide-file-new">
                                <i class="icon-file icon-white"></i>
                                New</button>                        
                        </li>
                        
                        <li>
                            <button class="btn btn-inverse liveide-file-save">
                                <i class="icon-hdd icon-white"></i>
                                Save
                            </button>                        
                        </li>
                        
                        <li>
                            <button class="btn btn-inverse liveide-file-run">
                                <i class="icon-play icon-white"></i> Run
                            </button>                        
                        </li>
                    </ul>
                    <div class="btn-group pull-right">
                        <a class="btn btn-inverse btn-username" href="#"><i class="icon-user icon-white"></i> {{user.email}}</a>
                        <a class="btn btn-inverse dropdown-toggle" data-toggle="dropdown" href="#"><span class="caret"></span></a>
                        <ul class="dropdown-menu">
                            <li><a href="/logout/">Logout</a></li>
                        </ul>
                    </div>
            </div>
        </div>
        <div class="liveide-tabs navbar-inverse navbar-tabs">
            <div class="sidebar liveide-active-project">&nbsp;</div>
            <div class="navbar-inner"> 
                <ul class="nav nav-tabs tabs-inverse liveide-tabs">
                    <!-- WRAPPER FOR EDITORS' TABS -->
                </ul>
            </div>
        </div>
    </div>
    <div class="body-main">
        <div class="ui-layout-center">
            <div class="ui-layout-center liveide-editors">
                <!-- WRAPPER FOR EDITOR INSTANCES -->
            </div>
            <div class="ui-layout-south liveide-console">
            </div>
        </div>

        <div class="ui-layout-west"> 
            <div class="css-treeview">
                <ul>
                    <li>
                        <input type="checkbox" id="projects-tree-0" checked /><label class="liveide-project" data-id="" data-context-menu="#liveide-tree-menu" for="projects-tree-0">My Projects</label>
                        <ul class="liveide-projects-tree">
                            <!-- WRAPPER FOR FINDER -->
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>        
%end

%include base header=header, body=body, static_url=static_url