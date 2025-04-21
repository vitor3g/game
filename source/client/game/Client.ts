import { ClientGame } from './ClientGame';

export class Client {
  private readonly clientGame: ClientGame;

  constructor() {
    this.clientGame = new ClientGame();
  }

  public async initialize() {}

  public getClientGame() {
    return this.clientGame;
  }
}
