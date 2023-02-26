class Sprite {
  constructor({ pos, imgSrc, frameRate = 1, frameBuffer = 6, type = 1 }) {
    this.position = pos;
    this.loaded = false;
    this.image = new Image();
    this.image.src = imgSrc;
    this.image.onload = () => {
      this.width = this.image.width / this.frameRate;
      this.height = this.image.height;
      this.loaded = true;
    }
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrame = 0;
    this.type = type;
  }
  draw() {
    if (!this.image) {
      return;
    }
    const cropBox = {
      position: {
        x: this.currentFrame * (this.image.width / this.frameRate),
        y: 0,
      },
      width: this.image.width / this.frameRate,
      height: this.image.height,
    };

    ctx.drawImage(
      this.image,
      cropBox.position.x,
      cropBox.position.y,
      cropBox.width,
      cropBox.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update() {
    this.draw();
  }
  updateFrames() {
    this.elapsedFrame++;

    if (this.elapsedFrame % this.frameBuffer === 0) {
      this.elapsedFrame = 0;
      if (this.currentFrame === this.frameRate - 1 || this.currentFrame >= this.frameRate) {
        this.currentFrame = 0;
      } else {
        this.currentFrame++;
      }
    }
  }
}
