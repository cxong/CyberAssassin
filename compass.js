var Compass = function(game) {
  this.sprite = game.add.sprite(0, 0, 'arrow');
  this.sprite.anchor.setTo(0.5, 0.5);

  this.update = function(playerSprite, chipsGroup, exit) {
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
    // If no chips left, point to exit instead
    if (firstChipBelow === null) {
      firstChipBelow = exit.getAt(0);
    }
    var d = new Phaser.Point(firstChipBelow.x - playerSprite.x + playerSprite.width / 2,
                             firstChipBelow.y - playerSprite.y);
    d = d.normalize();
    this.sprite.reset(playerSprite.x + d.setMagnitude(128).x,
                      playerSprite.y + d.setMagnitude(128).y);
    this.sprite.angle = Math.atan2(d.x, -d.y) * 180.0 / Math.PI - 90;
  };
};