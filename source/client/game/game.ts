import { AssetType } from "../core/AssetManager";
import type { ContextLogger } from "../core/Console";
import { SkyEntity } from "./Sky/SkyEntity";
import { World } from "./World";

export class Game {
  private readonly logger: ContextLogger;
  private readonly gameWorld: World;

  // Entities
  private readonly skyEntity: SkyEntity;

  constructor() {
    this.logger = g_core.getConsole().NewLoggerCtx("dz::game")
    this.gameWorld = new World("game-world", g_core.getGraphics().getRendererScene());

    // Entities
    this.skyEntity = new SkyEntity(this.gameWorld);
    this.gameWorld.addEntity(this.skyEntity);


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
  }

  public start() {
    g_core.getInteralNetwork().on("asset.all.loaded", () => {
      this.gameWorld.initialize();

      this.logger.log("World Initialized");
    });
  }

  public getGameWorld() {
    return this.gameWorld;
  }
}