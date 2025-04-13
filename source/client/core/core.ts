import { Game } from "../game/Game";
import { Graphics } from "../graphics/Graphics";
import { AssetManager } from "./AssetManager";
import { AudioManager } from "./AudioManager";
import { Console, type ContextLogger } from "./Console";
import { InternalNetwork } from "./InternalNetwork";
import { Keybinds } from "./Keybindings";

export class Core {
  private readonly logger: ContextLogger;
  private readonly graphics: Graphics;
  private readonly game: Game;
  private readonly keybinds: Keybinds;
  private readonly console: Console;
  private readonly internalNetwork: InternalNetwork;
  private readonly assetManager: AssetManager;
  private readonly audioManager: AudioManager;

  constructor() {
    window.g_core = this;
    this.internalNetwork = new InternalNetwork();
    this.console = new Console();
    this.logger = this.console.NewLoggerCtx("dz::core");

    this.graphics = new Graphics();
    this.assetManager = new AssetManager();
    this.audioManager = new AudioManager();
    this.keybinds = new Keybinds();
    this.game = new Game()

    this.internalNetwork.setDebugMode(false);

    this.logger.log("Core");
  }

  public async start() {
    this.graphics.start();
    await this.game.start();
  }

  public getGraphics() {
    return this.graphics;
  }

  public getGame() {
    return this.game;
  }

  public getConsole() {
    return this.console;
  }

  public getCoreLogger() {
    return this.logger;
  }

  public getInteralNetwork() {
    return this.internalNetwork;
  }

  public getKeybinds() {
    return this.keybinds;
  }

  public getAudioManager() {
    return this.audioManager;
  }

  public getAssetManager() {
    return this.assetManager;
  }
}

export const CoreModule = () => new Core();