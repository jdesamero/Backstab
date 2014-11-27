Backstab.Foo
--------------

`Backstab.Foo` is an example sub-class that can be used as a guideline for creating your own Backstab 
sub-classes. Also used as a dummy class for unit testing.

```javascript

var Foo = Backstab.Foo.extend( {
	
	// before initialize() is called, a setup function is called that assigns the first argument
	// ( opts ) to this.options
	
	initialize: function( opts, suffix ) {
		alert( this.options.foo + suffix );
	}
	
} );

var oFoo = new Foo( { foo: 'bar' }, 'keep' );
// alert -> 'barkeep'

// foo() is a method that triggers the 'foo' event when called
oFoo.foo( 'Yay' );
// alert -> Calling Foo!!! (this.options.foo -> "bar") (msg -> "Yay")

```
