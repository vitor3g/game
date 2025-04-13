import { IGameEntity } from './IGameEntity';
import { ComponentType } from './Types';


export interface IGameComponent {

  readonly type: ComponentType;


  readonly entity: IGameEntity;


  enabled: boolean;


  onAdd(): void;


  onInit(): void;


  onUpdate(deltaTime: number): void;


  onPreRender?(): void;


  onPostRender?(): void;

  onRemove(): void;


  onEnable(): void;


  onDisable(): void;


  onDestroy(): void;


  clone(): IGameComponent;


  toJSON(): object;


  fromJSON(json: object): void;
}