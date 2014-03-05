var Player = function(game, gravity) {
  
  // constants
  
  // Speed for moving left/right
  var speed = 200;
  
  // Multiplier of gravity of jump force
  var jumpMultiplier = -15;
  
  // Speed for pushing off walls
  var pushForce = 500;
  // Also jump up a little when pushing off walls
  var pushJumpMultiplier = -10;
  
  // Maximum speed in freefall
  var maxYVel = 600;
  
  // Maximum speed when sliding against wall
  var maxSlideVel = 400;
  
  
  this.sprite = game.add.sprite(32, 150, 'player');
  //  Player physics properties
  this.sprite.body.gravity.y = gravity;
  this.sprite.body.collideWorldBounds = true;
  //  Our two animations, walking left and right.
  this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
  this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);
  this.touchState = {};
  
  // (h)orizontal or (v)ertical
  // In horizontal mode, player walks along floors in building interiors
  // In vertical mode, player pushes off sides of buildings
  this.moveMode = 'v';
  
  this.lastDir = 'left';
  
  // Melee attack sprite
  // Normally inactive, activated using melee key
  this.meleeSprite = game.add.sprite(0, 0, 'melee');
  this.meleeSprite.anchor.setTo(0.5, 0.5);
  this.meleeSprite.kill();
  // Flag so that melee needs to be on key press not key down
  this.hadMelee = false;
  var meleeSound = game.add.audio('swish');

  // Move left, right, jump on ground
  // When jumping, cannot change x velocity
  this.handleInput = function(game, cursors) {
    // Update what touching state the player is in
    var newTouch = this.sprite.body.touching;
    if (newTouch.left || newTouch.right || newTouch.down) {
      this.touchState = {
        left : newTouch.left,
        right : newTouch.right,
        down : newTouch.down
      };
    }

    if (this.touchState.left || this.touchState.right) {
      // sliding against building
      this.sprite.animations.stop();
      this.sprite.frame = 4;
      this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y, maxSlideVel);
      
      // Allow player to do two moves when touching a wall:
      // - jump to left/right wall only if they were touching the opposite wall
      // - nudge into the wall they are touching so they can enter rooms on their side
      if (this.touchState.left) {
        if (cursors.right.isDown) {
          this.sprite.body.velocity.x = pushForce;
          this.sprite.body.velocity.y += pushJumpMultiplier * gravity;
          this.sprite.animations.play('right');
          this.touchState.left = false;
          this.lastDir = 'right';
        } else if (cursors.left.isDown) {
          this.sprite.body.velocity.x = -100;
        }
      } else if (this.touchState.right) {
        if (cursors.left.isDown) {
          this.sprite.body.velocity.x = -pushForce;
          this.sprite.body.velocity.y += pushJumpMultiplier * gravity;
          this.sprite.animations.play('left');
          this.touchState.right = false;
          this.lastDir = 'left';
        } else if (cursors.right.isDown) {
          this.sprite.body.velocity.x = 100;
        }
      }
    } else if (newTouch.down) {
      this.sprite.body.velocity.x = 0;
      if (cursors.left.isDown) {
        //  Move to the left
        this.sprite.body.velocity.x = -speed;
        this.sprite.animations.play('left');
        this.lastDir = 'left';
      } else if (cursors.right.isDown) {
        //  Move to the right
        this.sprite.body.velocity.x = speed;
        this.sprite.animations.play('right');
        this.lastDir = 'right';
      } else {
        //  Stand still
        this.sprite.animations.stop();
        this.sprite.frame = 4;
      }

      //  Allow the player to jump if they are touching the ground.
      if (cursors.up.isDown) {
       this.sprite.body.velocity.y = this.sprite.body.gravity.y * jumpMultiplier;
      }
    }

    // Check for melee
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
      if (!this.hadMelee) {
        this.melee();
      } else {
        this.meleeSprite.kill();
      }
    } else {
      this.meleeSprite.kill();
      this.hadMelee = false;
    }
  };
  
  this.melee = function() {
    var pos = {
      x: this.sprite.x + this.sprite.width / 2,
      y: this.sprite.y + this.sprite.height / 2
    };
    if (this.lastDir === 'left') {
      pos.x -= this.sprite.width / 2;
    } else {
      pos.x += this.sprite.width / 2;
    }
    this.meleeSprite.reset(pos.x, pos.y, 1);
    meleeSound.play();
    this.hadMelee = true;
  };
  
  this.update = function() {
    // Cap Y velocity so we don't fall so fast
    this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y, maxYVel);
  };
};