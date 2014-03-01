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
  var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
  logo.anchor.setTo(0.5, 0.5);
  
  buildings = game.add.group();
  var ledge = buildings.create(500, 400, 'building');
  // This stops it from falling away when you jump on it
  ledge.body.immovable = true;

  ledge = buildings.create(-200, 250, 'building');
  ledge.body.immovable = true;
  
  // The player and its settings
  player = game.add.sprite(32, 150, 'player');
  //  Player physics properties
  player.body.gravity.y = gravity;
  player.body.collideWorldBounds = true;
  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  
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
  game.physics.collide(player, buildings);
  game.physics.collide(chips, buildings);
  // Check for player pickups
  game.physics.overlap(player, chips, collectChip, null, this);
  
  // Handle input
  //  Reset the players velocity (movement)
  player.body.velocity.x = 0;

  if (cursors.left.isDown)
  {
    //  Move to the left
    player.body.velocity.x = -playerSpeed;

    player.animations.play('left');
  }
  else if (cursors.right.isDown)
  {
    //  Move to the right
    player.body.velocity.x = playerSpeed;

    player.animations.play('right');
  }
  else
  {
    //  Stand still
    player.animations.stop();

    player.frame = 4;
  }

  //  Allow the player to jump if they are touching the ground.
  if (cursors.up.isDown && player.body.touching.down)
  {
    player.body.velocity.y = player.body.gravity.y * -20;
  }
}

function collectChip(player, chip) {
  chip.kill();
}