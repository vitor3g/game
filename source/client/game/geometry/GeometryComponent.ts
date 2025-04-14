import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import {
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3
} from "three";

export enum GeometryType {
  BOX = 'box',
  PLANE = 'plane'
}

export class GeometryComponent extends BaseComponent {
  readonly type: string = 'GeometryComponent';

  private geometryType: GeometryType = GeometryType.BOX;
  private geometry: BoxGeometry | PlaneGeometry | null = null;
  private material: MeshBasicMaterial | MeshStandardMaterial | null = null;
  private mesh: Mesh | null = null;

  // Geometry properties
  private size: Vector3 = new Vector3(1, 1, 1);
  private color: Color = new Color(0xffffff);
  private wireframe = false;
  private receiveShadow = true;
  private castShadow = true;
  private useMaterialType: 'basic' | 'standard' = 'standard';

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    this.createGeometry();
  }


  private createGeometry(): void {
    switch (this.geometryType) {
      case GeometryType.BOX:
        this.geometry = new BoxGeometry(
          this.size.x,
          this.size.y,
          this.size.z
        );
        break;

      case GeometryType.PLANE:
        this.geometry = new PlaneGeometry(
          this.size.x,
          this.size.z
        );
        break;
    }

    if (this.useMaterialType === 'basic') {
      this.material = new MeshBasicMaterial({
        color: this.color,
        wireframe: this.wireframe,
        side: DoubleSide
      });
    } else {
      this.material = new MeshStandardMaterial({
        color: this.color,
        wireframe: this.wireframe,
        side: DoubleSide,
        roughness: 0.7,
        metalness: 0.2
      });
    }

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = this.receiveShadow;
    this.mesh.castShadow = this.castShadow;

    if (this.geometryType === GeometryType.PLANE) {
      this.mesh.rotation.x = -Math.PI / 2;
    }

    this.entity.object3D.add(this.mesh);
  }


  createBox(width = 1, height = 1, depth = 1): void {
    this.geometryType = GeometryType.BOX;
    this.size.set(width, height, depth);

    this.recreateGeometry();
  }

  createPlane(width = 10, depth = 10): void {
    this.geometryType = GeometryType.PLANE;
    this.size.set(width, 0.01, depth);

    this.recreateGeometry();
  }


  private recreateGeometry(): void {
    if (this.mesh) {
      this.entity.object3D.remove(this.mesh);

      this.geometry?.dispose();
      this.material?.dispose();

      this.createGeometry();
    }
  }

  setSize(width: number, height: number, depth: number): void {
    this.size.set(width, height, depth);

    this.recreateGeometry();
  }


  setColor(color: number | string | Color): void {
    if (color instanceof Color) {
      this.color = color;
    } else {
      this.color = new Color(color);
    }

    if (this.material) {
      this.material.color = this.color;
    }
  }

  setWireframe(wireframe: boolean): void {
    this.wireframe = wireframe;

    if (this.material) {
      this.material.wireframe = wireframe;
    }
  }


  setShadows(cast: boolean, receive: boolean): void {
    this.castShadow = cast;
    this.receiveShadow = receive;

    if (this.mesh) {
      this.mesh.castShadow = cast;
      this.mesh.receiveShadow = receive;
    }
  }


  setMaterialType(type: 'basic' | 'standard'): void {
    if (this.useMaterialType !== type) {
      this.useMaterialType = type;
      this.recreateGeometry();
    }
  }


  getMesh(): Mesh | null {
    return this.mesh;
  }

  getSize(): Vector3 {
    return this.size.clone();
  }

  onRemove(): void {
    if (this.mesh) {
      this.entity.object3D.remove(this.mesh);
    }

    this.geometry?.dispose();
    this.material?.dispose();

    this.geometry = null;
    this.material = null;
    this.mesh = null;
  }

  onDestroy(): void {
    this.onRemove();
  }

  clone(): GeometryComponent {
    const cloned = new GeometryComponent(this.entity);
    cloned.geometryType = this.geometryType;
    cloned.size = this.size.clone();
    cloned.color = this.color.clone();
    cloned.wireframe = this.wireframe;
    cloned.receiveShadow = this.receiveShadow;
    cloned.castShadow = this.castShadow;
    cloned.useMaterialType = this.useMaterialType;
    return cloned;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      geometryType: this.geometryType,
      size: {
        x: this.size.x,
        y: this.size.y,
        z: this.size.z
      },
      color: this.color.getHex(),
      wireframe: this.wireframe,
      receiveShadow: this.receiveShadow,
      castShadow: this.castShadow,
      materialType: this.useMaterialType
    };
  }

  fromJSON(json: object): void {
    super.fromJSON(json);

    const data = json as any;

    if (data.geometryType !== undefined) {
      this.geometryType = data.geometryType;
    }

    if (data.size) {
      this.size.set(
        data.size.x || 1,
        data.size.y || 1,
        data.size.z || 1
      );
    }

    if (data.color !== undefined) {
      this.color = new Color(data.color);
    }

    if (data.wireframe !== undefined) {
      this.wireframe = data.wireframe;
    }

    if (data.receiveShadow !== undefined) {
      this.receiveShadow = data.receiveShadow;
    }

    if (data.castShadow !== undefined) {
      this.castShadow = data.castShadow;
    }

    if (data.materialType !== undefined) {
      this.useMaterialType = data.materialType;
    }

    if (this.mesh) {
      this.onRemove();
      this.createGeometry();
    }
  }
}