var Enemy = function(game, x, y) {
  this.sprite = game.add.sprite(x, y, 'enemy');
  // Offset sprite position so that its anchor point is the middle of its feet
  this.sprite.anchor.setTo(0.5, 1);
  
  // idle, fight
  // idle until player comes into view
  // fight until player leaves view
  this.state = 'idle';
  
  this.facing = 'left';
  
  this.update = function(player) {
    // Use Manhattan distance
    var distance = Math.abs(player.sprite.x - this.sprite.x) + Math.abs(player.sprite.y - this.sprite.y);
    if (this.state === 'idle') {
      // Check if player is close enough
      if (distance < 200) {
        // Switch state
        this.state = 'fight';
      }
    } else if (this.state === 'fight') {
      // Check if player is too far away
      if (distance > 300) {
        // Switch state
        this.state = 'idle';
      } else {
        // Turn to face player
        if (player.sprite.x < this.sprite.x && this.facing === 'right') {
          this.sprite.scale.x *= -1;
          this.facing = 'left';
        } else if (player.sprite.x > this.sprite.x && this.facing === 'left') {
          this.sprite.scale.x *= -1;
          this.facing = 'right';
        }
      }
    }
  };
};