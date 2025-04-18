import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import type { ExtendedMesh } from "@enable3d/ammo-physics";
import AmmoTypes from "ammojs-typed";
import { VehicleChassis } from "./VehicleChassis";


export class VehiclePhysics extends BaseComponent {
  private tuning!: AmmoTypes.btVehicleTuning;
  private vehicle!: AmmoTypes.btRaycastVehicle;
  private wheelMeshes: ExtendedMesh[] = []

  readonly type: string = "VehiclePhysics";

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);

    if (!chassis) return;


    const physics = g_core.getGraphics().getRenderer().getPhysics();
    if (!physics) return;



    this.tuning = new Ammo.btVehicleTuning();
    const raycaster = new Ammo.btDefaultVehicleRaycaster(physics.physicsWorld);

    this.vehicle = new Ammo.btRaycastVehicle(this.tuning, chassis.chassisMesh.body.ammo, raycaster);

    chassis.chassisMesh.body.skipUpdate = true;

    this.vehicle.setCoordinateSystem(0, 1, 2);
    physics.physicsWorld.addAction(this.vehicle);

    const FRONT_LEFT = 2
    const FRONT_RIGHT = 3
    const BACK_LEFT = 0
    const BACK_RIGHT = 1

    const wheelAxisPositionBack = -1.3
    const wheelRadiusBack = 0.5
    const wheelHalfTrackBack = 1.1
    const wheelAxisHeightBack = 0

    const wheelAxisFrontPosition = 1.2
    const wheelRadiusFront = 0.5
    const wheelHalfTrackFront = 1.1
    const wheelAxisHeightFront = 0

    this.addWheel(
      true,
      new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront,
      FRONT_LEFT
    )
    this.addWheel(
      true,
      new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront,
      FRONT_RIGHT
    )
    this.addWheel(
      false,
      new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack,
      BACK_LEFT
    )
    this.addWheel(
      false,
      new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack,
      BACK_RIGHT
    )
  }

  addWheel(isFront: boolean, pos: AmmoTypes.btVector3, radius: number, index: number) {
    const tire = this.entity.getComponent<VehicleChassis>(VehicleChassis);

    if (!tire) return;

    const suspensionRestLength = 0

    const suspensionStiffness = 25.0
    const suspensionDamping = 2.5
    const suspensionCompression = 4.4

    const friction = 10
    const rollInfluence = 0.001

    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)

    const wheelInfo = this.vehicle.addWheel(
      pos,
      wheelDirectionCS0,
      wheelAxleCS,
      suspensionRestLength,
      radius,
      this.tuning,
      isFront
    )

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)

    wheelInfo.set_m_frictionSlip(friction)
    wheelInfo.set_m_rollInfluence(rollInfluence)

    this.wheelMeshes[index] = tire.tireMesh.clone(true)
    this.entity.object3D.add(this.wheelMeshes[index])
  }

  onUpdate() {
    const chassis = this.entity.getComponent<VehicleChassis>(VehicleChassis);
    if (!chassis) return;

    let tm, p, q, i
    const n = this.vehicle.getNumWheels()


    for (i = 0; i < n; i++) {
      this.vehicle.updateWheelTransform(i, true)
      tm = this.vehicle.getWheelTransformWS(i)
      p = tm.getOrigin()
      q = tm.getRotation()
      this.wheelMeshes[i].position.set(p.x(), p.y(), p.z())
      this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w())
    }

    tm = this.vehicle.getChassisWorldTransform()
    p = tm.getOrigin()
    q = tm.getRotation()

    chassis.chassisMesh.position.set(p.x(), p.y(), p.z())
    chassis.chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
  }

  public getVehicle(): AmmoTypes.btRaycastVehicle {
    return this.vehicle
  }

}