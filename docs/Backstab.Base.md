Backstab (Core)
-----------------

The `createConstructor()` method offers an easy way to define a Backbone.js-style constructor.

```javascript

// first argument is the sub-class namespace
Backstab.createConstructor( 'Foo', {
	// prototype methods/properties go here
	foo: function() {
		alert( 'Bar!!!' );
	}
} );

// at this point, Backstab.Foo is now defined

var Foo = Backstab.Foo.extend( {
	// more methods/properties/overrides
} );

var oFoo = new Foo();
oFoo.foo();			// alert -> Bar!!!

```
