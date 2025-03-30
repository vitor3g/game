import { hexToImVec4 } from "@/shared/imgui.utils";
import { ImGui } from "@zhobo63/imgui-ts";
import { Primitive } from "./primitive";

export interface TextPrimitiveProps {
  text: string;
  x: number;
  y: number;
  color?: string;
}

export class PrimitiveText extends Primitive<TextPrimitiveProps> {
  constructor(props: TextPrimitiveProps) {
    super(props);
  }

  render(): void {
    const drawList = ImGui.GetForegroundDrawList();
    const pos = new ImGui.ImVec2(this.props.x, this.props.y);
    const colorVec4 = this.props.color
      ? hexToImVec4(this.props.color)
      : undefined;
    const colorU32 = colorVec4
      ? ImGui.GetColorU32(colorVec4)
      : ImGui.GetColorU32(ImGui.Col.Text);

    drawList.AddText(pos, colorU32, this.props.text);
  }
}
