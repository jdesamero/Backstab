/*
 * "backstab/foo.js"
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
	Backstab.Foo = function() {
		this.initialize.apply( this, arguments );
	};
	
	//
	_.extend( Backstab.Foo.prototype, Backstab.Events, {
		
		initialize: function( opts ) {
			this.options = opts;
		},
		
		foo: function( msg ) {
			
			var alrt = 'Calling Foo!!!';
			
			if ( this.options.foo ) {
				alrt += ' (this.options.foo -> ' + this.options.foo + ')';
			}

			if ( msg ) {
				alrt += ' (msg -> ' + msg + ')';
			}
			
			alert( alrt );
			
			this.trigger( 'foo', this, msg );
			return this;
		}
				
	} );
	
	//
	Backstab.Foo.extend = Backstab.extend;
	
	//
	Backstab.Foo.latchToBackbone = function() {
		Backbone.Foo = Backstab.Foo;
		return this;
	};
	
} ).call( this );