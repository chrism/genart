const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

random.setSeed(random.getRandomSeed());

// use string value for seed
// random.setSeed('313396');

// space grotesk

const settings = {
  // twitter/insta 2048, 2048
  suffix: random.getSeed(),
  // dimensions: [ 512, 512 ]
  dimensions: 'A4',
  pixelsPerInch: 300,
  units: 'cm'
};

// be aware for changing browser width/height
const sketch = ({ width, height }) => {
  const palette = random.pick(palettes);
  const aspect = width / height;

  const characters = ['‑', '—'];
  
  const createGrid = (count = 70) => {
    const points = [];
    const frequency = random.range(0.4, 1.2);

    for (let x = 0; x < count; x ++) {
      for (let y = 0; y < count; y++) {
        let u = count <= 1 ? 0.5 : x / (count - 1);
        let v = count <= 1 ? 0.5 : y / (count - 1);

        const offset = random.insideCircle(0.005 * width);

        u += offset[0];
        v += offset[1];

        const noise = random.noise2D((u * aspect) * frequency, v * frequency);

        points.push({
          color: random.pick(palette),
          rotation: noise * Math.PI * 0.5,
          radius: Math.abs(noise * 60) * width * 0.004,
          position: [ u, v ],
          character: random.pick(characters)
        });
      }
    }
    return points;
  };

  const grid = createGrid().filter(() => random.chance(0.25));

  return ({ context, width, height }) => {
    // Always reset values to initial state
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.fillStyle = 'hsl(0, 0%, 95%)';
    context.fillRect(0, 0, width, height);

    const margin = 0.2 * width;
    grid.forEach(({ position, radius, color, rotation, character }) => {
      const [ u, v ] = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.save();
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `${radius}px "Arial"`;
      context.translate(x, y);
      context.rotate(rotation);
      context.globalCompositeOperation = 'mulitply';
      context.globalAlpha = 1;
      context.fillText(character, 0, 0);
      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
