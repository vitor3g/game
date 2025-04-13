import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import * as THREE from "three";
import { Sky } from 'three/addons/objects/Sky.js';

export class SkyComponent extends BaseComponent {
  readonly type: string = 'SkyComponent';

  private turbidity: number;
  private rayleigh: number;
  private mieCoefficient: number;
  private mieDirectionalG: number;
  private elevation: number;
  private azimuth: number;
  private exposure: number;
  private sky!: Sky;
  private sun: THREE.Vector3;

  constructor(entity: IGameEntity) {
    super(entity);

    this.sun = new THREE.Vector3(0, 0, 0);
    this.turbidity = 10;
    this.rayleigh = 3;
    this.mieCoefficient = 0.005;
    this.mieDirectionalG = 0.7;
    this.elevation = 2;
    this.azimuth = 180;
    this.exposure = g_core.getGraphics().getRenderer().renderer.toneMappingExposure
  }

  public onInit(): void {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    g_core.getGraphics().getRenderer().scene.add(this.sky);


    const uniforms = this.sky.material.uniforms;
    uniforms.turbidity.value = this.turbidity;
    uniforms.rayleigh.value = this.rayleigh;
    uniforms.mieCoefficient.value = this.mieCoefficient;
    uniforms.mieDirectionalG.value = this.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - this.elevation);
    const theta = THREE.MathUtils.degToRad(this.azimuth);
    this.sun.setFromSphericalCoords(1, phi, theta);

    uniforms.sunPosition.value.copy(this.sun);
    g_core.getGraphics().getRenderer().renderer.toneMappingExposure = this.exposure;
  }
}