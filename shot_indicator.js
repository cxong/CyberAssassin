var ShotIndicator = function(game, x, y) {
  var yOffset = -96;
  var numFrames = 5;
  this.sprite = game.add.sprite(x, y + yOffset, 'shot_indicator');
  this.sprite.anchor.setTo(0.5, 0.5);
  for (var i = 0; i < numFrames; i++) {
    this.sprite.animations.add(i + "", [i]);
  }
  this.sprite.kill();
  
  this.show = function(fraction) {
    var frame = Math.round(fraction * numFrames);
    if (frame >= numFrames) {
      this.sprite.kill();
    } else {
      this.sprite.reset(x, y + yOffset, 1);
      this.sprite.animations.play(frame + "");
    }
  };
  this.hide = function() {
    this.sprite.kill();
  };
};