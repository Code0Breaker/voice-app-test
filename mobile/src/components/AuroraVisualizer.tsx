import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Shader, Fill, Skia } from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useSharedValue,
  useFrameCallback,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * SKSL fragment shader – warm horizontal aurora/horizon glow.
 *
 * Uniforms:
 *   iResolution  – canvas size
 *   iTime        – seconds (subtle organic motion)
 *   iIntensity   – 0..1 brightness & vertical spread
 *   iHueShift    – 0..1 palette shift (gold → pink/violet)
 */
const source = Skia.RuntimeEffect.Make(`
uniform float2 iResolution;
uniform float  iTime;
uniform float  iIntensity;
uniform float  iHueShift;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + float2(1.0, 0.0)), u.x),
    mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  float2 shift = float2(100.0, 100.0);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / iResolution;

  // dark background palette
  float3 bgDark  = float3(0.04, 0.02, 0.06);
  float3 bgMid   = float3(0.10, 0.03, 0.08);

  // warm aurora colours
  float3 colGold   = float3(0.91, 0.63, 0.40);
  float3 colOrange = float3(0.85, 0.45, 0.28);
  float3 colPink   = float3(0.75, 0.38, 0.50);
  float3 colViolet = float3(0.50, 0.22, 0.45);

  float3 hotCore = mix(colGold, colPink, iHueShift);
  float3 hotEdge = mix(colOrange, colViolet, iHueShift);

  float centerY = 0.48;

  float t  = iTime * 0.15;
  float n  = fbm(float2(uv.x * 3.0 + t, uv.y * 1.5 - t * 0.5));
  float n2 = fbm(float2(uv.x * 5.0 - t * 0.7, uv.y * 2.0 + t * 0.3));

  float dy = abs(uv.y - centerY + (n - 0.5) * 0.06 * iIntensity);

  float spread     = 0.02 + 0.18 * iIntensity;
  float glow       = exp(-dy * dy / (2.0 * spread * spread));

  float spreadWide = spread * 3.0;
  float glowWide   = exp(-dy * dy / (2.0 * spreadWide * spreadWide)) * 0.4;

  float lineGlow   = exp(-dy * dy / (2.0 * 0.003 * 0.003)) * iIntensity * 0.7;

  float shimmer    = 0.85 + 0.15 * n2;

  float3 col = mix(bgDark, bgMid, glowWide);
  col = mix(col, hotEdge, glowWide * iIntensity * shimmer);
  col = mix(col, hotCore, glow * iIntensity * shimmer);
  col += float3(1.0, 0.9, 0.8) * lineGlow * shimmer;

  return half4(half3(col), 1.0);
}
`)!;

interface AuroraVisualizerProps {
  width: number;
  height: number;
  /** 0-1 glow brightness / spread */
  intensity: SharedValue<number>;
  /** 0-1 palette shift from gold → violet */
  hueShift: SharedValue<number>;
}

export function AuroraVisualizer({
  width,
  height,
  intensity,
  hueShift,
}: AuroraVisualizerProps) {
  const time = useSharedValue(0);

  useFrameCallback((info) => {
    time.value = (info.timeSinceFirstFrame ?? 0) / 1000;
  });

  const uniforms = useDerivedValue(() => ({
    iResolution: [width, height],
    iTime: time.value,
    iIntensity: intensity.value,
    iHueShift: hueShift.value,
  }));

  return (
    <Canvas style={[styles.canvas, { width, height }]}>
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
