const lvl = [];
const coins = [];
const enemies = [];

for (let i = 0; i < lvlData1.length; i += 200) {
  lvl.push(lvlData1.slice(i, i + 200));
  coins.push(coinsData1.slice(i, i + 200));
  enemies.push(enemyData1.slice(i, i + 200));
}

// Basic setup:
const cnv = document.getElementById('game');
const ctx = cnv.getContext('2d');

document.addEventListener('keydown', keyDownHandler)
document.addEventListener('keyup', keyUpHandler)

cnv.width = 900;
cnv.height = 500;

const skeletonCode = 440;
const mushroomCode = 277;
const healCode = 951;
const coinCode = 966;

const enemyLimitsTiles = [108];
const enemiesTiles = [mushroomCode, skeletonCode];
const coinsTiles = [coinCode, healCode];
const collisionBlocksTiles = [95, 3, 5, 52, 56, 67, 4, 369, 370, 372, 27, 77, 28, 81, 418, 416, 417, 371, 396, 31, 195, 196, 198];
const damageBlocksTiles = [313, 769, 838, 1020, 1019];

const tileSize = 16;
const scalingSize = 1.5;
const movmentSpeed = 3;
const gravity = 0.5;
const keys = {
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  space: {
    pressed: false,
  }
}

const backgroundImg = new Sprite({
  pos: {
    x: 0,
    y: 0,
  },
  imgSrc: './imgs/map0103.png',
});

let coinsBlocks = [];
coins.forEach((row, y) => {
  row.forEach((coin, x) => {
    if (coinsTiles.includes(coin)) {
      if (coin === coinCode) {
        coinsBlocks.push(new Sprite({
          pos: {
            x: x * tileSize,
            y: y * tileSize,
          },
          imgSrc: './imgs/coin1.png',
          frameRate: 4,
          frameBuffer: 8,
        }));
      } else if (coin === healCode) {
        coinsBlocks.push(new Sprite({
          pos: {
            x: x * tileSize,
            y: y * tileSize,
          },
          imgSrc: './imgs/heal.png',
          frameRate: 8,
          frameBuffer: 8,
          type: 2,
        }));
      }
    }
  });
});

const damageBlocks = [];
const collisionBlocks = [];
lvl.forEach((row, y) => {
  row.forEach((block, x) => {
    if (collisionBlocksTiles.includes(block)) {
      collisionBlocks.push(new CollisionBlock({
        x: x * tileSize,
        y: y * tileSize,
      }));
    }
    if (damageBlocksTiles.includes(block)) {
      damageBlocks.push(new CollisionBlock({
        x: x * tileSize,
        y: y * tileSize,
      }));
    }
  });
});

const enemyAnimationsSkeleton = {
  idle: {
    imgSrc: './imgs/skeleton/Idle.png',
    frameRate: 4,
    frameBuffer: 5,
  },
  run: {
    imgSrc: './imgs/skeleton/Walk.png',
    frameRate: 4,
    frameBuffer: 4,
  },
  runLeft: {
    imgSrc: './imgs/skeleton/Walk.png',
    frameRate: 4,
    frameBuffer: 4,
  },
  attack: {
    imgSrc: './imgs/skeleton/Attack.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  attackLeft: {
    imgSrc: './imgs/skeleton/Attack.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  takeHit: {
    imgSrc: './imgs/skeleton/Take Hit.png',
    frameRate: 4,
    frameBuffer: 4,
  },
  takeHitLeft: {
    imgSrc: './imgs/skeleton/Take Hit.png',
    frameRate: 4,
    frameBuffer: 4,
  },
  death: {
    imgSrc: './imgs/skeleton/Death.png',
    frameRate: 4,
    frameBuffer: 10,
  }
}
const enemyAnimationsMushroom = {
  idle: {
    imgSrc: './imgs/mushroom/Idle.png',
    frameRate: 4,
    frameBuffer: 5,
  },
  run: {
    imgSrc: './imgs/mushroom/Run.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  runLeft: {
    imgSrc: './imgs/mushroom/RunLeft.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  attack: {
    imgSrc: './imgs/mushroom/Attack.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  attackLeft: {
    imgSrc: './imgs/mushroom/Attack1Left.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  takeHit: {
    imgSrc: './imgs/mushroom/TakeHit.png',
    frameRate: 4,
    frameBuffer: 4,
  },
  takeHitLeft: {
    imgSrc: './imgs/mushroom/TakeHitLeft.png',
    frameRate: 4,
    frameBuffer: 4,
  },
  death: {
    imgSrc: './imgs/mushroom/Death.png',
    frameRate: 4,
    frameBuffer: 10,
  }
}

const enemyLimits = [];
const enemiesBlocks = [];
enemies.forEach((row, y) => {
  row.forEach((item, x) => {
    if (enemyLimitsTiles.includes(item)) {
      enemyLimits.push({
        position: {
          x: x * tileSize,
          y: y * tileSize,
        },
      });
    }
  })
});
enemies.forEach((row, y) => {
  row.forEach((item, x) => {
    if (enemiesTiles.includes(item)) {
      if (item === mushroomCode || item === skeletonCode) {
        enemiesBlocks.push(new Enemy({
          pos: {
            x: x * tileSize - 70,
            y: y * tileSize - 85,
          },
          health: 130,
          damage: 20,
          animations: enemyAnimationsMushroom,
          limits: enemyLimits
        }))
      } else if (item === skeletonCode + 'skeletons are not available now') {
        enemiesBlocks.push(new Enemy({
          pos: {
            x: x * tileSize - 70,
            y: y * tileSize - 85,
          },
          health: 210,
          damage: 35,
          animations: enemyAnimationsSkeleton,
          limits: enemyLimits
        }));
      }
    }
  })
});

const playerAnimations = {
  idle: {
    imgSrc: './imgs/hero/Idle.png',
    frameRate: 4,
    frameBuffer: 6,
  },
  idleLeft: {
    imgSrc: './imgs/hero/IdleLeft.png',
    frameRate: 4,
    frameBuffer: 6,
  },
  run: {
    imgSrc: './imgs/hero/Run.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  runLeft: {
    imgSrc: './imgs/hero/RunLeft.png',
    frameRate: 8,
    frameBuffer: 4,
  },
  jump: {
    imgSrc: './imgs/hero/Jump.png',
    frameRate: 2,
    frameBuffer: 4,
  },
  jumpLeft: {
    imgSrc: './imgs/hero/JumpLeft.png',
    frameRate: 2,
    frameBuffer: 4,
  },
  fall: {
    imgSrc: './imgs/hero/Fall.png',
    frameRate: 2,
    frameBuffer: 2,
  },
  fallLeft: {
    imgSrc: './imgs/hero/FallLeft.png',
    frameRate: 2,
    frameBuffer: 2,
  },
  attack: {
    imgSrc: './imgs/hero/Attack1.png',
    frameRate: 4,
    frameBuffer: 7,
  },
  attackLeft: {
    imgSrc: './imgs/hero/Attack1Left2.png',
    frameRate: 4,
    frameBuffer: 7,
  },
  attackTwo: {
    imgSrc: './imgs/hero/Attack2.png',
    frameRate: 4,
    frameBuffer: 7,
  },
  attack2Left: {
    imgSrc: './imgs/hero/Attack1Left2.png',
    frameRate: 4,
    frameBuffer: 7,
  },
  takeHit: {
    imgSrc: './imgs/hero/TakeHit.png',
    frameRate: 3,
    frameBuffer: 8,
  },
  takeHitLeft: {
    imgSrc: './imgs/hero/TakeHitLeft.png',
    frameRate: 3,
    frameBuffer: 8,
  },
  death: {
    imgSrc: './imgs/hero/Death.png',
    frameRate: 7,
    frameBuffer: 5,
  }
};
const player = new Player({
  pos: { x: 23, y: 977 },
  collisionBlocks,
  damageBlocks,
  imgSrc: './imgs/hero/Idle.png',
  frameRate: 4,
  animations: playerAnimations,
  coins: coinsBlocks
});

const camera = {
  position: {
    x: 0,
    y: -822,
  }
}

// KeyBoard handlers:
function keyDownHandler(event) {
  switch(event.keyCode) {
    case 87:
      if ((player.velocity.y <= 1 && player.velocity.y >= -1) && player.isFalling) {
        player.velocity.y = -8;
      }
      break;
    case 68:
      keys.d.pressed = true;
      break;
    case 65:
      keys.a.pressed = true;
      break;
    case 32:
      keys.space.pressed = true;
      break;
    default:
      break;
  }
}
function keyUpHandler(event) {
  switch(event.keyCode) {
    case 68:
      keys.d.pressed = false;
      break;
    case 65:
      keys.a.pressed = false;
      break;
    case 32:
      // keys.space.pressed = false;
      break;
    default:
      break;
  }
}

// Main function:
function game() {
  window.requestAnimationFrame(game);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  ctx.save();
  ctx.scale(scalingSize, scalingSize);
  ctx.translate(camera.position.x, camera.position.y);
  backgroundImg.update();
  collisionBlocks.forEach(block => block.update());
  coinsBlocks.forEach(coin => {
    coin.update();
    coin.updateFrames();
  });
  enemiesBlocks.forEach(e => {
    e.update({ target: player });
  });
  player.update();

  // UI:
  // Health bar:
  ctx.fillStyle = 'black';
  ctx.fillRect(Math.abs(camera.position.x) + 36, Math.abs(camera.position.y) + 25, 100, 25);
  ctx.fillStyle = 'red';
  ctx.fillRect(Math.abs(camera.position.x) + 36, Math.abs(camera.position.y) + 25, player.health > 0 ? player.health : 0, 25);

  const healthBar = new Image();
  healthBar.src = './imgs/ui/heatlthBar.png';
  ctx.drawImage(healthBar, Math.abs(camera.position.x) + 10, Math.abs(camera.position.y) + 20, 129, 35 )
  // Coins counter:
  const coinUI = new Image();
  coinUI.src = './imgs/ui/coin.png';
  ctx.drawImage(coinUI, Math.abs(camera.position.x) + 10, Math.abs(camera.position.y) + 60, 25, 25 )

  ctx.fillStyle = '#3385e7';
  ctx.font = '22px DotGothic16'; //sans-serif';
  ctx.fillText(player.coins, Math.abs(camera.position.x) + 36, Math.abs(camera.position.y) + 82)

  // Game over
  if (player.dead) {
    ctx.fillStyle = 'red';
    ctx.font = '68px DotGothic16';
    ctx.fillText('GAME OVER', Math.abs(camera.position.x) + 150, Math.abs(camera.position.y) + 180)
    ctx.font = '30px DotGothic16';
    ctx.fillText('Press \'Restart\'', Math.abs(camera.position.x) + 190, Math.abs(camera.position.y) + 220)
  }
  ctx.restore();

  player.velocity.x = 0;

  if (keys.a.pressed) {
    if (player.hitbox.position.x <= 0) {
      return;
    }
    keys.space.pressed = false;
    player.velocity.x = -movmentSpeed;
    player.switchAnimation('runLeft');
    player.lastDirection = 'left';
    player.shouldMoveCameraLeft();
  } else if (keys.d.pressed) {
    keys.space.pressed = false;
    player.velocity.x = movmentSpeed;
    player.switchAnimation('run');
    player.lastDirection = 'right';
    player.shouldMoveCameraRight();
  }

  if (!player.velocity.x && !keys.space.pressed && player.await <= 0) {
    if (player.lastDirection === 'right') {
      player.switchAnimation('idle');
    } else {
      player.switchAnimation('idleLeft');
    }
  }

  if (keys.space.pressed && !player.velocity.x && !player.velocity.y) {
    if (player.lastDirection === 'right') {
      player.switchAnimation(player.attackType === 1 ? 'attack' : 'attackTwo');
    } else {
      player.switchAnimation('attackLeft');
    }
    player.checkForAttack(enemiesBlocks);

    if (player.currentFrame === player.animations.attack.frameRate - 1) {
      keys.space.pressed = false;
    }
  }

  if (!keys.space.pressed) {
    player.attackType = player.attackType === 1 ? 2 : 1;
  }

  if (player.velocity.y < 0) {
    player.shouldMoveCameraUp();

    if (player.lastDirection === 'right') {
      player.switchAnimation('jump');
    } else {
      player.switchAnimation('jumpLeft');
    }
  } else if (player.velocity.y > 0) {
    player.shouldMoveCameraDown();

    if (player.lastDirection === 'right') {
      player.switchAnimation('fall');
    } else {
      player.switchAnimation('fallLeft');
    }
  }
}
game();
