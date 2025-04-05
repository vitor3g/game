import * as CANNON from "cannon-es";
import * as THREE from "three";

export class VehiclePhysics {
  private readonly chassisBody: CANNON.Body;
  private readonly raycastedVehicle: CANNON.RaycastVehicle;
  public readonly chassisMesh: THREE.Mesh;
  public readonly wheelMeshes: THREE.Mesh[] = [];

  private readonly wheelRadius = 0.4;
  private readonly wheelWidth = 0.2;

  constructor() {
    const scene = g_core.getGraphics().getRenderer().scene;
    const world = g_core.getGame().getPhysics().getWorld();

    const wheelMaterial = new CANNON.Material("wheelMaterial");
    const groundMaterial = new CANNON.Material("groundMaterial");
    const contactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 1000
    });
    world.addContactMaterial(contactMaterial);

    this.chassisBody = this.createChassisBody(groundMaterial);
    this.chassisMesh = this.createChassisMesh();
    scene.add(this.chassisMesh);

    this.raycastedVehicle = this.createRaycastVehicle();

    const wheelPositions = [
      new CANNON.Vec3(-1, 0, 1.5),
      new CANNON.Vec3(1, 0, 1.5),
      new CANNON.Vec3(-1, 0, -1.5),
      new CANNON.Vec3(1, 0, -1.5),
    ];

    for (const pos of wheelPositions) {
      this.addWheel(pos, wheelMaterial, scene);
    }

    this.raycastedVehicle.addToWorld(world);
  }

  private createChassisBody(material: CANNON.Material): CANNON.Body {
    const shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    const body = new CANNON.Body({ mass: 150, material });
    body.addShape(shape);
    body.position.set(0, 10, 0);
    return body;
  }

  public getSpeed(): number {
    const velocity = this.chassisBody.velocity;
    return velocity.length();
  }

  public getSpeedKmh(): number {
    const speedMps = this.chassisBody.velocity.length();
    return speedMps * 3.6;
  }

  private createChassisMesh(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
  }

  private createRaycastVehicle(): CANNON.RaycastVehicle {
    return new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });
  }

  public getChassisMesh() {
    return this.chassisMesh;
  }


  private addWheel(pos: CANNON.Vec3, _material: CANNON.Material, scene: THREE.Scene): void {
    const options = {
      radius: this.wheelRadius,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: pos.clone(),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true
    };

    this.raycastedVehicle.addWheel(options);

    const geometry = new THREE.CylinderGeometry(this.wheelRadius, this.wheelRadius, this.wheelWidth, 16);
    geometry.rotateZ(Math.PI / 2);
    const materialMesh = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wheelMesh = new THREE.Mesh(geometry, materialMesh);

    this.wheelMeshes.push(wheelMesh);
    scene.add(wheelMesh);
  }

  public updateVisuals(): void {
    this.chassisMesh.position.copy(this.chassisBody.position as any);
    this.chassisMesh.quaternion.copy(this.chassisBody.quaternion as any);

    const wheelInfos = this.raycastedVehicle.wheelInfos;
    for (let i = 0; i < wheelInfos.length; i++) {
      this.raycastedVehicle.updateWheelTransform(i);
      const transform = wheelInfos[i].worldTransform;
      this.wheelMeshes[i].position.copy(transform.position as any);
      this.wheelMeshes[i].quaternion.copy(transform.quaternion as any);
    }
  }


  public applyEngineForce(force: number): void {
    const numWheels = this.raycastedVehicle.wheelInfos.length;

    for (let i = 0; i < numWheels; i++) {
      const isRearWheel = i >= 2;
      if (isRearWheel) {
        this.raycastedVehicle.applyEngineForce(force, i);
      } else {
        this.raycastedVehicle.applyEngineForce(0, i);
      }
    }
  }

  public setBrake(brakeForce: number): void {
    const numWheels = this.raycastedVehicle.wheelInfos.length;

    for (let i = 0; i < numWheels; i++) {
      this.raycastedVehicle.setBrake(brakeForce, i);
    }
  }

  public setSteeringValue(angle: number): void {
    this.raycastedVehicle.setSteeringValue(angle, 0);
    this.raycastedVehicle.setSteeringValue(angle, 1);
  }


  public getVehicle(): CANNON.RaycastVehicle {
    return this.raycastedVehicle;
  }
}
