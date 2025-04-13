import { AssetType } from "../core/AssetManager";
import { SoundType } from "../core/AudioManager";
import type { ContextLogger } from "../core/Console";
import type { IGameEntity } from "../ecs/interfaces";
import { FollowCameraComponent } from "./Camera/FollowCameraComponent";
import { GeometryComponent } from "./SampleGeometry/GeometryComponent";
import { SkyEntity } from "./Sky/SkyEntity";
import { World } from "./World";

export class Game {
  private readonly logger: ContextLogger;
  private readonly gameWorld: World;

  // Entities
  private readonly skyEntity: SkyEntity;
  private readonly boxEntity: IGameEntity;
  private readonly cameraEntity: IGameEntity;

  constructor() {
    this.logger = g_core.getConsole().NewLoggerCtx("dz::game")
    this.gameWorld = new World("game-world", g_core.getGraphics().getRendererScene());

    /*
      Entities
    */
    this.skyEntity = new SkyEntity(this.gameWorld);
    this.gameWorld.addEntity(this.skyEntity);

    // Debug Box
    this.boxEntity = this.gameWorld.createEntity("BoxEntity");
    const geometryComponent = new GeometryComponent(this.boxEntity);
    this.boxEntity.addComponent(geometryComponent);

    // Default Camera
    this.cameraEntity = this.gameWorld.createEntity("DefaultCamera");
    const followCameraComponent = new FollowCameraComponent(this.cameraEntity);

    followCameraComponent.setSettings({
      height: 2.5,
      rotationSpeed: 0.3,
      smoothFactor: 4.0,
      initialDistanceMode: "close",
      minPolarAngle: 10,
      maxPolarAngle: 80,
      fov: 75
    })

    followCameraComponent.setTarget(this.boxEntity);

    this.cameraEntity.addComponent(followCameraComponent)
  }


  public async start() {
    await g_core.getAudioManager().load("/data/sounds/ui/change.wav", {
      type: SoundType.UI,
      key: 'ui-change'
    })


    g_core.getAssetManager().register("gt86", "/data/vehicles/gt86.glb", AssetType.MODEL_GLTF);
    g_core.getAssetManager().register("wheel_1", "/data/wheels/1.glb", AssetType.MODEL_GLTF);

    g_core.getAssetManager().createGroup("vehicles", [
      "gt86",
    ]);

    g_core.getAssetManager().createGroup("wheels", [
      "wheel_1",
    ]);

    g_core.getAssetManager().loadGroup("vehicles");
    g_core.getAssetManager().loadGroup("wheels");

    g_core.getInteralNetwork().on("asset.all.loaded", () => {
      this.gameWorld.initialize();

      this.logger.log("World Initialized");
    });
  }

  public getGameWorld() {
    return this.gameWorld;
  }
}