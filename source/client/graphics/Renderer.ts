import { SString } from "@/shared/shared.utils";
import { AmmoPhysics } from '@enable3d/ammo-physics';
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CommonEvents } from "../enums/CommonEventsEnum";
import { Graphics } from "./Graphics";

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public clock: THREE.Clock;
  public physics: AmmoPhysics;

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

    const DPR = window.devicePixelRatio
    this.renderer.setPixelRatio(Math.min(2, DPR))


    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.update()

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1))
    this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(50, 200, 100)
    light.position.multiplyScalar(1.3)

    // physics
    this.physics = new AmmoPhysics(this.scene)

    this.clock = new THREE.Clock();
  }


  public start() {
    this.renderer.setAnimationLoop((dt) => this.animate(dt));

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize);
  }

  private animate(dt: number): void {
    this.renderer.render(this.scene, this.camera);
    this.physics.update(this.clock.getDelta() * 1000)
    g_core.getInternalNet().emit(CommonEvents.EVENT_UPDATE, dt);
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

  public getPhysics() {
    return this.physics;
  }
}