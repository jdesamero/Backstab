( function() {
	
	var Backstab = this.Backstab;
	
	// helpers
	var factorySetup = function( setupRes, opts, setupParams ) {
		
		var setupOpts = $.extend( {
			params: {},
			extend: {}
		}, opts );
		
		// auto-stuff
		setupRes = setupParams( setupRes, setupOpts.params );
		
		// extend events if it exists
		if ( setupRes.events && setupOpts.extend.events ) {
			setupRes.events = $.extend(
				setupRes.events,
				setupOpts.extend.events
			);
			delete setupOpts.extend.events;
		}
		
		// extend the rest
		setupRes = $.extend( setupRes, setupOpts.extend );
		
		return setupRes;
	}
	
	//
	Backstab.factory = function( options ) {
		
		var opts = $.extend( {
			script: {},
			model: {},
			collection: {},
			itemView: {},
			listView: {}
		}, options );
		
		if ( !opts.name_plural ) {
			opts.name_plural = opts.name + 's';
		}
		
		var ent = {};
		
		
		
		// --- model -------------------------------------------------------------------------------
		
		var mdPrms = $.extend( {}, opts.model.params );
		
		var modelExt = {};
		
		modelExt = factorySetup( modelExt, opts.model, function( ext, params ) {
			
			if ( params.autourl ) {
				ext.url = opts.script.ajax_content + '&section=' + opts.name;
			}
			
			return ext;
			
		} );
		
		ent.Model = Backstab.Model.extend( modelExt );
		
		
		
		// --- collection --------------------------------------------------------------------------
		
		var clPrms = $.extend( {}, opts.collection.params );
		
		var collectionExt = { model: ent.Model };
		
		collectionExt = factorySetup( collectionExt, opts.collection, function( ext, params ) {
			
			if ( params.autourl ) {
				ext.url = opts.script.ajax_content + '&section=' + opts.name_plural;
			}
			
			return ext;
			
		} );
		
		ent.Collection = Backstab.Collection.extend( collectionExt );
		
		
		
		// --- item view ---------------------------------------------------------------------------
		
		var ivPrms = $.extend( {}, opts.itemView.params );
		
		var itemViewExt = {
			
			events: {
				'model:change :first': 'updateItem',
				'model:destroy :first': 'removeItem'
			},
			
			initialize: function() {
				
				if ( ivPrms.inittmpl ) {
					this.$el = $( '#' + opts.name + '-tmpl' ).tmpl( {} );
				}
				
				if ( ivPrms.postinit ) {
					ivPrms.postinit.call( this );
				}
			},
			
			updateItem: function( e, model ) {
				
				if ( ivPrms.populatehash ) {
					this.model.populateElem( this.$el, ivPrms.populatehash );
				} else {
					this.model.populateElem( this.$el );
				}
				
				if ( ivPrms.postupdate ) {
					ivPrms.postupdate.call( this );
				}
			},
			
			removeItem: function( e, model ) {
				this.unbind();
				this.remove();
			},
			
			render: function() {
				this.updateItem();
				return this;
			}
						
		};
		
		itemViewExt = factorySetup( itemViewExt, opts.itemView, function( ext, params ) {
			
			return ext;
			
		} );
		
		ent.ItemView = Backstab.View.extend( itemViewExt );
		
		
		
		// --- list view ---------------------------------------------------------------------------
		
		var lvPrms = $.extend( {}, opts.listView.params );
		
		var listViewExt = {
			
			events: {
				'collection:initialize :first; collection:add :first': 'appendItem'
			},
			
			_items: [],

			initialize: function() {
				
				if ( lvPrms.inittmpl ) {
					this.$el = $( '#' + opts.name_plural + '-tmpl' ).tmpl( {} );
				}
				
				if ( lvPrms.postinit ) {
					lvPrms.postinit.call( this );
				}
			},
			
			appendItem: function( e, model ) {
				
				var item = new ent.ItemView( { model: model } );
				this._items.push( item );
				
				item.render();
				
				var appendTarget = this.$el;
				if ( lvPrms.appendtarget ) {
					appendTarget = this.$( lvPrms.appendtarget );
				}
				
				appendTarget.append( item.$el );
				
				if ( lvPrms.postappend ) {
					lvPrms.postappend.call( this, appendTarget, item, model, e );
				}
				
				return item;
			},
			
			render: function() {
				return this;
			}
			
		};

		listViewExt = factorySetup( listViewExt, opts.listView, function( ext, params ) {
			
			return ext;
			
		} );
		
		ent.ListView = Backstab.View.extend( listViewExt );
		
		
		
		// -----------------------------------------------------------------------------------------
		
		return ent;
		
	};
	
} ).call( this );