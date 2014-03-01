var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var gravity = 30; // default, no-air-resistance gravity
var groundY = 5000;
var bgSprite;
var player;
var buildings;
var chips;
var cursors;
var music;

function preload () {
  game.load.image('bgimage', 'images/bg.jpg');
  game.load.image('building', 'images/05muronero.jpg');
  game.load.image('chip', 'images/chip.png');
  game.load.spritesheet('player', 'images/dude.png', 32, 48);
  
  game.load.audio('bgaudio', ['sounds/bg.ogg']);
  
  cursors = game.input.keyboard.createCursorKeys();
}

function create () {
  game.world.setBounds(0, 0, 2000, groundY);
  bgSprite = game.add.sprite(0, 0, 'bgimage');
  bgSprite.scale.setTo(3, 3);
  
  music = game.add.audio('bgaudio');
  music.play();
  
  buildings = new Buildings(game, groundY);
  buildings.add(200, 4750);
  buildings.add(300, 4600);
  buildings.add(350, 4400);
  buildings.add(500, 4000);
  
  // The player and its settings
  player = new Player(game, gravity);
  
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
  game.physics.collide(player.sprite, buildings.group);
  game.physics.collide(chips, buildings.group);
  // Check for player pickups
  game.physics.overlap(player.sprite, chips, collectChip, null, this);
  
  player.handleInput(cursors);

  // Manual follow because Phaser has a jitter bug
  game.camera.x = player.sprite.x - game.width / 2;
  game.camera.y = player.sprite.y - game.height / 2;
  
  // Parallax
  bgSprite.x = game.camera.x * 0.9;
  bgSprite.y = game.camera.y * 0.9;
}

function collectChip(player, chip) {
  chip.kill();
}