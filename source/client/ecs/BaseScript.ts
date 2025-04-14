import { IGameComponent } from './interfaces/IGameComponent';
import { IGameEntity } from './interfaces/IGameEntity';
import { IGameScript } from './interfaces/IGameScript';
import { ScriptType } from './interfaces/Types';


export abstract class BaseScript implements IGameScript {
  abstract readonly type: ScriptType;
  readonly entity: IGameEntity;



  enabled = true;


  constructor(entity: IGameEntity) {
    this.entity = entity;
  }


  onAdd(): void {
  }

  onInit(): void {
  }


  onUpdate(deltaTime: number): void {
    if (!deltaTime) return;
  }


  onFixedUpdate?(fixedDeltaTime: number): void {
    if (!fixedDeltaTime) return;
  }


  onRemove(): void {
  }


  onEnable(): void {
  }


  onDisable(): void {
  }


  onDestroy(): void {
  }


  onEvent?(eventName: string, data?: any): void {
    if (!eventName || !data) return;
  }


  onCollisionEnter?(other: IGameEntity): void {
    if (!other) return;
  }


  onCollisionStay?(other: IGameEntity): void {
    if (!other) return;
  }

  onCollisionExit?(other: IGameEntity): void {
    if (!other) return;
  }


  onKeyDown?(key: string): void {
    if (!key) return;
  }

  onKeyUp?(key: string): void {
    if (!key) return;
  }


  clone(): IGameScript {
    throw new Error('clone() must be implemented by derived class');
  }


  toJSON(): object {
    return {
      type: this.type,
      enabled: this.enabled
    };
  }


  fromJSON(json: object): void {
    const data = json as any;
    if (data.enabled !== undefined) {
      this.enabled = data.enabled;
    }
  }


  enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      this.onEnable();
    }
  }


  disable(): void {
    if (this.enabled) {
      this.enabled = false;
      this.onDisable();
    }
  }


  toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  getComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): T | null {
    return this.entity.getComponent(componentType);
  }


  hasComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): boolean {
    return this.entity.hasComponent(componentType);
  }

  sendEvent(eventName: string, data?: any): void {
    g_core.getInternalNet().emit(eventName, data);
  }


  listenEvent(eventName: string, callback: (data: any) => void): void {
    g_core.getInternalNet().on(eventName, callback);
  }
}