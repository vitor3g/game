import { Vec3 } from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { ShapeType } from 'three-to-cannon';

const ebisu_test = [
  { path: "/data/ebisu/1.glb", x: 178.477, y: 70.689, z: -10.243, w: 1 },
  { path: "/data/ebisu/2.glb", x: 173.664, y: -52.080, z: -11.793, w: 1 },
  { path: "/data/ebisu/3.glb", x: 50.251, y: 35.319, z: -10.805, w: 1 },
  { path: "/data/ebisu/4.glb", x: 50.907, y: -82.570, z: -8.427, w: 1 },
  { path: "/data/ebisu/5.glb", x: -67.752, y: 32.588, z: -11.337, w: 1 },
  { path: "/data/ebisu/6.glb", x: -68.222, y: -85.592, z: -7.297, w: 1 },
  { path: "/data/ebisu/7.glb", x: -207.100, y: -23.973, z: 0.849, w: 1 },
  { path: "/data/ebisu/8.glb", x: 356.614, y: 37.514, z: -31.386, w: 1 },
  { path: "/data/ebisu/9.glb", x: 47.250, y: 55.916, z: -8.605, w: 1 },
  { path: "/data/ebisu/10.glb", x: -337.024, y: -6.327, z: 27.868, w: 1 },
  { path: "/data/ebisu/11.glb", x: -373.962, y: -73.501, z: 30.145, w: 1 },
];



export class Game {
  private debuggerCannon!: any
  constructor() {}

  public async init() {
    this.debuggerCannon = CannonDebugger(g_core.getGraphics().getRenderer().scene, g_core.getPhysics().getWorld())

    ebisu_test.map(async (v, i) => {
      const object = await g_core.getObjects().createObject({
        modelInfo: {
          id: i,
          path: v.path
        },
        shapeType: ShapeType.MESH
      });



      const model = g_core.getModels().getModelById(object.getModelId());

      if (model) {
        g_core.getGraphics().getRenderer().scene.add(model.getMesh());
        const { x, y, z } = convertFromIPLtoThreeJS(v.x, v.y, v.z)

        object.getRigidBody().disableCollision();
        object.getRigidBody().setPosition(new Vec3(x, y, z))
      }



      g_core.getEntityManager().add(object)
    })


    g_core
      .getTickManager()
      .subscribe("on-client-render", this.onClientRender.bind(this));


    return 1;
  }

  public onClientRender() {
    const io = g_core.getGraphics().getGUI().getIO();
    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    const values = {
      fps: fps,
      modelsCount: g_core.getModels().getModelCount(),
      inMemoryObjects: g_core.getObjects().getObjectCount(),
    };



    this.debuggerCannon.update()

    g_core
      .getGraphics()
      .getGUI()
      .getPrimitiveList()
      .addText(JSON.stringify(values, null, 2), 10, 10, "#090909");
  }
}


export function convertFromIPLtoThreeJS(x: number, y: number, z: number) {
  return {
    x: x,
    y: z,
    z: -y,
  };
}
