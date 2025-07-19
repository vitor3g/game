import { SString } from '@/shared/shared.utils';
import * as THREE from 'three';
import { CommonEvents } from '../enums/CommonEventsEnum';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pane } from 'tweakpane';

export class Renderer {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public clock: THREE.Clock;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public panel: Pane;

  private infoDisplay!: HTMLDivElement;
  private lastFrameTime = 0;
  private frames = 0;

  constructor() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.background = new THREE.Color(0x2d2e32);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000,
    );

    this.camera.zoom = 1;
    this.camera.position.set(5, 5, 8);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dLight.position.set(10, 15, 10);
    dLight.castShadow = true;
    dLight.shadow.bias = -0.0005;
    dLight.shadow.mapSize.set(2048, 2048);

    const d = 20;
    dLight.shadow.camera.left = -d;
    dLight.shadow.camera.right = d;
    dLight.shadow.camera.top = d;
    dLight.shadow.camera.bottom = -d;
    dLight.shadow.camera.near = 1;
    dLight.shadow.camera.far = 100;
    this.scene.add(dLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.scene.add(hemisphereLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(-10, 5, -10);
    this.scene.add(fillLight);

    this.clock = new THREE.Clock();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);

    this.panel = new Pane({
      title: 'Debug',
    });
    if (DRIFTZONE_DEBUG) {
      this.infoDisplay = document.createElement('div');
      this.infoDisplay.style.position = 'fixed';
      this.infoDisplay.style.top = '10px';
      this.infoDisplay.style.left = '10px';
      this.infoDisplay.style.color = 'white';
      this.infoDisplay.style.fontSize = '14px';
      this.infoDisplay.style.fontWeight = 'bold';
      this.infoDisplay.style.fontFamily = 'monospace, monospace';
      this.infoDisplay.style.zIndex = '9999';
      this.infoDisplay.style.userSelect = 'none';
      this.infoDisplay.style.padding = '8px 12px';
      this.infoDisplay.style.borderRadius = '8px';
      this.infoDisplay.style.lineHeight = '1.4em';
      this.infoDisplay.style.whiteSpace = 'pre';
      this.infoDisplay.style.textTransform = 'uppercase'
    }
  }

  public initialize() {
    document.body.appendChild(this.renderer.domElement);

    if (DRIFTZONE_DEBUG) {
      document.body.appendChild(this.infoDisplay);
    }

    this.renderer.setAnimationLoop(this.animate.bind(this));
    window.addEventListener('resize', this.onWindowResize);
  }

  private animate(): void {
    const now = performance.now();
    this.frames++;

    if (DRIFTZONE_DEBUG) {
      if (now - this.lastFrameTime >= 500) {
        const fps = Math.round(
          (this.frames * 1000) / (now - this.lastFrameTime),
        );
        this.lastFrameTime = now;
        this.frames = 0;

        const delta = this.clock.getDelta() * 1000;
        const sceneObjects = this.scene.children.length;

        let memoryInfo = '';
        if ((performance as any).memory) {
          const mem = (performance as any).memory;
          memoryInfo = `Memory: ${(mem.usedJSHeapSize / 1048576).toFixed(2)} MB / ${(mem.jsHeapSizeLimit / 1048576).toFixed(2)} MB\n`;
        }

        this.infoDisplay.textContent =
          `FPS: ${fps}\n` +
          `Delta: ${delta.toFixed(1)} ms\n` +
          `Scene Objects: ${sceneObjects}\n` +
          memoryInfo;
      }
    }

    const dt = this.clock.getDelta() * 1000;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    g_core.getInternalNet().emit(CommonEvents.EVENT_UPDATE, dt);
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    console.warn(
      SString('Game Viewport has resized with aspect %s', this.camera.aspect),
    );
  };

  public getClock(): THREE.Clock {
    return this.clock;
  }

  public getPane() {
    return this.panel;
  }
}
