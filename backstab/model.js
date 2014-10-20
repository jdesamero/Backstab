/*
 * "backstab/model.js"
 * https://github.com/jdesamero/Backstab
 *
 * Copyright (c) 2013 Joel Desamero.
 * Licensed under the MIT license.
 *
 * depends on "backstab/core.js"
 */

( function() {
	
	var $ = this.jQuery;
	var Backbone = this.Backbone;
	var Backstab = this.Backstab;
	
	//
	Backstab.createConstructor( 'Model', {}, {
				
		// apply enhancements to Backbone.Model
		latchToBackbone: function() {
			
			var _this = this;
			
			this._backboneExtend = Backbone.Model.extend;
			
			Backbone.Model.extend = function() {
				
				var args = $.makeArray( arguments );
				
				if ( args[ 0 ] ) {
					args[ 0 ] = _this.modifyModelProps( args[ 0 ] );
				}
				
				return _this._backboneExtend.apply( Backbone.Model, args );
			};
			
			return this;
		},
		
		// revert to the original Backbone.Model.extend() method
		unlatchFromBackbone: function() {
			Backbone.Model.extend = this._backboneExtend;
			return this;
		},
		
		
		//
		modifyModelProps: function( obj ) {
			
			var _this = this;
			
			// make sure there is an initialize() method
			if ( !obj.initialize ) {
				obj.initialize = function() { };
			}
			
			
			// execute bindDelegates() after calling initialize()
			if ( 'function' === $.type( obj.initialize ) ) {
				
				var init = obj.initialize;
				var initWrap = function() {
					
					var oArg2 = arguments[ 1 ];
					if ( oArg2 && oArg2.data ) {
						this.data = oArg2.data;
					}
					
					var res = init.apply( this, arguments );
					
					return res;
				};
				
				obj.initialize = initWrap;
			}
			
			return obj;
		},
		
		
		// wrapper for Backbone.Model.extend() which applies enhancements to events
		extend: function() {
			
			var args = $.makeArray( arguments );
			
			if ( !args[ 0 ] ) {
				args[ 0 ] = {};
			}
			
			args[ 0 ] = this.modifyModelProps( args[ 0 ] );
			
			return Backbone.Model.extend.apply( Backbone.Model, args );
		}
		
	} );
	
	/* ------------------------------------------------------------------------------------------ */
	
	// model bindings
	
	_.extend( Backbone.Model.prototype, {
		
		getDataValues: function() {
			
			var model = this;
			
			var ret = {};
			for ( var i = 0; i < arguments.length; i++ ) {
				var key = arguments[ i ];
				ret[ key ] = model.get( key );
			}
			
			return ret;
		},
		
		toggleValue: function( sKey ) {
			
			if ( 'boolean' === $.type( this.get( sKey ) ) ) {
				var bToggle = this.get( sKey ) ? false : true ;
				this.set( sKey, bToggle );
			}
			
			return this;
		}
		
	} );
	
	
	
} ).call( this );



