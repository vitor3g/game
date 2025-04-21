import { SString } from '@/shared/shared.utils';
import * as THREE from 'three';
import { CommonEvents } from '../enums/CommonEventsEnum';
import { Graphics } from './Graphics';

export class Renderer {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public clock: THREE.Clock;
  public camera: THREE.PerspectiveCamera;

  constructor(private readonly g_graphics: Graphics) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const DPR = window.devicePixelRatio;
    this.renderer.setPixelRatio(Math.min(2, DPR));

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;

    this.scene.background = new THREE.Color(0xa8def0);
    const dLight = new THREE.DirectionalLight('white', 0.6);

    dLight.position.x = 20;
    dLight.position.y = 30;
    dLight.castShadow = true;
    dLight.shadow.mapSize.width = 4096;
    dLight.shadow.mapSize.height = 4096;
    const d = 35;
    dLight.shadow.camera.left = -d;
    dLight.shadow.camera.right = d;
    dLight.shadow.camera.top = d;
    dLight.shadow.camera.bottom = -d;
    this.scene.add(dLight);

    this.clock = new THREE.Clock();
  }

  public initialize() {
    this.renderer.setAnimationLoop((dt) => this.animate(dt));

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize);
  }

  private animate(dt: number): void {
    this.renderer.render(this.scene, this.camera);
    g_core.getInternalNet().emit(CommonEvents.EVENT_UPDATE, dt);
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.g_graphics
      .getLogger()
      .warn(
        SString('Game Viewport has resized with aspect %s', this.camera.aspect),
      );
  };

  public getClock(): THREE.Clock {
    return this.clock;
  }
}
