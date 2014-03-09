var Camera = function(game, player) {
  this.update = function() {
    // Manual follow because Phaser has a jitter bug
    game.camera.x = player.sprite.x + player.sprite.width / 2 - game.width / 2;
    game.camera.y = player.sprite.y - game.height / 6;
  };
};