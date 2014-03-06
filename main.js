var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var gravity = 20; // default, no-air-resistance gravity
var groundY = 10000;
var camera;
var bgSprite;
var player;
var buildings;

// Groups
// Create them ourselves because we need to control the Z order
var groups;

var enemies;
var chips;
var cursors;
var music;
var glassSound;
var hitSound;
var dieSound;
var playerHitSound;

function preload () {
  game.load.image('bgimage', 'images/bg.jpg');
  game.load.image('building', 'images/05muronero.jpg');
  game.load.image('chip', 'images/chip.png');
  
  game.load.image('floor', 'images/floor.png');
  game.load.image('ceiling', 'images/ceiling.png');
  game.load.image('room', 'images/room.png');
  game.load.image('glass', 'images/glass.png');
  
  game.load.spritesheet('player', 'images/dude.png', 32, 48);
  game.load.spritesheet('enemy', 'images/enemy.png', 64, 64);
  game.load.image('melee', 'images/melee.png');
  game.load.image('bullet', 'images/bullet.png');
  
  game.load.audio('glass', ['sounds/glass.ogg']);
  game.load.audio('laser', ['sounds/laser.ogg']);
  game.load.audio('swish', ['sounds/swish.ogg']);
  game.load.audio('clang', ['sounds/clang.ogg']);
  game.load.audio('explode', ['sounds/explode.ogg']);
  game.load.audio('pong', ['sounds/landing.ogg']);
  
  game.load.audio('bgaudio', ['sounds/bg.mp3']);
  
  cursors = game.input.keyboard.createCursorKeys();
}

function create () {
  game.world.setBounds(0, 0, 2000, groundY);
  bgSprite = game.add.sprite(0, 0, 'bgimage');
  bgSprite.scale.setTo(3, 3);
  
  music = game.add.audio('bgaudio');
  music.volume = 0.5;
  music.loop = true;
  music.play();
  glassSound = game.add.audio('glass');
  hitSound = game.add.audio('clang');
  dieSound = game.add.audio('explode');
  playerHitSound = game.add.audio('pong');
  
  enemies = [];
  
  groups = {
    buildings: game.add.group(),
    floors: game.add.group(),
    rooms: game.add.group(),
    ledges: game.add.group(),
    glasses: game.add.group(),
    bullets: game.add.group()
  };
  
  buildings = new Buildings(game, groundY, groups);
  buildings.add(200, 9750, enemies);
  buildings.add(300, 9600, enemies);
  buildings.add(350, 9400, enemies);
  buildings.add(500, 9000, enemies);
  
  // The player and its settings
  player = new Player(game, gravity);
  
  camera = new Camera(game, player);
  
  // Collectibles
  chips = game.add.group();
  //  Here we'll create 12 of them evenly spaced apart
  for (var i = 0; i < 12; i++)
  {
      //  Create a star inside of the 'stars' group
      var chip = chips.create(i * 70, 0, 'chip');
      //  Let gravity do its thing
      chip.body.gravity.y = gravity;
      //  This just gives each one a slightly random bounce value
      chip.body.bounce.y = 0.7 + Math.random() * 0.2;
  }
}

function update() {
  if (player.moveMode === 'c') {
    player.climb();
  } else {
    // Check if the player has entered a room, and modify move mode accordingly
    player.moveMode = 'v';
    game.physics.overlap(player.sprite, groups.rooms, overlapRoom);
    // Conditional collision logic based on the move "mode" for the player
    if (player.moveMode === 'h') {
      // Horizontal mode, detect floor collisions only
      game.physics.collide(player.sprite, groups.floors, collideFloor);
    } else if (player.moveMode === 'v') {
      // Check if player has grabbed on to any ledges
      game.physics.overlap(player.sprite, groups.ledges, grabLedge);
      if (player.moveMode === 'v') {
        // Vertical mode, detect building collisions
        game.physics.collide(player.sprite, groups.buildings, collideFloor);
      }
    }
    game.physics.overlap(player.sprite, groups.glasses, collideGlass);
    game.physics.collide(chips, groups.buildings);
    // Check for player pickups
    game.physics.overlap(player.sprite, chips, collectChip, null, this);
  }
  
  if (player.moveMode !== 'c') {
    player.handleInput(game, cursors);
  }

  camera.update();
  player.update();
  
  for (var i = 0; i < enemies.length; i++) {
    if (player.meleeSprite.alive) {
      // Check if player has hit any enemies
      game.physics.overlap(player.meleeSprite, enemies[i].sprite, hitEnemy);
    }
    if (!enemies[i].sprite.alive) {
      enemies[i].sprite.destroy();
      enemies.splice(i, 1);
      i--;
    } else {
      enemies[i].update(game, player, groups.bullets);
    }
  }
  
  // Check for bullet/player collisions
  // If the player is hit, make them fall backwards and destroy the bullet
  game.physics.overlap(player.sprite, groups.bullets, hitPlayer);

  // Parallax
  bgSprite.x = game.camera.x * 0.9;
  bgSprite.y = game.camera.y * 0.97;
}

function overlapRoom(playerSprite, room) {
  player.moveMode = 'h';
}

function collideGlass(playerSprite, glass) {
  glassSound.play();
  glass.kill();
}

function collideFloor(player, floor) {
  camera.playerCollide(floor);
}

function grabLedge(playerSprite, ledge) {
  var distance = playerSprite.body.y - (ledge.body.y - ledge.body.height);
  player.startClimb(ledge, distance);
}

function collectChip(player, chip) {
  chip.kill();
}

function hitEnemy(melee, enemy) {
  enemy.damage(1);
  if (enemy.alive) {
    hitSound.play();
  } else {
    dieSound.play();
  }
}

function hitPlayer(playerSprite, bullet) {
  player.takeHit(bullet.body.velocity);
  bullet.kill();
  playerHitSound.play();
}