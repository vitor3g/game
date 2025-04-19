import { Game } from '../game/Game';
import { Graphics } from '../graphics/Graphics';
import { AssetManager } from './AssetManager';
import { AudioManager } from './AudioManager';
import { Console, type ContextLogger } from './Console';
import { Debug } from './Debug';
import { InternalNetwork } from './InternalNetwork';
import { Keybinds } from './Keybindings';

export class Core {
  private readonly logger: ContextLogger;
  private readonly graphics: Graphics;
  private readonly game: Game;
  private readonly keybinds: Keybinds;
  private readonly console: Console;
  private readonly internalNetwork: InternalNetwork;
  private readonly assetManager: AssetManager;
  private readonly audioManager: AudioManager;
  private readonly debug: Debug;

  constructor() {
    window.g_core = this;
    this.console = new Console();
    this.internalNetwork = new InternalNetwork();
    this.logger = this.console.NewLoggerCtx('dz::core');

    this.graphics = new Graphics();
    this.assetManager = new AssetManager();
    this.audioManager = new AudioManager();
    this.keybinds = new Keybinds();
    this.game = new Game();
    this.debug = new Debug();

    this.internalNetwork.setDebugMode(false);

    this.logger.log('Core');
  }

  public async start() {
    this.console.start();
    this.graphics.start();

    await this.game.start();
  }

  public getGraphics() {
    return this.graphics;
  }

  public getDebug() {
    return this.debug;
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

  public getInternalNet() {
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
