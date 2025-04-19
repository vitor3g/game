import type { AmmoPhysics } from '@enable3d/ammo-physics';
import * as THREE from 'three';
import { AssetType } from '../core/AssetManager';
import { DummyLookupSystem } from './DummyLookupSystem';
import { GameWorld } from './GameWorld';
import { SkyEntity } from './sky/SkyEntity';
import { VehicleEntity } from './vehicle/VehicleEntity';

export class Game {
  private readonly gameWorld: GameWorld;

  /* Systems */
  private readonly dummyLookupSystem: DummyLookupSystem;

  constructor() {
    this.gameWorld = new GameWorld(
      'game-world',
      g_core.getGraphics().getRendererScene(),
    );
    this.dummyLookupSystem = new DummyLookupSystem(this.gameWorld);
  }

  public async start() {
    g_core
      .getAssetManager()
      .register('s15', '/data/vehicles/veh.glb', AssetType.MODEL_GLTF);
    await g_core.getAssetManager().load('s15');

    this._applySystems();

    this._applyComponents();
    this._applyEntities();

    this.gameWorld.initialize();
  }

  public _applySystems() {
    this.gameWorld.addSystem(this.dummyLookupSystem);
  }

  public _applyComponents() {
    /* Sky */
    const skyEntity = new SkyEntity(this.gameWorld);
    this.gameWorld.addEntity(skyEntity);
  }

  public _applyEntities() {
    const physics = g_core.getGraphics().getRenderer().getPhysics();

    // Create a larger ground
    const groundSize = { width: 300, height: 300 };
    const ground = physics.add.ground({
      width: groundSize.width,
      height: groundSize.height,
      y: -1,
    });
    ground.body.setFriction(1);

    this._createTestTrack(physics);

    const vehicle = new VehicleEntity(this.gameWorld);
    this.gameWorld.addEntity(vehicle);
  }

  private _createTestTrack(physics: AmmoPhysics) {
    this._createFlatPlatform(
      physics,
      { x: 0, y: 0, z: 0 },
      { width: 50, height: 50 },
      0x8ecccc,
    );

    this._createRamp(
      physics,
      { x: 40, y: 0, z: 0 },
      { width: 20, height: 10 },
      15,
      0xcc8e8e,
    );

    this._createFlatPlatform(
      physics,
      { x: 70, y: 5.3, z: 0 },
      { width: 30, height: 20 },
      0x8ecc8e,
    );

    this._createRamp(
      physics,
      { x: 100, y: 5.3, z: 0 },
      { width: 20, height: 10 },
      -15,
      0xcc8ecc,
    );

    this._createBumpyRoad(
      physics,
      { x: -50, y: 0, z: 0 },
      { length: 60, width: 15 },
      6,
    );

    this._createSlalomCourse(physics, { x: 0, y: 0, z: 40 }, 80);

    this._createLoop(physics, { x: -60, y: 0, z: -40 });
  }

  private _createFlatPlatform(
    physics: AmmoPhysics,
    position: { x: number; y: number; z: number },
    size: any,
    color = 0x8ecc8e,
  ) {
    const platform = physics.add.box({
      x: position.x,
      y: position.y,
      z: position.z,
      width: size.width,
      height: 2,
      depth: size.height,
      mass: 0,
    });

    platform.body.setFriction(1);
    platform.material = new THREE.MeshLambertMaterial({ color: color });
  }

  private _createRamp(
    physics: AmmoPhysics,
    position: { x: number; y: number; z: number },
    size: any,
    angle: number,
    color = 0x8ecccc,
  ) {
    const ramp = physics.add.box({
      x: position.x,
      y:
        position.y +
        (Math.sin(THREE.MathUtils.degToRad(angle)) * size.width) / 2,
      z: position.z,
      width: size.width,
      height: 2,
      depth: size.height,
      mass: 0,
    });

    ramp.rotation.z = THREE.MathUtils.degToRad(-angle);
    ramp.body.needUpdate = true;
    ramp.body.setFriction(1);
    ramp.material = new THREE.MeshLambertMaterial({ color: color });
  }

  private _createBumpyRoad(
    physics: AmmoPhysics,
    position: { x: number; y: number; z: number },
    size: any,
    bumpCount: number,
  ) {
    const bumpSpacing = size.length / bumpCount;
    const bumpHeight = 0.6;

    this._createFlatPlatform(
      physics,
      { x: position.x, y: position.y, z: position.z },
      { width: size.length, height: size.width },
      0xcccccc,
    );

    for (let i = 0; i < bumpCount; i++) {
      const x =
        position.x - size.length / 2 + i * bumpSpacing + bumpSpacing / 2;

      const bump = physics.add.cylinder({
        x: x,
        y: position.y + bumpHeight / 2,
        z: position.z,
        radiusTop: bumpHeight,
        radiusBottom: bumpHeight,
        height: size.width - 1,
        mass: 0,
        radiusSegments: 16,
      });

      bump.rotation.x = Math.PI / 2;
      bump.body.needUpdate = true;

      bump.body.setFriction(1);
      bump.material = new THREE.MeshLambertMaterial({ color: 0x8e8ecc });
    }
  }

  private _createSlalomCourse(
    physics: AmmoPhysics,
    position: { x: number; y: number; z: number },
    length: number,
  ) {
    this._createFlatPlatform(
      physics,
      { x: position.x, y: position.y, z: position.z },
      { width: length, height: 20 },
      0xdfdfdf,
    );

    const barrierCount = 6;
    const barrierSpacing = length / (barrierCount + 1);

    for (let i = 0; i < barrierCount; i++) {
      const x = position.x - length / 2 + (i + 1) * barrierSpacing;
      const offsetZ = i % 2 === 0 ? 5 : -5;

      const barrier = physics.add.box({
        x: x,
        y: position.y + 3,
        z: position.z + offsetZ,
        width: 2,
        height: 6,
        depth: 2,
        mass: 0,
      });

      barrier.body.setFriction(0.8);
      barrier.material = new THREE.MeshLambertMaterial({ color: 0xff8888 });
    }
  }

  private _createLoop(
    physics: AmmoPhysics,
    position: { x: number; y: number; z: number },
  ) {
    this._createFlatPlatform(
      physics,
      { x: position.x, y: position.y, z: position.z - 20 },
      { width: 40, height: 10 },
      0xb6b6b6,
    );

    this._createFlatPlatform(
      physics,
      { x: position.x, y: position.y, z: position.z + 20 },
      { width: 40, height: 10 },
      0xb6b6b6,
    );

    this._createBankedCurve(
      physics,
      { x: position.x + 20, y: position.y, z: position.z },
      'right',
    );

    this._createBankedCurve(
      physics,
      { x: position.x - 20, y: position.y, z: position.z },
      'left',
    );
  }

  private _createBankedCurve(
    physics: AmmoPhysics,
    position: { x: number; y: number; z: number },
    direction: string,
  ) {
    const segments = 8;
    const radius = 20;
    const width = 10;
    const bankAngle = 15;

    for (let i = 0; i < segments; i++) {
      const angle = (Math.PI / 2) * (i / (segments - 1));
      let x, z;

      if (direction === 'right') {
        x = position.x + radius * Math.cos(angle);
        z = position.z + radius * Math.sin(angle) - radius;
      } else {
        // left
        x = position.x - radius * Math.cos(angle);
        z = position.z + radius * Math.sin(angle) - radius;
      }

      const segment = physics.add.box({
        x: x,
        y: position.y,
        z: z,
        width: 5,
        height: 2,
        depth: width,
        mass: 0,
      });

      let bankRotation = 0;
      if (direction === 'right') {
        bankRotation = THREE.MathUtils.degToRad(bankAngle);
      } else {
        bankRotation = THREE.MathUtils.degToRad(-bankAngle);
      }

      if (direction === 'right') {
        segment.rotation.y = angle;
      } else {
        segment.rotation.y = Math.PI - angle;
      }

      segment.rotation.z = bankRotation;

      segment.body.needUpdate = true;
      segment.body.setFriction(1);
      segment.material = new THREE.MeshLambertMaterial({ color: 0xaaaadd });
    }
  }

  public getGameWorld() {
    return this.gameWorld;
  }
}
