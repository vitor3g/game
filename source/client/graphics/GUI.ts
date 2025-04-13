import { ImGui, ImGui_Impl } from "@zhobo63/imgui-ts";
import type { ContextLogger } from "../core/Console";
import { CommonEvents } from "../enums/CommonEventsEnum";
import type { Graphics } from "./Graphics";

export class Gui {
  private readonly logger: ContextLogger;
  private io!: ImGui.IO;

  constructor(private readonly g_graphics: Graphics) {
    this.logger = g_core.getConsole().NewLoggerCtx("dz::gui")

    this.logger.log("gui");
  }

  public async start() {
    await ImGui.default();

    ImGui.CHECKVERSION();
    ImGui.CreateContext();
    this.io = ImGui.GetIO();
    ImGui.StyleColorsDark();
    this.io.Fonts.AddFontDefault();

    ImGui_Impl.Init(this.g_graphics.getRenderer().renderer.domElement);

    g_core.getInteralNetwork().on(CommonEvents.EVENT_UPDATE, this.update.bind(this))
  }

  public update(dt: number) {
    ImGui_Impl.NewFrame(dt);
    ImGui.NewFrame();

    g_core.getConsole().render();

    ImGui.EndFrame();
    ImGui.Render();

    this.g_graphics.getRenderer().renderer.resetState();

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
  }

  public getIO() {
    return this.io;
  }
}