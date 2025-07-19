import { AssetType } from '../core/AssetManager';
import { DummyLookupSystem } from './DummySystemLookup';
import { Physics } from './Physics';
import { s15 } from './vehicles/nissan/s15';
import { World } from './World';

export class ClientGame {
  private readonly world: World;
  private readonly physics: Physics;

  /* Systems */
  private readonly dummyLookupSystem: DummyLookupSystem;

  constructor() {
    this.physics = new Physics();
    this.world = new World();

    this.dummyLookupSystem = new DummyLookupSystem(this.world);
  }

  public async initialize() {
    g_core
      .getAssetManager()
      .register('vehicles:s15', '/data/vehicles/s15.glb', AssetType.MODEL_GLTF);

    g_core
      .getAssetManager()
      .register('vehicles:a86', '/data/vehicles/a86.glb', AssetType.MODEL_GLTF);

    g_core
      .getAssetManager()
      .createGroup('vehicles', ['vehicles:a86', 'vehicles:s15'], () => {});

    await g_core.getAssetManager().loadGroup('vehicles');

    this.world.initialize();
    this.physics.initialize();
    this.world.addSystem(this.dummyLookupSystem);

    const vehicle = new s15();
    this.world.addEntity(vehicle);

    this.physics.getAmmo().debug?.enable();

    setInterval(() => {
      this.physics.getAmmo().updateDebugger();
    }, 10);

    const groundSize = { width: 300, height: 300 };
    const ground = this.physics.getAmmo().add.ground({
      width: groundSize.width,
      height: groundSize.height,
      y: -1,
    });
    ground.body.setFriction(1);
  }

  public getWorld(): World {
    return this.world;
  }

  public getPhysics() {
    return this.physics;
  }
}
