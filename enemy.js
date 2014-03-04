var Enemy = function(game, x, y) {
  this.sprite = game.add.sprite(x, y, 'enemy');
  // Offset sprite position so that its anchor point is the middle of its feet
  this.sprite.x -= this.sprite.width / 2;
  this.sprite.y -= this.sprite.height;
};