export interface IEvent {
  type: string;
  data: any;
  timestamp: number;
}

/**
 * Type for event callback functions
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * Interface for components that can listen to events
 */
export interface IEventListener {
  handleEvent<T>(eventType: string, data: T): void;
}

/**
 * Priority types for event processing
 */
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * Interface for event subscription
 */
export interface IEventSubscription {
  eventType: string;
  callback: EventCallback<any>;
  priority: EventPriority;
  unsubscribe(): void;
}

/**
 * Event subscription - concrete class
 */
class EventSubscription implements IEventSubscription {
  private network: InternalNetwork;

  constructor(
    public eventType: string,
    public callback: EventCallback<any>,
    public priority: EventPriority,
    network: InternalNetwork
  ) {
    this.network = network;
  }

  unsubscribe(): void {
    this.network.unsubscribe(this);
  }
}

/**
 * Main class for the internal event network system
 */
export class InternalNetwork {
  private subscribers = new Map<string, IEventSubscription[]>();
  private eventQueue: { type: string, data: any, delay: number }[] = [];
  private eventHistory = new Map<string, any[]>();
  private isProcessing = false;
  private debugMode = false;
  private historyEnabled = true;
  private historyMaxEvents = 50; // Maximum events per type to store in history

  /**
   * Creates a new instance of the internal network
   * @param debugMode Activates debug mode for detailed logging
   * @param historyEnabled Store events in history for late subscribers
   * @param historyMaxEvents Maximum number of events to store per event type
   */
  constructor(debugMode = false, historyEnabled = true, historyMaxEvents = 50) {
    this.debugMode = debugMode;
    this.historyEnabled = historyEnabled;
    this.historyMaxEvents = historyMaxEvents;

    if (debugMode) {
      console.log(`InternalNetwork: System initialized with debug mode${historyEnabled ? ' and event history' : ''}`);
    }
  }

  /**
   * Enables or disables debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Enables or disables event history
   */
  setHistoryEnabled(enabled: boolean): void {
    this.historyEnabled = enabled;
    // Clear history if disabled
    if (!enabled) {
      this.eventHistory.clear();
    }
  }

  /**
   * Sets the maximum number of events to store per event type
   */
  setHistoryMaxEvents(maxEvents: number): void {
    this.historyMaxEvents = maxEvents;
  }

  /**
   * Clears event history for a specific event type or all events
   */
  clearHistory(eventType?: string): void {
    if (eventType) {
      this.eventHistory.delete(eventType);
    } else {
      this.eventHistory.clear();
    }
  }

  /**
   * Subscribes to a specific event type using 'on' method
   * Will also receive past events if history is enabled
   */
  on<T = any>(
    eventType: string,
    callback: EventCallback<T>,
    priority: EventPriority = EventPriority.NORMAL
  ): IEventSubscription {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscription = new EventSubscription(
      eventType,
      callback as EventCallback<any>,
      priority,
      this
    );

    const subscribers = this.subscribers.get(eventType)!;
    subscribers.push(subscription);

    // Sort based on priority
    subscribers.sort((a, b) => b.priority - a.priority);

    if (this.debugMode) {
      console.log(`InternalNetwork: New subscription for '${eventType}' with priority ${priority}`);
    }

    // Check event history and replay past events to the new subscriber
    if (this.historyEnabled && this.eventHistory.has(eventType)) {
      const pastEvents = this.eventHistory.get(eventType) ?? [];

      if (pastEvents.length > 0 && this.debugMode) {
        console.log(`InternalNetwork: Replaying ${pastEvents.length} past events for '${eventType}'`);
      }

      // Replay all past events to this subscriber
      for (const pastData of pastEvents) {
        try {
          callback(pastData);
        } catch (error) {
          console.error(`InternalNetwork: Error replaying past event '${eventType}':`, error);
        }
      }
    }

    return subscription;
  }

  /**
   * Unsubscribes from an event
   */
  unsubscribe(subscription: IEventSubscription): void {
    const subscribers = this.subscribers.get(subscription.eventType);

    if (subscribers) {
      const index = subscribers.indexOf(subscription);
      if (index !== -1) {
        subscribers.splice(index, 1);

        if (this.debugMode) {
          console.log(`InternalNetwork: Subscription removed for '${subscription.eventType}'`);
        }
      }
    }
  }

  /**
   * Fires an event immediately with the format emit(eventType, data)
   * Also stores the event in history if enabled
   */
  emit<T = any>(eventType: string, data: T): void {
    // Store event in history if enabled
    if (this.historyEnabled) {
      if (!this.eventHistory.has(eventType)) {
        this.eventHistory.set(eventType, []);
      }

      const eventList = this.eventHistory.get(eventType)!;
      eventList.push(data);

      // Limit the number of stored events per type
      if (eventList.length > this.historyMaxEvents) {
        eventList.shift(); // Remove oldest event
      }
    }

    this.processEvent(eventType, data);
  }

  /**
   * Schedules an event to be fired after a specific delay (in ms)
   */
  emitDelayed<T = any>(eventType: string, data: T, delayMs: number): void {
    this.eventQueue.push({ type: eventType, data, delay: delayMs });

    if (this.debugMode) {
      console.log(`InternalNetwork: Event '${eventType}' scheduled for ${delayMs}ms`);
    }

    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  /**
   * Processes the event queue
   */
  private processEventQueue(): void {
    this.isProcessing = true;

    if (this.eventQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    // Process the next event in the queue
    const nextItem = this.eventQueue.shift()!;

    setTimeout(() => {
      this.processEvent(nextItem.type, nextItem.data);
      this.processEventQueue();
    }, nextItem.delay);
  }

  /**
   * Processes a single event
   */
  private processEvent<T = any>(eventType: string, data: T): void {
    const subscribers = this.subscribers.get(eventType) ?? [];

    if (this.debugMode) {
      console.log(`InternalNetwork: Processing event '${eventType}' with ${subscribers.length} listeners`);
    }


    // Notifies all subscribers in priority order
    for (const subscription of subscribers) {
      try {
        subscription.callback(data);
      } catch (error) {
        console.error(`InternalNetwork: Error processing event '${eventType}':`, error);
      }
    }
  }

  /**
   * Removes all subscriptions and optionally clears event history
   * @param clearHistory Whether to also clear the event history
   */
  clear(clearHistory = false): void {
    this.subscribers.clear();
    this.eventQueue = [];

    if (clearHistory) {
      this.eventHistory.clear();
    }

    if (this.debugMode) {
      console.log(`InternalNetwork: System cleared - all subscriptions removed${clearHistory ? ' and history cleared' : ''}`);
    }
  }
}
