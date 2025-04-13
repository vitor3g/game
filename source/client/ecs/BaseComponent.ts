import { IGameComponent } from './interfaces/IGameComponent';
import { IGameEntity } from './interfaces/IGameEntity';
import { ComponentType } from './interfaces/Types';


export abstract class BaseComponent implements IGameComponent {
  abstract readonly type: ComponentType;


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
  }


  onPreRender?(): void {
  }


  onPostRender?(): void {
  }


  onRemove(): void {
  }


  onEnable(): void {
  }


  onDisable(): void {
  }


  onDestroy(): void {
  }


  clone(): IGameComponent {
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
}