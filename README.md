Backstab
==========

Backstab provides enhancements to Backbone.js.

Index
-------
    
- ``Backstab.View``. Makes a number of enhancements to the standard `Backbone.View` `events` hash.
- ``Backstab.Dispatcher``. Provides a way for views to communicate without directly referencing each other.
- ``Backstab.StateMachine``. A state machine that provides Backbone.js-style functionality.
- ``Backstab.Foo``. An example sub-class that can be used as a guideline for creating your own Backstab sub-classes.
- ``Backstab.family``. Groups a family of models, collections, and views under one namespace.
- ``Backstab`` (Core). The main Backstab object provides the namespace for the various Backstab sub-classes. It also offers loading/override functionality if you want to use the standard Backbone namespace.
- ``Backstab`` (Underscore.js Enhancements). Backstab adds some more utility functions to the Underscore.js namespace.
- Backstab Special Methods: ``createElement()``, ``extractModelValues()``, ``setModelValues()``


Backstab.View
---------------

`Backstab.View` makes a number of enhancements to the standard `Backbone.View` `events` hash.

```javascript

// standard usage
events: {
	'someevent someselector': 'someMethod',
	'otherevent otherselector': 'otherMethod',
	// etc...
}
```

Multiple event/selector combos can be separated using a semi-colon (;) which can target the same 
method.

```javascript

// extended usage
events: {
	'someevent someselector; otherevent otherselector': 'sameMethod'
	// etc...
}
```

View properties that have an `on()` method are detected when initializing the view object. Events 
can then be delegated using _&lt;property name&gt;:&lt;event name&gt;_ syntax.

View properties that have an `each()` method can trigger an `initialize` event. When the view is 
initialized, the members of the property are iterated and passed to the callback method.

```javascript

// model
var Song = Backbone.Model.extend( {
	defaults: { ... }
} );

// collection
var Album = Backbone.Collection.extend( {
	model: Song
} );

// item view
var ItemView = Backstab.View.extend( {
	
	events: {
		// other events
		'model:change': 'updateSong'
	},
	
	updateSong: function( e, model ) {
		// do stuff
	}
	
} );


// list view
var ListView = Backstab.View.extend( {
	
	events: {
		// other events ...
		'collection:initialize; collection:add': 'addSong'		
	},
	
	// same method is used when initializing existing songs
	// as well as the addition of new songs
	addSong: function( e, song ) {
		var item = new ItemView( { model: song } );
		this._items.push( item );
		this.$el.append( item.render().$el );
		return item;
	}
	
} );

jQuery( document ).ready( function( $ ) {			
	
	var song1 = new Song( ... );
	var song2 = new Song( ... );
	// more songs
	
	var songs = [ song1, song2 ... ];
	
	var myAlbum = new Album( songs );
	
	//// views
	
	var songlist = new ListView( {
		collection: myAlbum,
		el: $( '#songlist' )
	} );
	
} );

```

Callback value can be an array, the first value being the name of the method or actual function. 
The rest of the parameters are passed to the callback.

```javascript

var SomeView = Backstab.View.extend( {
	
	events: {
		'click #apple, #banana, #orange': [ 'whatAmI', 'fruit' ],
		'click #carrot, #broccoli': [ 'whatAmI', 'vegetable' ],
		'click #bacon, #ham, #steak': [ 'whatAmI', 'meat' ]
	},
	
	whatAmI: function( e, type ) {
		alert( $( e.target ).attr( 'id' ) + ' is a ' +  type );
		// click on #carrot -> 'carrot is a vegetable'
	}
	
}

```

Specifying related events can be made more concise using a curly brace {} notation.

```javascript

events: {
	'fruit:pick:{ apple; pear; banana } div.title': 'updateTitle'
	// same as:
	// 'fruit:pick:apple div.title': 'updateTitle',
	// 'fruit:pick:pear div.title': 'updateTitle',
	// 'fruit:pick:banana div.title': 'updateTitle'
}

```

Nested curly braces {} work!

```javascript

events: {
	'fruit:pick:{ apple:{ green; red }; pear; banana } div.title': 'updateTitle'
	// same as:
	// 'fruit:pick:apple:green div.title': 'updateTitle',
	// 'fruit:pick:apple:red div.title': 'updateTitle',
	// 'fruit:pick:pear div.title': 'updateTitle',
	// 'fruit:pick:banana div.title': 'updateTitle'
}

```


Backstab.Dispatcher
---------------------

`Backstab.Dispatcher` provides a way for views to communicate without directly referencing each other.

```javascript

// item
var ItemView = Backbone.View.extend( {

	events: {
		// other events ...
		'click .del': 'deleteItem'
	},

	dispatcher: Backstab.Dispatcher.global,
	
	deleteItem: function() {
		this.dispatcher.trigger( 'deleteSong', this.model, this );
		this.remove();
		return false;			
	}
	
} );

// list
var ListView = Backstab.View.extend( {
	
	dispatcher: Backstab.Dispatcher.global,
	
	events: {
		// other events ...
		'dispatcher:deleteSong': 'deleteSong'
	},

	deleteSong: function( e, song, item ) {
		this._items = _.without( this._items, item );
		this.collection.remove( song );
	}

} );

```

Backstab.StateMachine
-----------------------

`Backstab.StateMachine` provides Backbone.js-style functionality. It is actually a wrapper for 
[Javascript Finite State Machine (v2.2.0)](https://github.com/jakesgordon/javascript-state-machine) 
(required).

```javascript

var iAnimDelay = 1000;

//// states

var SliderState = Backstab.StateMachine.extend( {
	events: [
		{ name: 'startup', from: 'none', to: 'transpicker' },
		
		{ name: 'gotoresults', from: [ 'picker', 'details' ], to: 'transresults' },
		{ name: 'gotoresults', from: 'transresults', to: 'results' },
		
		{ name: 'gotodetails', from: 'results', to: 'transdetails' },
		{ name: 'gotodetails', from: 'transdetails', to: 'details' },
		
		{ name: 'gotopicker', from: [ 'results', 'details' ], to: 'transpicker' },
		{ name: 'gotopicker', from: 'transpicker', to: 'picker' }
	]
} );

```

In the example above, the slider instance will trigger the following [events](https://github.com/jakesgordon/javascript-state-machine#callbacks).

- _before:&lt;someevent&gt;_
- _leave:&lt;somestate&gt;_
- _enter:&lt;somestate&gt;_
- _after:&lt;someevent&gt;_
- _error:&lt;someevent&gt;_ (additional event triggered when attempting an invalid state transition)

The event handler function will be provided an additional state object which contains all the pertinent 
information about the event or change in state.

```javascript

state.on( 'before:someevent', function( e, st ) {
	// 	st = {
	// 		event: 'someevent',
	// 		fromstate: 'somestate',
	// 		tostate: 'otherstate',
	// 		trigger: [ 'before' | 'leave' | 'enter' | 'after' ]
	// 	};
} );

// the 'error' event has additional details
state.on( 'error:someevent', function( e, st ) {
	// 	st = {
	// 		// same details as above, plus:
	//		error: {
	//			// comes from the default error handler
	//			args: errorArgs,
	//			code: errorCode,
	//			message: errorMessage
	//		}
	// 	};
} );

```

The following example shows how an instance of `SliderState()` can be used in the context of a Backbone.js 
application.

```javascript

var goSliderState = new SliderState();


//// views

// slider
		
var SliderView = Backstab.View.extend( {
	
	events: {
		
		'state:enter:transresults': [ 'setSliderPanel', 'results' ],
		'state:enter:transdetails': [ 'setSliderPanel', 'details' ],
		'state:enter:transpicker': [ 'setSliderPanel', 'picker' ],
		
		'state:leave:results': [ 'setSliderPanel', 'results' ],
		'state:leave:details': [ 'setSliderPanel', 'details' ],
		'state:leave:picker': [ 'setSliderPanel', 'picker' ]
	},
	
	tagName: 'ul',
	
	state: goSliderState,
	
	setSliderPanel: function( evt, state, st ) {
		
		var _this = this;				
		var trigger = state.trigger;
		
		var eLi = this.$el.find( 'li.' + st );
		var eH2 = eLi.find( 'h2' );
		
		if ( trigger == 'enter' ) {
			
			// currently in some transition state:
			// 'transresults', 'transdetails', or 'transpicker'
			eH2.fadeIn( iAnimDelay, function() {
				
				eLi.addClass( 'active' );
				
				// once animation is completed, go to final state:
				// 'results', 'details', or 'picker'
				_this.state.trigger( 'goto' + st );
			} );

		} else if ( trigger == 'leave' ) {
			
			// hold current state
			_this.state.hold();
			
			eH2.fadeOut( iAnimDelay, function() {
				
				eLi.removeClass( 'active' );
				
				// release when animation has completed
				_this.state.release();
			} );
			
		}
	}
	
} );

// control buttons
var ControlsView = Backstab.View.extend( {
	
	events: {
		'click #ctl_1': [ 'goTo', 'results' ],
		'click #ctl_2': [ 'goTo', 'details' ],
		'click #ctl_3': [ 'goTo', 'picker' ],
		'state:error:gotodetails': 'showError'			
	},
	
	state: goSliderState,
	
	goTo: function( e, dest ) {
		this.state.trigger( 'goto' + dest );
		return false;
	},
				
	showError: function( e, st ) {
		alert( 'You must pick results first before going to the details page!' );
	}
	
} );


// control buttons
var InfoView = Backstab.View.extend( {

	events: {
				
		'state:enter:picker': [ 'onPanel', 'Picker' ],
		'state:enter:results': [ 'onPanel', 'Results Page' ],
		'state:enter:details': [ 'onPanel', 'Details Page' ],
		
		'state:before:{ gotoresults; gotodetails; gotopicker }': [ 'onTransition', 'before:goto...' ],
		'state:enter:{ transresults; transdetails; transpicker }': [ 'onTransition', 'enter:trans...' ]
						
	},
	
	state: goSliderState,
	
	onPanel: function( e, st, msg ) {
		this.$el.removeClass( 'transition' ).html( 'On the ' + msg );			
	},
	
	onTransition: function( e, st, msg ) {
		this.$el.addClass( 'transition' ).html( 'Transitioning... (' + msg + ')' );
	}
	
} );

// shows current state
alert( goSliderState.current );

```

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

Backstab.family
--------------

`Backstab.family` creates an object which links together related Backbone objects. The standard `Backstab.family` object has a `model`, `collection`, `itemView`, `listView`, and `formView`. This is implemented to help group your code together in a much more organized and understanable way - keeping all related models, views, and collections grouped together. The family can be thought of as a namespace.

Boilerplate for a standard family:
```javascript
var Example = Backstab.family( {
	name: 'example',
	
	enableLocalDispatcher: true,
	
	model: {
		extend: {
			// defaults
		}
	},
	
	itemView: {
		extend: {
			events: {
				// events
			},
			createElement: function() {
				//designate element
			}
		}
	},
	
	listView: {
		extend: {
			// tagName, etc.
		}
	},
	
	formView: {
		extend: {
			events: {
				// events
			},
			initialize: function() {
				// code for initialize method
			},
			// etc
		}
	}
} );
```


**_Instantiation_**

Models, views, and collections are no longer given individual variable names. Instead, all Backbone object constructors are declared within the `Backstab.family` namespace variable (in this instance, `var Example`). Thus, when instantiating an object outside the family constructor, you would now use the format of `Namespace.Object`:

```javascript
var oAnimal = new Example.Model( {} );
var oZoo = new Example.Collection( {} );
var oZooView = new Example.ListView( {} );
// etc.
```


**_Extend_**

The `extend` method is now called within the declaration for the model or view, and all other methods (`defaults`, `events`, `initialize`, etc.) are then called within `extend`.


**_Dispatcher_**

When creating a family, you can set the `enableLocalDispatcher` method to 'true'. This will create a `localDispatcher` for all members of the family. When delegating the dispatcher to trigger a method, the only thing you will do differently is to reference `this.localDispatcher`, rather than the standard `this.dispatcher` (as is used for a global dispatcher). Likewise, when declaring the method in the `events` hash, `dispatcher` must be replaced with `localDispatcher`:


```javascript
// Without Family
'dispatcher:someMethod this': 'doThis'

// With Family
'localDispatcher:someMethod': 'doThis'
```

The only catch is that since the dispatcher is no longer global, objects outside the family will have no knowledge of a family's `localDispatcher` unless explicitly given in the instantiation of the outside object:

```javascript
var oNewButton = new ControlsView( {
	data: {
		exampleDispatcher: oZooView.localDispatcher
	}
} );
```

Here you simply create a name for the localDispatcher (convention says to use the 'name' you provided when creating the family, suffixed with 'Dispatcher'), and associate it with the instance of a member of that family within the data hash. 

When referring to a family's localDispatcher from the constructor of an object outside of the family, use the name you gave the dispatcher when you instantiated the object, prefixed by 'data'.

```javascript
// When Defining an Event
doThis: function() {
	this.data.exampleDispatcher.trigger( // what to do );
}
```


**_Collections_**

`Backstab.family` takes care of creating the collection and linking it with the family's model for you. You still instantiate it the same way as before, but you no longer need to create a constructor for it.


**_Backbone Special Events_**

As well as taking care of collection creation in the background, `Backstab.family` also handles Backbone's special events (`add`, `change`, `destroy`). There is no longer any need to declare or bind these to your custom events. Therefore, calling `this.model.destroy()` or `this.model.add()` in your custom events will automatically call `destroy` and `add`, respectively. Any change to the model (ex. via `extractModelValues()` or `setModelValues()`) will trigger `change`.


**_Initialize_**

`Backstab.family` also takes care of the `initialize` method in the background if it is not declared in the constructor. This also means that, like `add/change/destroy`, you no longer need to declare it in the events hash.


**_Params_**

`Backstab.family` also provides a `params` method for specific configuration of your objects. They can be used to override `Backstab.family`'s default functionality. Specific parameters can be found in `backstab/family.js`. The `params` hash is declared on the same level as `extend`.



Backstab.family
--------------

The `Backstab.family()` function creates a family of related models, collections, and views in one namespace.

HTML

```html

	<div id="thinglist"></div>
	<form id="thingform"></form>

```

Javascript

```javascript

var Thing = Backstab.family( {
	
	name: 'thing'
	
} );

// model constructor is Thing.Model

var oThings = new Thing.Collection( [
	{ num: 101, name: 'Umbrella' },
	{ num: 102, name: 'Shoes' },
	{ num: 103, name: 'Fan' }
] );

// an "item view" constructor, Thing.ItemView, is instantiated with the
// collection's models, and then appended automatically to the "list view"

var oThingsView = new Thing.ListView( {
	collection: oThings,
	el: $( '#thinglist' )
} );

var oThingFormView = new Thing.FormView( {
	el: $( '#thingform' )
} );

```


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

Backstab (Underscore.js Enhancements)
---------------------------------------

Backstab adds some more utility functions to the Underscore.js namespace.

The following functions are added:

- ``_.beginsWith( haystack, needle, greedy )``. _&lt;content to come&gt;_
- ``_.expandCurlyShortform( expression )``. _&lt;content to come&gt;_
- ``_.descendant( object, path )``. _&lt;content to come&gt;_
- ``_.objectType( object )``. _&lt;content to come&gt;_
- ``_.descendantsWithMethod( subject, method, maxLevels )``. _&lt;content to come&gt;_
- ``_.stringify( arg1, arg2, ... argN )``. _&lt;content to come&gt;_
- ``_.showMe( arg1, arg2, ... argN )``. _&lt;content to come&gt;_
- ``_.mergeValues( key, target, params )``. _&lt;content to come&gt;_

The following functions are overloaded, original functionality should not be affected:

- ``_.contains( subject, value )``. _&lt;content to come&gt;_



Backstab Special Methods
-------------------------

**_createElement()_**

`createElement()` can be used in place of assigning an existing or new DOM element to a view's el in the `initialize` method. `createElement()` creates a brand new element for each instance of the view, so cloning/copying the element is not necessary.

```javascript
// Backbone
initialize: function() {
	this.$el = $( '#element' );
	// or
	this.$el = $( '<a href="#">Click Me</a>' );
	// or
	this.$el = $( '#article-tmpl' ).tmpl( {} );
}

// Backstab
createElement: function() {
	return $( '#element' );
	// or
	return $( '<a href="#">Click Me</a>' );
	// ir
	return $( '#article-tmpl' ).tmpl( {} );
}
```



**_extractModelValues( oModel, eElem, oParams )_**

The `extractModelValues()` method allows you to assign model values to DOM elements in a succinct, 'DRY' manner.

With vanilla Backbone, assigning model values to a DOM element would look like so:

```javascript
this.$el.find( '.title' ).html( this.model.get( 'title' );
this.$el.find( '.author' ).html( this.model.get( 'author' );
this.$el.find( '.date' ).html( this.model.get( 'date' );
```

There's a lot of repetition there and it has to potential to grow cumbersome the more elements you need to assign values to.

Using Backstab, this process can be reduced to on line:

```javascript
this.extractModelValues();
```

The only catch here is that the elements you want to assign values to must have a class or ID which matches the title of the model attribute _exactly_. Ie. The model's `title` attribute will ONLY pair itself with an element with a class or ID of `title`. It will first search for a matching class, and, if it does not find one will pair itself with a matching ID. Thus, be mindful with your element ID and class names.

`extractModelValues()` takes several argumens: `oModel`, `eElem`, `oParams`
`oModel` - A different model than the one assigned to the view can be used by passing the outside model as the first argument. If no argument is passed, then `this.model` is assumed (with `this` referring to the view).
`eElem` - Likewise, a different element than `$el` can be used by passing the desired element as the second argument. If no argument is passed, then `this.$el` is assumed (again, with `this` referring to the view).
`oParams` - Content to come.



**_setModelValues( oModel, eElem, oParams, oFields )_**

`setModelValues()` works in much the same way as `extractModelValues()`, but in reverse! Using `setModelValues()` will assign a DOM element's value to the matching model attribute.

Just like with `extractModelValues()`, using `setModelValues()` vastly reduces your code:

```javascript
// Backbone
article.set( {
	'title': this.$el.find( '.title' ).val(),
	'author': this.$el.find( '.author').val(),
	'date': this.$el.find( '.date' ).val()
} );

// Backstab
this.setModelValues( article );
```

The same rules apply here: the model will first look for a class that matches its attribute, and then will move on to an ID if it cannot find one. 

One minor thing to note when using this method is that if the model is blank it must have defaults defined in order for it to know which fields to search for.

`setModelValues()` takes several arguments: `oModel`, `eElem`, `oParams`, `oFields`
The `oModel` and `eElem` arguments work exactly as above in `extractModelValues()`
`oParams` - Content to come
`oFields` - You can force the model to search for specific fields by passing them as the fourth argument. Content to come.



Contact
=========
Email me at joel@geekoracle.com if you have any feedback, comments, ideas, suggestions, etc. Contributions 
welcome (especially with documentation and testing)!


License
=========
Copyright (c) 2013 - 2014 Joel Desamero  
Licensed under the MIT license.

