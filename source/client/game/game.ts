import { DummyLookupSystem } from "./DummyLookupSystem";
import { GameWorld } from "./GameWorld";
import { SkyEntity } from "./sky/SkyEntity";

export class Game {
  private readonly gameWorld: GameWorld;

  /* Systems */
  private readonly dummyLookupSystem: DummyLookupSystem;

  constructor() {
    this.gameWorld = new GameWorld("game-world", g_core.getGraphics().getRendererScene());
    this.dummyLookupSystem = new DummyLookupSystem(this.gameWorld);
  }


  public async start() {
    this._applySystems();

    this._applyComponents();
    this._applyEntities();

    this.gameWorld.initialize();
  }

  public _applySystems() {
    this.gameWorld.addSystem(this.dummyLookupSystem);
  }

  public _applyComponents() {
    /* Sky */
    const skyEntity = new SkyEntity(this.gameWorld);
    this.gameWorld.addEntity(skyEntity);


    /* Default Camera*/
    //const mainCamera = this.gameWorld.createEntity("MainCamera");
    //const cameraComponent = new CameraComponent(mainCamera, {
    //  distance: 5,
    //  smoothing: 0.2,
    //  sensitivity: 0.1,
    //  height: 1
    //})

    //mainCamera.addComponent(cameraComponent);

  }

  public _applyEntities() {
    const ground = g_core.getGraphics().getRenderer().getPhysics().add.ground({ width: 500, height: 500 });
    ground.body.setFriction(1);
  }


  public getGameWorld() {
    return this.gameWorld;
  }
}