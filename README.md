Backstab
==========

Backstab provides enhancements to Backbone.js.

Index
-------
    
- ``Backstab (Underscore.js Enhancements)``. <content to come>
- ``Backstab (Core)``. <content to come>
- ``Backstab.View``. <content to come>
- ``Backstab.Dispatcher``. <content to come>
- ``Backstab.StateMachine``. <content to come>
- ``Backstab.Foo``. <content to come>


Backstab (Underscore.js Enhancements)
---------------------------------------


Backstab (Core)
-----------------


Backstab.View
---------------

`Backstab.View` makes a number of enhancements to the standard `Backbone.View` `events` hash.

View properties that have an `on()` method are detected when initializing the view object. Events 
can then be delegated using <property name>:<event name> syntax.

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

	updateSong: function() {
		// do stuff
	}
	
} );

// list view
var ListView = Backstab.View.extend( {
	
	events: {
		
		// other events ...
		'collection:initialize; collection:add': 'addSong'
		
		// the abvove is the same as the following two lines:
		// 'collection:initialize': 'addSong',
		// 'collection:add': 'addSong'
		
	},

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
		alert( $( e.target ).attr( 'id' ) + ' ' +  type );
		// click on #carrot -> 'carrot vegetable'
	}
	
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

Requires [Javascript Finite State Machine (v2.2.0)](https://github.com/jakesgordon/javascript-state-machine)

```javascript

var iAnimDelay = 1000;

//// states

var SliderState = Backbone.StateMachine.extend( {
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
		
var SliderView = Backbone.View.extend( {
	
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

			eH2.fadeIn( iAnimDelay, function() {
				eLi.addClass( 'active' );
				_this.state.trigger( 'goto' + st );
			} );

		} else if ( trigger == 'leave' ) {

			_this.state.hold();
			
			eH2.fadeOut( iAnimDelay, function() {
				eLi.removeClass( 'active' );
				_this.state.release();
			} );
			
		}
	}
	
} );

// control buttons
var ControlsView = Backbone.View.extend( {
	
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
var InfoView = Backbone.View.extend( {

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

```

Backstab.Foo
--------------



```javascript

// var Foo = Backstab.Foo.extend( { } );
var Foo = Backbone.Foo.extend( { } );
var oFoo = new Foo();
oFoo.foo();

```

