import { Logger } from "@/common/logger";
import { Game } from "../game/game";
import { Graphics } from "./graphics/graphics";
import { Keybinds } from "./keybinds";

export class Core {
  private readonly logger: Logger;
  private readonly graphics: Graphics;
  private readonly game: Game;
  private readonly keybinds: Keybinds

  constructor() {
    this.logger = new Logger("dz::core");
    this.graphics = new Graphics();
    this.keybinds = new Keybinds();

    this.game = new Game();

    this.logger.log("Core");

    window.g_core = this;
  }

  public async start() {
    this.graphics.start();
    this.game.start();
  }

  public getGraphics() {
    return this.graphics;
  }

  public getGame() {
    return this.game;
  }

  public getCoreLogger() {
    return this.logger;
  }

  public getKeybinds() {
    return this.keybinds;
  }
}

export const CoreModule = () => new Core();