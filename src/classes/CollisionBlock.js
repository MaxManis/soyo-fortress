class CollisionBlock {
  constructor(pos) {
    this.position = pos;
    this.width = 16;
    this.height = 16;
  }
  draw() {
    // == to see collision blocks:
    // ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.draw();
  }
}
