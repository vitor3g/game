import * as CANNON from "cannon-es";

export class BuildingCollider {
  private body: CANNON.Body;

  constructor(shape: CANNON.Shape, position: CANNON.Vec3) {
    this.body = new CANNON.Body({
      mass: 0,
      shape,
      position,
      type: CANNON.Body.STATIC,
    });

    this.body.material = new CANNON.Material("buildingMaterial");
    this.body.material.friction = 1.0;
    this.body.material.restitution = 0;

    g_core.getGame().getPhysics().getWorld().addBody(this.body);
  }

  public removeFromWorld(): void {
    g_core.getGame().getPhysics().getWorld().removeBody(this.body);
  }

  public getPosition(): CANNON.Vec3 {
    return this.body.position.clone();
  }

  public setPosition(pos: CANNON.Vec3): void {
    this.body.position.copy(pos);
  }

  public getBody(): CANNON.Body {
    return this.body;
  }

  public debugInfo(): string {
    const p = this.body.position;
    return `BuildingCollider @ (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`;
  }
}
