const { Engine, Render, World, Bodies, Events, Body } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 1.2;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    background: 'blue',
    wireframes: false,
    hasBounds: true
  }
});
render.canvas.style.backgroundColor = '#00008B';

// SPAWN
const SPAWN = { x: 300, y: 150 };

// MAP
const platforms = [
  Bodies.rectangle(600, window.innerHeight - 20, 1600, 40, { isStatic: true, label: 'ground', render: { fillStyle: '#228B22' } }),
  Bodies.rectangle(300, window.innerHeight - 140, 300, 20, { isStatic: true, label: 'platform', render: { fillStyle: '#2E8B57' } }),
  Bodies.rectangle(700, window.innerHeight - 300, 220, 20, { isStatic: true, label: 'platform', render: { fillStyle: '#2E8B57' } }),
  Bodies.rectangle(1100, window.innerHeight - 220, 300, 20, { isStatic: true, label: 'platform', render: { fillStyle: '#2E8B57' } }),
  Bodies.rectangle(1500, window.innerHeight - 360, 220, 20, { isStatic: true, label: 'platform', render: { fillStyle: '#2E8B57' } }),
  Bodies.rectangle(1800, window.innerHeight - 120, 400, 20, { isStatic: true, label: 'platform', render: { fillStyle: '#2E8B57' } })
];
World.add(engine.world, platforms);

// PLAYER — compound body: torso + feet sensor
const torso = Bodies.rectangle(SPAWN.x, SPAWN.y, 50, 80, { label: 'torso' });
const feet = Bodies.rectangle(SPAWN.x, SPAWN.y + 48, 40, 10, { isSensor: true, label: 'feet' });

const player = Body.create({
  parts: [torso, feet],
  inertia: Infinity, // блокує обертання
  frictionAir: 0.02,
  label: 'player'
});
World.add(engine.world, player);

function updateCamera() {
  const w = render.options.width;
  const h = render.options.height;

  render.bounds.min.x = player.position.x - w / 2;
  render.bounds.max.x = player.position.x + w / 2;
  render.bounds.min.y = player.position.y - h / 2;
  render.bounds.max.y = player.position.y + h / 2;

  Render.lookAt(render, {
    min: { x: render.bounds.min.x, y: render.bounds.min.y },
    max: { x: render.bounds.max.x, y: render.bounds.max.y }
  });
}


// STATE
let canPlayerJump = false;
let isFacingRight = true;
let walkTimer = 0;
const MAX_SPEED = 10;
const ACCEL = 1.2;

// INPUT
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// COLLISIONS
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(pair => {
    if ((pair.bodyA.label === 'feet' && (pair.bodyB.isStatic || pair.bodyB.label === 'platform' || pair.bodyB.label === 'ground')) ||
      (pair.bodyB.label === 'feet' && (pair.bodyA.isStatic || pair.bodyA.label === 'platform' || pair.bodyA.label === 'ground'))) {
      canPlayerJump = true;
    }
  });
});
Events.on(engine, 'collisionEnd', event => {
  event.pairs.forEach(pair => {
    if ((pair.bodyA.label === 'feet' && (pair.bodyB.isStatic || pair.bodyB.label === 'platform' || pair.bodyB.label === 'ground')) ||
      (pair.bodyB.label === 'feet' && (pair.bodyA.isStatic || pair.bodyA.label === 'platform' || pair.bodyA.label === 'ground'))) {
      canPlayerJump = false;
    }
  });
});

// LOAD GLOVE IMAGE
const gloveImg = new Image();
gloveImg.src = '/SlapHand.png';
let gloveLoaded = false;
gloveImg.onload = () => { gloveLoaded = true; };

// RENDER VISUALS
Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  const { x, y } = player.position;

  // анімація ніжок
  if (Math.abs(player.velocity.x) > 0.5 && canPlayerJump) {
    walkTimer += 0.2;
  } else {
    walkTimer = 0;
  }
  const legSwing = Math.sin(walkTimer) * 12;

  ctx.save();
  ctx.translate(x, y);

  // Голова
  ctx.fillStyle = "#FFCC99";
  ctx.beginPath();
  ctx.arc(0, -60, 20, 0, Math.PI * 2);
  ctx.fill();

  // Око
  ctx.fillStyle = "black";
  ctx.beginPath();
  const eyeX = isFacingRight ? 10 : -10;
  ctx.arc(eyeX, -65, 3, 0, Math.PI * 2);
  ctx.fill();

  // Ноги
  ctx.strokeStyle = "#FFCC99";
  ctx.lineWidth = 8;

  ctx.beginPath();
  ctx.moveTo(-10, 30);
  ctx.lineTo((player.velocity.x < -0.1 ? -10 - legSwing : -10), 45);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.lineTo((player.velocity.x > 0.1 ? 10 + legSwing : 10), 45);
  ctx.stroke();

  // Рукавиця
  const gloveOffsetX = 30;
  const gloveOffsetY = -8;
  if (gloveLoaded) {
    ctx.save();
    if (isFacingRight) {
      ctx.translate(gloveOffsetX, gloveOffsetY);
      ctx.drawImage(gloveImg, -gloveImg.width / 2, -gloveImg.height / 2);
    } else {
      ctx.translate(-gloveOffsetX, gloveOffsetY);
      ctx.scale(-1, 1);
      ctx.drawImage(gloveImg, -gloveImg.width / 2, -gloveImg.height / 2);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = '#FFD700';
    if (isFacingRight) ctx.fillRect(gloveOffsetX - 9, gloveOffsetY - 9, 18, 18);
    else ctx.fillRect(-gloveOffsetX - 9, gloveOffsetY - 9, 18, 18);
  }

  ctx.restore();
});

// BEFORE UPDATE
Events.on(engine, 'beforeUpdate', () => {
  // фіксуємо кут (щоб не крутився)
  player.angle = 0;
  Body.setAngularVelocity(player, 0);

  // рух
  let vx = player.velocity.x;
  if (keys['ArrowLeft'] || keys['KeyA']) {
    vx = Math.max(vx - ACCEL, -MAX_SPEED);
    isFacingRight = false;
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    vx = Math.min(vx + ACCEL, MAX_SPEED);
    isFacingRight = true;
  } else {
    vx *= 0.88;
    if (Math.abs(vx) < 0.1) vx = 0;
  }
  Body.setVelocity(player, { x: vx, y: player.velocity.y });

  // стрибок
  if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && canPlayerJump) {
    Body.setVelocity(player, { x: player.velocity.x, y: -12 });
    canPlayerJump = false;
  }

  // респавн
  if (player.position.y > window.innerHeight + 800) {
    Body.setPosition(player, { x: SPAWN.x, y: SPAWN.y });
    Body.setVelocity(player, { x: 0, y: 0 });
  }

  updateCamera()
});

Engine.run(engine);
Render.run(render);
