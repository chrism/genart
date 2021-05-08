const canvasSketch = require('canvas-sketch');
const load = require('load-asset');

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const glsl = require('glslify');

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = async ({ context }) => {
  const image = await load('baboon.jpg');
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera);

  // Setup your scene
  const scene = new THREE.Scene();

  const texture = new THREE.Texture(image);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 100, 100),
    new THREE.ShaderMaterial({
      uniforms: {
        image: { value: texture },
        time: { value: 0 }
      },
      fragmentShader: glsl(`
        #pragma glslify: noise = require('glsl-noise/simplex/3d');
        varying vec2 vUv;
        uniform float time;
        uniform sampler2D image;

        // void main () {
        //   gl_FragColor = vec4(texture2D(image, vUv).rgb, 1.0);
        // }
        void main () {
          vec3 color = vec3(0.0);
          float offset = noise(vec3(vUv, time));
          color += texture2D(image, vUv + offset * 5.0).r;
          gl_FragColor = vec4(color, 1.0);
        }
      `),
      vertexShader: glsl(`
        #pragma glslify: noise = require('glsl-noise/simplex/4d');
        uniform float time;
        varying vec2 vUv;
        void main () {
          vec3 transformed = position.xyz + normal * noise(vec4(position.xyz * 0.5, time * 0.5));
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.0);
        }
      `)
    })
  );
  scene.add(mesh);

  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#59314f'));

  // Add some light
  const light = new THREE.PointLight('#45caf7', 1, 15.5);
  light.position.set(2, 2, -4).multiplyScalar(1.5);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render ({ time }) {
      mesh.rotation.y = time * (10 * Math.PI / 180);
      mesh.material.uniforms.time.value = time;
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
