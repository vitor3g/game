import { Scene } from 'three';
import { IGameEntity } from './IGameEntity';
import { IGameSystem } from './IGameSystem';
import { EntityId } from './Types';

export interface IGameWorld {
  readonly name: string;

  readonly scene: Scene;

  readonly entities: Map<EntityId, IGameEntity>;

  readonly systems: IGameSystem[];

  active: boolean;

  createEntity(name?: string): IGameEntity;

  addEntity(entity: IGameEntity): void;

  removeEntity(entityOrId: IGameEntity | EntityId): boolean;

  getEntity(id: EntityId): IGameEntity | null;

  /**
   * Encontra entidades por nome
   * @param name Nome a ser pesquisado
   * @returns Array de entidades com o nome especificado
   */
  findEntitiesByName(name: string): IGameEntity[];

  /**
   * Encontra entidades por tag
   * @param tag Tag a ser pesquisada
   * @returns Array de entidades com a tag especificada
   */
  findEntitiesByTag(tag: string): IGameEntity[];

  /**
   * Adiciona um sistema ao mundo
   * @param system Sistema a ser adicionado
   */
  addSystem(system: IGameSystem): void;

  /**
   * Remove um sistema do mundo
   * @param system Sistema a ser removido
   * @returns Verdadeiro se o sistema foi removido
   */
  removeSystem(system: IGameSystem): boolean;

  /**
   * Obtém um sistema pelo tipo
   * @param systemType Tipo do sistema
   * @returns O sistema encontrado ou null
   */
  getSystem<T extends IGameSystem>(
    systemType: new (...args: any[]) => T,
  ): T | null;

  /**
   * Atualiza o mundo e todos os sistemas/entidades
   * @param deltaTime Tempo decorrido desde o último frame em segundos
   */
  update(deltaTime: number): void;

  /**
   * Atualização fixa para física e outros cálculos que precisam de intervalo fixo
   * @param fixedDeltaTime Intervalo de tempo fixo em segundos
   */
  fixedUpdate(fixedDeltaTime: number): void;

  /**
   * Inicializa o mundo
   */
  initialize(): void;

  /**
   * Destrói o mundo e todos os seus recursos
   */
  destroy(): void;

  /**
   * Pausa o mundo (toda a lógica de atualização)
   */
  pause(): void;

  /**
   * Retoma o mundo após uma pausa
   */
  resume(): void;

  /**
   * Serializa o mundo para JSON
   * @returns Representação JSON do mundo
   */
  toJSON(): object;

  /**
   * Deserializa o mundo a partir de JSON
   * @param json Representação JSON do mundo
   */
  fromJSON(json: object): void;

  /**
   * Método chamado antes da renderização
   */
  preRender(): void;

  /**
   * Método chamado após a renderização
   */
  postRender(): void;
}
