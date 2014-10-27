expected = function( actualRes, params, msg ) {
	
	var suffix = '';
	var expectedRes = params._exp;
	var actualResStr = _.stringify( actualRes );
	var expectedResStr = _.stringify( expectedRes );
	
	params._act = actualRes;
	
	if ( actualRes === expectedRes ) {
		suffix = ' (result: %s)'.printf( actualResStr );	
	}
	
	$.each( params, function( k, v ) {
		msg = msg.replace( '{{%s}}'.printf( k ), _.stringify( v ) );
	} );
	
	equal( actualRes, expectedRes, '%s%s'.printf( msg, suffix ) );
	
};

