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
