import { SString } from "@/shared/shared.utils";
import * as THREE from "three";
import { OrbitControls, RoomEnvironment } from "three/examples/jsm/Addons.js";
import type { Graphics } from "./graphics";
import { Gui } from "./gui/gui";

export class Renderer {
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private gui: Gui

  constructor(private readonly g_graphics: Graphics) {
    this.gui = new Gui(this.g_graphics);
  }

  public start() {
    const canvas = document.querySelector("canvas")

    if (!canvas) return;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance", canvas: canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene.background = new THREE.Color(0xbfe3dd);
    this.scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;

    this.renderer.setAnimationLoop((dt) => this.update(dt));
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize);
  }

  private update(dt: number): void {
    this.gui.update(dt, this.scene, this.camera);
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