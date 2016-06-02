/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Marjorie Hahn
* CS413: Virtual Worlds
* Project 4: Final
* Winter is Coming
* 1 June 2016
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Game Constants
var GAME_WIDTH = 640;
var GAME_HEIGHT = 640;
var TILE_HEIGHT = 40;
var TILE_WIDTH = 40;
var MAP_WIDTH = 16;
var MAP_HEIGHT = 40;
var PLAYERSPEED = 4;
var INITIALJUMPSPEED = 25;
var FALLSPEED = 10;
var GRAVITY = 0.98;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
gameport.appendChild(renderer.view);

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Global Variables
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Time variables
var time; // previous time from last request
var dt = 0; // current change in time since last request

// Player variables
var jumpup = true;
var jumpspeed = INITIALJUMPSPEED;
var initialheight = 0;
var falldistance = 0;

// Tile/Map Variables
var tu = new TileUtilities(PIXI);
var foreground;

// Main PIXI containers
var stage = new PIXI.Container();
var title = new PIXI.Container();
var menu = new PIXI.Container();
var credits = new PIXI.Container();
var instructions = new PIXI.Container();
var game = new PIXI.Container();

var tu = new TileUtilities(PIXI);

var playertexture = PIXI.Texture.fromImage("player.png");

var player;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Load Data
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

PIXI.loader
.add('map_json', 'map.json')
.add('tileset', 'tileset.png')
.load(ready);

function ready(){
  world = tu.makeTiledWorld("map_json", "tileset.png");
  foreground = world.getObject("foreground").data;
  game.addChild(world);
  stage.addChild(game);

  var logthis;
  for (i = 0; i < foreground.length; i += 16){
    logthis = foreground.slice(i, (i + 16));
    console.log(logthis);
  }

  player = new PIXI.Sprite(playertexture);
  player.anchor.x = 0.5;
  player.anchor.y = 0.5;
  player.x = world.worldWidth/2;
  player.y = world.worldHeight - TILE_HEIGHT - player.height/2;
  game.addChild(player);

  var index = tu.getIndex(player.x, player.y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  console.log(index);

  animate();
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Event Handlers
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Keydown events start movement
window.addEventListener("keydown", gameKeyDown);

function gameKeyDown(e) {
  e.preventDefault();
  if (!player) return;
  if (e.repeat == true) return;

  if (e.keyCode == 87 || e.keyCode == 32) // W key or spacebar
    playerstate.up();
  else if (e.keyCode == 65) // A key
    playerstate.left();
  else if (e.keyCode == 68) // D key
    playerstate.right();
}

// Keyup events end movement
window.addEventListener("keyup", gameKeyUp);

function gameKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  playerstate.stand();
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* State Machines
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var playerstate = StateMachine.create({
  initial: {state: 'rightstanding', event: 'init'},
  error: function() {},
  events: [
    {name: "up", from: "rightstanding", to: "rightjumping"},
    {name: "up", from: "leftstanding", to: "leftjumping"},
    {name: "up", from: "rightrunning", to: "rightjumping"},
    {name: "up", from: "leftrunning", to: "leftjumping"},

    {name: "left", from: "rightstanding", to: "leftrunning"},
    {name: "left", from: "leftstanding", to: "leftrunning"},
    {name: "left", from: "rightrunning", to: "leftrunning"},
    {name: "left", from: "leftrunning", to: "leftrunning"},

    {name: "right", from: "rightstanding", to: "rightrunning"},
    {name: "right", from: "leftstanding", to: "rightrunning"},
    {name: "right", from: "rightrunning", to: "rightrunning"},
    {name: "right", from: "leftrunning", to: "rightrunning"},

    {name: "stand", from: "rightjumping", to: "rightstanding"},
    {name: "stand", from: "leftjumping", to: "leftstanding"},
    {name: "stand", from: "rightrunning", to: "rightstanding"},
    {name: "stand", from: "leftrunning", to: "leftstanding"},
    {name: "stand", from: "rightstanding", to: "rightstanding"},
    {name: "stand", from: "leftstanding", to: "leftstanding"},
    {name: "stand", from: "falling", to: "rightstanding"},

    {name: "fall", from: "rightstanding", to: "falling"},
    {name: "fall", from: "leftstanding", to: "falling"},
    {name: "fall", from: "rightjumping", to: "falling"},
    {name: "fall", from: "leftjumping", to: "falling"},
    {name: "fall", from: "rightrunning", to: "falling"},
    {name: "fall", from: "leftrunning", to: "falling"},
    {name: "fall", from: "falling", to: "falling"}
  ],
  callbacks: {
    onrightjumping: function() {
      //console.log("Right Jumping State");
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
      initialheight = player.y;
    },
    onrightstanding: function() {
      //console.log("Right Standing State");
    },
    onrightrunning: function() {
      //console.log("Right Running State");
    },
    onleftjumping: function() {
      //console.log("Left Jumping State");
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
      initialheight = player.y;
    },
    onleftstanding: function() {
      //console.log("Left Standing State");
    },
    onleftrunning: function() {
      //console.log("Left Running State");
    },
    onfalling: function() {
      //console.log("Falling");
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
    },
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Update Functions
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function update_player() {
  if (playerstate.is("leftstanding") || playerstate.is("rightstanding")) {
    return;
  }

  var new_x;
  var new_y;
  var collision;
  var below;

  if (playerstate.is("leftrunning")) {
    runHelper(-1);
  }
  else if (playerstate.is("rightrunning")) {
    runHelper(1);
  }
  else if (playerstate.is("rightjumping")) {
    jumpHelper(1);
  }
  else if (playerstate.is("leftjumping")) {
    jumpHelper(-1);
  }
  else if (playerstate.is("falling")) {
    initial_below = detectBelow(player.x, player.y);
    if (initial_below != 0) {
      jumpspeed = INITIALJUMPSPEED;
      falldistance = 0;
      window.addEventListener("keydown", gameKeyDown);
      window.addEventListener("keyup", gameKeyUp);
      playerstate.stand();
    }
    else {
    new_y = player.y + jumpspeed;
    falldistance += jumpspeed;
    jumpspeed += GRAVITY;
    below = detectBelow(player.x, new_y);
    console.log(below);
    if (below != 0) {
      jumpspeed = INITIALJUMPSPEED;
      falldistance = 0;
      player.y = new_y - (new_y % TILE_HEIGHT) - player.height/2 + TILE_HEIGHT;
      window.addEventListener("keydown", gameKeyDown);
      window.addEventListener("keyup", gameKeyUp);
      playerstate.stand();
    }
    else {
      player.y = new_y;
    }
  }
  }
  //var index = tu.getIndex(player.x, player.y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  //console.log(index);
}

function update_camera() {
  stage.y = -player.y + GAME_HEIGHT/2 + player.height/2;
  stage.y = -Math.max(0, Math.min(world.worldHeight - GAME_HEIGHT, -stage.y));
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Game Helper Functions
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// direction is 1 if running right, -1 if running left
function runHelper(direction) {
  new_x = player.x + direction*PLAYERSPEED;
  collision = detectCollision(new_x, player.y);
  below = detectBelow(new_x, player.y);
  if (collision == 0) {
    player.x = new_x;
    if (below == 0) {
      playerstate.fall();
    }
  }
}

// direction is 1 if jumping right, -1 if jumping left
function jumpHelper(direction) {
  if (jumpspeed >= 0 && jumpup) { // jumping upwards
    new_x = player.x + direction*PLAYERSPEED;
    new_y = player.y - jumpspeed;
    jumpspeed -= GRAVITY;
    collision = detectCollision(new_x, new_y);
    if (collision == 3) { // hit tree trunk
      playerstate.fall();
    }
    else {
      player.x = new_x;
      player.y = new_y;
    }
  }
  else { // "jumping" downwards
    jumpup = false;
    new_x = player.x + direction*PLAYERSPEED;
    new_y = player.y + jumpspeed;
    below = detectBelow(new_x, new_y);
    collision = detectCollision(new_x, new_y);
    if (below == 0 && collision != 3) {
      player.x = new_x;
      player.y = new_y;
      jumpspeed += GRAVITY;
    }
    else if (below == 2 || below == 1) {
      player.x = new_x;
      player.y = new_y - (new_y % TILE_HEIGHT) - player.height/2 + TILE_HEIGHT;
      jumpup = true;
      jumpspeed = INITIALJUMPSPEED;
      window.addEventListener("keydown", gameKeyDown);
      window.addEventListener("keyup", gameKeyUp);
      playerstate.stand();
    }
    else if (collision == 3) {
      jumpup = true;
      playerstate.fall();
    }
  }
}

// returns 0 if no collision
// returns 1 if grass collision
// returns 2 if tree collision
function detectCollision(new_x, new_y) {
  var new_index = tu.getIndex(new_x, new_y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  var tileID = foreground[new_index];

  if (tileID == 1) {
    console.log("Grass Collision");
    return 1;
  }
  else if (tileID == 2) {
    console.log("Tree Collision");
    return 2;
  }
  else if (tileID == 4) {
    console.log("Trunk Collision");
    return 3;
  }
  return 0; // no collision detected
}

// returns 0 if there is nothing below
// returns 1 if there is grass below
// returns 2 if there is a branch below
function detectBelow(new_x, new_y) {
  var new_index = tu.getIndex(new_x, new_y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  var cells = tu.surroundingCells(new_index, MAP_WIDTH);
  var belowID = foreground[cells[7]]; // GID below the position
  //var belowID = getBelow(foreground, new_index, MAP_WIDTH);

  if (belowID == 1) {
    console.log("Grass Below");
    return 1;
  }
  else if (belowID == 2) {
    console.log("Branch Below");
    return 2;
  }
  return 0;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Game Loop
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function animate() {
  requestAnimationFrame(animate);
  var now = new Date().getTime();
  dt = now - (time || now);
  time = now;

  update_player();
  update_camera();

  renderer.render(stage);
}
//animate();