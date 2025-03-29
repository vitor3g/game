import type { RigidBody } from "@/client/physics/rigid-body";
import { Logger } from "@/common/logger";
import { SString } from "@/shared/shared.utils";
import Ammo from "ammojs-typed";
import * as THREE from "three";
import { ulid } from "ulid";

export interface EntityProps {
  rigidBody?: RigidBody;
  mesh?: THREE.Mesh;
  [key: string]: any; // permite estender livremente (ex: tags, input, etc)
}

export abstract class Entity<TProps extends EntityProps = EntityProps> {
  protected readonly _id: string;
  private readonly logger: Logger;
  public readonly props: TProps;

  // Ex: ["vehicle", "player", "dynamic"]
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

  /**
   * Atualiza a posição da malha com base na física (se houver).
   */
  public syncFromPhysics(): void {
    const { rigidBody, mesh } = this.props;
    if (!rigidBody || !mesh) return;

    const body = rigidBody.getBody();
    const transform = new Ammo.btTransform();
    body.getMotionState().getWorldTransform(transform);

    const origin = transform.getOrigin();
    const rotation = transform.getRotation();

    mesh.position.set(origin.x(), origin.y(), origin.z());
    mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
  }

  /**
   * Atualização por frame. Pode ser sobrescrita.
   */
  public update(): void {
    this.syncFromPhysics();
  }
}
