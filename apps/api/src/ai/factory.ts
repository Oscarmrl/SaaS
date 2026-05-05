import type { AIImageProvider } from './providers/images/base'
import type { AITextProvider } from './providers/text/base'
import type { AIVoiceProvider } from './providers/voice/base'
import type { AIVideoProvider } from './providers/video/base'
import type { AssetType } from '@brandai/shared'

// ─── Lazy singletons ──────────────────────────────────────────────────────────
// Providers are instantiated on first use so missing API keys only fail
// when the specific provider is actually needed.

let _imageProvider: AIImageProvider | null = null
let _textProvider: AITextProvider | null = null
let _haikuProvider: AITextProvider | null = null
let _voiceProvider: AIVoiceProvider | null = null
let _videoProvider: AIVideoProvider | null = null

export function getImageProvider(): AIImageProvider {
  if (_imageProvider) return _imageProvider

  const name = process.env['IMAGE_PROVIDER'] ?? 'flux-pro'
  switch (name) {
    case 'flux-pro': {
      const { FluxProProvider } = require('./providers/images/flux-pro') as typeof import('./providers/images/flux-pro')
      _imageProvider = new FluxProProvider()
      break
    }
    default:
      throw new Error(`Unknown IMAGE_PROVIDER: ${name}. Supported: flux-pro`)
  }
  return _imageProvider
}

export function getTextProvider(): AITextProvider {
  if (_textProvider) return _textProvider

  const name = process.env['TEXT_PROVIDER'] ?? 'claude-sonnet'
  switch (name) {
    case 'claude-sonnet': {
      const { ClaudeSonnetProvider } = require('./providers/text/claude-sonnet') as typeof import('./providers/text/claude-sonnet')
      _textProvider = new ClaudeSonnetProvider()
      break
    }
    default:
      throw new Error(`Unknown TEXT_PROVIDER: ${name}. Supported: claude-sonnet`)
  }
  return _textProvider
}

export function getHaikuProvider(): AITextProvider {
  if (_haikuProvider) return _haikuProvider
  const { ClaudeHaikuProvider } = require('./providers/text/claude-haiku') as typeof import('./providers/text/claude-haiku')
  _haikuProvider = new ClaudeHaikuProvider()
  return _haikuProvider
}

export function getVoiceProvider(): AIVoiceProvider {
  if (_voiceProvider) return _voiceProvider

  const name = process.env['VOICE_PROVIDER'] ?? 'elevenlabs'
  switch (name) {
    case 'elevenlabs': {
      const { ElevenLabsProvider } = require('./providers/voice/elevenlabs') as typeof import('./providers/voice/elevenlabs')
      _voiceProvider = new ElevenLabsProvider()
      break
    }
    default:
      throw new Error(`Unknown VOICE_PROVIDER: ${name}. Supported: elevenlabs`)
  }
  return _voiceProvider
}

export function getVideoProvider(): AIVideoProvider {
  if (_videoProvider) return _videoProvider

  const name = process.env['VIDEO_PROVIDER'] ?? 'remotion-ffmpeg'
  switch (name) {
    case 'remotion-ffmpeg': {
      const { RemotionFfmpegProvider } = require('./providers/video/remotion-ffmpeg') as typeof import('./providers/video/remotion-ffmpeg')
      _videoProvider = new RemotionFfmpegProvider()
      break
    }
    default:
      throw new Error(`Unknown VIDEO_PROVIDER: ${name}. Supported: remotion-ffmpeg`)
  }
  return _videoProvider
}

export function getProviderNameForAsset(type: AssetType): string {
  switch (type) {
    case 'IMAGE':
    case 'BANNER':
      return process.env['IMAGE_PROVIDER'] ?? 'flux-pro'
    case 'CAPTION':
      return process.env['TEXT_PROVIDER'] ?? 'claude-sonnet'
    case 'VIDEO_15S':
    case 'VIDEO_30S':
      return process.env['VIDEO_PROVIDER'] ?? 'remotion-ffmpeg'
  }
}
