import * as CANNON from "cannon-es";
import * as THREE from "three";
import { ObjectEntity } from "../core/entities/object.entity";
import { RigidBody } from "../physics/rigid-body";



export class Game {

  constructor() {}

  public async init() {
    const physics = g_core.getPhysics();
    const scene = g_core.getGraphics().getRenderer().scene;


    const floorGeometry = new THREE.BoxGeometry(10, 1, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.receiveShadow = true;
    floorMesh.position.y = -0.5;
    scene.add(floorMesh);

    const floorShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 5));
    const floorBody = new RigidBody(physics, floorShape, 0);

    floorBody.setPosition(new CANNON.Vec3(0, -0.5, 0));

    const floorEntity = new ObjectEntity({
      rigidBody: floorBody,
      mesh: floorMesh,
    })

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.castShadow = true;
    scene.add(boxMesh);




    const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const boxBody = new RigidBody(physics, boxShape, 1);

    boxBody.setPosition(new CANNON.Vec3(0, 15, 0));

    const boxEntity = new ObjectEntity({
      rigidBody: boxBody,
      mesh: boxMesh,
    })

    g_core.getTickManager().subscribe("on-client-render", this.onClientRender.bind(this));

    g_core.getEntityManager().add(floorEntity);
    g_core.getEntityManager().add(boxEntity)
    return 1;
  }

  public onClientRender() {
    const io = g_core.getGraphics().getGUI().getIO();
    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    g_core.getGraphics().getGUI().getPrimitiveList().addText(`fps @ ${fps}`, 10, 10, '#090909');

    g_core.getGraphics().getGUI().getPrimitiveList().addText(g_core.getEntityManager().getAll().length, 10, 32, '#090909');

  }
}
