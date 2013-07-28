Backstab
==========

Backstab provides enhancements to Backbone.js.

Index
-------
    
- ``Backstab.View``. Makes a number of enhancements to the standard `Backbone.View` `events` hash.
- ``Backstab.Dispatcher``. Provides a way for views to communicate without directly referencing each other.
- ``Backstab.StateMachine``. A state machine modelled after standard Backbone.js sub-classes.
- ``Backstab.Foo``. This is a template for adding your own Backstab sub-classes.
- ``Backstab`` (Core). The main Backstab object provides the namespace for the various Backstab sub-classes. It also offers loading/override functionality if you want to use the standard Backbone namespace.
- ``Backstab`` (Underscore.js Enhancements). Backstab adds some more utility functions to the Underscore.js namespace.


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

Provides a way for views to communicate without directly referencing each other.

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

A state machine modelled after standard Backbone.js sub-classes. It is actually a wrapper for 
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

This is a template for adding your own Backstab sub-classes.

```javascript

var Foo = Backstab.Foo.extend( { } );
var oFoo = new Foo();
oFoo.foo();

```

Backstab (Core)
-----------------

The main Backstab object provides the namespace for the various Backstab sub-classes. It also offers 
loading/override functionality if you want to use the standard Backbone namespace.

```javascript

Backstab.latchToBackbone( 'View', 'Dispatcher', 'Foo' );

// Backbone.View.extend is now Backstab.View.extend
var ListView = Backbone.View.extend( {
	...
} );

// Backbone.Dispatcher.extend is now Backstab.Dispatcher.extend
var Dispatcher = Backbone.Dispatcher.extend( {
	...
} );

// Backbone.Foo.extend is now Backstab.Foo.extend
var Foo = Backbone.Foo.extend( {
	...
} );

```

The `latchToBackbone()` method can be called directly on the sub-class, if preferred.

```javascript

Backstab.View.latchToBackbone();
// same as:
// Backstab.latchToBackbone( 'View' );

```

Backstab (Underscore.js Enhancements)
---------------------------------------

Backstab adds some more utility functions to the Underscore.js namespace.

The following functions are added:

- ``_.beginsWith( haystack, needle )``. _&lt;content to come&gt;_
- ``_.expandCurlyShortform( expression )``. _&lt;content to come&gt;_
- ``_.descendant( object, path )``. _&lt;content to come&gt;_
- ``_.objectType( object )``. _&lt;content to come&gt;_
- ``_.descendantsWithMethod( subject, method, maxLevels )``. _&lt;content to come&gt;_
- ``_.stringify( arg1, arg2, ... argN )``. _&lt;content to come&gt;_
- ``_.showMe( arg1, arg2, ... argN )``. _&lt;content to come&gt;_

The following functions are overloaded, original functionality should not be affected:

- ``_.contains( subject, value )``. _&lt;content to come&gt;_


License
=========
Copyright (c) 2013 Joel Desamero  
Licensed under the MIT license.

