var game = new Phaser.Game(800, 480, Phaser.AUTO, '', { preload: preload, create: create, update: update });
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
var cursors;
var music;
var glassSound;
var hitSound;
var playerHitSound;

var muteKey;

function preload () {
  game.load.image('bgimage', 'images/bg.jpg');
  game.load.image('building', 'images/05muronero.jpg');
  game.load.image('chip', 'images/chip.png');
  
  game.load.image('floor', 'images/floor.png');
  game.load.image('ceiling', 'images/ceiling.png');
  game.load.image('room', 'images/room.png');
  game.load.image('glass', 'images/glass.png');
  game.load.image('fixture', 'images/grate.png');
  
  game.load.spritesheet('player', 'images/dude.png', 32, 48);
  game.load.spritesheet('enemy', 'images/enemy.png', 64, 64);
  game.load.image('melee', 'images/melee.png');
  game.load.image('bullet', 'images/bullet.png');
  game.load.spritesheet('shot_indicator', 'images/shot_indicator.png', 32, 32);
  game.load.spritesheet('health', 'images/health.png', 32, 32);
  game.load.image('arrow', 'images/arrow.png');
  
  game.load.audio('glass', ['sounds/glass.ogg']);
  game.load.audio('laser', ['sounds/laser.ogg']);
  game.load.audio('swish', ['sounds/swish.ogg']);
  game.load.audio('clang', ['sounds/clang.ogg']);
  game.load.audio('explode', ['sounds/explode.ogg']);
  game.load.audio('pong', ['sounds/landing.ogg']);
  game.load.audio('boom', ['sounds/boom.ogg']);
  game.load.audio('steps', ['sounds/steps_platform.ogg']);
  game.load.audio('swoosh', ['sounds/swoosh.ogg']);
  game.load.audio('jump', ['sounds/jump.ogg']);
  game.load.audio('scrape', ['sounds/scrape.ogg']);
  game.load.audio('ledge', ['sounds/ledge2.ogg']);
  
  game.load.audio('bgaudio', ['sounds/bg.ogg']);
  
  cursors = game.input.keyboard.createCursorKeys();
  muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
}

function create () {
  bgSprite = game.add.sprite(0, 0, 'bgimage');
  bgSprite.scale.setTo(3, 3);
  
  music = game.add.audio('bgaudio');
  music.play('', 0, 0.5, true);
  muteKey.onDown.add(function() { music.volume = 0.5 - music.volume; }, this);
  glassSound = game.add.audio('glass');
  hitSound = game.add.audio('clang');
  playerHitSound = game.add.audio('pong');
  
  enemies = [];

  groups = {
    buildings: game.add.group(),
    floors: game.add.group(),
    ceilings: game.add.group(),
    rooms: game.add.group(),
    ledges: game.add.group(),
    glasses: game.add.group(),
    fixtures: game.add.group(),
    enemies: game.add.group(),
    bullets: game.add.group(),
    chips: game.add.group()
  };
  
  buildings = new Buildings(game, groundY, groups, enemies);
  buildings.build(game, 4);
  
  // The player and its settings
  player = new Player(game, gravity, groups.chips);
  
  camera = new Camera(game, player);
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
      if (player.sprite.body.velocity.x !== 0) {
        game.physics.overlap(player.sprite, groups.ledges, grabLedge);
      }
      if (player.moveMode === 'v') {
        // Vertical mode, detect building collisions
        game.physics.collide(player.sprite, groups.buildings, collideFloor);
      }
    }
    game.physics.collide(player.sprite, groups.ceilings);
  }
  // Check for player pickups
  game.physics.overlap(player.sprite, groups.chips, collectChip, null, this);
  // Glass collisions
  game.physics.overlap(player.sprite, groups.glasses, collideGlass);
  // Fixture collisions
  game.physics.overlap(player.sprite, groups.fixtures, killPlayer);
  
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
      enemies[i].kill();
      enemies.splice(i, 1);
      i--;
    } else {
      enemies[i].update(game, player, groups.bullets);
    }
  }
  
  // Check for bullet/player collisions
  // If the player is hit, make them fall backwards and destroy the bullet
  game.physics.overlap(player.sprite, groups.bullets, hitPlayer);
  
  if (!player.sprite.alive) {
    killPlayer();
  }
  // Kill player if dropped to bottom
  if ((player.sprite.y + player.sprite.height) >= game.world.bounds.height - 5) {
    killPlayer();
  }

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
}

function grabLedge(playerSprite, ledge) {
  if (ledge.canClimb(playerSprite.body.velocity.x)) {
    var point = ledge.getClimbPoint();
    var distance = Phaser.Point.distance(playerSprite.body, point);
    player.startClimb(ledge, point, Math.round(Math.abs(distance * 0.6)));
  }
}

function collectChip(player, chip) {
  chip.kill();
}

function hitEnemy(melee, enemy) {
  enemy.damage(1);
  var flyMultiplier = 5;
  if (enemy.alive) {
    hitSound.play();
  } else {
    flyMultiplier = 5;
  }
  
  // Combos: check if another enemy is in the vicinity, and move towards them
  var closestEnemy = null;
  var closestDistance = 0;
  for (var i = 0; i < enemies.length; i++) {
    if (!enemies[i].sprite.alive) {
      continue;
    }
    var distance = Phaser.Point.distance(melee.body, enemies[i].sprite.body);
    if (closestEnemy === null || closestDistance > distance) {
      closestEnemy = enemies[i].sprite;
      closestDistance = distance;
    }
  }
  if (closestEnemy !== null && closestDistance < 150) {
    player.flyTowards(closestEnemy.body, flyMultiplier);
  }
}

function hitPlayer(playerSprite, bullet) {
  player.takeHit(bullet.body.velocity);
  bullet.kill();
  playerHitSound.play();
}

function killPlayer(playerSprite, killer) {
  player.sprite.kill();
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].kill(false);
  }
  enemies.length = 0;
  reset();
}

function reset() {
  player.reset();
  buildings.reset(game);
}