import { BaseComponent } from '@/client/ecs/BaseComponent';
import type { IGameEntity } from '@/client/ecs/interfaces';
import type { ExtendedMesh } from '@enable3d/ammo-physics';
import AmmoTypes from 'ammojs-typed';
import * as THREE from 'three';
import { DummySystem } from '../DummySystem';
import { VehicleChassis } from './VehicleChassis';

export class VehiclePhysics extends BaseComponent {
  private tuning!: AmmoTypes.btVehicleTuning;
  private vehicle!: AmmoTypes.btRaycastVehicle;
  private wheelMeshes: ExtendedMesh[] = [];

  readonly type: string = 'VehiclePhysics';

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis) return;

    const physics = g_core.getGame().getPhysics();
    if (!physics) return;

    this.tuning = new Ammo.btVehicleTuning();
    const raycaster = new Ammo.btDefaultVehicleRaycaster(physics.physicsWorld);

    this.vehicle = new Ammo.btRaycastVehicle(
      this.tuning,
      chassis.chassisMesh.body.ammo,
      raycaster,
    );

    chassis.chassisMesh.body.skipUpdate = true;

    this.vehicle.setCoordinateSystem(0, 1, 2);
    physics.physicsWorld.addAction(this.vehicle);

    const dummies = g_core
      .getGame()
      .getGameWorld()
      .getSystem<DummySystem>(DummySystem);
    if (!dummies) return;

    const wheels: Record<
      string,
      { index: number; isFront: boolean; isRight: boolean }
    > = {
      wheel_rf_dummy: { index: 0, isFront: true, isRight: true },
      wheel_lf_dummy: { index: 1, isFront: true, isRight: false },
      wheel_rb_dummy: { index: 2, isFront: false, isRight: true },
      wheel_lb_dummy: { index: 3, isFront: false, isRight: false },
    };

    Object.keys(wheels).forEach((key) => {
      const wheelInfo = wheels[key];
      const dummy = dummies.getDummy(this.entity, key);

      if (dummy) {
        const relPos = new Ammo.btVector3(
          dummy.position.x,
          dummy.position.y,
          dummy.position.z,
        );

        this.addWheel(
          wheelInfo.isFront,
          relPos,
          0.2,
          wheelInfo.index,
          wheelInfo.isRight,
        );
      }
    });
  }

  addWheel(
    isFront: boolean,
    pos: AmmoTypes.btVector3,
    radius: number,
    index: number,
    isRight: boolean,
  ) {
    const tire = this.entity.getComponent<VehicleChassis>(VehicleChassis);

    if (!tire) return;

    const suspensionRestLength = 0.2;

    const suspensionStiffness = 25.0;
    const suspensionDamping = 2.5;
    const suspensionCompression = 4.4;

    const friction = 10;
    const rollInfluence = 0.001;

    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    const wheelInfo = this.vehicle.addWheel(
      pos,
      wheelDirectionCS0,
      wheelAxleCS,
      suspensionRestLength,
      radius,
      this.tuning,
      isFront,
    );

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);

    wheelInfo.set_m_frictionSlip(friction);
    wheelInfo.set_m_rollInfluence(rollInfluence);

    this.wheelMeshes[index] = tire.tireMesh.clone(true);

    if (isRight) {
      this.wheelMeshes[index].rotateY(Math.PI);
    }

    this.entity.object3D.add(this.wheelMeshes[index]);
  }

  onUpdate() {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis) return;

    const dummies = g_core
      .getGame()
      .getGameWorld()
      .getSystem<DummySystem>(DummySystem);
    if (!dummies) return;

    let tm = this.vehicle.getChassisWorldTransform();
    let p = tm.getOrigin();
    let q = tm.getRotation();

    chassis.chassisMesh.position.set(p.x(), p.y(), p.z());
    chassis.chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());

    const wheelNames = [
      'wheel_rf_dummy',
      'wheel_lf_dummy',
      'wheel_rb_dummy',
      'wheel_lb_dummy',
    ];

    const isRightWheel = [true, false, true, false];

    for (let i = 0; i < wheelNames.length; i++) {
      this.vehicle.updateWheelTransform(i, true);
      tm = this.vehicle.getWheelTransformWS(i);
      q = tm.getRotation();

      const dummy = dummies.getDummy(this.entity, wheelNames[i]);

      if (dummy) {
        const dummyWorldPos = new THREE.Vector3();
        dummy.getWorldPosition(dummyWorldPos);

        this.wheelMeshes[i].position.copy(dummyWorldPos);

        this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());

        if (isRightWheel[i]) {
          const rightWheelRotation = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            Math.PI,
          );

          this.wheelMeshes[i].quaternion.multiply(rightWheelRotation);
        }
      } else {
        p = tm.getOrigin();
        this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
        this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());

        if (isRightWheel[i]) {
          const rightWheelRotation = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            Math.PI,
          );
          this.wheelMeshes[i].quaternion.multiply(rightWheelRotation);
        }
      }
    }
  }

  public getVehicle(): AmmoTypes.btRaycastVehicle {
    return this.vehicle;
  }
}
