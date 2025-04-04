export abstract class Primitive<T> {
  public readonly props: T;

  constructor(props: T) {
    this.props = props;
  }

  abstract render(): void;
}
