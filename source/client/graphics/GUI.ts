import { ImGui, ImGui_Impl } from '@zhobo63/imgui-ts';
import type { ContextLogger } from '../core/Console';
import { CommonEvents } from '../enums/CommonEventsEnum';
import type { Graphics } from './Graphics';
import { Primitives } from './gui/Primitives';

export class Gui {
  private readonly logger: ContextLogger;
  private readonly primitives: Primitives;
  private io!: ImGui.IO;

  constructor(private readonly g_graphics: Graphics) {
    this.logger = g_core.getConsole().NewLoggerCtx('dz::gui');
    this.primitives = new Primitives();

    this.logger.log('gui');
  }

  public async start() {
    await ImGui.default();

    ImGui.CHECKVERSION();
    ImGui.CreateContext();
    this.io = ImGui.GetIO();
    ImGui.StyleColorsDark();
    this.io.Fonts.AddFontDefault();

    ImGui_Impl.Init(this.g_graphics.getRenderer().renderer.domElement);

    g_core
      .getInternalNet()
      .on(CommonEvents.EVENT_UPDATE, this.update.bind(this));

    // Temporary hack-fix to prevent pointerLock, we need move this logic ASAP
    document.addEventListener('click', () => {
      setTimeout(() => {
        if (this.isCapturingMouse()) {
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
        }
      }, 10);
    });
  }

  public isCapturingMouse(): boolean {
    return this.io.WantCaptureMouse;
  }

  public update(dt: number) {
    ImGui_Impl.NewFrame(dt);
    ImGui.NewFrame();

    g_core.getConsole().render();
    this.primitives.update();

    ImGui.EndFrame();
    ImGui.Render();

    this.g_graphics.getRenderer().renderer.resetState();

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
  }

  public getPrimitives() {
    return this.primitives;
  }

  public getIO() {
    return this.io;
  }
}
