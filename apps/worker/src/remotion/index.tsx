import React, { type ComponentType } from 'react'
import { Composition, registerRoot } from 'remotion'
import {
  BrandVideoComposition,
  type BrandVideoProps,
} from './BrandVideoComposition'

type AnyProps = Record<string, unknown>
const VideoComp = BrandVideoComposition as unknown as ComponentType<AnyProps>

const DEFAULT_PROPS: BrandVideoProps = {
  scenes: [
    { text: 'Tu Marca',            subtext: 'Tu tagline aquí',                      durationInSeconds: 5, layout: 'intro'   },
    { text: '¿Por qué elegirnos?', subtext: 'Resultados reales, sin frases vacías', durationInSeconds: 5, layout: 'content' },
    { text: '¡Únete hoy!',         subtext: 'Plazas limitadas',                     durationInSeconds: 5, layout: 'cta'     },
  ],
  brandColor:          '#7C3AED',
  secondaryColor:      '#A855F7',
  accentColor:         '#EDE9FE',
  brandName:           'Tu Marca',
  referenceImageUrls:  [],
  seed:                42,         // para preview en Remotion Studio
}

function Root() {
  return (
    <Composition
      id="BrandVideo"
      component={VideoComp}
      durationInFrames={360}
      fps={24}
      width={1280}
      height={720}
      defaultProps={DEFAULT_PROPS as unknown as AnyProps}
    />
  )
}

registerRoot(Root)
