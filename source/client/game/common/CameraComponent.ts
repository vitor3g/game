import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import { CommonEvents } from "@/client/enums/CommonEventsEnum";
import { Vec3 } from "cannon-es";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";

export interface FollowCameraProps {
  target: IGameEntity;
  distance: number;
  height: number;
  sensitivity: number;
  smoothing?: number;
  collisionRadius?: number;
  collisionMask?: number;
  returnSpeed?: number;
}


export class CameraComponent extends BaseComponent {
  readonly type: string = 'CameraComponent';
  private yaw = 0;
  private pitch = 15;
  private isPointerLocked = false;
  private targetPosition: Vector3 = new Vector3()
  private cameraPosition: Vector3 = new Vector3()
  private currentDistance: number;
  private camera: PerspectiveCamera;
  private rayDirection = new Vec3()

  constructor(entity: IGameEntity, private readonly options: FollowCameraProps) {
    super(entity);

    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.currentDistance = this.options.distance;

    const eulers = this.entity.getEulerAngles();
    this.yaw = eulers.y;

    g_core.getInternalNet().on(CommonEvents.EVENT_MOUSE_MOVE, this._onMouseMove.bind(this));
    g_core.getInternalNet().on(CommonEvents.EVENT_MOUSE_DOWN, this._onMouseDown.bind(this));

    document.addEventListener('pointerlockchange', this._onPointerLockChange.bind(this));


  }


  _onMouseDown(key: string) {
    if (key === 'MouseLeft') {
      const canvas = g_core.getGraphics().getRenderer().renderer.domElement;
      canvas.requestPointerLock();
    }
  }

  private _onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement !== null;
  }

  _onMouseMove(e: MouseEvent) {
    if (!this.isPointerLocked) return;

    const { sensitivity } = this.options;

    this.yaw -= e.movementX * sensitivity;
    this.pitch += e.movementY * sensitivity;

    this.pitch = MathUtils.clamp(this.pitch, -45, 60);

    this.yaw %= 360;
    if (this.yaw < 0) this.yaw += 360;
  }

  onInit(): void {
    g_core.getGraphics().getRenderer().camera = this.camera;
  }

  onUpdate(dt: number): void {
    const { target,
      distance,
      height,
      smoothing = 0.2,
      collisionRadius = 0.2,
      collisionMask = -1,
      returnSpeed = 5
    } = this.options;

    if (!target.object3D) return;

    const targetPos = target.object3D.position;
    this.targetPosition.set(targetPos.x, targetPos.y + height, targetPos.z);



    const pitchRad = MathUtils.DEG2RAD * this.pitch;
    const yawRad = MathUtils.DEG2RAD * this.yaw;

    this.rayDirection.set(
      Math.sin(yawRad) * Math.cos(pitchRad),
      Math.sin(pitchRad),
      Math.cos(yawRad) * Math.cos(pitchRad)
    ).normalize();



    const rayStart = new Vec3(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z
    )

    const rayEnd = new Vec3(
      rayStart.x + (this.rayDirection.x * distance),
      rayStart.y + (this.rayDirection.y * distance),
      rayStart.z + (this.rayDirection.z * distance)
    );


    const result = g_core.getGame().physicsSystem.raycastFirst(rayStart, rayEnd, {
      filterCollisionMask: collisionMask
    });

    if (result?.hasHit) {
      if (!result.point) return;
      const collisionDistance = result.point.vsub(rayStart).length() - collisionRadius;
      this.currentDistance = Math.min(this.currentDistance, collisionDistance);
    } else {
      this.currentDistance = MathUtils.lerp(
        this.currentDistance,
        distance,
        Math.min(returnSpeed * dt, 1)
      );
    }

    const offsetX = this.currentDistance * Math.sin(yawRad) * Math.cos(pitchRad);
    const offsetY = this.currentDistance * Math.sin(pitchRad);
    const offsetZ = this.currentDistance * Math.cos(yawRad) * Math.cos(pitchRad);


    const desiredPos = new Vector3(
      targetPos.x + offsetX,
      targetPos.y + height + offsetY,
      targetPos.z + offsetZ
    );


    if (smoothing > 0 && dt > 0) {
      const lerpFactor = Math.min(smoothing * (1 + dt * 10), 1);
      this.cameraPosition.lerp(desiredPos, lerpFactor);
      this.camera.position.copy(this.cameraPosition);
    } else {
      this.camera.position.copy(desiredPos);
      this.cameraPosition.copy(desiredPos);
    }

    const lookTarget = new Vector3().copy(this.targetPosition);
    this.camera.lookAt(lookTarget);
  }
}