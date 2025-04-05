// First, let's modify the PlayerCameraEntity to handle orbital movement

import { PerspectiveCamera, Vector3 } from 'three';
import { Entity } from '../entity';
import { PlayerEntity } from './player-entity';

interface PlayerCameraEntityProps {
  smoothness: number;
  domElement: HTMLElement;
  // New properties for orbit control
  orbitDistance?: number;
  minDistance?: number;
  maxDistance?: number;
  orbitSpeed?: number;
}

export class PlayerCameraEntity extends Entity<PlayerCameraEntityProps> {
  public camera: PerspectiveCamera;
  private target: PlayerEntity | null = null;
  private smoothness: number;
  private domElement: HTMLElement;

  // Orbit control properties
  private orbitDistance: number;
  private minDistance: number;
  private maxDistance: number;
  private orbitSpeed: number;
  private orbitAngle = 0;
  private verticalAngle = 0;
  private isOrbiting = false;
  private cameraOffset: Vector3 = new Vector3(0, 2, -5); // Default position behind and above vehicle

  constructor(props: PlayerCameraEntityProps) {
    super(props);

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.smoothness = props.smoothness;
    this.domElement = props.domElement;

    // Initialize orbit properties with defaults or provided values
    this.orbitDistance = props.orbitDistance ?? 10;
    this.minDistance = props.minDistance ?? 5;
    this.maxDistance = props.maxDistance ?? 20;
    this.orbitSpeed = props.orbitSpeed ?? 0.01;

    // Add mouse event listeners for orbit control
    this.setupOrbitControls();
  }

  public setCameraTarget(entity: PlayerEntity): void {
    this.target = entity;
  }

  private setupOrbitControls(): void {
    // Mouse down event to start orbiting
    this.domElement.addEventListener('mousedown', (event) => {
      if (event.button === 2) { // Right mouse button
        this.isOrbiting = true;
        event.preventDefault();
      }
    });

    // Mouse up event to stop orbiting
    window.addEventListener('mouseup', (event) => {
      if (event.button === 2) { // Right mouse button
        this.isOrbiting = false;
      }
    });

    // Mouse move event to orbit when isOrbiting is true
    window.addEventListener('mousemove', (event) => {
      if (this.isOrbiting && this.target) {
        // Adjust orbit angle based on mouse movement
        this.orbitAngle -= event.movementX * this.orbitSpeed;
        this.verticalAngle += event.movementY * this.orbitSpeed;

        // Limit vertical angle to avoid flipping
        this.verticalAngle = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.verticalAngle));
      }
    });

    // Mouse wheel event to zoom in/out
    this.domElement.addEventListener('wheel', (event) => {
      // Adjust orbit distance based on wheel direction
      this.orbitDistance += event.deltaY * 0.05;

      // Clamp distance between min and max
      this.orbitDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.orbitDistance));

      event.preventDefault();
    });

    // Prevent context menu on right-click

  }

  public update(): void {
    if (!this.target) return;

    const vehiclePosition = this.target.getVehicle().getPosition();
    const vehicleRotation = this.target.getVehicle().getRotation();

    let desiredPos: Vector3;

    if (this.isOrbiting) {
      // Câmera orbitando com mouse
      const x = Math.sin(this.orbitAngle) * Math.cos(this.verticalAngle) * this.orbitDistance;
      const z = Math.cos(this.orbitAngle) * Math.cos(this.verticalAngle) * this.orbitDistance;
      const y = Math.sin(this.verticalAngle) * this.orbitDistance;

      desiredPos = new Vector3(
        vehiclePosition.x + x,
        vehiclePosition.y + y,
        vehiclePosition.z + z
      );
    } else {
      // Câmera seguindo atrás do carro
      const rotatedOffset = this.rotateOffset(this.cameraOffset, vehicleRotation.y);
      desiredPos = vehiclePosition.clone().add(rotatedOffset);
    }

    // Suavização adaptativa
    const distance = this.camera.position.distanceTo(desiredPos);
    const followSpeed = Math.min(0.35, this.smoothness + distance * this.target.getVehicle().getSpeed());
    this.camera.position.lerp(desiredPos, followSpeed);

    // Look at o carro (levemente acima)
    this.camera.lookAt(
      vehiclePosition.x,
      vehiclePosition.y + 1,
      vehiclePosition.z
    );
  }


  // Helper function to rotate the camera offset based on vehicle rotation
  private rotateOffset(offset: Vector3, angle: number): Vector3 {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    return new Vector3(
      offset.x * cos - offset.z * sin,
      offset.y,
      offset.x * sin + offset.z * cos
    );
  }

  // Method to toggle orbiting mode programmatically
  public toggleOrbit(isOrbiting: boolean): void {
    this.isOrbiting = isOrbiting;
  }

  // Method to reset camera to default position behind the vehicle
  public resetCamera(): void {
    this.isOrbiting = false;
    this.orbitAngle = 0;
    this.verticalAngle = 0;
  }
}