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
    <script src="{{static_url}}/js/liveide-projects.js"></script>
    <script src="{{static_url}}/js/liveide-files.js"></script>
    <script src="{{static_url}}/js/liveide-handlers.js"></script>

    <link rel="stylesheet" type="text/css" href="{{static_url}}/css/qunit-1.10.0.css" />
    <script src="{{static_url}}/js/qunit-1.10.0.js"></script>

    <script>
        $(document).ready(function () {
            module( "LiveIDE object" );
            test( "LiveIDE object", function() {
                ok(window.LiveIDE, "LiveIDE ok");

                ok(window.LiveIDE.init({is_test: true}), "LiveIDE Init ok");

                // After init MPango object shoud have several properties initializated
                ok(window.LiveIDE.projects, "LiveIDE Projects ok");
                ok(window.LiveIDE.files, "LiveIDE Files ok");
                ok(window.LiveIDE.dom, "LiveIDE DOM ok");
            });
        });
    </script>
%end

%def body():
    <div class="container">
        <h1>Tests</h1>

        <div id="qunit"></div>
    </div>
%end

%include base header=header, body=body, static_url=static_url