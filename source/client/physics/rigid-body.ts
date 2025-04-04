import * as CANNON from "cannon-es";

export class RigidBody {
  private body: CANNON.Body;

  constructor(
    shapeOrBody: CANNON.Shape | CANNON.Body,
    mass = 0
  ) {
    if (shapeOrBody instanceof CANNON.Body) {
      this.body = shapeOrBody;
    } else {
      this.body = new CANNON.Body({
        mass,
        shape: shapeOrBody,
        position: new CANNON.Vec3(0, 0, 0),
      });
    }

    g_core.getGame().getPhysics().getWorld().addBody(this.body);
  }

  public applyCentralForce(force: CANNON.Vec3): void {
    this.body.applyForce(force, this.body.position);
  }

  public applyImpulse(impulse: CANNON.Vec3, relPos: CANNON.Vec3): void {
    this.body.applyImpulse(impulse, relPos);
  }

  public disableCollision(): void {
    this.body.collisionFilterMask = 0;
  }

  public getPosition(): CANNON.Vec3 {
    return this.body.position.clone();
  }

  public setPosition(position: CANNON.Vec3): void {
    this.body.position.copy(position);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }

  public activate(): void {
    this.body.wakeUp();
  }

  public setActiveState(state: boolean): void {
    if (state) {
      this.body.wakeUp();
    } else {
      this.body.sleep();
    }
  }

  public setRestitution(value: number): void {
    this.body.material = this.body.material ?? new CANNON.Material();
    this.body.material.restitution = value;
  }

  public setFriction(value: number): void {
    this.body.material = this.body.material ?? new CANNON.Material();
    this.body.material.friction = value;
  }

  public setDamping(linear: number, angular: number): void {
    this.body.linearDamping = linear;
    this.body.angularDamping = angular;
  }

  public applyTorque(torque: CANNON.Vec3): void {
    this.body.torque.vadd(torque, this.body.torque);
  }

  public getForwardVector(): CANNON.Vec3 {
    const quat = this.body.quaternion;
    const forward = new CANNON.Vec3(0, 0, 1);
    return quat.vmult(forward); // Rotaciona vetor pela orientação
  }

  public setGrip(multiplier: number): void {
    this.setFriction(1.0 * multiplier);
  }

  public applyEngineForce(force: number): void {
    const dir = this.getForwardVector();
    const engineForce = dir.scale(force);
    this.applyCentralForce(engineForce);
  }

  public removeFromWorld(): void {
    g_core.getGame().getPhysics().getWorld().removeBody(this.body);
  }

  public lockRotation(x: boolean, y: boolean, z: boolean): void {
    this.body.fixedRotation = !(x || y || z);
    this.body.updateMassProperties();
    this.body.angularFactor.set(x ? 0 : 1, y ? 0 : 1, z ? 0 : 1);
  }

  public getRightVector(): CANNON.Vec3 {
    const quat = this.body.quaternion;
    const right = new CANNON.Vec3(1, 0, 0);
    return quat.vmult(right);
  }

  public getUpVector(): CANNON.Vec3 {
    const quat = this.body.quaternion;
    const up = new CANNON.Vec3(0, 1, 0);
    return quat.vmult(up);
  }

  public getLateralSpeed(): number {
    const velocity = this.body.velocity.clone();
    const right = this.getRightVector();
    return velocity.dot(right);
  }

  public debugInfo(): string {
    const pos = this.getPosition();
    return `RigidBody @ position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
  }

  public getBody(): CANNON.Body {
    return this.body;
  }
}
