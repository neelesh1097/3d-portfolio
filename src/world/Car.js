import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Car {
  constructor(scene, physicsWorld, audioManager) {
    this.scene = scene;
    this.physics = physicsWorld;
    this.audio = audioManager;

    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false
    };

    this.currentSteer = 0;
    this.maxSteerVal = 0.55;
    this.maxEngineForce = 1200;
    this.maxBrakeForce = 60;
    this.speed = 0;

    this.createCar();
    this.setupParticles();
    this.setupKeyboardListeners();
  }

  createCar() {
    // 1. Physical Chassis
    const chassisWidth = 1.4;
    const chassisHeight = 0.5;
    const chassisLength = 2.4;
    const chassisMass = 250;

    const chassisShape = new CANNON.Box(
      new CANNON.Vec3(chassisWidth / 2, chassisHeight / 2, chassisLength / 2)
    );
    this.chassisBody = new CANNON.Body({
      mass: chassisMass,
      material: this.physics.chassisMaterial,
      position: new CANNON.Vec3(0, 1.2, 0)
    });
    this.chassisBody.addShape(chassisShape);
    this.physics.world.addBody(this.chassisBody);

    // 2. Visual Car Mesh (Procedural, stylized sports buggy)
    this.carGroup = new THREE.Group();

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Royal Blue
      roughness: 0.2,
      metalness: 0.6
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.carGroup.add(bodyMesh);

    // Cabin / Windshield
    const cabinGeo = new THREE.BoxGeometry(chassisWidth * 0.85, 0.45, chassisLength * 0.55);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark tinted glass
      roughness: 0.1,
      metalness: 0.9
    });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0, chassisHeight / 2 + 0.22, -0.15);
    cabinMesh.castShadow = true;
    this.carGroup.add(cabinMesh);

    // Spoiler / Wing
    const wingSupportGeo = new THREE.BoxGeometry(0.1, 0.25, 0.1);
    const wingSupportMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const wingLeft = new THREE.Mesh(wingSupportGeo, wingSupportMat);
    wingLeft.position.set(-0.45, 0.35, 1.05);
    const wingRight = wingLeft.clone();
    wingRight.position.x = 0.45;
    this.carGroup.add(wingLeft, wingRight);

    const wingBladeGeo = new THREE.BoxGeometry(1.4, 0.06, 0.3);
    const wingBladeMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const wingBlade = new THREE.Mesh(wingBladeGeo, wingBladeMat);
    wingBlade.position.set(0, 0.5, 1.05);
    wingBlade.rotation.x = -0.1;
    wingBlade.castShadow = true;
    this.carGroup.add(wingBlade);

    // Headlights (Glowing Neon White/Cyan)
    const lightGeo = new THREE.BoxGeometry(0.28, 0.1, 0.05);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 2
    });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.position.set(-0.42, 0.05, -1.21);
    const rightLight = leftLight.clone();
    rightLight.position.x = 0.42;
    this.carGroup.add(leftLight, rightLight);

    // Tail lights (Glowing Red)
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.5
    });
    const leftTail = new THREE.Mesh(lightGeo, tailMat);
    leftTail.position.set(-0.42, 0.08, 1.21);
    const rightTail = leftTail.clone();
    rightTail.position.x = 0.42;
    this.carGroup.add(leftTail, rightTail);

    this.scene.add(this.carGroup);

    // 3. Raycast Vehicle Setup
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2
    });

    const wheelRadius = 0.38;
    const wheelHalfWidth = 0.16;
    const suspensionStiffness = 35;
    const suspensionRestLength = 0.35;
    const frictionSlip = 2.5;
    const dampingRelaxation = 2.5;
    const dampingCompression = 4.0;
    const rollInfluence = 0.1;

    const wheelOptions = {
      radius: wheelRadius,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness,
      suspensionRestLength,
      frictionSlip,
      dampingRelaxation,
      dampingCompression,
      maxSuspensionForce: 100000,
      rollInfluence,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true
    };

    // Front Left
    wheelOptions.chassisConnectionPointLocal.set(-0.75, 0, -0.85);
    this.vehicle.addWheel(wheelOptions);

    // Front Right
    wheelOptions.chassisConnectionPointLocal.set(0.75, 0, -0.85);
    this.vehicle.addWheel(wheelOptions);

    // Back Left
    wheelOptions.chassisConnectionPointLocal.set(-0.75, 0, 0.85);
    this.vehicle.addWheel(wheelOptions);

    // Back Right
    wheelOptions.chassisConnectionPointLocal.set(0.75, 0, 0.85);
    this.vehicle.addWheel(wheelOptions);

    this.vehicle.addToWorld(this.physics.world);

    // 4. Visual Wheels
    this.wheelMeshes = [];
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelHalfWidth * 2, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2
    });

    for (let i = 0; i < 4; i++) {
      const wheelMeshGroup = new THREE.Group();
      const tireMesh = new THREE.Mesh(wheelGeo, tireMat);
      tireMesh.castShadow = true;

      // Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelHalfWidth * 2.05, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      wheelMeshGroup.add(tireMesh, rimMesh);

      this.scene.add(wheelMeshGroup);
      this.wheelMeshes.push(wheelMeshGroup);
    }
  }

  setupParticles() {
    // Particle system for tire smoke and acceleration dust
    this.particleCount = 60;
    this.particles = [];
    const pGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.5
    });

    this.particleGroup = new THREE.Group();
    for (let i = 0; i < this.particleCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat.clone());
      p.visible = false;
      this.particleGroup.add(p);
      this.particles.push({
        mesh: p,
        lifetime: 0,
        maxLife: 0.6,
        velocity: new THREE.Vector3()
      });
    }
    this.scene.add(this.particleGroup);
    this.particleIndex = 0;
  }

  emitDust() {
    const p = this.particles[this.particleIndex];
    this.particleIndex = (this.particleIndex + 1) % this.particleCount;

    const carPos = this.carGroup.position;
    // Emit behind the rear wheels
    const offset = new THREE.Vector3((Math.random() - 0.5) * 1.2, -0.2, 1.2);
    offset.applyQuaternion(this.carGroup.quaternion);

    p.mesh.position.copy(carPos).add(offset);
    p.mesh.scale.setScalar(0.4 + Math.random() * 0.5);
    p.mesh.visible = true;
    p.mesh.material.opacity = 0.45;
    p.lifetime = 0;
    p.velocity.set(
      (Math.random() - 0.5) * 0.8,
      0.5 + Math.random() * 0.5,
      (Math.random() - 0.5) * 0.8
    );
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.inputs.forward = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.inputs.backward = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.inputs.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.inputs.right = true;
      if (['Space'].includes(e.code)) this.inputs.brake = true;
      if (['KeyR'].includes(e.code)) this.resetCar();
      if (['KeyH'].includes(e.code)) {
        if (this.audio) this.audio.playHorn();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.inputs.forward = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.inputs.backward = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.inputs.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.inputs.right = false;
      if (['Space'].includes(e.code)) this.inputs.brake = false;
    });
  }

  resetCar(targetPos = null) {
    const spawnPos = targetPos || new CANNON.Vec3(0, 1.5, 0);
    this.chassisBody.position.copy(spawnPos);
    this.chassisBody.velocity.set(0, 0, 0);
    this.chassisBody.angularVelocity.set(0, 0, 0);
    this.chassisBody.quaternion.setFromEuler(0, 0, 0);
    if (this.audio) this.audio.playChime();
  }

  update(delta) {
    // 1. Steering with smooth interpolation
    let targetSteer = 0;
    if (this.inputs.left) targetSteer += this.maxSteerVal;
    if (this.inputs.right) targetSteer -= this.maxSteerVal;
    this.currentSteer += (targetSteer - this.currentSteer) * Math.min(delta * 12, 1);

    this.vehicle.setSteeringValue(this.currentSteer, 0);
    this.vehicle.setSteeringValue(this.currentSteer, 1);

    // 2. Engine Force & Braking
    let engineForce = 0;
    if (this.inputs.forward) engineForce = -this.maxEngineForce;
    if (this.inputs.backward) engineForce = this.maxEngineForce * 0.6;

    // Apply 4-wheel drive for punchy, responsive arcade control
    this.vehicle.applyEngineForce(engineForce, 0);
    this.vehicle.applyEngineForce(engineForce, 1);
    this.vehicle.applyEngineForce(engineForce, 2);
    this.vehicle.applyEngineForce(engineForce, 3);

    const brakeForce = this.inputs.brake ? this.maxBrakeForce : 0;
    for (let i = 0; i < 4; i++) {
      this.vehicle.setBrake(brakeForce, i);
    }

    // 3. Sync Visual meshes with Physics bodies
    this.carGroup.position.copy(this.chassisBody.position);
    this.carGroup.quaternion.copy(this.chassisBody.quaternion);

    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
      const t = this.vehicle.wheelInfos[i].worldTransform;
      this.wheelMeshes[i].position.copy(t.position);
      this.wheelMeshes[i].quaternion.copy(t.quaternion);
    }

    // 4. Calculate Speed & update audio/particles
    const vel = this.chassisBody.velocity;
    this.speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);

    if (this.audio) {
      this.audio.updateEngine(this.speed, this.inputs.forward || this.inputs.backward);
    }

    if ((this.inputs.forward || this.inputs.backward) && this.speed > 2) {
      this.emitDust();
    }

    // Update particles
    for (const p of this.particles) {
      if (p.mesh.visible) {
        p.lifetime += delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        p.mesh.scale.multiplyScalar(1 + delta * 1.5);
        p.mesh.material.opacity = (1 - p.lifetime / p.maxLife) * 0.45;
        if (p.lifetime >= p.maxLife) {
          p.mesh.visible = false;
        }
      }
    }
  }
}
