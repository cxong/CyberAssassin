var maxHealth = 4;
var HealthIndicator = function(game, x, y) {
  var yOffset = -32;
  var numFrames = 5;
  this.sprite = game.add.sprite(x + 16, y + yOffset, 'health');
  this.sprite.anchor.setTo(0.5, 0.5);
  for (var i = 0; i < numFrames; i++) {
    this.sprite.animations.add(i + "", [i]);
  }
  
  var regenSpeed = 100;
  this.showCounter = 0;
  this.setPosition = function(playerSprite) {
    this.sprite.x = playerSprite.x + playerSprite.width / 2;
    this.sprite.y = playerSprite.y + yOffset;
    this.showCounter++;
    if (this.showCounter > regenSpeed) {
      this.showCounter = 0;
      if (playerSprite.health >= maxHealth) {
        this.sprite.kill();
      } else {
        playerSprite.health++;
        this.show(playerSprite);
      }
    }
  };
  
  this.show = function(playerSprite) {
    var frame = maxHealth - playerSprite.health;
    this.sprite.reset(x, y + yOffset, 1);
    this.sprite.animations.play(frame + "");
    this.showCounter = 0;
    this.sprite.reset(0, 0, 1);
    this.setPosition(playerSprite);
  };
};