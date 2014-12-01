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
	
	//// set up the Backstab namespace and descendants
	
	var $ = this.jQuery;
	
	var Backstab = {
		
		setNamespace: function() {
			Geko._setNamespace.apply( Backstab, arguments );
		}
		
	};
	
	
	//// set up Base class
	
	Backstab.setNamespace( 'Base', function() {
		
		if ( this.initialize ) {
			this.initialize.apply( this, arguments );
		}
		
	} );
	
	
	// the Backbone.Model.extend can be used universally
	// Backbone.Collection.extend, Backbone.View.extend, etc. references the same method
	Backstab.Base.extend = Backbone.Model.extend;
	
	
	// mix-in Backbone.Events
	$.extend( Backstab.Base.prototype, Backbone.Events );
	
	
	
	//// set global
	
	this.Backstab = Backstab;
	
	
} ).call( this );