var Enemy = function(game, x, y) {
  this.sprite = game.add.sprite(x, y, 'enemy');
  // Offset sprite position so that its anchor point is the middle of its feet
  this.sprite.anchor.setTo(0.5, 1);
  
  // idle, fight
  // idle until player comes into view
  // fight until player leaves view
  this.state = 'idle';
  
  this.facing = 'left';
  
  // Countdown for shooting
  // At 0, shoots
  var fireCounterStart = 60;
  this.fireCounter = 0;
  
  this.update = function(game, player, bullets) {
    // Use Manhattan distance
    var distance = Math.abs(player.sprite.x - this.sprite.x) + Math.abs(player.sprite.y - this.sprite.y);
    if (this.state === 'idle') {
      // Check if player is close enough
      if (distance < 300) {
        // Switch state
        this.state = 'fight';
        this.fireCounter = fireCounterStart;
      }
    } else if (this.state === 'fight') {
      // Check if player is too far away
      if (distance > 400) {
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
        
        // Countdown to firing
        this.fireCounter--;
        
        // Fire
        if (this.fireCounter <= 0) {
          // Add a random extra delay so adjacent enemies don't fire in unison
          this.fireCounter = fireCounterStart + Math.random() * fireCounterStart * 0.5;
          // X offset so the bullet fires outside the player from a "muzzle"
          // Note that since we use scale -1 to flip the sprite, this also flips width
          var bullet = game.add.sprite(this.sprite.x - this.sprite.width / 2, this.sprite.y - this.sprite.height / 2, 'bullet');
          bullet.body.velocity.x = -400;
          if (this.facing === 'right') {
            bullet.body.velocity.x *= -1;
            bullet.scale.x *= -1;
          }
          bullet.outOfBoundsKill = true;
          bullets.add(bullet);
          var laserSound = game.add.audio('laser');
          laserSound.play();
        }
      }
    }
  };
};