import "react";

declare module "react" {
  // Allow custom properties such as `--hue` in style props.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
