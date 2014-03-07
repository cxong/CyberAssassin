var windowWidth = 8;
var levelHeight = 100;

var Window = function(game, x, y, h, glassGroup) {
  this.sprite = game.add.tileSprite(x, y, windowWidth, h, 'glass');
  this.sprite.body.width = windowWidth;
  this.sprite.body.height = h;
  glassGroup.add(this.sprite);
};

var Ledge = function(game, x, y, dir, ledgeGroup) {
  var ledgeWidth = 32;
  var ledgeHeight = 32;
  this.sprite = game.add.tileSprite(
    x - ledgeWidth / 2, y, ledgeWidth, ledgeHeight, 'ceiling');
  this.sprite.body.width = ledgeWidth;
  this.sprite.body.height = ledgeHeight;
  ledgeGroup.add(this.sprite);
  this.sprite.dir = dir;
  this.sprite.canClimb = function(xVel) {
    if (this.dir === 'left') {
      return xVel > 0;
    } else {
      return xVel < 0;
    }
  };
  this.sprite.getClimbPoint = function() {
    var y = this.body.y - this.body.height;
    if (this.dir === 'left') {
      return new Phaser.Point(this.body.x + this.body.width, y);
    } else {
      return new Phaser.Point(this.body.x - this.body.width, y);
    }
  };
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
  this.ledgeLeft = new Ledge(game, x, y + levelHeight, 'left', groups.ledges);
  this.ledgeRight = new Ledge(game, x + w, y + levelHeight, 'right', groups.ledges);
  
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

var Fixture = function(game, x, y, dir, fixturesGroup) {
  this.sprite = game.add.sprite(x, y, 'fixture');
  this.sprite.body.immovable = true;
  if (dir === 'left') {
    this.sprite.scale.x *= -1;
  }
  fixturesGroup.add(this.sprite);
};

var Building = function(game, x, w, h, groundY, groups, enemies) {
  this.sprite = game.add.tileSprite(x, groundY - h, w, h, 'building');
  this.sprite.body.width = w;
  this.sprite.body.height = h;
  
  // This stops it from falling away when you jump on it
  this.sprite.body.immovable = true;
  
  // Add levels and fixtures at random intervals
  var levelInterval = 150;
  // Track whether we have last placed a fixture
  // Don't place consecutive fixtures otherwise the player can't jump here
  var lastFixtures = { left: false, right: false };
  for (var levelY = groundY - h + levelInterval;
       levelY + levelHeight < groundY;
       levelY += levelInterval) {
    // two fixtures for every level
    var roll = Math.floor(Math.random() * 3);
    if (roll < 2) {
      // Fixtures
      if (x > 0 && !lastFixtures.left) {
        new Fixture(game, x, levelY, 'left', groups.fixtures);
        lastFixtures.left = true;
      } else {
        lastFixtures.left = false;
      }
      if (!lastFixtures.right) {
        new Fixture(game, x + w, levelY, 'right', groups.fixtures);
        lastFixtures.right = true;
      } else {
        lastFixtures.right = false;
      }
    } else {
      new Level(game, x, levelY, w, groundY, groups, enemies);
      levelInterval = Math.round(500 + Math.random(300));
    }
  }
};

var buildingGap = 350;
var Buildings = function(game, groundY, groups) {
  var lastBuildingX = -buildingGap;
  this.add = function(w, h, enemies) {
    var building = new Building(
      game, lastBuildingX + buildingGap, w, h, groundY, groups, enemies);
    groups.buildings.add(building.sprite);
    lastBuildingX += buildingGap + w;
  };
};