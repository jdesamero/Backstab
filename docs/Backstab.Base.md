Backstab.Base
-----------------

The `setNamespace()` method along with `Backstab.Base.extend()` provides an easy way to define a Backbone.js-style class.

```javascript

// first argument is the sub-class namespace
Backstab.setNamespace( 'Foo', Backstab.Base.extend( {
	// prototype methods/properties go here
	foo: function() {
		alert( 'Bar!!!' );
	}
} ) );

// at this point, Backstab.Foo is now defined

var Foo = Backstab.Foo.extend( {
	// more methods/properties/overrides
} );

var oFoo = new Foo();
oFoo.foo();			// alert -> Bar!!!

```
