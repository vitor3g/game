import { Client } from 'colyseus.js';
import type { ContextLogger } from './Console';

export interface ConnectionManagerOptions {
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  debug: boolean;
}

export class ConnectionManager {
  private readonly logger: ContextLogger;
  private readonly options: ConnectionManagerOptions;

  /* Impl */
  public client: Client | null = null;
  public isConnected = false;
  public reconnectAttempts = 0;

  constructor(options: ConnectionManagerOptions) {
    this.logger = g_core.getConsole().NewLoggerCtx('dz::server-impl');
    this.options = options;
  }

  async createClient(url: string) {
    if (!url) {
      this.logger.error('Invalid server URL');
      return false;
    }

    this.logger.log('Connecting to server:', url);

    try {
      this.client = new Client(url);

      const httpUrl = url
        .replace('ws://', 'http://')
        .replace('wss://', 'https://');

      const response = await fetch(`${httpUrl}/health`, {
        method: 'HEAD',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.logger.error(
          `Failed to connect to server: ${response.status} ${response.statusText}`,
        );

        return false;
      }

      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.logger.log('Connected to server:', url);
    } catch (error) {
      this.logger.error('Failed to connect to server:', error);

      this.isConnected = false;
      if (
        this.options.autoReconnect &&
        this.reconnectAttempts < this.options.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;

        if (this.options.debug) {
          this.logger.log(
            `Reconnecting to server in ${this.options.reconnectInterval}ms... (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`,
          );
        }

        setTimeout(() => {
          this.createClient(url).catch(() => {});
        }, this.options.reconnectInterval);
      }

      throw error;
    }
  }

  public getClient(): Client | null {
    return this.client;
  }
  public getConnectionStatus() {
    return this.isConnected;
  }
}
