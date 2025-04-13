import { SString } from "@/shared/shared.utils";
import * as THREE from "three";
import { Sky } from 'three/addons/objects/Sky.js';
import { CommonEvents } from "../enums/CommonEventsEnum";
import { Graphics } from "./Graphics";

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public sky!: Sky;
  private sun: THREE.Vector3;

  constructor(private readonly g_graphics: Graphics) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;

    this.sun = new THREE.Vector3();

    this.initSky();
  }

  private initSky(): void {
    // Add Sky
    //this.sky = new Sky();
    //this.sky.scale.setScalar(450000);
    //this.scene.add(this.sky);
    //
    //// GUI
    //const effectController = {
    //  turbidity: 10,
    //  rayleigh: 3,
    //  mieCoefficient: 0.005,
    //  mieDirectionalG: 0.7,
    //  elevation: 2,
    //  azimuth: 180,
    //  exposure: this.renderer.toneMappingExposure
    //};

    //const guiChanged = () => {
    //  const uniforms = this.sky.material.uniforms;
    //  uniforms.turbidity.value = effectController.turbidity;
    //  uniforms.rayleigh.value = effectController.rayleigh;
    //  uniforms.mieCoefficient.value = effectController.mieCoefficient;
    //  uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    //
    //  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    //  const theta = THREE.MathUtils.degToRad(effectController.azimuth);
    //  this.sun.setFromSphericalCoords(1, phi, theta);
    //
    //  uniforms.sunPosition.value.copy(this.sun);
    //  this.renderer.toneMappingExposure = effectController.exposure;
    //  this.renderer.render(this.scene, this.camera);
    //};

    //guiChanged();
  }

  public start() {
    this.renderer.setAnimationLoop((dt) => this.animate(dt));

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize);
  }

  private animate(dt: number): void {
    this.renderer.render(this.scene, this.camera);
    g_core.getInteralNetwork().emit(CommonEvents.EVENT_UPDATE, dt);
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.g_graphics
      .getLogger()
      .warn(
        SString("Game Viewport has resized with aspect %s", this.camera.aspect),
      );
  };

  public updateSkyParameters(params: {
    turbidity?: number,
    rayleigh?: number,
    mieCoefficient?: number,
    mieDirectionalG?: number,
    elevation?: number,
    azimuth?: number,
    exposure?: number
  }) {
    const uniforms = this.sky.material.uniforms;

    if (params.turbidity !== undefined) uniforms.turbidity.value = params.turbidity;
    if (params.rayleigh !== undefined) uniforms.rayleigh.value = params.rayleigh;
    if (params.mieCoefficient !== undefined) uniforms.mieCoefficient.value = params.mieCoefficient;
    if (params.mieDirectionalG !== undefined) uniforms.mieDirectionalG.value = params.mieDirectionalG;

    if (params.elevation !== undefined || params.azimuth !== undefined) {
      const elevation = params.elevation ?? THREE.MathUtils.radToDeg(Math.PI / 2 - Math.acos(this.sky.material.uniforms.sunPosition.value.y));

      const azimuth = params.azimuth ?? THREE.MathUtils.radToDeg(Math.atan2(this.sky.material.uniforms.sunPosition.value.x, this.sky.material.uniforms.sunPosition.value.z));

      const phi = THREE.MathUtils.degToRad(90 - elevation);
      const theta = THREE.MathUtils.degToRad(azimuth);
      this.sun.setFromSphericalCoords(1, phi, theta);
      uniforms.sunPosition.value.copy(this.sun);
    }

    if (params.exposure !== undefined) this.renderer.toneMappingExposure = params.exposure;

    this.renderer.render(this.scene, this.camera);
  }

  public getSky() {
    return this.sky;
  }
}