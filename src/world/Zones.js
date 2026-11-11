import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { resumeData } from '../data/resumeData.js';

export class Zones {
  constructor(scene, physicsWorld, audioManager, onTriggerZone) {
    this.scene = scene;
    this.physics = physicsWorld;
    this.audio = audioManager;
    this.onTriggerZone = onTriggerZone;

    this.interactiveTriggers = [];
    this.animatedObjects = [];

    this.createSpawnPlaza();
    this.createProjectsZone();
    this.createExperienceZone();
    this.createSkillsArcade();
    this.createContactZone();
  }

  // 1. Central Spawn Plaza
  createSpawnPlaza() {
    // Floor name badge using high-res canvas
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.roundRect(100, 100, 1848, 824, 60);
    ctx.fill();

    ctx.lineWidth = 14;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Text: NEELESH YADAV
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 150px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEELESH YADAV', 1024, 400);

    // Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('FULL-STACK SOFTWARE DEVELOPER & AI SPECIALIST', 1024, 530);

    // Minor badge
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Next.js • TypeScript • Node.js • PostgreSQL • WebRTC', 1024, 650);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('✦ DRIVE TO EXPLORE MY WORK ✦', 1024, 780);

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(24, 12);
    planeGeo.rotateX(-Math.PI / 2);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95
    });

    const floorSign = new THREE.Mesh(planeGeo, planeMat);
    floorSign.position.set(0, 0.05, -3);
    this.scene.add(floorSign);

    // Directional arrows pointing to zones
    this.createDirectionPillar(-12, 0, -10, 'PROJECTS ➔', 0x3b82f6);
    this.createDirectionPillar(12, 0, -10, 'EXPERIENCE ➔', 0x10b981);
    this.createDirectionPillar(-12, 0, 10, 'SKILLS ARCADE ➔', 0x8b5cf6);
    this.createDirectionPillar(12, 0, 10, 'CONTACT ➔', 0xf59e0b);
  }

  createDirectionPillar(x, y, z, text, color) {
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3, 16);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, y + 1.5, z);
    post.castShadow = true;
    this.scene.add(post);

    // Signboard
    const signGeo = new THREE.BoxGeometry(4.5, 0.9, 0.15);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y + 2.7, z);
    sign.castShadow = true;
    this.scene.add(sign);

    // Text on sign
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    const textMat = new THREE.MeshBasicMaterial({ map: tex });
    const textFace = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.8), textMat);
    textFace.position.set(x, y + 2.7, z + 0.08);
    this.scene.add(textFace);

    // Physical post collider
    const postShape = new CANNON.Cylinder(0.2, 0.2, 3, 8);
    const postBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x, y + 1.5, z)
    });
    postBody.addShape(postShape);
    this.physics.world.addBody(postBody);
  }

  // 2. Projects Zone
  createProjectsZone() {
    const baseZ = -36;
    const startX = -45;
    const spacingX = 14;

    // Projects Header
    this.createZoneBillboard(-24, 0, -50, "FEATURED PROJECTS", "Drive close to inspect & interact", 0x3b82f6);

    resumeData.projects.forEach((proj, index) => {
      const posX = startX + index * spacingX;
      const posZ = baseZ + (index % 2 === 0 ? 0 : 5);

      this.createProjectKiosk(posX, posZ, proj);
    });
  }

  createProjectKiosk(x, z, project) {
    const group = new THREE.Group();

    // 1. Glowing Floor Ring (Trigger Zone)
    const ringGeo = new THREE.RingGeometry(2.8, 3.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: project.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, 0.04, z);
    this.scene.add(ring);

    // 2. Center Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.6, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 0.3, z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);

    // 3. Floating Hologram Monitor
    const monitorGroup = new THREE.Group();
    const monitorGeo = new THREE.BoxGeometry(3.2, 2.0, 0.15);
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.7
    });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.castShadow = true;
    monitorGroup.add(monitor);

    // Canvas texture for screen
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 320);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 320);

    // Accent line
    ctx.fillStyle = '#' + project.color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 512, 12);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(project.title, 24, 60);

    // Category
    ctx.fillStyle = '#' + project.color.toString(16).padStart(6, '0');
    ctx.font = '600 22px sans-serif';
    ctx.fillText(project.category.toUpperCase(), 24, 95);

    // Tech stack chips
    ctx.font = '500 20px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(project.tech.slice(0, 3).join(' • '), 24, 140);

    // Action button
    ctx.fillStyle = '#' + project.color.toString(16).padStart(6, '0');
    ctx.roundRect(24, 210, 260, 55, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('PRESS [SPACE] TO OPEN', 42, 246);

    const screenTex = new THREE.CanvasTexture(canvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.8), screenMat);
    screenMesh.position.z = 0.085;
    monitorGroup.add(screenMesh);

    monitorGroup.position.set(x, 2.6, z);
    this.scene.add(monitorGroup);

    // Add to animated objects (gentle bobbing & rotation)
    this.animatedObjects.push({
      mesh: monitorGroup,
      baseY: 2.6,
      speed: 1.5 + Math.random(),
      rotSpeed: 0.3
    });

    // 4. Physical Collider for Pedestal
    const baseShape = new CANNON.Cylinder(1.8, 1.8, 0.8, 12);
    const baseBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x, 0.4, z)
    });
    baseBody.addShape(baseShape);
    this.physics.world.addBody(baseBody);

    // 5. Interactive Trigger
    this.interactiveTriggers.push({
      id: project.id,
      type: 'project',
      data: project,
      position: new THREE.Vector3(x, 0, z),
      radius: 4.2,
      ringMesh: ring
    });
  }

  // 3. Experience Runway
  createExperienceZone() {
    this.createZoneBillboard(35, 0, -50, "CAREER & EXPERIENCE", "Drive through milestone gates", 0x10b981);

    const gates = [
      {
        x: 35,
        z: -38,
        data: resumeData.experience[0], // TRPW
        color: 0x10b981
      },
      {
        x: 35,
        z: -26,
        data: resumeData.experience[1], // Univest
        color: 0x3b82f6
      },
      {
        x: 35,
        z: -14,
        data: resumeData.experience[2], // Phoenix Labs
        color: 0xa855f7
      }
    ];

    gates.forEach((gate, idx) => {
      this.createMilestoneGate(gate.x, gate.z, gate.data, gate.color, idx + 1);
    });
  }

  createMilestoneGate(x, z, exp, color, index) {
    const gateGroup = new THREE.Group();

    // Two vertical posts
    const postGeo = new THREE.BoxGeometry(0.8, 5.5, 0.8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });

    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-3.5, 2.75, 0);
    leftPost.castShadow = true;

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(3.5, 2.75, 0);
    rightPost.castShadow = true;

    // Crossbar arch
    const archGeo = new THREE.BoxGeometry(8.2, 1.4, 1.2);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3
    });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 5.2, 0);
    arch.castShadow = true;

    gateGroup.add(leftPost, rightPost, arch);

    // Gate Sign
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 1024, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(exp.company, 512, 90);

    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = '600 38px sans-serif';
    ctx.fillText(`${exp.role} • ${exp.period}`, 512, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 32px sans-serif';
    ctx.fillText(`${exp.location} (${exp.type})`, 512, 220);

    const signTex = new THREE.CanvasTexture(canvas);
    const signPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(7.8, 1.2),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signPlane.position.set(0, 5.2, 0.62);
    gateGroup.add(signPlane);

    gateGroup.position.set(x, 0, z);
    this.scene.add(gateGroup);

    // Physical colliders for left and right posts (open in middle to drive through!)
    const leftShape = new CANNON.Box(new CANNON.Vec3(0.4, 2.75, 0.4));
    const leftBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x - 3.5, 2.75, z)
    });
    leftBody.addShape(leftShape);
    this.physics.world.addBody(leftBody);

    const rightBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x + 3.5, 2.75, z)
    });
    rightBody.addShape(leftShape);
    this.physics.world.addBody(rightBody);

    // Trigger zone in the middle of the arch
    this.interactiveTriggers.push({
      id: `exp-${index}`,
      type: 'experience',
      data: exp,
      position: new THREE.Vector3(x, 0, z),
      radius: 3.5
    });
  }

  // 4. Skills Arcade & Interactive Playground
  createSkillsArcade() {
    this.createZoneBillboard(-35, 0, 15, "SKILLS ARCADE", "Crash into pins & test physics!", 0x8b5cf6);

    // Interactive Bowling Pins (Dynamic Physics)
    this.createBowlingAlley(-35, 30);

    // 3D Skill Orbs / Medallions
    const skillsList = [
      { name: "React.js", color: 0x61dafb },
      { name: "Next.js", color: 0xffffff },
      { name: "TypeScript", color: 0x3178c6 },
      { name: "Node.js", color: 0x22c55e },
      { name: "PostgreSQL", color: 0x336791 },
      { name: "Java & AI", color: 0xf59e0b }
    ];

    skillsList.forEach((skill, i) => {
      const angle = (i / skillsList.length) * Math.PI * 2;
      const r = 9;
      const sx = -35 + Math.cos(angle) * r;
      const sz = 30 + Math.sin(angle) * r;

      this.createSkillPedestal(sx, sz, skill.name, skill.color);
    });
  }

  createBowlingAlley(centerX, centerZ) {
    const pinRadius = 0.35;
    const pinHeight = 1.2;
    const pinMass = 8;

    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
    });

    const rows = [
      [{ x: 0, z: 0 }],
      [{ x: -0.7, z: 1.2 }, { x: 0.7, z: 1.2 }],
      [{ x: -1.4, z: 2.4 }, { x: 0, z: 2.4 }, { x: 1.4, z: 2.4 }]
    ];

    rows.forEach((row) => {
      row.forEach((pos) => {
        const pinMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(pinRadius * 0.7, pinRadius, pinHeight, 16),
          pinMat
        );
        pinMesh.castShadow = true;
        pinMesh.receiveShadow = true;
        this.scene.add(pinMesh);

        // Physics Body
        const pinShape = new CANNON.Cylinder(pinRadius * 0.7, pinRadius, pinHeight, 10);
        const pinBody = new CANNON.Body({
          mass: pinMass,
          material: this.physics.obstacleMaterial,
          position: new CANNON.Vec3(centerX + pos.x, pinHeight / 2 + 0.1, centerZ + pos.z)
        });
        pinBody.addShape(pinShape);

        this.physics.registerDynamicBody(pinMesh, pinBody);
      });
    });
  }

  createSkillPedestal(x, z, name, color) {
    // Pedestal
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.0, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    baseMesh.position.set(x, 0.25, z);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.scene.add(baseMesh);

    // Floating Octahedron Badge
    const badgeGeo = new THREE.OctahedronGeometry(0.85);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.7,
      emissive: color,
      emissiveIntensity: 0.3
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(x, 2.0, z);
    badge.castShadow = true;
    this.scene.add(badge);

    // Floating text label
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(4, 4, 248, 72, 12);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 40);

    const tex = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.6),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    label.position.set(x, 3.2, z);
    this.scene.add(label);

    this.animatedObjects.push({
      mesh: badge,
      baseY: 2.0,
      speed: 2 + Math.random(),
      rotSpeed: 0.8
    });

    // Physics
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x, 0.25, z)
    });
    body.addShape(new CANNON.Cylinder(1.0, 1.0, 0.5, 8));
    this.physics.world.addBody(body);
  }

  // 5. Contact & Socials Zone
  createContactZone() {
    this.createZoneBillboard(35, 0, 15, "CONNECT WITH ME", "Drive in to open profiles", 0xf59e0b);

    const socials = [
      {
        id: "github",
        title: "GitHub",
        subtitle: "@neelesh1097",
        url: resumeData.socials.github,
        color: 0x38bdf8,
        x: 28,
        z: 32
      },
      {
        id: "linkedin",
        title: "LinkedIn",
        subtitle: "Neelesh Yadav",
        url: resumeData.socials.linkedin,
        color: 0x0ea5e9,
        x: 35,
        z: 32
      },
      {
        id: "email",
        title: "Email",
        subtitle: "neelesh6kumar@gmail.com",
        url: `mailto:${resumeData.socials.email}`,
        color: 0x10b981,
        x: 42,
        z: 32
      }
    ];

    socials.forEach((item) => {
      this.createSocialKiosk(item);
    });
  }

  createSocialKiosk(item) {
    const x = item.x;
    const z = item.z;

    // Glowing Floor Ring
    const ringGeo = new THREE.RingGeometry(1.8, 2.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: item.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, 0.04, z);
    this.scene.add(ring);

    // Kiosk Body
    const kioskGeo = new THREE.BoxGeometry(1.8, 2.8, 0.8);
    const kioskMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7
    });
    const kiosk = new THREE.Mesh(kioskGeo, kioskMat);
    kiosk.position.set(x, 1.4, z);
    kiosk.castShadow = true;
    kiosk.receiveShadow = true;
    this.scene.add(kiosk);

    // Kiosk Face Graphic
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 320, 480);

    ctx.fillStyle = '#' + item.color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 320, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.title, 160, 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px sans-serif';
    ctx.fillText(item.subtitle, 160, 180);

    ctx.fillStyle = '#' + item.color.toString(16).padStart(6, '0');
    ctx.roundRect(30, 360, 260, 65, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PRESS [SPACE]', 160, 402);

    const tex = new THREE.CanvasTexture(canvas);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 2.4),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    face.position.set(x, 1.5, z + 0.42);
    this.scene.add(face);

    // Physics Collider
    const boxShape = new CANNON.Box(new CANNON.Vec3(0.9, 1.4, 0.4));
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x, 1.4, z)
    });
    body.addShape(boxShape);
    this.physics.world.addBody(body);

    // Interactive Trigger
    this.interactiveTriggers.push({
      id: item.id,
      type: 'social',
      data: item,
      position: new THREE.Vector3(x, 0, z),
      radius: 3.2,
      ringMesh: ring
    });
  }

  createZoneBillboard(x, y, z, title, subtitle, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b0f19';
    ctx.roundRect(10, 10, 1004, 236, 24);
    ctx.fill();

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 512, 110);

    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = '500 36px -apple-system, sans-serif';
    ctx.fillText(subtitle, 512, 175);

    const tex = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 3),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    mesh.position.set(x, y + 2.5, z);
    this.scene.add(mesh);
  }

  update(delta, carPosition) {
    const elapsed = performance.now() * 0.001;

    // Animate floating items (holograms, badges)
    for (const obj of this.animatedObjects) {
      obj.mesh.position.y = obj.baseY + Math.sin(elapsed * obj.speed) * 0.2;
      obj.mesh.rotation.y += delta * obj.rotSpeed;
    }

    // Check Trigger Proximity
    let activeTrigger = null;
    for (const trigger of this.interactiveTriggers) {
      const dist = carPosition.distanceTo(trigger.position);
      if (dist < trigger.radius) {
        activeTrigger = trigger;
        if (trigger.ringMesh) {
          trigger.ringMesh.scale.setScalar(1 + Math.sin(elapsed * 6) * 0.08);
        }
      }
    }

    if (this.onTriggerZone) {
      this.onTriggerZone(activeTrigger);
    }
  }
}
