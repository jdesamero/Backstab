/*
 * "backstab/core.js"
 * https://github.com/jdesamero/Backstab
 *
 * Copyright (c) 2013 Joel Desamero.
 * Licensed under the MIT license.
 *
 * depends on "backstab/underscore.js"
 */

( function() {
	
	this.Backstab = {};
	
	var $ = this.jQuery;
	var Backstab = this.Backstab;
	
	//
	Backstab.extend = function( protoProps, staticProps ) {
		
		// alert( this );
		
		var parent = this;
		var child;
		
		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if ( protoProps && _.has( protoProps, 'constructor' ) ) {
			child = protoProps.constructor;
		} else {
			child = function() {
				return parent.apply( this, arguments );
			};
		}
		
		// Add static properties to the constructor function, if supplied.
		_.extend( child, parent, staticProps );
		
		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function() {
			this.constructor = child;
		};
		
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;
		
		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if ( protoProps ) _.extend( child.prototype, protoProps );
		
		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;
		
		return child;
		
	};
	
	// in case we want to add enhancements Backbone.Events in the future
	Backstab.Events = Backbone.Events;
	
	
	
	// Backstab constructor template
	Backstab.createConstructor = function( namespc, opts, staticProps, origCons ) {
		
		
		// define a new constructor
		
		var cons = function() {
			
			if ( this.beforeInit ) {
				this.beforeInit.apply( this, arguments );
			}
			
			if ( origCons ) {
				
				origCons.apply( this, arguments );
				
			} else {
			
				if ( this.initialize ) {
					this.initialize.apply( this, arguments );
				}
			
			}
			
			if ( this.setup ) {
				this.setup.apply( this, arguments );
			}
			
			if ( this.afterInit ) {
				this.afterInit.apply( this, arguments );
			}
			
		};
		
		
		var useExtend;
		
		if ( origCons ) {
			
			cons.prototype = Object.create( origCons.prototype );			
			useExtend = origCons.extend;
			
		} else {
			
			_.extend( cons.prototype, Backstab.Events );
			useExtend = Backstab.extend;
		}
		
		if ( opts ) {
			_.extend( cons.prototype, opts );
		}
		
		
		
		cons.extend = function( protoProps2, staticProps2 ) {
			
			if ( !protoProps2 ) protoProps2 = {};
			
			if ( origCons ) {
				_.extend( protoProps2, opts );
			}
			
			if ( this.modifyProps ) {
				protoProps2 = this.modifyProps( protoProps2 );
			}
			
			var extendedCons = useExtend.call( cons, protoProps2, staticProps2 );
			
			// extend() needs to be overridden
			extendedCons.extend = function() {
				return useExtend.apply( extendedCons, arguments );
			};
			
			return extendedCons;
		}
		
		
		if ( staticProps ) {
			_.extend( cons, staticProps );
		}
		
		
		if ( namespc ) {
		
			cons._namespace = namespc;
			
			// add to Backstab namespace
			Backstab[ namespc ] = cons;
			// alert( 'created constructor: ' + cons._namespace );
		}
		
		return cons;
	};
	
} ).call( this );