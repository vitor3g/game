import { GameServer } from "./GameServer";

export class Core {
  private gameServer: GameServer;

  constructor() {
    this.gameServer = new GameServer();
  }

  public async initialize() {
    await this.gameServer.initialize();
  }
}