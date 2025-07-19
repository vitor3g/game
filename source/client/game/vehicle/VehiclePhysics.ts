import { BaseComponent } from '@/client/ecs/BaseComponent';
import type { ComponentType, IGameEntity } from '@/client/ecs/interfaces';
import { VehicleChassis } from './VehicleChassis';
import AmmoTypes from 'ammojs-typed';
import { DummyLookupSystem } from '../DummySystemLookup';
import type { ExtendedMesh } from '@enable3d/ammo-physics';
import * as THREE from 'three';

export interface VehiclePhysicsState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  linearVelocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
  wheelStates: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    suspensionLength: number;
    skidInfo: number;
  }[];
  engineForce: number;
  brakeForce: number;
  steeringValue: number;
}

export class VehiclePhysics extends BaseComponent {
  private tuning!: AmmoTypes.btVehicleTuning;
  private vehicle!: AmmoTypes.btRaycastVehicle;
  private wheelMeshes: ExtendedMesh[] = [];
  private wheelBaseTransforms: THREE.Matrix4[] = [];
  private wheelTargetMatrices: THREE.Matrix4[] = [];
  private wheelCurrentMatrices: THREE.Matrix4[] = [];
  readonly type: ComponentType = 'VehiclePhysics';

  private currentEngineForce = 0;
  private currentBrakeForce = 0;
  private currentSteeringValue = 0;

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);

    if (!chassis)
      return console.error('[VehiclePhysics]: Vehicle Chassis not found.');

    const physics = g_core.getClient().getClientGame().getPhysics().getAmmo();

    if (!physics)
      return console.error('[VehiclePhysics]: Physics world not found.');

    this.tuning = new Ammo.btVehicleTuning();

    this.tuning.set_m_suspensionStiffness(20.0);
    this.tuning.set_m_suspensionCompression(4.2);
    this.tuning.set_m_suspensionDamping(2.3);
    this.tuning.set_m_maxSuspensionTravelCm(500);
    this.tuning.set_m_frictionSlip(10.0);
    this.tuning.set_m_maxSuspensionForce(6000);

    const raycaster = new Ammo.btDefaultVehicleRaycaster(physics.physicsWorld);

    this.vehicle = new Ammo.btRaycastVehicle(
      this.tuning,
      chassis.collision.body.ammo,
      raycaster,
    );

    chassis.collision.body.skipUpdate = true;

    chassis.collision.body.ammo.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
    chassis.collision.body.ammo.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
    chassis.collision.body.ammo.activate();

    this.vehicle.setCoordinateSystem(0, 1, 2);
    physics.physicsWorld.addAction(this.vehicle);

    const dummySystem = g_core
      .getClient()
      .getClientGame()
      .getWorld()
      .getSystem<DummyLookupSystem>(DummyLookupSystem);

    if (!dummySystem)
      return console.error('[VehiclePhysics]: Dummylookup System not found.');

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
      const dummy = dummySystem.getDummy(this.entity, key);

      if (dummy) {
        const relPos = new Ammo.btVector3(
          dummy.position.x,
          dummy.position.y,
          dummy.position.z,
        );

        this.addWheel(
          wheelInfo.isFront,
          relPos,
          0.37,
          wheelInfo.index,
          wheelInfo.isRight,
        );
      }
    });

    for (let i = 0; i < this.vehicle.getNumWheels(); i++) {
      this.vehicle.setBrake(0, i);
      this.vehicle.applyEngineForce(0, i);
    }
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

    const suspensionRestLength = 0.1;
    const suspensionStiffness = 20.0;
    const suspensionDamping = 2.3;
    const suspensionCompression = 4.2;
    const friction = 1000;
    const rollInfluence = 0.01;

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

    wheelInfo.set_m_maxSuspensionForce(6000);
    wheelInfo.set_m_maxSuspensionTravelCm(500);

    wheelInfo.set_m_skidInfo(1.0);
    wheelInfo.set_m_bIsFrontWheel(isFront);

    this.wheelMeshes[index] = tire.wheel.clone(true);
    this.wheelBaseTransforms[index] = new THREE.Matrix4();
    this.wheelTargetMatrices[index] = new THREE.Matrix4();
    this.wheelCurrentMatrices[index] = new THREE.Matrix4();

    if (isRight) {
      this.wheelBaseTransforms[index].makeRotationY(Math.PI);
    } else {
      this.wheelBaseTransforms[index].identity();
    }

    this.entity.object3D.add(this.wheelMeshes[index]);
  }

  onUpdate() {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis) return;

    const dummies = g_core
      .getClient()
      .getClientGame()
      .getWorld()
      .getSystem<DummyLookupSystem>(DummyLookupSystem);
    if (!dummies) return;

    let tm = this.vehicle.getChassisWorldTransform();
    let p = tm.getOrigin();
    let q = tm.getRotation();

    chassis.collision.position.set(p.x(), p.y(), p.z());
    chassis.collision.quaternion.set(q.x(), q.y(), q.z(), q.w());

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

  onDestroy(): void {
    const physics = g_core.getClient().getClientGame().getPhysics().getAmmo();
    if (physics && this.vehicle) {
      physics.physicsWorld.removeAction(this.vehicle);
    }

    if (this.vehicle) {
      Ammo.destroy(this.vehicle);
    }

    if (this.tuning) {
      Ammo.destroy(this.tuning);
    }
  }

  public getVehicle(): AmmoTypes.btRaycastVehicle {
    return this.vehicle;
  }

  public setEngineForce(force: number): void {
    this.currentEngineForce = force;
  }

  public setBrakeForce(force: number): void {
    this.currentBrakeForce = force;
  }

  public setSteeringValue(value: number): void {
    this.currentSteeringValue = value;
    if (this.vehicle) {
      this.vehicle.setSteeringValue(value, 0);
      this.vehicle.setSteeringValue(value, 1);
    }
  }

  toJSON(): object {
    if (!this.vehicle) {
      return {
        type: this.type,
        enabled: this.enabled,
        initialized: false,
      };
    }

    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis) {
      return {
        type: this.type,
        enabled: this.enabled,
        initialized: false,
      };
    }

    const chassisTransform = this.vehicle.getChassisWorldTransform();
    const chassisPos = chassisTransform.getOrigin();
    const chassisRot = chassisTransform.getRotation();

    const linearVel = chassis.collision.body.ammo.getLinearVelocity();
    const angularVel = chassis.collision.body.ammo.getAngularVelocity();

    const wheelStates: VehiclePhysicsState['wheelStates'] = [];

    for (let i = 0; i < this.vehicle.getNumWheels(); i++) {
      this.vehicle.updateWheelTransform(i, true);
      const wheelTransform = this.vehicle.getWheelTransformWS(i);
      const wheelPos = wheelTransform.getOrigin();
      const wheelRot = wheelTransform.getRotation();
      const wheelInfo = this.vehicle.getWheelInfo(i);

      wheelStates.push({
        position: {
          x: wheelPos.x(),
          y: wheelPos.y(),
          z: wheelPos.z(),
        },
        rotation: {
          x: wheelRot.x(),
          y: wheelRot.y(),
          z: wheelRot.z(),
          w: wheelRot.w(),
        },
        suspensionLength: wheelInfo
          .get_m_raycastInfo()
          .get_m_suspensionLength(),
        skidInfo: wheelInfo.get_m_skidInfo(),
      });
    }

    const state: VehiclePhysicsState = {
      position: {
        x: chassisPos.x(),
        y: chassisPos.y(),
        z: chassisPos.z(),
      },
      rotation: {
        x: chassisRot.x(),
        y: chassisRot.y(),
        z: chassisRot.z(),
        w: chassisRot.w(),
      },
      linearVelocity: {
        x: linearVel.x(),
        y: linearVel.y(),
        z: linearVel.z(),
      },
      angularVelocity: {
        x: angularVel.x(),
        y: angularVel.y(),
        z: angularVel.z(),
      },
      wheelStates,
      engineForce: this.currentEngineForce,
      brakeForce: this.currentBrakeForce,
      steeringValue: this.currentSteeringValue,
    };

    return {
      type: this.type,
      enabled: this.enabled,
      initialized: true,
      state,
    };
  }

  fromJSON(json: object): void {
    super.fromJSON(json);

    const data = json as any;

    if (!data.state || !data.initialized) {
      return;
    }

    const state = data.state as VehiclePhysicsState;

    if (this.vehicle) {
      const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
      if (!chassis) return;

      chassis.collision.body.ammo.setLinearVelocity(
        new Ammo.btVector3(
          state.linearVelocity.x,
          state.linearVelocity.y,
          state.linearVelocity.z,
        ),
      );

      chassis.collision.body.ammo.setAngularVelocity(
        new Ammo.btVector3(
          state.angularVelocity.x,
          state.angularVelocity.y,
          state.angularVelocity.z,
        ),
      );

      const transform = chassis.collision.body.ammo.getWorldTransform();
      const origin = transform.getOrigin();
      const rotation = transform.getRotation();

      origin.setValue(state.position.x, state.position.y, state.position.z);
      rotation.setValue(
        state.rotation.x,
        state.rotation.y,
        state.rotation.z,
        state.rotation.w,
      );

      chassis.collision.body.ammo.setWorldTransform(transform);
      chassis.collision.body.ammo.activate();

      this.currentEngineForce = state.engineForce;
      this.currentBrakeForce = state.brakeForce;
      this.currentSteeringValue = state.steeringValue;

      if (this.currentSteeringValue !== 0) {
        this.vehicle.setSteeringValue(this.currentSteeringValue, 0);
        this.vehicle.setSteeringValue(this.currentSteeringValue, 1);
      }

      for (let i = 0; i < this.vehicle.getNumWheels(); i++) {
        this.vehicle.setBrake(this.currentBrakeForce, i);
        this.vehicle.applyEngineForce(this.currentEngineForce, i);
      }
    }
  }

  clone(): VehiclePhysics {
    const cloned = new VehiclePhysics(this.entity);
    cloned.enabled = this.enabled;
    return cloned;
  }

  public setRotation(rotX: number, rotY: number, rotZ: number): boolean {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis?.collision?.body) return false;

    const ammoBody = chassis.collision.body.ammo;
    const transform = ammoBody.getWorldTransform();

    const euler = new THREE.Euler(rotX, rotY, rotZ, 'YXZ');
    const quat = new THREE.Quaternion().setFromEuler(euler);

    const rotation = new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
    transform.setRotation(rotation);

    ammoBody.setWorldTransform(transform);
    ammoBody.activate();
    return true;
  }

  public setPosition(posX: number, posY: number, posZ: number): boolean {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis?.collision?.body) return false;

    const ammoBody = chassis.collision.body.ammo;
    const transform = ammoBody.getWorldTransform();

    const position = new Ammo.btVector3(posX, posY, posZ);
    transform.setOrigin(position);

    ammoBody.setWorldTransform(transform);
    ammoBody.activate();
    return true;
  }
}
