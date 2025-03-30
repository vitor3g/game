
export class Game {
  constructor() {}

  public async init() {
    g_core
      .getTickManager()
      .subscribe("on-client-render", this.onClientRender.bind(this));


    const object = await g_core.getObjects().createObject({
      modelInfo: {
        id: 0,
        path: "data/ebisu/ebisuminami1.glb"
      }
    });

    const model = g_core.getModels().getModelById(object.getModelId());

    if (model) {
      g_core.getGraphics().getRenderer().scene.add(model.getMesh());
    }

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


    g_core
      .getGraphics()
      .getGUI()
      .getPrimitiveList()
      .addText(JSON.stringify(values, null, 2), 10, 10, "#090909");
  }
}
