import { Logger } from "@/common/logger";
import Ammo from "ammojs-typed";
import { PhysicsWorld } from "./physics-world";

export class Physics {
  private physicsWorld: PhysicsWorld;

  private readonly logger: Logger;
  private api!: typeof import("ammojs-typed").default;

  constructor() {
    this.physicsWorld = new PhysicsWorld(this);

    this.logger = new Logger("dz::physics-engine");
  }


  public async start() {
    this.api = await Ammo();

    this.physicsWorld.create();

    // subscribe to tick-manager
    g_core.getTickManager().subscribe("physics-engine-update", this.update.bind(this))

    this.logger.log('bullet phyics(ammo.js) has been initialized')
  }


  private update(dt: number) {
    this.physicsWorld.step(dt);
  }

  public getPhysicsWorld() {
    return this.physicsWorld;
  }

  public getPhysicsApi() {
    return this.api;
  }
}