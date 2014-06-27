Edit = {}
Edit.Model = {}
Edit.Collection = {}
Edit.View = {}
Edit.ViewCollection = {}


Edit.Model = Backbone.Model.extend({
	urlRoot:'/mrg_admin_quick_edit/edits'
});
Edit.Collection = Backbone.Collection.extend({
	model:Edit.Model
})

Edit.View = Backbone.View.extend({
	className: 'edit',
	tagName : 'tr',
	events : {
		'change input[type="checkbox"]' : '_update_checkbox',
		'change input.datepicker' : '_update_date',
		'change select' : '_update_select',
		'keyup [contentEditable=true]' : '_update_default',
		'keydown [contentEditable=true]' : '_check_pressed_key',
		'click .delete' : '_delete',
		'click .attachment' : '_toggle_attachment_view',
		'click .add_related' : '_add_related_field',
		'click .edit_text' : "_enable_edit_text"
	},
	template : _.template($('#EditViewTemplate').html()),
	render : function () {
		return this.$el.html(this.template(this.model.attributes))
	},
	// Toggle the section where you can upload images too
	_toggle_attachment_view : function () {
		if (this.$el.next('tr[data-id='+this.model.get('id')+']').length > 0) {
			this.$el.next('tr[data-id='+this.model.get('id')+']').remove();
		}else{
			this._show_attachment_view();
		}
	},
	_enable_edit_text : function (e){
		field_name = $(e.target).data('field');

		if (typeof this.modal_window == 'undefined') {
			this.modal_window = {};
		}

		if (typeof this.modal_window != 'undefined' && typeof this.modal_window[field_name] != 'undefined') {
			this.modal_window[field_name].modal("show");
		}else{
			this.modal_window[field_name] = {};

			this.modal_window[field_name] = $(e.target).next('#modal_'+field_name+'_'+this.model.get('id')).modal({
				backdrop:true,
				show:true,
			});
			this.modal_window[field_name].on('shown.bs.modal', function (e) {
				this.modal_window[field_name].content = $(e.target).find('.content');
				this.modal_window[field_name].content.wysiwyg();
				$(e.target).find('.dropdown-menu input').click(function(event){
						event.stopPropagation();
				});
			}.bind(this));

			this.modal_window[field_name].on('click', '.save', function (e) {
				html = this.modal_window[field_name].content.cleanHtml();
				this._update_text(html, field_name);
			}.bind(this))
		}


	},
	// Show the section wehre you can upload images
	// This will clear it out if it already exists
	_show_attachment_view : function () {
		this.$el.next('tr[data-id='+this.model.get('id')+']').remove();
		tr = $('<tr data-id="'+this.model.get('id')+'" class="file"></tr>')
		this.$el.after(tr);
		editFileView = new Edit.View.File({model:this.model, el:tr});
		editFileView.on('image_deleted', this._show_attachment_view, this);
		editFileView.render();
		editViewUpload = new Edit.View.Upload({upload_box:'#dropbox_'+this.model.get('id'), upload_url:'/mrg_admin_quick_edit/edits/files/'+this.model.get('id')+'/'+model_name, model:this.model});
		editViewUpload.on('finished_upload', this._update_image, this);

		editViewUpload.render();
	},
	// For related fields add a input that can be edited.
	// When the user leaves the input, it creats a new related piece for them
	_add_related_field : function (e) {
		data = $(e.target).data();
		input = $("<input name='"+data.model+"' />");
		$(e.target).closest('td').html(input);

		$(input).blur(function (e) {
			this._create_related(data.model,data.field, $(e.target).val());
		}.bind(this));
	},
	// Send the request to the server for creating a new related row
	// And assigne it to the current model
	_create_related : function (model, field, value){
		name = value;

		$.ajax({
			url:'/mrg_admin_quick_edit/edits/add_related',
			data:{name:value,model:model},
			type:'post',
			dataType:'json',
			complete : function (response) {
				response = response.responseJSON;
				related = this.model.get(model);
				related.id = response.id;
				related.name = response.name;
				this.model.set(model, related);
				this.model.set(field, response.id);

				selects = 'select[name="'+field+'"]';
				this.$el.html(this.template(this.model.attributes));
					option = $('<option value='+response.id+'>'+response.name+'</option>');
					$(selects).append(option);
					this.$el.find('option[value='+response.id+']').attr('selected', 'selected');
					this._update();
			}.bind(this)
		})
	},

	_update_text : function (html, field_name){
		this.model.set(field_name, html);
		this._update();
	},
	// After uploading a new image replace the existing image
	_update_image : function(file,response){
		this.model.set('Image', {thumb:response.file_url});
		this._show_attachment_view();
	},
	_update_default : function (e) {
		if (!$(e.target).closest('.wysiwyg_content').is('*')) {
			field = jQuery(e.target).data('field');
			this.model.set(field, jQuery(e.target).html());

			this._update();
		}
	},
	_update_checkbox : function (e) {
		field = jQuery(e.target).data('field');
		value = (jQuery(e.target).is(':checked'))?"true":"false";;
		this.model.set(field, value);
		this._update();
	},
	_update_select : function (e){
		field = jQuery(e.target).data('field');
		value = jQuery(e.target).val();
		this.model.set(field, value);
		this._update();
	},
	_update_date : function (e){
		field = jQuery(e.target).data('field');
		value = jQuery(e.target).closest('td').find('.datepicker').val();
		date = new Date(value);
		value = this._format_date_for_mysql(date);
		this.model.set(field, value);
		this._update();
	},
	_update : function () {
		if (typeof saving_model == 'undefined' ) {
			saving_model = {}
		}
		if (typeof saving_model[this.model.get('id')] != 'undefined') {
			clearTimeout(saving_model[this.model.get('id')]);
		}
		// Save the task when they are finished typing.
		saving_model[this.model.get('id')] = setTimeout(_.bind(this.model.save, this.model), 700);
	},
	_delete : function (e) {
		if (confirm("Are you sure you want to delete "+this.model.get('title')+"? This cannot be undone.")) {
			jQuery(this.el).closest(".edit").slideUp(500, function () {
				if (this.model.get('id')) {
					//$.ajax({
					//	url:'/mrg_admin_quick_edit/edits/'+this.model.get('id'),
					//	type:'DELETE',
					//	data:this.model.toJSON()
					//});
					this.model.destroy({data:JSON.stringify(this.model.toJSON()), contentType: 'application/json'});
					//this.remove();
				}
			}.bind(this));
		}
	},
	_check_pressed_key : function (e){
		if (!$(e.target).closest('.wysiwyg_content').is('*')) {
			if (e.which == 9 || e.which == 13) {
				e.preventDefault();
				$(e.target).blur();
			}
		}
	},
	_format_date_for_mysql : function (date) {
		if(isNaN(date.getTime())){
			return null
		}else{
			month = parseInt(date.getMonth())+1;
			return date.getFullYear()+'-'+month+'-'+date.getDate()
		}
	}

});


		Edit.View.File = Edit.View.extend({
			initialize : function () {},
			events : {
				'click .delete_file' : '_delete_file'
			},
			template : _.template(jQuery('#EditFileViewTemplate').html()),
			render : function () {
				return this.$el.html(this.template(this.model.attributes));
			},
			_delete_file : function () {
				if (confirm('Are you sure you want to delete this image?')) {
					jQuery.ajax({
						url:'/mrg_admin_quick_edit/edits/files/'+this.model.get('id')+'/'+model_name,
						type:'DELETE',
						data:this.model.toJSON()
					});
					this.model.unset('Image');
					this.trigger('image_deleted');
				}
			}
		});

		Edit.View.Upload = Backbone.View.extend({
		options : {
			upload_box : '#dropbox',
			upload_url : '/mrg_admin_quick_edit/edits/files',
			paramname : 'img',
			maxfiles : 1, // I don't think this works right now
			maxfilesize : 15, // I don't think this works right now
			valid_file_types : /(pdf|tif|ai|eps|png|jpg|gif)/,
			data : {
				'directory' : '/uploads/'+model_name
			}
		},
		initialize : function (options) {
			if (typeof options != 'undefined') {
				_.extend(this.options, options);
			}
		},
		render : function () {
			var dropbox = jQuery(this.options.upload_box);
			this.dropbox = dropbox;
			var message = jQuery('.message', dropbox);

			var self = this;

			// Load up the filedrop jquery plugin
			this.FiledropUpload = dropbox.filedrop({
				// The name of the jQuery_FILES entry:
				paramname	:	self.options.paramname,
				maxfiles 	: 	self.options.maxfiles,
				maxfilesize	: 	self.options.maxfilesize, // in mb
				url			: 	self.options.upload_url,
				data 		: 	self.options.data,

				uploadFinished:function(i,file,response){
					self.upload_finished(i,file,response);
				},

				error: function(err, file) {
					self.error(err,file);
				},

				// Called before each upload is started
				beforeEach: function(file){
					return self.before_each(file);
				},

				uploadStarted:function(i, file, len){
					self.upload_started(i,file,len);
				},

				progressUpdated: function(i, file, progress) {
					self.progress_updated(i,file,progress);
				}
			});
		},
		error : function (err,file){
			switch(err) {
				case 'BrowserNotSupported':
					this.show_message('Your browser does not support HTML5 file uploads!');
					break;
				case 'TooManyFiles':
					alert('Too many files! Please select 5 at most!');
					break;
				case 'FileTooLarge':
					alert(file.name+' is too large! Please upload files up to 2mb.');
					break;
				default:
					break;
			}
		},
		before_each : function (file){
			return this.validate_file_format(file);
		},
		// Ensure that the file format is correct
		validate_file_format : function (file){
			if(file.type.match(this.valid_file_types)){
				return true;
			}else{
				alert('We do not accept the '+file.type+' file type. Please upload a pdf, ai, tif, or eps file.');
				return false;
			}
		},
		progress_updated : function (i, file, progress) {
			jQuery.data(file).find('.progress').width(progress);
		},
		upload_started : function (i, file, len) {
			this.create_image(file);
		},
		upload_finished : function (i,file,response){
			if (response.status) {
				jQuery.data(file).addClass('done');
			}else{
				jQuery.data(file).addClass('error');
			}
			this.display_url(file,response);
			this.trigger('finished_upload', file, response);
			// response is the JSON object that post_file.php returns
		},
		create_image : function (file){
			var template = '<div class="preview">'+
					//'<span class="imageHolder">'+
					//    '<img />'+
					//    '<span class="uploaded"></span>'+
					//'</span>'+
					'<div class="progressHolder">'+
						'<div class="progress"></div>'+
					'</div>'+
				'</div>';
			var preview = jQuery(template),
			image = jQuery('img', preview);

			var reader = new FileReader();

			image.width = 100;
			image.height = 100;

			reader.onload = function(e){
				// e.target.result holds the DataURL which
				// can be used as a source of the image:
				image.attr('src',e.target.result);
			};

			// Reading the file as a DataURL. When finished,
			// this will trigger the onload function above:
			reader.readAsDataURL(file);

			//preview.appendTo(this.dropbox);

			// Associating a preview container
			// with the file, using jQuery's $.data():

			jQuery.data(file,preview);
		},
		show_message : function (msg){
			message.html(msg);
		},
		display_url : function (file, response) {
			jQuery.data(file).find('.progressHolder').replaceWith('<p>'+response.target_filename+'</p>');
		}
	});



Edit.ViewCollection = Backbone.View.extend({
	events : {
		'click #add_new' : 'createOne'
	},
	initialize : function (params) {
		this.options = _.extend(this.options, params.options);
		this.collection.on('sync', this.render, this);
	},
	options: {
		fields:[],
	},
	template : _.template($('#EditViewCollectionTemplate').html()),
	render : function () {
		this.$el.html(this.template());
		this.addAll();
	},
	createOne : function () {
		data = model_defaults;
		this.collection.create(data, {wait:true});
	},

	addOne:function (edit){
		edit = new Edit.Model(edit.attributes);
		edit.set('model', model_name);
		editView = new Edit.View({model:edit})
		this.$el.find('#edit_list_region tr:first-of-type').after(editView.render());

		this._setup_dates(editView);
		//this._setup_wysiwyg(editView);

	},
	addAll : function () {
		this.collection.forEach(this.addOne, this);
	},
	// Create datepickers
	// Format dates from the server and format dates going to the server
	_setup_dates : function (view){
		view.$el.find('.datepicker').datepicker({
			autoclose:true,
			format: 'mm-dd-yyyy'
		});

		dates = view.$el.find('.datepicker');
		_.each(dates, function (el, i){
			date = new Date($(el).val());
			date = this._format_date_for_view(date);
			$(el).val(date);
		}.bind(this))
	},
	_format_date_for_view : function (date){
		if(isNaN(date.getTime())){
			return null
		}else{
			month = parseInt(date.getMonth())+1;
			day = date.getDate();
			month = month > 9 ? month : "0"+month;
			day = day > 9 ? day : "0"+day;
			return month+'-'+day+'-'+date.getFullYear();
		}
	}
	/*,
	_setup_wysiwyg : function (view) {
		editables = view.$el.find('.wysiwyg_content');
		_.each(editables, function(el, i){
			$(el).closest
		});
	}*/
});

Edit.View.Loader = Backbone.View.extend({
	className : 'loader',
	render : function () {
		console.log('render');
		$('body').append(this.$el)
	},
	finished : function () {
		if (typeof finished_loader != 'undefined') {
			clearTimeout(finished_loader);
		}
		this.$el.fadeOut(500,function () {
			this.$el.css('background', 'transparent');
			this.$el.html('Saved');
			this.$el.fadeIn(500);
		}.bind(this))

		// Save the task when they are finished typing.
		finished_loader = setTimeout(_.bind(this.hide, this), 2000);

	},
	hide : function () {
		this.$el.fadeOut(500, function () {
			this.remove();
		}.bind(this));
	}
})

$('document').ready(function () {
	editList = new Edit.Collection();
	editList.reset(edit_list);


	editListView = new Edit.ViewCollection({collection:editList, el:'#edit_region', options:options});
	editListView.render();


	$(document).ajaxStart(function (){
		if (typeof loader != 'undefined') {
			loader.remove();
		}
		loader = new Edit.View.Loader()
		loader.render();
	});

	$(document).ajaxStop(function (){
		if (typeof loader != 'undefined') {
			loader.finished();
		}
	});




})

