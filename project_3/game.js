var GAME_WIDTH = 448;
var GAME_HEIGHT = 448;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

var game = new PIXI.Container();
stage.addChild(game);

// Scene objects get loaded in the ready function
var player;
var world;
var obstacleArray = [];

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

  if (player.direction == MOVE_LEFT) {
    new_x = player.x - 64;
    createjs.Tween.get(player).to({x: new_x}, 100).call(move);
  }
  else if (player.direction == MOVE_RIGHT) {
    new_x = player.x + 64;
    createjs.Tween.get(player).to({x: new_x}, 100).call(move);
  }
  else if (player.direction == MOVE_UP) {
    new_y = player.y - 64;
    createjs.Tween.get(player).to({y: new_y}, 100).call(move);
  }
  else if (player.direction == MOVE_DOWN) {
    new_y = player.y + 64;
    createjs.Tween.get(player).to({y: new_y}, 100).call(move);
  }
}

function detectCollision() {

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
  var tu = new TileUtilities(PIXI);
  world = tu.makeTiledWorld("map_json", "tileset.png");
  game.addChild(world);

  obstacleArray = world.getObject("obstacles").data;
  console.log(obstacleArray.length);

  player = new PIXI.Sprite(PIXI.Texture.fromImage("blob.png"));
  player.x = 224;
  player.y = 288;
  player.anchor.x = 0.5;
  player.anchor.y = 0.5;

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
