import { useEffect, useRef } from 'react';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Vector3,
  Vector2,
  Clock
} from 'three';

import './FloatingLines.css';

const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;
uniform vec3 bgColor;

uniform float topLineWidth;
uniform float middleLineWidth;
uniform float bottomLineWidth;
uniform float topOpacity;
uniform float middleOpacity;
uniform float bottomOpacity;
uniform float topSoftness;
uniform float middleSoftness;
uniform float bottomSoftness;

const vec3 BLACK = vec3(0.0);
const vec3 PINK = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE = vec3(47.0, 75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend, float lineWidth, float softness) {
  float time = iTime * animationSpeed;

  float x_offset = offset;
  float x_movement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  float falloff = mix(0.01, 0.25, clamp(softness, 0.0, 1.0));
  return (0.0175 * lineWidth) / max(abs(m) + falloff, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = bgColor;

  float bgLum = dot(bgColor, vec3(0.299, 0.587, 0.114));
  bool lightBg = bgLum > 0.5;

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      float w = wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi, baseUv, mouseUv, interactive, bottomLineWidth, bottomSoftness
      ) * bottomOpacity;
      if (lightBg) { col = mix(col, lineCol * 2.0, clamp(w, 0.0, 1.0)); }
      else { col += lineCol * w; }
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      float w = wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi, baseUv, mouseUv, interactive, middleLineWidth, middleSoftness
      ) * middleOpacity;
      if (lightBg) { col = mix(col, lineCol * 2.0, clamp(w, 0.0, 1.0)); }
      else { col += lineCol * w; }
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      float w = wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi, baseUv, mouseUv, interactive, topLineWidth, topSoftness
      ) * topOpacity;
      if (lightBg) { col = mix(col, lineCol * 2.0, clamp(w, 0.0, 1.0)); }
      else { col += lineCol * w; }
    }
  }

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = hex.trim();
  if (value.startsWith('#')) value = value.slice(1);

  let r = 255, g = 255, b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new Vector3(r / 255, g / 255, b / 255);
}

function resolveLineCount(waveType, enabledWaves, lineCount) {
  if (typeof lineCount === 'number') return lineCount;
  if (!enabledWaves.includes(waveType)) return 0;
  return lineCount[enabledWaves.indexOf(waveType)] ?? 6;
}

function resolveLineDistance(waveType, enabledWaves, lineDistance) {
  if (typeof lineDistance === 'number') return lineDistance;
  if (!enabledWaves.includes(waveType)) return 0.1;
  return lineDistance[enabledWaves.indexOf(waveType)] ?? 0.1;
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen',
  backgroundColor = '#000000',
  topLineWidth = 1.0, middleLineWidth = 1.0, bottomLineWidth = 1.0,
  topOpacity = 0.1, middleOpacity = 1.0, bottomOpacity = 0.2,
  topSoftness = 0.0, middleSoftness = 0.0, bottomSoftness = 0.0,
}) {
  const containerRef = useRef(null);
  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const currentMouseRef = useRef(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));

  // Always holds the latest props — read by the render loop each frame
  const propsRef = useRef(null);
  propsRef.current = {
    linesGradient, enabledWaves, lineCount, lineDistance,
    topWavePosition, middleWavePosition, bottomWavePosition,
    animationSpeed, interactive, bendRadius, bendStrength,
    mouseDamping, parallax, parallaxStrength, backgroundColor,
    topLineWidth, middleLineWidth, bottomLineWidth,
    topOpacity, middleOpacity, bottomOpacity,
    topSoftness, middleSoftness, bottomSoftness,
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);

    const p = propsRef.current;
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: p.animationSpeed },
      enableTop: { value: p.enabledWaves.includes('top') },
      enableMiddle: { value: p.enabledWaves.includes('middle') },
      enableBottom: { value: p.enabledWaves.includes('bottom') },
      topLineCount: { value: resolveLineCount('top', p.enabledWaves, p.lineCount) },
      middleLineCount: { value: resolveLineCount('middle', p.enabledWaves, p.lineCount) },
      bottomLineCount: { value: resolveLineCount('bottom', p.enabledWaves, p.lineCount) },
      topLineDistance: { value: p.enabledWaves.includes('top') ? resolveLineDistance('top', p.enabledWaves, p.lineDistance) * 0.01 : 0.01 },
      middleLineDistance: { value: p.enabledWaves.includes('middle') ? resolveLineDistance('middle', p.enabledWaves, p.lineDistance) * 0.01 : 0.01 },
      bottomLineDistance: { value: p.enabledWaves.includes('bottom') ? resolveLineDistance('bottom', p.enabledWaves, p.lineDistance) * 0.01 : 0.01 },
      topWavePosition: {
        value: new Vector3(p.topWavePosition?.x ?? 10.0, p.topWavePosition?.y ?? 0.5, p.topWavePosition?.rotate ?? -0.4),
      },
      middleWavePosition: {
        value: new Vector3(p.middleWavePosition?.x ?? 5.0, p.middleWavePosition?.y ?? 0.0, p.middleWavePosition?.rotate ?? 0.2),
      },
      bottomWavePosition: {
        value: new Vector3(p.bottomWavePosition?.x ?? 2.0, p.bottomWavePosition?.y ?? -0.7, p.bottomWavePosition?.rotate ?? 0.4),
      },
      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: p.interactive },
      bendRadius: { value: p.bendRadius },
      bendStrength: { value: p.bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: p.parallax },
      parallaxStrength: { value: p.parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },
      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)),
      },
      lineGradientCount: { value: 0 },
      bgColor: { value: hexToVec3(p.backgroundColor ?? '#000000') },
      topLineWidth: { value: p.topLineWidth ?? 1.0 },
      middleLineWidth: { value: p.middleLineWidth ?? 1.0 },
      bottomLineWidth: { value: p.bottomLineWidth ?? 1.0 },
      topOpacity: { value: p.topOpacity ?? 0.1 },
      middleOpacity: { value: p.middleOpacity ?? 1.0 },
      bottomOpacity: { value: p.bottomOpacity ?? 0.2 },
      topSoftness: { value: p.topSoftness ?? 0.0 },
      middleSoftness: { value: p.middleSoftness ?? 0.0 },
      bottomSoftness: { value: p.bottomSoftness ?? 0.0 },
    };

    if (p.linesGradient && p.linesGradient.length > 0) {
      const stops = p.linesGradient.slice(0, MAX_GRADIENT_STOPS);
      uniforms.lineGradientCount.value = stops.length;
      stops.forEach((hex, i) => {
        const color = hexToVec3(hex);
        uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
      });
    }

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();

    const setSize = () => {
      const el = containerRef.current;
      if (!el) return;
      const width = el.clientWidth || 1;
      const height = el.clientHeight || 1;
      renderer.setSize(width, height, false);
      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setSize) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);

    const handlePointerMove = (event) => {
      const pp = propsRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = renderer.getPixelRatio();
      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;

      if (pp.parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallaxRef.current.set(offsetX * pp.parallaxStrength, offsetY * pp.parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    let raf = 0;
    let lastGradientRef = propsRef.current.linesGradient;
    let lastBgColor = propsRef.current.backgroundColor ?? '#000000';

    const renderLoop = () => {
      const pp = propsRef.current;

      // Sync all uniforms from latest props each frame
      uniforms.animationSpeed.value = pp.animationSpeed;
      uniforms.interactive.value = pp.interactive;
      uniforms.bendRadius.value = pp.bendRadius;
      uniforms.bendStrength.value = pp.bendStrength;
      uniforms.parallax.value = pp.parallax;
      uniforms.parallaxStrength.value = pp.parallaxStrength;
      uniforms.enableTop.value = pp.enabledWaves.includes('top');
      uniforms.enableMiddle.value = pp.enabledWaves.includes('middle');
      uniforms.enableBottom.value = pp.enabledWaves.includes('bottom');
      uniforms.topLineCount.value = resolveLineCount('top', pp.enabledWaves, pp.lineCount);
      uniforms.middleLineCount.value = resolveLineCount('middle', pp.enabledWaves, pp.lineCount);
      uniforms.bottomLineCount.value = resolveLineCount('bottom', pp.enabledWaves, pp.lineCount);
      uniforms.topLineDistance.value = pp.enabledWaves.includes('top') ? resolveLineDistance('top', pp.enabledWaves, pp.lineDistance) * 0.01 : 0.01;
      uniforms.middleLineDistance.value = pp.enabledWaves.includes('middle') ? resolveLineDistance('middle', pp.enabledWaves, pp.lineDistance) * 0.01 : 0.01;
      uniforms.bottomLineDistance.value = pp.enabledWaves.includes('bottom') ? resolveLineDistance('bottom', pp.enabledWaves, pp.lineDistance) * 0.01 : 0.01;

      const tw = pp.topWavePosition;
      uniforms.topWavePosition.value.set(tw?.x ?? 10.0, tw?.y ?? 0.5, tw?.rotate ?? -0.4);
      const mw = pp.middleWavePosition;
      uniforms.middleWavePosition.value.set(mw?.x ?? 5.0, mw?.y ?? 0.0, mw?.rotate ?? 0.2);
      const bw = pp.bottomWavePosition;
      uniforms.bottomWavePosition.value.set(bw?.x ?? 2.0, bw?.y ?? -0.7, bw?.rotate ?? 0.4);

      // Only re-parse gradient when the array reference changes
      if (pp.linesGradient !== lastGradientRef) {
        lastGradientRef = pp.linesGradient;
        if (pp.linesGradient && pp.linesGradient.length > 0) {
          const stops = pp.linesGradient.slice(0, MAX_GRADIENT_STOPS);
          uniforms.lineGradientCount.value = stops.length;
          stops.forEach((hex, i) => {
            const color = hexToVec3(hex);
            uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
          });
        } else {
          uniforms.lineGradientCount.value = 0;
        }
      }

      const newBgColor = pp.backgroundColor ?? '#000000';
      if (newBgColor !== lastBgColor) {
        lastBgColor = newBgColor;
        const bg = hexToVec3(newBgColor);
        uniforms.bgColor.value.set(bg.x, bg.y, bg.z);
      }

      uniforms.topLineWidth.value = pp.topLineWidth ?? 1.0;
      uniforms.middleLineWidth.value = pp.middleLineWidth ?? 1.0;
      uniforms.bottomLineWidth.value = pp.bottomLineWidth ?? 1.0;
      uniforms.topOpacity.value = pp.topOpacity ?? 0.1;
      uniforms.middleOpacity.value = pp.middleOpacity ?? 1.0;
      uniforms.bottomOpacity.value = pp.bottomOpacity ?? 0.2;
      uniforms.topSoftness.value = pp.topSoftness ?? 0.0;
      uniforms.middleSoftness.value = pp.middleSoftness ?? 0.0;
      uniforms.bottomSoftness.value = pp.bottomSoftness ?? 0.0;

      uniforms.iTime.value = clock.getElapsedTime();

      if (pp.interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, pp.mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);
        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * pp.mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      if (pp.parallax) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, pp.mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(raf);
      if (ro && containerRef.current) ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container"
      style={{ mixBlendMode }}
    />
  );
}
