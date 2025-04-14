import { Vec3 } from "cannon-es";
import { Vector3 } from "three";
import { SoundType } from "../core/AudioManager";
import type { IGameEntity } from "../ecs/interfaces";
import { CameraComponent } from "./common/CameraComponent";
import { type PhysicsBodyOptions, PhysicsComponent, PhysicsShapeType } from "./common/PhysicsComponent";
import { PhysicsSystem } from "./common/PhysicsSystem";
import { GeometryComponent } from "./geometry/GeometryComponent";
import { SkyEntity } from "./sky/SkyEntity";
import { World } from "./World";

export class Game {
  private readonly gameWorld: World;

  // Entities
  private skyEntity!: SkyEntity;
  private groundEntity!: IGameEntity;
  private boxEntity!: IGameEntity;
  private cameraEntity!: IGameEntity;

  // Systems
  public physicsSystem!: PhysicsSystem;

  constructor() {
    this.gameWorld = new World("game-world", g_core.getGraphics().getRendererScene());
    this.physicsSystem = new PhysicsSystem(this.gameWorld, "PhysicsSystem", {
      gravity: new Vec3(0, -9.8, 0),
      debug: false
    });

    this.skyEntity = new SkyEntity(this.gameWorld);
    this.gameWorld.addEntity(this.skyEntity);


    this.gameWorld.addSystem(this.physicsSystem);
  }


  public async start() {
    await g_core.getAudioManager().load("/data/sounds/ui/change.wav", {
      type: SoundType.UI,
      key: 'ui-change'
    })

    this._createGround();
    this._createBox();

    this.gameWorld.initialize();

    this._createCamera();

  }

  private _createCamera(): void {
    this.cameraEntity = this.gameWorld.createEntity('MainCamera');

    const cameraComponent = new CameraComponent(this.cameraEntity, {
      target: this.boxEntity,
      distance: 5,
      smoothing: 0.2,
      sensitivity: 0.1,
      height: 1
    })

    this.cameraEntity.addComponent(cameraComponent)
  }

  private _createGround(): void {
    this.groundEntity = this.gameWorld.createEntity("Ground");

    this.groundEntity.tags.add("ground");

    const groundGeometry = new GeometryComponent(this.groundEntity);
    groundGeometry.createPlane(40, 40);
    groundGeometry.setColor(0x88aa88);

    const groundPhysicsOptions: PhysicsBodyOptions = {
      mass: 0,
      shapeType: PhysicsShapeType.BOX,
      size: new Vector3(40, 0.1, 40),
      friction: 0.5,
      restitution: 0.2
    };

    const groundPhysicsComponent = new PhysicsComponent(this.groundEntity, groundPhysicsOptions);

    this.groundEntity.addComponent(groundGeometry);
    this.groundEntity.addComponent(groundPhysicsComponent);

    this.groundEntity.object3D.position.set(0, 0, 0);
  }


  private _createBox(): void {
    this.boxEntity = this.gameWorld.createEntity("BoxEntity")
    this.boxEntity.tags.add("box")
    const geometryComponent = new GeometryComponent(this.boxEntity);
    geometryComponent.createBox(1, 1, 1);
    geometryComponent.setColor(0xff4444)

    const boxPhysicsOptions: PhysicsBodyOptions = {
      mass: 1,
      shapeType: PhysicsShapeType.BOX,
      size: new Vector3(1, 1, 1),
      friction: 0.3,
      restitution: 0.4
    }

    const physicsComponent = new PhysicsComponent(this.boxEntity, boxPhysicsOptions)
    this.boxEntity.addComponent(geometryComponent);
    this.boxEntity.addComponent(physicsComponent)
    this.boxEntity.object3D.position.set(0, 5, 0);
  }

  public getGameWorld() {
    return this.gameWorld;
  }

  public getPhysicsSystem() {
    return this.physicsSystem.physicsWorld;
  }
}