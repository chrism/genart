const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

random.setSeed(random.getRandomSeed());

// use string value for seed
// random.setSeed('313396');

const settings = {
  // twitter/insta 2048, 2048
  suffix: random.getSeed(),
  dimensions: [ 512, 512 ]
};

const sketch = () => {
  const palette = random.pick(palettes);
  const background = palette.shift();
  
  const createGrid = (count = 30) => {
    const points = [];
    for (let x = 0; x < count; x ++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);

        points.push({
          color: random.pick(palette),
          radius: Math.max(0, random.gaussian(3, 12)),
          position: [ u, v ]
        });
      }
    }
    return points;
  };

  const grid = createGrid().filter(() => random.chance(0.25));

  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const margin = 0.2 * width;
    grid.forEach(({ position, radius, color }) => {
      const [ u, v ] = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);
  
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
