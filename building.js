var windowWidth = 8;
var ledgeWidth = 32;
var levelHeight = 100;

var Window = function(game, x, y, h, glassGroup) {
  this.sprite = game.add.tileSprite(x, y, windowWidth, h, 'glass');
  this.sprite.body.width = windowWidth;
  this.sprite.body.height = h;
  glassGroup.add(this.sprite);
};

var Ledge = function(game, x, y, ledgeGroup) {
  var ledgeHeight = 50;
  this.sprite = game.add.tileSprite(x, y, ledgeWidth, ledgeHeight, 'ceiling');
  this.sprite.body.width = ledgeWidth;
  this.sprite.body.height = ledgeHeight;
  ledgeGroup.add(this.sprite);
};

var Level = function(game, x, y, w, groundY, groups, enemies) {
  // Floors, which the player stands on in horizontal mode
  var floorHeight = 16;
  this.floor = game.add.tileSprite(x, y + levelHeight, w, floorHeight, 'floor');
  this.floor.body.width = w;
  this.floor.body.height = floorHeight;
  this.floor.body.immovable = true;
  groups.floors.add(this.floor);
  
  // Ceiling; decorational only
  var ceilingHeight = 16;
  this.ceiling = game.add.tileSprite(x, y - ceilingHeight, w, ceilingHeight, 'ceiling');
  
  // Room: touching these will cause the player's move mode to change
  // as if "entering" or "exiting" the room
  this.room = game.add.tileSprite(x, y, w, levelHeight, 'room');
  this.room.body.width = w;
  this.room.body.height = levelHeight;
  groups.rooms.add(this.room);
  
  // Windows; break them by running into them, otherwise nonfunctional
  this.windowLeft = new Window(game, x, y, levelHeight, groups.glasses);
  this.windowRight = new Window(game, x + w - windowWidth, y, levelHeight, groups.glasses);
  
  // Ledges: if grabbed on, will climb into the room above
  this.ledgeLeft = new Ledge(game, x, y + levelHeight, groups.ledges);
  this.ledgeRight = new Ledge(game, x + w - ledgeWidth, y + levelHeight, groups.ledges);
  
  // Randomly add enemies in rooms
  var numLocations = 5;
  var threshold = y * 5 / groundY;
  for (var i = 1; i < numLocations - 1; i++) {
    if (Math.random() * 6 < threshold) {
      var enemyX = x + i * w / numLocations;
      enemies.push(new Enemy(game, enemyX, y + levelHeight));
    }
  }
};

var Building = function(game, x, w, h, groundY, groups, enemies) {
  this.sprite = game.add.tileSprite(x, groundY - h, w, h, 'building');
  this.sprite.body.width = w;
  this.sprite.body.height = h;
  
  // This stops it from falling away when you jump on it
  this.sprite.body.immovable = true;
  
  // Add levels at random intervals
  this.levels = [];
  var levelInterval = 300;
  for (var levelY = groundY - h + levelInterval;
       levelY + levelHeight < groundY;
       levelY += levelInterval) {
    var level = new Level(game, x, levelY, w, groundY, groups, enemies);
    this.levels.push(level);
    levelInterval = Math.round(250 + Math.random(200));
  }
};

var buildingGap = 200;
var Buildings = function(game, groundY, groups) {
  var lastBuildingX = -buildingGap;
  this.add = function(w, h, enemies) {
    var building = new Building(
      game, lastBuildingX + buildingGap, w, h, groundY, groups, enemies);
    groups.buildings.add(building.sprite);
    lastBuildingX += buildingGap + w;
  };
};