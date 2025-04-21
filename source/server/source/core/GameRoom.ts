import { Room } from '@colyseus/core';

export class GameRoom extends Room {
  static async onAuth() {
    return true;
  }

  onJoin(): void | Promise<any> {}

  onCreate() {}
}
