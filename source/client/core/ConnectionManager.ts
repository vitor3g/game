import { Client } from 'colyseus.js';
import type { ContextLogger } from "./Console";

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
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;

  constructor(options: ConnectionManagerOptions) {
    this.logger = g_core.getConsole().NewLoggerCtx("dz::server-impl");
    this.options = options;
  }


  async connect(url: string) {
    if (!url) {
      this.logger.error("Invalid server URL");
      return;
    };


    this.logger.log("Connecting to server:", url);

    try {
      this.client = new Client(url);

      const httpUrl = url.replace('ws://', 'http://').replace('wss://', 'https://');

      const response = await fetch(`${httpUrl}/health`, {
        method: "HEAD",
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return this.logger.error(`Failed to connect to server: ${response.status} ${response.statusText}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      this.isConnected = true;
      this.reconnectAttempts = 0;


      this.logger.log("Connected to server:", url);

      return this.client;
    } catch (error) {
      this.logger.error("Failed to connect to server:", error);

      this.isConnected = false;
      if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
        this.reconnectAttempts++;

        if (this.options.debug) {
          this.logger.log(`Reconnecting to server in ${this.options.reconnectInterval}ms... (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
        }

        setTimeout(() => {
          this.connect(url).catch(() => {});
        }, this.options.reconnectInterval);
      }

      throw error;
    }
  }


  public getConnectionStatus() {
    return this.isConnected;
  }

  public getClient() {
    if (!this.client) {
      return this.logger.error("Client not initialized. Please call connect() first.");
    }

    return this.client;
  }
}