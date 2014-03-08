var Compass = function(game, chipsGroup) {
  this.sprite = game.add.sprite(0, 0, 'arrow');
  this.sprite.anchor.setTo(0.5, 0.5);

  this.update = function(playerSprite) {
    // find the first chip that is below the player
    var firstChipBelow = null;
    for (var i = 0; i < chipsGroup.total; i++) {
      var chip = chipsGroup.getAt(i);
      if (chip.alive &&
          chip.y + 100 > playerSprite.y &&
          (firstChipBelow === null || firstChipBelow.y > chip.y)) {
        firstChipBelow = chip;
      }
    }
    if (firstChipBelow === null) {
      this.sprite.kill();
    } else {
      var d = new Phaser.Point(firstChipBelow.x - playerSprite.x,
                               firstChipBelow.y - playerSprite.y);
      d = d.normalize();
      this.sprite.x = playerSprite.x + d.setMagnitude(128).x;
      this.sprite.y = playerSprite.y + d.setMagnitude(128).y;
      this.sprite.angle = Math.atan2(d.x, -d.y) * 180.0 / Math.PI - 90;
    }
  };
};