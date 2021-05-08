const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: 'A3',
  orientation: 'landscape',
  scaleToView: true,
  pixelsPerInch: 300,
  units: 'cm',
  suffix: random.getSeed()
};

const sketch = ({ width, height }) => {
  const palette = random.pick(palettes);
  const background = palette.shift();
  
  const margin = 0.1 * width;

  const createGrid = (count = 6) => {
    const points = [];
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        points.push([u, v]);
      }
    }
    return points;
  };

  const createPolygons = (grid) => {
    const polygonsArray = [];
    let shuffled = random.shuffle(grid);

    for(i = 0; i < shuffled.length - 1; i++) {
      const a = [shuffled[i][0], shuffled[i][1]];
      const b = [shuffled[i + 1][0], shuffled[i + 1][1]];
      const c = [shuffled[i + 1][0], 1];
      const d = [shuffled[i][0], 1];

      const points = [a, b, c, d];
      const color = random.pick(palette);

      polygonsArray.push({
        points,
        color
      });
    }
    return polygonsArray;
  };

  const grid = createGrid();
  const polygons = createPolygons(grid);
  const sortedPolygons = polygons.sort(highestFirst);
  const filteredPolygons = sortedPolygons.filter(polygon => {
    return polygon.points[0][0] != polygon.points[1][0] && polygon.points[0][1] != polygon.points[1][1];
  });

  return ({ context, width, height }) => {
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    filteredPolygons.forEach(polygon => {
      const { points } = polygon;     
      context.save();
      context.beginPath();
      context.moveTo(withMargins(points[0])[0], withMargins(points[0])[1]);
      context.lineTo(withMargins(points[1])[0], withMargins(points[1])[1]);
      context.lineTo(withMargins(points[2])[0], withMargins(points[2])[1]);
      context.lineTo(withMargins(points[3])[0], withMargins(points[3])[1]);
      context.closePath();
      context.fillStyle = polygon.color;
      context.fill();
      context.strokeStyle = 'white';
      context.lineWidth = width * 0.02;
      context.stroke(); 
      context.restore();     
    });
  };

  function withMargins (point) {
    const x = lerp(margin, width - margin, point[0]);
    const y = lerp(margin, height - margin, point[1]);

    return [x, y];
  };

  function highestFirst(a,b) {
    const aHigh = Math.max(a.points[0][1], a.points[1][1]);
    const bHigh = Math.max(b.points[0][1], b.points[1][1]);

    if (aHigh > bHigh)
      return 1;
    if (aHigh < bHigh)
      return -1;
    return 0;
  }
};

canvasSketch(sketch, settings);
