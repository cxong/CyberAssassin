var Camera = function(game, player) {
  this.dy = player.sprite.y - game.height / 2;
  var isFollowingPlayer = false;
  this.update = function() {
    // Manual follow because Phaser has a jitter bug
    game.camera.x = player.sprite.x - game.width / 2;
    if (isFollowingPlayer) {
      // Note: need to do this calc in one go because Phaser will clamp camera
      // location within game
      game.camera.y = this.dy + player.sprite.y;
    } else {
      game.camera.y = this.dy;
    }

    // Check if player has fallen further than the last building Y,
    // if so start following the player's Y position
    if (!isFollowingPlayer && player.sprite.y - game.height / 2 > this.dy) {
      this.dy = -game.height / 2;
      isFollowingPlayer = true;
    }
  };
  this.playerCollide = function(building) {
    if (player.sprite.body.touching.down) {
      // Lock camera Y to the ground the player is standing on
      this.dy = building.y - game.height / 2;
      isFollowingPlayer = false;
    } else if (player.sprite.body.touching.left || player.sprite.body.touching.right) {
      // start looking below the player since he is falling
      // player is about 5/6 of the way from bottom of screen
      //this.dy = -game.height / 2  + (game.height * 0.33);
      isFollowingPlayer= true;
      game.add.tween(this).to(
        {dy : -game.height / 2  + (game.height * 0.33)},  // properties
        600,  // duration
        Phaser.Easing.Sinusoidal.InOut,  // easing
        true // autostart
        );
    }
  };
};