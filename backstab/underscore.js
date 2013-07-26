/*
 * "backstab/underscore.js"
 * https://github.com/jdesamero/Backstab
 *
 * Copyright (c) 2013 Joel Desamero.
 * Licensed under the MIT license.
 *
 * Enhancements to "Underscore.js" for use by Backstab
 */

( function() {
	
	var _ = this._;
	
	//// added functions
	
	// _.beginsWith() function
	
	if ( !_.beginsWith ) {
		
		_.beginsWith = function( haystack, needle ) {
			
			if ( 'string' !== $.type( haystack ) ) {
				alert( 'Backstab: _.beginsWith( haystack, needle ): invalid first parameter (haystack) provided!' );			
			}
			
			if ( 'string' === $.type( needle ) ) {
				
				// return "true" if needle begins with string, otherwise return "false"
				return ( haystack.substring( 0, needle.length ) === needle ) ? true : false;
			
			} else if ( 'array' === $.type( needle ) ) {
				
				// if *haystack* begins with any of the values in *needle* array, return the matching value
				// otherwise, return "false"
				var len = needle.length;
				
				for ( var i = 0; i < len; i++ ) {
					if ( _.beginsWith( haystack, needle[ i ] ) ) {
						return needle[ i ];
					}
				}
				
				return false;			
			}
			
			alert( 'Backstab: _.beginsWith( haystack, needle ): invalid second parameter (needle) provided!' );
			
			return null;
		};
		
		_.beginsWith.backstab = true;		// check
		
	} else {
		
		if ( !_.beginsWith.backstab ) {
			alert( 'Backstab: conflict with _.beginsWith()!' );
		}
	}
	
	// _.showMe() function, for debugging
	
	if ( !_.showMe ) {
		
		_.showMe = function() {
			var args = $.makeArray( arguments );
			var obj = ( args.length > 1 ) ? args : args[ 0 ] ;
			alert( JSON.stringify( obj ) );
		};
		
		_.showMe.backstab = true;		// check
		
	} else {
		
		if ( !_.showMe.backstab ) {
			alert( 'Backstab: conflict with _.showMe()!' );
		}
	}
	
	//// overrides
	
	// make _.contains() work with strings
	// eg: _.contains( 'The quick brown fox...', 'quick' ) -> true
	
	if ( !_.containsOrig ) {
		
		_.containsOrig = _.contains;

		_.contains = function( subject, value ) {
			if ( ( 'string' === $.type( subject ) ) && ( 'string' === $.type( value ) ) ) {
				return ( subject.indexOf( value ) !== -1 ) ? true : false ;
			}
			return _.containsOrig( subject, value );
		};
		
		_.containsOrig.backstab = true;		// check
				
	} else {
		
		if ( !_.containsOrig.backstab ) {
			alert( 'Backstab: conflict with _.containsOrig()!' );
		}
	}
	
	
} ).call( this );