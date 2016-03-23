/**
 * File: lib/watch.js
 * Type: Javascript Node module
 * Author: Chris Humboldt
 */

// Requires
var chokidar = require('chokidar');
var colour = require('./log-colour');
var engine = require('./engine');
var livereload = require('livereload');
var project = require('./project');
var web = require('webplate-tools');

// Variables
var $v = require('./variable');

// Execute
module.exports = {
	reload: function() {
		var reloadServer = livereload.createServer();
		reloadServer.watch($v.project.watch.reload);
	},
	passive: function() {
		console.log(colour.title('Watching your project CSS and JS...'));
		this.reload();
	},
	project: function() {
		var $building = false;

		console.log(colour.title('Watching your project build SASS and JS...'));
		this.reload();

		// Build watcher
		var watcher = chokidar.watch($v.project.watch.build, {
			ignored: /^\./,
			persistent: true
		});
		watcher.on('change', function($path) {
			if ($building === false) {
				var $fileExt = web.getExtension($path);
				var $inEngine = ($path.indexOf('/engine/') > -1) ? true : false;

				console.log('');
				console.log(colour.action($path) + colour.command('...updated'));

				$building = true;
				setTimeout(function() {
					$building = false;
				}, 1000);

				// Check if engine or project
				if ($inEngine === true) {
					if ($fileExt === 'scss') {
						engine.build.css();
					} else if ($fileExt === 'js') {
						if ($path.indexOf('core.js') > -1) {
							engine.build.start();
						} else if ($path.indexOf('fastclick.js') > -1) {
							engine.build.touch();
						} else {
							engine.build.scripts();
						}
					}
				} else {
					if ($fileExt === 'scss') {
						project.build.css();
					} else if ($fileExt === 'js') {
						project.build.js();
					} else if ($fileExt === 'json') {
						project.build.all();
					}
				}
			}
		});
	}
};