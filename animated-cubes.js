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
  duration: 20,
  playbackRate: 'throttle',
  fps: 30,
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
  renderer.setClearColor('hsl(0, 0%, 95%)', 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const meshes = [];

  for (let i = 0; i < 15; i++) {
    const color = random.pick(palette);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      metalness: 0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshes.push(mesh);

    randomizeMesh(mesh);
    mesh.time = random.range(0, mesh.duration);
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
    render ({ deltaTime }) {
      meshes.forEach(mesh => {
        mesh.time += deltaTime;

        if (mesh.time > mesh.duration) {
          randomizeMesh(mesh);
        }

        const v = ease(mesh.time / mesh.duration);
        const s = Math.max(0.000001, Math.sin(v * Math.PI));

        const frequency = 0.01;
        const noise = random.noise4D(
          mesh.originalPosition.x * frequency,
          mesh.originalPosition.y * frequency,
          mesh.originalPosition.z * frequency,
          mesh.time * 0.5
        ) * 0.5 + 0.5;

        mesh.scale.copy(mesh.originalScale).multiplyScalar(s);

        mesh.scale.x *= noise;
        mesh.position.y += 0.5 * deltaTime;
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

  function randomizeMesh (mesh) {
    mesh.position.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    ).multiplyScalar(0.5);

    mesh.position.y -= 1;

    const squeeze = 0.2;
    mesh.position.x *= squeeze;
    mesh.position.z *= squeeze;


    mesh.scale.set(
      random.range(0.0001, 1) * random.gaussian(),
      random.range(0.0001, 1) * random.gaussian(),
      random.range(0.0001, 1) * random.gaussian()
    );


    mesh.duration = random.range(1, 5);
    mesh.time = 0;

    mesh.material.color.setStyle(random.pick(palette));

    mesh.originalScale = mesh.scale.clone();
    mesh.originalPosition = mesh.position.clone();
  }
};

canvasSketch(sketch, settings);
