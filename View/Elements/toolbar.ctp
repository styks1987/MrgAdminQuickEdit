<div class="btn-toolbar" data-role="editor-toolbar" data-target="editor_<%= id %>">
      <!--<div class="btn-group">-->
      <!--  <a class="btn dropdown-toggle" data-toggle="dropdown" title="Font"><i class="icon-font"></i><b class="caret"></b></a>-->
      <!--    <ul class="dropdown-menu">-->
      <!--    </ul>-->
      <!--  </div>-->
      <!--<div class="btn-group">-->
      <!--  <a class="btn dropdown-toggle" data-toggle="dropdown" title="Font Size"><i class="icon-text-height"></i>&nbsp;<b class="caret"></b></a>-->
      <!--    <ul class="dropdown-menu">-->
      <!--    <li><a data-edit="fontSize 5"><font size="5">Huge</font></a></li>-->
      <!--    <li><a data-edit="fontSize 3"><font size="3">Normal</font></a></li>-->
      <!--    <li><a data-edit="fontSize 1"><font size="1">Small</font></a></li>-->
      <!--    </ul>-->
      <!--</div>-->
      <div class="btn-group">
        <a class="btn btn-default" data-edit="bold" title="Bold (Ctrl/Cmd+B)"><i class="glyphicon glyphicon-bold"></i></a>
        <a class="btn btn-default" data-edit="italic" title="Italic (Ctrl/Cmd+I)"><i class="glyphicon glyphicon-italic"></i></a>
        <!--<a class="btn btn-default" data-edit="underline" title="Underline (Ctrl/Cmd+U)"><i class="glyphicon glyphicon-underline"></i></a>-->
      </div>
      <div class="btn-group">
        <a class="btn btn-default" data-edit="insertunorderedlist" title="Bullet list"><i class="glyphicon glyphicon-list-alt"></i></a>
      </div>
      <div class="btn-group">
        <a class="btn btn-default" data-edit="justifyleft" title="Align Left (Ctrl/Cmd+L)"><i class="glyphicon glyphicon-align-left"></i></a>
        <a class="btn btn-default" data-edit="justifycenter" title="Center (Ctrl/Cmd+E)"><i class="glyphicon glyphicon-align-center"></i></a>
      </div>
      <div class="btn-group">
			<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="Hyperlink" id="link_dropdown__<%= id %>"><i class="glyphicon glyphicon-link"></i></button>
			<div class="dropdown-menu input-append" aria-labeledby="link_dropdown_<%= id %>">
				<input onclick="" placeholder="URL" type="text" data-edit="createLink"/>
				<button class="btn btn-primary" type="button">Add</button>
			</div>
      </div>
      <!--<div class="btn-group">-->
        <!--<a class="btn" data-edit="undo" title="Undo (Ctrl/Cmd+Z)"><i class="icon-undo"></i></a>-->
        <!--<a class="btn" data-edit="redo" title="Redo (Ctrl/Cmd+Y)"><i class="icon-repeat"></i></a>-->
      <!--</div>-->
</div>

