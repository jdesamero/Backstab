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



Backstab.View Special Methods
------------------------------

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

The only catch here is that the elements you want to assign values to must have a class or ID which matches the title of the model attribute _exactly_. Ie. The model's `title` attribute will ONLY pair itself with an element with a class or ID of  `title`. It will first search for a matching class, and, if it does not find one will pair itself with a matching ID. Thus, be mindful with your element ID and class names.

`extractModelValues()` takes several arguments: `oModel`, `eElem`, `oParams`

`oModel` - A different model than the one assigned to the view can be used by passing the external model as the first argument. If no argument is passed, then `this.model` is assumed (with `this` referring to the view).

`eElem` - Likewise, a different element than `$el` can be used by passing the desired element as the second argument. If no argument is passed, then `this.$el` is assumed (again, with `this` referring to the view).

`oParams` - The `oParams` argument allows you to apply specific parameters to a model attribute.  Provide `oParams` with a key for the attribute you want to apply parameters to, and give it values for any or all of the following: `selector`, `contents`, `defer`. `oParams` is defined on the same level as `initialize`:

```javascript
oParams: {
	title: { // key matching attribute to apply params to
		selector: // choose a selector for the attribute,
		contents: // define the contents of the attribute,
		defer: // allows you to defer the data for this attribute from loading
	}
}
```



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

The `oModel`, `eElem`, and `oParams` arguments work exactly as above in `extractModelValues()`

`oFields` - You can force the model to search for specific fields by passing them as the fourth argument. This is an alternate method for defining the defaults for a models attributes.


