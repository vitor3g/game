// USED ONLY BEFORE SCRIPTING LOGIC!!


import * as THREE from "three";
import { RigidBody } from "../physics/rigid-body";

export class Game {
  private readonly dynamicObjects: { body: RigidBody; mesh: THREE.Mesh }[] = [];

  constructor() {
    //
  }

  public async init() {
    const physics = g_core.getPhysics();
    const graphics = g_core.getGraphics();
    const Ammo = physics.getPhysicsApi();
    const scene = graphics.getRendererScene();

    const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 1, 50));
    const groundBody = new RigidBody(physics, groundShape, 0);
    physics.getPhysicsWorld().addRigidBody(groundBody.getBody());

    const groundMesh = new THREE.Mesh(
      new THREE.BoxGeometry(100, 2, 100),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    groundMesh.position.set(0, -1, 0);
    scene.add(groundMesh);

    const boxSize = 2;
    const boxShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));
    const boxBody = new RigidBody(physics, boxShape, 1);
    boxBody.setPosition(new Ammo.btVector3(0, 10, 0));
    physics.getPhysicsWorld().addRigidBody(boxBody.getBody());

    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxSize, boxSize, boxSize),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    scene.add(boxMesh);

    this.dynamicObjects.push({ body: boxBody, mesh: boxMesh });

    g_core.getTickManager().subscribe("game-sync-physics", this.syncPhysics.bind(this))
  }

  private syncPhysics() {
    const physics = g_core.getPhysics();
    const Ammo = physics.getPhysicsApi();

    for (const { body, mesh } of this.dynamicObjects) {
      const transform = new Ammo.btTransform();
      body.getBody().getMotionState().getWorldTransform(transform);

      const origin = transform.getOrigin();
      const rotation = transform.getRotation();

      mesh.position.set(origin.x(), origin.y(), origin.z());
      mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
  }
}
