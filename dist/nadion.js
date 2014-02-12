// main object for Nadion
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

var Phaser = Phaser || window.Phaser || null;

/** Framework-wide namespace.
* @namespace Nadion
*/
var Nadion = Nadion || 
{
	// game properties, to be overridden as needed/desired

	/** Name of your game
	 * @constant {string} Nadion#name*/
	name : 'nadionBasedGame',

	// set these to change the game's viewport size
	/** Width of the game view/window
	 * @constant {number} Nadion#VIEW_WIDTH */
	VIEW_WIDTH : 640,
	/** Width of the game view/window
	 * @constant {number} Nadion#VIEW_HEIGHT */
	VIEW_HEIGHT : 480,


	// methods:

	/**
	 * main entry point for Nadion-based game
	 * @function Nadion#go
	 * @arg {Phaser.State} initial_state
	 */
	go : function( initial_state )
	{
		// force Canvas or auto (default)?
		var mode = Phaser.AUTO;
		var r;
		var key_vals = location.search.substring( 1 ).split( '&' );

		// get from query string
		for( var i in key_vals )
		{
			var key = key_vals[i].split( '=' );
			if( key.length > 1 )
			{
				if( decodeURIComponent( key[0] ) === 'render' )
					r = decodeURIComponent( key[1].replace( /\+/g, ' ' ) );
			}
		}

		if( typeof( r ) == 'string' )
		{
			if( r === 'canvas' )
				mode = Phaser.CANVAS;
		}

		// let the games begin!
		var game = new Phaser.Game( Nadion.VIEW_WIDTH, Nadion.VIEW_HEIGHT, mode, '', initial_state );

	},

	// namespace-wide helper methods
	//
	/**
	 * Helper used to extend a base class
	 * @function Nadion#__extends
	 * @arg {function} derived
	 * @arg {function} base
	 */
	__extends : function( derived, base )
	{
		for( var p in base ){if( base.hasOwnProperty(p) ) derived[p] = base[p];}
		function __() { this.constructor = derived; }
		__.prototype = base.prototype;
		derived.prototype = new __();
	},
	
	/** 
	 * Save state to local storage
	 * @function Nadion#saveState
	 * @arg {string} file
	 * @arg {string} state
	 */
	saveState : function( file, state )
	{
		window.localStorage.setItem( file, JSON.stringify( state ) );
	},

	/** 
	 * Load state from local storage
	 * @function Nadion#loadState
	 * @arg {string} file
	 * @returns {Object}
	 */
	loadState : function( file )
	{
		var state = window.localStorage.getItem( file );
		if( state )
			return JSON.parse( state );
		else
			return null;
	},

	/**
	 * Find item with 'name' property name in array
	 * @function Nadion#findNamedItemInArray
	 * @arg {Array} array
	 * @arg {string} name
	 * @returns {number} Index of desired item
	 */
	findNamedItemInArray : function( array, name )
	{
		for( var i = 0; i < array.length; i++ )
		{
			if( array[i].name && array[i].name == name )
			{
				return i;
			}
		}
		return undefined;
	},
	
	/**
	 * Find item with 'name' property name in a Phaser.Group
	 * @function Nadion#findNamedItemInGroup
	 * @arg {Group} grp
	 * @arg {string} name
	 * @returns {Object} Desired item
	 */
	findNamedItemInGroup : function( grp, name )
	{
		// capture name in closure, for recursion 
		var result = (function f( grp )
		{
			var start = grp.cursor;
			var i = start;
			do
			{
				var r;
				// recur into Groups
				if( i instanceof Phaser.Group )
				{
					// reset the cursor
					grp.cursor = start;
					return f( i );
				}
				else if( i.name === name )
				{
					// reset the cursor
					grp.cursor = start;
					return i;
				}
				grp.next();
				i = grp.cursor;
			}
			while( i && i !== start );
			// reset the cursor
			grp.cursor = start;
			return null;
		})( grp );
		return result;
	},

	/** Finds and sets the target for the object (Trigger/Area/Alarm)
	 * @function Nadion#resolveTarget
	 * @arg {Object} obj Trigger/Area/Alarm object
	 */
	resolveTarget : function( obj )
	{
		// if target name is 'Nadion'...
		if( obj.target_name === 'Nadion' )
			obj.target = Nadion;
		// if target name is 'state', use current state
		else if( obj.target_name === 'state' )
			obj.target = obj.game.state.states[obj.game.state.current];
		// go looking for the target in the world
		else 
		{
			// first try groups (sprites)
			obj.target = Nadion.findNamedItemInGroup( obj.game.world, obj.target_name );
			// then emitters
			if( !obj.target )
			{
				var emitter = obj.game.particles.emitters[obj.target_name];
				if( emitter !== undefined )
					obj.target = emitter;
			}
			// TODO: anything else? other triggers/areas/alarms???
		}
	},

	/** Wraps text at 'width' columns
	 * @function Nadion#wrapText
	 * @arg {string} text Text to wrap
	 * @arg {number} width Column at which to wrap text 
	 * @returns {string} Wrapped text (input with newlines added)
	 */
	wrapText : function( text, width )
	{
		width = width || 75;
		var regex = '.{1,' + width + '}(\\s|$)' + '|\\S+?(\\s|$)';
		return text.match( RegExp( regex, 'g' ) ).join( '\n' );
	}

};



// controls (keyboard/touch) module for Nadion
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

/** 
 * @class Nadion#Nadion.Controls
 * @classdesc Class providing simple on-screen touch controls for touch devices
 * @constructor
 * @description (Safe to use as constructor or simple call)
 * @arg {Phaser.Game} game
 * @arg {number} screen_width Viewport / screen width in pixels
 * @arg {number} num_buttons Number of buttons to display
 */
Nadion.Controls = function( game, screen_width, num_buttons )
{
	// initialize touch input
	game.input.addPointer();
	game.input.addPointer();

	game.input.multiInputOverride = Phaser.Input.TOUCH_OVERRIDES_MOUSE;

	// private data
	var pointer1 = game.input.pointer1;
	var pointer2 = game.input.pointer2;
	var button_size = screen_width / num_buttons;

	var buttons = [];
	var prev_x = 0;
	for( var i = 0; i < num_buttons; i++ )
	{
		var button = 
		{
			left : prev_x,
			right : prev_x + button_size
		};
		buttons.push( button );
		prev_x += button_size;
	}

	/** Array of buttonPressed functions
	 * @prop {Array} buttonPressed
	 * @public */
	var buttonPressed = [];
	// onPressed events (callbacks)
	var onPressed = [];

	// helper to create a closure for each button
	var create_f = function( btn )
	{
		return function()
		{ 
			var x1;
			if( pointer1.isDown )
				x1 = pointer1.x;
			var x2;
			if( pointer2.isDown )
				x2 = pointer2.x;
			if( x1 !== undefined && x1 > btn.left && x1 < btn.right )
				return 1;
			if( x2 !== undefined && x2 > btn.left && x2 < btn.right )
				return 2;
		};
	};
	// set-up buttonPressed functions and onPressed callbacks for each
	// button
	for( i = 0; i < num_buttons; i++ )
	{
		var btn = buttons[i];
		buttonPressed.push( create_f( btn ) );

		// callbacks are undefined (non-existent) to begin with
		onPressed.push( undefined );
	}

	/** Set a callback for when a button is pressed
	 * @method Nadion.Controls#setOnPressedCallback
	 * @memberof Nadion.Controls
	 * @arg {number} button Index of button
	 * @arg {Function} callback Callback function
	 * @arg {Object} context Context ('this' object) for the callback function
	 */
	var setOnPressedCallback = function( button, callback, context )
	{
		// set the callback
		onPressed[button] = {callback : callback, context : context};
	};

	// touch handler 
	var onTouchStart = function( ptr )
	{
		// check each button
		for( var i = 0; i < num_buttons; i++ )
		{
			if( onPressed[i] )
				if( ptr.x > buttons[i].left && ptr.x < buttons[i].right )
					onPressed[i].callback.call( onPressed[i].context );
		}
	};

	// add touch handler
	game.input.onDown.add( onTouchStart );

	/** Add the on-screen buttons. Override this method if you wish to present
	 * different images/buttons.
	 * @method Nadion.Controls#addButtons
	 * @memberof Nadion.Controls
	 */
	var addButtons = function()
	{
		// add a group containing the images for the touch controls
		var button_imgs = game.add.group();
		button_imgs.alpha = 0.33;
		button_imgs.visible = true;
		// add buttons to the group
		var gutter = (button_size - 64) / 2;
		var tmp = game.add.sprite( 0, 0, 'button-left' );
		tmp.fixedToCamera = true;
		tmp.cameraOffset.x = buttons[0].left + gutter;
		tmp.cameraOffset.y = 384-64;
		button_imgs.add( tmp );

		tmp = game.add.sprite( 0, 0, 'button-right' );
		tmp.fixedToCamera = true;
		tmp.cameraOffset.x = buttons[1].left + gutter;
		tmp.cameraOffset.y = 384-64;
		button_imgs.add( tmp );

		tmp = game.add.sprite( 0, 0, 'button-circle' );
		tmp.fixedToCamera = true;
		tmp.cameraOffset.x = buttons[3].left + gutter;
		tmp.cameraOffset.y = 384-64;
		button_imgs.add( tmp );

		tmp = game.add.sprite( 0, 0, 'button-square' );
		tmp.fixedToCamera = true;
		tmp.cameraOffset.x = buttons[4].left + gutter;
		tmp.cameraOffset.y = 384-64;
		button_imgs.add( tmp );
	};

	// public functionality
	return {
		buttonPressed : buttonPressed,
		setOnPressedCallback : setOnPressedCallback,
		addButtons : addButtons
	};
};

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


(function() {

	"use strict";


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

		// TODO: load tileset images based on Tiled json...
		// load tileset
		this.game.load.image( 'tiles', this.tileset_url, this.tile_width, this.tile_height );

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

		// setup the tile map
		this.setupMap();

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

		// create the map layers
		this.createLayers();

		// add the tileset
		// TODO: get the key & tileset name from the json 
		this.map.addTilesetImage( 'tiles', 'tiles' );

		// set it's solid tiles (collidable)
		var data = this.game.cache.getTilemapData( 'level' ).data;
		// TODO: for now, assume we're using only the first tileset, since 
		// Tiled and Phaser are a bit at odds in how to interpret the tile
		// indices
		for( var i = 0; i < data.tilesets.length; i++ )
		{
			var tileprops = data.tilesets[i].tileproperties;
			var idx, val;
			var solid_tiles = [];
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
//							if( val.solid === 'slopeDownRight' )
//								this.tileset.tiles[idx].slopeDownRight = true;
//							else if( val.solid === 'slopeDownLeft' )
//								this.tileset.tiles[idx].slopeDownLeft = true;
							solid_tiles.push( idx+1 );
						}
//						else
//						{
//							var left = false, right = false, up = false, down = false;
//							if( val['solid-left'] !== undefined )
//								left = true;
//							if( val['solid-right'] !== undefined )
//								right = true;
//							if( val['solid-up'] !== undefined )
//								up = true;
//							if( val['solid-down'] !== undefined )
//								down = true;
//							this.tileset.setCollision( idx, left, right, up, down );
//						}
					}
				}
			}
			for( var j = 0; j < this.layers.length; j++ )
			{
				// only set tiles as 'collide-able' on 'solid' layers
				if( this.layers[j].solid )
					this.map.setCollision( solid_tiles, true, this.layers[j].index );
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
	 * @arg {number} layer_num Index of the tile layer in our (Nadion's) tile
	 * layer array (only tile layers)
	 */
	Nadion.Level.prototype.createTileLayer = function( lyr, layer_num )
	{
		// get the scroll rates
		var sx = +((lyr.properties && lyr.properties.scrollFactorX) || 1);
		var sy = +((lyr.properties && lyr.properties.scrollFactorY) || 1);
		// get the name
		var layer = this.map.createLayer( layer_num );
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
		var sx = 0, sy = 0;

		// scroll factor formula
		// sf = (layer_size - screen_size) / (world_size - screen_size)

		// size of main layer, in pixels
		var w = this.world_width;
		var h = this.world_height;
		// size of the background layer, in pixels
		var camera_max_x = w - Nadion.VIEW_WIDTH;
		var camera_max_y = h - Nadion.VIEW_HEIGHT;

		// set scroll factor based on scale (sizes):
		if( camera_max_x !== 0 )
			sx = (bg.width - Nadion.VIEW_WIDTH) / camera_max_x;
		if( camera_max_y !== 0 )
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

// state machine object/class for Nadion
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

/** 
 * @class Nadion#Nadion.StateMachine
 * @classdesc Class providing a state machine for the Nadion Phaser add-on.
 * Takes an array of objects that define the states and events, like such:
 * <pre>
 * states = [
 * 	{
 * 		'name':'working',
 * 		'initial':true,
 * 		'events':
 * 		{
 * 			'bored':'coffee',
 * 			'call_for_meeting':'meeting',
 * 		}
 * 	},
 * 	{
 * 		'name':'coffee',
 * 		'events':
 * 		{
 * 			'break_over':'working',
 * 			'call_for_meeting':'meeting'
 * 		}
 * 	},
 * 	{
 * 		'name':'meeting',
 * 		'events':
 * 		{
 * 			'meetings_over':'working'
 * 		}
 * 	},
 * ];
 *</pre> 
 * and a receiver ('this' object) for the callbacks.
 * Callbacks are made on the receiver object, have the 
 * same name as the new state, and take one parameter: the
 * event. e.g. <pre>function meeting( event ) { this.attendMeeting(); }</pre>
 * @constructor
 * @arg {Array} states An array of objects that define the states
 * that the state machine can be in, what events can occur and what states those
 * events result in.
 * @arg {Object} receiver The object that will receive calls on state changes. (Typically 'this' when a state machine is included as a property of an object).
 */
Nadion.StateMachine = function( states, receiver )
{
	// fields
	this.states = states;
	this.receiver = receiver;
	this.indices = {};
	this.initialState = undefined;
	// initialize the indices and find the initial state
	for( var i = 0; i < states.length; i++ )
	{
		this.indices[this.states[i].name] = i;
		if( this.states[i].initial )
			this.initialState = this.states[i];
	}
	if( !this.initialState )
		console.warn( "State Machine has no initial state!" );
	this.currentState = this.initialState;
};

/** Consume an event. Causes a new state to be entered.
 * @function Nadion.StateMachine#consumeEvent
 * @memberof Nadion.StateMachine
 * @arg {string} e The event that has occurred
 */
Nadion.StateMachine.prototype.consumeEvent = function( e )
{
	// valid event for this state?
	if( this.currentState.events[e] )
	{
		this.currentState = this.states[this.indices[this.currentState.events[e]]];
		// call the callback
		this.receiver[this.currentState.name].call( this.receiver );
	}
	else
		console.warn( "State Machine called with invalid event: '" + e + "' for current state: '" + this.currentState.name + "'." );
};

/** Retrieve the (name of) the current state.
 * @function Nadion.StateMachine#getState
 * @memberof Nadion.StateMachine
 * @returns {string}
 */
Nadion.StateMachine.prototype.getState = function()
{
	return this.currentState.name;
};

/** Reset the state machine to its initial state
 * @function Nadion.StateMachine#reset
 * @memberof Nadion.StateMachine
 */
Nadion.StateMachine.prototype.reset = function()
{
	this.currentState = this.initialState;
};


// entities (sprites) for Nadion
// (entities extend 'Phaser.Sprite')
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


(function()
{
	"use strict";

	///////////////////////////////////////////////////////////////////
	// BASE SPRITE CLASS
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.BaseSprite
	 * @classdesc Base class for game sprites (entities).
	 * MUST be subclassed and subclasses must define
	 * variables to dictate Sprite behavior.
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.BaseSprite = function( game, key, name, x, y, width, height, props )
	{
		// (account for anchor position when setting x & y )
		x += width * 0.5;
		y += height * 0.5;
		Phaser.Sprite.call( this, game, x, y, key );

		// fields
		this.name = name || '';
		this.initial_x = x;
		this.initial_y = y;
		/** A sprite is not the player-controlled sprite by default.
		 * (override this for the player sprite!)
		 * @prop {boolean} is_player_sprite */
		this.is_player_sprite = false;

		// Phaser.Sprite settings
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		// after setting the anchor we have to re-set x/y to get the sprite
		// in the correct position
		this.x = this.initial_x;
		this.y = this.initial_y;

		// set any additional properties onto the new sprite object
		if( props )
		{
			for( var k in props )
			{
				if( props.hasOwnProperty( k ) )
				{
					if( k !== 'name' &&
						k !== 'initial_x' && 
						k !== 'initial_y' )
						this[k] = props[k];
				}
			}
		}

		game.add.existing( this );
	};
	// extends 'Phaser.Sprite'
	Nadion.BaseSprite.prototype = Object.create( Phaser.Sprite );
	Nadion.__extends( Nadion.BaseSprite, Phaser.Sprite );
	Nadion.BaseSprite.prototype.constructor = Nadion.BaseSprite;
	/** Reset the Sprite (called when the State is reset)
	 * @function Nadion.BaseSprite#reset
	 * @memberof Nadion.BaseSprite
	 */
	Nadion.BaseSprite.prototype.reset = function()
	{
		Phaser.Sprite.prototype.reset.call( this, this.initial_x, this.initial_y );
		Phaser.Sprite.prototype.updateCache.call( this );
	};


	///////////////////////////////////////////////////////////////////
	// TRIGGER
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.Trigger
	 * @classdesc Represents a trigger that can be toggled by a sprite, either
	 * by 'touching' it (sprite overlaps it) or by activating explicitly.
	 *
	 * <p>Triggers can call actions (functions) when turned on and off using the
	 * 'on' and 'off' properties.</p>
	 *
	 * <p>This is a base class that can also be used directly.</p>
	 *
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>entity: The sprite which can set/unset the Trigger</li>
	 * <li>target: The object on which the callback is called</li>
	 * <li>on: The function that is called when the Trigger is turned on</li>
	 * <li>off: The function that is called when the Trigger is turned off</li>
	 * <li>trigger_on_touch: boolean - Is this trigger turned on merely by contacting it</li>
	 * </ul>
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.Trigger = function( game, name, x, y, width, height, props )
	{
		// fields
		this.game = game;
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width || 1;
		this.height = height || 1;
		this.props = props || {};

		// name of the entity to track against
		this.entity_name = props.entity;
		// name of the target of the callbacks
		this.target_name = props.target || null;

		// function to call when the entity turns the trigger on
		this.on_callback = props.on;
		// function to call when the entity turns the trigger off
		this.off_callback = props.off || null;

		this.type = props.type || 'Trigger';

		this.trigger_on_touch = props.trigger_on_touch === 'true';
		this.activated = false;
		// these must be set for phaser collision detection to work
		this.exists = true;
		this.body = {x: this.x, y: this.y, right: this.x + this.width, bottom: this.y + this.height};
	};
	/** Reset the trigger (called when the State is reset)
	 * @function Nadion.Trigger#reset
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.reset = function()
	{
		this.deactivate();
	};
	/** Update the state of the trigger. Called each frame from State.update
	 * @function Nadion.Trigger#updateObject
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.updateObject = function()
	{
		// if we haven't resolved the target yet, do so
		if( this.target_name && !this.target )
			Nadion.resolveTarget( this );
		// if we haven't resolved the entity yet, do so
		if( this.entity_name && !this.entity )
		{
			// go looking for the entity in the world
			this.entity = Nadion.findNamedItemInGroup( this.game.world, this.entity_name );
		}

		// if we've already been triggered, do nothing
		if( this.activated )
			return;
	};
	/** Activate the Trigger
	 * @function Nadion.Trigger#activate
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.activate = function()
	{
		if( this.activated )
			return false;
		else
		{
			this.activated = true;
			if( this.on && this.on instanceof Function )
				return this.on( this, this.entity );
			else if( this.on_callback && this.target[this.on_callback] instanceof Function )
				return this.target[this.on_callback]( this, this.entity );
			else
				return true;
		}
	};
	/** Deactivate the Trigger
	 * @function Nadion.Trigger#deactivate
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.deactivate = function()
	{
		if( !this.activated )
			return false;
		else
		{
			this.activated = false;
			if( this.off && this.off instanceof Function )
				return this.off( this, this.entity );
			else if( this.off_callback && this.target[this.off_callback] instanceof Function )
				return this.target[this.off_callback]( this, this.entity );
			else
				return true;
		}
	};
	/** Check to see if the Trigger can be activated
	 * @function Nadion.Trigger#check
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.check = function()
	{
		return Phaser.Rectangle.intersects( this.body, this.entity.body );
	};
	/** Check to see if the Trigger can be activated, and activate if so
	 * @function Nadion.Trigger#checkActivate
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.checkActivate = function()
	{
		if( this.check() )
			return this.activate();
	};
	/** Check to see if the Trigger can be deactivated, and deactivate if so
	 * @function Nadion.Trigger#checkDeactivate
	 * @memberof Nadion.Trigger
	 */
	Nadion.Trigger.prototype.checkDeactivate = function()
	{
		if( this.check() )
			return this.deactivate();
	};


	///////////////////////////////////////////////////////////////////
	// SET TILE TRIGGER
	///////////////////////////////////////////////////////////////////
	// TODO: jcs 12/04/13 - shouldn't assume the trigger tile(s) are on the main
	// layer
	/** 
	 * @class Nadion#Nadion.SetTileTrigger
	 * @classdesc A Trigger sub-class that defines a trigger that changes
	 * the value of a tile on the tile map when it is activated.
	 *
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>target_x: x coordinate of the target tile</li>
	 * <li>target_y: y coordinate of the target tile</li>
	 * <li>new_tile: The index of the tile that will replace the target tile</li>
	 * <li>new_trigger_tile: The index of the tile that will replace the tile at the trigger's location (so the player can see the trigger state)</li>
	 * <li>trigger_on_touch: boolean - Is this trigger turned on merely by contacting it</li>
	 * </ul>
	 * 
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.SetTileTrigger = function( game, name, x, y, width, height, props )
	{
		Nadion.Trigger.call( this, game, name, x, y, width, height, props );

		// fields
		this.game = game;
		this.game_state = game.state.states[game.state.current];
		this.map = this.game_state.map;
		this.old_trigger_tile = undefined;
		this.new_tile_data = [];
		this.tiles_saved = false;

		// TODO: need to check in *all* tilesets, not just the first one!
		var tmdata = this.game.cache.getTilemapData( 'level' ).data;
		var tileprops = tmdata.tilesets[0].tileproperties;

		var data = props.new_tile_1;
		var json = JSON.parse( data );
		if( tileprops[json.tile] && tileprops[json.tile].solid )
			json.solid = true;
		this.new_tile_data.push( json );
		if( 'new_tile_2' in props )
		{
			data = props.new_tile_2;
			json = JSON.parse( data );
			if( tileprops[json.tile] && tileprops[json.tile].solid )
				json.solid = true;
			this.new_tile_data.push( json );
		}
		if( 'new_tile_3' in props )
		{
			data = props.new_tile_3;
			json = JSON.parse( data );
			if( tileprops[json.tile] && tileprops[json.tile].solid )
				json.solid = true;
			this.new_tile_data.push( json );
		}
		this.new_trigger_tile = undefined;
		if( 'new_trigger_tile' in props )
			this.new_trigger_tile = +props.new_trigger_tile;
		this.trigger_tile_x = undefined;
		this.trigger_tile_y = undefined;
		this.sound_effect = props.sound_effect;
		if( this.sound_effect )
			this.noise = game.add.audio( this.sound_effect, 1, true );
		this.volume = 1;
		if( 'volume' in props )
			this.volume = +props.volume;
		props.on = 'on';
		props.off = 'off';
		this.target = this;
	};
	Nadion.SetTileTrigger.prototype = Object.create( Nadion.Trigger );
	Nadion.__extends( Nadion.SetTileTrigger, Nadion.Trigger );
	Nadion.SetTileTrigger.prototype.constructor = Nadion.SetTileTrigger;
	/** Reset the trigger (called when the State is reset)
	 * @function Nadion.SetTileTrigger#reset
	 * @memberof Nadion.SetTileTrigger
	 */
	Nadion.SetTileTrigger.prototype.reset = function()
	{
		this.activated = false;
		if( this.tiles_saved )
		{
			// reset all the tiles
			for( var i = 0; i < this.new_tile_data.length; i++ )
			{
				// get the layer for this data
				var l = Nadion.findNamedItemInArray( this.game_state.layers, this.new_tile_data[i].layer );
				var x = +this.new_tile_data[i].x;
				var y = +this.new_tile_data[i].y;
				var old_tile = +this.new_tile_data[i].old_tile;
				this.map.putTile( old_tile, x, y, l );
			}
			// reset the trigger tile
			this.map.putTile( this.old_trigger_tile, this.trigger_tile_x, this.trigger_tile_y, this.game_state.main_layer_index );
		}
	};
	/** Turn on the Trigger
	 * @function Nadion.SetTileTrigger#on
	 * @memberof Nadion.SetTileTrigger
	 */
	Nadion.SetTileTrigger.prototype.on = function()
	{ 
		var i, l, t, x, y;
		// save the original tiles
		if( this.old_trigger_tile === undefined )
		{
			for( i = 0; i < this.new_tile_data.length; i++ )
			{
				// get the layer for this data
				l = Nadion.findNamedItemInArray( this.game_state.layers, this.new_tile_data[i].layer );
				x = +this.new_tile_data[i].x;
				y = +this.new_tile_data[i].y;
				t = this.map.getTile( x, y, l );
				if( t )
				{
//					this.new_tile_data[i].old_tile = t;
					this.new_tile_data[i].old_tile = new Phaser.Tile();
					this.new_tile_data[i].old_tile.copy( t );
				}
			}
			this.tiles_saved = true;
		}
		// save the original trigger tile & position
		if( this.new_trigger_tile !== undefined && this.old_trigger_tile === undefined )
		{
//			this.trigger_tile_x = this.game.math.snapToFloor( this.x, this.game_state.main_layer.tileWidth ) / this.game_state.main_layer.tileWidth;
//			this.trigger_tile_y = this.game.math.snapToFloor( this.y, this.game_state.main_layer.tileHeight ) / this.game_state.main_layer.tileHeight;
			this.trigger_tile_x = this.game.math.snapToFloor( this.x, this.map.tileWidth ) / this.map.tileWidth;
			this.trigger_tile_y = this.game.math.snapToFloor( this.y, this.map.tileHeight ) / this.map.tileHeight;
			t = this.map.getTile( this.trigger_tile_x, this.trigger_tile_y, this.game_state.main_layer_index );
			if( t )
			{
//				this.old_trigger_tile = t;
				this.old_trigger_tile = new Phaser.Tile();
				this.old_trigger_tile.copy( t );
			}
		}

		// set the new tiles
		for( i = 0; i < this.new_tile_data.length; i++ )
		{
			// get the layer for this data
			l = Nadion.findNamedItemInArray( this.game_state.layers, this.new_tile_data[i].layer );
			x = +this.new_tile_data[i].x;
			y = +this.new_tile_data[i].y;
//			var new_tile = +this.new_tile_data[i].tile;
			var new_tile = this.map.getTile( x, y, l );
			new_tile.index = +this.new_tile_data[i].tile;
			if( this.new_tile_data[i].solid )
			{
				new_tile.collides = true;
//				new_tile.faceTop = true;
//				new_tile.faceBottom = true;
//				new_tile.faceLeft = true;
//				new_tile.faceRight = true;
//				new_tile.collideTop = true;
//				new_tile.collideBottom = true;
//				new_tile.collideLeft = true;
//				new_tile.collideRight = true;
			}
			else
			{
				new_tile.collides = false;
//				new_tile.faceTop = false;
//				new_tile.faceBottom = false;
//				new_tile.faceLeft = false;
//				new_tile.faceRight = false;
//				new_tile.collideTop = false;
//				new_tile.collideBottom = false;
//				new_tile.collideLeft = false;
//				new_tile.collideRight = false;
			}
			this.map.putTile( new_tile, x, y, l );
		}
		// TODO: set trigger tiles 'collide-ability' ??
		// (do we need to? would trigger tiles *ever* be collide-able?)
		// set the new trigger tile
		if( this.new_trigger_tile )
			this.map.putTile( this.new_trigger_tile, this.trigger_tile_x, this.trigger_tile_y, this.game_state.main_layer_index );
		if( this.noise )
			this.noise.play( '', 0, this.volume );
		// TODO: this doesn't actually work that well
		// 'shake' the camera
		this.map.game.camera.x++;
		this.map.game.camera.x--;
		return true;
	}; 
	/** Turn off the Trigger
	 * @function Nadion.SetTileTrigger#off
	 * @memberof Nadion.SetTileTrigger
	 */
	Nadion.SetTileTrigger.prototype.off = function( target )
	{ 
		// reset all the tiles
		for( var i = 0; i < this.new_tile_data.length; i++ )
		{
			// get the layer for this data
			var l = Nadion.findNamedItemInArray( this.game_state.layers, this.new_tile_data[i].layer );
			var x = +this.new_tile_data[i].x;
			var y = +this.new_tile_data[i].y;
			var old_tile = this.new_tile_data[i].old_tile;
			this.map.putTile( old_tile, x, y, l );
		}
		// reset the trigger tile, if we changed it
		if( this.new_trigger_tile )
			this.map.putTile( this.old_trigger_tile, this.trigger_tile_x, this.trigger_tile_y, this.game_state.main_layer_index );
		// TODO: get the sound & volume from the Tiled props...
		if( this.noise )
			this.noise.play( '', 0, 0.5 );
		// TODO: this doesn't actually work that well
		// 'shake' the camera
		this.map.game.camera.x += 4;
		this.map.game.camera.x -= 4;
		return true;
	};

	///////////////////////////////////////////////////////////////////
	// NEXT LEVEL TRIGGER
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.NextLevelTrigger
	 * @classdesc A Trigger sub-class that defines a trigger that starts the
	 * next level of the game.
	 * 
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>level: The index of the level (state) to start</li>
	 * </ul>
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.NextLevelTrigger = function( game, name, x, y, width, height, props )
	{
		Nadion.Trigger.call( this, game, name, x, y, width, height, props );

		// fields
		this.level = +(props.level);
		this.state = game.state;
		this.fade_color = 0x000000;
		this.one_alpha = {alpha : 1};	// to prevent being GC'd during update
		this.bg = this.game.add.graphics( 0, 0 );
		this.bg.alive = false;
		props.on = 'on';
		// trigger on touch by default
		if( props.trigger_on_touch === undefined )
			this.trigger_on_touch = true;
	};
	Nadion.NextLevelTrigger.prototype = Object.create( Nadion.Trigger );
	Nadion.__extends( Nadion.NextLevelTrigger, Nadion.Trigger );
	Nadion.NextLevelTrigger.prototype.constructor = Nadion.NextLevelTrigger;
	/** Cause a fade-out effect & schedule the level switch when it ends
	 * @function Nadion.NextLevelTrigger#fadeOut
	 * @memberof Nadion.NextLevelTrigger
	 */
	Nadion.NextLevelTrigger.prototype.fadeOut = function()
	{
		// create a transparent rect over the whole screen
		this.bg.beginFill( this.fade_color, 1 );
		var x = this.game.camera.x + this.game.stage.bounds.width/2;
		var y = this.game.camera.y + this.game.stage.bounds.height/2;
		// make the rect a little oversized
		var w = Nadion.VIEW_WIDTH * 1.25;
		var h = Nadion.VIEW_HEIGHT * 1.25;
		this.bg.drawRect( x-(w/2), y-(h/2), w, h ); 
		this.bg.alpha = 0;
		this.bg.endFill();
		this.bg.alive = true;
		this.bg.group.bringToTop( this.bg );
		// start a tween to fade in to color
		var t = this.game.add.tween( this.bg );
		t.to( this.one_alpha, 1000, null );
		t.onComplete.addOnce( this.changeState, this );
		t.start();
	};
	/** Cause the level switch
	 * @function Nadion.NextLevelTrigger#changeState
	 * @memberof Nadion.NextLevelTrigger
	 */
	Nadion.NextLevelTrigger.prototype.changeState = function()
	{
		// TODO: stop the current level...?
		this.state.game.sound.stopAll();
		// TODO: clear screen in WebGL?
		if( this.game.context )
			this.game.context.clearRect( 0, 0, this.game.canvas.width, this.game.canvas.height );
		// TODO: save the correct game data from the state and game objects
		// save the game state
		var save_state = { 'level' : this.level };
		Nadion.saveState( save_state );
		// use the next level from the Tiled props
		var old_state = this.state.states[this.state.current];
		var new_state;
		if( old_state.game_namespace )
			new_state = old_state.game_namespace["Level_" + this.level];
		if( !new_state )
			new_state = Nadion["Level_" + this.level];
		if( !new_state )
			new_state = window["Level_" + this.level];
		if( !new_state )
			console.error( "Can't create level for NextLevelTrigger" );

		this.state.add( 'level-' + this.level, new_state, false );
		this.state.start( 'level-' + this.level, true, true );
		this.state.remove( old_state.key );

		this.bg.alive = false;
	};
	/** Turn the trigger on
	 * @function Nadion.NextLevelTrigger#on
	 * @memberof Nadion.NextLevelTrigger
	 */
	Nadion.NextLevelTrigger.prototype.on = function()
	{ 
		// start the fade out
		this.fadeOut();
		return true;
	}; 

	///////////////////////////////////////////////////////////////////
	// TELEPORT TRIGGER
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.TeleportTrigger
	 * @classdesc A Trigger sub-class that defines a trigger that teleports
	 * the player sprite to a given position.
	 * 
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>new_x: The x coordinate of the location to teleport the player to</li>
	 * <li>new_y: The y coordinate of the location to teleport the player to</li>
	 * </ul>
	 *
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.TeleportTrigger = function( game, name, x, y, width, height, props )
	{
		Nadion.Trigger.call( this, game, name, x, y, width, height, props );

		// fields
		this.new_x = +(props.new_x);
		this.new_y = +(props.new_y);
		props.on = 'on';
		// trigger on touch by default
		if( props.trigger_on_touch === undefined )
			this.trigger_on_touch = true;
	};
	Nadion.TeleportTrigger.prototype = Object.create( Nadion.Trigger );
	Nadion.__extends( Nadion.TeleportTrigger, Nadion.Trigger );
	Nadion.TeleportTrigger.prototype.constructor = Nadion.TeleportTrigger;
	/** Turn the trigger on
	 * @function Nadion.TeleportTrigger#on
	 * @memberof Nadion.TeleportTrigger
	 */
	Nadion.TeleportTrigger.prototype.on = function()
	{ 
		// move the entity (player)
		this.entity.x = this.new_x;
		this.entity.y = this.new_y;
		// allow re-use
		this.activated = false;
		return true;
	}; 

	///////////////////////////////////////////////////////////////////
	// RESET LEVEL TRIGGER
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.ResetLevelTrigger
	 * @classdesc A Trigger sub-class that defines a trigger that restarts
	 * the level when activated.
	 * 
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.ResetLevelTrigger = function ( game, name, x, y, width, height, props )
	{
		Nadion.Trigger.call( this, game, name, x, y, width, height, props );

		// fields
		this.activated_time = 0;
		this.fade_color = 0x000000;
		this.one_alpha = {alpha : 1};	// to prevent being GC'd during update
		this.bg = this.game.add.graphics( 0, 0 );
		this.bg.alive = false;
		this.state = game.state.states[game.state.current];
		// trigger on touch by default
		if( props.trigger_on_touch === undefined )
			this.trigger_on_touch = true;
	};
	Nadion.ResetLevelTrigger.prototype = Object.create( Nadion.Trigger );
	Nadion.__extends( Nadion.ResetLevelTrigger, Nadion.Trigger );
	Nadion.ResetLevelTrigger.prototype.constructor = Nadion.ResetLevelTrigger;
	/** Reset the trigger (called when the State is reset)
	 * @function Nadion.ResetLevelTrigger#reset
	 * @memberof Nadion.ResetLevelTrigger
	 */
	Nadion.ResetLevelTrigger.prototype.reset = function()
	{
		// do nothing!
	};
	/** Cause a fade-out and schedule the level reset.
	 * @function Nadion.ResetLevelTrigger#fadeOut
	 * @memberof Nadion.ResetLevelTrigger
	 */
	Nadion.ResetLevelTrigger.prototype.fadeOut = function()
	{
		// create a transparent rect over the whole screen
		this.bg.beginFill( this.fade_color, 1 );
		var x = this.game.camera.x + this.game.stage.bounds.width/2;
		var y = this.game.camera.y + this.game.stage.bounds.height/2;
		// make the rect a little oversized
		var w = Nadion.VIEW_WIDTH * 1.25;
		var h = Nadion.VIEW_HEIGHT * 1.25;
		this.bg.drawRect( x-(w/2), y-(h/2), w, h ); 
		this.bg.alpha = 0;
		this.bg.endFill();
		this.bg.alive = true;
		this.bg.visible = true;
		this.bg.group.bringToTop( this.bg );
		// start a tween to fade in to color
		var t = this.game.add.tween( this.bg );
		t.to( this.one_alpha, 1000, null );
		t.onComplete.addOnce( this.resetLevel, this );
		t.start();
	};
	/** Reset the level.
	 * @function Nadion.ResetLevelTrigger#resetLevel
	 * @memberof Nadion.ResetLevelTrigger
	 */
	Nadion.ResetLevelTrigger.prototype.resetLevel = function()
	{ 
		// restart the state
		this.state.restart();
		// allow re-use
		this.bg.alive = false;
		// hide fade-out background
		this.bg.visible = false;
	}; 
	/** Turn the trigger on
	 * @function Nadion.ResetLevelTrigger#on
	 * @memberof Nadion.ResetLevelTrigger
	 */
	Nadion.ResetLevelTrigger.prototype.on = function()
	{ 
		// record time
		this.activated_time = this.game.time.now;
		// TODO: freeze *all* sprites ??
		// freeze the player
		if( this.state.player )
		{
			this.state.player.body.velocity.x = 0;
			this.state.player.body.velocity.y = 0;
			this.state.player.exists = false;
		}
		this.fadeOut();
		return true;
	};
	/** Update the state of the trigger. Called each frame from State.update
	 * @function Nadion.ResetLevelTrigger#updateObject
	 * @memberof Nadion.ResetLevelTrigger
	 */
	Nadion.ResetLevelTrigger.prototype.updateObject = function()
	{
		// call the base class
		Nadion.Trigger.prototype.updateObject.call( this );
		// wait a period before re-activating the trigger, in order to avoid
		// hitting it twice (or more)
		if( this.activated && this.activated_time !== 0 )
		{
			if( this.game.time.elapsedSince( this.activated_time ) >= 1500 )
			{
				this.activated = false;
				this.activated_time = 0;
			}
		}
	};


	///////////////////////////////////////////////////////////////////
	// EMITTER
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.Emitter
	 * @classdesc Extension of Phaser Emitter for creation from Tiled files.
	 *
	 * (NOTE: if the 'use_particle_effects' property on the Phaser game object is set to 'false' emitters will not be created. This is a way to control the detail level / performance of your game.)
	 *
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>period: Number of milliseconds that each particle lives, once emitted.  (Inifinite if === 0)</li>
	 * <li>delay: How often in milliseconds a particle is emitted</li>
	 * <li>image: The key for the image to be used for the particles</li>
	 * <li>frames: A string representing the array of frames to use for the particles (e.g. '[0, 1, 2]')</li>
	 * <li>minParticleSpeedX: see Phaser docs</li>
	 * <li>minParticleSpeedY: see Phaser docs</li>
	 * <li>maxParticleSpeedX: see Phaser docs</li>
	 * <li>maxParticleSpeedY: see Phaser docs</li>
	 * <li>minRotation: see Phaser docs</li>
	 * <li>maxRotation: see Phaser docs</li>
	 * <li>gravity: see Phaser docs</li>
	 * <li>autostart: boolean. Should the emitter start immediately?</li>
	 * <li>constrained: boolean. If true the area that the emitter covers is constrained to the overlap between it and the visible portion of the map. Useful for improving performance - keeps the emitter from generating particles off-screen.</li>
	 * </ul>
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.Emitter = function( game, name, x, y, width, height, props )
	{
		if( game.use_particle_effects === false )
			return null;

		// don't call the game.add helper, because we need to set the name of
		// the emitter *before* it is added
		var emitter = new Phaser.Particles.Arcade.Emitter( game, 0, 0, +(props.quantity) );
		emitter.name = name;
		game.particles.add( emitter );

		var left = x, top = y;
		emitter.x = left + width / 2;
		emitter.y = top + height / 2;
		emitter.height = height;
		emitter.width = width;

		emitter.period = +(props.period || 0);
		emitter.delay = +(props.delay || 0);

		var image_key = props.image;
		if( !image_key )
			console.error( "No image property on Nadion.Emitter object in level json!" );
		var frames = props.frames || '0';
		frames = frames.split( ',' );
		for( var i = 0; i < frames.length; i++ )
		{
			frames[i] = +frames[i];
		}

		// NOTE: must have image loaded with correct key
		// TODO: how to handle this requirement?
		emitter.makeParticles( image_key, frames );

		emitter.minParticleSpeed.x = +(props.minParticleSpeedX || 0);
		emitter.minParticleSpeed.y = +(props.minParticleSpeedY || 0);
		emitter.maxParticleSpeed.x = +(props.maxParticleSpeedX || 0);
		emitter.maxParticleSpeed.y = +(props.maxParticleSpeedY || 0);
		emitter.minRotation = +(props.minRotation || 0);
		emitter.maxRotation = +(props.maxRotation || 0);
		emitter.gravity = +(props.gravity || 0);

		if( props.autostart === 'true' )
			emitter.start( false, emitter.period, emitter.delay );

		emitter.constrained = props.constrained === 'true';
		if( emitter.constrained )
		{
			// save the original coordinates
			emitter._orig_rect = new Phaser.Rectangle( left, top, emitter.width,emitter.height );
			// cached rects so we don't create new objects during update
			emitter._rect = new Phaser.Rectangle();
			emitter._new_rect = new Phaser.Rectangle();

			// method to keep emitter "in frame"
			emitter.updateObject = function()
			{
				this._rect.x = this.game.camera.x;
				this._rect.y = this.game.camera.y;
				this._rect.width = this.game.camera.width;
				this._rect.height = this.game.camera.height;
				Phaser.Rectangle.intersection( this._rect, this._orig_rect, this._new_rect );
				this.x = this._new_rect.x + this._new_rect.width/2;
				this.y = this._new_rect.y + this._new_rect.height/2;
				this.height = this._new_rect.height;
				this.width = this._new_rect.width;
			};
		}
		else
		{
			emitter.updateObject = function(){};
		}

		emitter.reset = function()
		{
			this.kill();
			if( props.autostart === 'true' )
				emitter.start( false, emitter.period, emitter.delay );
		};

		// add activation/deactivation methods 
		emitter.go = function()
		{
			this.start( false, this.period, this.delay );
			return true;
		};
		emitter.stop = function()
		{
			this.kill();
			return true;
		};

		return emitter;
	};


	///////////////////////////////////////////////////////////////////
	// FIREFLIES
	///////////////////////////////////////////////////////////////////
//	minParticleSpeedX: -30
//	minParticleSpeedY: -20
//	maxParticleSpeedX: 30
//	maxParticleSpeedY: 20
//	minRotation: -90;
//	maxRotation: 90;
//	gravity: 0;
//	quantity: 256 (or whatever)
//
//	// RAIN
//	minParticleSpeedX: 150
//	minParticleSpeedY: 750
//	maxParticleSpeedX: 150
//	maxParticleSpeedY: 1000
//	minRotation: 0;
//	maxRotation: 0;
//	period: 4000
//	quantity: 1024 (or whatever)
//
//	// SNOW
//	delay: 32
//	maxParticleSpeedX: 25
//	maxParticleSpeedY: 120
//	maxRotation: 0
//	minParticleSpeedX: -25
//	minParticleSpeedY: 80
//	minRotation: 0
//	period: 4000
//	quantity: 1024 (or whatever)

	///////////////////////////////////////////////////////////////////
	// ALARM
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.Alarm
	 * @classdesc Represents a time Alarm that will be activated (call a
	 * function) on either a one-time basis or periodically.
	 *
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>period: The time between Alarm activations, in milliseconds</li>
	 * <li>repeating: Is the Alarm periodic?</li>
	 * <li>target: The object on which the callback is called</li>
	 * <li>call: The function that is called when the Alarm is turned on</li>
	 * </ul>
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.Alarm = function( game, name, x, y, width, height, props )
	{
		// fields
		this.game = game;
		this.name = name;
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 1;
		this.height = height || 1 ;
		this.props = props || {};
		this.target_name = props.target || null;
		// period of alarm timer, in milliseconds
		this.period = props.period || 0;
		// function to call when alarm is triggered
		this.call = props.call || null;

		this.repeating = props.repeating || false;
		this.type = props.type || 'Alarm';

		this.activated = false;
		this.started = false;
		this.start_time = 0;

		// these must be set for phaser collision detection to work
		this.exists = true;
		this.body = {x: this.x, y: this.y, right: this.x + this.width, bottom: this.y + this.height};
	};
	/** Reset the Alarm (called when the State is reset)
	 * @function Nadion.Alarm#reset
	 * @memberof Nadion.Alarm
	 */
	Nadion.Alarm.prototype.reset = function()
	{
		this.activated = false;
		this.started = false;
		this.start_time = 0;
	};
	/** Update the state of the Alarm. Called each frame from State.update
	 * @function Nadion.Alarm#updateObject
	 * @memberof Nadion.Alarm
	 */
	Nadion.Alarm.prototype.updateObject = function()
	{
		// if we haven't resolved the target yet, do so
		if( this.target_name && !this.target )
			Nadion.resolveTarget( this );

		if( this.started )
		{
			if( this.game.time.elapsedSince( this.start_time ) >= this.period )
			{
				// fire event
				if( this.target )
				{
					// if we were given a call to make, call it
					if( this.call && this.target[this.call] instanceof Function )
						this.target[this.call]( this );
					// otherwise try a general 'alarm' method
					else if( this.target.alarm instanceof Function )
						this.target.alarm( this );
				}

				// repeating or one-time?
				if( this.repeating )
					this.start_time = this.game.time.time;
				else
					this.started = false;
			}
		}
	};
	/** Start the alarm timer
	 * @function Nadion.Alarm#start
	 * @memberof Nadion.Alarm
	 */
	Nadion.Alarm.prototype.start = function()
	{
		if( !this.started )
		{
			this.started = true;

			// start the count-down
			this.start_time = this.game.time.time;
		}
	};

	///////////////////////////////////////////////////////////////////
	// AREA
	///////////////////////////////////////////////////////////////////
	/** 
	 * @class Nadion#Nadion.Area
	 * @classdesc Represents an area of the map which will cause functions to be
	 * called when a sprite enters and/or leaves it.
	 *
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>entity: The sprite that will cause the Area to call its functions</li>
	 * <li>target: The object on which the callback is called</li>
	 * <li>on_enter: The function that is called when the entity enters the area</li>
	 * <li>on_exit: The function that is called when the entity exits the area</li>
	 * </ul>
	 * @constructor
	 * @arg {Phaser.Game} game
	 * @arg {string} key Key for Phaser cache storage
	 * @arg {string} name Name for Nadion creation
	 * @arg {number} x X position
	 * @arg {number} y Y position
	 * @arg {number} width Width in pixels
	 * @arg {number} height Height in pixels
	 * @arg {Object} props Properties collection from Tiled
	 */
	Nadion.Area = function( game, name, x, y, width, height, props )
	{
		// fields
		this.game = game;
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width || 1;
		this.height = height || 1;
		this.props = props || {};
		// name of the entity to track against the area
		this.entity_name = props.entity;
		// name of the target of the call
		this.target_name = props.target || null;

		// function to call when the entity is entering the area
		this.on_enter = props.on_enter;
		// function to call when the entity is leaving the area
		this.on_exit = props.on_exit;

		this.type = props.type || 'Area';

		// is the entity currently inside
		this.entity_inside = false;

		// these must be set for phaser collision detection to work
		this.exists = true;
		this.body = {x: this.x, y: this.y, right: this.x + this.width, bottom: this.y + this.height};
	};
	/** Update the state of the Area. Called each frame from State.update
	 * @function Nadion.Area#updateObject
	 * @memberof Nadion.Area
	 */
	Nadion.Area.prototype.updateObject = function()
	{
		// if we haven't resolved the target yet, do so
		if( this.target_name && !this.target )
			Nadion.resolveTarget( this );

		// if we haven't resolved the entity yet, do so
		if( this.entity_name && !this.entity )
		{
			// go looking for the entity in the world
			this.entity = Nadion.findNamedItemInGroup( this.game.world, this.entity_name );
		}

		// has the entity entered/left the area?
		var collide = Phaser.Rectangle.intersects( this.body, this.entity.body );

		// entered
		if( collide && !this.entity_inside )
		{
			this.entity_inside = true;

			if( this.on_enter && this.target[this.on_enter] instanceof Function )
				this.target[this.on_enter]( this );
		}
		// exited
		else if( !collide && this.entity_inside )
		{
			this.entity_inside = false;
			
			if( this.on_exit && this.target[this.on_exit] instanceof Function )
				this.target[this.on_exit]( this );
		}
	};

})();
