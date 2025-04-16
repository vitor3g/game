import { Object3D, Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import type { ContextLogger } from '../core/Console';
import { IGameComponent, IGameEntity, IGameScript, IGameWorld } from './interfaces';
import { EntityId, Tags } from './interfaces/Types';


export class BaseEntity implements IGameEntity {
  readonly id: EntityId;
  readonly object3D: Object3D;
  readonly world: IGameWorld;
  readonly children: IGameEntity[] = [];

  name: string;
  active = true;
  tags: Tags = new Set<string>();
  parent: IGameEntity | null = null;

  private components = new Map<string, IGameComponent>();
  private scripts = new Map<string, IGameScript>();
  private initialized = false;
  private readonly logger: ContextLogger;

  constructor(world: IGameWorld, name = 'Entity') {
    this.id = uuidv4();
    this.name = name;
    this.world = world;
    this.object3D = new Object3D();
    this.object3D.name = name;
    this.logger = g_core.getConsole().NewLoggerCtx("dz::entities");

    (this.object3D as any).__entity = this;
  }

  getEulerAngles(): Vector3 {
    return new Vector3(
      this.object3D.rotation.x,
      this.object3D.rotation.y,
      this.object3D.rotation.z
    );
  }

  setEulerAngles(x: number, y: number, z: number): void {
    this.object3D.rotation.set(x, y, z);
  }


  addComponent<T extends IGameComponent>(component: T): T {
    const type = component.type;
    if (this.components.has(type)) {
      this.logger.warn(`Entity ${this.name} already has a component of type ${type}`);
      return this.components.get(type) as T;
    }

    if ((component as any).entity !== this) {
      (component as any).entity = this;
    }

    this.components.set(type, component);

    component.onAdd();

    if (this.initialized) {
      component.onInit();
    }

    if (this.world) {
      this.world.systems.forEach(system => {
        system.onComponentAdded(this, component);
      });
    }

    return component;
  }

  getComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): T | null {
    const type = (componentType as any).prototype.type ?? componentType.name;

    const component = this.components.get(type);
    return component as T || null;
  }

  hasComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): boolean {
    const type = (componentType as any).prototype.type ?? componentType.name;
    return this.components.has(type);
  }

  removeComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): boolean {
    const type = (componentType as any).prototype.type ?? componentType.name;
    const component = this.components.get(type);

    if (component) {
      component.onRemove();

      this.components.delete(type);

      if (this.world) {
        this.world.systems.forEach(system => {
          system.onComponentRemoved(this, component);
        });
      }

      return true;
    }

    return false;
  }

  addScript<T extends IGameScript>(script: T): T {
    const type = script.type;
    if (this.scripts.has(type)) {
      this.logger.warn(`Entity ${this.name} already has a script of type ${type}`);
      return this.scripts.get(type) as T;
    }

    if ((script as any).entity !== this) {
      (script as any).entity = this;
    }

    this.scripts.set(type, script);

    script.onAdd();

    if (this.initialized) {
      script.onInit();
    }

    return script;
  }

  getScript<T extends IGameScript>(scriptType: new (...args: any[]) => T): T | null {
    const type = (scriptType as any).prototype.type ?? scriptType.name;
    const script = this.scripts.get(type);
    return script as T || null;
  }

  removeScript<T extends IGameScript>(scriptType: new (...args: any[]) => T): boolean {
    const type = (scriptType as any).prototype.type ?? scriptType.name;
    const script = this.scripts.get(type);

    if (script) {
      script.onRemove();

      this.scripts.delete(type);

      return true;
    }

    return false;
  }

  addChild(child: IGameEntity): void {
    if (this.children.includes(child)) {
      return;
    }

    if (child.parent) {
      child.parent.removeChild(child);
    }

    this.children.push(child);

    (child as BaseEntity).parent = this;

    this.object3D.add(child.object3D);
  }

  removeChild(child: IGameEntity): boolean {
    const index = this.children.indexOf(child);

    if (index !== -1) {
      this.children.splice(index, 1);

      (child as BaseEntity).parent = null;

      this.object3D.remove(child.object3D);

      return true;
    }

    return false;
  }

  setParent(parent: IGameEntity | null): void {
    if (parent === this.parent) {
      return;
    }

    if (this.parent) {
      this.parent.removeChild(this);
    }

    if (parent) {
      parent.addChild(this);
    }
  }

  findByName(name: string): IGameEntity | null {
    if (this.name === name) {
      return this;
    }

    for (const child of this.children) {
      const found = child.findByName(name);
      if (found) {
        return found;
      }
    }

    return null;
  }

  findByTag(tag: string, results: IGameEntity[] = []): IGameEntity[] {
    if (this.tags.has(tag)) {
      results.push(this);
    }

    for (const child of this.children) {
      child.findByTag(tag, results);
    }

    return results;
  }

  update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    this.components.forEach(component => {
      if (component.enabled) {
        component.onUpdate(deltaTime);
      }
    });

    this.scripts.forEach(script => {
      if (script.enabled) {
        script.onUpdate(deltaTime);
      }
    });

    for (const child of this.children) {
      child.update(deltaTime);
    }
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.components.forEach(component => {
      component.onInit();
    });

    this.scripts.forEach(script => {
      script.onInit();
    });

    for (const child of this.children) {
      child.initialize();
    }

    this.initialized = true;
  }

  destroy(): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }

    while (this.children.length > 0) {
      const child = this.children[0];
      child.destroy();
    }

    this.components.forEach(component => {
      component.onDestroy();
    });
    this.components.clear();

    this.scripts.forEach(script => {
      script.onDestroy();
    });
    this.scripts.clear();

    (this.object3D as any).__entity = null;

    if (this.world) {
      this.world.removeEntity(this);
    }
  }

  clone(recursive = true): IGameEntity {
    const cloned = new BaseEntity(this.world, `${this.name}_clone`);

    this.tags.forEach(tag => {
      cloned.tags.add(tag);
    });

    cloned.object3D.copy(this.object3D);

    this.components.forEach(component => {
      const componentClone = component.clone();
      cloned.addComponent(componentClone);
    });

    this.scripts.forEach(script => {
      const scriptClone = script.clone();
      cloned.addScript(scriptClone);
    });

    if (recursive) {
      this.children.forEach(child => {
        const childClone = child.clone(true);
        cloned.addChild(childClone);
      });
    }

    return cloned;
  }

  toJSON(): object {
    const componentsData: Record<string, object> = {};
    this.components.forEach((component, type) => {
      componentsData[type] = component.toJSON();
    });

    const scriptsData: Record<string, object> = {};
    this.scripts.forEach((script, type) => {
      scriptsData[type] = script.toJSON();
    });

    const childrenIds: string[] = this.children.map(child => child.id);

    return {
      id: this.id,
      name: this.name,
      active: this.active,
      tags: Array.from(this.tags),
      transform: {
        position: [
          this.object3D.position.x,
          this.object3D.position.y,
          this.object3D.position.z
        ],
        rotation: [
          this.object3D.rotation.x,
          this.object3D.rotation.y,
          this.object3D.rotation.z
        ],
        scale: [
          this.object3D.scale.x,
          this.object3D.scale.y,
          this.object3D.scale.z
        ]
      },
      components: componentsData,
      scripts: scriptsData,
      children: childrenIds,
      parentId: this.parent ? this.parent.id : null
    };
  }

  fromJSON(json: object): void {
    const data = json as any;

    this.name = data.name ?? this.name;
    this.active = data.active !== undefined ? data.active : this.active;

    this.tags.clear();
    if (Array.isArray(data.tags)) {
      data.tags.forEach((tag: string) => {
        this.tags.add(tag);
      });
    }

    if (data.transform) {
      if (data.transform.position) {
        this.object3D.position.set(
          data.transform.position[0],
          data.transform.position[1],
          data.transform.position[2]
        );
      }

      if (data.transform.rotation) {
        this.object3D.rotation.set(
          data.transform.rotation[0],
          data.transform.rotation[1],
          data.transform.rotation[2]
        );
      }

      if (data.transform.scale) {
        this.object3D.scale.set(
          data.transform.scale[0],
          data.transform.scale[1],
          data.transform.scale[2]
        );
      }
    }
  }
}