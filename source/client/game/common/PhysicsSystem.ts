import type { ContextLogger } from '@/client/core/Console';
import { BaseSystem } from '@/client/ecs/BaseSystem';
import { SystemPriority, type IGameComponent, type IGameEntity, type IGameWorld } from '@/client/ecs/interfaces';
import { Body, ContactEquation, ContactMaterial, GSSolver, Material, RaycastResult, Vec3, World } from 'cannon-es';
import { PhysicsComponent } from './PhysicsComponent';

export interface PhysicsSystemOptions {
  gravity?: Vec3;
  fixedTimeStep?: number;
  maxSubSteps?: number;
  contactEquationRelaxation?: number;
  contactEquationStiffness?: number;
  enableCCD?: boolean;
  debug?: boolean;
}


export interface RaycastHit {
  hasHit: boolean;
  hitPointWorld?: Vec3;
  hitNormalWorld?: Vec3;
  distance?: number;
  body?: Body | null;
  point?: Vec3;
  shape?: any;
}

export class PhysicsSystem extends BaseSystem {
  readonly physicsWorld: World;

  private bodyToComponent = new Map<Body, PhysicsComponent>();

  private entityToBody = new Map<string, Body>();

  private fixedTimeStep: number;

  private maxSubSteps: number;

  private defaultMaterial: Material;

  private debug: boolean;

  private readonly logger: ContextLogger;

  constructor(world: IGameWorld, name = 'PhysicsSystem', options: PhysicsSystemOptions = {}) {
    super(world, name, SystemPriority.HIGH);

    const {
      gravity = new Vec3(0, -9.82, 0),
      fixedTimeStep = 1 / 60,
      maxSubSteps = 3,
      contactEquationRelaxation = 3,
      contactEquationStiffness = 1e6,
      debug = false
    } = options;

    this.physicsWorld = new World({
      gravity,
      allowSleep: true,
    });

    this.logger = g_core.getConsole().NewLoggerCtx("dz::physics-system");

    const solver = new GSSolver();

    solver.iterations = 10;
    solver.tolerance = 0.001;

    this.physicsWorld.solver = solver;

    (this.physicsWorld.defaultContactMaterial as any).contactEquationStiffness = contactEquationStiffness;
    (this.physicsWorld.defaultContactMaterial as any).contactEquationRelaxation = contactEquationRelaxation;

    this.defaultMaterial = new Material('default');

    const defaultContactMaterial = new ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.3,
        restitution: 0.3,
        contactEquationStiffness: contactEquationStiffness,
        contactEquationRelaxation: contactEquationRelaxation,
      }
    );

    this.physicsWorld.addContactMaterial(defaultContactMaterial);

    this.fixedTimeStep = fixedTimeStep;
    this.maxSubSteps = maxSubSteps;
    this.debug = debug;

    this.setupCollisionEvents();
  }

  private setupCollisionEvents(): void {
    this.physicsWorld.addEventListener('beginContact', (event: any) => {
      const bodyA = event.bodyA;
      const bodyB = event.bodyB;

      const componentA = this.bodyToComponent.get(bodyA);
      const componentB = this.bodyToComponent.get(bodyB);

      if (componentA && componentB) {
        const entityA = componentA.entity;
        const entityB = componentB.entity;

        componentA.handleCollisionEnter(entityB);
        componentB.handleCollisionEnter(entityA);
      }
    });

    this.physicsWorld.addEventListener('endContact', (event: any) => {
      const bodyA = event.bodyA;
      const bodyB = event.bodyB;

      const componentA = this.bodyToComponent.get(bodyA);
      const componentB = this.bodyToComponent.get(bodyB);

      if (componentA && componentB) {
        const entityA = componentA.entity;
        const entityB = componentB.entity;

        componentA.handleCollisionExit(entityB);
        componentB.handleCollisionExit(entityA);
      }
    });
  }

  checkEntityCompatibility(entity: IGameEntity): boolean {
    const hasComponent = entity.hasComponent(PhysicsComponent);
    this.logger.log(`Checking compatibility for ${entity.name}: ${hasComponent}`);

    if (!hasComponent) {
      const components = (entity as any)._components || [];
      const hasPhysicsComponentType = Array.from(components.values())
        .some((comp: any) => comp.type === 'PhysicsComponent');

      if (hasPhysicsComponentType) {
        this.logger.log(`Physics component found by type in ${entity.name}`);
        return true;
      }
    }

    return hasComponent;
  }

  protected onInitialize(): void {
    if (this.debug) {
      this.logger.log(`Initializing physics system`);
    }
  }

  protected onDestroy(): void {
    if (this.debug) {
      this.logger.log(`Destroying physics system`);
    }

    this.bodyToComponent.clear();
    this.entityToBody.clear();
  }

  protected onEntityAdded(entity: IGameEntity): void {
    const physicsComponent = entity.getComponent(PhysicsComponent);

    if (physicsComponent) {
      this.physicsWorld.addBody(physicsComponent.body);

      this.bodyToComponent.set(physicsComponent.body, physicsComponent);
      this.entityToBody.set(entity.id, physicsComponent.body);

      if (this.debug) {
        this.logger.log(`Added entity ${entity.name} (${entity.id}) to physics world`);
      }
    }
  }

  protected onEntityRemoved(entity: IGameEntity): void {
    const body = this.entityToBody.get(entity.id);

    if (body) {
      this.physicsWorld.removeBody(body);

      this.bodyToComponent.delete(body);
      this.entityToBody.delete(entity.id);

      if (this.debug) {
        this.logger.log(`Removed entity ${entity.name} (${entity.id}) from physics world`);
      }
    }
  }

  processEntity(entity: IGameEntity): void {
    const physicsComponent = entity.getComponent(PhysicsComponent);

    if (physicsComponent) {
      physicsComponent.prepareForUpdate();

      if (physicsComponent.body.type === Body.KINEMATIC) {
        physicsComponent.syncPositionToPhysics();
        physicsComponent.syncRotationToPhysics();
      }
    }
  }

  protected beforeUpdate(deltaTime: number): void {
    const clampedDelta = Math.min(deltaTime, 0.1);

    this.physicsWorld.step(this.fixedTimeStep, clampedDelta, this.maxSubSteps);

    this.processCollisionEvents();
  }

  private processCollisionEvents(): void {
    const contacts = this.physicsWorld.contacts;
    const contactPairs = new Map<string, ContactEquation[]>();

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      const bodyA = contact.bi;
      const bodyB = contact.bj;

      const componentA = this.bodyToComponent.get(bodyA);
      const componentB = this.bodyToComponent.get(bodyB);

      if (componentA && componentB) {
        const entityA = componentA.entity;
        const entityB = componentB.entity;

        const pairKey = entityA.id < entityB.id
          ? `${entityA.id}:${entityB.id}`
          : `${entityB.id}:${entityA.id}`;

        if (!contactPairs.has(pairKey)) {
          contactPairs.set(pairKey, []);
        }

        const contactList = contactPairs.get(pairKey);
        if (contactList) {
          contactList.push(contact);
        }
      }
    }

    contactPairs.forEach((_contacts, pairKey) => {
      const [idA, idB] = pairKey.split(':');

      const entityA = this.getEntityById(idA);
      const entityB = this.getEntityById(idB);

      if (entityA && entityB) {
        const componentA = entityA.getComponent(PhysicsComponent);
        const componentB = entityB.getComponent(PhysicsComponent);

        if (componentA && componentB) {
          componentA.handleCollisionStay(entityB);
          componentB.handleCollisionStay(entityA);
        }
      }
    });
  }

  private getEntityById(id: string): IGameEntity | undefined {
    for (const entity of this.entities) {
      if (entity.id === id) {
        return entity;
      }
    }
    return undefined;
  }

  protected getCompatibleComponents(entity: IGameEntity): IGameComponent[] {
    const physicsComponent = entity.getComponent(PhysicsComponent);
    return physicsComponent ? [physicsComponent] : [];
  }

  onComponentAdded(entity: IGameEntity, component: IGameComponent): void {
    if (component.type === 'PhysicsComponent' && !this.entities.has(entity)) {
      this.addEntity(entity);
    }
    else if (!this.entities.has(entity) && this.checkEntityCompatibility(entity)) {
      this.addEntity(entity);
    }
  }

  onComponentRemoved(entity: IGameEntity, component: IGameComponent): void {
    if (component.type === 'PhysicsComponent' && this.entities.has(entity)) {
      const physicsComponent = component as PhysicsComponent;
      const body = physicsComponent.body;

      if (body) {
        this.physicsWorld.removeBody(body);

        this.bodyToComponent.delete(body);
        this.entityToBody.delete(entity.id);

        if (this.debug) {
          this.logger.log(`Removed physics component from entity ${entity.name} (${entity.id})`);
        }
      }
    }
  }

  preRender?(): void {}

  postRender?(): void {}

  protected onEnable(): void {
    if (this.debug) {
      this.logger.log(`Physics system enabled`);
    }
  }

  protected onDisable(): void {
    if (this.debug) {
      this.logger.log(`Physics system disabled`);
    }
  }

  setGravity(gravity: Vec3): void {
    this.physicsWorld.gravity.copy(gravity);
  }

  getGravity(): Vec3 {
    return this.physicsWorld.gravity;
  }

  raycast(from: Vec3, to: Vec3, options: any = {}): RaycastHit | null {
    try {
      if (this.debug) {
        this.logger.debug(`Raycast from ${from.toString()} to ${to.toString()}`);
      }

      const result = new RaycastResult();

      const rayOptions = {
        skipBackfaces: true,
        collisionFilterMask: options.collisionFilterMask || -1,
        ...options
      };

      const hasHit = this.physicsWorld.raycastClosest(from, to, rayOptions, result);

      if (hasHit) {
        return {
          hasHit: true,
          hitPointWorld: result.hitPointWorld,
          hitNormalWorld: result.hitNormalWorld,
          distance: result.distance,
          body: result.body,
          shape: result.shape
        };
      }

      return {
        hasHit: false
      };
    } catch (error) {
      this.logger.error(`Error in raycast: ${error}`);
      return {
        hasHit: false
      };
    }
  }

  // Implementação aprimorada do raycastFirst
  raycastFirst(from: Vec3, to: Vec3, options: any = {}): RaycastHit | null {
    try {
      if (this.debug) {
        this.logger.debug(`RaycastFirst from ${from.toString()} to ${to.toString()}`);
      }

      // Verifique se existem corpos no mundo físico
      if (this.physicsWorld.bodies.length === 0) {
        if (this.debug) {
          this.logger.debug('No bodies in physics world, raycast will always miss');
        }
        return { hasHit: false };
      }

      // Certifique-se de que o filterCollisionMask está sendo mapeado corretamente
      const rayOptions = {
        skipBackfaces: true,
        // Importante: Use a máscara filtrada de acordo com o padrão do cannon-es
        collisionFilterMask: options.filterCollisionMask !== undefined ? options.filterCollisionMask : -1
      };

      // Verifique os corpos que poderiam ser atingidos com base na máscara
      if (this.debug) {
        const mask = rayOptions.collisionFilterMask;
        const potentialHits = this.physicsWorld.bodies.filter(
          body => (body.collisionFilterGroup & mask) !== 0
        );
        this.logger.debug(`Potential bodies that could be hit: ${potentialHits.length}`);
      }

      // Execute o raycast usando a API nativa do cannon-es
      const result = new RaycastResult();
      const hasHit = this.physicsWorld.raycastClosest(from, to, rayOptions, result);

      if (hasHit && result.body) {
        // Mapear para o formato esperado pelo CameraComponent
        return {
          hasHit: true,
          hitPointWorld: result.hitPointWorld,
          hitNormalWorld: result.hitNormalWorld,
          point: result.hitPointWorld.clone(), // Importante para CameraComponent
          distance: result.distance,
          body: result.body,
          shape: result.shape
        };
      }

      // Caso não tenha hit, retorne o objeto com hasHit: false
      return { hasHit: false };
    } catch (error) {
      this.logger.error(`Error in raycastFirst: ${error}`);
      return { hasHit: false };
    }
  }

  raycastAll(from: Vec3, to: Vec3, options: any = {}): RaycastHit[] {
    try {
      const rayOptions = {
        skipBackfaces: true,
        collisionFilterMask: options.collisionFilterMask || -1,
        ...options
      };

      const hits: RaycastHit[] = [];

      const callback = (result: RaycastResult) => {
        if (result.hasHit) {
          hits.push({
            hasHit: true,
            hitPointWorld: result.hitPointWorld.clone(),
            hitNormalWorld: result.hitNormalWorld.clone(),
            distance: result.distance,
            body: result.body,
            shape: result.shape
          });
        }
      };

      this.physicsWorld.raycastAll(from, to, rayOptions, callback);

      hits.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      return hits;
    } catch (error) {
      this.logger.error(`Error in raycastAll: ${error}`);
      return [];
    }
  }

  addBody(body: Body): void {
    this.physicsWorld.addBody(body);
  }

  removeBody(body: Body): void {
    this.physicsWorld.removeBody(body);
  }
}