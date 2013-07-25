// depends on "backstab/core.js"
( function() {
	
	var Backbone = this.Backbone;
	var Backstab = this.Backstab;
	
	//
	Backstab.View = {
		
		//// properties
		
		_props: null,
		_backboneExtend: null,			// reference to the orginal Backbone.View.extend() method
		
		
		//// methods
		
		// accessors
		
		//
		setProps: function( props ) {
			this._props = props;
			return this;
		},
		
		// apply enhancements to Backbone.View
		latchToBackbone: function() {
			
			var _this = this;
			
			this._backboneExtend = Backbone.View.extend;
			
			Backbone.View.extend = function() {
				var args = $.makeArray( arguments );
				if ( args[ 0 ] ) {
					args[ 0 ] = _this.modifyViewProps( args[ 0 ] );
				}
				return _this._backboneExtend.apply( Backbone.View, args );
			};
			
			return this;
		},
		
		// revert to the original Backbone.View.extend() method
		unlatchFromBackbone: function() {
			Backbone.View.extend = this._backboneExtend;
			return this;
		},
		
		// other
		
		// *obj* is first the *properties* value specified in Backbone.View.extend()
		modifyViewProps: function( obj ) {

			var _this = this;
			
			//
			var curlyRegex1 = /([^ ]+?)\{([^\{\}]+?)\}([^;\{\}]*)/g;
			var curlyParse = function( evtsel ) {
				
				if ( _.contains( evtsel, '{' ) ) {
					
					var regs = false, exp = '', subs = [];
					
					// pass 1.1
					while( regs = curlyRegex1.exec( evtsel ) ) {
						// _.showMe( regs );
						exp = '';
						subs = regs[ 2 ].split( ';' );
						$.each( subs, function( i, v ) {
							if ( exp ) exp += '; ';
							exp += regs[ 1 ] + $.trim( v ) + regs[ 3 ];
						} );
						evtsel = evtsel.replace( regs[ 0 ], exp );

						// _.showMe( evtsel );
					}
					
					// _.showMe( evtsel );
					evtsel = curlyParse( evtsel );
				}
				
				return evtsel;
			};
			
			//
			var copyMethod = function( method ) {
				if ( 'array' === $.type( method ) ) {
					return method.slice( 0 );	// make a copy
				}
				return method;
			};
			
			//
			if ( obj.events && ( 'object' === $.type( obj.events ) ) ) {
	
				var evt = {}, m = null;
				
				// pass 1, expand curly braces
				$.each( obj.events, function( evtsel, method ) {
					
					var orig = evtsel;
					evtsel = curlyParse( evtsel );
					
					// _.showMe( evtsel );
					
					if ( evtsel != orig ) {
						obj.events[ evtsel ] = copyMethod( method );
						delete obj.events[ orig ];
					}
					
					// if ( evtsel != orig ) _.showMe( evtsel, orig );					
				} );
				
				// pass 2, find semi-colon separated event/selectors and split
				$.each( obj.events, function( evtsel, method ) {
					if ( _.contains( evtsel, ';' ) ) {
						var split = evtsel.split( ';' );
						$.each( split, function( i, v ) {
							obj.events[ $.trim( v ) ] = copyMethod( method );
						} );
						delete obj.events[ evtsel ];
					}
				} );
				
				// pass 3, apply parameters where needed
				$.each( obj.events, function( evtsel, method ) {
					
					if ( 'array' === $.type( method ) ) {
						
						var args = method;
						var methodName = args.shift();
						
						if ( 'function' === $.type( obj[ methodName ] ) ) {
							
							var wrap = function() {
								var ag = $.makeArray( arguments );
								return this[ methodName ].apply( this, ag.concat( args ) );
							};
														
							method = wrap;
						}
					}
					
					evt[ evtsel ] = method;
				} );
				
				// _.showMe( evt );
				obj.events = evt;
			}
			
			
			// make sure there is an initialize() method
			if ( !obj.initialize ) {
				obj.initialize = function() { };
			}
			
			// execute bindDelegates() after calling initialize()
			if ( 'function' === $.type( obj.initialize ) ) {
				var init = obj.initialize;
				var wrap = function() {
					init.apply( this );
					_this.bindDelegates( this );
				};
				obj.initialize = wrap;
			}
			
			return obj;
			
		},
		
		
		// bind delegate events to the view object
		bindDelegates: function( view ) {
			
			var props = this._props;
			
			if ( 'array' !== $.type( props ) ) {
				props = [];
				$.each( view, function( name, val ) {
					if ( val.on && ( 'function' == $.type( val.on ) ) ) {
						props.push( name );
					}
				} );
			}
			
			var delegate = {};
			
			$.each( view.events, function( evtsel, method ) {
				
				var func = null;
				
				if ( 'function' === $.type( method ) ) {
					func = method;
				} else if (
					( 'string' === $.type( method ) ) && 
					( 'function' === $.type( view[ method ] ) )
				) {
					func = view[ method ];
				}
				
				var prop = _.beginsWith( evtsel, props );
				
				if ( func && prop ) {
					
					if ( !delegate[ prop ] ) delegate[ prop ] = {};
					
					var target = view.$el;
					
					var sel = null, part1 = null, part2 = null, pos = null, subtgt = null, evt = null, on = false;
					
					part1 = prop + ':';
					part2 = $.trim( evtsel.substring( part1.length ) );
					pos = part2.indexOf( ' ' );
					if ( -1 != pos ) {
						sel = $.trim( part2.substring( pos ) );
						part2 = $.trim( part2.substring( 0, pos ) );
					}
					
					delegate[ prop ][ part2 ] = sel;
					
					evt = $.trim( part1 + part2 );
					
					if ( sel ) {
						subtgt = target.find( sel );
						if ( subtgt.length > 0 ) target = subtgt;
					}
					
					if ( evt ) {
						func = _.bind( func, view );
						if ( 'collection:initialize' == evt ) target.on( evt, func );
					}
				}
			} );
			
			
			// _.showMe( delegate );
			
			$.each( props, function( i, prop ) {
				if ( view[ prop ] && view[ prop ].on ) {
					
					// delegate to master element (default), or sub-elements
					view[ prop ].on( 'all', function() {
						
						var args = $.makeArray( arguments );
						var evt = args.shift();
						var event = prop + ':' + evt;
						var sel = null, target = view.$el, subtgt = null;
						
						if (
							( delegate[ prop ] ) && 
							( typeof delegate[ prop ][ evt ] !== 'undefined' )
						) {
							sel = delegate[ prop ][ evt ];
							if ( sel ) {
								subtgt = view.$el.find( sel );
								if ( subtgt.length > 0 ) target = subtgt;
							}
							target.trigger( event, args );
						}
						
					} );
					
					if ( 'collection' == prop ) {
						view.collection.each( function( model ) {
							view.$el.trigger( 'collection:initialize', [ model ] );
							// _.showMe( model );
						} );
					}
				}
			} );
			
		},
		
		
		// wrapper for Backbone.View.extend() which applies enhancements to events
		extend: function() {
			var args = $.makeArray( arguments );
			if ( args[ 0 ] ) {
				args[ 0 ] = this.modifyViewProps( args[ 0 ] );
			}
			return Backbone.View.extend.apply( Backbone.View, args );
		}
			
	};
	
	
	/* ------------------------------------------------------------------------------------------ */
	
	// model bindings
	
	//
	Backbone.View.prototype._unloadFromModel = function( model, elem ) {
		
		if ( !model ) model = this.model;
		if ( !elem ) elem = this.$el;
		
		if ( model && elem ) {
			var data = model.toJSON();
			$.each( data, function( prop, val ) {
				
				// try these selectors
				var sels = [ '.' + prop, '#' + prop ];
				
				$.each( sels, function( i, sel ) {
					var target = elem.find( sel );
					if ( target.length > 0 ) {
						var tag = target.prop( 'tagName' ).toLowerCase();
						if ( 'input' == tag ) {
							target.val( val );
						} else {
							target.html( val );						
						}
						return false;
					}
				} );
				
			} );
		}
		
	};
	
	//
	Backbone.View.prototype._unloadFromView = function( model, elem ) {
		
		var ret = {};
		
		if ( !model ) model = this.model;
		if ( !elem ) elem = this.$el;
		
		if ( model && elem ) {
			var data = model.toJSON();
			$.each( data, function( prop, oldval ) {
				
				var newval = null;
				
				// try these selectors
				var sels = [ '.' + prop, '#' + prop ];
				
				$.each( sels, function( i, sel ) {
					var target = elem.find( sel );
					if ( target.length > 0 ) {
						var tag = target.prop( 'tagName' ).toLowerCase();
						if ( 'input' == tag ) {
							newval = target.val();
						} else {
							newval = target.html();						
						}
						ret[ prop ] = newval;
						return false;
					}
				} );
				
			} );	
		}
		
		// _.showMe( ret );
		
		return ret;
	};
	
	//
	Backbone.View.prototype._loadToModel = function( model, elem ) {
		
		if ( !model ) model = this.model;
		if ( !elem ) elem = this.$el;
		
		if ( model && elem ) {
			model.set( this._unloadFromView( model, elem ) );
		}
	};
	
} ).call( this );