import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor(audioManager) {
    this.audio = audioManager;
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82 * 1.5, 0)
    });

    // Broadphase & Solver settings for stability & speed
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.solver.iterations = 10;
    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0.2;

    // Contact Materials
    this.groundMaterial = new CANNON.Material('ground');
    this.wheelMaterial = new CANNON.Material('wheel');
    this.chassisMaterial = new CANNON.Material('chassis');
    this.obstacleMaterial = new CANNON.Material('obstacle');

    // Wheel - Ground contact
    const wheelGroundContact = new CANNON.ContactMaterial(
      this.wheelMaterial,
      this.groundMaterial,
      {
        friction: 0.9,
        restitution: 0.05,
        contactEquationStiffness: 1000
      }
    );
    this.world.addContactMaterial(wheelGroundContact);

    // Chassis - Ground contact
    const chassisGroundContact = new CANNON.ContactMaterial(
      this.chassisMaterial,
      this.groundMaterial,
      {
        friction: 0.2,
        restitution: 0.1
      }
    );
    this.world.addContactMaterial(chassisGroundContact);

    // Obstacle - Wheel contact
    const obstacleContact = new CANNON.ContactMaterial(
      this.chassisMaterial,
      this.obstacleMaterial,
      {
        friction: 0.3,
        restitution: 0.5
      }
    );
    this.world.addContactMaterial(obstacleContact);

    this.dynamicBodies = [];
    this.setupGround();
  }

  setupGround() {
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.groundMaterial
    });
    // Cannon planes face +Z by default, rotate to face +Y
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  }

  registerDynamicBody(mesh, body, onImpact = null) {
    this.world.addBody(body);
    this.dynamicBodies.push({ mesh, body });

    body.addEventListener('collide', (event) => {
      const relativeVelocity = event.contact.getImpactVelocityAlongNormal();
      if (Math.abs(relativeVelocity) > 2) {
        if (this.audio) {
          this.audio.playImpact(Math.abs(relativeVelocity) / 5);
        }
        if (onImpact) {
          onImpact(relativeVelocity);
        }
      }
    });
  }

  step(delta) {
    const timeStep = Math.min(delta, 0.1);
    this.world.step(1 / 60, timeStep, 3);

    for (const item of this.dynamicBodies) {
      item.mesh.position.copy(item.body.position);
      item.mesh.quaternion.copy(item.body.quaternion);
    }
  }
}
