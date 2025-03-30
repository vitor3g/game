import { Logger } from "@/common/logger";
import * as CANNON from "cannon-es";

export class Physics {
  private world!: CANNON.World;
  private readonly logger: Logger;
  private readonly bodies: CANNON.Body[] = [];

  constructor() {
    this.logger = new Logger("dz::physics-engine");
  }

  public async start() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
      allowSleep: true,
    });

    // tick manager
    g_core
      .getTickManager()
      .subscribe("physics-engine-update", this.update.bind(this));

    this.logger.log("cannon-es physics engine has been initialized");
  }

  private update(dt: number) {
    const fixedTimeStep = 1.0 / 60.0;
    const maxSubSteps = 3;

    this.world.step(fixedTimeStep, dt, maxSubSteps);
  }

  public addBody(body: CANNON.Body) {
    this.world.addBody(body);
    this.bodies.push(body);
  }

  public getWorld(): CANNON.World {
    return this.world;
  }

  public getBodies(): CANNON.Body[] {
    return this.bodies;
  }
}
