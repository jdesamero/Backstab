( function() {
	
	var $ = this.jQuery;
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
	};
	
	var getTmplElem = function( vals, tmplName, bEsc ) {

		if ( !vals ) vals = {};
		
		if ( bEsc ) {
			var sSrc = $.trim( $( '#%s-tmpl'.printf( tmplName ) ).html().replace( /\\\//g, '\/' ) );
			return $.tmpl( sSrc, vals );
		} else {
			return $( '#%s-tmpl'.printf( tmplName ) ).tmpl( vals );
		}
		
	};
	
	//
	Backstab.factory = function( options ) {
		
		var opts = $.extend( {
			script: {},
			model: {},
			collection: {},
			itemView: {},
			listView: {},
			formView: {}
		}, options );
		
		if ( !opts.namePlural ) {
			opts.namePlural = '%ss'.printf( opts.name );
		}
		
		var oLocalDispatcher;
		if ( opts.enableLocalDispatcher ) {
			oLocalDispatcher = new Backstab.Dispatcher();
		}
		
		var ent = {};
		
		
		
		// --- model -------------------------------------------------------------------------------
		
		if ( false !== opts.model ) {
			
			var mdPrms = $.extend( {}, opts.model.params );
			
			var modelExt = {};
			
			modelExt = factorySetup( modelExt, opts.model, function( ext, params ) {
				
				if ( 'srv' == params.autourl ) {
					ext.url = '%s/%s'.printf( opts.script.srv, opts.name );
				} else if ( 'ajax_content' == params.autourl ) {
					ext.url = '%s&section=%s'.printf( opts.script.ajax_content, opts.name );
				}
				
				return ext;
				
			} );
			
			ent.Model = Backstab.Model.extend( modelExt );			
		}
		
		
		
		
		// --- collection --------------------------------------------------------------------------
		
		if ( false !== opts.collection ) {
		
			var clPrms = $.extend( {}, opts.collection.params );
			
			var collectionExt = { model: ent.Model };
			
			collectionExt = factorySetup( collectionExt, opts.collection, function( ext, params ) {
				
				if ( 'srv' == params.autourl ) {
					ext.url = '%s/%s'.printf( opts.script.srv, opts.name );
				} else if ( 'ajax_content' == params.autourl ) {
					ext.url = '%s&section=%s'.printf( opts.script.ajax_content, opts.namePlural );
				}
				
				if ( params.parseinfo ) {
					
					ext.parse = function( response, options ) {
						
						this.info = null;	// reset
						
						if ( response[ '__info' ] && response[ '__body' ] ) {
							this.info = response[ '__info' ];
							return response[ '__body' ];
						}
						
						return response;
					}
					
				}
				
				return ext;
				
			} );
			
			ent.Collection = Backstab.Collection.extend( collectionExt );
		}
		
		
		
		// --- item view ---------------------------------------------------------------------------
		
		if ( false !== opts.itemView ) {
			
			var ivPrms = $.extend( {}, opts.itemView.params );
			
			var itemViewExt = {
				
				events: {
					'model:change :first': 'updateItem',
					'model:destroy :first': 'removeItem'
				},
				
				initialize: function() {
					
					if ( ivPrms.initTmpl ) {
						this.$el = this.getTmpl( this.getTmplInitVals() );
					}
					
					if ( ivPrms.postinit ) {
						ivPrms.postinit.call( this );
					}
				},
				
				// hook method
				getTmplInitVals: function() {
					return {};
				},
				
				getTmpl: function( vals, name ) {
					if ( !name ) name = opts.name;
					return getTmplElem( vals, name, opts.unescapeTemplateSrc );
				},
				
				updateItem: function( e, model ) {
					
					if ( ivPrms.updateElem ) {
						ivPrms.updateElem.call( this );
					} else if ( ivPrms.populateHash ) {
						this.extractModelValues( null, null, ivPrms.populateHash );
					} else {
						this.extractModelValues();
					}
					
					if ( ivPrms.postUpdate ) {
						ivPrms.postUpdate.call( this );
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
			
			if ( oLocalDispatcher ) {
				itemViewExt.local_dispatcher = oLocalDispatcher;
			}
			
			itemViewExt = factorySetup( itemViewExt, opts.itemView, function( ext, params ) {
				
				return ext;
				
			} );
			
			ent.ItemView = Backstab.View.extend( itemViewExt );
		}
		
		
		
		// --- list view ---------------------------------------------------------------------------
		
		if ( false !== opts.listView ) {
		
			var lvPrms = $.extend( {}, opts.listView.params );
			
			var listViewExt = {
				
				events: {
					'collection:initialize :first; collection:add :first': 'appendItem',
					'collection:remove': 'removeItem'
				},
				
				_items: [],
	
				initialize: function() {
					
					if ( lvPrms.initTmpl ) {
						this.$el = this.getTmpl( this.getTmplInitVals() );
					}
					
					if ( lvPrms.postinit ) {
						lvPrms.postinit.call( this );
					}
				},
				
				// hook method
				getTmplInitVals: function() {
					return {};
				},
				
				getTmpl: function( vals, name ) {
					if ( !name ) name = opts.namePlural;
					return getTmplElem( vals, name, opts.unescapeTemplateSrc );
				},
				
				appendItem: function( e, model ) {
					
					var item = new ent.ItemView( {
						model: model,
						attributes: {
							listView: this
						}
					} );
					
					this._items.push( item );
					
					item.render();
					
					var appendTarget = this.$el;
					if ( lvPrms.appendTarget ) {
						appendTarget = this.$( lvPrms.appendTarget );
					}
					
					appendTarget.append( item.$el );
					
					if ( lvPrms.postAppend ) {
						lvPrms.postAppend.call( this, appendTarget, item, model, e );
					}
					
					return item;
				},
				
				removeItem: function( e, model, collection, options ) {
					
					var item;
					
					$.each( this._items, function( i, v ) {
						if ( v.model === model ) {
							item = v;
							return false;
						}
					} );
					
					this._items = _.without( this._items, item );
				}
				
			};
			
			if ( oLocalDispatcher ) {
				listViewExt.local_dispatcher = oLocalDispatcher;
			}
			
			listViewExt = factorySetup( listViewExt, opts.listView, function( ext, params ) {
				
				return ext;
				
			} );
			
			ent.ListView = Backstab.View.extend( listViewExt );
		}
		
		
		
		// --- form view ---------------------------------------------------------------------------
		
		if ( false !== opts.formView ) {
		
			var fvPrms = $.extend( {}, opts.formView.params );
			
			var formViewExt = {
				
				getTmpl: function( vals, name ) {
					if ( !name ) name = '%s_form'.printf( opts.name );
					return getTmplElem( vals, name, opts.unescapeTemplateSrc );
				}
				
			};
			
			if ( oLocalDispatcher ) {
				formViewExt.local_dispatcher = oLocalDispatcher;
			}
			
			formViewExt = factorySetup( formViewExt, opts.formView, function( ext, params ) {
				
				return ext;
				
			} );
			
			ent.FormView = Backstab.View.extend( formViewExt );
		}
		
		
		// -----------------------------------------------------------------------------------------
		
		return ent;
		
	};
	
} ).call( this );