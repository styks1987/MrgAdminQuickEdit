<?php
	App::uses('Helper', 'View');
	class MrgAdminQuickEditHelper extends AppHelper{

		var $helpers = ['Html'];
		// Options for the backbone view
		var $options = [];
		var $model;
		var $data;
		var $fields;


		public function table_edit($url_root, $fields, $data=[], $model){
			$this->_set_model($model);
			$this->_set_fields($fields);
			$this->_set_data($data);
			$this->_set_options();
			$this->_get_field_defaults();

			echo $this->Html->div('', '', ['id'=>'edit_region']);

			echo $this->_create_model_template();
			echo $this->_create_model_file_template();
			echo $this->_create_collection_template();

			echo $this->Html->scriptBlock(
				"var options = ".json_encode($this->options).";\n".
				"var edit_list = ".json_encode($this->data).";".
				"var urlRoot = '".$url_root."';".
				"var model_name = '".$this->model->name."';".
				"var model_defaults = ".json_encode($this->defaults).";"
			);

			// This has to be loaded last
			echo $this->Html->script('MrgAdminQuickEdit.jquery.filedrop');
			echo $this->Html->script('MrgAdminQuickEdit.quick_edit_app');


		}

		private function _set_model($model){
			App::import('Model',$model);
			$this->model = new $model();
		}

		private function _set_fields($fields){
			$this->fields = $fields;
		}

		private function _set_data($data){
			$this->data = [];
			foreach($data as $item){
				foreach($this->model->getAssociated() as $assoc=>$type){
					if(!empty($item[$assoc]));
					$item[$this->model->name][$assoc] = $item[$assoc];
				}

				$this->data[] = $item[$this->model->name];
			}
		}

		private function _set_options(){
			$this->options['fields'] = $this->fields;

		}

		private function _get_field_defaults(){
			//{ id:null, NewsCategory:{id:1},    title:"The first title",published:0,, model:model_name, news_category_id:1, published_date : null};
			//{"id":null,"NewsCategory":{"id":1},"title":null,"author":null,"published":null,"published_date":null,"news_category_id":1,"model":"News"}
			$this->defaults = [];
			foreach($this->fields as $field){
				$this->defaults[$field] = null;
			}

			$this->defaults['model'] = $this->model->name;
		}


		/**
		 * create the template for a single item
		 *
		 * Date Added: Tue, Jun 24, 2014
		 */

		private function _create_model_template($template_id = 'EditViewTemplate'){
			// Build the template that is going to be used by backbone.
			foreach($this->fields as $field){
				$contentEditable = ($this->model->primaryKey == $field) ? "false" : "true";
				$field_input = $this->_get_input($field);
				$row_fields[] = $this->Html->tag('td', '<span contentEditable="'.$contentEditable.'" data-field="'.$field.'">'.$field_input.'</span>');
			}

			$row_fields[] = $this->Html->tag('td',
				$this->Html->link('', 'javascript:void(0)', ['class'=>'glyphicon glyphicon-trash delete'])." | ".
				$this->Html->link('', 'javascript:void(0)', ['class'=>'glyphicon glyphicon-picture attachment'])
			);

			$this->fields[] = 'Actions';

			$row = implode($row_fields);

			return $this->Html->tag('script', $row, ['type'=>'text/template', 'id'=>$template_id]);
		}

		/**
		 * create a template for the attachment of a model
		 *
		 * Date Added: Wed, Jun 25, 2014
		 */
		private function _create_model_file_template($template_id = 'EditFileViewTemplate'){
			$row =	$this->Html->tag('td',
						'<% if(typeof Image.thumb == "string") {%>'.
							'<img width=192 src="<%= Image.thumb %>" /> <a href="javascript:void(0)" class="glyphicon glyphicon-trash delete_file"></a>'.
						'<% }else {%>'.
							'<div id="dropbox_<%= id %>" style="text-align:center; padding:20px;width:500px; height:50px; border:dotted 1px #444;">Drop Images Here</div>'.
						'<% } %>',
						['colspan'=>count($this->fields)]
					);
			return $this->Html->tag('script', $row, ['type'=>'text/template', 'id'=>$template_id]);
		}


		/**
		 * create the template for all the models
		 *
		 * Date Added: Tue, Jun 24, 2014
		 */

		private function _create_collection_template($template_id = 'EditViewCollectionTemplate'){
			$table = $this->Html->row([
				[
					'col-sm-2 pull-right',
					$this->Html->link('Add New', 'javascript:void(0)', ['id'=>'add_new', 'class'=>'btn btn-primary', 'style'=>'margin-bottom:20px;'])
				]
			]);

			$table .= $this->Html->row([
				[
					'col-sm-12',
					$this->Html->tag('table',
						$this->Html->tableHeaders($this->fields),
						['id'=>'edit_list_region', 'class'=>'table']
					)
				]
			]);


			return $this->Html->tag('script', $table, ['type'=>'text/template', 'id'=>$template_id]);
		}


		/**
		 * get the correct type of input
		 *
		 * Date Added: Tue, Jun 24, 2014
		 */
		private function _get_input($field_name){
			$field_type = $this->model->getColumnType($field_name);

			switch($field_type){
				case 'boolean':
					$input = $this->_input_boolean($field_name);
					break;
				case null:
					$input = $this->_input_related($field_name);
					break;
				default :
					$input = '<%= '.$field_name.' %>';
					break;
			}
			return $input;
		}


		private function _input_boolean($field_name){
			return '<input type="checkbox" name="'.$field_name.'" <% if('.$field_name.' == 1){%>checked="checked"<%}%> />';
		}

		private function _input_related($field_name){
			App::import('Model', $field_name);
			$this->related_model = new $field_name();

			$list = $this->related_model->find('list');
			$input = "<div class='row' style='min-width:200px'>";
			$input .= "<div class='col-sm-9' style='padding-right:0;'>";
				$input .= "<select style='width:100%;' data-field='".Inflector::underscore($field_name)."_id' name='".Inflector::underscore($field_name)."_id'>";
				$input .= "<option value=0>-- Choose an Option --</option>";
				foreach($list as $id => $value){
					$input .= "<option
								<% if(".$this->related_model->name." && ".$this->related_model->name.".".$this->related_model->primaryKey." == ".$id."){%> selected='selected' <%}%>
								value='".$id."'>".$value."</option>";
				}
				$input .= "</select>";
			$input .= "</div><div class='col-sm-1'>";
				$input .= "<a href='javascript:void(0)' class='glyphicon glyphicon-plus add_related' data-field='".Inflector::underscore($field_name)."_id' data-model='".$field_name."'></a>";
			$input .= "</div>";

			return $input;
		}

	}
?>
