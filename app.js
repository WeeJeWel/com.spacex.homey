'use strict';

const https = require('https');

const Homey = require('homey');

const POLL_URL = 'https://us-central1-firebase-spacex.cloudfunctions.net/getVideos';
const POLL_INTERVAL = 1000 * 60 * 2.5; // 2.5 min

class SpaceXApp extends Homey.App {

	onInit() {

		this.log('SpaceXApp is running...');
		
		this._flowTriggers = {
			upcoming: new Homey.FlowCardTrigger('upcoming'),
			live: new Homey.FlowCardTrigger('live'),
		};

		this._flowTriggers.upcoming.register();
		this._flowTriggers.live.register();
		
		this._videos = {
			upcoming: [],
			live: [],
		}
			
		this._poll = this._poll.bind(this);
		this._pollInterval = setInterval(this._poll, POLL_INTERVAL);
		this._poll();

	}
	
	_poll() {
		this.log('_poll()');
		
		https.get( POLL_URL, res => {
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			
			let error;
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' +
			                  `Status Code: ${statusCode}`);
			} else if (!/^application\/json/.test(contentType)) {
				error = new Error('Invalid content-type.\n' +
			                  `Expected application/json but received ${contentType}`);
			}
			
			if (error) {
				console.error(error.message);
				res.resume();
				return;
			}
			
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { rawData += chunk; });
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(rawData);
					this._processPollResult( 'upcoming', parsedData.upcoming );
					this._processPollResult( 'live', parsedData.live );
				} catch (e) {
					console.error(e.message);
				}
			});
			
		}).on('error', this.error);
	}
	
	_processPollResult( type, videos ) {
		if( !Array.isArray(videos) )
			return this.error('Invalid videos, expected Array');
						
		videos.forEach( video => {
			const videoId = video.youtubeId;
			if( this._videos[type].indexOf(videoId) === -1 ) {
				this._videos[type].push(videoId);
				
				this.log('Triggering', type, videoId);
				
				this._flowTriggers[type].trigger({
					'url': `https://www.youtube.com/tv?v=${videoId}`
				}).catch( this.error );
			}			
		});		
	}

}

module.exports = SpaceXApp;