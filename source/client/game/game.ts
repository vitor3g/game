import { Physics } from "../physics/physics";
import { Buildings } from "./buildings";
import { Debug } from "./debug";
import { EntityManager } from "./entity-manager";
import { Models } from "./models";
import { World } from "./world";


export class Game {
  private readonly physics: Physics;
  private readonly models: Models;
  private readonly entityManager: EntityManager;
  private readonly buildings: Buildings;
  private readonly debug: Debug;
  private readonly world: World;

  constructor() {
    this.physics = new Physics();
    this.models = new Models();
    this.entityManager = new EntityManager();
    this.buildings = new Buildings();
    this.world = new World(this);
    this.debug = new Debug();
  }

  public async start() {
    await this.physics.start();

    this.entityManager.start();


    this.world.createGameWorld();

    this.debug.start();

    g_core.getGraphics().getTickManager().subscribe("game-loop", this.update.bind(this));

    return 1;
  }

  public update() {
    this.debug.update();
  }

  public getPhysics() {
    return this.physics;
  }

  public getModels() {
    return this.models;
  }

  public getWorld() {
    return this.world;
  }

  public getEntityManager() {
    return this.entityManager;
  }

  public getBuildings() {
    return this.buildings;
  }
}
