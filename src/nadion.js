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

	// game constants, to be left constant

	// directions
	/** Direction: up
	 * @constant {number} Nadion#UP */
	UP : 0,
	/** Direction: right
	 * @constant {number} Nadion#RIGHT */
	RIGHT : 1,
	/** Direction: down
	 * @constant {number} Nadion#DOWN */
	DOWN: 2, 
	/** Direction: left
	 * @constant {number} Nadion#LEFT */
	LEFT: 3,
	
	/**
	 * main entry point for Nadion-based game
	 * @function Nadion#go
	 * @arg {Phaser.State} initial_state
	 */
	go : function( initial_state )
	{
		// force Canvas (default) or auto (WebGL)?
		var mode = Phaser.CANVAS;
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
			if( r === 'auto' )
				mode = Phaser.AUTO;
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


