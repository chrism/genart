const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

random.setSeed(random.getRandomSeed());

const settings = {
  // twitter/insta 2048, 2048
  suffix: random.getSeed(),
  dimensions: [ 512, 512 ]
};

const sketch = () => {
  const createGrid = (count = 30) => {
    const points = [];
    for (let x = 0; x < count; x ++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);

        points.push([ u, v ]);
      }
    }
    return points;
  };

  const grid = createGrid().filter(() => random.chance(0.25));

  return ({ context, width, height }) => {
    context.fillStyle = '#5cedc6';
    context.fillRect(0, 0, width, height);

    const margin = 0.2 * width;
    grid.forEach(point => {
      const [ u, v ] = point;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);
  
      context.beginPath();
      context.arc(x, y, 2, 0, Math.PI * 2);
      context.lineWidth = 4;
      context.strokeStyle = 'white';
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
