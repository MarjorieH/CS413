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
var PLAYERSPEED = 4;
var INITIALJUMPSPEED = 25;
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

// Jumping variables
var jumpup = true;
var jumpspeed = INITIALJUMPSPEED;
var initialheight = 0;

// Tile/Map Variables
var tu = new TileUtilities(PIXI);

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
  game.addChild(world);
  stage.addChild(game);

  player = new PIXI.Sprite(playertexture);
  player.anchor.x = 0.5;
  player.anchor.y = 0.5;
  player.x = world.worldWidth/2;
  player.y = world.worldHeight - 37 - player.height/2;
  game.addChild(player);

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
  //if (e.repeat == true) return;

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
    {name: "stand", from: "leftstanding", to: "leftstanding"}
  ],
  callbacks: {
    onrightjumping: function() {
      console.log("Right Jumping State");
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
      initialheight = player.y;
    },
    onrightstanding: function() {
      console.log("Right Standing State");
    },
    onrightrunning: function() {
      console.log("Right Running State");
    },
    onleftjumping: function() {
      console.log("Left Jumping State");
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
      initialheight = player.y;
    },
    onleftstanding: function() {
      console.log("Left Standing State");
    },
    onleftrunning: function() {
      console.log("Left Running State");
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
  else if (playerstate.is("leftrunning")) {
    player.x -= PLAYERSPEED;
  }
  else if (playerstate.is("rightrunning")) {
    player.x += PLAYERSPEED;
  }
  else if (playerstate.is("rightjumping")) {

    if (jumpspeed >= 0 && jumpup) {
      player.x += PLAYERSPEED;
      player.y -= jumpspeed;
      jumpspeed -= GRAVITY;
    }
    else {
      jumpup = false;
      player.x += PLAYERSPEED;
      player.y += jumpspeed;
      jumpspeed += GRAVITY;
      if (player.y >= initialheight) {
        jumpup = true;
        player.y = initialheight;
        jumpspeed = INITIALJUMPSPEED;
        window.addEventListener("keydown", gameKeyDown);
        window.addEventListener("keyup", gameKeyUp);
        playerstate.stand();
      }
    }
  }
  else if (playerstate.is("leftjumping")) {

    if (jumpspeed >= 0 && jumpup) {
      player.x -= PLAYERSPEED;
      player.y -= jumpspeed;
      jumpspeed -= GRAVITY;
    }
    else {
      jumpup = false;
      player.x -= PLAYERSPEED;
      player.y += jumpspeed;
      jumpspeed += GRAVITY;
      if (player.y >= initialheight) {
        jumpup = true;
        player.y = initialheight;
        jumpspeed = INITIALJUMPSPEED;
        window.addEventListener("keydown", gameKeyDown);
        window.addEventListener("keyup", gameKeyUp);
        playerstate.stand();
      }
    }
  }
}

function update_camera() {
  stage.y = -player.y + GAME_HEIGHT/2 + player.height/2;
  stage.y = -Math.max(0, Math.min(world.worldHeight - GAME_HEIGHT, -stage.y));
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
