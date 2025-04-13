import { CommonEvents } from "../enums/CommonEventsEnum";

export class Keybinds {
  private keys = new Set<string>();
  private lastKeyPressed: string | null = null;

  private mouse = {
    x: 0,
    y: 0,
  };

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      this.lastKeyPressed = e.code;


      g_core.getInternalNet().emit(CommonEvents.EVENT_KEYDOWN, e.key);

    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (this.lastKeyPressed === e.code) {
        this.lastKeyPressed = null;
      }

      g_core.getInternalNet().emit(CommonEvents.EVENT_KEYUP, e.key);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;


      g_core.getInternalNet().emit(CommonEvents.EVENT_MOUSE_MOVE, { x: e.clientX, y: e.clientY });
    });

    window.addEventListener('mousedown', (e) => {
      const code = this.getMouseButtonCode(e.button);
      if (code) {
        this.keys.add(code);
        this.lastKeyPressed = code;

        g_core.getInternalNet().emit(CommonEvents.EVENT_MOUSE_DOWN, code);
      }
    });

    window.addEventListener('mouseup', (e) => {
      const code = this.getMouseButtonCode(e.button);
      if (code) {
        this.keys.delete(code);
        if (this.lastKeyPressed === code) {
          this.lastKeyPressed = null;
        }

        g_core.getInternalNet().emit(CommonEvents.EVENT_MOUSE_UP, code);
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private getMouseButtonCode(button: number): string | null {
    if (button === 0) return 'MouseLeft';
    if (button === 2) return 'MouseRight';
    return null;
  }

  public isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  public isMouseDown(button: 'left' | 'right'): boolean {
    return this.keys.has(button === 'left' ? 'MouseLeft' : 'MouseRight');
  }

  public getMousePosition(): { x: number; y: number } {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  public getActiveKeys(): string[] {
    return Array.from(this.keys);
  }

  public getCurrentKeyPressed(): string | null {
    return this.lastKeyPressed;
  }
}
