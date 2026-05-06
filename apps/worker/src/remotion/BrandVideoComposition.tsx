import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion'

export interface VideoScene {
  text: string
  subtext?: string
  durationInSeconds: number
}

export interface BrandVideoProps {
  scenes: VideoScene[]
  brandColor: string
}

// ─── color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ]
}

function shiftColor(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  return `rgb(${clamp(r + delta)}, ${clamp(g + delta)}, ${clamp(b + delta)})`
}

// ─── single scene ─────────────────────────────────────────────────────────────

const SceneSlide: React.FC<{
  scene:        VideoScene
  brandColor:   string
  fps:          number
  totalFrames:  number
}> = ({ scene, brandColor, fps, totalFrames }) => {
  const frame = useCurrentFrame()

  // — title spring (natural bounce) —
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
    durationInFrames: 28,
  })
  const titleY       = interpolate(titleProgress, [0, 1], [56, 0])
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1])

  // — accent bar slides in before title —
  const barProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
    durationInFrames: 18,
  })
  const barScale = interpolate(barProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // — subtitle fades in after title —
  const subtitleOpacity = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  })

  // — fade out last 12 frames of every scene —
  const sceneOpacity = interpolate(
    frame,
    [totalFrames - 12, totalFrames - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  // — slow-rotating decorative circles —
  const rotA =  frame * 0.25
  const rotB = -frame * 0.18
  // — pulsing glow —
  const pulse = 0.06 * Math.sin(frame * 0.07) + 1

  const darker  = shiftColor(brandColor, -55)
  const lighter = shiftColor(brandColor, +35)

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${darker} 0%, ${brandColor} 48%, ${lighter} 100%)`,
        overflow: 'hidden',
        opacity: sceneOpacity,
      }}
    >
      {/* ── radial vignette ─────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)',
      }} />

      {/* ── decorative ring — top right ─────────────── */}
      <div style={{
        position: 'absolute',
        width: 680, height: 680,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.07)',
        top: -240, right: -220,
        transform: `rotate(${rotA}deg) scale(${pulse})`,
      }} />

      {/* ── decorative ring — bottom left ───────────── */}
      <div style={{
        position: 'absolute',
        width: 460, height: 460,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.05)',
        bottom: -170, left: -140,
        transform: `rotate(${rotB}deg)`,
      }} />

      {/* ── inner glow circle ───────────────────────── */}
      <div style={{
        position: 'absolute',
        width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* ── content ─────────────────────────────────── */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 130px',
        gap: 0,
      }}>

        {/* accent bar */}
        <div style={{
          width: 72 * barScale,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderRadius: 2,
          marginBottom: 28,
          boxShadow: '0 0 12px rgba(255,255,255,0.5)',
        }} />

        {/* title */}
        <h1 style={{
          color: '#FFFFFF',
          fontSize: 88,
          fontWeight: 900,
          fontFamily: '"Arial Black", Arial, sans-serif',
          margin: 0,
          lineHeight: 1.0,
          letterSpacing: '-2.5px',
          textAlign: 'center',
          maxWidth: 920,
          textShadow: '0 6px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          {scene.text}
        </h1>

        {/* subtitle */}
        {scene.subtext ? (
          <p style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: 34,
            fontWeight: 300,
            fontFamily: 'Arial, sans-serif',
            margin: 0,
            marginTop: 22,
            lineHeight: 1.45,
            textAlign: 'center',
            letterSpacing: '0.3px',
            maxWidth: 780,
            textShadow: '0 3px 20px rgba(0,0,0,0.35)',
            opacity: subtitleOpacity,
          }}>
            {scene.subtext}
          </p>
        ) : null}
      </div>

      {/* ── bottom subtle line ──────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        left: '50%',
        transform: `translateX(-50%) scaleX(${barScale})`,
        width: 40,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 1,
      }} />
    </AbsoluteFill>
  )
}

// ─── composition root ─────────────────────────────────────────────────────────

export const BrandVideoComposition: React.FC<BrandVideoProps> = ({
  scenes,
  brandColor,
}) => {
  const { fps } = useVideoConfig()

  let offset = 0
  return (
    <>
      {scenes.map((scene, i) => {
        const durationInFrames = Math.round(scene.durationInSeconds * fps)
        const from = offset
        offset += durationInFrames
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <SceneSlide
              scene={scene}
              brandColor={brandColor}
              fps={fps}
              totalFrames={durationInFrames}
            />
          </Sequence>
        )
      })}
    </>
  )
}
