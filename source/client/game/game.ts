import * as THREE from "three";

//const ebisu_test = [
//"/data/ebisu/ebisuminami1.glb",
//"/data/ebisu/ebisuminami2.glb",
//"/data/ebisu/ebisuminami3.glb",
//"/data/ebisu/ebisuminami4.glb",
//"/data/ebisu/ebisuminami5.glb",
//"/data/ebisu/ebisuminami6.glb",
//"/data/ebisu/ebisuminami7.glb",
//]


export class Game {
  constructor() {}

  public async init() {
    //g_core
    //  .getTickManager()
    //  .subscribe("on-client-render", this.onClientRender.bind(this));





    //// Adicionar na cena


    setTimeout(() => {
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(); // <-- evita o erro
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);


      g_core.getGraphics().getRenderer().scene.add(boxMesh);
    }, 1000);
    //ebisu_test.map(async (v, i) => {
    //  const object = await g_core.getObjects().createObject({
    //    modelInfo: {
    //      id: i,
    //      path: v
    //    }
    //  });
    //
    //  const model = g_core.getModels().getModelById(object.getModelId());
    //
    //  if (model) {
    //    g_core.getGraphics().getRenderer().scene.add(model.getMesh());
    //  }
    //
    //  g_core.getEntityManager().add(object)
    //})


    g_core.getTickManager().subscribe("game-loop", this.onClientRender.bind(this))



    return 1;
  }

  public onClientRender() {
    const io = g_core.getGraphics().getRenderer().getGUI().getIO();
    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    const values = {
      fps: fps,
      modelsCount: g_core.getModels().getModelCount(),
      inMemoryObjects: g_core.getObjects().getObjectCount(),
    };

    g_core.getGraphics().getRenderer().getGUI().getPrimitiveList().addText(values.fps, 0, 0, "#e3215b")
  }
}
