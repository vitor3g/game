import { Logger } from "@/common/logger";
import { Game } from "../game/game";
import { Graphics } from "../graphics/graphics";
import { Physics } from "../physics/physics";
import { EntityManager } from "./entity-manager";
import { Models } from "./models";
import { Objects } from "./objects";
import { TickManager } from "./tick-manager";

export class Core {
  private readonly logger: Logger;
  private readonly graphics: Graphics;
  private readonly physics: Physics;
  private readonly game: Game;
  private readonly tickManager: TickManager;
  private readonly entityManager: EntityManager;
  private readonly models: Models;
  private readonly objects: Objects;

  constructor() {
    this.logger = new Logger("dz::core");
    this.graphics = new Graphics();
    this.physics = new Physics();
    this.tickManager = new TickManager();
    this.entityManager = new EntityManager(this);
    this.models = new Models();
    this.objects = new Objects();

    this.game = new Game();

    this.logger.log("Core");

    window.g_core = this;
  }

  public async start() {
    this.graphics.start();

    // first tick: it is useful (before be updated with frame-by-frame)
    this.tickManager.update(1);

    await this.physics.start();

    this.game.init();
  }

  public getGraphics() {
    return this.graphics;
  }

  public getPhysics() {
    return this.physics;
  }

  public getModels() {
    return this.models;
  }

  public getEntityManager() {
    return this.entityManager;
  }

  public getTickManager() {
    return this.tickManager;
  }

  public getObjects() {
    return this.objects;
  }

  public getLogger() {
    return this.logger;
  }
}

export const CoreModule = () => new Core();
