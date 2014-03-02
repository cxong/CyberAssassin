var Level = function(game, x, y, w) {
  var h = 100;
  var windowWidth = 16;
  this.windowLeft = game.add.tileSprite(x, y, windowWidth, h, 'glass');
  this.windowRight = game.add.tileSprite(x + w - windowWidth, y, windowWidth, h, 'glass');
};

var Building = function(game, x, w, h, groundY) {
  this.sprite = game.add.tileSprite(x, groundY - h, w, h, 'building');
  this.sprite.body.width = w;
  this.sprite.body.height = h;
  
  // This stops it from falling away when you jump on it
  this.sprite.body.immovable = true;
  
  // Add levels at regular intervals
  this.levels = [];
  var levelInterval = 300;
  for (var levelY = groundY - h + levelInterval; levelY < groundY; levelY += levelInterval) {
    this.levels.push(new Level(game, x, levelY, w));
  }
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