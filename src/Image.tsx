import React from "react";

export type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>
export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export interface ImageOptions {
  anim?: boolean
  background?: string
  blur?: IntRange<1, 250>
  brightness?: number
  compression?: boolean
  contrast?: number
  dpr?: number,
  dprs?: number[],
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  format?: 'auto' | 'avif' | 'webp' | 'json'
  gamma?: number
  gravity?: string,
  height?: number
  width?: number
  widths?: number[]
  maxWidth?: number,
  metadata?: 'keep' | 'copyright' | 'none'
  quality?: IntRange<1, 100>
  rotate?: IntRange<0, 360>
  sharpen?: number
  trim?: string
}

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string,
  force?: boolean
  options?: ImageOptions
}

function getOptions(options: ImageOptions): string {
  const strings: string[] = []
  if (options.anim) strings.push(`anim=${options.anim}`)
  if (options.background) strings.push(`background=${options.background}`)
  if (options.blur) strings.push(`blur=${options.blur}`)
  if (options.brightness) strings.push(`brightness=${options.brightness}`)
  if (options.compression) strings.push(`compression=true`)
  if (options.contrast) strings.push(`contrast=${options.contrast}`)
  if (options.dpr) strings.push(`dpr=${options.dpr}`)
  strings.push(`fit=${options.fit ?? 'scale-down'}`)
  strings.push(`format=${options.format ?? 'auto'}`)
  if (options.gamma) strings.push(`gamma=${options.gamma}`)
  if (options.gravity) strings.push(`gravity=${options.gravity}`)
  if (options.width) strings.push(`width=${options.width}`)
  if (options.height) strings.push(`height=${options.height}`)
  strings.push(`metadata=${options.metadata ?? 'none'}`)
  if (options.quality) strings.push(`quality=${options.quality}`)
  if (options.rotate) strings.push(`rotate=${options.rotate}`)
  if (options.sharpen) strings.push(`sharpen=${options.sharpen}`)
  if (options.trim) strings.push(`trim=${options.trim}`)
  return strings.join(',')
}

function getSizes(widths: number[], maxWidth: number): string {
  const maxWidthString = maxWidth ? `(max-width: ${maxWidth}px) ` : ''
  const sizes: string[] = []
  widths.forEach((width) => sizes.push(`${width}px`))
  return `${maxWidthString} ${sizes.join(', ')}`
}

function getImageSrc(strippedSrc: string, options?: ImageOptions): string {
  const optionsSrc = getOptions(options ?? {})
  return `/cdn-cgi/image/${optionsSrc}/${strippedSrc}`
}

function getSrcSets(strippedSrc: string, options?: ImageOptions,): string {
  const strings: string[] = []
  const dprs = options?.dprs ?? [1]
  dprs.forEach((dpr) => {
    options?.widths?.forEach((width) => {
      const imageSrc = getImageSrc(strippedSrc, {...options, dpr, width})
      strings.push(`${imageSrc} ${width * dpr}w`)
    })
  })
  return strings.join(', ')
}

export const Image: React.FC<ImageProps> = ({force, options, ...props}) => {
  const useCloudflare = process.env.NODE_ENV === 'production' || force === true
  if (!useCloudflare) {
    return <img {...props}/>
  }
  const strippedSrc = props.src.replace(/^\/|\/$/g, '')
  const src = getImageSrc(strippedSrc, options)
  const sizes = options?.widths ? getSizes(options.widths, options.maxWidth ?? (options.width ? Math.max(options.width, ...options.widths) : Math.max(...options.widths))) : ''
  const srcSet = getSrcSets(strippedSrc, options)
  return <img {...props} src={src} sizes={sizes} srcSet={options?.widths ? srcSet : props.srcSet}/>
}

