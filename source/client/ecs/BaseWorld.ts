import { Scene } from 'three';
import type { ContextLogger } from '../core/Console';
import { CommonEvents } from '../enums/CommonEventsEnum';
import { BaseEntity } from './BaseEntity';
import { IGameEntity } from './interfaces/IGameEntity';
import { IGameSystem } from './interfaces/IGameSystem';
import { IGameWorld } from './interfaces/IGameWorld';
import { EntityId } from './interfaces/Types';


export class BaseWorld implements IGameWorld {
  readonly name: string;
  readonly scene: Scene;
  readonly entities = new Map<EntityId, IGameEntity>();
  readonly systems: IGameSystem[] = [];
  active = true;

  private initialized = false;
  private paused = false;
  private logger: ContextLogger;

  constructor(name: string, scene: Scene) {
    this.name = name;
    this.scene = scene;

    this.logger = g_core.getConsole().NewLoggerCtx(`dz::world:${name}`);
  }

  createEntity(name = 'Entity'): IGameEntity {
    const entity = new BaseEntity(this, name);
    this.addEntity(entity);
    return entity;
  }

  addEntity(entity: IGameEntity): void {
    if (this.entities.has(entity.id)) {
      this.logWarning(`Entity with ID ${entity.id} already exists in world ${this.name}`);
      return;
    }

    this.entities.set(entity.id, entity);

    this.scene.add(entity.object3D);

    for (const system of this.systems) {
      if (system.checkEntityCompatibility(entity)) {
        system.addEntity(entity);
      }
    }

    if (this.initialized) {
      entity.initialize();
    }

    this.logDebug(`Entity '${entity.name}' (${entity.id}) added to world`);
  }

  removeEntity(entityOrId: IGameEntity | EntityId): boolean {
    const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
    const entity = this.entities.get(id);

    if (!entity) {
      return false;
    }

    this.scene.remove(entity.object3D);

    for (const system of this.systems) {
      system.removeEntity(entity);
    }

    this.entities.delete(id);

    this.logDebug(`Entity '${entity.name}' (${entity.id}) removed from world`);

    return true;
  }

  getEntity(id: EntityId): IGameEntity | null {
    return this.entities.get(id) ?? null;
  }

  findEntitiesByName(name: string): IGameEntity[] {
    const results: IGameEntity[] = [];

    this.entities.forEach(entity => {
      if (entity.name === name) {
        results.push(entity);
      }
    });

    return results;
  }

  findEntitiesByTag(tag: string): IGameEntity[] {
    const results: IGameEntity[] = [];

    this.entities.forEach(entity => {
      if (entity.tags.has(tag)) {
        results.push(entity);
      }
    });

    return results;
  }

  addSystem(system: IGameSystem): void {
    if (this.systems.includes(system)) {
      this.logWarning(`System '${system.name}' already exists in world ${this.name}`);
      return;
    }

    (system as any).world = this;

    this.systems.push(system);

    this.sortSystems();

    if (this.initialized) {
      system.initialize();

      this.entities.forEach(entity => {
        if (system.checkEntityCompatibility(entity)) {
          system.addEntity(entity);
        }
      });
    }

    this.logDebug(`System '${system.name}' added to world`);
  }

  removeSystem(system: IGameSystem): boolean {
    const index = this.systems.indexOf(system);

    if (index === -1) {
      return false;
    }

    this.systems.splice(index, 1);

    system.destroy();

    this.logDebug(`System '${system.name}' removed from world`);

    return true;
  }

  getSystem<T extends IGameSystem>(systemType: new (...args: any[]) => T): T | null {
    for (const system of this.systems) {
      if (system instanceof systemType) {
        return system;
      }
    }

    return null;
  }

  update(deltaTime: number): void {
    if (!this.active || this.paused) {
      return;
    }

    for (const system of this.systems) {
      if (system.enabled) {
        system.update(deltaTime);
      }
    }

    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });
  }

  fixedUpdate(fixedDeltaTime: number): void {
    if (!this.active || this.paused) {
      return;
    }

    for (const system of this.systems) {
      if (system.enabled && system.fixedUpdate) {
        system.fixedUpdate(fixedDeltaTime);
      }
    }
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.logInfo(`Initializing world '${this.name}'`);

    for (const system of this.systems) {
      system.initialize();
    }

    this.entities.forEach(entity => {
      entity.initialize();
    });

    this.initialized = true;

    this.logInfo(`World '${this.name}' initialized`);

    g_core.getInternalNet().on(CommonEvents.EVENT_UPDATE, this.update.bind(this));
    g_core.getInternalNet().emit(CommonEvents.EVENT_WORLD_INIT, this.initialized);
  }

  destroy(): void {
    this.logInfo(`Destroying world '${this.name}'`);

    const entityIds = Array.from(this.entities.keys());
    for (const id of entityIds) {
      const entity = this.entities.get(id);
      if (entity) {
        entity.destroy();
      }
    }

    this.entities.clear();

    for (const system of this.systems.slice()) {
      system.destroy();
    }

    this.systems.length = 0;

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.active = false;
    this.initialized = false;

    this.logInfo(`World '${this.name}' destroyed`);
  }

  pause(): void {
    if (!this.paused) {
      this.paused = true;
      this.logInfo(`World '${this.name}' paused`);

      g_core.getInternalNet().emit('world.pause', { world: this.name });
    }
  }

  resume(): void {
    if (this.paused) {
      this.paused = false;
      this.logInfo(`World '${this.name}' resumed`);

      g_core.getInternalNet().emit('world.resume', { world: this.name });
    }
  }

  toJSON(): object {
    const entitiesData: Record<string, object> = {};
    this.entities.forEach((entity, id) => {
      if (!entity.parent) {
        entitiesData[id] = entity.toJSON();
      }
    });

    return {
      name: this.name,
      active: this.active,
      entities: entitiesData
    };
  }

  fromJSON(json: object): void {
    const data = json as any;

    if (data.name) {
      if (data.name !== this.name) {
        this.logWarning(`World name mismatch: expected '${this.name}', got '${data.name}'`);
      }
    }

    if (data.active !== undefined) {
      this.active = data.active;
    }

    this.entities.forEach(entity => {
      entity.destroy();
    });

    if (data.entities) {
      const entityMap = new Map<string, IGameEntity>();

      for (const id in data.entities) {
        const entityData = data.entities[id];
        const entity = this.createEntity(entityData.name);
        entityMap.set(id, entity);
      }

      for (const id in data.entities) {
        const entityData = data.entities[id];
        const entity = entityMap.get(id);

        if (entity) {
          entity.fromJSON(entityData);
        }
      }

      for (const id in data.entities) {
        const entityData = data.entities[id];
        const entity = entityMap.get(id);

        if (entity && entityData.children) {
          for (const childId of entityData.children) {
            const childEntity = entityMap.get(childId);
            if (childEntity) {
              entity.addChild(childEntity);
            }
          }
        }
      }
    }
  }

  preRender(): void {
    if (!this.active || this.paused) {
      return;
    }

    for (const system of this.systems) {
      if (system.enabled && system.preRender) {
        system.preRender();
      }
    }
  }

  postRender(): void {
    if (!this.active || this.paused) {
      return;
    }

    for (const system of this.systems) {
      if (system.enabled && system.postRender) {
        system.postRender();
      }
    }
  }


  private sortSystems(): void {
    this.systems.sort((a, b) => a.priority - b.priority);
  }


  private logDebug(message: string): void {
    if (this.logger?.debug) {
      this.logger.debug(message);
    } else if (console.debug) {
      console.debug(`[World:${this.name}] ${message}`);
    }
  }

  private logInfo(message: string): void {
    if (this.logger?.log) {
      this.logger.log(message);
    } else {
      console.log(`[World:${this.name}] ${message}`);
    }
  }

  private logWarning(message: string): void {
    if (this.logger?.warn) {
      this.logger.warn(message);
    } else {
      console.warn(`[World:${this.name}] ${message}`);
    }
  }
}