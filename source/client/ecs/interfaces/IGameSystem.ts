import { IGameComponent } from './IGameComponent';
import { IGameEntity } from './IGameEntity';
import { IGameWorld } from './IGameWorld';
import { SystemPriority } from './Types';


export interface IGameSystem {

  readonly name: string;


  readonly priority: SystemPriority;


  enabled: boolean;


  readonly world: IGameWorld;


  initialize(): void;


  destroy(): void;


  checkEntityCompatibility(entity: IGameEntity): boolean;


  addEntity(entity: IGameEntity): void;


  removeEntity(entity: IGameEntity): void;


  update(deltaTime: number): void;


  fixedUpdate?(fixedDeltaTime: number): void;


  processEntity(entity: IGameEntity, deltaTime: number): void;


  preRender?(): void;

  postRender?(): void;


  onComponentAdded(entity: IGameEntity, component: IGameComponent): void;

  onComponentRemoved(entity: IGameEntity, component: IGameComponent): void;
}