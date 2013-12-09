// game State ('level') object for Nadion
//
// Copyright 2013 Joshua C. Shepard
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


"use strict";

(function() {

	/** 
	 * @class Nadion#Nadion.Level
	 * @classdesc Base class for game states (levels).
	 * MUST be subclassed and subclasses must define
	 * variables to dictate what resources are loaded
	 * and what game objects are created.
	 *
	 * @constructor
	 */
	Nadion.Level = function()
	{
		// variables which the derived class MUST override:
		/** Width of tiles, in pixels
		 * @prop {number} tile_width */
		this.tile_width = undefined;	// e.g. 32
		/** Height of tiles, in pixels
		 * @prop {number} tile_height */
		this.tile_height = undefined;	// e.g. 32
		/** URL of the tilemap
		 * @prop {string} tilemap */
		this.tilemap = undefined;		// e.g. 'assets/maps/level-1.json'
		/** URL of the tileset
		 * @prop {string} tileset_url */
		this.tileset_url = undefined; 	// e.g. 'assets/img/tiles.png'
		/** Array of sound objects (see template for details)
		 * @prop {Array} sounds */
		this.sounds = undefined;		// array, see template
		/** Sound object for background music/effect track
		 * @prop {Object} background_music */
		this.background_music = undefined; // e.g. Nadion.findNamedItemInArray( this.sounds, 'main-music-loop' );
		/** Array of spritesheet objects (see template for details)
		 * @prop {Array} spritesheets */
		this.spritesheets = undefined;	// array, see template
		/** Array of image objects (see template for details)
		 * @prop {Array} images */
		this.images = undefined;		// array, see template
		/** CSS Text style for 'loading' text
		 * @prop {Object} loading_text_style */
		this.loading_text_style = undefined;	// e.g. { font: "My_Bitmap_Font", align: "center" };
		/** Color for State background
		 * @prop {string} background_color */
		this.background_color = undefined;	// e.g. '#000000';
		/** Namespace to look for trigger/alarm/area action functions in
		 * @prop {Object} game_namespace */
		this.game_namespace = undefined;
	};

	/** Phaser State preload override
	 * @method Nadion.Level#preload
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.preload = function()
	{
		var i;

		// load tilemap
		this.game.load.tilemap( 'level', this.tilemap, null, Phaser.Tilemap.TILED_JSON );

		// load tileset
		this.game.load.tileset( 'tiles', this.tileset_url, this.tile_width, this.tile_height );

		// load spritesheets
		for( i = 0; i < this.spritesheets.length; i++ )
		{
			var sheet = this.spritesheets[i];
			this.game.load.spritesheet( sheet.name, sheet.url, sheet.width, sheet.height );
		}

		// load images
		for( i = 0; i < this.images.length; i++ )
		{
			var img = this.images[i];
			this.game.load.image( img.name, img.url );
		}
	
		// load sound effects
		for( i = 0; i < this.sounds.length; i++ )
		{
			var snd = this.sounds[i];
			var mp3 = snd.url + '.mp3';
			var ogg = snd.url + '.ogg';
			this.game.load.audio( snd.name, [mp3, ogg] );
		}

		// preloader sprite
		this.game.pre = this.game.add.sprite( 0, 0, 'preload' );
		this.game.pre.x = (Nadion.VIEW_WIDTH - this.game.pre.width) / 2;
		this.game.pre.y = (Nadion.VIEW_HEIGHT - this.game.pre.height) / 2;
		this.game.load.setPreloadSprite( this.game.pre );

		this.game.pre_text = undefined;
		// loading text
		if( this.loading_text_style )
		{
			this.game.pre_text = this.game.add.bitmapText( Nadion.VIEW_WIDTH/2, Nadion.VIEW_HEIGHT/2 + (Nadion.VIEW_HEIGHT * 0.2), ' 0%', this.loading_text_style );
			this.game.pre_text.x = this.game.camera.x + (Nadion.VIEW_WIDTH - this.game.pre_text.width)/2;
		}
		// set up a preload (loading indicator) sprite
		this.game.load.onFileComplete.removeAll();
		this.game.load.onFileComplete.add( (function(game) {
			var first_time = true;
			return function(progress)
			{
				// set the preloader graphic/text positions, as the camera may
				// have moved since we were last called
				game.pre.x = game.camera.x + (Nadion.VIEW_WIDTH - game.pre.width) / 2;
				game.pre.y = game.camera.y + (Nadion.VIEW_HEIGHT - game.pre.height) / 2;
				if( game.pre_text )
				{
					game.pre_text.setText( progress + '%' );
					game.pre_text.x = game.camera.x + (Nadion.VIEW_WIDTH - game.pre_text.width)/2;
					game.pre_text.y = game.camera.y + Nadion.VIEW_HEIGHT/2 + Nadion.VIEW_HEIGHT*0.2;
				}
			};
		})(this.game) );
	};

	/** Phaser State create override
	 * @function Nadion.Level#create
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.create = function()
	{
		// hide the preloading elements
		this.game.pre.alive = false;
		this.game.pre.visible = false;
		if( this.game.pre_text )
		{
			this.game.pre_text.alive = false;
			this.game.pre_text.visible = false;
		}

		// developer mode fields
		this.showLayer1 = true;
		this.showLayer2 = true;
		this.showLayer3 = true;
		this.showLayer4 = true;
		this.showLayer5 = true;
		this.showFramerate = false;
		this.showDebugInfo = false;
		this.setupDeveloperMode();

		this.game.stage.backgroundColor = this.background_color;

		// start music
		if( this.background_music )
		{
			// TODO: wait for our sound(s) to be loaded
//			while( !this.cache.isSoundDecoded( this.background_music.name ) ) {}

			this.music = this.game.add.audio( this.background_music.name, 1, true );
			this.music.play( '', 0, this.background_music.volume, true );
		}

		// set-up paused sprite
		if( this.paused_image_key )
		{
			this.game.paused_image = new Phaser.Sprite( this.game, 0, 0, this.paused_image_key );
			this.game.paused_image.visible = false;
			this.game.paused_image.fixedToCamera = true;
			this.game.add.existing( this.game.paused_image );
		}

		// setup the tile map
		this.setupMap();

		// setup pause/unpause
		this.game.onPause.add( this.onPause, this );
		this.game.onResume.add( this.onResume, this );

		// layer collections
		this.layers = [];
		this.image_layers = [];

		// sprite collections
		this.groups = [];

		// collections for non-sprite, non-layer objects
		this.emitters = [];
		this.triggers = [];
		this.alarms = [];
		this.areas = [];

		// create the map layers
		this.createLayers();

		// set-up input
		this.setupInput();

		// set the camera to follow the player
		this.game.camera.follow( this.player, Phaser.Camera.FOLLOW_PLATFORMER );

		this.updates = 0;

		// start the alarms
		this.alarms.forEach( function( val ) { val.start(); } );

		// NOTE: groups are all set to exist=false so they won't update until
		// after the start-up message is shown (see update fcn below)
	};

	/** Event handler for pause
	 * @function Nadion.Level#setupInput
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.onPause = function()
	{
		this.game.sound.pauseAll();
	};

	/** Event handler for resume
	 * @function Nadion.Level#setupInput
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.onResume = function()
	{
		this.game.sound.resumeAll();
	};

	/** Set-up the input methods for the State
	 * @function Nadion.Level#setupInput
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.setupInput = function()
	{
		// create controls object
		this.controls = new Nadion.Controls( this.game, Nadion.VIEW_WIDTH, 5 );
		// add the touch control buttons (to mobile only)
	    if( !this.game.device.desktop )
			this.controls.addButtons();
	};

	/** Set-up the tile map for the State
	 * @function Nadion.Level#setupMap
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.setupMap = function()
	{
		// add the tiled map for the level
		this.map = this.game.add.tilemap( 'level' );
		// add the tileset
		this.tileset = this.game.add.tileset( 'tiles' );
		// set it's solid tiles (collidable)
		var data = this.game.cache.getTilemapData( 'level' ).data;
		// TODO: for now, assume we're using only the first tileset, since 
		// Tiled and Phaser are a bit at odds in how to interpret the tile
		// indices
		var tileprops = data.tilesets[0].tileproperties;
		var idx, val;
		for( var key in tileprops )
		{
			if( tileprops.hasOwnProperty( key ) )
			{
				idx = +key;
				if( !isNaN( idx ) )
				{
					val = tileprops[key];
					// solid?
					if( val.solid !== undefined )
					{
						// TODO: should we use a separate property for slope??
						if( val.solid === 'slopeDownRight' )
							this.tileset.tiles[idx].slopeDownRight = true;
						else if( val.solid === 'slopeDownLeft' )
							this.tileset.tiles[idx].slopeDownLeft = true;
						this.tileset.setCollision( idx, true, true, true, true );
					}
					else
					{
						var left = false, right = false, up = false, down = false;
						if( val['solid-left'] !== undefined )
							left = true;
						if( val['solid-right'] !== undefined )
							right = true;
						if( val['solid-up'] !== undefined )
							up = true;
						if( val['solid-down'] !== undefined )
							down = true;
						this.tileset.setCollision( idx, left, right, up, down );
					}
				}
			}
		}
	};

	/** Set-up the developer mode settings for the State
	 * @function Nadion.Level#setupDeveloperMode
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.setupDeveloperMode = function()
	{
		if( this.game.developer_mode )
		{
			// set up 'developer keys'
			var one_key = this.game.input.keyboard.addKey( Phaser.Keyboard.ONE );
			one_key.onDown.add( function(){ this.showLayer1 = !this.showLayer1; }, this );
			var two_key = this.game.input.keyboard.addKey( Phaser.Keyboard.TWO );
			two_key.onDown.add( function(){ this.showLayer2 = !this.showLayer2; }, this );
			var three_key = this.game.input.keyboard.addKey( Phaser.Keyboard.THREE );
			three_key.onDown.add( function(){ this.showLayer3 = !this.showLayer3; }, this );
			var four_key = this.game.input.keyboard.addKey( Phaser.Keyboard.FOUR );
			four_key.onDown.add( function(){ this.showLayer4 = !this.showLayer4; }, this );
			var five_key = this.game.input.keyboard.addKey( Phaser.Keyboard.FIVE );
			five_key.onDown.add( function(){ this.showLayer5 = !this.showLayer5; }, this );
			var f_key = this.game.input.keyboard.addKey( Phaser.Keyboard.F );
			f_key.onDown.add( function(){ this.showFramerate = !this.showFramerate; }, this );
			var p_key = this.game.input.keyboard.addKey( Phaser.Keyboard.P );
			p_key.onDown.add( function(){ 
				for( var i = 0; i < this.emitters.length; i++ )
				{
					if( this.emitters[i].alive )
						this.emitters[i].kill();
					else
					{
						this.emitters[i].revive();
						this.emitters[i].go();
					}
				}
		   	}, this );
			var d_key = this.game.input.keyboard.addKey( Phaser.Keyboard.D );
			d_key.onDown.add( function(){ this.showDebugInfo = !this.showDebugInfo; }, this );
		}
	};

	/** Create all the layers (image, tile and object) from the Tiled JSON file.
	 * @function Nadion.Level#createLayers
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.createLayers = function()
	{
		var layer, sx, sy;
		var data = this.game.cache.getTilemapData( 'level' ).data;
		if( !data.properties.width || !data.properties.height )
		{
			console.error( "Tiled map data must set 'width' and 'height' properties on the map object!" );
			throw new Error( "Tiled map error: no width/height properties on map" );
		}
		this.world_width = data.properties.width;
		this.world_height = data.properties.height;
		var layers = data.layers;
		var tilemaplayer_count = 0;

		for( var l = 0; l < layers.length; l++ )
		{
			// is this an object group?
			var lyr = layers[l];
			switch( lyr.type )
			{
			case 'tilelayer':
				// don't create 'excluded' layers (layers excluded for reasons
				// of performance - detail level - etc)
				if( !this.game.excluded_layers || this.game.excluded_layers && this.game.excluded_layers.indexOf( lyr.name ) === -1 )
					this.createTileLayer( lyr, tilemaplayer_count );
				tilemaplayer_count++;
				break;
			case 'objectgroup':
				this.createObjects( lyr );
				break;
			case 'imagelayer':
				this.createImageLayer( lyr );
				break;
			default:
				console.warn( "Unknown layer type '" + lyr.type + "'in Tiled map file" );
				break;
			}
		}
		// find the 'main' layer
		var main_layer_name = data.properties.main_layer || 'main';
		this.main_layer_index = Nadion.findNamedItemInArray( this.layers, main_layer_name, this.main_layer_index );
		if( this.main_layer_index === undefined )
			throw new Error( "No 'main' layer in Tiled map!" );
		this.main_layer = this.layers[this.main_layer_index];
		this.main_layer.resizeWorld();
		// set world boundaries to 'real' size
		// (real size is 1/2 the size of the main layer because Tiled doesn't
		// support different sized layers in the same map)
		this.game.world.setBounds( 0, 0, this.world_width, this.world_height );

		// ensure there is a player
		if( !this.player )
			throw new Error( "No 'player' sprite in Tiled map!" );

		// if the player is not in a visible group, change that
		if( !this.player.group.visible )
			this.player.group.visible = true;
	};

	/** Create a tile layers from the Tiled JSON file.
	 * @function Nadion.Level#createTileLayer
	 * @memberof Nadion.Level
	 * @arg {Object} lyr The layer object from Tiled
	 * @arg {number} layer_num Index of the tile layer
	 */
	Nadion.Level.prototype.createTileLayer = function( lyr, layer_num )
	{
		// get the scroll rates
		var sx = +((lyr.properties && lyr.properties.scrollFactorX) || 1);
		var sy = +((lyr.properties && lyr.properties.scrollFactorY) || 1);
		// get the name
		var layer = this.game.add.tilemapLayer( 0, 0, Nadion.VIEW_WIDTH, Nadion.VIEW_HEIGHT, this.tileset, this.map, layer_num );
		layer.name = lyr.name;
		layer.solid = lyr.properties !== undefined && (lyr.properties.solid == 'true' ? true : false); 
		layer.visible = lyr.visible;
		layer.scrollFactorX = sx;
		layer.scrollFactorY = sy;
		this.layers.push( layer );
	};

	/** Create an image layer from the Tiled JSON file.
	 * @function Nadion.Level#createImageLayer
	 * @memberof Nadion.Level
	 * @arg {Object} lyr The layer object from Tiled
	 */
	Nadion.Level.prototype.createImageLayer = function( lyr )
	{
		var bg = this.game.add.sprite( 0, 0, lyr.name );
		bg.name = lyr.name;
		var sx = +((lyr.properties && lyr.properties.scrollFactorX) || 1);
		var sy = +((lyr.properties && lyr.properties.scrollFactorY) || 1);

		// scroll factor formula
		// sf = (layer_size - screen_size) / (world_size - screen_size)

		// size of main layer, in pixels
		var w = this.world_width;
		var h = this.world_height;
		// size of the background layer, in pixels
		var camera_max_x = w - Nadion.VIEW_WIDTH;
		var camera_max_y = h - Nadion.VIEW_HEIGHT;

		// set scroll factor based on scale (sizes):
		sx = (bg.width - Nadion.VIEW_WIDTH) / camera_max_x;
		sy = (bg.height - Nadion.VIEW_HEIGHT) / camera_max_y;

		// override update so we can set the scrolling factor
		bg.update = function() {
			this.x = this.game.camera.view.x - (this.game.camera.view.x * sx);
			this.y = this.game.camera.view.y - (this.game.camera.view.y * sy);
		};

		// set a property so we can identify these
		bg.imageLayer = true;

		this.image_layers.push( bg );
	};

	/** Create the objects from an object layer from the Tiled JSON file.
	 * Creates the objects and a Phaser.Group for the objects to reside in.
	 * @function Nadion.Level#createObjects
	 * @memberof Nadion.Level
	 * @arg {Object} layer The layer object from Tiled
	 */
	Nadion.Level.prototype.createObjects = function( layer )
	{
		// is this an object group?
		var og = layer;
		var group = this.game.add.group();
		group.name = og.name || '';
		group.visible = og.visible === undefined ? true : og.visible;
		group.alpha = +og.opacity || 1;
		for( var i = 0; i < og.objects.length; i++ )
		{
			// create the object and add it to the group
			// (if it is a display object)
			var obj = og.objects[i];
			// try to use the best possible namespace/module to look-up the
			// function in...
			var f;
			if( this.game_namespace )
				f= this.game_namespace[obj.type];
			if( !f )
				f = Nadion[obj.type];
			if( !f )
				f = window[obj.type];
			if( !f )
				throw new Error( "Unable to create Object: '" + obj.type + "'" );
			var o = new f( this.game, obj.name, obj.x, obj.y, obj.width, obj.height, obj.properties );

			// if we failed to create the object, keep going
			if( typeof o === 'undefined' || o === null )
				continue;

			if( o.is_player_sprite )
				this.player = o;
			// TODO: this really ought be be checking against
			// PIXI.DisplayObject, but Phaser doesn't expose the PIXI module...
//			if( o instanceof PIXI.DisplayObject )
			if( o instanceof Phaser.Sprite )
				group.add( o );
			else if( o instanceof Phaser.Particles.Arcade.Emitter )
				this.emitters.push( o );
			else if( o instanceof Nadion.Trigger )
				this.triggers.push( o );
			else if( o instanceof Nadion.Alarm )
				this.alarms.push( o );
			else if( o instanceof Nadion.Area )
				this.areas.push( o );
		}
		// don't update the group for now...
		group.exists = false;
		this.groups.push( group );
	};

	/** Call the reset methods on an object
	 * @function Nadion.Level#callResetOn
	 * @memberof Nadion.Level
	 * @arg {Object} obj The object to call on
	 * @private
	 */
	function callResetOn( obj )
	{
		if( 'reset' in obj )
			obj.reset();
		if( 'revive' in obj )
			obj.revive();
	}

	/** Reset the level to it's default state
	 * @function Nadion.Level#restart
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.restart = function()
	{
		this.updates = 0;

		// stop all sounds
		this.game.sound.stopAll();

		// reset sprites and stop the groups updating
		for( var i = 0; i < this.groups.length; i++ )
		{
			this.groups[i].forEach( callResetOn );
			this.groups[i].exists = false;
		}

		// reset triggers, alarms & areas
		this.triggers.forEach( callResetOn );
		this.alarms.forEach( callResetOn );
		this.areas.forEach( callResetOn );
		this.emitters.forEach( callResetOn );

		// re-start the level background soundtrack
		if( this.background_music )
			this.music.play( '', 0, this.background_music.volume, true );
	};

	/** Call the updateObject method on an object, if appropriate. (Do not call
	 * on player sprite).
	 * @function Nadion.Level#callUpdateOn
	 * @memberof Nadion.Level
	 * @private 
	 */
	function callUpdateOn( obj )
	{
		if( !obj.is_player_sprite )
			obj.updateObject();
	}

	/** Phaser State update override
	 * @function Nadion.Level#update
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.update = function()
	{
		if( this.updates === 0 )
		{
			this.updates++;

			// start the groups updating
			for( i = 0; i < this.groups.length; i++ )
			{
				this.groups[i].exists = true;
			}
		}

		// TODO: anything else?

		// check (debug) display vars
		for( var i = 0; i < this.layers.length; i++ )
		{
			var lyr_name = 'showLayer' + (i+1);
			if( !this[lyr_name] )
				this.layers[i].visible = false;
			else
				// don't ever make 'collision' layer visible
				if( this.layers[i].name !== 'collision' )
					this.layers[i].visible = true;
		}

		// update player
		this.player.updateObject();

		// update sprites
		for( i = 0; i < this.groups.length; i++ )
		{
			this.groups[i].forEachAlive( callUpdateOn );
		}

		// update triggers, alarms & areas
		this.triggers.forEach( callUpdateOn );
		this.alarms.forEach( callUpdateOn );
		this.areas.forEach( callUpdateOn );
		this.emitters.forEach( callUpdateOn );

		// check triggers
		// check against all the triggers that are activated on touch
		// (collision)
		var num_triggers = this.triggers.length;
		for( i = 0; i < num_triggers; i++ )
		{
			var trigger = this.triggers[i];
			if( trigger.trigger_on_touch )
				trigger.checkActivate.call( trigger );
		}
	};

	/** Phaser State render override
	 * @function Nadion.Level#update
	 * @memberof Nadion.Level
	 */
	Nadion.Level.prototype.render = function()
	{
		if( this.game.paused && this.game.paused_image )
		{
			this.game.paused_image.visible = true;
			this.game.paused_image.bringToTop();
		}
		else if( this.game.paused_image )
		{
			this.game.paused_image.visible = false;
		}
		if( this.showFramerate )
		{
			// fps
			this.game.debug.renderText( this.game.time.fps, 10, 25, '#ff0000' );
		}
		if( this.showDebugInfo )
		{
			// sprite bounds
			this.game.debug.renderSpriteBody( this.player, 'rgba(0,255,0,0.3)' );
			this.game.debug.renderSpriteCorners( this.player );
			this.game.world.forEach( function( s ) {
				if( s instanceof Phaser.Sprite && !(s instanceof Phaser.TileSprite) && !(s instanceof Phaser.TilemapLayer) && s.alive && s.visible )
				{
					if( !s.imageLayer )
					{
						this.game.debug.renderSpriteBody( s );
						this.game.debug.renderSpriteCorners( s );
					}
				}
			}, this );
		}
	};

})();
