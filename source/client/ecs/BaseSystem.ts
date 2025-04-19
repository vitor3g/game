import { IGameComponent } from './interfaces/IGameComponent';
import { IGameEntity } from './interfaces/IGameEntity';
import { IGameSystem } from './interfaces/IGameSystem';
import { IGameWorld } from './interfaces/IGameWorld';
import { SystemPriority } from './interfaces/Types';

export abstract class BaseSystem implements IGameSystem {
  readonly name: string;

  readonly priority: SystemPriority;

  readonly world: IGameWorld;

  protected entities: Set<IGameEntity> = new Set<IGameEntity>();

  enabled = true;

  private initialized = false;

  constructor(
    world: IGameWorld,
    name: string,
    priority = SystemPriority.NORMAL,
  ) {
    this.name = name;
    this.world = world;
    this.priority = priority;
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.onInitialize();
    this.initialized = true;
  }

  destroy(): void {
    this.entities.clear();
    this.onDestroy();
    this.initialized = false;
  }

  abstract checkEntityCompatibility(entity: IGameEntity): boolean;

  addEntity(entity: IGameEntity): void {
    if (!this.checkEntityCompatibility(entity)) {
      return;
    }

    this.entities.add(entity);
    this.onEntityAdded(entity);
  }

  removeEntity(entity: IGameEntity): void {
    if (this.entities.has(entity)) {
      this.entities.delete(entity);
      this.onEntityRemoved(entity);
    }
  }

  update(deltaTime: number): void {
    if (!this.enabled) {
      return;
    }

    this.beforeUpdate(deltaTime);

    this.entities.forEach((entity) => {
      if (entity.active) {
        this.processEntity(entity, deltaTime);
      }
    });

    this.afterUpdate(deltaTime);
  }

  processEntity(entity: IGameEntity, deltaTime: number): void {
    if (!entity || !deltaTime) return;
  }

  fixedUpdate?(fixedDeltaTime: number): void {
    if (!this.enabled) {
      return;
    }

    this.beforeFixedUpdate(fixedDeltaTime);

    this.entities.forEach((entity) => {
      if (entity.active) {
        this.processEntityFixed(entity, fixedDeltaTime);
      }
    });

    this.afterFixedUpdate(fixedDeltaTime);
  }

  protected processEntityFixed(
    entity: IGameEntity,
    fixedDeltaTime: number,
  ): void {
    if (!entity || !fixedDeltaTime) return;
  }

  preRender?(): void {
    if (!this.enabled) {
      return;
    }

    this.entities.forEach((entity) => {
      if (entity.active) {
        const components = this.getCompatibleComponents(entity);
        for (const component of components) {
          if (component.enabled && component.onPreRender) {
            component.onPreRender();
          }
        }
      }
    });
  }

  postRender?(): void {
    if (!this.enabled) {
      return;
    }

    this.entities.forEach((entity) => {
      if (entity.active) {
        const components = this.getCompatibleComponents(entity);
        for (const component of components) {
          if (component.enabled && component.onPostRender) {
            component.onPostRender();
          }
        }
      }
    });
  }

  onComponentAdded(entity: IGameEntity, component: IGameComponent): void {
    if (!component) return;
    if (!this.entities.has(entity) && this.checkEntityCompatibility(entity)) {
      this.addEntity(entity);
    }
  }

  onComponentRemoved(entity: IGameEntity, component: IGameComponent): void {
    if (!component) return;
    if (this.entities.has(entity) && !this.checkEntityCompatibility(entity)) {
      this.removeEntity(entity);
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

  protected onInitialize(): void {}

  protected onDestroy(): void {}

  protected onEntityAdded(entity: IGameEntity): void {
    if (!entity) return;
  }

  protected onEntityRemoved(entity: IGameEntity): void {
    if (!entity) return;
  }

  protected onEnable(): void {}

  protected onDisable(): void {}

  protected beforeUpdate(deltaTime: number): void {
    if (!deltaTime) return;
  }

  protected afterUpdate(deltaTime: number): void {
    if (!deltaTime) return;
  }

  protected beforeFixedUpdate(fixedDeltaTime: number): void {
    if (!fixedDeltaTime) return;
  }

  protected afterFixedUpdate(fixedDeltaTime: number): void {
    if (!fixedDeltaTime) return;
  }

  protected getCompatibleComponents(entity: IGameEntity): IGameComponent[] {
    if (!entity) return [];
    return [];
  }
}
