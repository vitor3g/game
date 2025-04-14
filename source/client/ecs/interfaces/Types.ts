export type EntityId = string;


export type ComponentType = string;


export type ScriptType = string;
export type SystemType = string;

export type Tags = Set<string>;


export enum SystemPriority {
  HIGHEST = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  LOWEST = 4
}


export interface IUpdatable {
  update(deltaTime: number): void;
}


export interface IFixedUpdatable {
  fixedUpdate(fixedDeltaTime: number): void;
}


export interface IRenderable {
  initializeRenderer(): void;
  preRender(): void;
  postRender(): void;
  destroyRenderer(): void;
}


export interface ILifecycle {
  initialize(): void;
  destroy(): void;
}


export interface ISerializable {
  toJSON(): object;
  fromJSON(json: object): void;
}

export interface IStatic {
  readonly isStatic: boolean;

  makeStatic(): void;
}


export interface IEventReceiver {
  onEvent(eventName: string, data?: any): void;
}


export interface ICollidable {
  onCollisionEnter(other: any): void;
  onCollisionStay(other: any): void;
  onCollisionExit(other: any): void;
}


export interface IEnableable {
  enabled: boolean;

  onEnable(): void;
  onDisable(): void;
}