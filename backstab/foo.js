// depends on "backstab/core.js"
( function() {
	
	var Backbone = this.Backbone;
	var Backstab = this.Backstab;
	
	//
	Backstab.Foo = function() {
		this.initialize.apply( this, arguments );
	};
	
	//
	_.extend( Backstab.Foo.prototype, Backstab.Events, {
		initialize: function() { },
		foo: function() {
			alert( 'Foo' );
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