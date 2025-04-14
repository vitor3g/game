import { BaseComponent } from '@/client/ecs/BaseComponent';
import type { ComponentType, IGameComponent, IGameEntity } from '@/client/ecs/interfaces';
import { Body, Box, Cylinder, Shape, Sphere, Vec3 } from 'cannon-es';
import { Vector3 } from 'three';

/**
 * Tipos de formas de colisão suportadas
 */
export enum PhysicsShapeType {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  // Outros tipos podem ser adicionados conforme necessário
}

/**
 * Opções para inicialização do corpo físico
 */
export interface PhysicsBodyOptions {
  mass?: number;
  shapeType?: PhysicsShapeType;
  size?: Vector3; // Dimensões para box, raio para esfera, etc.
  position?: Vector3;
  isKinematic?: boolean;
  useGravity?: boolean;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  isTrigger?: boolean;
  collisionGroup?: number;
  collisionMask?: number;
}

/**
 * Componente de física usando cannon-es
 * Gerencia corpo físico e propriedades de simulação para uma entidade
 */
export class PhysicsComponent extends BaseComponent {
  readonly type: ComponentType = 'PhysicsComponent';

  /** Corpo físico do cannon-es */
  body: Body;

  /** Tipo de forma de colisão */
  shapeType: PhysicsShapeType;

  /** Indica se este é um trigger (sem resposta física, apenas detecção) */
  isTrigger = false;

  /** Indica se o corpo deve usar gravidade */
  useGravity = true;

  /** Flag que indica se a posição foi inicializada a partir do objeto 3D */
  private _initialized = false;

  /** Entidades com as quais este componente está colidindo */
  private _collidingEntities = new Set<IGameEntity>();

  /** Flag que indica se a transformação foi atualizada neste frame */
  private _transformUpdated = false;

  /** Armazena dados do usuário associados ao corpo */
  private _userData: any = {};

  /**
   * Cria um novo componente de física
   * @param entity Entidade à qual este componente pertence
   * @param options Opções de configuração do corpo físico
   */
  constructor(entity: IGameEntity, options: PhysicsBodyOptions = {}) {
    super(entity);

    const {
      mass = 1,
      shapeType = PhysicsShapeType.BOX,
      size = new Vector3(1, 1, 1),
      position,
      isKinematic = false,
      useGravity = true,
      friction = 0.3,
      restitution = 0.3,
      linearDamping = 0.01,
      angularDamping = 0.01,
      isTrigger = false,
      collisionGroup = 1,
      collisionMask = -1,
    } = options;

    this.shapeType = shapeType;
    this.isTrigger = isTrigger;
    this.useGravity = useGravity;

    // Criar o corpo físico
    this.body = new Body({
      mass: isTrigger || isKinematic ? 0 : mass,
      type: isKinematic ? Body.KINEMATIC : (mass === 0 ? Body.STATIC : Body.DYNAMIC),
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      sleepTimeLimit: 1.0,
      collisionFilterGroup: collisionGroup,
      collisionFilterMask: collisionMask,
      linearDamping: linearDamping,
      angularDamping: angularDamping,
      fixedRotation: false,
      position: position ? new Vec3(position.x, position.y, position.z) : undefined,
    });

    // Configurar forma de colisão
    let shape: Shape;

    switch (shapeType) {
      case PhysicsShapeType.SPHERE:
        shape = new Sphere(size.x); // Usa x como raio
        break;

      case PhysicsShapeType.CYLINDER:
        shape = new Cylinder(size.x, size.x, size.y, 16); // Raio superior, raio inferior, altura, segmentos
        break;

      case PhysicsShapeType.BOX:
      default:
        shape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
        break;
    }

    // Adicionar forma ao corpo
    this.body.addShape(shape);

    // Configurar propriedades físicas
    this.body.material = {
      friction: friction,
      restitution: restitution
    } as any;

    // Armazenar referência da entidade
    this._userData = { entity: this.entity };
  }

  /**
   * Inicializa o componente
   */
  onInit(): void {
    if (!this._initialized) {
      // Inicializar posição a partir do objeto 3D se não foi definida no construtor
      const position = this.entity.object3D.position;
      this.body.position.set(position.x, position.y, position.z);

      // Inicializar rotação a partir do objeto 3D
      const quaternion = this.entity.object3D.quaternion;
      this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

      this._initialized = true;
    }
  }

  /**
   * Atualiza a transformação da entidade com base no corpo físico
   * @param deltaTime Tempo decorrido desde o último frame em segundos
   */
  onUpdate(): void {
    if (!this._transformUpdated && this.body) {
      // Atualizar posição do objeto 3D a partir do corpo físico
      const pos = this.body.position;
      this.entity.object3D.position.set(pos.x, pos.y, pos.z);

      // Atualizar rotação do objeto 3D a partir do corpo físico
      const quat = this.body.quaternion;
      this.entity.object3D.quaternion.set(quat.x, quat.y, quat.z, quat.w);

      this._transformUpdated = true;
    }
  }

  /**
   * Chamado quando o componente é removido da entidade
   */
  onRemove(): void {
    // Limpar referência da entidade
    this._userData = null;
  }

  /**
   * Aplica uma força ao corpo físico
   * @param force Força a ser aplicada
   * @param worldPoint Ponto no espaço onde a força será aplicada (opcional)
   */
  applyForce(force: Vector3, worldPoint?: Vector3): void {
    if (!this.body || this.body.type === Body.STATIC) return;

    const forceVec = new Vec3(force.x, force.y, force.z);

    if (worldPoint) {
      const worldPointVec = new Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
      this.body.applyForce(forceVec, worldPointVec);
    } else {
      this.body.applyForce(forceVec, this.body.position);
    }
  }

  /**
   * Aplica um impulso ao corpo físico
   * @param impulse Impulso a ser aplicado
   * @param worldPoint Ponto no espaço onde o impulso será aplicado (opcional)
   */
  applyImpulse(impulse: Vector3, worldPoint?: Vector3): void {
    if (!this.body || this.body.type === Body.STATIC) return;

    const impulseVec = new Vec3(impulse.x, impulse.y, impulse.z);

    if (worldPoint) {
      const worldPointVec = new Vec3(worldPoint.x, worldPoint.y, worldPoint.z);
      this.body.applyImpulse(impulseVec, worldPointVec);
    } else {
      this.body.applyImpulse(impulseVec, this.body.position);
    }
  }

  /**
   * Define a velocidade linear do corpo
   * @param velocity Nova velocidade
   */
  setVelocity(velocity: Vector3): void {
    if (!this.body) return;
    this.body.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  /**
   * Define a velocidade angular do corpo
   * @param angularVelocity Nova velocidade angular
   */
  setAngularVelocity(angularVelocity: Vector3): void {
    if (!this.body) return;
    this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
  }

  /**
   * Sincroniza a posição do objeto 3D com o corpo físico
   */
  syncPositionToPhysics(): void {
    if (!this.body) return;

    const position = this.entity.object3D.position;
    this.body.position.set(position.x, position.y, position.z);
  }

  /**
   * Sincroniza a rotação do objeto 3D com o corpo físico
   */
  syncRotationToPhysics(): void {
    if (!this.body) return;

    const quaternion = this.entity.object3D.quaternion;
    this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }

  /**
   * Chama quando ocorre uma colisão com outra entidade
   * @param otherEntity Entidade com a qual colidiu
   */
  handleCollisionEnter(otherEntity: IGameEntity): void {
    if (!this._collidingEntities.has(otherEntity)) {
      this._collidingEntities.add(otherEntity);

      // Disparar evento de colisão para os scripts
      this.dispatchCollisionEvent(otherEntity, 'onCollisionEnter');
    }
  }

  /**
   * Chama quando uma colisão com outra entidade persiste
   * @param otherEntity Entidade com a qual continua colidindo
   */
  handleCollisionStay(otherEntity: IGameEntity): void {
    if (this._collidingEntities.has(otherEntity)) {
      // Disparar evento de colisão para os scripts
      this.dispatchCollisionEvent(otherEntity, 'onCollisionStay');
    }
  }

  /**
   * Chama quando uma colisão com outra entidade termina
   * @param otherEntity Entidade com a qual parou de colidir
   */
  handleCollisionExit(otherEntity: IGameEntity): void {
    if (this._collidingEntities.has(otherEntity)) {
      this._collidingEntities.delete(otherEntity);

      // Disparar evento de colisão para os scripts
      this.dispatchCollisionEvent(otherEntity, 'onCollisionExit');
    }
  }

  /**
   * Dispara eventos de colisão para todos os scripts da entidade
   * @param otherEntity Entidade com a qual ocorreu a colisão
   * @param eventType Tipo de evento de colisão
   */
  private dispatchCollisionEvent(otherEntity: IGameEntity, eventType: 'onCollisionEnter' | 'onCollisionStay' | 'onCollisionExit'): void {
    // Obtém todos os scripts da entidade que possam estar interessados em colisões
    // Usando método seguro que funciona com a interface IGameEntity
    const scripts = this.getEntityScripts(this.entity);

    // Notificar scripts sobre o evento de colisão
    scripts.forEach(script => {
      if (script[eventType]) {
        script[eventType](otherEntity);
      }
    });
  }

  /**
   * Obtém todos os scripts de uma entidade de forma segura
   * @param entity Entidade para obter os scripts
   * @returns Array de scripts
   */
  private getEntityScripts(entity: IGameEntity): any[] {
    // Usa reflexão ou acesso indireto para obter os scripts
    // Como a propriedade 'scripts' não está na interface IGameEntity
    const scripts: any[] = [];

    try {
      // Tenta acessar o mapa de scripts da BaseEntity
      const scriptsMap = (entity as any).scripts;
      if (scriptsMap && scriptsMap instanceof Map) {
        scriptsMap.forEach(script => scripts.push(script));
      }
    } catch {
      g_core.getCoreLogger().warn('Failed to access scripts map on entity:', entity.id);
    }

    return scripts;
  }

  /**
   * Prepara o componente para o próximo frame
   */
  prepareForUpdate(): void {
    this._transformUpdated = false;
  }

  /**
   * Clona o componente para outra entidade
   */
  clone(): IGameComponent {
    const newEntity = arguments[0] || this.entity;

    // Extrair as propriedades atuais para recriar o componente
    const options: PhysicsBodyOptions = {
      mass: this.body.mass,
      shapeType: this.shapeType,
      isKinematic: this.body.type === Body.KINEMATIC,
      useGravity: this.useGravity,
      friction: this.body.material ? (this.body.material as any).friction : 0.3,
      restitution: this.body.material ? (this.body.material as any).restitution : 0.3,
      linearDamping: this.body.linearDamping,
      angularDamping: this.body.angularDamping,
      isTrigger: this.isTrigger,
      collisionGroup: this.body.collisionFilterGroup,
      collisionMask: this.body.collisionFilterMask
    };

    // Obter dimensões da forma original
    const shape = this.body.shapes[0];
    if (shape instanceof Box) {
      options.size = new Vector3(
        shape.halfExtents.x * 2,
        shape.halfExtents.y * 2,
        shape.halfExtents.z * 2
      );
    } else if (shape instanceof Sphere) {
      options.size = new Vector3(shape.radius, shape.radius, shape.radius);
    } else if (shape instanceof Cylinder) {
      options.size = new Vector3(shape.radiusTop, shape.height, shape.radiusTop);
    }

    return new PhysicsComponent(newEntity, options);
  }

  /**
   * Serializa o componente para JSON
   */
  toJSON(): object {
    const json = super.toJSON() as any;

    // Adicionar propriedades do componente de física
    json.physics = {
      shapeType: this.shapeType,
      isTrigger: this.isTrigger,
      useGravity: this.useGravity,
      mass: this.body.mass,
      type: this.body.type,
      linearDamping: this.body.linearDamping,
      angularDamping: this.body.angularDamping,
      position: [this.body.position.x, this.body.position.y, this.body.position.z],
      quaternion: [this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w],
      velocity: [this.body.velocity.x, this.body.velocity.y, this.body.velocity.z],
      angularVelocity: [this.body.angularVelocity.x, this.body.angularVelocity.y, this.body.angularVelocity.z],
      collisionGroup: this.body.collisionFilterGroup,
      collisionMask: this.body.collisionFilterMask,
    };

    // Serializar forma específica
    const shape = this.body.shapes[0];
    if (shape instanceof Box) {
      json.physics.shape = {
        type: 'box',
        halfExtents: [shape.halfExtents.x, shape.halfExtents.y, shape.halfExtents.z]
      };
    } else if (shape instanceof Sphere) {
      json.physics.shape = {
        type: 'sphere',
        radius: shape.radius
      };
    } else if (shape instanceof Cylinder) {
      json.physics.shape = {
        type: 'cylinder',
        radiusTop: shape.radiusTop,
        radiusBottom: shape.radiusBottom,
        height: shape.height
      };
    }

    return json;
  }

  /**
   * Deserializa o componente a partir de JSON
   * @param json Objeto JSON com dados do componente
   */
  fromJSON(json: object): void {
    super.fromJSON(json);

    const data = json as any;

    if (data.physics) {
      const p = data.physics;

      // Atualizar propriedades básicas
      this.isTrigger = p.isTrigger;
      this.shapeType = p.shapeType;
      this.useGravity = p.useGravity !== undefined ? p.useGravity : true;

      // Atualizar corpo
      if (this.body) {
        // Atualizar massa e tipo
        this.body.mass = p.mass;
        this.body.type = p.type;

        // Atualizar amortecimento
        this.body.linearDamping = p.linearDamping;
        this.body.angularDamping = p.angularDamping;

        // Atualizar filtros de colisão
        this.body.collisionFilterGroup = p.collisionGroup;
        this.body.collisionFilterMask = p.collisionMask;

        // Atualizar posição e orientação
        if (p.position) {
          this.body.position.set(p.position[0], p.position[1], p.position[2]);
        }

        if (p.quaternion) {
          this.body.quaternion.set(p.quaternion[0], p.quaternion[1], p.quaternion[2], p.quaternion[3]);
        }

        // Atualizar velocidades
        if (p.velocity) {
          this.body.velocity.set(p.velocity[0], p.velocity[1], p.velocity[2]);
        }

        if (p.angularVelocity) {
          this.body.angularVelocity.set(p.angularVelocity[0], p.angularVelocity[1], p.angularVelocity[2]);
        }
      }
    }
  }

  /**
   * Obtém os dados do usuário associados ao corpo
   */
  getUserData(): any {
    return this._userData;
  }
}