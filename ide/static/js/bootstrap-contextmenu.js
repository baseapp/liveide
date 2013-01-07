/* ============================================================
 * bootstrap-contextmenu.js
 * http://
 * ============================================================
 * Copyright 2012 Nikolai Fedotov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function ($) {

  "use strict"; // jshint ;_;


 /* CONTEXTMENU CLASS DEFINITION
  * ========================= */

  var ContextMenu = function (element) {
        $(element).on('contextmenu.context-menu.data-api', this.show)
	$('html').on('click.context-menu.data-api', clearMenus)
      }

  ContextMenu.prototype = {

    constructor: ContextMenu

  , show: function (e) {
      var $this = $(this);

      if ($this.is('.disabled, :disabled')) return
      
      clearMenus()
      $($this.data('context-menu'))
	.data('e',e)
	.css('position','fixed')
	.css('left',e.clientX)
	.css('top',e.clientY)
	.css('display','block')      

      return false
    }

  }

  function clearMenus() {
    $('.context-menu')
      .css('display','none')
      .data('e',undefined)
  }


  /* CONTEXTMENU PLUGIN DEFINITION
   * ========================== */

  $.fn.contextmenu = function (option) {
    return this.each(function () {
      var $this = $(this)
      if (!$this.data('context-menu-obj')) $this.data('context-menu-obj', new ContextMenu(this))
    })
  }

  $.fn.contextmenu.Constructor = ContextMenu

}(window.jQuery);