var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(416, 416, {backgroundColor: 0x352912});
gameport.appendChild(renderer.view);

// set up stage and main pixi containers for sprites in the game
var stage = new PIXI.Container();
var mouse = new PIXI.Container();
var cheese = new PIXI.Container();
var cats = new PIXI.Container();
var walls = new PIXI.Container();
stage.addChild(mouse);
stage.addChild(cheese);
stage.addChild(walls);
stage.addChild(cats);

// global variables to keep track of number of cats and walls
var totalcats = 0;
var totalwalls = 0;
var winstate = 0; // 0 = no win; 1 = win; 2 = lose

// fill the map with sprites
placeSprite(0, 0, 0); placeSprite(1, 0, 3);
placeSprite(1, 1, 0); placeSprite(1, 1, 1); placeSprite(1, 1, 3); placeSprite(1, 1, 5); placeSprite(1, 1, 6);
placeSprite(1, 2, 5);
placeSprite(1, 3, 1); placeSprite(1, 3, 2); placeSprite(1, 3, 3); placeSprite(1, 3, 4); placeSprite(1, 3, 5); placeSprite(1, 3, 7);
placeSprite(1, 4, 7); placeSprite(2, 4, 4);
placeSprite(1, 5, 1); placeSprite(1, 5, 2); placeSprite(1, 5, 3); placeSprite(1, 5, 4); placeSprite(1, 5, 5); placeSprite(1, 5, 7);
placeSprite(1, 6, 1); placeSprite(1, 6, 5);
placeSprite(1, 7, 3); placeSprite(2, 7, 5); placeSprite(1, 7, 6); placeSprite(3, 7, 7);

// places sprites on map given the sprite type, x position, and y position
// think of the map as an 8x8 grid
function placeSprite(type, x_pos, y_pos) {

	var sprite;

	if (type == 0) { // mouse
		sprite = new PIXI.Sprite(PIXI.Texture.fromImage("assets/mouse.png"));
		mouse.addChild(sprite);
	}
	else if (type == 1) { // wall
		sprite = new PIXI.Sprite(PIXI.Texture.fromImage("assets/walltexture.png"));
		walls.addChild(sprite);
		totalwalls++;
	}
	else if (type == 2) { // cat
		sprite = new PIXI.Sprite(PIXI.Texture.fromImage("assets/spookycat.png"));
		cats.addChild(sprite);
		totalcats++;
	}
	else if (type == 3) { // cheese
		sprite = new PIXI.Sprite(PIXI.Texture.fromImage("assets/cheese.png"));
		cheese.addChild(sprite);
	}

	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = 26 + x_pos * 52;
	sprite.position.y = 26 + y_pos * 52;
}

function keydownEventHandler(e) {

	if (winstate == 0) { // only allow moves if there has not been a win/loss yet
	var mousesprite = mouse.getChildAt(0);
	var new_position = new PIXI.Point(mousesprite.position.x, mousesprite.position.y);

  if ((e.keyCode == 87) && (mousesprite.position.y > 20)) { // W key
		new_position.y = mousesprite.position.y - 8;
		new_position.x = mousesprite.position.x;
  }
  else if ((e.keyCode == 83) && (mousesprite.position.y < 400)) { // S key
    new_position.y = mousesprite.position.y + 8;
		new_position.x = mousesprite.position.x;
  }
  else if ((e.keyCode == 65) && (mousesprite.position.x > 20)) { // A key
    new_position.x = mousesprite.position.x - 8;
		new_position.y = mousesprite.position.y;
  }
	else if ((e.keyCode == 68) && (mousesprite.position.x < 400)) { // D key
    new_position.x = mousesprite.position.x + 8;
		new_position.y = mousesprite.position.y;
  }

	var result = checkCollisions(new_position);
	if (result == 0) { // no collisions found
		mousesprite.position.y = new_position.y;
		mousesprite.position.x = new_position.x;
		document.getElementById('gamestate').innerHTML = '';
	}
	else if (result == 1) { // hit wall
		document.getElementById('gamestate').innerHTML = 'Cannot move there...';
	}
	else if (result == 2) { // hit cat
		mousesprite.position.y = new_position.y;
		mousesprite.position.x = new_position.x;
		document.getElementById('gamestate').innerHTML = 'Eaten by a cat...you lose!';
		winstate = 2;
	}
	else if (result == 3) { // hit cheese
		mousesprite.position.y = new_position.y;
		mousesprite.position.x = new_position.x;
		document.getElementById('gamestate').innerHTML = 'Delicious...you win!';
		winstate = 1;
	}
	}
}

// helper function to check for collisions
// 0 = no collision; 1 = wall collision; 2 = cat collision; 3 = cheese collision
function checkCollisions(new_position) {

	var distance;

	// check for collision with walls
	for (i = 0; i < totalwalls; i++) {
		var wall = walls.getChildAt(i);
		distance = wall.toLocal(new_position);
		distance.y = Math.abs(distance.y);
		distance.x = Math.abs(distance.x);
		if ((distance.y <= (wall.height/2 + mouse.height/2)) // check vertical collision
				&&
				(distance.x <= (wall.width/2 + mouse.width/2))) { // check horizontal collision
			return 1; // found a collision, return immediately
		}
	}

	// check for collision with cats
	for (i = 0; i < totalcats; i++) {
		var cat = cats.getChildAt(i);
		distance = cat.toLocal(new_position);
		distance.y = Math.abs(distance.y);
		distance.x = Math.abs(distance.x);
		if ((distance.y <= (cat.height/2 + mouse.height/2)) // check vertical collision
				&&
				(distance.x <= (cat.width/2 + mouse.width/2))) { // check horizontal collision
			return 2; // found a collision, return immediately
		}
	}

	// check for collision with cheese
	var cheesesprite = cheese.getChildAt(0);
	distance = cheesesprite.toLocal(new_position);
	distance.y = Math.abs(distance.y);
	distance.x = Math.abs(distance.x);
	if ((distance.y <= (cheese.height/2 + mouse.height/2)) // check vertical collision
			&&
			(distance.x <= (cheese.width/2 + mouse.width/2))) { // check horizontal collision
		return 3; // collided with cheese
	}

	return 0; // no collisions found
}

document.addEventListener('keydown', keydownEventHandler);

function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}
animate();
