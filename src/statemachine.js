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

