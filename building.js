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
  this.ceiling.body.immovable = true;
  groups.ceilings.add(this.ceiling);
  
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
      var enemy = new Enemy(game, enemyX, y + levelHeight);
      enemies.push(enemy);
      groups.enemies.add(enemy.sprite);
    }
  }
};

var Fixture = function(game, x, y, dir, fixturesGroup) {
  this.sprite = game.add.sprite(x, y, 'fixture');
   if (dir === 'left') {
    this.sprite.x -= this.sprite.width / 2;
  } else {
    this.sprite.x += this.sprite.width / 2;
  }
  this.sprite.anchor.setTo(0.5, 0);
  this.sprite.body.immovable = true;
  if (dir === 'left') {
    this.sprite.scale.x *= -1;
  }
  fixturesGroup.add(this.sprite);
};

var Building = function(game, x, w, h, groundY, groups, enemies, otherFixturesRight) {
  this.sprite = game.add.tileSprite(x, groundY - h, w, h, 'building');
  this.sprite.body.width = w;
  this.sprite.body.height = h;
  
  // This stops it from falling away when you jump on it
  this.sprite.body.immovable = true;
  
  // Add levels and fixtures at intervals
  var levelInterval = 150;
  // Track the fixtures we've placed on the right
  // This is to prevent placing fixtures at the same level on the left of the next building
  // The player can't jump through those
  this.fixturesRight = [];
  // Track whether we have last placed a fixture
  // Don't place consecutive fixtures otherwise the player can't jump here
  var lastFixtures = { left: false, right: false };
  var i = 0;
  for (var levelY = groundY - h + levelInterval;
       levelY + levelHeight < groundY;
       levelY += levelInterval) {
    // three fixtures for every level
    var roll = Math.floor(Math.random() * 4);
    if (roll < 3) {
      // Fixtures
      // Make sure there's no fixture on the right of the last building
      // for us to place a fixture on the left of this building
      if (x > 0 && !lastFixtures.left &&
          (otherFixturesRight.length <= i || !otherFixturesRight[i])) {
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
    }
    levelInterval = 300;
    this.fixturesRight.push(lastFixtures.right);
    i++;
  }
};

var buildingGap = 350;
var Buildings = function(game, groundY, groups, enemies) {
  this.numBuildings = 0;
  this.lastBuildingX = 0;
  this.lastFixturesRight = [];
  this.build = function(game, numBuildings) {
    this.numBuildings = numBuildings;
    this.lastBuildingX = -buildingGap;
    var gameWidth = 0;
    for (var i = 0; i < numBuildings; i++) {
      var width = Math.round(Math.random() * 400 + 200);
      var height = Math.round(groundY - 250);
      this.add(width, height);
      gameWidth += width + buildingGap;
    }
    gameWidth -= buildingGap;
    game.world.setBounds(0, 0, gameWidth, groundY);
  };
  this.add = function(w, h) {
    var building = new Building(
      game, this.lastBuildingX + buildingGap, w, h, groundY, groups, enemies, this.lastFixturesRight);
    groups.buildings.add(building.sprite);
    this.lastBuildingX += buildingGap + w;
    this.lastFixturesRight = building.fixturesRight;
  };
  this.reset = function(game) {
    groups.buildings.removeAll();
    groups.floors.removeAll();
    groups.ceilings.removeAll();
    groups.rooms.removeAll();
    groups.ledges.removeAll();
    groups.glasses.removeAll();
    groups.fixtures.removeAll();
    groups.enemies.removeAll();
    groups.bullets.removeAll();
    this.build(game, this.numBuildings);
  };
};