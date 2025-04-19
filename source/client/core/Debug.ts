import type { AmmoPhysics } from '@enable3d/ammo-physics';
import * as THREE from 'three';
import { CommonEvents } from '../enums/CommonEventsEnum';

export class Debug {
  private _showFps = true;
  private _showPhysicsDebug = false;

  constructor() {
    g_core
      .getInternalNet()
      .on(CommonEvents.EVENT_UPDATE, this.update.bind(this));

    g_core.getConsole().setMenuItems('Overlays', [
      {
        label: 'Show FPS',
        callback: () => this.toggleFps(),
      },
      {
        label: 'Show Physics Debug',
        callback: () => this.togglePhysicsDebug(),
      },
    ]);
  }

  public toggleFps() {
    this._showFps = !this._showFps;
  }

  public togglePhysicsDebug() {
    this._showPhysicsDebug = !this._showPhysicsDebug;

    if (this._showPhysicsDebug) {
      g_core.getGame().getPhysics().debug?.enable();
    } else {
      g_core.getGame().getPhysics().debug?.disable();
    }
  }

  public update() {
    const io = g_core.getGraphics().getGUI().getIO();

    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    if (this._showPhysicsDebug) {
      g_core.getGame().getPhysics().updateDebugger();
    }

    if (this._showFps) {
      g_core
        .getGraphics()
        .getGUI()
        .getPrimitives()
        .addText(fps, 10, 10, '#090909');
    }
  }

  public _createDebugMap() {
    const physics = g_core.getGame().getPhysics();

    // Create a larger ground
    const groundSize = { width: 300, height: 300 };
    const ground = physics.add.ground({
      width: groundSize.width,
      height: groundSize.height,
      y: -1,
    });
    ground.body.setFriction(1);

    this._createTestTrack(physics);
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
}
