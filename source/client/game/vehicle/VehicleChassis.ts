import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshPhongMaterial, Color } from 'three';
import { BaseComponent } from '@/client/ecs/BaseComponent';
import type { ComponentType } from '@/client/ecs/interfaces';
import type { ExtendedMesh } from '@enable3d/ammo-physics';
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
      console.error(`[VehicleChassis] Modelo GLTF "${this.props.model}" não encontrado.`);
      return;
    }

    // Clonar a cena para evitar compartilhamento
    const clonedScene = model.scene.clone(true);

    const glassDefaultMaterial = new MeshPhongMaterial({
      color: new Color(0x000000),
      transparent: true,
      opacity: 0.5,
      specular: new Color(0x111111),
      shininess: 90,
      reflectivity: 1.0,
    });

    clonedScene.traverse((child) => {
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
          mesh.material = mesh.material.map(() => glassDefaultMaterial.clone());
        } else {
          mesh.material = glassDefaultMaterial.clone();
        }
      }
    });

    if (!this.collision) {
      console.error('[VehicleChassis] Objeto "Collision" não encontrado no modelo GLTF.');
      return;
    }
    if (!this.chassis) {
      console.error('[VehicleChassis] Objeto "Chassis" não encontrado no modelo GLTF.');
      return;
    }
    if (!this.wheel) {
      console.error('[VehicleChassis] Objeto "Wheel" não encontrado no modelo GLTF.');
      return;
    }

    const physics = g_core.getClient().getClientGame().getPhysics().getAmmo();
    if (!physics?.physicsWorld) {
      console.error('[VehicleChassis] Sistema de física não inicializado.');
      return;
    }

    console.log('Antes de add.existing:', this.collision);
    physics.add.existing(this.collision, {
      shape: 'convex',
      mass: 1200,
    });
    console.log('Depois de add.existing:', this.collision, this.collision.body);

    if (!this.collision.body) {
      console.error('[VehicleChassis] Falha ao criar corpo físico para this.collision.');
      return;
    }

    this.chassis.rotation.y = Math.PI;
    this.collision.add(this.chassis);
    this.entity.object3D.add(this.collision);
  }
}