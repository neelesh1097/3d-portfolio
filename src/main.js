import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { AudioManager } from './world/AudioManager.js';
import { PhysicsWorld } from './world/PhysicsWorld.js';
import { Environment } from './world/Environment.js';
import { Car } from './world/Car.js';
import { Zones } from './world/Zones.js';
import { HUD } from './ui/HUD.js';

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f19);
    this.scene.fog = new THREE.FogExp2(0x0b0f19, 0.012);

    this.clock = new THREE.Clock();
    this.audioManager = new AudioManager();

    this.setupCamera();
    this.setupRenderer();
    this.setupWorld();
    this.setupHUD();
    this.setupEvents();

    this.animate();
  }

  setupCamera() {
    // Isometric-angled perspective camera
    this.camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    this.cameraOffset = new THREE.Vector3(0, 24, 26);
    this.camera.position.set(0, 45, 50);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
  }

  setupWorld() {
    this.physics = new PhysicsWorld(this.audioManager);
    this.environment = new Environment(this.scene, this.physics);

    // Add fun jump ramps in open spaces
    this.environment.createRamp(-18, 0.6, -12, 6, 8, -0.22);
    this.environment.createRamp(18, 0.6, 12, 6, 8, 0.22);

    this.car = new Car(this.scene, this.physics, this.audioManager);

    this.zones = new Zones(
      this.scene,
      this.physics,
      this.audioManager,
      (activeTrigger) => {
        this.hud.setActiveTrigger(activeTrigger);
      }
    );
  }

  setupHUD() {
    this.hud = new HUD(
      // onNavClick
      (zone) => this.navigateToZone(zone),
      // onResetCar
      () => this.car.resetCar(),
      // onToggleMute
      () => this.audioManager.toggleMute(),
      // onHonk
      () => this.audioManager.playHorn()
    );
  }

  navigateToZone(zone) {
    const coords = {
      spawn: new CANNON.Vec3(0, 1.5, 0),
      projects: new CANNON.Vec3(-35, 1.5, -24),
      experience: new CANNON.Vec3(35, 1.5, -45),
      skills: new CANNON.Vec3(-35, 1.5, 18),
      contact: new CANNON.Vec3(35, 1.5, 20)
    };

    if (coords[zone]) {
      this.car.resetCar(coords[zone]);
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Initialize audio on user interaction
    const initAudio = () => {
      this.audioManager.init();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    window.addEventListener('touchstart', initAudio);
  }

  updateCamera(delta) {
    const carPos = this.car.carGroup.position;

    // Desired camera position follows the car with smooth spring lerp
    const desiredCamPos = new THREE.Vector3(
      carPos.x + this.cameraOffset.x,
      carPos.y + this.cameraOffset.y,
      carPos.z + this.cameraOffset.z
    );

    this.camera.position.lerp(desiredCamPos, Math.min(delta * 4.5, 1));

    // Desired camera look target smoothly tracks slightly above the car
    const desiredTarget = new THREE.Vector3(carPos.x, carPos.y + 0.8, carPos.z);
    this.cameraTarget.lerp(desiredTarget, Math.min(delta * 5.5, 1));
    this.camera.lookAt(this.cameraTarget);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Physics
    this.physics.step(delta);

    // 2. Update Car
    this.car.update(delta);

    // 3. Update Zones & Proximity
    this.zones.update(delta, this.car.carGroup.position);

    // 4. Update Camera
    this.updateCamera(delta);

    // 5. Update Speedometer
    this.hud.updateSpeed(this.car.speed);

    // 6. Render
    this.renderer.render(this.scene, this.camera);
  }
}

new App();
