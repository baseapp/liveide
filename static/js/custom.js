$(document).ready(function () {
	var editorLayout = $('.body-main').layout({ 
		west__size : 220,
		center__childOptions: {
			south__size : .20 ,	
			onresize : function() {
			editor.resize();
		}
		},
		onresize : function() {
			editor.resize();
		}
	});

	// remove the borders
	/*for(property in editorLayout.panes){
     	editorLayout.panes[property].css('border', 'none');
	}*/
	//editorLayout.panes.center.css('padding','none');

	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/twilight");
	editor.getSession().setMode("ace/mode/python");

});



