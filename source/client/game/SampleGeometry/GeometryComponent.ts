import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Vector3 } from "three";

export class GeometryComponent extends BaseComponent {
  readonly type: string = 'GeometryComponent';

  private geometry: BoxGeometry | null = null;
  private material: MeshBasicMaterial | null = null;
  private mesh: Mesh | null = null;

  // Default box properties
  private size: Vector3 = new Vector3(1, 1, 1);
  private color: Color = new Color(0xffffff);
  private wireframe = false;

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    this.createBoxGeometry();
  }

  /**
   * Creates a box geometry and adds it to the entity
   */
  private createBoxGeometry(): void {
    // Create box geometry with default or set dimensions
    this.geometry = new BoxGeometry(
      this.size.x,
      this.size.y,
      this.size.z
    );

    // Create material
    this.material = new MeshBasicMaterial({
      color: this.color,
      wireframe: this.wireframe
    });

    // Create mesh
    this.mesh = new Mesh(this.geometry, this.material);

    // Add mesh to entity's object3D
    this.entity.object3D.add(this.mesh);
  }

  /**
   * Set box dimensions
   */
  setSize(width: number, height: number, depth: number): void {
    this.size.set(width, height, depth);

    // If the box is already created, update it
    if (this.mesh) {
      // Remove existing mesh
      this.entity.object3D.remove(this.mesh);

      // Dispose of old resources
      this.geometry?.dispose();
      this.material?.dispose();

      // Create new box with updated dimensions
      this.createBoxGeometry();
    }
  }

  /**
   * Set box color
   */
  setColor(color: number | string | Color): void {
    if (color instanceof Color) {
      this.color = color;
    } else {
      this.color = new Color(color);
    }

    // Update material if it exists
    if (this.material) {
      this.material.color = this.color;
    }
  }

  /**
   * Set wireframe mode
   */
  setWireframe(wireframe: boolean): void {
    this.wireframe = wireframe;

    // Update material if it exists
    if (this.material) {
      this.material.wireframe = wireframe;
    }
  }

  onRemove(): void {
    // Clean up Three.js objects when component is removed
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
    cloned.size = this.size.clone();
    cloned.color = this.color.clone();
    cloned.wireframe = this.wireframe;
    return cloned;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      size: {
        x: this.size.x,
        y: this.size.y,
        z: this.size.z
      },
      color: this.color.getHex(),
      wireframe: this.wireframe
    };
  }

  fromJSON(json: object): void {
    super.fromJSON(json);

    const data = json as any;

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

    // If the component is already initialized, update the geometry
    if (this.mesh) {
      this.onRemove();
      this.createBoxGeometry();
    }
  }
}