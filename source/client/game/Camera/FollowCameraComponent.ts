import type { ContextLogger } from '@/client/core/Console';
import { BaseComponent } from '@/client/ecs/BaseComponent';
import type { ComponentType, IGameEntity } from '@/client/ecs/interfaces';
import { CommonEvents } from '@/client/enums/CommonEventsEnum';
import { KeyboardKeys } from '@/client/enums/KeysEnum';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';

export class FollowCameraComponent extends BaseComponent {
  readonly type: ComponentType = 'FollowCameraComponent';

  // The camera itself
  private camera: PerspectiveCamera;

  // Target entity to follow
  private targetEntity: IGameEntity | null = null;

  // Camera settings
  private distancePresets = {
    close: 4,
    medium: 7,
    far: 11
  };

  private logger: ContextLogger = g_core.getConsole().NewLoggerCtx("dz::follow-camera");

  private distanceMode: 'close' | 'medium' | 'far' = 'medium'; // Current distance mode
  private height = 2.5; // Height offset from target center
  private rotationSpeed = 0.3; // How fast the camera rotates with mouse movement
  private smoothFactor = 4.0; // Smoothing factor for camera movement
  private minPolarAngle = MathUtils.degToRad(10); // Minimum angle (looking down)
  private maxPolarAngle = MathUtils.degToRad(80); // Maximum angle (looking up)

  // Internal state
  private currentRotation = 0; // Current horizontal rotation angle
  private currentPolarAngle = MathUtils.degToRad(20); // Current vertical rotation angle
  private targetPosition = new Vector3(); // Target position to move towards
  private currentPosition = new Vector3(); // Current camera position

  // Animation state
  private currentDistance = 7; // Current actual distance (used for smooth animation)
  private targetDistance = 7; // Target distance to animate towards
  private transitionSpeed = 3.0; // Speed of the transition animation between distances
  private distanceTransitionStartTime = 0; // When the transition started
  private distanceTransitionDuration = 0.5; // Duration of the transition in seconds
  private isTransitioning = false; // Flag to track if we're in a transition

  // Pointer lock state
  private isPointerLocked = false;
  private canvasElement: HTMLCanvasElement | null = null;

  constructor(entity: IGameEntity) {
    super(entity);

    // Create the perspective camera
    this.camera = new PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );

    // Replace the entity's Object3D with our camera
    this.entity.object3D.add(this.camera);

    // Initialize camera position
    this.currentPosition.set(0, this.height, this.currentDistance);
    this.camera.position.copy(this.currentPosition);

    // Initialize pointer lock
    this.setupPointerLock();

    // Listen to additional input events
    this.setupInputListeners();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  onInit(): void {
    g_core.getGraphics().getRenderer().camera = this.camera;
  }

  /**
   * Set up the pointer lock API
   */
  private setupPointerLock(): void {
    // Get the canvas element from the renderer
    this.canvasElement = g_core.getGraphics().getRenderer().renderer.domElement;

    if (!this.canvasElement) {
      this.logger.error('FollowCameraComponent: Failed to get canvas element from renderer');
      return;
    }

    // Request pointer lock when canvas is clicked
    this.canvasElement.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.canvasElement?.requestPointerLock();
      }
    });

    // Handle pointer lock change
    document.addEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));

    // Handle pointer lock error
    document.addEventListener('pointerlockerror', () => {
      this.logger.error('FollowCameraComponent: Error locking pointer');
    });

    // Add mousemove event listener for camera rotation when pointer is locked
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  /**
   * Handle pointer lock change events
   */
  private handlePointerLockChange(): void {
    if (document.pointerLockElement === this.canvasElement) {
      // Pointer is locked
      this.isPointerLocked = true;
      this.logger.debug('Camera controls enabled (pointer locked)');
    } else {
      // Pointer is unlocked
      this.isPointerLocked = false;
      this.logger.debug('Camera controls disabled (pointer unlocked)');
    }
  }

  /**
   * Handle mouse movement for camera rotation when pointer is locked
   * Note: We invert the movement as requested
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isPointerLocked || !this.targetEntity) return;

    // Get mouse movement and invert it (negative becomes positive and vice versa)
    const deltaX = -(event.movementX || 0); // Invert horizontal movement
    const deltaY = -(event.movementY || 0); // Invert vertical movement

    // Update rotation based on inverted mouse movement
    this.currentRotation -= deltaX * this.rotationSpeed * 0.002;

    // Update vertical angle (polar angle) with constraints
    this.currentPolarAngle = MathUtils.clamp(
      this.currentPolarAngle + deltaY * this.rotationSpeed * 0.002,
      this.minPolarAngle,
      this.maxPolarAngle
    );
  }

  /**
   * Set up additional input listeners
   */
  private setupInputListeners(): void {
    // Keyboard listeners
    g_core.getInternalNet().on(CommonEvents.EVENT_KEYDOWN, (key: KeyboardKeys) => {
      // Exit pointer lock with Escape key
      if (key === KeyboardKeys.Escape && this.isPointerLocked) {
        document.exitPointerLock();
      }

      // Toggle between distance presets with V key
      if (key === KeyboardKeys.KeyV) {
        this.cycleDistanceMode();
      }
    });
  }

  /**
   * Cycle between the three distance modes: close, medium, far
   * Initiates a smooth transition to the new distance
   */
  private cycleDistanceMode(): void {
    // If already transitioning, don't start a new transition
    if (this.isTransitioning) return;

    // Store the starting distance for interpolation

    // Determine the next distance mode
    switch (this.distanceMode) {
      case 'close':
        this.distanceMode = 'medium';
        this.targetDistance = this.distancePresets.medium;

        this.logger.debug('Camera distance: Medium');
        break;
      case 'medium':
        this.distanceMode = 'far';
        this.targetDistance = this.distancePresets.far;
        this.logger.debug('Camera distance: Far');
        break;
      case 'far':
        this.distanceMode = 'close';
        this.targetDistance = this.distancePresets.close;
        this.logger.debug('Camera distance: Close');
        break;
    }

    g_core.getAudioManager().play('ui-change')


    // Start the transition
    this.isTransitioning = true;
    this.distanceTransitionStartTime = performance.now() / 1000; // Convert to seconds
  }

  /**
   * Update the camera distance based on animation timing
   */
  private updateDistanceTransition(currentTime: number): void {
    if (!this.isTransitioning) return;

    // Calculate elapsed time since transition started
    const elapsedTime = currentTime - this.distanceTransitionStartTime;

    // Calculate progress (0 to 1) based on duration
    let progress = elapsedTime / this.distanceTransitionDuration;

    // Clamp progress to 0-1 range
    progress = MathUtils.clamp(progress, 0, 1);

    // Apply easing function for smoother animation (ease-in-out)
    progress = this.easeInOutQuad(progress);

    // Interpolate between previous and target distance
    const previousDistance = this.currentDistance;
    const targetDistance = this.targetDistance;
    this.currentDistance = MathUtils.lerp(previousDistance, targetDistance, progress);

    // Check if transition is complete
    if (progress >= 1) {
      this.isTransitioning = false;
      this.currentDistance = this.targetDistance;
    }
  }

  /**
   * Quadratic ease-in-out function
   * Makes the animation smooth at both the beginning and end
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Set the target entity to follow
   */
  setTarget(entity: IGameEntity): void {
    this.targetEntity = entity;
    // Update camera position immediately
    if (this.enabled) {
      this.updateCameraPosition(0);
    }
  }

  /**
   * Main update loop for camera
   */
  onUpdate(deltaTime: number): void {
    if (!this.targetEntity) return;

    // Get current time for animations
    const currentTime = performance.now() / 1000; // Convert to seconds

    // Update distance animation if needed
    if (this.isTransitioning) {
      this.updateDistanceTransition(currentTime);
    }

    this.updateCameraPosition(deltaTime);
  }

  /**
   * Handle camera movement and following logic
   */
  private updateCameraPosition(deltaTime: number): void {
    if (!this.targetEntity) return;

    // Get target position
    this.targetPosition.copy(this.targetEntity.object3D.position);

    // Calculate camera position based on current distance, height and rotation
    const cameraOffset = new Vector3(
      Math.sin(this.currentRotation) * Math.sin(this.currentPolarAngle) * this.currentDistance,
      Math.cos(this.currentPolarAngle) * this.currentDistance + this.height,
      Math.cos(this.currentRotation) * Math.sin(this.currentPolarAngle) * this.currentDistance
    );

    // Calculate the target camera position
    const targetCameraPos = new Vector3().copy(this.targetPosition).add(cameraOffset);

    // Smoothly interpolate to the target position
    if (deltaTime > 0) {
      this.currentPosition.lerp(targetCameraPos, Math.min(deltaTime * this.smoothFactor, 1));
    } else {
      // If deltaTime is 0 (initialization), snap to position
      this.currentPosition.copy(targetCameraPos);
    }

    // Update camera position
    this.camera.position.copy(this.currentPosition);

    // Make camera look at target
    this.camera.lookAt(this.targetPosition);
  }

  /**
   * Configure camera settings
   */
  setSettings(settings: {
    distancePresets?: { close: number; medium: number; far: number };
    initialDistanceMode?: 'close' | 'medium' | 'far';
    height?: number;
    rotationSpeed?: number;
    smoothFactor?: number;
    transitionSpeed?: number;
    distanceTransitionDuration?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    fov?: number;
  }): void {
    // Handle distance presets
    if (settings.distancePresets) {
      this.distancePresets = settings.distancePresets;
    }

    // Set initial distance mode
    if (settings.initialDistanceMode) {
      this.distanceMode = settings.initialDistanceMode;
      this.currentDistance = this.distancePresets[this.distanceMode];
      this.targetDistance = this.currentDistance;
    }

    if (settings.height !== undefined) this.height = settings.height;
    if (settings.rotationSpeed !== undefined) this.rotationSpeed = settings.rotationSpeed;
    if (settings.smoothFactor !== undefined) this.smoothFactor = settings.smoothFactor;
    if (settings.transitionSpeed !== undefined) this.transitionSpeed = settings.transitionSpeed;
    if (settings.distanceTransitionDuration !== undefined) this.distanceTransitionDuration = settings.distanceTransitionDuration;
    if (settings.minPolarAngle !== undefined) this.minPolarAngle = MathUtils.degToRad(settings.minPolarAngle);
    if (settings.maxPolarAngle !== undefined) this.maxPolarAngle = MathUtils.degToRad(settings.maxPolarAngle);

    // Camera specific settings
    if (settings.fov !== undefined) {
      this.camera.fov = settings.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Get the current distance mode
   */
  getDistanceMode(): 'close' | 'medium' | 'far' {
    return this.distanceMode;
  }

  /**
   * Manually set the distance mode with smooth transition
   */
  setDistanceMode(mode: 'close' | 'medium' | 'far'): void {
    if (this.distanceMode === mode || this.isTransitioning) return;

    this.distanceMode = mode;
    this.targetDistance = this.distancePresets[mode];

    // Start the transition
    this.isTransitioning = true;
    this.distanceTransitionStartTime = performance.now() / 1000;
  }

  /**
   * Get the Three.js camera directly
   */
  getCamera(): PerspectiveCamera {
    return this.camera;
  }

  /**
   * Clean up event listeners when component is removed
   */
  onRemove(): void {
    // Release pointer lock if active
    if (this.isPointerLocked) {
      document.exitPointerLock();
    }

    // Remove event listeners
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);

    if (this.canvasElement) {
      this.canvasElement.removeEventListener('click', () => {
        this.canvasElement?.requestPointerLock();
      });
    }
  }

  /**
   * Clean up when component is destroyed
   */
  onDestroy(): void {
    this.onRemove();
  }

  /**
   * Override of the toJSON method to save camera settings
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      distancePresets: this.distancePresets,
      distanceMode: this.distanceMode,
      height: this.height,
      rotationSpeed: this.rotationSpeed,
      smoothFactor: this.smoothFactor,
      transitionSpeed: this.transitionSpeed,
      distanceTransitionDuration: this.distanceTransitionDuration,
      minPolarAngle: MathUtils.radToDeg(this.minPolarAngle),
      maxPolarAngle: MathUtils.radToDeg(this.maxPolarAngle),
      fov: this.camera.fov,
      targetEntityId: this.targetEntity ? this.targetEntity.id : null
    };
  }

  /**
   * Override of the fromJSON method to load camera settings
   */
  fromJSON(json: object): void {
    super.fromJSON(json);

    const data = json as any;

    if (data.distancePresets !== undefined) this.distancePresets = data.distancePresets;
    if (data.distanceMode !== undefined) {
      this.distanceMode = data.distanceMode;
      this.currentDistance = this.distancePresets[this.distanceMode];
      this.targetDistance = this.currentDistance;
    }
    if (data.height !== undefined) this.height = data.height;
    if (data.rotationSpeed !== undefined) this.rotationSpeed = data.rotationSpeed;
    if (data.smoothFactor !== undefined) this.smoothFactor = data.smoothFactor;
    if (data.transitionSpeed !== undefined) this.transitionSpeed = data.transitionSpeed;
    if (data.distanceTransitionDuration !== undefined) this.distanceTransitionDuration = data.distanceTransitionDuration;
    if (data.minPolarAngle !== undefined) this.minPolarAngle = MathUtils.degToRad(data.minPolarAngle);
    if (data.maxPolarAngle !== undefined) this.maxPolarAngle = MathUtils.degToRad(data.maxPolarAngle);
    if (data.fov !== undefined) {
      this.camera.fov = data.fov;
      this.camera.updateProjectionMatrix();
    }

    // Target entity will need to be resolved after all entities are loaded
    if (data.targetEntityId && this.entity.world) {
      const targetEntity = this.entity.world.getEntity(data.targetEntityId);
      if (targetEntity) {
        this.setTarget(targetEntity);
      }
    }
  }

  /**
   * Override of the clone method
   */
  clone(): FollowCameraComponent {
    const cloned = new FollowCameraComponent(this.entity);

    cloned.distancePresets = { ...this.distancePresets };
    cloned.distanceMode = this.distanceMode;
    cloned.currentDistance = this.currentDistance;
    cloned.targetDistance = this.targetDistance;
    cloned.height = this.height;
    cloned.rotationSpeed = this.rotationSpeed;
    cloned.smoothFactor = this.smoothFactor;
    cloned.transitionSpeed = this.transitionSpeed;
    cloned.distanceTransitionDuration = this.distanceTransitionDuration;
    cloned.minPolarAngle = this.minPolarAngle;
    cloned.maxPolarAngle = this.maxPolarAngle;
    cloned.camera.fov = this.camera.fov;
    cloned.camera.updateProjectionMatrix();
    cloned.targetEntity = this.targetEntity;

    return cloned;
  }
}