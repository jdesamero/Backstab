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
	
	var funclist = {
		
		beginsWith: {
			func: function( haystack, needle ) {
				
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
			}
		},
		
		expandCurlyShortform: {
			func: function( evtsel ) {
				
				var curlyRegex = /([^ ]+?)\{([^\{\}]+?)\}([^;\{\}]*)/g;
				
				if ( _.contains( evtsel, '{' ) ) {
					
					var regs = false, exp = '', subs = [];
					
					// pass 1.1
					while( regs = curlyRegex.exec( evtsel ) ) {
						// _.showMe( regs );
						exp = '';
						subs = regs[ 2 ].split( ';' );
						$.each( subs, function( i, v ) {
							if ( exp ) exp += '; ';
							exp += regs[ 1 ] + $.trim( v ) + regs[ 3 ];
						} );
						evtsel = evtsel.replace( regs[ 0 ], exp );
	
						// _.showMe( evtsel );
					}
					
					// _.showMe( evtsel );
					
					// do this recursively
					evtsel = _.expandCurlyShortform( evtsel );
				}
				
				return evtsel;
			}
		},
		
		showMe: {
			func: function() {
				var args = $.makeArray( arguments );
				var obj = ( args.length > 1 ) ? args : args[ 0 ] ;
				var seen = [];
				alert( JSON.stringify( obj, function( key, val ) {
					if ( typeof val == 'object' ) {
						if ( seen.indexOf( val ) >= 0 ) return;
						seen.push( val );
					}
					return val;
				} ) );
			}
		},
		
		containsOrig: {
			init: function() {
				_.containsOrig = _.contains;
			},
			func: function( subject, value ) {
				if ( ( 'string' === $.type( subject ) ) && ( 'string' === $.type( value ) ) ) {
					return ( subject.indexOf( value ) !== -1 ) ? true : false ;
				}
				return _.containsOrig( subject, value );
			}		
		}
		
	};
	
	// load function list
	$.each( funclist, function( funcName, v ) {

		if ( !_[ funcName ] ) {
			
			if ( v.init ) v.init();
			_[ funcName ] = v.func;
			_[ funcName ].backstab = true;		// check
			
		} else {
			
			if ( !_[ funcName ].backstab ) {
				alert( 'Backstab: conflict with _.' + funcName + '()!' );
			}		
		}
		
	} );
	
} ).call( this );