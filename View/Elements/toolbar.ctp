<div class="btn-toolbar" data-role="editor-toolbar" data-target="editor_<?php echo $field_name; ?>_<%= id %>">
      <div class="btn-group">
        <a class="btn btn-primary dropdown-toggle" data-toggle="dropdown" title="Font Style">Font Style <b class="caret"></b></a>
          <ul class="dropdown-menu">
			<li><a data-edit="formatBlock p"><p>paragraph</p></a></li>
			<li><a data-edit="formatBlock h1"><h1>h1</h1></a></li>
			<li><a data-edit="formatBlock h2"><h2>h2</h2></a></li>
			<li><a data-edit="formatBlock h3"><h3>h3</h3></a></li>
			<li><a data-edit="formatBlock h4"><h4>h4</h4></a></li>
          </ul>
      </div>
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
	  <div class="btn-group">
		<a class="btn btn-default" title="" id="pictureBtn" data-original-title="Insert picture (or just drag &amp; drop)"><i class="glyphicon glyphicon-picture"></i></a>
        <input type="file" data-role="magic-overlay" data-target="#pictureBtn" data-edit="insertImage" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 37px; height: 30px;">
      </div>
      <!--<div class="btn-group">-->
        <!--<a class="btn" data-edit="undo" title="Undo (Ctrl/Cmd+Z)"><i class="icon-undo"></i></a>-->
        <!--<a class="btn" data-edit="redo" title="Redo (Ctrl/Cmd+Y)"><i class="icon-repeat"></i></a>-->
      <!--</div>-->
</div>

