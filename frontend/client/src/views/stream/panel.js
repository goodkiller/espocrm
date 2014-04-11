/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014  Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: http://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 ************************************************************************/ 

Espo.define('Views.Stream.Panel', 'Views.Record.Panels.Relationship', function (Dep) {

	return Dep.extend({

		template: 'stream.panel',	

		events: _.extend({
			'focus textarea.note': function (e) {
				this.enablePostingMode();
			},
			'click button.post': function () {
				this.post();
			},
			'keypress textarea.note': function (e) {
				if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey) {
					this.post();
				} else if (e.keyCode == 9) {
					$text = $(e.currentTarget)
					if ($text.val() == '') {					
						this.$el.find('.buttons-panel').addClass('hide');
					}
				}
			},
			'input textarea.note': function (e) {
				var $text = $(e.currentTarget);						
				var numberOfLines = e.currentTarget.value.split("\n").length;
				var numberOfRows = $text.prop('rows');
				
				if (numberOfRows < numberOfLines) {
					$text.prop('rows', numberOfLines);
				} else if (numberOfRows > numberOfLines) {
					$text.prop('rows', numberOfLines);
				}
			},
		}, Dep.prototype.events),
		
		enablePostingMode: function () {
			this.$el.find('.buttons-panel').removeClass('hide');
		},
		
		disablePostingMode: function () {
			this.attachmentIds = [];
			this.$textarea.val('');
			
			
			this.getView('attachments').empty();
			
			this.$el.find('.buttons-panel').addClass('hide');
		},

		setup: function () {
			this.title = this.translate('Stream');

			this.wait(true);
			this.getModelFactory().create('Note', function (model) {
				this.seed = model;
				this.createCollection(function () {
					this.wait(false);				
				}.bind(this));				
			}.bind(this));
		},

		createCollection: function (callback) {
			this.getCollectionFactory().create('Note', function (collection) {			
			
				this.collection = collection;
				collection.url = this.model.name + '/' + this.model.id + '/stream';
				collection.maxSize = this.getSettings().get('recordsPerPageSmall') || 5;
			
				callback();				
			}, this);
		},
		
		afterRender: function () {		
			this.$textarea = this.$el.find('textarea.note');
			this.$attachments = this.$el.find('div.attachments');
		
			var collection = this.collection;
			
			this.listenTo(this.model, 'sync', function () {
				collection.fetch();
			});
			
			this.listenToOnce(collection, 'sync', function () {
				this.createView('list', 'Stream.List', {
					el: this.options.el + ' > .list-container',
					collection: collection
				}, function (view) {
					view.render();										
				});
			}.bind(this));
			collection.fetch();
			
			this.createView('attachments', 'Fields.AttachmentMultiple', {
				model: this.seed,
				mode: 'edit',
				el: this.options.el + ' div.attachments-container',
				defs: {
					name: 'attachments',
				},										
			}, function (view) {
				view.render();
			});
		},

		post: function () {		
			this.$textarea.prop('disabled', true);
		
			var $text = this.$el.find('textarea.note');

			this.getModelFactory().create('Note', function (model) {
				var message = $text.val();
				if (message == '' && this.seed.get('attachmentsIds').length == 0) {
					this.notify('Post cannot be empty', 'error');
					this.$textarea.prop('disabled', false);
					return;
				}
								
				model.once('sync', function () {					
					this.notify('Posted', 'success');
					this.collection.fetch();
					
					this.$textarea.prop('disabled', false);
					this.disablePostingMode();
				}, this);
				
				model.set('message', message);
				model.set('attachmentsIds', _.clone(this.seed.get('attachmentsIds')));
				model.set('parentId', this.model.id);
				model.set('parentType', this.model.name);
				model.set('type', 'Post');
								
				this.notify('Posting...');
				model.save();
			}.bind(this));
		},
		
		getButtons: function () {
			return [];
		},
	});
});
