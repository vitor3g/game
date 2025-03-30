import { SString } from "@/shared/shared.utils";
import * as THREE from "three";
import { Graphics } from "./graphics";

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  constructor(private readonly g_graphics: Graphics) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );


    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  public start() {
    this.renderer.setAnimationLoop((dt) => this.animate(dt));

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize);

  }

  private animate(dt: number): void {
    this.renderer.render(this.scene, this.camera);
    g_core.getTickManager().update(dt);
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
}
