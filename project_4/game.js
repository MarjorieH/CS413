/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Marjorie Hahn
* CS413: Virtual Worlds
* Project 4: Final
* Winter is Coming
* 2 June 2016
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Game Constants
var GAME_WIDTH = 640; // width of the gamescreen in pixels
var GAME_HEIGHT = 640; // width of the gamescreen in pixels
var TILE_HEIGHT = 40; // height of the tiles in pixels
var TILE_WIDTH = 40; // width of the tiles in pixels
var MAP_WIDTH = 16; // width of the map in tiles
var MAP_HEIGHT = 440; // height of the map in tiles
var PLAYERSPEED = 4; // speed of the player in pixels/frame
var INITIALJUMPSPEED = 25; // speed of jumping in pixels/frame
var GRAVITY = 0.98;
var MAXACORNS = 50;
var WINTERSPEED = 0.5;
var WINHEIGHT = 560; // distance from the top to win
var TIMEOUT = 1200; // miliseconds before win/lose screen is displayed

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
gameport.appendChild(renderer.view);

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Global Variables
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Time variables
var time; // previous time from last request
var dt = 0; // current change in time since last request
var gametime = 0;

// Misc game variables
var jumpup = true;
var jumpspeed = INITIALJUMPSPEED;
var initialheight = 0;
var falldistance = 0;
var player;
var winter;
var gametext;
var acornscollected = 0;
var numacorns = MAXACORNS;
var gamestate = 0; // 0 = neutral; 1 = win; 2 = lose

// Tile/Map Variables
var tu = new TileUtilities(PIXI);
var world;
var foreground;

// Main PIXI containers
var stage = new PIXI.Container();
var title = new PIXI.Container();
var menu = new PIXI.Container();
var credits = new PIXI.Container();
var instructions = new PIXI.Container();
var game = new PIXI.Container();
var lose = new PIXI.Container();
var win = new PIXI.Container();

// game containers
var acorns = new PIXI.Container();

// sprite textures
var rightsquirrel;
var leftsquirrel;
var rightrun;
var leftrun;
var rightjump;
var leftjump;
var falltexture;
var acorntexture;
var wintertexture;
var screentexture;
var buttontexture;

// sounds
var selectsound;
var fallsound;
var jumpsound;
var pickupsound;
var losesound;
var winsound;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Load and Prepare Data
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

PIXI.loader
.add('map_json', 'map.json')
.add('tileset', 'tileset.png')
.add('spritesheet.json')
.add("falling.mp3")
.add("jump.mp3")
.add("lose.mp3")
.add("pickup.mp3")
.add("select.mp3")
.add("win.mp3")
.load(ready);

function ready(){

  rightsquirrel = PIXI.Texture.fromFrame("rightsquirrel.png");
  leftsquirrel = PIXI.Texture.fromFrame("leftsquirrel.png");
  rightrun = PIXI.Texture.fromFrame("rightrun.png");
  leftrun = PIXI.Texture.fromFrame("leftrun.png");
  rightjump = PIXI.Texture.fromFrame("rightjump.png");
  leftjump = PIXI.Texture.fromFrame("leftjump.png");
  falltexture = PIXI.Texture.fromFrame("falling.png");

  acorntexture = PIXI.Texture.fromFrame("acorn.png");
  wintertexture = PIXI.Texture.fromImage("winter.png");
  screentexture = PIXI.Texture.fromFrame('screenbackground.png');
  buttontexture = PIXI.Texture.fromFrame('button.png');

  selectsound = PIXI.audioManager.getAudio("select.mp3");
  fallsound = PIXI.audioManager.getAudio("falling.mp3");
  jumpsound = PIXI.audioManager.getAudio("jump.mp3");
  pickupsound = PIXI.audioManager.getAudio("pickup.mp3");
  losesound = PIXI.audioManager.getAudio("lose.mp3");
  winsound = PIXI.audioManager.getAudio("win.mp3");

  buildTitle();
  buildMenu();
  buildInstructions();
  buildCredits();
  buildLose();
  buildWin();
  buildGame();

  console.log()

  animate();
}

function buildTitle() {
  stage.addChild(title);
	var titlesprite = new PIXI.Sprite(screentexture);
	title.addChild(titlesprite);

	var menubutton = new PIXI.Sprite(buttontexture);
	menubutton.position.x = 192;
	menubutton.position.y = 512;
	title.addChild(menubutton);

	var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
	menutext.anchor.x = 0.5;
	menutext.anchor.y = 0.5;
	menutext.position.x = 128;
	menutext.position.y = 32;
	menubutton.addChild(menutext);

	var titletext = new PIXI.Text('WINTER IS COMING', {font : '40px Lucida Console, Monaco, monospace', fill: 0xbe6f39, align : 'center'});
	titletext.anchor.x = 0.5;
	titletext.anchor.y = 0.5;
	titletext.position.x = 320;
	titletext.position.y = 320;
	title.addChild(titletext);

	menubutton.interactive = true;
	menubutton.on('mousedown', handleMenu);

  title.visible = true;
}

function buildMenu() {
  stage.addChild(menu);
  var menusprite = new PIXI.Sprite(screentexture);
  menu.addChild(menusprite);

  var menutext = new PIXI.Text('MAIN MENU', {font : '40px Lucida Console, Monaco, monospace', fill: 0xbe6f39, align : 'center'});
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
  var instructext = new PIXI.Text('INSTRUCTIONS', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
  instructext.anchor.x = 0.5;
  instructext.anchor.y = 0.5;
  instructext.position.x = 128;
  instructext.position.y = 32;
  instrucbutton.addChild(instructext);

  playbutton.position.x = 192;
  playbutton.position.y = 384;
  var playtext = new PIXI.Text('PLAY', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
  playtext.anchor.x = 0.5;
  playtext.anchor.y = 0.5;
  playtext.position.x = 128;
  playtext.position.y = 32;
  playbutton.addChild(playtext);

  creditbutton.position.x = 192;
  creditbutton.position.y = 512;
  var credittext = new PIXI.Text('CREDITS', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
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

  menu.visible = false;
}

function buildInstructions() {
  stage.addChild(instructions);
  var instructionssprite = new PIXI.Sprite(screentexture);
  instructions.addChild(instructionssprite);

  var menubutton = new PIXI.Sprite(buttontexture);
  menubutton.position.x = 192;
  menubutton.position.y = 512;
  instructions.addChild(menubutton);

  var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
  menutext.anchor.x = 0.5;
  menutext.anchor.y = 0.5;
  menutext.position.x = 128;
  menutext.position.y = 32;
  menubutton.addChild(menutext);

  var instructext = new PIXI.Text("INSTRUCTIONS: Control the squirrel using the 'A' key to move left, the 'D' key to move right, and the 'W' or spacebar key to jump. Get to the top of the tree before winter arrives, and make sure not to touch any snow. Also, see how many of the randomly placed acorns you can collect.", {font : '24px Lucida Console, Monaco, monospace', fill: 0xbe6f39, wordWrap : true, wordWrapWidth : 500});
  instructext.anchor.x = 0.5;
  instructext.anchor.y = 0.5;
  instructext.position.x = 320;
  instructext.position.y = 320;
  instructions.addChild(instructext);

  menubutton.interactive = true;
  menubutton.on('mousedown', handleMenu);

  instructions.visible = false;
}

function buildCredits() {
  stage.addChild(credits);
  var creditssprite = new PIXI.Sprite(screentexture);
  credits.addChild(creditssprite);

  var menubutton = new PIXI.Sprite(buttontexture);
  menubutton.position.x = 192;
  menubutton.position.y = 512;
  credits.addChild(menubutton);

  var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
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

  credits.visible = false;
}

function buildGame() {
  stage.addChild(game);
  world = tu.makeTiledWorld("map_json", "tileset.png");
  foreground = world.getObject("foreground").data;
  game.addChild(world);

  game.addChild(acorns);
  // randomly place acorn sprites into the map
  for (i = 0; i < MAXACORNS; i++) {
    var notplaced = true;
    while (notplaced) {
      var randindex = Math.floor(Math.random() * foreground.length);
      var gid = foreground[randindex];
      var cells = tu.surroundingCells(randindex, MAP_WIDTH);
      var belowID = foreground[cells[7]]; // GID below the position
      if (gid == 0 && belowID == 2 && belowID != 5) { // place acorn
        var acorn = new PIXI.Sprite(acorntexture);
        acorn.x = TILE_WIDTH * (randindex % MAP_WIDTH);
        acorn.y = TILE_HEIGHT * Math.floor(randindex / MAP_WIDTH);
        acorns.addChild(acorn);
        foreground[randindex] = 5;
        notplaced = false;
      }
    }
  }

  player = new PIXI.Sprite(rightsquirrel);
  player.anchor.x = 0.5;
  player.anchor.y = 0.5;
  player.x = world.worldWidth/2;
  player.y = world.worldHeight - TILE_HEIGHT - player.height/2;
  game.addChild(player);

  gametext = new PIXI.Text(acornscollected + '/' + MAXACORNS + ' ACORNS COLLECTED', {font : '20px Lucida Console, Monaco, monospace', fill: 0xFFFFFF, align : 'center'});
  gametext.anchor.x = 0.5;
  gametext.anchor.y = 0.5;
  gametext.y = -GAME_HEIGHT/2;
  player.addChild(gametext);

  winter = new PIXI.Sprite(wintertexture);
  game.addChild(winter);
  game.visible = false;
}

function buildLose() {
  stage.addChild(lose);
  var losesprite = new PIXI.Sprite(screentexture);
  lose.addChild(losesprite);

  var menubutton = new PIXI.Sprite(buttontexture);
  menubutton.position.x = 192;
  menubutton.position.y = 512;
  lose.addChild(menubutton);

  var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
  menutext.anchor.x = 0.5;
  menutext.anchor.y = 0.5;
  menutext.position.x = 128;
  menutext.position.y = 32;
  menubutton.addChild(menutext);

  var titletext = new PIXI.Text('YOU LOSE! :(', {font : '40px Lucida Console, Monaco, monospace', fill: 0xbe6f39, align : 'center'});
  titletext.anchor.x = 0.5;
  titletext.anchor.y = 0.5;
  titletext.position.x = 320;
  titletext.position.y = 320;
  lose.addChild(titletext);

  menubutton.interactive = true;
  menubutton.on('mousedown', handleMenu);

  lose.visible = false;
}

function buildWin() {
  stage.addChild(win);
  var winsprite = new PIXI.Sprite(screentexture);
  win.addChild(winsprite);

  var menubutton = new PIXI.Sprite(buttontexture);
  menubutton.position.x = 192;
  menubutton.position.y = 512;
  win.addChild(menubutton);

  var menutext = new PIXI.Text('MAIN MENU', {font : '20px Lucida Console, Monaco, monospace', fill: 0x2d2a1c, align : 'center'});
  menutext.anchor.x = 0.5;
  menutext.anchor.y = 0.5;
  menutext.position.x = 128;
  menutext.position.y = 32;
  menubutton.addChild(menutext);

  var titletext = new PIXI.Text('YOU WIN! :)', {font : '40px Lucida Console, Monaco, monospace', fill: 0xbe6f39, align : 'center'});
  titletext.anchor.x = 0.5;
  titletext.anchor.y = 0.5;
  titletext.position.x = 320;
  titletext.position.y = 320;
  win.addChild(titletext);

  menubutton.interactive = true;
  menubutton.on('mousedown', handleMenu);

  win.visible = false;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Event Handler Functions
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function handleMenu(e) {
  windowstate.menuclick();
}

function handleInstruct(e) {
  windowstate.instructionsclick();
}

function handlePlay(e) {
  windowstate.gameclick();
}

function handleCredits(e) {
  windowstate.creditsclick();
}

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
      jumpsound.play();
      player.texture = rightjump;
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
      initialheight = player.y;
    },
    onrightstanding: function() {
      player.texture = rightsquirrel;
    },
    onrightrunning: function() {
      player.texture = rightrun;
    },
    onleftjumping: function() {
      jumpsound.play();
      player.texture = leftjump;
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
      initialheight = player.y;
    },
    onleftstanding: function() {
      player.texture = leftsquirrel;
    },
    onleftrunning: function() {
      player.texture = leftrun;
    },
    onfalling: function() {
      player.texture = falltexture;
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
    },
    onleavefalling: function () {
      fallsound.play();
    }
  }
});

var windowstate = StateMachine.create({
  initial: {state: 'title', event: 'init'},
  error: function() {},
  events: [
    {name: "menuclick", from: "title", to: "menu"},
    {name: "menuclick", from: "win", to: "menu"},
    {name: "menuclick", from: "lose", to: "menu"},
    {name: "menuclick", from: "instructions", to: "menu"},
    {name: "menuclick", from: "credits", to: "menu"},

    {name: "gameclick", from: "menu", to: "game"},
    {name: "instructionsclick", from: "menu", to: "instructions"},
    {name: "creditsclick", from: "menu", to: "credits"},

    {name: "gamelost", from: "game", to: "lose"},
    {name: "gamewon", from: "game", to: "win"}
  ],
  callbacks: {
    onbeforeevent: function () {selectsound.play();},

    ontitle: function() {title.visible = true;},
    onleavetitle: function() {title.visible = false;},

    onmenu: function() {menu.visible = true;},
    onleavemenu: function() {menu.visible = false;},

    oninstructions: function() {instructions.visible = true;},
    onleaveinstructions: function() {instructions.visible = false;},

    oncredits: function() {credits.visible = true;},
    onleavecredits: function() {credits.visible = false;},

    ongame: function () {
      game.visible = true;
      window.addEventListener("keydown", gameKeyDown);
      window.addEventListener("keyup", gameKeyUp);
      winter.y = world.worldHeight;
      gametext.text = acornscollected + '/' + MAXACORNS + ' ACORNS COLLECTED';
      player.x = world.worldWidth/2;
      player.y = world.worldHeight - TILE_HEIGHT - player.height/2;
    },
    onleavegame: function () {
      game.visible = false;
      window.removeEventListener("keydown", gameKeyDown);
      window.removeEventListener("keyup", gameKeyUp);
    },

    onlose: function() {
      losesound.play();
      game.visible = true;
      setTimeout(function(){
        stage.y = 0;
        stage.x = 0;
        game.visible = false;
        lose.visible = true;
      }, TIMEOUT);
    },
    onleavelose: function() {lose.visible = false;},

    onwin: function() {
      winsound.play();
      game.visible = true;
      setTimeout(function(){
        stage.y = 0;
        stage.x = 0;
        game.visible = false;
        win.visible = true;
      }, TIMEOUT);
    },
    onleavewin: function() {win.visible = false;}
  }
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Update Functions
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function update_player() {
  if (player.y <= WINHEIGHT) {
    gametext.text = 'YOU WIN!';
    windowstate.gamewon();
  }

  if (playerstate.is("leftstanding") || playerstate.is("rightstanding")) {
    return;
  }

  var new_x;
  var new_y;
  var collision;
  var below;

  if (playerstate.is("leftrunning")) runHelper(-1);
  else if (playerstate.is("rightrunning")) runHelper(1);
  else if (playerstate.is("rightjumping")) jumpHelper(1);
  else if (playerstate.is("leftjumping")) jumpHelper(-1);
  else if (playerstate.is("falling")) {
    if (player.y >= (MAP_HEIGHT * TILE_HEIGHT)) { // prevent player from falling through the map
      player.y = world.worldHeight - TILE_HEIGHT - player.height/2;
      window.addEventListener("keydown", gameKeyDown);
      window.addEventListener("keyup", gameKeyUp);
      playerstate.stand();
    }
    else {
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
  }
}

function update_camera() {
  stage.y = -player.y + GAME_HEIGHT/2 + player.height/2;
  stage.y = -Math.max(0, Math.min(world.worldHeight - GAME_HEIGHT, -stage.y));
}

function update_acorns() {
  var player_index = tu.getIndex(player.x, player.y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  var gid = foreground[player_index];
  if (gid == 5) { // if player has hit an acorn
    pickupsound.play();
    var x_acorn = TILE_WIDTH * (player_index % MAP_WIDTH);
    var y_acorn = TILE_HEIGHT * Math.floor(player_index / MAP_WIDTH);
    var i = 0;
    var notfound = true;
    while (i < numacorns || notfound) {
      var acorn = acorns.getChildAt(i);
      if (acorn.x == x_acorn && acorn.y == y_acorn) {
        foreground[player_index] = 0;
        notfound = false;
        acorns.removeChildAt(i);
        numacorns--;
        acornscollected++;
        gametext.text = acornscollected + '/' + MAXACORNS + ' ACORNS COLLECTED';
      }
      i++;
    }
  }
}

function update_winter() {
  winter.y = winter.y - WINTERSPEED;
  if (winter.y <= player.y) {
    gametext.text = 'YOU LOSE!';
    windowstate.gamelost();
  }
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
    if (player.y >= (MAP_HEIGHT * TILE_HEIGHT)) { // prevent player from falling through the map
      player.y = world.worldHeight - TILE_HEIGHT - player.height/2;
      window.addEventListener("keydown", gameKeyDown);
      window.addEventListener("keyup", gameKeyUp);
      playerstate.stand();
    }
    else {
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
}

// returns 0 if no collision
// returns 1 if grass collision
// returns 2 if branch collision
// returns 3 if trunk collision
function detectCollision(new_x, new_y) {
  var new_index = tu.getIndex(new_x, new_y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  var tileID = foreground[new_index];

  if (tileID == 1) return 1;
  else if (tileID == 2) return 2;
  else if (tileID == 4) return 3;
  else return 0; // no collision detected
}

// returns 0 if there is nothing below
// returns 1 if there is grass below
// returns 2 if there is a branch below
function detectBelow(new_x, new_y) {
  var new_index = tu.getIndex(new_x, new_y, TILE_WIDTH, TILE_HEIGHT, MAP_WIDTH);
  var cells = tu.surroundingCells(new_index, MAP_WIDTH);
  var belowID = foreground[cells[7]]; // GID below the position

  if (belowID == 1) return 1;
  else if (belowID == 2) return 2;
  else return 0;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Game Loop
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function animate() {
  requestAnimationFrame(animate);
  var now = new Date().getTime();
  dt = now - (time || now);
  time = now;

  if (windowstate.is("game")) {
    update_camera();
    update_player();
    update_acorns();
    update_winter();
  }

  renderer.render(stage);
}
