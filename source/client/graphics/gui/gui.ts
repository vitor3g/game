import { Logger } from "@/common/logger";
import { ImGui, ImGui_Impl } from "@zhobo63/imgui-ts";
import type { Graphics } from "../graphics";
import { Primitives } from "./primitives";

export class Gui {
  private readonly logger: Logger;
  private io!: ImGui.IO;
  private readonly primitives: Primitives;

  constructor(private readonly g_graphics: Graphics) {
    this.logger = new Logger("dz::gui");
    this.primitives = new Primitives();

    this.logger.log("gui");
  }

  public async start(canvas: HTMLCanvasElement) {
    await ImGui.default();

    ImGui.CHECKVERSION();
    ImGui.CreateContext();
    this.io = ImGui.GetIO();
    ImGui.StyleColorsDark();
    this.io.Fonts.AddFontDefault();


    ImGui_Impl.Init(canvas);

    window.requestAnimationFrame(this.update.bind(this))
  }

  public update(dt: number) {
    ImGui_Impl.NewFrame(dt);
    ImGui.NewFrame();

    this.primitives.update();

    ImGui.EndFrame();
    ImGui.Render();

    g_core.getTickManager().update(dt);

    this.g_graphics.getRenderer().renderer.render(this.g_graphics.getRenderer().getScene(), this.g_graphics.getRenderer().getCamera());
    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    this.g_graphics.getRenderer().getCamera().updateProjectionMatrix()
    this.g_graphics.getRenderer().renderer.state.reset();

    window.requestAnimationFrame(this.update.bind(this))
  }

  public getPrimitiveList() {
    return this.primitives;
  }

  public getIO() {
    return this.io;
  }
}
