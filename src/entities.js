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


"use strict";

(function()
{
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
	 */
	Nadion.BaseSprite = function( game, key, name, x, y, width, height )
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
		this.entity_name = props['entity'];
		// name of the target of the callbacks
		this.target_name = props['target'] || null;

		// function to call when the entity turns the trigger on
		this.on_callback = props['on'];
		// function to call when the entity turns the trigger off
		this.off_callback = props['off'] || null;

		this.type = props['type'] || 'Trigger';

		this.trigger_on_touch = props['trigger_on_touch'] === 'true';
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
		var data = props['new_tile_1'];
		var json = JSON.parse( data );
		this.new_tile_data.push( json );
		if( 'new_tile_2' in props )
		{
			data = props['new_tile_2'];
			json = JSON.parse( data );
			this.new_tile_data.push( json );
		}
		if( 'new_tile_3' in props )
		{
			data = props['new_tile_3'];
			json = JSON.parse( data );
			this.new_tile_data.push( json );
		}
		this.new_trigger_tile = undefined;
		if( 'new_trigger_tile' in props )
			this.new_trigger_tile = +props['new_trigger_tile'];
		this.trigger_tile_x = undefined;
		this.trigger_tile_y = undefined;
		this.sound_effect = props['sound_effect'];
		if( this.sound_effect )
			this.noise = game.add.audio( this.sound_effect, 1, true );
		this.volume = 1;
		if( 'volume' in props )
			this.volume = +props['volume'];
		props['on'] = 'on';
		props['off'] = 'off';
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
		// save the original tiles
		if( this.old_trigger_tile === undefined )
		{
			for( var i = 0; i < this.new_tile_data.length; i++ )
			{
				// get the layer for this data
				var l = Nadion.findNamedItemInArray( this.game_state.layers, this.new_tile_data[i].layer );
				var x = +this.new_tile_data[i].x;
				var y = +this.new_tile_data[i].y;
				this.new_tile_data[i].old_tile = this.map.getTile( x, y, l );
			}
			this.tiles_saved = true;
		}
		// save the original trigger tile & position
		if( this.new_trigger_tile !== undefined && this.old_trigger_tile === undefined )
		{
			this.trigger_tile_x = this.game.math.snapToFloor( this.x, this.game_state.main_layer.tileWidth ) / this.game_state.main_layer.tileWidth;
			this.trigger_tile_y = this.game.math.snapToFloor( this.y, this.game_state.main_layer.tileHeight ) / this.game_state.main_layer.tileHeight;
			this.old_trigger_tile = this.map.getTile( this.trigger_tile_x, this.trigger_tile_y, this.game_state.main_layer_index );
		}

		// set the new tiles
		for( var i = 0; i < this.new_tile_data.length; i++ )
		{
			// get the layer for this data
			var l = Nadion.findNamedItemInArray( this.game_state.layers, this.new_tile_data[i].layer );
			var x = +this.new_tile_data[i].x;
			var y = +this.new_tile_data[i].y;
			var new_tile = +this.new_tile_data[i].tile;
			this.map.putTile( new_tile, x, y, l );
		}
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
			var old_tile = +this.new_tile_data[i].old_tile;
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
		this.level = +(props['level']);
		this.state = game.state;
		this.fade_color = 0x000000;
		this.one_alpha = {alpha : 1}; 	// to prevent being GC'd during update
		this.bg = this.game.add.graphics( 0, 0 );
		this.bg.alive = false;
		props['on'] = 'on';
		// trigger on touch by default
		if( props['trigger_on_touch'] === undefined )
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
		this.new_x = +(props['new_x']);
		this.new_y = +(props['new_y']);
		props['on'] = 'on';
		// trigger on touch by default
		if( props['trigger_on_touch'] === undefined )
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
		this.one_alpha = {alpha : 1}; 	// to prevent being GC'd during update
		this.bg = this.game.add.graphics( 0, 0 );
		this.bg.alive = false;
		this.state = game.state.states[game.state.current];
		// trigger on touch by default
		if( props['trigger_on_touch'] === undefined )
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
		var emitter = new Phaser.Particles.Arcade.Emitter( game, 0, 0, +(props['quantity']) );
		emitter.name = name;
		game.particles.add( emitter );

		var left = x, top = y;
		emitter.x = left + width / 2;
		emitter.y = top + height / 2;
		emitter.height = height;
		emitter.width = width;

		emitter.period = +(props['period'] || 0);
		emitter.delay = +(props['delay'] || 0);

		var image_key = props['image'];
		if( !image_key )
			console.error( "No image property on Nadion.Emitter object in level json!" );
		var frames = props['frames'] || '0';
		frames = frames.split( ',' );
		for( var i = 0; i < frames.length; i++ )
		{
			frames[i] = +frames[i];
		}

		// NOTE: must have image loaded with correct key
		// TODO: how to handle this requirement?
		emitter.makeParticles( image_key, frames );

		emitter.minParticleSpeed.x = +(props['minParticleSpeedX'] || 0);
		emitter.minParticleSpeed.y = +(props['minParticleSpeedY'] || 0);
		emitter.maxParticleSpeed.x = +(props['maxParticleSpeedX'] || 0);
		emitter.maxParticleSpeed.y = +(props['maxParticleSpeedY'] || 0);
		emitter.minRotation = +(props['minRotation'] || 0);
		emitter.maxRotation = +(props['maxRotation'] || 0);
		emitter.gravity = +(props['gravity'] || 0);

		if( props['autostart'] === 'true' )
			emitter.start( false, emitter.period, emitter.delay );

		emitter.constrained = props['constrained'] === 'true';
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
			if( props['autostart'] === 'true' )
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
		this.target_name = props['target'] || null;
		// period of alarm timer, in milliseconds
		this.period = props['period'] || 0;
		// function to call when alarm is triggered
		this.call = props['call'] || null;

		this.repeating = props['repeating'] || false;
		this.type = props['type'] || 'Alarm';

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
					else if( this.target['alarm'] instanceof Function )
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
		this.entity_name = props['entity'];
		// name of the target of the call
		this.target_name = props['target'] || null;

		// function to call when the entity is entering the area
		this.on_enter = props['on_enter'];
		// function to call when the entity is leaving the area
		this.on_exit = props['on_exit'];

		this.type = props['type'] || 'Area';

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
