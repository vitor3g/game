import { BaseComponent } from '@/client/ecs/BaseComponent';
import type { ComponentType } from '@/client/ecs/interfaces';
import type { ExtendedMesh } from '@enable3d/ammo-physics';
import { Color, MeshPhongMaterial } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Vehicle, VehicleProps } from './VehicleEntity';

export class VehicleChassis extends BaseComponent {
  readonly type: ComponentType = 'VehicleChassis';

  public collision!: ExtendedMesh;
  public wheel!: ExtendedMesh;
  public chassis!: ExtendedMesh;

  constructor(entity: Vehicle, readonly props: VehicleProps) {
    super(entity);
  }

  onInit(): void {
    const model = g_core.getAssetManager().get<GLTF>(this.props.model);

    if (!model) {
      console.warn(
        '[VehicleChassis] Modelo GLTF "vehicles:s15" não encontrado.',
      );
      return;
    }

    const glassDefaulMaterial = new MeshPhongMaterial({
      color: new Color(0x000000),
      transparent: true,
      opacity: 0.5,
      specular: new Color(0x111111),
      shininess: 90,
      reflectivity: 1.0,
    });

    model.scene.traverse((child) => {
      if (!child.isObject3D) return;

      const mesh = child as ExtendedMesh;

      switch (mesh.name) {
        case 'Collision':
          this.collision = mesh;

          this.collision.traverse((c: any) => {
            if (c.material) {
              c.material.opacity = 0;
              c.material.transparent = true;
              c.material.depthWrite = false;
              c.material.depthTest = false;
            }
          });

          break;
        case 'Chassis':
          this.chassis = mesh;
          break;

        case 'Wheel':
          this.wheel = mesh;
          break;
      }

      if (mesh.name.includes('glass')) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(() => glassDefaulMaterial.clone());
        } else {
          mesh.material = glassDefaulMaterial.clone();
        }
      }
    });

    g_core
      .getClient()
      .getClientGame()
      .getPhysics()
      .getAmmo()
      .add.existing(this.collision, {
        shape: 'convex',
        mass: 1200,
      });

    this.chassis.rotation.y = Math.PI;

    this.collision.add(this.chassis);
    this.entity.object3D.add(this.collision);
  }
}
