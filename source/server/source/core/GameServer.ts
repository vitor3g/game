import { type Server } from '@colyseus/core';
import { monitor } from '@colyseus/monitor';
import config, { listen, type ConfigOptions } from '@colyseus/tools';
import { type Application } from 'express';
import { GameRoom } from './GameRoom';

export class GameServer {
  private gameServer: Server;
  private app: Application;
  private readonly config: ConfigOptions;

  constructor() {
    this.config = config({
      options: {
        devMode: false,
      },

      displayLogs: true,
      initializeGameServer: (gameServer) => {
        this.gameServer = gameServer;
        this.gameServer.define('game', GameRoom);
      },
      initializeExpress: (app) => {
        this.app = app;

        this.app.use('/health', monitor());
      },
    });
  }

  public async initialize() {
    listen(this.config, 22003);
  }

  public getGameServer(): Server {
    return this.gameServer;
  }

  public getApp(): Application {
    return this.app;
  }
}
