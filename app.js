'use strict';

const https = require('https');

const Homey = require('homey');

class SpaceXApp extends Homey.App {

	onInit() {

		this.log('SpaceXApp is running...');
		
		// register webhook
		this._webhook = new Homey.CloudWebhook( Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, {});
		this._webhook.register().catch( this.error );
		this._webhook.on('message', this._onWebhookMessage.bind(this));
		
		// register flow
		this._flowTriggers = {
			upcoming: new Homey.FlowCardTrigger('upcoming'),
			live: new Homey.FlowCardTrigger('live'),
		};

		this._flowTriggers.upcoming.register();
		this._flowTriggers.live.register();
		
		// cache
		this._videos = {
			upcoming: [],
			live: [],
		}

	}
	
	_onWebhookMessage( args ) {
		console.log('_onWebhookMessage', args)
		
		const type = args.body.type;
		const videos = args.body.videos;		
		
		if( !Array.isArray(videos) )
			return this.error('Invalid videos, expected Array');
						
		videos.forEach( videoId => {
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