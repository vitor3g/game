import type { RigidBody } from "@/client/physics/rigid-body";
import { Logger } from "@/common/logger";
import { SString } from "@/shared/shared.utils";
import * as THREE from "three";
import { ulid } from "ulid";

export interface EntityProps {
  rigidBody?: RigidBody;
  mesh?: THREE.Mesh;
  [key: string]: any;
}

export abstract class Entity<TProps extends EntityProps = EntityProps> {
  protected readonly _id: string;
  private readonly logger: Logger;
  public readonly props: TProps;

  public readonly tags = new Set<string>();

  get id(): string {
    return this._id;
  }

  constructor(props: TProps, id?: string) {
    this._id = id ?? ulid();
    this.props = props;
    this.logger = new Logger(SString("dz::entity::%s", this._id));
  }

  public equals(object?: Entity): boolean {
    if (!object) return false;
    if (this === object) return true;
    if (!(object instanceof Entity)) return false;
    return this._id === object._id;
  }

  public addTag(tag: string): void {
    this.tags.add(tag);
  }

  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  public removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public syncFromPhysics(): void {
    const { rigidBody, mesh } = this.props;
    if (!rigidBody || !mesh) return;

    const body = rigidBody.getBody();

    // Posição
    mesh.position.copy(body.position);

    // Rotação (quaternion)
    mesh.quaternion.copy(body.quaternion);
  }

  public update(): void {
    this.syncFromPhysics();
  }
}
