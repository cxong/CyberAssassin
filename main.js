var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var gravity = 30; // default, no-air-resistance gravity
var player;
var playerSpeed = 250;
var buildings;
var chips;
var cursors;

function preload () {
  game.load.image('logo', 'phaser.png');
  game.load.image('building', 'images/05muronero.jpg');
  game.load.image('chip', 'images/chip.png');
  game.load.spritesheet('player', 'images/dude.png', 32, 48);
  
  cursors = game.input.keyboard.createCursorKeys();
}

function create () {
  game.world.setBounds(0, 0, 1400, 1400);

  var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
  logo.anchor.setTo(0.5, 0.5);
  
  buildings = game.add.group();
  var ledge = buildings.create(500, 400, 'building');
  // This stops it from falling away when you jump on it
  ledge.body.immovable = true;

  ledge = buildings.create(-200, 250, 'building');
  ledge.body.immovable = true;
  
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
  game.physics.collide(player.sprite, buildings);
  game.physics.collide(chips, buildings);
  // Check for player pickups
  game.physics.overlap(player.sprite, chips, collectChip, null, this);
  
  player.handleInput(cursors);
}

function collectChip(player, chip) {
  chip.kill();
}