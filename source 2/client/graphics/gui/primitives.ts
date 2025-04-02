import type { Primitive } from "./ui/primitive";
import { PrimitiveRectangle } from "./ui/rectangle"; // importa o primitive novo
import { PrimitiveText } from "./ui/text";

export class Primitives {
  private list: Primitive<any>[] = [];

  constructor() {}

  public update() {
    for (const primitive of this.list) {
      primitive.render();
    }

    this.list = [];
  }

  public getList() {
    return this.list;
  }

  public addText(text: string | number, x: number, y: number, color?: string): void {
    const primitive = new PrimitiveText({
      text: String(text),
      x,
      y,
      color
    });

    this.list.push(primitive);
  }

  public addRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string,
    fill = false,
    thickness = 1
  ): void {
    const primitive = new PrimitiveRectangle({
      x,
      y,
      width,
      height,
      color,
      fill,
      thickness
    });

    this.list.push(primitive);
  }
}
