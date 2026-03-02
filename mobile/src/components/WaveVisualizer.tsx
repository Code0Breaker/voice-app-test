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
 * SKSL fragment shader – smooth atmospheric gradient bands.
 *
 * Produces a soft, blended sunset/horizon look with warm rose/salmon
 * colours. No visible individual lines – everything is Gaussian-blurred.
 *
 * Uniforms:
 *   iResolution  – canvas size
 *   iTime        – seconds (slow organic motion)
 *   iIntensity   – 0..1  spread & brightness
 *   iHueShift    – 0..1  palette shift (rose → violet)
 *   iDirection   – -1 bottom→top (user), 0 neutral, +1 top→bottom (AI)
 */
const source = Skia.RuntimeEffect.Make(`
uniform float2 iResolution;
uniform float  iTime;
uniform float  iIntensity;
uniform float  iHueShift;
uniform float  iDirection;

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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / iResolution;

  // Dark background
  float3 bgDark = float3(0.08, 0.04, 0.06);
  float3 bgMid  = float3(0.18, 0.08, 0.10);

  // Warm rose / salmon palette
  float3 colCore = mix(float3(0.88, 0.52, 0.48), float3(0.72, 0.38, 0.58), iHueShift);
  float3 colMid  = mix(float3(0.78, 0.40, 0.38), float3(0.55, 0.28, 0.48), iHueShift);
  float3 colEdge = mix(float3(0.45, 0.20, 0.22), float3(0.35, 0.15, 0.30), iHueShift);

  // Band center: direction shifts it vertically
  float centerY = 0.5 - iDirection * 0.18;

  // Slow organic motion via fbm
  float t = iTime * 0.12;
  float dirFlow = iDirection * t * 0.6;
  float n1 = fbm(float2(uv.x * 2.5 + t, uv.y * 1.2 + dirFlow));
  float n2 = fbm(float2(uv.x * 4.0 - t * 0.5, uv.y * 1.8 - dirFlow * 0.4));
  float n3 = fbm(float2(uv.x * 1.5 + t * 0.3, uv.y * 3.0 + dirFlow * 0.3));

  // Vertical distance from center, warped by noise
  float dy = uv.y - centerY + (n1 - 0.5) * 0.08 * iIntensity;

  // Layered Gaussian bands (wide, soft, no sharp lines)
  float spread1 = 0.06 + 0.16 * iIntensity;
  float glow1   = exp(-dy * dy / (2.0 * spread1 * spread1));

  float spread2 = spread1 * 0.5;
  float glow2   = exp(-dy * dy / (2.0 * spread2 * spread2));

  float spread3 = spread1 * 2.2;
  float glow3   = exp(-dy * dy / (2.0 * spread3 * spread3));

  // Shimmer from second noise layer
  float shimmer = 0.8 + 0.2 * n2;

  // Compose: dark background → edge colour → mid colour → core colour
  float3 col = mix(bgDark, bgMid, glow3 * 0.6);
  col = mix(col, colEdge, glow3 * iIntensity * shimmer);
  col = mix(col, colMid,  glow1 * iIntensity * shimmer);
  col = mix(col, colCore, glow2 * iIntensity * shimmer * 0.9);

  // Subtle horizontal streaks via third noise layer
  float streak = smoothstep(0.42, 0.58, n3) * 0.15 * iIntensity * glow1;
  col += float3(1.0, 0.85, 0.78) * streak;

  return half4(half3(col), 1.0);
}
`)!;

interface WaveVisualizerProps {
  width: number;
  height: number;
  /** 0-1 glow spread & brightness */
  intensity: SharedValue<number>;
  /** 0-1 palette shift (rose → violet) */
  hueShift: SharedValue<number>;
  /** -1 bottom→top (user speaking), 0 neutral, +1 top→bottom (AI answering) */
  direction: SharedValue<number>;
}

export function WaveVisualizer({
  width,
  height,
  intensity,
  hueShift,
  direction,
}: WaveVisualizerProps) {
  const time = useSharedValue(0);

  useFrameCallback((info) => {
    time.value = (info.timeSinceFirstFrame ?? 0) / 1000;
  });

  const uniforms = useDerivedValue(() => ({
    iResolution: [width, height],
    iTime: time.value,
    iIntensity: intensity.value,
    iHueShift: hueShift.value,
    iDirection: direction.value,
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
