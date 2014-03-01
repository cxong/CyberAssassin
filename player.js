var Player = function(game, gravity) {
  var speed = 250;
  this.sprite = game.add.sprite(32, 150, 'player');
  //  Player physics properties
  this.sprite.body.gravity.y = gravity;
  this.sprite.body.collideWorldBounds = true;
  //  Our two animations, walking left and right.
  this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
  this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);

  // Move left, right, jump on ground
  // When jumping, cannot change x velocity
  this.handleInput = function(cursors) {
    if (this.sprite.body.touching.down)
    {
      this.sprite.body.velocity.x = 0;
      if (cursors.left.isDown)
      {
        //  Move to the left
        this.sprite.body.velocity.x = -speed;
        this.sprite.animations.play('left');
      }
      else if (cursors.right.isDown)
      {
        //  Move to the right
        this.sprite.body.velocity.x = speed;
        this.sprite.animations.play('right');
      }
      else
      {
        //  Stand still
        this.sprite.animations.stop();
        this.sprite.frame = 4;
      }

      //  Allow the player to jump if they are touching the ground.
      if (cursors.up.isDown) {
       this.sprite.body.velocity.y = this.sprite.body.gravity.y * -20;
      }
    }
  };
};