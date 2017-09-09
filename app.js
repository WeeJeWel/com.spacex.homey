'use strict';

const Homey = require('homey');
const SpaceXLiveStream = require('./lib/SpaceXLiveStream.js');

class SpaceXApp extends Homey.App {

	onInit() {

		this.log('SpaceXApp is running...');

		let upcomingTrigger = new Homey.FlowCardTrigger('upcoming');
			upcomingTrigger.register();

		let liveTrigger = new Homey.FlowCardTrigger('upcoming');
			liveTrigger.register();

		let liveStream = new SpaceXLiveStream( Homey.env.YOUTUBE_API_KEY );
			liveStream
				.on('upcoming', videoId => {
					this.log('Upcoming', videoId);
					upcomingTrigger.trigger({
						'url': `https://www.youtube.com/tv?v=${videoId}`
					}).catch( this.error );
				})
				.on('live', videoId => {
					this.log('Live', videoId);
					liveTrigger.trigger({
						'url': `https://www.youtube.com/tv?v=${videoId}`
					}).catch( this.error );
				})

	}

}

module.exports = SpaceXApp;