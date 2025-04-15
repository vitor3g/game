import { CameraComponent } from "./common/components/CameraComponent";
import { GameWorld } from "./GameWorld";
import { SkyEntity } from "./sky/SkyEntity";

export class Game {
  private readonly gameWorld: GameWorld;

  constructor() {
    this.gameWorld = new GameWorld("game-world", g_core.getGraphics().getRendererScene());

    this._applySystems();
    this._applyComponents();
    this._applyEntities();
  }


  public async start() {
    this.gameWorld.initialize();
  }

  public _applySystems() {}

  public _applyComponents() {
    /* Sky */
    const skyEntity = new SkyEntity(this.gameWorld);
    this.gameWorld.addEntity(skyEntity);


    /* Default Camera*/
    const mainCamera = this.gameWorld.createEntity("MainCamera");
    const cameraComponent = new CameraComponent(mainCamera, {
      distance: 5,
      smoothing: 0.2,
      sensitivity: 0.1,
      height: 1
    });

    mainCamera.addComponent(cameraComponent);
  }

  public _applyEntities() {
  }


  public getGameWorld() {
    return this.gameWorld;
  }
}