import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Environment {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physics = physicsWorld;

    this.setupLighting();
    this.setupFloor();
    this.setupBoundaries();
  }

  setupLighting() {
    // Ambient Light (Soft fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    // Main Directional Sun Light with crisp soft shadows
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.sunLight.position.set(40, 60, 40);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 160;

    const shadowDistance = 75;
    this.sunLight.shadow.camera.left = -shadowDistance;
    this.sunLight.shadow.camera.right = shadowDistance;
    this.sunLight.shadow.camera.top = shadowDistance;
    this.sunLight.shadow.camera.bottom = -shadowDistance;
    this.sunLight.shadow.bias = -0.0005;

    this.scene.add(this.sunLight);

    // Subtle blue rim light from opposite angle
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-35, 30, -35);
    this.scene.add(rimLight);
  }

  setupFloor() {
    const floorSize = 180;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, 64, 64);
    floorGeo.rotateX(-Math.PI / 2);

    // Canvas procedural grid texture for crisp performance
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle grid pattern
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x <= 1024; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Concentric subtle radar circles
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(512, 512, 180, 0, Math.PI * 2);
    ctx.arc(512, 512, 340, 0, Math.PI * 2);
    ctx.arc(512, 512, 480, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);

    const floorMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
      metalness: 0.1
    });

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.position.y = 0;
    this.scene.add(floorMesh);

    // Road markings & tracks
    this.createRoadGuides();
  }

  createRoadGuides() {
    // Add glowing guide tracks connecting the zones
    const trackMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15
    });

    // Ring road around the central plaza
    const ringGeo = new THREE.RingGeometry(18, 22, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, trackMat);
    ring.position.y = 0.02;
    this.scene.add(ring);
  }

  setupBoundaries() {
    const half = 75;
    const wallHeight = 4;
    const wallThickness = 2;

    const walls = [
      { x: 0, z: half, sx: half * 2, sz: wallThickness },
      { x: 0, z: -half, sx: half * 2, sz: wallThickness },
      { x: half, z: 0, sx: wallThickness, sz: half * 2 },
      { x: -half, z: 0, sx: wallThickness, sz: half * 2 }
    ];

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6
    });

    for (const w of walls) {
      // Visual
      const geo = new THREE.BoxGeometry(w.sx, wallHeight, w.sz);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(w.x, wallHeight / 2, w.z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.scene.add(mesh);

      // Physics
      const shape = new CANNON.Box(new CANNON.Vec3(w.sx / 2, wallHeight / 2, w.sz / 2));
      const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        position: new CANNON.Vec3(w.x, wallHeight / 2, w.z)
      });
      body.addShape(shape);
      this.physics.world.addBody(body);
    }
  }

  createRamp(x, y, z, width, length, angle) {
    const rampGroup = new THREE.Group();

    const rampGeo = new THREE.BoxGeometry(width, 0.4, length);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.3,
      roughness: 0.5
    });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    rampMesh.castShadow = true;
    rampMesh.receiveShadow = true;
    rampGroup.add(rampMesh);

    rampGroup.position.set(x, y, z);
    rampGroup.rotation.x = angle;
    this.scene.add(rampGroup);

    // Physics
    const rampShape = new CANNON.Box(new CANNON.Vec3(width / 2, 0.2, length / 2));
    const rampBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x, y, z)
    });
    rampBody.quaternion.setFromEuler(angle, 0, 0);
    rampBody.addShape(rampShape);
    this.physics.world.addBody(rampBody);
  }
}
