'use strict';

const SpaceXLiveStream = require('./lib/SpaceXLiveStream.js');
const fetch = require('node-fetch');

exports.handler = (event, context, callback) => {
	
	const liveStream = new SpaceXLiveStream( process.env.YOUTUBE_KEY );
	const videosObj = {};
	
	Promise.all([ 'upcoming', 'live' ].map( type => {
		return liveStream.getVideos( type ).then( videos => {
			videosObj[ type ] = videos;
			
			if( videos.length > 0 ) {
				return fetch('https://webhooks.athom.com/webhook/5a9046708a645a820cc3969a/', {
					method: 'POST',
					body: JSON.stringify({
						type: type,
						videos: videos,
					}),
					headers: {
						'Content-Type': 'application/json'
					},
				}).then( res => res.text() )
				.then( console.log )
			}
		})
	})).then( result => {
		callback( null, result );
	}).catch( err => {
		console.error( 'error', err );
		callback( err );
	})
	
	
};

exports.handler( null, null, console.log );