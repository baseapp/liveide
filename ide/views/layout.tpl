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

    <script src="{{static_url}}/js/liveide.js"></script>

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

    <ul id="liveide-file-menu" class="dropdown-menu context-menu liveide-dropdownmenu" role="menu">
        <li><a tabindex="-1" href="#">Rename...</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#">Delete</a></li>
    </ul>

    <ul id="liveide-project-menu" class="dropdown-menu context-menu liveide-dropdownmenu" role="menu">
        <li><a tabindex="-1" href="#">New File</a></li>
        <li><a tabindex="-1" href="#">Rename...</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#">Delete Project</a></li>
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
                                <li><a href="#" class="liveide-file-save">Save</a></li>
                                <li><a href="#" class="liveide-file-rename">Rename...</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-file-remove">Delete File</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-file-close">Close File</a></li>
                            </ul>
                        </li>
                        
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">Edit</a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Undo</a></li>
                                <li><a href="#">Redo</a></li>
                                <li class="divider"></li>
                                <li><a href="#">Cut</a></li>
                                <li><a href="#">Copy</a></li>
                                <li><a href="#">Paste</a></li>
                                <li class="divider"></li>
                                <li><a href="#">Find</a></li>
                                <li><a href="#">Replace</a></li>
                            </ul>
                        </li>
                        
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">Project</a>
                            <ul class="dropdown-menu">
                                <li><a href="#" class="liveide-project-new">Create Project</a></li>
                                <li><a href="#">Open...</a></li>
                                <li><a href="#" class="liveide-project-rename">Rename...</a></li>
                                <li class="divider"></li>
                                <li><a href="#">Close Project</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-project-remove">Delete Project</a></li>
                                <li class="divider"></li>
                                <li><a href="#">Settings</a></li>
                            </ul>
                        </li>
                        
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">Help</a>
                            <ul class="dropdown-menu">
                                <li><a href="http://python.org/doc/" target=_blank>Python documentation</a></li>
                                <li class="divider"></li>
                                <li><a href="#" class="liveide-about">About LiveIDE</a></li>
                            </ul>
                        </li>
                        
                        <!-- <li>
                            <button type="submit" class="btn btn-inverse">
                                <i class="icon-file icon-white"></i>
                                New</button>                        
                        </li>
                        
                        <li>
                            <button type="submit" class="btn btn-inverse">
                                <i class="icon-hdd icon-white"></i>
                                Save
                            </button>                        
                        </li>
                        
                        <li>
                            <button type="submit" class="btn btn-inverse">
                                <i class="icon-play icon-white"></i> Run
                            </button>                        
                        </li>  -->
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
            <div class="ui-layout-south"></div>
        </div>

        <div class="ui-layout-west"> 

            <!--<div class="ba-open-files">
                <h3> Open Files </h3>
                <ul class="nav nav-pills nav-stacked">
                    <li>
                        <a href="#">Filesname.py</a></li>
                    <li><a href="#">main.py</a></li>
                </ul>    
            </div>
            -->

            <div class="css-treeview">
                <ul>
                    <li>
                        <input type="checkbox" id="projects-tree-0" checked /><label class="liveide-project" data-id="" for="projects-tree-0">Projects</label>
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