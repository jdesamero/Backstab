/*
 * "backstab/dispatcher.js"
 * https://github.com/jdesamero/Backstab
 *
 * Copyright (c) 2013 Joel Desamero.
 * Licensed under the MIT license.
 *
 * depends on "backstab/core.js"
 */

( function() {
	
	var Backbone = this.Backbone;
	var Backstab = this.Backstab;
	
	//
	Backstab.Dispatcher = function() {
		this.initialize.apply( this, arguments );
	};
	
	//
	_.extend( Backstab.Dispatcher.prototype, Backstab.Events, {
		initialize: function() { }
	} );
		
	//
	Backstab.Dispatcher.extend = Backstab.extend;
	
	// create a global instance
	var Dispatcher = Backstab.Dispatcher.extend();
	Backstab.Dispatcher.global = new Dispatcher();
	
	//
	Backstab.Dispatcher.latchToBackbone = function() {
		Backbone.Dispatcher = Backstab.Dispatcher;
		return this;
	};
	
} ).call( this );
