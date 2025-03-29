import type Ammo from "ammojs-typed";
import type { Physics } from "./physics";

export class RigidBody {
  private body: Ammo.btRigidBody;
  private motionState: Ammo.btDefaultMotionState;

  constructor(private readonly g_physics: Physics, shape: Ammo.btCollisionShape, mass: number) {
    const Ammo = this.g_physics.getPhysicsApi();

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0, 0));

    this.motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    if (mass !== 0) shape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      this.motionState,
      shape,
      localInertia
    );

    this.body = new Ammo.btRigidBody(rbInfo);
  }

  public applyCentralForce(force: Ammo.btVector3): void {
    this.body.applyCentralForce(force);
  }

  public applyImpulse(impulse: Ammo.btVector3, relPos: Ammo.btVector3): void {
    this.body.applyImpulse(impulse, relPos);
  }

  public getPosition(): Ammo.btVector3 {
    const Ammo = this.g_physics.getPhysicsApi();

    const transform = new Ammo.btTransform();
    this.body.getMotionState().getWorldTransform(transform);
    return transform.getOrigin();
  }

  public setPosition(position: Ammo.btVector3): void {
    const Ammo = this.g_physics.getPhysicsApi();

    const transform = new Ammo.btTransform();
    this.body.getMotionState().getWorldTransform(transform);
    transform.setOrigin(position);
    this.body.setWorldTransform(transform);
    this.motionState.setWorldTransform(transform);
  }

  public activate(): void {
    this.body.activate();
  }

  public setActiveState(state: boolean): void {
    if (state) {
      this.body.activate();
    } else {
      this.body.setActivationState(4);
    }
  }

  public setRestitution(value: number): void {
    this.body.setRestitution(value); // kick
  }

  public setFriction(value: number): void {
    this.body.setFriction(value); // friction
  }

  public setDamping(linear: number, angular: number): void {
    this.body.setDamping(linear, angular);
  }

  public applyTorque(torque: Ammo.btVector3): void {
    this.body.applyTorque(torque);
  }

  public getForwardVector(): Ammo.btVector3 {
    const Ammo = this.g_physics.getPhysicsApi();

    const transform = new Ammo.btTransform();
    this.body.getMotionState().getWorldTransform(transform);

    const basis = transform.getBasis();

    const forward = new Ammo.btVector3(
      basis.getRow(2).x(),
      basis.getRow(2).y(),
      basis.getRow(2).z()
    );

    return forward;
  }

  public setGrip(multiplier: number): void {
    this.body.setFriction(1.0 * multiplier); // or any base value that works well
  }

  public applyEngineForce(force: number): void {
    const Ammo = this.g_physics.getPhysicsApi();

    const dir = this.getForwardVector();
    const engineForce = new Ammo.btVector3(dir.x() * force, dir.y() * force, dir.z() * force);
    this.body.applyCentralForce(engineForce);
  }

  public removeFromWorld(): void {
    this.g_physics.getPhysicsWorld().getWorld().removeRigidBody(this.body);
  }

  public lockRotation(x: boolean, y: boolean, z: boolean): void {
    const Ammo = this.g_physics.getPhysicsApi();

    const flags = new Ammo.btVector3(
      x ? 0 : 1,
      y ? 0 : 1,
      z ? 0 : 1
    );
    this.body.setAngularFactor(flags);
  }

  public getRightVector(): Ammo.btVector3 {
    const Ammo = this.g_physics.getPhysicsApi();

    const transform = new Ammo.btTransform();
    this.body.getMotionState().getWorldTransform(transform);
    const basis = transform.getBasis();
    const row = basis.getRow(0); // right = X
    return new Ammo.btVector3(row.x(), row.y(), row.z());
  }

  public getUpVector(): Ammo.btVector3 {
    const Ammo = this.g_physics.getPhysicsApi();

    const transform = new Ammo.btTransform();
    this.body.getMotionState().getWorldTransform(transform);
    const basis = transform.getBasis();
    const row = basis.getRow(1); // up = Y
    return new Ammo.btVector3(row.x(), row.y(), row.z());
  }

  public getLateralSpeed(): number {
    const velocity = this.body.getLinearVelocity();
    const right = this.getRightVector();
    return velocity.dot(right);
  }

  public debugInfo(): string {
    const pos = this.getPosition();
    return `RigidBody @ position: (${pos.x().toFixed(2)}, ${pos.y().toFixed(2)}, ${pos.z().toFixed(2)})`;
  }

  public getBody(): Ammo.btRigidBody {
    return this.body;
  }
}