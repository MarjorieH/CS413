/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Marjorie Hahn
* CS413: Virtual Worlds
* Project 2: Puzzles
* Square Step
* 23 May 2016
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Main Set Up
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(640, 640);
gameport.appendChild(renderer.view);

// load in game textures from sprite sheet
var background;
var buttontexture;
var floortexture;
var alerttexture;
var failtexture;
var successtexture;
var walltexture;
var charactertexture;
PIXI.loader.add("assets/gamesprites.json").load(ready);
function ready() {
	background = new PIXI.Texture.fromFrame('screenbackground.png');
	buttontexture = new PIXI.Texture.fromFrame('genericbutton.png');
	floortexture = new PIXI.Texture.fromFrame('floor.png');
	alerttexture = new PIXI.Texture.fromFrame('alertfloor.png');
	failtexture = new PIXI.Texture.fromFrame('failfloor.png');
	successtexture = new PIXI.Texture.fromFrame('successfloor.png');
	walltexture = new PIXI.Texture.fromFrame('wall.png');
	charactertexture = new PIXI.Texture.fromFrame('character.png');
}

// load in game sounds
var movesound;
var winsound;
var losesound;
PIXI.loader.add("assets/move.mp3").load(movesoundfn);
PIXI.loader.add("assets/win.mp3").load(winsoundfn);
PIXI.loader.add("assets/losesound.mp3").load(losesoundfn);
function movesoundfn() {
	movesound = PIXI.audioManager.getAudio("assets/move.mp3");
}
function winsoundfn() {
	winsound = PIXI.audioManager.getAudio("assets/win.mp3");
}
function losesoundfn() {
	losesound = PIXI.audioManager.getAudio("assets/losesound.mp3");
}

// set up stage and main pixi containers for sprites in the game
var stage = new PIXI.Container();
var game = new PIXI.Container();
var title = new PIXI.Container();
var menu = new PIXI.Container();
var instructions = new PIXI.Container();
var credits = new PIXI.Container();
var winscreen = new PIXI.Container();
var losescreen = new PIXI.Container();
var character = new PIXI.Container();
var environment = new PIXI.Container();
var walls = new PIXI.Container();
var floortiles = new PIXI.Container();
var untouchedfloor = new PIXI.Container();
var touchedfloor = new PIXI.Container();

// function to load a new screen to the game
function loadScreen(newscreen) {
	stage.removeChildren();
	stage.addChild(newscreen);

	// choose event handler based on the new screen
	if (newscreen == game) {
		gameInteract();
	}
	else if (newscreen == title) {
		titleInteract();
	}
	else if (newscreen == menu) {
		menuInteract();
	}
	else if (newscreen == instructions) {
		instructionsInteract();
	}
	else if (newscreen == winscreen) {
		winInteract();
	}
	else if (newscreen == losescreen) {
		loseInteract();
	}
	else if (newscreen == credits) {
		creditsInteract();
	}
}
loadScreen(title); // initialize to the title screen

// Game Loop
var time; // previous time from last request
var dt = 0; // current change in time since last request
var interval = 0; // keeps track of an interval of miliseconds
var canmove = false; // bool to prevent new move while character is moving
function animate() {
	requestAnimationFrame(animate);
	var now = new Date().getTime();
	dt = now - (time || now);
	interval += dt;
	time = now;

	if (interval > 150) { // reset interval after 150 miliseconds
		canmove = true;
		interval = 0;
	}

	renderer.render(stage);
}
animate();

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Title Screen Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function titleInteract() {
	title.removeChildren(); // clean up title
	var titletexture = PIXI.Texture.fromImage('assets/screenbackground.png');
	var titlesprite = new PIXI.Sprite(titletexture);
	title.addChild(titlesprite);

	var menubutton = new PIXI.Sprite(PIXI.Texture.fromImage('assets/genericbutton.png'));
	menubutton.position.x = 192;
	menubutton.position.y = 512;
	title.addChild(menubutton);

	var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 128;
	menutext.position.y = 32;
	menubutton.addChild(menutext);

	var titletext = new PIXI.Text('WELCOME TO SQUARE STEP', {font : '40px Lucida Console, Monaco, monospace', fill: 0x5fcde4, align : 'center'});
	titletext.anchor.x = 0.5;
	titletext.anchor.y = 0.5;
	titletext.position.x = 320;
	titletext.position.y = 320;
	title.addChild(titletext);

	menubutton.interactive = true;
	menubutton.on('mousedown', handleMenu);

	function handleMenu(e) {
		loadScreen(menu);
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Menu Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function menuInteract() {
	menu.removeChildren(); // clean up menu
	var menutexture = PIXI.Texture.fromImage('assets/screenbackground.png');
	var menusprite = new PIXI.Sprite(menutexture);
	menu.addChild(menusprite);

	var menutext = new PIXI.Text('MAIN MENU', {font : '40px Lucida Console, Monaco, monospace', fill: 0x5fcde4, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 320;
	menutext.position.y = 128;
	menu.addChild(menutext);

	var instrucbutton = new PIXI.Sprite(buttontexture);
	var playbutton = new PIXI.Sprite(buttontexture);
	var creditbutton = new PIXI.Sprite(buttontexture);

	instrucbutton.position.x = 192;
	instrucbutton.position.y = 256;
	var instructext = new PIXI.Text('INSTRUCTIONS', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	instructext.anchor.x = 0.5;
	instructext.anchor.y = 0.5;
	instructext.position.x = 128;
	instructext.position.y = 32;
	instrucbutton.addChild(instructext);

	playbutton.position.x = 192;
	playbutton.position.y = 384;
	var playtext = new PIXI.Text('PLAY', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	playtext.anchor.x = 0.5;
	playtext.anchor.y = 0.5;
	playtext.position.x = 128;
	playtext.position.y = 32;
	playbutton.addChild(playtext);

	creditbutton.position.x = 192;
	creditbutton.position.y = 512;
	var credittext = new PIXI.Text('CREDITS', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	credittext.anchor.x = 0.5;
	credittext.anchor.y = 0.5;
	credittext.position.x = 128;
	credittext.position.y = 32;
	creditbutton.addChild(credittext);

	menu.addChild(instrucbutton);
	menu.addChild(playbutton);
	menu.addChild(creditbutton);

	instrucbutton.interactive = true;
	instrucbutton.on('mousedown', handleInstruct);
	playbutton.interactive = true;
	playbutton.on('mousedown', handlePlay);
	creditbutton.interactive = true;
	creditbutton.on('mousedown', handleCredits);

	function handleInstruct(e) {
		loadScreen(instructions);
	}
	function handlePlay(e) {
		loadScreen(game);
	}
	function handleCredits(e) {
		loadScreen(credits);
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Instructions Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function instructionsInteract() {
	instructions.removeChildren(); // clean up instructions
	var instructionstexture = PIXI.Texture.fromImage('assets/screenbackground.png');
	var instructionssprite = new PIXI.Sprite(instructionstexture);
	instructions.addChild(instructionssprite);

	var menubutton = new PIXI.Sprite(buttontexture);
	menubutton.position.x = 192;
	menubutton.position.y = 512;
	instructions.addChild(menubutton);

	var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 128;
	menutext.position.y = 32;
	menubutton.addChild(menutext);

	var instructext = new PIXI.Text("INSTRUCTIONS: Move the orange gem using the WASD keys to touch all of the blue tiles. Do not pass over the same tile twice.", {font : '24px Lucida Console, Monaco, monospace', fill: 0x5fcde4, wordWrap : true, wordWrapWidth : 500});
	instructext.anchor.x = 0.5;
	instructext.anchor.y = 0.5;
	instructext.position.x = 320;
	instructext.position.y = 320;
	instructions.addChild(instructext);

	menubutton.interactive = true;
	menubutton.on('mousedown', handleMenu);

	function handleMenu(e) {
		loadScreen(menu);
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Credit Screen Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function creditsInteract() {
	credits.removeChildren(); // clean up credits screen
	var creditstexture = PIXI.Texture.fromImage('assets/screenbackground.png');
	var creditssprite = new PIXI.Sprite(creditstexture);
	credits.addChild(creditssprite);

	var menubutton = new PIXI.Sprite(buttontexture);
	menubutton.position.x = 192;
	menubutton.position.y = 512;
	credits.addChild(menubutton);

	var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 128;
	menutext.position.y = 32;
	menubutton.addChild(menutext);

	var credittext = new PIXI.Text("Game Development, Art, and Sound Effects by Marjorie Hahn", {font : '24px Lucida Console, Monaco, monospace', fill: 0x5fcde4, wordWrap : true, align: 'center', wordWrapWidth : 500});
	credittext.anchor.x = 0.5;
	credittext.anchor.y = 0.5;
	credittext.position.x = 320;
	credittext.position.y = 320;
	credits.addChild(credittext);

	menubutton.interactive = true;
	menubutton.on('mousedown', handleMenu);

	function handleMenu(e) {
		loadScreen(menu);
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Lose Screen Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function loseInteract() {
	losescreen.removeChildren(); // clean up losescreen
	var losetexture = PIXI.Texture.fromImage('assets/screenbackground.png');
	var losesprite = new PIXI.Sprite(losetexture);
	losescreen.addChild(losesprite);

	var menubutton = new PIXI.Sprite(buttontexture);
	menubutton.position.x = 192;
	menubutton.position.y = 512;
	losescreen.addChild(menubutton);

	var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 128;
	menutext.position.y = 32;
	menubutton.addChild(menutext);

	var titletext = new PIXI.Text('YOU LOSE! :(', {font : '40px Lucida Console, Monaco, monospace', fill: 0x5fcde4, align : 'center'});
	titletext.anchor.x = 0.5;
	titletext.anchor.y = 0.5;
	titletext.position.x = 320;
	titletext.position.y = 320;
	losescreen.addChild(titletext);

	menubutton.interactive = true;
	menubutton.on('mousedown', handleMenu);

	function handleMenu(e) {
		loadScreen(menu);
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Win Screen Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function winInteract() {
	winscreen.removeChildren(); // clean up winscreen
	var wintexture = PIXI.Texture.fromImage('assets/screenbackground.png');
	var winsprite = new PIXI.Sprite(wintexture);
	winscreen.addChild(winsprite);

	var menubutton = new PIXI.Sprite(buttontexture);
	menubutton.position.x = 192;
	menubutton.position.y = 512;
	winscreen.addChild(menubutton);

	var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x1d38ff, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 128;
	menutext.position.y = 32;
	menubutton.addChild(menutext);

	var titletext = new PIXI.Text('YOU WIN! :)', {font : '40px Lucida Console, Monaco, monospace', fill: 0x5fcde4, align : 'center'});
	titletext.anchor.x = 0.5;
	titletext.anchor.y = 0.5;
	titletext.position.x = 320;
	titletext.position.y = 320;
	winscreen.addChild(titletext);

	menubutton.interactive = true;
	menubutton.on('mousedown', handleMenu);

	function handleMenu(e) {
		loadScreen(menu);
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Game Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// set up game's container structure
game.addChild(environment);
game.addChild(character);
environment.addChild(walls);
environment.addChild(floortiles);
floortiles.addChild(untouchedfloor);
floortiles.addChild(touchedfloor);

var currentLevel = 1;

// variables to keep track of number of walls and floor tiles
var totaluntouched = 0;
var totaltouched = 0;
var totalwalls = 0;

function gameInteract() {

	// helper function to clear the current game data
	function cleanGame() {
		walls.removeChildren();
		untouchedfloor.removeChildren();
		touchedfloor.removeChildren();
		character.removeChildren();
		totaluntouched = 0;
		totaltouched = 0;
		totalwalls = 0;
	}
	cleanGame(); // make sure any previous game data is gone
	document.addEventListener('keydown', gameEventHandler);

	loadLevel(currentLevel);

	// places sprites on map given the sprite type, x position, and y position
	// think of the map as a 10x10 grid
	function placeSprite(type, x_pos, y_pos) {
		var sprite;

		if (type == 0) { // character
			sprite = new PIXI.Sprite(charactertexture);
			character.addChild(sprite);
		}
		else if (type == 1) { // untouched floor
			sprite = new PIXI.Sprite(floortexture);
			untouchedfloor.addChild(sprite);
			totaluntouched++;
		}
		else if (type == 2) { // wall
			sprite = new PIXI.Sprite(walltexture);
			walls.addChild(sprite);
			totalwalls++;
		}
		else if (type == 3) { // touched floor
			sprite = new PIXI.Sprite(alerttexture);
			touchedfloor.addChild(sprite);
			totaltouched++;
		}

		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		sprite.position.x = 32 + x_pos * 64;
		sprite.position.y = 32 + y_pos * 64;
	}

	// helper function to place sprites into the map based on the level number
	function loadLevel(level) {
		// load level 1
		if (level == 1) {
			for (i = 0; i < 10; i++) {
				for (j = 0; j < 10; j++) {
					if (i <= 2 || i >= 7 || j <= 2 || j >= 7) {
						placeSprite(2, i, j);
					}
					else {
						placeSprite(1, i, j);
					}
				}
			}
			placeSprite(0, 6, 6);
			var startpoint = new PIXI.Point(416, 416);
			checkCollisions(startpoint);
		}

		// load level 2
		else if (level == 2) {
			for (i = 0; i < 10; i++) {
				for (j = 0; j < 10; j++) {
					if (i <= 1 || i >= 8 || j <= 2 || j >= 7
							|| (i == 3 && j == 4) || (i == 6 && j == 4)) {
						placeSprite(2, i, j);
					}
					else {
						placeSprite(1, i, j);
					}
				}
			}
			placeSprite(0, 4, 6);
			var startpoint = new PIXI.Point(288, 416);
			checkCollisions(startpoint);
		}

		// load level 3
		else if (level == 3) {
			for (i = 0; i < 10; i++) {
				for (j = 0; j < 10; j++) {
					if (i <= 1 || i >= 8 || j <= 1 || j >= 8
							|| (i == 3 && j > 2 && j < 6)
							|| (j == 5 && i > 2 && i < 6)
							|| (i == 6 && j == 3)
							|| (i == 6 && j == 6)
							|| (i == 4 && j == 7) ) {
						placeSprite(2, i, j);
					}
					else {
						placeSprite(1, i, j);
					}
				}
			}
			placeSprite(0, 7, 7);
			var startpoint = new PIXI.Point(480, 480);
			checkCollisions(startpoint);
		}

		// load level 4
		else if (level == 4) {
			for (i = 0; i < 10; i++) {
				for (j = 0; j < 10; j++) {
					if (i == 0 || i == 9 || j <= 1 || j >= 8
							|| (j == 3 && i > 1 && i < 5)
							|| (i == 4 && j > 2 && j < 6)
							|| (i == 6 && j > 1 && j < 4)
							|| (i == 7 && j == 5)
							|| (j == 7 && i > 1 && i < 7 && i != 4) ) {
						placeSprite(2, i, j);
					}
					else {
						placeSprite(1, i, j);
					}
				}
			}
			placeSprite(0, 4, 7);
			var startpoint = new PIXI.Point(288, 480);
			checkCollisions(startpoint);
		}

		// load level 5
		else if (level == 5) {
			for (i = 0; i < 10; i++) {
				for (j = 0; j < 10; j++) {
					if (i == 0 || i == 9 || j == 0 || j == 9
							|| (j == 3 && i > 3 && i < 6)
							|| (j == 2 && i > 1 && i < 8 && i != 4 && i != 5)
							|| (j == 4 && i > 0 && i < 3)
							|| (j == 5 && i > 5 && i < 8)
							|| (i == 6 && j > 6 && j < 9)
							|| (j == 6 && i > 2 && i < 5) ) {
						placeSprite(2, i, j);
					}
					else {
						placeSprite(1, i, j);
					}
				}
			}
			placeSprite(0, 3, 4);
			var startpoint = new PIXI.Point(224, 288);
			checkCollisions(startpoint);
		}
		/*var leveltxt = new PIXI.Text('LEVEL', {font : '20px Lucida Console, Monaco, monospace', fill: 0xff9751 , align : 'center'});
		leveltxt.anchor.x = 0.5;
		leveltxt.anchor.y = 0.5;
		leveltxt.position.x = 320;
		leveltxt.position.y = 32;
		environment.addChild(leveltxt);*/
	}

	// helper function to check for collisions
	// 0 = no collisions; 1 = collision, prevent move
	// 2 = won level; 3 = won final level; 4 = lose
	function checkCollisions(new_position) {

		// check wall collisions
		for (i = 0; i < totalwalls; i++) {
			var wall = walls.getChildAt(i);
			if (wall.position.equals(new_position)) {
				return 1;
			}
		}

		// check touched floor
		for (i = 0; i < totaltouched; i++) {
			var floor = touchedfloor.getChildAt(i);
			if (floor.position.equals(new_position)) { // check for a loss
				floor.texture = failtexture;
				return 4;
			}
		}

		// check untouched floor
		for (i = 0; i < totaluntouched; i++) {
			var floor = untouchedfloor.getChildAt(i);
			if (floor.position.equals(new_position)) {
				totaluntouched--;
				if (totaluntouched == 0) { // check for a win
					floor.texture = successtexture;
					if (currentLevel == 5) { // won final level
						return 3;
					}
					else { // increment level and play again
						return 2;
					}
				}
				else { // no win, change sprite to touched
					untouchedfloor.removeChildAt(i);
					placeSprite(3, (new_position.x - 32) / 64, (new_position.y - 32) / 64);
					return 0;
				}
			}
		}
		return 0;
	}

	// main event handler for the game
	function gameEventHandler(e) {
		e.preventDefault();

		if (canmove == true && (e.keyCode == 87 || e.keyCode == 83 || e.keyCode == 65 || e.keyCode == 68) ) { // if allowed to move
			var charsprite = character.getChildAt(0);
			var new_position = new PIXI.Point(charsprite.position.x, charsprite.position.y);

			if (e.keyCode == 87) { // W key
				new_position.y = charsprite.position.y - 64;
			}
			else if (e.keyCode == 83) { // S key
				new_position.y = charsprite.position.y + 64;
			}
			else if (e.keyCode == 65) { // A key
				new_position.x = charsprite.position.x - 64;
			}
			else if (e.keyCode == 68) { // D key
				new_position.x = charsprite.position.x + 64;
			}
			var result = checkCollisions(new_position);
			if (result == 0) { // no collisions found, move character
				createjs.Tween.get(charsprite.position).to({x: new_position.x, y: new_position.y}, 150, createjs.Ease.quintInOut);
				movesound.play();
			}
			else if (result == 2) { // player won level
				createjs.Tween.get(charsprite.position).to({x: new_position.x, y: new_position.y}, 150, createjs.Ease.quintInOut);
				currentLevel++; // go to next level
				document.removeEventListener('keydown', gameEventHandler);
				winsound.play();
				setTimeout(gameInteract, 1500);
			}
			else if (result == 3) { // player won final level
				createjs.Tween.get(charsprite.position).to({x: new_position.x, y: new_position.y}, 150, createjs.Ease.quintInOut);
				currentLevel = 1; // reset levels
				document.removeEventListener('keydown', gameEventHandler);
				winsound.play();
				setTimeout(loadScreen.bind(null, winscreen), 1500);
			}
			else if (result == 4) { // player lost
				createjs.Tween.get(charsprite.position).to({x: new_position.x, y: new_position.y}, 150, createjs.Ease.quintInOut);
				currentLevel = 1; // reset levels
				document.removeEventListener('keydown', gameEventHandler);
				losesound.play();
				setTimeout(loadScreen.bind(null, losescreen), 1200);
			}
			canmove = false; // prevent movement
			interval = 0; // reset interval
		}
	}
}
