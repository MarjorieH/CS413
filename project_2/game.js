/*
 * Marjorie Hahn
 * CS413: Virtual Worlds
 * Project 2: Puzzles
 * 22 May 2016
 */

var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(640, 640);
gameport.appendChild(renderer.view);

// set up stage and main pixi containers for sprites in the game
var stage = new PIXI.Container();
var game = new PIXI.Container();
stage.addChild(game);
var character = new PIXI.Container();
var environment = new PIXI.Container();
game.addChild(environment);
game.addChild(character);
var walls = new PIXI.Container();
var floortiles = new PIXI.Container();
environment.addChild(walls);
environment.addChild(floortiles);
var untouchedfloor = new PIXI.Container();
var touchedfloor = new PIXI.Container();
floortiles.addChild(untouchedfloor);
floortiles.addChild(touchedfloor);

// load in textures
var floortexture = PIXI.Texture.fromImage('assets/floor.png');
var alerttexture = PIXI.Texture.fromImage('assets/alertfloor.png');
var failtexture = PIXI.Texture.fromImage('assets/failfloor.png');
var successtexture = PIXI.Texture.fromImage('assets/successfloor.png');
var walltexture = PIXI.Texture.fromImage('assets/wall.png');
var charactertexture = PIXI.Texture.fromImage('assets/character.png');

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

// global variables to keep track of number of walls and floor tiles
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

function keydownEventHandler(e) {

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
		if (floor.position.equals(new_position)) {
			floor.texture = failtexture;
			winstate = 2;
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

document.addEventListener('keydown', keydownEventHandler);

function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}
animate();
