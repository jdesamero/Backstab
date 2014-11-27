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
