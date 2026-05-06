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
    { text: 'Tu Marca',       subtext: 'Tu tagline aquí',          durationInSeconds: 5 },
    { text: 'Tu Producto',    subtext: 'Lo mejor para tu negocio', durationInSeconds: 5 },
    { text: '¡Contáctanos!',  subtext: 'Visítanos hoy',            durationInSeconds: 5 },
  ],
  brandColor: '#7C3AED',
}

function Root() {
  return (
    <Composition
      id="BrandVideo"
      component={VideoComp}
      durationInFrames={450}
      fps={30}
      width={1280}
      height={720}
      defaultProps={DEFAULT_PROPS as unknown as AnyProps}
    />
  )
}

registerRoot(Root)
