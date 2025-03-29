import { SString } from "@/shared/shared.utils";
import Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls, RoomEnvironment } from "three/examples/jsm/Addons.js";
import { Graphics } from "./graphics";

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private stats: Stats;
  private clock = new THREE.Clock();

  constructor(private readonly g_graphics: Graphics) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.stats = new Stats();
    this.stats.showPanel(1);

    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.top = "0px";

    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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
  }

  public start() {
    this.renderer.setAnimationLoop(() => this.animate());

    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(this.stats.dom);

    window.addEventListener("resize", this.onWindowResize);

  }

  private animate(): void {
    const delta = this.clock.getDelta()

    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    g_core.getTickManager().update(delta);
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
