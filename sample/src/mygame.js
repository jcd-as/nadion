// main entry point for Nadion template
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

var MyGame = (function() 
{
	// set any Nadion properties that we wish to override
	Nadion.VIEW_WIDTH = 320;
	Nadion.VIEW_HEIGHT = 240;

	// return the MyGame namespace
	return {
		// TODO: add any data that is global to your game here
		name : "My cool game",
		save_file : 'MyGameSaveFile',

		// keyboard controls
		KEY_JUMP : Phaser.Keyboard.X,
		KEY_ACTION : Phaser.Keyboard.Z,
		KEY_L : Phaser.Keyboard.LEFT,
		KEY_R : Phaser.Keyboard.RIGHT
	};
})();
