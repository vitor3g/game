import { Logger } from "@/common/logger";
import AmmoFactory from "ammojs-typed";
import { PhysicsWorld } from "./physics-world";

type AmmoType = Awaited<ReturnType<typeof AmmoFactory>>;


export class Physics {
  private physicsWorld: PhysicsWorld;
  private readonly logger: Logger;

  // remove a mutação direta da api
  private ammoApi!: AmmoType;

  constructor() {
    this.physicsWorld = new PhysicsWorld(this);
    this.logger = new Logger("dz::physics-engine");
  }

  public async start() {
    const AmmoModule = await import("ammojs-typed");
    this.ammoApi = await AmmoModule.default(); // ✅ CORRETO


    this.physicsWorld.create();

    // subscribe to tick-manager
    g_core.getTickManager().subscribe("physics-engine-update", this.update.bind(this))

    this.logger.log('bullet physics (ammo.js) has been initialized');
  }

  private update(dt: number) {
    this.physicsWorld.step(dt);
  }

  public getPhysicsWorld() {
    return this.physicsWorld;
  }

  public getPhysicsApi() {
    return this.ammoApi;
  }
}
