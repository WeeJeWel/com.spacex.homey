'use strict';

const events = require('events');

const Youtube = require('youtube-api');

class SpaceXLiveStream extends events.EventEmitter {

	constructor( apiKey ) {
		super();

		this._poll = this._poll.bind(this);
		this._pollUpcoming = this._pollUpcoming.bind(this);
		this._pollLive = this._pollLive.bind(this);

		this._pollInterval = 5000;
		//this._channelId = 'UCsO1cIAYmZxvKzDKv91zgog'; // WeeJeWel92
		this._channelId = 'UCtI0Hodo5o5dUb67FeUjDeA'; // SpaceX
		this._apiKey = apiKey;

		Youtube.authenticate({
			type: 'key',
			key: this._apiKey
		});

		this._pollUpcomingInterval = setInterval( this._pollUpcoming, this._pollInterval );
		this._pollLiveInterval = setInterval( this._pollLive, this._pollInterval );

		this._videoIds = {};

	}

	_pollUpcoming() {
		this._poll('upcoming');
	}

	_pollLive() {
		this._poll('live');
	}

	_poll( eventType ) {
		Youtube.search.list({
			part: 'snippet',
			type: 'video',
			eventType: eventType,
			channelId: this._channelId
		}, ( err, result ) => {
			if( err ) return console.error( err );

			result.items.forEach( item => {
				if( item.snippet.liveBroadcastContent === eventType ) {
					let videoId = item.id.videoId;

					this._videoIds[ eventType ] = this._videoIds[ eventType ] || [];

					if( this._videoIds[ eventType ].indexOf( videoId ) === -1 ) {
						this._videoIds[ eventType ].push( videoId );

						this.emit(eventType, videoId);
					}
				}
			});

		});
	}

}

module.exports = SpaceXLiveStream;