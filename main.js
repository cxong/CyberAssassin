var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player;
var buildings;
var cursors;

function preload () {
  game.load.image('logo', 'phaser.png');
  game.load.image('building', 'images/05muronero.jpg');
  game.load.spritesheet('player', 'images/dude.png', 32, 48);
  
  cursors = game.input.keyboard.createCursorKeys();
}

function create () {
  var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
  logo.anchor.setTo(0.5, 0.5);
  
  buildings = game.add.group();
  var ledge = buildings.create(550, 400, 'building');
  // This stops it from falling away when you jump on it
  ledge.body.immovable = true;

  ledge = buildings.create(-250, 250, 'building');
  ledge.body.immovable = true;
  
  // The player and its settings
  player = game.add.sprite(32, 150, 'player');

  //  Player physics properties. Give the little guy a slight bounce.
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 6;
  player.body.collideWorldBounds = true;

  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
}

function update() {
  //  Collide the player with the buildings
  game.physics.collide(player, buildings);
  
  // Handle input
  //  Reset the players velocity (movement)
  player.body.velocity.x = 0;

  if (cursors.left.isDown)
  {
    //  Move to the left
    player.body.velocity.x = -150;

    player.animations.play('left');
  }
  else if (cursors.right.isDown)
  {
    //  Move to the right
    player.body.velocity.x = 150;

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
    player.body.velocity.y = -350;
  }
}