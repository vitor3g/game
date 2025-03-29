import type Ammo from "ammojs-typed";
import type { Physics } from "./physics";

export class PhysicsWorld {
  private world!: Ammo.btDiscreteDynamicsWorld;
  private bodies: Ammo.btRigidBody[] = [];

  constructor(private readonly g_physics: Physics) {}

  public create() {
    const Ammo = this.g_physics.getPhysicsApi();

    const collisionConfig = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfig);
    this.world.setGravity(new Ammo.btVector3(0, -9.81, 0));
  }

  public step(deltaTime: number) {
    if (this.world) {
      this.world.stepSimulation(deltaTime, 10);
    }
  }

  public addRigidBody(body: Ammo.btRigidBody) {
    this.world.addRigidBody(body);
    this.bodies.push(body);
  }

  public getWorld() {
    return this.world;
  }
}