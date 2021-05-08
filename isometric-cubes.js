// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');
const bezierEasing = require('bezier-easing');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  dimensions: [ 512, 512 ],
  duration: 10,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  const palette = random.pick(palettes);
  // const bgColor = palette.shift();

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('black', 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const meshes = [];

  for (let i = 0; i < 10; i++) {
    const color = random.pick(palette);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      metalness: 0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshes.push(mesh);

    mesh.position.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    ).multiplyScalar(0.75);

    mesh.scale.set(
      random.range(0.0001, 1) * random.gaussian(),
      random.range(0.0001, 1) * random.gaussian(),
      random.range(0.0001, 1) * random.gaussian()
    );
  }

  const light = new THREE.DirectionalLight('white', 1);
  light.position.set(5, 0, 0);
  scene.add(light);

  const ease = bezierEasing(.15,.5,.85,.5);
  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);

      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 1.75;
      
      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;
      
      // Near/Far
      camera.near = -100;
      camera.far = 100;
      
      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());
      
      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render ({ playhead }) {
      scene.rotation.x = ease(playhead) * Math.PI * 2;

      meshes.forEach(mesh => {
        mesh.rotation.y = ease(playhead) * Math.PI * 2;
      });

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
