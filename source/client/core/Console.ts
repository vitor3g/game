import { ImGui } from "@zhobo63/imgui-ts";
import { CommonEvents } from "../enums/CommonEventsEnum";
import { KeyboardKeys } from "../enums/KeysEnum";

type LogLevel = "log" | "error" | "warn" | "debug" | "verbose" | "fatal";

export interface ContextLogger {
  log(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: any[]): void;
  verbose(message: any, ...optionalParams: any[]): void;
  fatal(message: any, ...optionalParams: any[]): void;
}

interface MenuItem {
  label: string;
  callback?: () => void;
  children?: MenuItem[];
}

export class Console {
  private history: {
    text: string,
    color: number[],
    level?: LogLevel,
    context?: string,
    contextColor?: number[]
  }[];
  private inputBuffer: string;
  private commandHistory: string[] = [];
  private historyIndex: number;
  private commands: Record<string, { callback: (args: string[]) => void, description: string }>;
  private isOpen: boolean;
  private scrollToBottom: boolean;
  private backgroundColor: number[];
  private textColor: number[];
  private commandColor: number[];
  private errorColor: number[];
  private warnColor: number[];
  private debugColor: number[];
  private verboseColor: number[];
  private fatalColor: number[];
  private menus: Record<string, MenuItem[]>;
  private activeLogLevels: Set<LogLevel>;
  private contextColors: Map<string, number[]>;
  private colorIndex = 0;

  private predefinedColors: number[][] = [
    [0.133, 0.545, 0.133, 1.0],
    [1.0, 0.078, 0.576, 1.0],
    [0.255, 0.412, 0.882, 1.0],
    [1.0, 0.647, 0.0, 1.0],
    [0.5, 0.0, 0.5, 1.0],
    [0.0, 0.749, 1.0, 1.0],
    [0.863, 0.078, 0.235, 1.0],
    [0.678, 1.0, 0.184, 1.0],
    [0.5, 0.5, 0.0, 1.0],
    [0.282, 0.239, 0.545, 1.0],
    [0.855, 0.439, 0.839, 1.0],
    [0.0, 0.5, 0.5, 1.0]
  ];

  constructor() {
    this.history = [];
    this.inputBuffer = "";
    this.commandHistory = [];
    this.historyIndex = -1;
    this.commands = {};
    this.isOpen = true;
    this.scrollToBottom = true;
    this.backgroundColor = [0.05, 0.05, 0.05, 0.9];
    this.textColor = [0.8, 0.8, 0.8, 1.0];
    this.commandColor = [0.2, 0.7, 0.4, 1.0];
    this.errorColor = [1.0, 0.4, 0.4, 1.0];
    this.warnColor = [1.0, 0.85, 0.44, 1.0];
    this.debugColor = [0.4, 0.8, 0.9, 1.0];
    this.verboseColor = [0.8, 0.5, 0.8, 1.0];
    this.fatalColor = [1.0, 0.0, 0.0, 1.0];
    this.menus = {
      "Overlays": [],
      "Launch": [],
      "Quit": [],
      "Tools": [],
      "Game": [],
      "Logs": []
    };

    this.activeLogLevels = new Set<LogLevel>([
      "log", "error", "warn", "debug", "verbose", "fatal"
    ]);

    this.contextColors = new Map<string, number[]>();

    this.registerCommand("help", this.cmdHelp.bind(this), "Shows the list of available commands");
    this.registerCommand("clear", this.cmdClear.bind(this), "Clean the console");
    this.registerCommand("quit", this.cmdQuit.bind(this), "Close the console");
    this.registerCommand("loglevel", this.cmdLogLevel.bind(this), "Sets visible log levels (e.g. loglevel log error warn)");

    this.setMenuItems("Logs", [
      {
        label: "All logs",
        callback: () => this.setLogLevels(["log", "error", "warn", "debug", "verbose", "fatal"])
      },
      {
        label: "Essentials only",
        callback: () => this.setLogLevels(["log", "error", "warn", "fatal"])
      },
      {
        label: "Only errors",
        callback: () => this.setLogLevels(["error", "fatal"])
      },
      {
        label: "Development logs",
        callback: () => this.setLogLevels(["debug", "verbose", "error"])
      }
    ]);



    g_core.getInteralNetwork().on(CommonEvents.EVENT_KEYDOWN, (key: KeyboardKeys) => {
      if (key === KeyboardKeys.F8) {
        this.toggle();
      }
    });

    g_core.getInteralNetwork().on(CommonEvents.EVENT_KEYDOWN, (key: KeyboardKeys) => {
      if (key === KeyboardKeys.Enter && this.isOpen && this.inputBuffer.trim() !== "") {
        if (this.inputBuffer.trim().startsWith("/")) {
          const currentCommand = this.inputBuffer;
          this.clearInputBuffer();
          this.executeCommand(currentCommand);
        }
      }
    });
  }

  public NewLoggerCtx(context: string): ContextLogger {
    if (!this.contextColors.has(context)) {
      const color = this.predefinedColors[this.colorIndex % this.predefinedColors.length];
      this.contextColors.set(context, color);
      this.colorIndex++;
    }

    return {
      log: (message: any, ...optionalParams: any[]) => {
        this.logWithContext(context, "log", message, ...optionalParams);
      },
      error: (message: any, ...optionalParams: any[]) => {
        this.logWithContext(context, "error", message, ...optionalParams);
      },
      warn: (message: any, ...optionalParams: any[]) => {
        this.logWithContext(context, "warn", message, ...optionalParams);
      },
      debug: (message: any, ...optionalParams: any[]) => {
        this.logWithContext(context, "debug", message, ...optionalParams);
      },
      verbose: (message: any, ...optionalParams: any[]) => {
        this.logWithContext(context, "verbose", message, ...optionalParams);
      },
      fatal: (message: any, ...optionalParams: any[]) => {
        this.logWithContext(context, "fatal", message, ...optionalParams);
      }
    };
  }

  private logWithContext(context: string, level: LogLevel, message: any, ...optionalParams: any[]): void {
    if (!this.activeLogLevels.has(level)) return;

    const contextColor = this.contextColors.get(context) ?? this.textColor;
    const levelColor = this.getLevelColor(level);
    const formattedMessage = this.formatLogMessage(level, message, optionalParams);

    this.history.push({
      text: formattedMessage,
      color: levelColor,
      level: level,
      context: context,
      contextColor: contextColor
    });

    this.scrollToBottom = true;
  }

  private getLevelColor(level: LogLevel): number[] {
    switch (level) {
      case "error": return this.errorColor;
      case "warn": return this.warnColor;
      case "debug": return this.debugColor;
      case "verbose": return this.verboseColor;
      case "fatal": return this.fatalColor;
      default: return this.textColor;
    }
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
  }

  public open(): void {
    this.isOpen = true;
  }

  public close(): void {
    this.isOpen = false;
  }

  public setLogLevels(levels: LogLevel[]): void {
    this.activeLogLevels = new Set(levels);
    this.log(`Defined log levels: ${levels.join(", ")}`);
  }

  private cmdLogLevel(args: string[]): void {
    if (args.length === 0) {
      this.error("Usage: log level <level 1> <level 2> ... (available levels: log, error, warn, debug, verbose, fatal)");
      return;
    }

    const validLevels = args.filter(level =>
      ["log", "error", "warn", "debug", "verbose", "fatal"].includes(level)
    ) as LogLevel[];

    if (validLevels.length === 0) {
      this.error("No valid log level provided");
      return;
    }

    this.setLogLevels(validLevels);
  }

  public log(message: any, ...optionalParams: any[]): void {
    if (this.activeLogLevels.has("log")) {
      const formattedMessage = this.formatLogMessage("log", message, optionalParams);
      this.addMessage(formattedMessage, this.textColor, "log");
    }
  }

  public error(message: any, ...optionalParams: any[]): void {
    if (this.activeLogLevels.has("error")) {
      const formattedMessage = this.formatLogMessage("error", message, optionalParams);
      this.addMessage(formattedMessage, this.errorColor, "error");
    }
  }

  public warn(message: any, ...optionalParams: any[]): void {
    if (this.activeLogLevels.has("warn")) {
      const formattedMessage = this.formatLogMessage("warn", message, optionalParams);
      this.addMessage(formattedMessage, this.warnColor, "warn");
    }
  }

  public debug(message: any, ...optionalParams: any[]): void {
    if (this.activeLogLevels.has("debug")) {
      const formattedMessage = this.formatLogMessage("debug", message, optionalParams);
      this.addMessage(formattedMessage, this.debugColor, "debug");
    }
  }

  public verbose(message: any, ...optionalParams: any[]): void {
    if (this.activeLogLevels.has("verbose")) {
      const formattedMessage = this.formatLogMessage("verbose", message, optionalParams);
      this.addMessage(formattedMessage, this.verboseColor, "verbose");
    }
  }

  public fatal(message: any, ...optionalParams: any[]): void {
    if (this.activeLogLevels.has("fatal")) {
      const formattedMessage = this.formatLogMessage("fatal", message, optionalParams);
      this.addMessage(formattedMessage, this.fatalColor, "fatal");
    }
  }

  private formatLogMessage(_level: LogLevel, message: any, optionalParams: any[]): string {
    let messageStr = typeof message === 'object' ? JSON.stringify(message) : String(message);

    if (optionalParams && optionalParams.length > 0) {
      const params = optionalParams.map(param =>
        typeof param === 'object' ? JSON.stringify(param) : String(param)
      ).join(' ');

      messageStr = `${messageStr} ${params}`;
    }

    return `${messageStr}`;
  }

  public addMessage(message: string, color: number[] = this.textColor, level?: LogLevel): void {
    this.history.push({
      text: message,
      color: color,
      level: level
    });
    this.scrollToBottom = true;
  }

  public registerCommand(name: string, callback: (args: string[]) => void, description = ""): void {
    this.commands[name] = {
      callback: callback,
      description: description
    };
  }

  public executeCommand(input: string): void {
    if (!input || input.trim() === "") return;

    this.commandHistory.push(input);
    if (this.commandHistory.length > 50) {
      this.commandHistory.shift();
    }
    this.historyIndex = this.commandHistory.length;

    this.addMessage(`> ${input}`, this.commandColor);

    // Remover a barra inicial se presente
    let command: string;
    let args: string[];

    if (input.startsWith("/")) {
      const parts = input.substring(1).split(" ");
      command = parts[0];
      args = parts.slice(1);
    } else {
      const parts = input.split(" ");
      command = parts[0];
      args = parts.slice(1);
    }

    if (this.commands[command]) {
      this.commands[command].callback(args);
    } else {
      this.error(`Unknown command: ${command}. Type /help to see the list of commands.`);
    }
  }

  public cmdHelp(): void {
    this.log("Available commands:");
    for (const cmd in this.commands) {
      this.log(`  /${cmd} - ${this.commands[cmd].description}`);
    }
  }

  public clearInputBuffer(): void {
    this.inputBuffer = "";
  }

  public cmdClear(): void {
    this.history = [];
    this.log("Clean console");
  }

  public cmdQuit(): void {
    this.log("Closing console...");
    this.close();
  }

  public cmdBind(args: string[]): void {
    if (args.length < 3) {
      this.error("Usage: bind <type> <key> <command>");
      return;
    }

    const [type, key, ...commandParts] = args;
    const command = commandParts.join(" ");

    this.log(`Bind ${type} ${key} to "${command}"`);
  }

  public cmdUnbind(args: string[]): void {
    if (args.length < 2) {
      this.error("Usage: unbind <type> <key>");
      return;
    }

    const [type, key] = args;
    this.log(`Removed link from ${type} ${key}`);
  }

  public setMenuItems(menuName: string, menuItems: MenuItem[]): void {
    if (this.menus[menuName]) {
      this.menus[menuName] = menuItems;
    } else {
      this.error(`Menu "${menuName}" not found.`);
    }
  }

  public addMenu(menuName: string): void {
    if (!this.menus[menuName]) {
      this.menus[menuName] = [];
      this.log(`Menu "${menuName}" added.`);
    }
  }

  private renderMenuItems(items: MenuItem[]): void {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        if (ImGui.BeginMenu(item.label)) {
          this.renderMenuItems(item.children);
          ImGui.EndMenu();
        }
      } else if (item.callback) {
        if (ImGui.MenuItem(item.label)) {
          item.callback();
        }
      } else {
        ImGui.Text(item.label);
      }
    }
  }

  public render(): void {
    if (!this.isOpen) return;

    const style = ImGui.GetStyle();
    const oldWindowRounding = style.WindowRounding;
    const oldWindowBorderSize = style.WindowBorderSize;
    const oldFramePadding = new ImGui.ImVec2(style.FramePadding.x, style.FramePadding.y);

    style.WindowRounding = 0;
    style.WindowBorderSize = 0;

    const windowWidth = ImGui.GetIO().DisplaySize.x;
    const windowHeight = 300;

    ImGui.SetNextWindowPos(new ImGui.ImVec2(0, 0));
    ImGui.SetNextWindowSize(new ImGui.ImVec2(windowWidth, windowHeight));
    ImGui.SetNextWindowBgAlpha(this.backgroundColor[3]);

    const windowFlags =
      ImGui.WindowFlags.NoCollapse |
      ImGui.WindowFlags.NoResize |
      ImGui.WindowFlags.NoMove |
      ImGui.WindowFlags.NoScrollbar |
      ImGui.WindowFlags.NoScrollWithMouse |
      ImGui.WindowFlags.NoTitleBar |
      ImGui.WindowFlags.MenuBar;

    if (ImGui.Begin("##Console", null, windowFlags)) {
      // Aumentar o padding vertical para a barra de menu
      ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(oldFramePadding.x, 8));

      if (ImGui.BeginMenuBar()) {
        for (const menuName in this.menus) {
          if (ImGui.BeginMenu(menuName)) {
            this.renderMenuItems(this.menus[menuName]);
            ImGui.EndMenu();
          }
        }

        ImGui.SameLine(ImGui.GetWindowWidth() - 200);
        ImGui.Text(`Filters: ${Array.from(this.activeLogLevels).join(", ")}`);

        ImGui.EndMenuBar();
      }

      // Restaurar o padding original
      ImGui.PopStyleVar();

      ImGui.Separator();

      const footerHeight = ImGui.GetStyle().ItemSpacing.y + ImGui.GetFrameHeightWithSpacing();
      ImGui.BeginChild("ScrollingRegion", new ImGui.ImVec2(0, -footerHeight), false, ImGui.WindowFlags.HorizontalScrollbar);

      ImGui.PushStyleVar(ImGui.StyleVar.ItemSpacing, new ImGui.ImVec2(4, 1));

      for (const item of this.history) {
        if (item.context && item.contextColor) {
          ImGui.PushStyleColor(ImGui.Col.Text, new ImGui.ImVec4(
            item.contextColor[0],
            item.contextColor[1],
            item.contextColor[2],
            item.contextColor[3]
          ));

          ImGui.Text(item.context);

          ImGui.SameLine();

          ImGui.PopStyleColor();
        }

        ImGui.PushStyleColor(ImGui.Col.Text, new ImGui.ImVec4(
          item.color[0],
          item.color[1],
          item.color[2],
          item.color[3]
        ));

        ImGui.TextUnformatted(item.text);
        ImGui.PopStyleColor();
      }

      if (this.scrollToBottom || (ImGui.GetScrollY() >= ImGui.GetScrollMaxY())) {
        ImGui.SetScrollHereY(1.0);
        this.scrollToBottom = false;
      }

      ImGui.PopStyleVar();
      ImGui.EndChild();

      ImGui.Separator();

      const clearButtonWidth = 60;
      const spacing = ImGui.GetStyle().ItemSpacing.x;

      ImGui.PushItemWidth(windowWidth - clearButtonWidth - spacing * 3);

      const inputText = new ImGui.ImStringBuffer(256, this.inputBuffer);
      const inputTextFlags =
        ImGui.InputTextFlags.CallbackCompletion |
        ImGui.InputTextFlags.CallbackHistory |
        ImGui.InputTextFlags.EnterReturnsTrue;

      ImGui.InputText("##input", inputText, inputTextFlags);
      this.inputBuffer = inputText.buffer;

      if (ImGui.IsItemFocused() &&
        (ImGui.IsKeyPressed(ImGui.GetKeyIndex(ImGui.Key.UpArrow)) ||
          ImGui.IsKeyPressed(ImGui.GetKeyIndex(ImGui.Key.DownArrow)))) {
        const direction = ImGui.IsKeyPressed(ImGui.GetKeyIndex(ImGui.Key.UpArrow)) ? -1 : 1;
        this.navigateHistory(direction);
      }

      ImGui.SetItemDefaultFocus();
      if (ImGui.IsWindowAppearing()) {
        ImGui.SetKeyboardFocusHere(-1);
      }

      ImGui.PopItemWidth();

      ImGui.SameLine();

      if (ImGui.Button("Clear", new ImGui.ImVec2(clearButtonWidth, 0))) {
        this.cmdClear();
      }
    }
    ImGui.End();

    style.WindowRounding = oldWindowRounding;
    style.WindowBorderSize = oldWindowBorderSize;
  }

  public navigateHistory(direction: number): void {
    if (this.commandHistory.length === 0) return;

    if (direction < 0) {
      if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      if (this.historyIndex < this.commandHistory.length) {
        this.historyIndex++;
      }
    }

    if (this.historyIndex < this.commandHistory.length) {
      this.inputBuffer = this.commandHistory[this.historyIndex];
    } else {
      this.inputBuffer = "";
    }
  }
}