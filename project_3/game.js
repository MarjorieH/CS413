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

var GAME_WIDTH = 448;
var GAME_HEIGHT = 448;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
gameport.appendChild(renderer.view);

var tu = new TileUtilities(PIXI);

// set up all the main screen containers
var stage = new PIXI.Container();
var game = new PIXI.Container();


PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// load in map and sound effects
PIXI.loader
  .add('map_json', 'map.json')
  .add('tileset', 'tileset.png')
  .add('blob', 'blob.png')
  .load(ready);

// load in game textures
var spooktexture = PIXI.Texture.fromImage("blob.png");

// Scene objects get loaded in the ready function
var player;
var spook;
var world;
var obstacleArray = [];
var obstacles;

// Character movement constants:
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var MOVE_UP = 3;
var MOVE_DOWN = 4;
var MOVE_NONE = 0;

function ready() {
  world = tu.makeTiledWorld("map_json", "tileset.png");
  game.addChild(world);

  // build array of obstacles from world map
  obstacleLayer = world.getObject("obstacles");
  obstacles = obstacleLayer.children.map(sprite => {
    if (sprite.gid !== 0) return sprite;
  })

  // initialize player sprite
  player = new PIXI.Sprite(PIXI.Texture.fromImage("blob.png"));
  player.anchor.x = 0.5;
  player.anchor.y = 0.5;
  player.x = 224;
  player.y = 288;
  game.addChild(player);
  player.direction = MOVE_NONE;
  player.moving = false;

  // initalize the spook
  spook = new PIXI.Sprite(spooktexture);
  spook.anchor.x = 0.5;
  spook.anchor.y = 0.5;
  spook.x = 288;
  spook.y = 1696;
  game.addChild(spook);

  gameInteract();
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Game Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function gameInteract() {
  stage.addChild(game);
  var spooktimer = 0; // reset/initialize spook timer
  var spookstage = 0;

  window.addEventListener("keydown", gameKeyDown);
  window.addEventListener("keyup", gameKeyUp);

  function gameKeyUp(e) {
    e.preventDefault();
    if (!player) return;
    player.direction = MOVE_NONE;
  }
  function gameKeyDown(e) {
    e.preventDefault();
    if (!player) return;
    if (player.moving) return;
    if (e.repeat == true) return;

    player.direction = MOVE_NONE;

    if (e.keyCode == 87)
      player.direction = MOVE_UP;
    else if (e.keyCode == 83)
      player.direction = MOVE_DOWN;
    else if (e.keyCode == 65)
      player.direction = MOVE_LEFT;
    else if (e.keyCode == 68)
      player.direction = MOVE_RIGHT;

    move();
  }

  // The move function starts or continues movement
  function move() {
    if (player.direction == MOVE_NONE) {
      player.moving = false;
      return;
    }
    player.moving = true;

    var new_x = player.x;
    var new_y = player.y;

    if (player.direction == MOVE_LEFT) new_x -= 64;
    else if (player.direction == MOVE_RIGHT) new_x += 64;
    else if (player.direction == MOVE_UP) new_y -= 64;
    else if (player.direction == MOVE_DOWN) new_y += 64;

    var collisionsDetected = detectCollisions(new_x, new_y, obstacles);
    if (collisionsDetected == false) {
      createjs.Tween.get(player).to({x: new_x, y: new_y}, 200).call(move);
    }
    else {
      player.moving = false;
    }
  }

  // detect collisions over an array of objects
  // assumes the array is anchored in the top left corner
  function detectCollisions(x_pos, y_pos, objects) {
    for (i = 0; i < objects.length; i++) {
      if (detectCollision(x_pos, y_pos, objects[i].x + 32, objects[i].y + 32)) return true;
    }
    return false;
  }

  // detects collisions between two points
  // positions must be anchored in the center
  // returns false if no collision, true if there is a collision
  function detectCollision(x1, y1, x2, y2) {
    if (x1 == x2 && y1 == y2) return true;
    return false;
  }

  function update_camera() {
    stage.x = -player.x + GAME_WIDTH/2 - player.width/2;
    stage.y = -player.y + GAME_HEIGHT/2 + player.height/2;
    stage.x = -Math.max(0, Math.min(world.worldWidth - GAME_WIDTH, -stage.x));
    stage.y = -Math.max(0, Math.min(world.worldHeight - GAME_HEIGHT, -stage.y));
  }
  function update_spook() {

    //console.log(spooktimer);

    console.log(spookstage);

    // check if spook is ready to move again
    if (((spook.x + 32) % 64 != 0 || (spook.y + 32) % 64 != 0)) return;

    var spookspeed; // speed of the spook

    if (spookstage == 0) spookspeed = 5000;
    else if (spookstage == 1) spookspeed = 4000;
    else if (spookstage == 2) spookspeed = 3000;
    else if (spookstage == 3) spookspeed = 2000;
    else if (spookstage == 4) spookspeed = 1000;
    else if (spookstage == 5) spookspeed = 500;
    else if (spookstage == 6) spookspeed = 250;

    var new_x = spook.x;
    var new_y = spook.y;

    if (spook.x > player.x) new_x -= 64;
    else if (spook.x < player.x) new_x += 64;

    if (spook.y > player.y) new_y -= 64;
    else if (spook.y < player.y) new_y += 64;

    if (((new_x + 32) % 64 == 0 && (new_y + 32) % 64 == 0)) { // check if new spot is on grid
      createjs.Tween.get(spook).to({x: new_x, y: new_y}, spookspeed); // move spook
    }
  }

  // Game Loop
  var time; // previous time from last request
  var dt = 0; // current change in time since last request
  var incstage = false;
  function animate() {
    requestAnimationFrame(animate);
    var now = new Date().getTime();
    dt = now - (time || now);
    time = now;
    spooktimer += dt;

    if (spooktimer > 15000) {
      spookstage++;
      spooktimer = 0;
    }

    update_spook();
    update_camera();
    renderer.render(stage);
  }
  animate();
}
