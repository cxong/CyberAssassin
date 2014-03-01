var Building = function(game, x, w, h, groundY) {
  this.sprite = game.add.tileSprite(x, groundY - h, w, h, 'building');
  this.sprite.body.width = w;
  this.sprite.body.height = h;
  
  // This stops it from falling away when you jump on it
  this.sprite.body.immovable = true;
};

var Buildings = function(game, groundY) {
  this.group = game.add.group();
  var buildingGap = 200;
  var lastBuildingX = -buildingGap;
  this.add = function(w, h) {
    var building = new Building(game, lastBuildingX + buildingGap, w, h, groundY);
    this.group.add(building.sprite);
    lastBuildingX += buildingGap + w;
  };
};