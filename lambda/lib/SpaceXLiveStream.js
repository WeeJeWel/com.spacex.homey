'use strict';

const Youtube = require('youtube-api');

class SpaceXLiveStream {

	constructor( apiKey ) {
		//this._channelId = 'UCsO1cIAYmZxvKzDKv91zgog'; // WeeJeWel92
		//this._channelId = 'UCNBGL6St1HR42u1lKbS4VJQ'; // Joost speelt spellen
		this._channelId = 'UCtI0Hodo5o5dUb67FeUjDeA'; // SpaceX
		this._apiKey = apiKey;

		Youtube.authenticate({
			type: 'key',
			key: this._apiKey
		});

	}

	getVideos( eventType ) {
		return new Promise((resolve, reject) => {
			Youtube.search.list({
				part: 'snippet',
				type: 'video',
				eventType: eventType,
				channelId: this._channelId
			}, ( err, result ) => {
				if( err ) return reject( err );
				
				let videoIds = [];
	
				result.items.forEach( item => {
					if( item.snippet.liveBroadcastContent === eventType ) {
						let videoId = item.id.videoId;	
						if( videoIds.indexOf( videoId ) === -1 ) {
							videoIds.push( videoId );
						}
					}
				});
				
				resolve( videoIds );
	
			});
		});
	}

}

module.exports = SpaceXLiveStream;