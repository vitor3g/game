import { Object3D, type Vector3 } from 'three';
import { IGameComponent } from './IGameComponent';
import { IGameScript } from './IGameScript';
import { IGameWorld } from './IGameWorld';
import { EntityId, Tags } from './Types';


export interface IGameEntity {
  readonly id: EntityId;


  name: string;


  readonly object3D: Object3D;


  readonly world: IGameWorld;


  active: boolean;


  tags: Tags;


  readonly children: IGameEntity[];


  readonly parent: IGameEntity | null;

  getEulerAngles(): Vector3;

  addComponent<T extends IGameComponent>(component: T): T;


  getComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): T | null;


  hasComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): boolean;


  removeComponent<T extends IGameComponent>(componentType: new (...args: any[]) => T): boolean;


  addScript<T extends IGameScript>(script: T): T;

  getScript<T extends IGameScript>(scriptType: new (...args: any[]) => T): T | null;


  removeScript<T extends IGameScript>(scriptType: new (...args: any[]) => T): boolean;


  addChild(child: IGameEntity): void;


  removeChild(child: IGameEntity): boolean;


  setParent(parent: IGameEntity | null): void;


  findByName(name: string): IGameEntity | null;


  findByTag(tag: string, results?: IGameEntity[]): IGameEntity[];


  update(deltaTime: number): void;


  initialize(): void;


  destroy(): void;


  clone(recursive?: boolean): IGameEntity;


  toJSON(): object;


  fromJSON(json: object): void;
}