// USED ONLY BEFORE SCRIPTING LOGIC!!


import * as THREE from "three";
import { ObjectEntity } from "../core/entities/object.entity";
import { RigidBody } from "../physics/rigid-body";

export class Game {

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

    const groundEntity = new ObjectEntity({ rigidBody: groundBody, mesh: groundMesh });
    const boxEntity = new ObjectEntity({ rigidBody: boxBody, mesh: boxMesh });

    groundEntity.addTag('static')
    boxEntity.addTag('static')

    g_core.getEntityManager().add(groundEntity);
    g_core.getEntityManager().add(boxEntity)
  }
}
