class Player extends Sprite {
  constructor({ pos, collisionBlocks, damageBlocks, imgSrc, frameRate, animations, coins }) {
    super({ imgSrc, frameRate });

    this.health = 100;
    this.position = pos;
    this.velocity = {
      x: 0,
      y: 1,
    };
    this.isFalling = true;
    this.collisionBlocks = collisionBlocks;
    this.damageBlocks = damageBlocks;
    this.coins = coins;
    this.hitbox = {
      position: {
        x: this.position.x + 90,
        y: this.position.y + 70
      },
      width: 24,
      height: 57,
    };
    this.camerabox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 200,
      height: 60,
    };
    this.attackbox = {
      position: {
        x: this.hitbox.position.x + 15,
        y: this.hitbox.position.y,

      },
      width: 30,
      height: 20,
    }
    this.animations = animations;
    this.lastDirection = 'right';
    this.await = 0;
    this.attackType = 1;
    this.dead = false;
    this.coins = 0;


    // create Image from imgSrc for animations:
    for (const key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imgSrc;
      this.animations[key].image = image; 
    }
  }
  switchAnimation(key) {
    if (this.dead) {
      return;
    }
    if (this.image === this.animations.death.image) {
      if (this.currentFrame === this.animations.death.frameRate - 1) {
        this.dead = true;
      }
      return;
    }
    if (this.image === this.animations[key].image || !this.loaded) {
      return;
    }
    if ((this.image === this.animations.attack.image || this.image === this.animations.attackLeft.image)
      && this.currentFrame < this.animations.attack.frameRate - 1) {
      return;
    }

    this.image = this.animations[key].image;
    this.frameRate = this.animations[key].frameRate;
    this.frameBuffer = this.animations[key].frameBuffer;
    this.currentFrame = 0;
  }
  checkForAttack(targets) {
    targets.forEach(target => {
      if (this.attackbox.position.y + this.attackbox.height >= target.cropbox.position.y
        && this.attackbox.position.y <= target.cropbox.position.y + target.cropbox.height
        && this.attackbox.position.x <= target.cropbox.position.x + target.cropbox.width
        && this.attackbox.position.x + this.attackbox.width >= target.cropbox.position.x) {
        if (this.currentFrame === 3 && this.elapsedFrame === 0) {
          target.takeHit(30);
        } 
      }
    })
  }
  updateAttackbox() {
    if (this.lastDirection === 'right') {
      this.attackbox = {
        position: {
          x: this.hitbox.position.x + 15,
          y: this.hitbox.position.y,

        },
        width: 60,
        height: 40,
      }
    } else {
      this.attackbox = {
        position: {
          x: this.hitbox.position.x - 60,
          y: this.hitbox.position.y,
        },
        width: 60,
        height: 40,
      }
    }
  }
  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x + 90,
        y: this.position.y + 70
      },
      width: 24,
      height: 57,
    }
  }
  updateCamerabox() {
    this.camerabox = {
      position: {
        x: this.position.x - 20,
        y: this.position.y,
      },
      width: 240,
      height: 190,
    };
  }
  update() {
    if (!this.dead) {
      this.updateFrames();
    }
    // DEVELOPMENT TOOLS:
    // == to see full image box (big box):
    // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    // == to see cropBox (small box of collision) for player:
    // ctx.fillStyle = 'rgba(144, 144, 0, 0.5)'
    // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)
    // == to see camerabox:
    // ctx.fillStyle = 'rgba(150, 0, 150, 0.3)';
    // ctx.fillRect(this.camerabox.position.x, this.camerabox.position.y, this.camerabox.width, this.camerabox.height);
    // == to see attackbox: 
    // ctx.fillStyle = 'rgba(156, 134, 12, 0.3)';
    // ctx.fillRect(this.attackbox.position.x, this.attackbox.position.y, this.attackbox.width, this.attackbox.height);

    if (this.health <= 0) {
      this.switchAnimation('death');
      this.velocity.x = 0;
      this.draw();

      return;
    }

    this.draw();
    this.await--;
    this.updateAttackbox();

    this.position.x += this.velocity.x;
    this.updateCamerabox();
    this.updateHitbox();
    this.checkForHorizontalCollisions();
    this.applyGravity();
    this.updateHitbox();
    this.checkForVerticalCollisions();
    this.checkForCollisionsWithCoins();

    this.checkForDamageBlocks();

    if (this.velocity.y < 0) {
      this.isFalling = false;
    } else if (this.velocity.y > 0) {
      this.isFalling = true;
    }
  }
  applyGravity() {
    if (this.position.y + this.velocity.y + this.height < backgroundImg.height) {
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    this.position.y += this.velocity.y;
  }
  takeHit(points, wait = 15) {
    this.health -= points;
    if (this.lastDirection === 'right') {
      this.switchAnimation('takeHit');
    } else {
      this.switchAnimation('takeHitLeft');
    }
    this.await = wait;
  }
  checkForDamageBlocks() {
    for (let i = 0; i < this.damageBlocks.length; i++) {
      const currentBlock = this.damageBlocks[i];

      if (this.hitbox.position.y + this.hitbox.height >= currentBlock.position.y
        && this.hitbox.position.y <= currentBlock.position.y + currentBlock.height
        && this.hitbox.position.x <= currentBlock.position.x + currentBlock.width
        && this.hitbox.position.x + this.hitbox.width >= currentBlock.position.x) {
        if (this.await > 0) {
          return;
        }
        const damagePoints = 20;
        const wait = 20;

        this.takeHit(damagePoints, wait);
        break;
      }
    }
  }
  checkForHorizontalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const currentBlock = this.collisionBlocks[i];

      if (this.hitbox.position.y + this.hitbox.height >= currentBlock.position.y
        && this.hitbox.position.y <= currentBlock.position.y + currentBlock.height
        && this.hitbox.position.x <= currentBlock.position.x + currentBlock.width
        && this.hitbox.position.x + this.hitbox.width >= currentBlock.position.x) {
        if (this.velocity.x > 0) {
          this.velocity.x = 0;
          const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;
          this.position.x = currentBlock.position.x - offset - 0.01;
          break;
        }
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
          const offset = this.hitbox.position.x - this.position.x;
          this.position.x = currentBlock.position.x + currentBlock.width - offset + 0.01;
          break;
        } 
      }
    }
  }
  checkForVerticalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const currentBlock = this.collisionBlocks[i];

      if (this.hitbox.position.y + this.hitbox.height >= currentBlock.position.y
        && this.hitbox.position.y <= currentBlock.position.y + currentBlock.height
        && this.hitbox.position.x <= currentBlock.position.x + currentBlock.width
        && this.hitbox.position.x + this.hitbox.width >= currentBlock.position.x) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;
          this.position.y = currentBlock.position.y - offset - 0.01;
          break;
        } 
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
          const offset = this.hitbox.position.y - this.position.y;
          this.position.y = currentBlock.position.y + currentBlock.height - offset + 0.01;
          break;
        } 
      }
    }
  }
  checkForCollisionsWithCoins() {
    for (let i = 0; i < coinsBlocks.length; i++) {
      const currentCoin = coinsBlocks[i];

      if (this.hitbox.position.y + this.hitbox.height >= currentCoin.position.y
        && this.hitbox.position.y <= currentCoin.position.y + currentCoin.height
        && this.hitbox.position.x <= currentCoin.position.x + currentCoin.width
        && this.hitbox.position.x + this.hitbox.width >= currentCoin.position.x) {
        if (currentCoin.type === 1) {
          this.coins++;
          coinsBlocks.splice(i, 1);
        } else if (currentCoin.type === 2) {
          if (this.health < 100) {
            coinsBlocks.splice(i, 1);
          }
          this.health += 33;
          this.health = this.health >= 100 ? 100 : this.health;
        }
        break;
      }
    }
  }
  shouldMoveCameraRight() {
    if (this.camerabox.position.x + this.camerabox.width >= backgroundImg.width) {
      return;
    }
    const cmaeraboxRightSide = this.camerabox.position.x + this.camerabox.width;
    const scaledCanvasWidth = cnv.width / scalingSize;

    if (cmaeraboxRightSide >= scaledCanvasWidth + Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }
  shouldMoveCameraLeft() {
    if (this.camerabox.position.x <= 0) {
      return;
    }

    if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }
  shouldMoveCameraUp() {
    if (this.camerabox.position.y + this.velocity.y <= 0) {
      return;
    }

    if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
      camera.position.y -= this.velocity.y;
    }
  }
  shouldMoveCameraDown() {
    if (this.camerabox.position.y + this.camerabox.height + this.velocity.y >= backgroundImg.height) {
      return;
    }

    if (this.camerabox.position.y + this.camerabox.height >= Math.abs(camera.position.y) + (cnv.height / scalingSize)) {
      camera.position.y -= this.velocity.y;
    }
  }
}
