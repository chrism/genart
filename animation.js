const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const { vec2 } = require('gl-matrix');
const palettes = require('nice-color-palettes');
const eases = require('eases');
const bezierEasing = require('bezier-easing');


const settings = {
  animate: true,
  duration: 5,
  fps: 24,
  playbackRate: 'throttle',
  dimensions: [ 512, 512 ]
};

const sketch = () => {
  const palette = random.pick(palettes);

  const createGrid = (count = 20) => {
    const points = [];
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        points.push({
          position: [u, v],
          color: random.pick(palette),
        });
      }
    }
    return points;
  };

  const grid = createGrid();
  const ease = bezierEasing(.16,.71,.84,.24);

  return ({ context, width, height, time, playhead }) => {
    const v = Math.sin(time) * 0.5 + 0.5;
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const margin = 0.1 * width;
    
    grid.forEach(({ position, color }) => {
      const [ u, v ] = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      const frequency = 0.4;

      const noise = loopNoise(u * frequency, v * frequency, ease(playhead), 1);
      const angle = noise * Math.PI * 2;
      const normal = [ Math.cos(angle), Math.sin(angle) ];
      const r = 10;

      const a = vec2.scaleAndAdd([ 0, 0 ], [ x, y ], normal, r);
      const b = vec2.scaleAndAdd([ 0, 0 ], [ x, y ], normal, -r);

      context.beginPath();
      [ a, b ].forEach(point => {
        context.lineTo(point[0], point[1]);
      });
      context.lineWidth = Math.max(0.0001, noise * 0.5 + 0.5) * 25;
      context.strokeStyle = color;
      context.stroke();
    });
  };

  function loopNoise (x, y, t, scale = 1) {
    const duration = scale;
    const current = t * scale;
    return ((duration - current) * random.noise3D(x, y, current) + current * random.noise3D(x, y, current - duration)) / duration;
  }
};

canvasSketch(sketch, settings);
