%def header():
    <link href="{{static_url}}/css/layout.css" rel="stylesheet" media="screen">
    <link href="{{static_url}}/css/liveide.css" rel="stylesheet" media="screen">

    <script src="{{static_url}}/js/jquery.js"></script>
    <script src="{{static_url}}/js/jquery-ui.js"></script>
    <script src="{{static_url}}/js/bootstrap.js"></script>
    <script src="{{static_url}}/js/layout.js"></script>
    <script src="{{static_url}}/js/ace/ace.js"></script>

    <script src="{{static_url}}/js/custom.js"></script>
%end

%def body():
    <div class="header-top">    
        <div class="navbar navbar-fixed-top navbar-inverse row-fluid">
            <div class="sidebar">
                <a href="#" class="brand">BaseAPP LiveIDE</a>
            </div>
            <div class="navbar-inner"> 
                    <ul class="nav">
                        <li class="divider-vertical"></li>
                        <li><a href="#">File</a></li>
                        <li class="divider-vertical"></li>
                        <li><a href="#">Project</a></li>
                        <li class="divider-vertical"></li>
                        <li><a href="">Edit</a></li>
                        <li class="divider-vertical"></li>
                        <li><a href="#">Help</a></li>
                        
                        
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

            </div>
        </div>
        <div class="navbar navbar-fixed-top navbar-inverse navbar-tabs">
            <div class="navbar-inner">
            </div>
        </div>
    </div>
    <div class="body-main">
        <div class="ui-layout-center">
            <div class="ui-layout-center">
                <pre id="editor">print "hello world"</pre>
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

            <div class="ba-project-tree">
                <h3> Project </h3>
            </div>
        </div>
    </div>        
%end

%include base header=header, body=body, static_url=static_url