import { Logger } from "@/common/logger";
import { SString } from "@/shared/shared.utils";


type TickCallback = (delta: number) => void;

export class TickManager {
  private readonly logger: Logger;
  private subscribers = new Set<TickCallback>();


  constructor() {
    this.logger = new Logger("dz::tick-manager");
  }


  public subscribe(context: string, fn: TickCallback) {
    if (!context || !fn) return;

    this.subscribers.add(fn);
    this.logger.log(SString('%s added to tick queue', context))
  }

  public unsubscribe(fn: TickCallback) {
    this.subscribers.delete(fn);
  }

  public update(delta: number) {
    for (const fn of this.subscribers) {
      fn(delta);
    }
  }
}