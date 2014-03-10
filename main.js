var game = new Phaser.Game(800, 480, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var gravity = 20; // default, no-air-resistance gravity
var groundY = 8550;
var numBuildings = 3;
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
var collectSound;
var numCollected = 0;
var alarmSound;
var alarmSoundPlayed = false;
var exitSound;

var glassEmitter;

var muteKey;

var resetTimer = 0;
var timerStart = 2500;
var timer = timerStart;
var timerText;
var startbg;

var started = false;
var completed = false;
var completeTimer = 0;

function preload () {
  game.load.image('bgimage', 'images/bg.jpg');

  game.load.image('score', 'images/score.png');
  game.load.image('start', 'images/start.png');
  
  game.load.image('building', 'images/building.png');
  game.load.image('chip', 'images/chip.png');
  
  game.load.image('floor', 'images/floor.png');
  game.load.image('ceiling', 'images/ceiling.png');
  game.load.image('room', 'images/room.png');
  game.load.image('glass', 'images/glass.png');
  game.load.image('door', 'images/door.png');
  game.load.image('fixture0', 'images/grate0.png');
  game.load.image('fixture1', 'images/grate1.png');
  
  game.load.spritesheet('player', 'images/player.png', 64, 64);
  for (var i = 0; i < numEnemyPics; i++) {
    game.load.spritesheet('enemy' + i, 'images/enemy' + i + '.png', 64, 64);
  }
  game.load.spritesheet('melee', 'images/melee.png', 68, 64);
  game.load.image('bullet', 'images/bullet.png');
  game.load.spritesheet('shot_indicator', 'images/shot_indicator.png', 32, 32);
  game.load.spritesheet('health', 'images/health.png', 32, 32);
  game.load.image('arrow', 'images/arrow.png');
  game.load.image('blank', 'images/blank.png');
  game.load.image('shard', 'images/shard.png');
  game.load.image('spark', 'images/spark.png');

  game.load.spritesheet('enemy_die', 'images/enemy_die.png', 40, 40);
  game.load.spritesheet('player_die', 'images/player_die.png', 68, 68);
  
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
  game.load.audio('collect', ['sounds/collect.ogg']);
  game.load.audio('alarm', ['sounds/alarm_0.ogg']);
  game.load.audio('exit', ['sounds/exit.ogg']);
  
  game.load.audio('bgaudio', ['sounds/bg.ogg']);
  
  cursors = game.input.keyboard.createCursorKeys();
  muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
}

function create () {
  bgSprite = game.add.sprite(0, 0, 'bgimage');
  
  music = game.add.audio('bgaudio');
  music.play('', 0, 0.4, true);
  muteKey.onDown.add(function() { music.volume = 0.4 - music.volume; }, this);
  glassSound = game.add.audio('glass');
  hitSound = game.add.audio('clang');
  playerHitSound = game.add.audio('pong');
  collectSound = game.add.audio('collect');
  alarmSound = game.add.audio('alarm');
  exitSound = game.add.audio('exit');
  
  enemies = [];

  groups = {
    buildings: game.add.group(),
    floors: game.add.group(),
    ceilings: game.add.group(),
    rooms: game.add.group(),
    ledges: game.add.group(),
    glasses: game.add.group(),
    fixtures: game.add.group(),
    exit: game.add.group(),
    enemies: game.add.group(),
    bullets: game.add.group(),
    chips: game.add.group(),
    screen: game.add.group()
  };
  
  buildings = new Buildings(game, groundY, groups, enemies);
  buildings.build(game, numBuildings);
  
  glassEmitter = game.add.emitter(0, 0, 200);
  glassEmitter.makeParticles('shard');
  glassEmitter.gravity = gravity * 0.5;
  glassEmitter.bounce.setTo(0.5, 0.5);
  glassEmitter.angularDrag = 30;
  
  // The player and its settings
  player = new Player(game, gravity, groups.chips);
  
  camera = new Camera(game, player);
  
  makeText();
  
  // Starting screen
  startbg = game.add.sprite(game.camera.x + game.width / 2, game.camera.y + game.height / 2, 'start');
  startbg.anchor.setTo(0.5, 0.5);
  groups.screen.add(startbg);
  player.freeze();
}

function update() {
  if (!started) {
    // Wait awhile, then start with Z
    completeTimer++;
    if (completeTimer > 60 && game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
      started = true;
      startbg.destroy();
      player.sprite.body.allowGravity = true;
    }
    return;
  }
  if (completed) {
    // Wait awhile, then Reset with Z
    completeTimer++;
    if (completeTimer > 60 && game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
      reset();
    }
    return;
  }
  if (!player.sprite.alive) {
    resetTimer++;
    if (resetTimer > 60) {
      reset();
    } else {
      return;
    }
  }
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
  
  game.physics.collide(glassEmitter, groups.floors);
  game.physics.collide(glassEmitter, groups.ceilings);

  camera.update();
  player.update(groups.chips, groups.exit);

  // Update timer after camera so we follow properly
  timer--;
  if (timer <= 0) {
    timer = 0;
    killPlayer(player.sprite, null);
  } else if (!alarmSoundPlayed && timer < timerStart * 0.2) {
    // Play warning if running out of time
    alarmSound.play();
    // Change style
    var style = { font: "48px Arial", fill: "#ff6666", align: "center" };
    timerText.destroy();
    timerText = game.add.text(game.width / 2, 64, timer, style);
    timerText.anchor.setTo(0.5, 0.5);
    alarmSoundPlayed = true;
  }
  timerText.setText(timer);
  timerText.x = game.camera.x + game.width / 2;
  timerText.y = game.camera.y + 64;

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
    killPlayer(player.sprite);
  }
  // Kill player if dropped to bottom
  if ((player.sprite.y + player.sprite.height) >= game.world.bounds.height - 5) {
    killPlayer(player.sprite);
  }
  
  // Win condition, reached exit
  game.physics.overlap(player.sprite, groups.exit, winGame);

  // Parallax
  bgSprite.x = game.camera.x * 0.95;
  bgSprite.y = game.camera.y * 0.95;
}

function overlapRoom(playerSprite, room) {
  player.moveMode = 'h';
}

function collideGlass(playerSprite, glass) {
  glassSound.play();
  glassEmitter.x = glass.x + glass.width / 2;
  glassEmitter.y = playerSprite.y;
  if (player.moveMode !== 'c') {
    glassEmitter.setXSpeed(playerSprite.body.velocity.x * 0.8,
                           playerSprite.body.velocity.x * 1.3);
  } else {
    glassEmitter.setXSpeed(-100.0, 100.0);
  }
  glassEmitter.start(true, 3000, null, 30);
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
  collectSound.play();
  numCollected++;
}

function hitEnemy(melee, enemy) {
  enemy.damage(1);
  var flyMultiplier = 5;
  var i;
  if (enemy.alive) {
    hitSound.play();
  } else {
    for (i = 0; i < 10; i++) {
      var enemyDieSprite = game.add.sprite(
        enemy.x - Math.random()*enemy.width,
        enemy.y - Math.random()*enemy.height, 'enemy_die');
      var enemyDieAnimation = enemyDieSprite.animations.add('play');
      enemyDieAnimation.killOnComplete = true;
      enemyDieAnimation.play(Math.random()*30 + 30);
    }
  }
  
  // Combos: check if another enemy is in the vicinity, and move towards them
  var closestEnemy = null;
  var closestDistance = 0;
  for (i = 0; i < enemies.length; i++) {
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
  for (var i = 0; i < 10; i++) {
    var playerDieSprite = game.add.sprite(
      playerSprite.x - (Math.random() - 0.5)*playerSprite.width*3,
      playerSprite.y - (Math.random() - 0.5)*playerSprite.height*3,
      'player_die');
    var playerDieAnimation = playerDieSprite.animations.add('play');
    playerDieAnimation.killOnComplete = true;
    playerDieAnimation.play(Math.random()*10 + 10);
  }
  player.sprite.kill();
  player.die();
}

function reset() {
  resetTimer = 0;
  timer = timerStart;
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].kill(false);
  }
  enemies.length = 0;
  player.reset();
  buildings.reset(game);
  makeText();
  groups.screen.removeAll();
  numCollected = 0;
  completed = false;
  completeTimer = 0;
}

function makeText() {
  // Timer text
  var style = { font: "48px Arial", fill: "#aaffaa", align: "center" };
  if (timerText) {
    timerText.destroy();
  }
  timerText = game.add.text(game.width / 2, 64, timerText, style);
  timerText.anchor.setTo(0.5, 0.5);
}

function winGame() {
  completed = true;
  exitSound.play();
  player.freeze();

  var scorebg = game.add.sprite(game.camera.x + game.width / 2, game.camera.y + game.height / 2, 'score');
  scorebg.anchor.setTo(0.5, 0.5);
  groups.screen.add(scorebg);
  var score = Math.floor(timer * (1 + numCollected));
  if (score > getHighScore) {
    setHighScore(score);
  }
  var text = "   " + timer + "                              " + numCollected +
    "\n\n" + "   " + score + "                              " + getHighScore() + "\n\n\n";
  timerText.destroy();
  var style = { font: "16px Arial", fill: "#ffffff", align: "center" };
  timerText = game.add.text(game.camera.x + game.width / 2, game.camera.y + game.height / 2, text, style);
  timerText.anchor.setTo(0.5, 0.5);
  groups.screen.add(timerText);
}