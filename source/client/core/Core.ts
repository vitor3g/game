import { Client } from '../game/Client';
import { Graphics } from '../graphics/Graphics';
import { AssetManager } from './AssetManager';
import { AudioManager } from './AudioManager';
import { InternalNetwork } from './InternalNetwork';
import { Keybinds } from './Keybindings';
export class Core {
  private readonly graphics: Graphics;
  private readonly keybinds: Keybinds;
  private readonly internalNetwork: InternalNetwork;
  private readonly assetManager: AssetManager;
  private readonly audioManager: AudioManager;
  private readonly client: Client;

  constructor() {
    window.g_core = this;
    this.internalNetwork = new InternalNetwork();
    this.graphics = new Graphics();
    this.assetManager = new AssetManager();
    this.audioManager = new AudioManager();
    this.keybinds = new Keybinds();
    this.client = new Client();

    this.internalNetwork.setDebugMode(false);

    console.log('Core');
  }

  public async initialize() {
    await this.client.initialize();
    this.graphics.initialize();
  }

  public getGraphics() {
    return this.graphics;
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

  public getClient() {
    return this.client;
  }
}

export const CoreModule = () => new Core();
