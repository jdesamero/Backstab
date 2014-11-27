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
