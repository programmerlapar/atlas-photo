import type React from 'react';
import LiquidGlass, { type LiquidGlassProps } from './LiquidGlass';

type FloatingLiquidContainerProps = LiquidGlassProps & {
  children?: React.ReactNode;
  className?: string;
};

/**
 * FloatingLiquidContainer
 *
 * A reusable preset wrapper around `LiquidGlass` tailored for floating, pill/oval-like
 * overlays such as metadata previews or context tooltips. Defaults match the
 * Gallery hover preview usage while allowing prop overrides.
 *
 * Parameters mirror `LiquidGlassProps`; provide only those you want to override.
 */
const FloatingLiquidContainer: React.FC<FloatingLiquidContainerProps> = ({
  children,
  className = 'w-fit',
  // Defaults chosen from the Gallery hover preview instance
  borderRadius = 28,
  blur = 5,
  contrast = 1.2,
  brightness = 1.05,
  saturation = 1.1,
  shadowIntensity = 0.3,
  displacementScale = 8,
  elasticity = 0.6,
  swirlIntensity = 50,
  swirlScale = 100,
  swirlRadius = 20,
  edgeThicknessPx = 20,
  zIndex,
  textShadow,
  shiningBorder,
  shiningIntensity,
}) => {
  return (
    <LiquidGlass
      borderRadius={borderRadius}
      blur={blur}
      contrast={contrast}
      brightness={brightness}
      saturation={saturation}
      shadowIntensity={shadowIntensity}
      displacementScale={displacementScale}
      elasticity={elasticity}
      swirlIntensity={swirlIntensity}
      swirlScale={swirlScale}
      swirlRadius={swirlRadius}
      edgeThicknessPx={edgeThicknessPx}
      zIndex={zIndex}
      textShadow={textShadow}
      shiningBorder={shiningBorder}
      shiningIntensity={shiningIntensity}
      className={className}
    >
      {children}
    </LiquidGlass>
  );
};

export default FloatingLiquidContainer;


