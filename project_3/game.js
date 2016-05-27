var GAME_WIDTH = 448;
var GAME_HEIGHT = 448;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

var game = new PIXI.Container();
stage.addChild(game);

var tu = new TileUtilities(PIXI);

// Scene objects get loaded in the ready function
var player;
var world;
var obstacleArray = [];
var obstacles;

// Character movement constants:
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var MOVE_UP = 3;
var MOVE_DOWN = 4;
var MOVE_NONE = 0;

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

// Keydown events start movement
window.addEventListener("keydown", function (e) {
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
});

// Keyup events end movement
window.addEventListener("keyup", function onKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  player.direction = MOVE_NONE;
});

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.loader
  .add('map_json', 'map.json')
  .add('tileset', 'tileset.png')
  .add('blob', 'blob.png')
  .load(ready);

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

  animate();

  // Game Loop
  var time; // previous time from last request
  var dt = 0; // current change in time since last request
  function animate() {
  	requestAnimationFrame(animate);
  	var now = new Date().getTime();
  	dt = now - (time || now);
  	time = now;
    update_camera();
  	renderer.render(stage);
  }

  function update_camera() {
    stage.x = -player.x + GAME_WIDTH/2 - player.width/2;
    stage.y = -player.y + GAME_HEIGHT/2 + player.height/2;
    stage.x = -Math.max(0, Math.min(world.worldWidth - GAME_WIDTH, -stage.x));
    stage.y = -Math.max(0, Math.min(world.worldHeight - GAME_HEIGHT, -stage.y));
  }
}
