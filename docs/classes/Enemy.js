class Enemy extends Sprite {
  constructor({ pos, health, damage, animations, limits }) {
    super({ imgSrc: animations.run.imgSrc, frameRate: animations.run.frameRate });

    this.health = health;
    this.damage = damage;
    this.position = pos;
    this.velocity = {
      x: 1,
      y: 0,
    };
    this.away = 100;
    this.animations = animations;
    this.limits = limits;
    this.lastDirection = 'right';
    this.cropbox = {
      position: {
        x: this.position.x + 10,
        y: this.position.y,
      },
      width: 80,
      height: 20,
    };
    this.dead = false;

    for (const key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imgSrc;
      this.animations[key].image = image; 
    }
  }
  update({ target }) {
    // == to see full big image box:
    // ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    // == to see small hitbox:
    // ctx.fillStyle = 'rgba(0, 200, 255, 0.4)'
    // ctx.fillRect(this.cropbox.position.x, this.cropbox.position.y, this.cropbox.width, this.cropbox.height);

    this.away--;

    if (!this.dead) {
      this.updateFrames();
    }

    if (this.health <= 0) {
      this.switchAnimation('death');
      this.velocity.x = 0;
      this.draw();

      return;
    }

    this.shouldAttack(target);
    this.shouldWalkAnotherSide();

    this.updateCropbox();
    this.draw();
  }
  takeHit(points) {
    this.health -= points;
    this.switchAnimation('takeHit');
    this.velocity.x = 0;
    this.away = 10;

    if (this.away > 0) {
      return;
    }

    this.away = 0;
    this.switchAnimation(this.lastDirection === 'right' ? 'run' : 'runLeft');
  }
  shouldAttack(target) {
    if (this.image === this.animations.takeHit.image && this.currentFrame < this.animations.takeHit.frameRate - 1) {
      return
    }
    if (this.cropbox.position.y + this.cropbox.height >= target.hitbox.position.y
        && this.cropbox.position.y <= target.hitbox.position.y + target.hitbox.height
        && this.cropbox.position.x <= target.hitbox.position.x + target.hitbox.width
        && this.cropbox.position.x + this.cropbox.width >= target.hitbox.position.x) {
      this.velocity.x = 0;
      this.away = 40;
      if (this.cropbox.position.x <= target.hitbox.position.x) {
        this.switchAnimation('attack');
      } else {
        this.switchAnimation('attackLeft');
      }

      if (this.currentFrame === 7 && this.elapsedFrame === 0) {
        target.takeHit(this.damage);
      }

    } else {
      if (this.velocity.x !== 0 || this.away > 0) {
        return;
      }

      this.away = 0;
      this.velocity.x = this.lastDirection === 'right' ? 1 : -1;
      this.switchAnimation(this.lastDirection === 'right' ? 'run' : 'runLeft');
    }
  }
  updateCropbox() {
    this.cropbox = {
      position: {
        x: this.position.x + 45,
        y: this.position.y + 60,
      },
      width: 60,
      height: 45,
    };
  }
  shouldWalkAnotherSide() {
    this.position.x += this.velocity.x;

    for (let i = 0; i < this.limits.length; i++) {
      const currentLimit = this.limits[i];

      if (this.cropbox.position.y + this.cropbox.height >= currentLimit.position.y
        && this.cropbox.position.y <= currentLimit.position.y + 16
        && this.cropbox.position.x + this.velocity.x <= currentLimit.position.x + 16
        && this.cropbox.position.x + this.cropbox.width + this.velocity.x >= currentLimit.position.x) {
        if (this.velocity.x > 0) {
          this.velocity.x = -1;
          this.lastDirection = 'left';
          this.switchAnimation('runLeft');
          break;
        } else if (this.velocity.x < 0) {
          this.velocity.x = 1;
          this.lastDirection = 'right';
          this.switchAnimation('run');
          break;
        }
      }
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

    this.image = this.animations[key].image;
    this.frameRate = this.animations[key].frameRate;
    this.frameBuffer = this.animations[key].frameBuffer;
    this.currentFrame = 0;
  }
}
