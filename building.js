var windowWidth = 8;

var Window = function(game, x, y, h, glassGroup) {
  this.sprite = game.add.tileSprite(x, y, windowWidth, h, 'glass');
  this.sprite.body.width = windowWidth;
  this.sprite.body.height = h;
  glassGroup.add(this.sprite);
};

var Level = function(game, x, y, w, groups, enemies) {
  var h = 100;
  
  var floorHeight = 16;
  this.floor = game.add.tileSprite(x, y + h, w, floorHeight, 'floor');
  this.floor.body.width = w;
  this.floor.body.height = floorHeight;
  this.floor.body.immovable = true;
  groups.floors.add(this.floor);
  
  var ceilingHeight = 16;
  this.ceiling = game.add.tileSprite(x, y - ceilingHeight, w, ceilingHeight, 'ceiling');
  
  this.room = game.add.tileSprite(x, y, w, h, 'room');
  this.room.body.width = w;
  this.room.body.height = h;
  groups.rooms.add(this.room);
  
  if (x >= game.world.bounds.x) {
    this.windowLeft = new Window(game, x, y, h, groups.glasses);
  }
  if (x + w < game.world.bounds.x + game.world.bounds.width) {
    this.windowRight = new Window(game, x + w - windowWidth, y, h, groups.glasses);
  }
  
  // Randomly add enemies in rooms
  var numLocations = 5;
  for (var i = 1; i < numLocations - 1; i++) {
    if (Math.random() * 6 < 1) {
      var enemyX = x + i * w / numLocations;
      enemies.push(new Enemy(game, enemyX, y + h));
    }
  }
};

var Building = function(game, x, w, h, groundY, groups, enemies) {
  this.sprite = game.add.tileSprite(x, groundY - h, w, h, 'building');
  this.sprite.body.width = w;
  this.sprite.body.height = h;
  
  // This stops it from falling away when you jump on it
  this.sprite.body.immovable = true;
  
  // Add levels at regular intervals
  this.levels = [];
  var levelInterval = 500;
  for (var levelY = groundY - h + levelInterval; levelY < groundY; levelY += levelInterval) {
    var level = new Level(game, x, levelY, w, groups, enemies);
    this.levels.push(level);
  }
};

var Buildings = function(game, groundY, groups) {

  var buildingGap = 200;
  var lastBuildingX = -buildingGap;
  this.add = function(w, h, enemies) {
    var building = new Building(
      game, lastBuildingX + buildingGap, w, h, groundY, groups, enemies);
    groups.buildings.add(building.sprite);
    lastBuildingX += buildingGap + w;
  };
};