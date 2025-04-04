import { hexToImVec4 } from "@/shared/imgui.utils";
import { ImGui } from "@zhobo63/imgui-ts";
import { Primitive } from "./primitive";

export interface RectanglePrimitiveProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  fill?: boolean;
  thickness?: number;
}

export class PrimitiveRectangle extends Primitive<RectanglePrimitiveProps> {
  constructor(props: RectanglePrimitiveProps) {
    super(props);
  }

  render(): void {
    const drawList = ImGui.GetForegroundDrawList();
    const pMin = new ImGui.ImVec2(this.props.x, this.props.y);
    const pMax = new ImGui.ImVec2(
      this.props.x + this.props.width,
      this.props.y + this.props.height,
    );

    const colorVec4 = this.props.color
      ? hexToImVec4(this.props.color)
      : undefined;
    const colorU32 = colorVec4
      ? ImGui.GetColorU32(colorVec4)
      : ImGui.GetColorU32(ImGui.Col.Border);
    const thickness = this.props.thickness ?? 1.0;

    if (this.props.fill) {
      drawList.AddRectFilled(pMin, pMax, colorU32, 0.0);
    } else {
      drawList.AddRect(pMin, pMax, colorU32, 0.0, 0, thickness);
    }
  }
}
