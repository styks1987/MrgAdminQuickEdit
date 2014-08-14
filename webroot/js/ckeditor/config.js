/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {

	// IF THIS IS NOT LOADING CLEAR CACHE

	// Define changes to default configuration here.
	// For the complete reference:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	config.toolbar = [
		{ name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
		{ name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ /*'Cut', 'Copy', 'Paste',*/ 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
		{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
		//{ name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', '-', 'RemoveFormat' ] },
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent'] },
		{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
		{ name: 'insert', items: [ 'Image',/* 'Flash',*/ 'Table', /*'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' */] },
		'/',
		{ name: 'styles', items: [ 'Styles', 'Format'] },
		{ name: 'tools', items: [ 'Maximize'] },
	];



	//config.toolbarGroups = [
	//	{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
	//	{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
	//	{ name: 'links' },
	//	{ name: 'insert'},
	//	{ name: 'forms' },
	//	{ name: 'tools' },
	//	{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
	//	{ name: 'others' },
	//	'/',
	//	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
	//	{ name: 'paragraph',   groups: [ 'list', 'indent',  'align', ] },
	//	{ name: 'styles' },
	//	//{ name: 'colors' },
	//	//{ name: 'about' }
	//];

	//config.toolbar = [
	//	['Format', 'Bold','Italic','Underline','StrikeThrough','-','Undo','Redo','-','PasteText', 'PasteFromWord'],
	//	['NumberedList','BulletedList'],
	//	['Image','-','Link','Source']
	//];
	config.filebrowserUploadUrl = '/mrg_admin_uploader/attachments/ckupload';
	config.filebrowserBrowseUrl = '/mrg_admin_uploader/attachments/ckbrowse';

	// Remove some buttons, provided by the standard plugins, which we don't
	// need to have in the Standard(s) toolbar.
	//config.removeButtons = 'Underline,Subscript,Superscript,Styles,HorizontalRule,SpecialChar';

	// Se the most common block elements.
	config.format_tags = 'p;h2;h3;h4;div'
	//config.allowedContent= 'p b i ul li img a ol';


	config.extraPlugins = 'autogrow';
	config.autoGrow_onStartup = true;
	config.autoGrow_minHeight = 500;

	// Make dialogs simpler.
	//config.removeDialogTabs = 'image:advanced;link:advanced';
};
