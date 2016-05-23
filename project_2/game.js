/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Marjorie Hahn
* CS413: Virtual Worlds
* Project 2: Puzzles
* 22 May 2016
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Main Set Up
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(640, 640);
gameport.appendChild(renderer.view);

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

// load in main screen textures
var titletexture = PIXI.Texture.fromImage('assets/mainmenu.png');
var titlesprite = new PIXI.Sprite(titletexture);
title.addChild(titlesprite);
var menutexture = PIXI.Texture.fromImage('assets/mainmenu.png');
var menusprite = new PIXI.Sprite(menutexture);
menu.addChild(menusprite);
var instructionstexture = PIXI.Texture.fromImage('assets/mainmenu.png');
var instructionssprite = new PIXI.Sprite(instructionstexture);
instructions.addChild(instructionssprite);
var wintexture = PIXI.Texture.fromImage('assets/mainmenu.png');
var winsprite = new PIXI.Sprite(wintexture);
winscreen.addChild(winsprite);
var losetexture = PIXI.Texture.fromImage('assets/mainmenu.png');
var losesprite = new PIXI.Sprite(losetexture);
losescreen.addChild(losesprite);
var creditstexture = PIXI.Texture.fromImage('assets/mainmenu.png');
var creditssprite = new PIXI.Sprite(creditstexture);
credits.addChild(creditssprite);

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

function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}
animate();

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Title Screen Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function titleInteract() {
	var buttontexture = PIXI.Texture.fromImage('assets/genericbutton.png');
	var menubutton = new PIXI.Sprite(buttontexture);

	menubutton.position.x = 192;
	menubutton.position.y = 512;

	title.addChild(menubutton);

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
	var buttontexture = PIXI.Texture.fromImage('assets/genericbutton.png');

	var instrucbutton = new PIXI.Sprite(buttontexture);
	var playbutton = new PIXI.Sprite(buttontexture);
	var creditbutton = new PIXI.Sprite(buttontexture);

	instrucbutton.position.x = 192;
	instrucbutton.position.y = 256;

	playbutton.position.x = 192;
	playbutton.position.y = 384;

	creditbutton.position.x = 192;
	creditbutton.position.y = 512;

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
	var buttontexture = PIXI.Texture.fromImage('assets/genericbutton.png');
	var menubutton = new PIXI.Sprite(buttontexture);

	menubutton.position.x = 192;
	menubutton.position.y = 512;

	instructions.addChild(menubutton);

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
	var buttontexture = PIXI.Texture.fromImage('assets/genericbutton.png');
	var menubutton = new PIXI.Sprite(buttontexture);

	menubutton.position.x = 192;
	menubutton.position.y = 512;

	credits.addChild(menubutton);

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
	var buttontexture = PIXI.Texture.fromImage('assets/genericbutton.png');
	var menubutton = new PIXI.Sprite(buttontexture);

	menubutton.position.x = 192;
	menubutton.position.y = 512;

	losescreen.addChild(menubutton);

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
	var buttontexture = PIXI.Texture.fromImage('assets/genericbutton.png');
	var menubutton = new PIXI.Sprite(buttontexture);

	menubutton.position.x = 192;
	menubutton.position.y = 512;

	winscreen.addChild(menubutton);

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

// load in game textures
var floortexture = PIXI.Texture.fromImage('assets/floor.png');
var alerttexture = PIXI.Texture.fromImage('assets/alertfloor.png');
var failtexture = PIXI.Texture.fromImage('assets/failfloor.png');
var successtexture = PIXI.Texture.fromImage('assets/successfloor.png');
var walltexture = PIXI.Texture.fromImage('assets/wall.png');
var charactertexture = PIXI.Texture.fromImage('assets/character.png');

// helper function to clear the current game data
function cleanGame() {
	walls.removeChildren();
	untouchedfloor.removeChildren();
	touchedfloor.removeChildren();
	character.removeChildren();
}

function gameInteract() {
	cleanGame(); // make sure any previous game data is gone
	document.addEventListener('keydown', gameEventHandler);

	// variables to keep track of number of walls and floor tiles
	var totaluntouched = 0;
	var totaltouched = 0;
	var totalwalls = 0;
	var winstate = 0; // 0 = neutral; 1 = win; 2 = lose

	// place the sprites into the map
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

	function gameEventHandler(e) {

		if (winstate == 0) { // only allow moves if there has not been a win/loss yet
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
			if (result == 0) { // no collisions found
				charsprite.position.y = new_position.y;
				charsprite.position.x = new_position.x;
			}
		}
	}

	// helper function to check for collisions
	// 0 = no collisions; 1 = collision, prevent move
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
				winstate = 2;
				document.removeEventListener('keydown', gameEventHandler);
				loadScreen(losescreen);
				return 0;
			}
		}

		// check untouched floor
		for (i = 0; i < totaluntouched; i++) {
			var floor = untouchedfloor.getChildAt(i);
			if (floor.position.equals(new_position)) {
				totaluntouched--;
				if (totaluntouched == 0) { // check for a win
					floor.texture = successtexture;
					winstate = 1;
					document.removeEventListener('keydown', gameEventHandler);
					loadScreen(winscreen);
					return 0;
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
}
