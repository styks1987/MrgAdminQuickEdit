<?php
	class EditsController extends AppController{


		function index(){
			echo "index";
			exit;
		}

		function add(){
			$data = json_decode(file_get_contents('php://input'), TRUE);
			$model = $data['model'];
			App::import('Model', $model);
			$this->model = new $model;
			$this->model->create();
			if($this->model->save($data)){
				$data['id'] = $this->model->id;
				echo json_encode($data, JSON_NUMERIC_CHECK);
			}else{
				echo 0;
			}
			exit;
		}

		function edit(){
			$data = json_decode(file_get_contents('php://input'), TRUE);
			if(empty($data)){
				$data = $this->request->data;
			}
			$model = $data['model'];
			App::import('Model', $model);
			$this->model = new $model;
			foreach($data as $column=>&$value){
				if($this->model->getColumnType($column) && $this->model->getColumnType($column) != 'text'){
					$value = strip_tags($value);
					if($value == 'false'){
						$value = 0;
					}
				}/*elseif($this->model->getColumnType($column) == 'text'){
					$doc = new DOMDocument();
					$doc->loadHTML($value);

					$value = $this->_parse_data_images($doc);
				}*/
			}
			//unset($data['Image']);
			if($this->model->save($data)){
				$new_data = $this->model->findById($data['id']);
				$new_data = array_intersect_key($data, $new_data);
				// We want to filter out some associations but save the other values
				$data = array_merge($new_data, $data);
				echo json_encode($data);
			}else{
				echo 0;
			}
			exit;
		}

		private function _parse_data_images($doc){
			$img_dir = '/files/images/';
			$imgs = $doc->getElementsByTagName("img");

			define('UPLOAD_DIR', APP.WEBROOT_DIR.$img_dir);

			foreach($imgs as $img){
				$img_file = $img->getAttribute('src');

				if(strstr($img_file, 'data:image/png;base64')){
					$extension = 'png';
					$img_file = str_replace('data:image/png;base64,', '', $img_file);
				}elseif(strstr($img_file, 'data:image/jpeg;base64')){
					$extension = 'jpg';
					$img_file = str_replace('data:image/jpeg;base64,', '', $img_file);
				}else{
					$img->removeChild();
					continue;
				}


				$img_file = str_replace(' ', '+', $img_file);
				$img_data = base64_decode($img_file);
				$file_name = uniqid() . '.'.$extension;
				$file = UPLOAD_DIR . $file_name;
				$success = file_put_contents($file, $img_data);
				//$success ? $file : 'Unable to save the file.';

				$img->setAttribute( 'src' , $img_dir.$file_name );
			}


			# remove <html><body></body></html>
			return preg_replace('~<(?:!DOCTYPE|/?(?:html|body))[^>]*>\s*~i', '', $doc->saveHTML());
		}

		function delete($id){
			$data = json_decode(file_get_contents('php://input'), TRUE);
			$model = $data['model'];
			App::import('Model', $model);
			$this->model = new $model;
			if($this->model->delete($id)) {
				$this->files($id, $model, true);
				$message = 1;
			} else {
				$message = 0;
			}
			echo $message;
			exit;
		}
		/**
		 * add a related field item
		 *
		 * This assumes pk is ID and didsplayfield is name
		 *
		 * Date Added: Thu, Jun 26, 2014
		 */

		function add_related(){
			App::import('Model', $this->request->data['model']);
			$this->model = new $this->request->data['model']();
			$this->model->create();
			$this->model->save(['name'=>$this->request->data['name']]);
			echo json_encode(['id'=>$this->model->id, 'name'=>$this->request->data['name']]);
			exit;
		}


		function files($foreign_key, $model='Other', $return = false){
			$behavior = 'Attachment';
			$class = 'Image';

			App::import('Model', 'MrgAdminUploader.Attachment');
			$this->Attachment = new Attachment();

			if($this->request->is('Delete')){

				$this->Attachment->deleteAll(['foreign_key'=>$foreign_key, 'model'=>$model]);

				$return_data['message'] = "Image Deleted";
			}else{
				App::import('Model', $model);
				$this->$model = new $model();


				$this->request->data['Attachment']['img'] = $_FILES['img'];



				$this->Attachment->Behaviors->{$behavior}->settings['Attachment'] = hash::merge(
					$this->Attachment->Behaviors->{$behavior}->settings['Attachment'],
					$this->$model->hasOne[$class]['Behaviors'][$behavior]
				);

				$this->request->data['Attachment']['foreign_key'] = $foreign_key;
				$this->request->data['Attachment']['model'] = $model;

				$attachment = $this->Attachment->find('first', ['conditions'=>['model'=>$model, 'foreign_key'=>$foreign_key]]);

				if(!empty($attachment)){
					$this->request->data['Attachment']['id'] = $attachment['Attachment']['id'];
				}


				if($this->Attachment->save($this->request->data)){
					$image_name = $this->Attachment->field('thumb');
					$return_data['status'] = 1;
					$return_data['message'] = 'Your image was successfully updated';
					$return_data['file_url'] = $image_name;
				}else{
					$errors = $this->Attachment->invalidFields();
					$message = $errors['img'][0];
					$return_data['status'] = 0;
					$return_data['message'] = $message;
				}
			}
			if(!$return){
				$this->_exit_status($return_data);
			}
		}


		/**
		 * get the file extension
		 *
		 * Date Added: Fri, Jan 24, 2014
		 */

		private function _get_extension($file_name){
			$ext = explode('.', $file_name);
			$ext = array_pop($ext);
			return strtolower($ext);
		}
		/**
		 * echo out json
		 *
		 * Date Added: Fri, Jan 24, 2014
		 */

		private function _exit_status($return_data){
			header('Content-Type: application/json');
			echo json_encode($return_data);
			exit;
		}

	}
?>
