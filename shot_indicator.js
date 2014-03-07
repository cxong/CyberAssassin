var ShotIndicator = function(game, x, y) {
  var yOffset = -64;
  var numFrames = 4;
  this.sprite = game.add.sprite(x, y + yOffset, 'shot_indicator');
  for (var i = 0; i < numFrames; i++) {
    this.sprite.animations.add(i + "", [i]);
  }
  this.sprite.kill();
  
  this.show = function(fraction) {
    var frame = Math.round(fraction * numFrames);
    if (frame >= numFrames) {
      this.sprite.kill();
    } else {
      this.sprite.alive = true;
      this.sprite.animations.play(frame + "");
    }
  };
  this.hide = function() {
    this.sprite.kill();
  };
};