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
		'change select' : '_update_select',
		'keyup [contentEditable=true]' : '_update_default',
		'keydown [contentEditable=true]' : '_check_pressed_key',
		'click .delete' : '_delete',
		'click .attachment' : '_toggle_attachment_view',
		'click .add_related' : '_add_related_field'
	},
	template : _.template($('#EditViewTemplate').html()),
	render : function () {
		return this.$el.html(this.template(this.model.attributes))
	},
	_toggle_attachment_view : function () {
		if (this.$el.next('tr[data-id='+this.model.get('id')+']').length > 0) {
			this.$el.next('tr[data-id='+this.model.get('id')+']').remove();
		}else{
			this._show_attachment_view();
		}
	},
	_show_attachment_view : function () {
		this.$el.next('tr[data-id='+this.model.get('id')+']').remove();
		console.log('show attachment view');
		tr = $('<tr data-id="'+this.model.get('id')+'" class="file"></tr>')
		this.$el.after(tr);
		editFileView = new Edit.View.File({model:this.model, el:tr});
		editFileView.on('image_deleted', this._show_attachment_view, this);
		editFileView.render();
		editViewUpload = new Edit.View.Upload({upload_box:'#dropbox_'+this.model.get('id'), upload_url:'/mrg_admin_quick_edit/edits/files/'+this.model.get('id')+'/'+model_name, model:this.model});
		editViewUpload.on('finished_upload', this._update_image, this);

		editViewUpload.render();
	},
	_add_related_field : function (e) {
		data = $(e.target).data();
		input = $("<input name='"+data.model+"' />");
		$(e.target).closest('td').html(input);

		$(input).blur(function (e) {
			this._create_related(data.model,data.field, $(e.target).val());
		}.bind(this));
	},

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
		}).send();






	},
	_update_image : function(file,response){
		this.model.set('Image', {thumb:response.file_url});

		this._show_attachment_view();

	},
	_update_default : function (e) {
		field = jQuery(e.target).data('field');
		this.model.set(field, jQuery(e.target).html());

		this._update();
	},
	_update_checkbox : function (e) {
		field = jQuery(e.target).parent().data('field');
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
	_update : function () {
		saving_model = {};
		if (typeof saving_model[this.model.get('id')] != 'undefined') {
			clearTimeout(saving_model[this.model.get('id')]);
		}
		// Save the task when they are finished typing.
		saving_model[this.model.get('id')] = setTimeout(_.bind(this.model.save, this.model), 700);
	},
	_delete : function (e) {
		console.log('delete');
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
		if (e.which == 9 || e.which == 13) {
			e.preventDefault();
			jQuery(e.target).blur();
		}
	},

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
		console.log(model_defaults);
		data = model_defaults;
		this.collection.create(data, {wait:true});
	},

	addOne:function (edit){
		edit = new Edit.Model(edit.attributes);
		edit.set('model', model_name);
		editView = new Edit.View({model:edit})
		this.$el.find('#edit_list_region tr:first-of-type').after(editView.render());
	},
	addAll : function () {
		this.collection.forEach(this.addOne, this);
	}
})

$('document').ready(function () {
	editList = new Edit.Collection();
	console.log(edit_list);
	editList.reset(edit_list);


	editListView = new Edit.ViewCollection({collection:editList, el:'#edit_region', options:options});
	editListView.render();


})
