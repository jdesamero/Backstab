expected = function( actualRes, params, msg ) {
	
	var suffix = '';
	var expectedRes = params._exp;
	var actualResStr = Backstab.Util.stringify( actualRes );
	var expectedResStr = Backstab.Util.stringify( expectedRes );
	
	params._act = actualRes;
	
	if ( actualRes === expectedRes ) {
		suffix = ' (result: %s)'.printf( actualResStr );	
	}
	
	$.each( params, function( k, v ) {
		msg = msg.replace( '{{%s}}'.printf( k ), Backstab.Util.stringify( v ) );
	} );
	
	equal( actualRes, expectedRes, '%s%s'.printf( msg, suffix ) );
	
};

