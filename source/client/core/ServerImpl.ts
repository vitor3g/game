import type { Room } from 'colyseus.js';
import { Client } from '../game/Client';
import { ConnectionManager } from './ConnectionManager';

export class ServerImpl {
  private readonly connectionManager: ConnectionManager;

  /* Server */
  private room: Room | null = null;

  constructor() {
    this.connectionManager = new ConnectionManager({
      maxReconnectAttempts: 5,
      autoReconnect: true,
      reconnectInterval: 1000,
      debug: true,
    });
  }

  public async connect(url: string) {
    await this.connectionManager.createClient(url);

    const client = this.connectionManager.getClient();

    if (this.connectionManager.getConnectionStatus() && client !== null) {
      try {
        this.room = await client.joinOrCreate('game');

        const gameClient = new Client();
        gameClient.initialize();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.error('Failed to connect to server');
    }
  }

  public getRoom() {
    if (!this.room) {
      throw new Error('Room is not initialized');
    }

    return this.room;
  }
}
