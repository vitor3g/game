export class ModelInfo {
  public readonly id: number;
  public path: string;
  public scale: number;
  public rotation: { x: number; y: number; z: number };
  public position: { x: number; y: number; z: number };

  constructor(params: {
    path: string;
    scale?: number;
    rotation?: { x: number; y: number; z: number };
    position?: { x: number; y: number; z: number };
    id: number;
  }) {
    this.id = params.id;
    this.path = params.path;
    this.scale = params.scale ?? 1;
    this.rotation = params.rotation ?? { x: 0, y: 0, z: 0 };
    this.position = params.position ?? { x: 0, y: 0, z: 0 };
  }
}
