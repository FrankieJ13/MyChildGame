const TAU = Math.PI * 2;
const FACE_SIZE = 1;
const CAMERA_DISTANCE = 4.8;
const BASE_SCALE = 34;

const FINAL_ORIENTATIONS = {
  1: { x: -0.55, y: 0.62, z: -0.08 },
  2: { x: Math.PI / 2 - 0.36, y: 0.58, z: -0.06 },
  3: { x: -0.44, y: -Math.PI / 2 + 0.46, z: 0.04 },
  4: { x: -0.44, y: Math.PI / 2 + 0.46, z: -0.05 },
  5: { x: -Math.PI / 2 - 0.34, y: 0.58, z: 0.06 },
  6: { x: -0.5, y: Math.PI + 0.58, z: 0.08 }
};

const FACES = [
  {
    value: 1,
    center: [0, 0, FACE_SIZE],
    u: [FACE_SIZE, 0, 0],
    v: [0, FACE_SIZE, 0],
    normal: [0, 0, 1],
    corners: [
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1]
    ]
  },
  {
    value: 6,
    center: [0, 0, -FACE_SIZE],
    u: [-FACE_SIZE, 0, 0],
    v: [0, FACE_SIZE, 0],
    normal: [0, 0, -1],
    corners: [
      [1, -1, -1],
      [-1, -1, -1],
      [-1, 1, -1],
      [1, 1, -1]
    ]
  },
  {
    value: 3,
    center: [FACE_SIZE, 0, 0],
    u: [0, 0, -FACE_SIZE],
    v: [0, FACE_SIZE, 0],
    normal: [1, 0, 0],
    corners: [
      [1, -1, 1],
      [1, -1, -1],
      [1, 1, -1],
      [1, 1, 1]
    ]
  },
  {
    value: 4,
    center: [-FACE_SIZE, 0, 0],
    u: [0, 0, FACE_SIZE],
    v: [0, FACE_SIZE, 0],
    normal: [-1, 0, 0],
    corners: [
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, 1, 1],
      [-1, 1, -1]
    ]
  },
  {
    value: 5,
    center: [0, -FACE_SIZE, 0],
    u: [FACE_SIZE, 0, 0],
    v: [0, 0, FACE_SIZE],
    normal: [0, -1, 0],
    corners: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, -1, 1],
      [-1, -1, 1]
    ]
  },
  {
    value: 2,
    center: [0, FACE_SIZE, 0],
    u: [FACE_SIZE, 0, 0],
    v: [0, 0, -FACE_SIZE],
    normal: [0, 1, 0],
    corners: [
      [-1, 1, 1],
      [1, 1, 1],
      [1, 1, -1],
      [-1, 1, -1]
    ]
  }
];

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function setDiceValue(canvas, value) {
  if (!canvas) return;
  canvas.dataset.value = String(value);
  drawDice(canvas, FINAL_ORIENTATIONS[value] || FINAL_ORIENTATIONS[1]);
}

export function animateDice(canvas, value) {
  const duration = 2000 + Math.floor(Math.random() * 4001);
  const final = FINAL_ORIENTATIONS[value] || FINAL_ORIENTATIONS[1];
  const start = {
    x: final.x + (5 + Math.random() * 4) * TAU,
    y: final.y + (6 + Math.random() * 5) * TAU,
    z: final.z + (4 + Math.random() * 4) * TAU
  };
  const startedAt = performance.now();
  canvas.dataset.value = String(value);

  return new Promise((resolve) => {
    function frame(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const wobble = Math.sin(progress * Math.PI * 10) * (1 - progress) * 0.22;
      drawDice(canvas, {
        x: mix(start.x, final.x, eased) + wobble,
        y: mix(start.y, final.y, eased) - wobble * 0.7,
        z: mix(start.z, final.z, eased) + wobble * 0.45
      });
      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }
      setDiceValue(canvas, value);
      resolve();
    }
    requestAnimationFrame(frame);
  });
}

function drawDice(canvas, rotation) {
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = rect.width || Number(canvas.getAttribute("width")) || 220;
  const cssHeight = rect.height || Number(canvas.getAttribute("height")) || 190;
  const width = Math.max(1, Math.round(cssWidth * dpr));
  const height = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  drawShadow(ctx, cssWidth, cssHeight);

  const scale = Math.min(BASE_SCALE, cssWidth * 0.31, cssHeight * 0.39);
  const origin = { x: cssWidth / 2, y: cssHeight / 2 - 16 };
  const transformed = FACES.map((face) => transformFace(face, rotation, origin, scale))
    .filter((face) => face.normal[2] > -0.08)
    .sort((a, b) => a.depth - b.depth);

  transformed.forEach((face) => drawFace(ctx, face));
}

function transformFace(face, rotation, origin, scale) {
  const corners = face.corners.map((point) => rotate(point, rotation));
  const center = rotate(face.center, rotation);
  const normal = rotate(face.normal, rotation);
  const u = rotate(face.u, rotation);
  const v = rotate(face.v, rotation);
  return {
    value: face.value,
    center,
    normal,
    u,
    v,
    depth: corners.reduce((sum, point) => sum + point[2], 0) / corners.length,
    corners: corners.map((point) => project(point, origin, scale))
  };
}

function drawShadow(ctx, width, height) {
  const gradient = ctx.createRadialGradient(width / 2, height * 0.75, 6, width / 2, height * 0.75, width * 0.28);
  gradient.addColorStop(0, "rgba(36, 48, 71, 0.28)");
  gradient.addColorStop(1, "rgba(36, 48, 71, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.75, width * 0.25, height * 0.1, 0, 0, TAU);
  ctx.fill();
}

function drawFace(ctx, face) {
  const light = Math.max(0, dot(normalize(face.normal), normalize([-0.4, -0.7, 1])));
  const shade = Math.round(198 + light * 50);
  const points = face.corners;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 10})`;
  ctx.fill();
  ctx.strokeStyle = "rgba(36, 48, 71, 0.22)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const sheen = ctx.createLinearGradient(points[0].x, points[0].y, points[2].x, points[2].y);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.48)");
  sheen.addColorStop(0.48, "rgba(255, 255, 255, 0.08)");
  sheen.addColorStop(1, "rgba(36, 48, 71, 0.1)");
  ctx.fillStyle = sheen;
  ctx.fill();
  drawPips(ctx, face);
}

function drawPips(ctx, face) {
  const positions = pipPositions(face.value);
  positions.forEach(([x, y]) => {
    const point = add(face.center, add(scaleVector(face.u, x), scaleVector(face.v, y)));
    const projected = project(point, { x: ctx.canvas.width / (2 * (window.devicePixelRatio || 1)), y: ctx.canvas.height / (2 * (window.devicePixelRatio || 1)) - 16 }, Math.min(BASE_SCALE, ctx.canvas.width / (window.devicePixelRatio || 1) * 0.31, ctx.canvas.height / (window.devicePixelRatio || 1) * 0.39));
    const radius = Math.max(3.8, projected.factor * 4.8);
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, radius, 0, TAU);
    ctx.fillStyle = "#263044";
    ctx.fill();
  });
}

function pipPositions(value) {
  const a = 0.45;
  const b = 0;
  const positions = {
    1: [[b, b]],
    2: [[-a, -a], [a, a]],
    3: [[-a, -a], [b, b], [a, a]],
    4: [[-a, -a], [a, -a], [-a, a], [a, a]],
    5: [[-a, -a], [a, -a], [b, b], [-a, a], [a, a]],
    6: [[-a, -0.52], [a, -0.52], [-a, b], [a, b], [-a, 0.52], [a, 0.52]]
  };
  return positions[value] || positions[1];
}

function rotate([x, y, z], { x: rx, y: ry, z: rz }) {
  let ny = y * Math.cos(rx) - z * Math.sin(rx);
  let nz = y * Math.sin(rx) + z * Math.cos(rx);
  y = ny;
  z = nz;

  let nx = x * Math.cos(ry) + z * Math.sin(ry);
  nz = -x * Math.sin(ry) + z * Math.cos(ry);
  x = nx;
  z = nz;

  nx = x * Math.cos(rz) - y * Math.sin(rz);
  ny = x * Math.sin(rz) + y * Math.cos(rz);
  return [nx, ny, z];
}

function project([x, y, z], origin, scale) {
  const factor = CAMERA_DISTANCE / (CAMERA_DISTANCE - z);
  return {
    x: origin.x + x * scale * factor,
    y: origin.y + y * scale * factor,
    factor
  };
}

function mix(from, to, amount) {
  return from + (to - from) * amount;
}

function add([ax, ay, az], [bx, by, bz]) {
  return [ax + bx, ay + by, az + bz];
}

function scaleVector([x, y, z], scale) {
  return [x * scale, y * scale, z * scale];
}

function dot([ax, ay, az], [bx, by, bz]) {
  return ax * bx + ay * by + az * bz;
}

function normalize([x, y, z]) {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}
