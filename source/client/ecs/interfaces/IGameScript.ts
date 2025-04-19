import { IGameEntity } from './IGameEntity';
import { ScriptType } from './Types';

export interface IGameScript {
  readonly type: ScriptType;

  readonly entity: IGameEntity;

  enabled: boolean;

  onAdd(): void;

  onInit(): void;

  onUpdate(deltaTime: number): void;

  onFixedUpdate?(fixedDeltaTime: number): void;

  onRemove(): void;

  onEnable(): void;

  onDisable(): void;

  onDestroy(): void;

  onEvent?(eventName: string, data?: any): void;

  onCollisionEnter?(other: IGameEntity): void;

  onCollisionStay?(other: IGameEntity): void;

  onCollisionExit?(other: IGameEntity): void;

  onKeyDown?(key: string): void;

  onKeyUp?(key: string): void;

  clone(): IGameScript;

  toJSON(): object;

  fromJSON(json: object): void;
}
