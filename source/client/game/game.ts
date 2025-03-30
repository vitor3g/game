import { ImGui } from "@zhobo63/imgui-ts";

export class Game {

  constructor() {}

  public async init() {
    g_core.getTickManager().subscribe("on-client-render", this.onClientRender.bind(this))

    return 1;
  }


  public onClientRender() {
    const io = ImGui.GetIO();
    const fps = io.Framerate.toFixed(1);

    g_core.getGraphics().getGUI().getPrimitiveList().addText(`fps @ ${fps}`, 0, 10, '#79e979');
  }
}
