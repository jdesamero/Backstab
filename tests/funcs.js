expected = function( actualRes, params, msg ) {
	
	var suffix = '';
	var expectedRes = params._exp;
	var actualResStr = _.stringify( actualRes );
	var expectedResStr = _.stringify( expectedRes );
	
	params._act = actualRes;
	
	if ( actualRes === expectedRes ) {
		suffix = ' (result: ' + actualResStr + ')';	
	}
	
	$.each( params, function( k, v ) {
		msg = msg.replace( '{{' + k + '}}', _.stringify( v ) );
	} );
	
	equal( actualRes, expectedRes, msg + suffix );
};
