import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";

import {
  SparkLine as HeadlessSparkLine,
  type SparkLineProps,
} from "../../headless/atoms/SparkLine";

export type { SparkLineProps };

function getStrokeColor(positive: boolean): string {
  return positive
    ? "var(--beat-ui-color-success)"
    : "var(--beat-ui-color-danger)";
}

function autoPositive(values: readonly number[]): boolean {
  if (values.length < 2) return true;
  return values[values.length - 1]! >= values[0]!;
}

export const SparkLine = component<SparkLineProps>((props) => {
  const widthStyle = props.width === undefined ? "width:100%" : undefined;

  const baseStyle = [
    "display:block",
    "overflow:visible",
    "flex-shrink:0",
    ...(widthStyle !== undefined ? [widthStyle] : []),
  ].join(";");

  // If user already provides stroke, pass it through unchanged
  if (props.stroke !== undefined) {
    return <HeadlessSparkLine {...props} styles={{ root: baseStyle }} />;
  }

  // Compute design-token stroke from positive/values
  const computeStroke = (): string => {
    const isPositive =
      props.positive !== undefined
        ? props.positive.get()
        : autoPositive(props.values.get());
    return getStrokeColor(isPositive);
  };

  const derivedStroke = pulse(computeStroke());

  onCleanup(
    props.values.on(() => {
      if (props.positive === undefined) derivedStroke.set(computeStroke());
    }),
  );

  if (props.positive !== undefined) {
    onCleanup(props.positive.on(() => derivedStroke.set(computeStroke())));
  }

  return (
    <HeadlessSparkLine
      {...props}
      styles={{ root: baseStyle }}
      stroke={derivedStroke}
    />
  );
});
