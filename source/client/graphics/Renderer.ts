import { SString } from '@/shared/shared.utils';
import * as THREE from 'three';
import { CommonEvents } from '../enums/CommonEventsEnum';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Renderer {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public clock: THREE.Clock;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  // Novo elemento para mostrar FPS
  private fpsDisplay: HTMLDivElement;
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

    // Criar o elemento para FPS
    this.fpsDisplay = document.createElement('div');
    this.fpsDisplay.style.position = 'fixed';
    this.fpsDisplay.style.top = '10px';
    this.fpsDisplay.style.left = '10px';
    this.fpsDisplay.style.color = 'white';
    this.fpsDisplay.style.fontSize = '48px';
    this.fpsDisplay.style.fontWeight = 'bold';
    this.fpsDisplay.style.fontFamily = 'monospace, monospace';
    this.fpsDisplay.style.zIndex = '9999';
    this.fpsDisplay.style.userSelect = 'none';
  }

  public initialize() {
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(this.fpsDisplay); // Adicionar o display de FPS no body

    this.renderer.setAnimationLoop(this.animate.bind(this));

    window.addEventListener('resize', this.onWindowResize);
  }

  private animate(): void {
    const now = performance.now();
    this.frames++;

    // Atualiza FPS a cada 0.5 segundos
    if (now - this.lastFrameTime >= 500) {
      const fps = Math.round((this.frames * 1000) / (now - this.lastFrameTime));
      this.fpsDisplay.textContent = `${fps} FPS`;
      this.lastFrameTime = now;
      this.frames = 0;
    }

    const dt = Math.min(this.clock.getDelta(), 1 / 60);

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
}
