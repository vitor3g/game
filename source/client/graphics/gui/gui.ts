import { Logger } from "@/common/logger";
import { ImGui, ImGui_Impl } from "@zhobo63/imgui-ts";
import * as THREE from "three";
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

    ImGui.CreateContext();
    ImGui_Impl.Init(canvas);

    ImGui.StyleColorsDark();


    //this.io = ImGui.GetIO();
    //
    //window.requestAnimationFrame(this.update.bind(this))
  }

  public update(dt: number, scene: THREE.Scene, camera: THREE.Camera) {
    ImGui_Impl.NewFrame(dt);
    ImGui.NewFrame();


    //this.primitives.update();


    ImGui.EndFrame();
    ImGui.Render();

    this.g_graphics.getRenderer().renderer.render(scene, camera);
    g_core.getTickManager().update(dt);

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());


    this.g_graphics.getRenderer().renderer.state.reset();
  }

  public getPrimitiveList() {
    return this.primitives;
  }

  public getIO() {
    return this.io;
  }
}
