const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');

// Setup our sketch
const settings = {
  context: 'webgl',
  animate: true
};

// Your glsl code
const frag = require('./circle.frag');

// Your sketch, which simply returns the shader
const sketch = async ({ gl }) => {  
  // Create the shader and return it
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    clearColor: 'white',
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      aspect: ({ width, height}) => {
        return width/height;
      },
      // Expose props from canvas-sketch
      time: ({ time }) => time
    }
  });
};

canvasSketch(sketch, settings);
