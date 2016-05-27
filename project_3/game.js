/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Marjorie Hahn
* CS413: Virtual Worlds
* Project 3: Tiles
* The Spook
* 27 May 2016
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
var menu = new PIXI.Container();

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// load in map and sound effects
PIXI.loader
.add('map_json', 'map.json')
.add('tileset', 'tileset.png')
.load(ready);

// load in game textures
var spooktexture = PIXI.Texture.fromImage("spook.png");
var playertexture = PIXI.Texture.fromImage("player.png");
var cattexture = PIXI.Texture.fromImage("cat.png");
var menutexture = PIXI.Texture.fromImage("titlescreen.png");

// Scene objects get loaded in the ready function
var player;
var spook;
var cat;
var gametext;
var world;
var shade;
var obstacleArray = [];
var obstacles;
var spooktimer; // reset/initialize spook timer
var spookstage;
var foundcat;
var exittext;
var menubuttontext;

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

  // initalize the cat
  cat = new PIXI.Sprite(cattexture);
  cat.anchor.x = 0.5;
  cat.anchor.y = 0.5;
  cat.x = 1824;
  cat.y = 352;
  game.addChild(cat);

  exittext = new PIXI.Text('EXIT', {font : '20px Lucida Console, Monaco, monospace', fill: 0xA50303, align : 'center'});
  exittext.anchor.x = 0.5;
  exittext.anchor.y = 0.5;
  exittext.x = 1888;
  exittext.y = 2016;
  game.addChild(exittext);

  // initialize player sprite
  player = new PIXI.Sprite(playertexture);
  player.anchor.x = 0.5;
  player.anchor.y = 0.5;
  player.x = 224;
  player.y = 288;
  game.addChild(player);
  player.direction = MOVE_NONE;
  player.moving = false;

  gametext = new PIXI.Text('Find the kitty!', {font : '20px Lucida Console, Monaco, monospace', fill: 0xF38F17, align : 'center'});
  gametext.anchor.x = 0.5;
  gametext.anchor.y = 0.5;
  gametext.y = -192;
  player.addChild(gametext);

  // initalize the spook
  spook = new PIXI.Sprite(spooktexture);
  spook.anchor.x = 0.5;
  spook.anchor.y = 0.5;
  spook.x = 288;
  spook.y = 1696;
  game.addChild(spook);

  spooktimer = 0; // initialize spook timer
  spookstage = 0;
  foundcat = false;
  player.visible = true;
  cat.visible = true;

  menu = new PIXI.Container();
  menusprite = new PIXI.Sprite(menutexture);
  menu.addChild(menusprite);

  menubuttontext = new PIXI.Text('PLAY', {font : '20px Lucida Console, Monaco, monospace', fill: 0xFFFFFF, align : 'center'});
  menubuttontext.anchor.x = 0.5;
  menubuttontext.anchor.y = 0.5;
  menubuttontext.x = 400;
  menubuttontext.y = 400;
  menu.addChild(menubuttontext);
  menubuttontext.visible = false;

  menuInteract();
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Menu Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function menuInteract() {

  stage.addChild(menu);
  setTimeout(displayButton, 3000);

  function displayButton() {
    menubuttontext.visible = true;

    menubuttontext.interactive = true;
    menubuttontext.on('mousedown', function (e) {
      stage.removeChildren();
      gameInteract();
    });
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Game Logic
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function gameInteract() {
  stage.addChild(game);
  var spooktimer = 0; // reset/initialize spook timer
  var spookstage = 0;
  var foundcat = false;
  player.visible = true;
  cat.visible = true;

  window.addEventListener("keydown", gameKeyDown);
  window.addEventListener("keyup", gameKeyUp);
}

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
  if (collisionsDetected == false && new_x < 2048 && new_y < 2048) {
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
  // check if spook is ready to move again
  if (((spook.x + 32) % 64 != 0 || (spook.y + 32) % 64 != 0)) return;

  var spookspeed; // speed of the spook

  if (spookstage == 0) spookspeed = 4500;
  else if (spookstage == 1) spookspeed = 3500;
  else if (spookstage == 2) spookspeed = 3000;
  else if (spookstage == 3) spookspeed = 1500;
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

function check_status() {
  if (detectCollision(cat.x, cat.y, player.x, player.y)) {
    cat.visible = false;
    foundcat = true;
    gametext.text = "Got the cat! Now find a way out.";
  }
  if (detectCollision(spook.x, spook.y, player.x, player.y)) {
    window.removeEventListener("keydown", gameKeyDown);
    window.removeEventListener("keyup", gameKeyUp);
    player.visible = false;

    var sometext = new PIXI.Text('YOU LOSE!', {font : '20px Lucida Console, Monaco, monospace', fill: 0xF38F17, align : 'center'});
    sometext.anchor.x = 0.5;
    sometext.anchor.y = 0.5;
    sometext.x = player.x;
    sometext.y = player.y;
    game.addChild(sometext);

    var buttontext = new PIXI.Text('RETRY?', {font : '20px Lucida Console, Monaco, monospace', fill: 0xF38F17, align : 'center'});
    buttontext.anchor.x = 0.5;
    buttontext.anchor.y = 0.5;
    buttontext.y = 64;
    sometext.addChild(buttontext);

    buttontext.interactive = true;
    buttontext.on('mousedown', function (e) {
      buttontext.destroy();
      sometext.destroy();
      player.x = 224;
      player.y = 288;
      spook.x = 288;
      spook.y = 1696;
      gameInteract();
    });
  }
  if (detectCollision(player.x, player.y, 1888, 2016) && foundcat == true) {
    window.removeEventListener("keydown", gameKeyDown);
    window.removeEventListener("keyup", gameKeyUp);
    player.visible = false;

    var sometext = new PIXI.Text('YOU WIN!', {font : '20px Lucida Console, Monaco, monospace', fill: 0xF38F17, align : 'center'});
    sometext.anchor.x = 0.5;
    sometext.anchor.y = 0.5;
    sometext.x = player.x - 64;
    sometext.y = player.y - 192;
    game.addChild(sometext);

    var buttontext = new PIXI.Text('PLAY AGAIN?', {font : '20px Lucida Console, Monaco, monospace', fill: 0xF38F17, align : 'center'});
    buttontext.anchor.x = 0.5;
    buttontext.anchor.y = 0.5;
    buttontext.y = 64;
    sometext.addChild(buttontext);

    buttontext.interactive = true;
    buttontext.on('mousedown', function (e) {
      buttontext.destroy();
      sometext.destroy();
      player.x = 224;
      player.y = 288;
      spook.x = 288;
      spook.y = 1696;
      gameInteract(); });
  }
}

// Game Loop
var time; // previous time from last request
var dt = 0; // current change in time since last request
function animate() {
  requestAnimationFrame(animate);
  var now = new Date().getTime();
  dt = now - (time || now);
  time = now;
  spooktimer += dt;

  if (spooktimer > 10000) {
    spookstage++;
    spooktimer = 0;
  }

  if (stage.getChildAt(0) == game) {
    update_spook();
    update_camera();
    check_status();
    console.log(spook.x + "," + spook.y);
  }
  renderer.render(stage);
}
animate();
