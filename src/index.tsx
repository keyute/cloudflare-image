import type { ImgHTMLAttributes } from 'react'

export interface ImageOptions {
  anim?: boolean
  background?: string
  blur?: number
  brightness?: number
  compression?: boolean
  contrast?: number
  dpr?: number
  dprs?: number[]
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'baseline-jpeg' | 'json'
  gamma?: number
  gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'face' | 'center' | string
  metadata?: 'keep' | 'copyright' | 'none'
  quality?: number
  rotate?: number
  sharpen?: number
  trim?: string
  widths?: number[]
  maxWidth?: number
  redirectOnError?: boolean
}

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  enabled?: boolean
  options?: ImageOptions
}

function serializeOptions(options: ImageOptions, width?: number | 'auto', height?: number): string {
  const strings: string[] = []
  if (options.anim !== undefined) strings.push(`anim=${options.anim}`)
  if (options.background) strings.push(`background=${options.background}`)
  if (options.blur) strings.push(`blur=${options.blur}`)
  if (options.brightness) strings.push(`brightness=${options.brightness}`)
  if (options.compression) strings.push(`compression=fast`)
  if (options.contrast) strings.push(`contrast=${options.contrast}`)
  if (options.dpr) strings.push(`dpr=${options.dpr}`)
  strings.push(`fit=${options.fit ?? 'scale-down'}`)
  strings.push(`format=${options.format ?? 'auto'}`)
  if (options.gamma) strings.push(`gamma=${options.gamma}`)
  if (options.gravity) strings.push(`gravity=${options.gravity}`)
  if (width) strings.push(`width=${width}`)
  if (height) strings.push(`height=${height}`)
  strings.push(`metadata=${options.metadata ?? 'none'}`)
  if (options.quality) strings.push(`quality=${options.quality}`)
  if (options.rotate) strings.push(`rotate=${options.rotate}`)
  if (options.sharpen) strings.push(`sharpen=${options.sharpen}`)
  if (options.trim) strings.push(`trim=${options.trim}`)
  if (options.redirectOnError) strings.push('onerror=redirect')
  return strings.join(',')
}

export function buildImageUrl(src: string, options?: ImageOptions & { width?: number | 'auto'; height?: number }): string {
  const { width, height, ...rest } = options ?? {}
  const strippedSrc = src.replace(/^\/|\/$/g, '')
  const optionsString = serializeOptions(rest, width, height)
  return `/cdn-cgi/image/${optionsString}/${strippedSrc}`
}

function getSizes(widths: number[], maxWidth: number): string {
  const maxWidthString = maxWidth ? `(max-width: ${maxWidth}px) ` : ''
  const sizes: string[] = []
  widths.forEach((width) => sizes.push(`${width}px`))
  return `${maxWidthString} ${sizes.join(', ')}`
}

function getSrcSets(strippedSrc: string, options: ImageOptions, width?: number | 'auto', widths?: number[], dprs?: number[]): string {
  const strings: string[] = []
  const resolvedDprs = dprs ?? [1]
  resolvedDprs.forEach((dpr) => {
    widths?.forEach((w) => {
      const imageSrc = buildImageUrl(strippedSrc, { ...options, dpr, width: w })
      strings.push(`${imageSrc} ${w * dpr}w`)
    })
  })
  return strings.join(', ')
}

export const Image = ({ enabled, options, ...props }: ImageProps) => {
  const useCloudflare = enabled ?? process.env.NODE_ENV === 'production'
  if (!useCloudflare) {
    return <img {...props} />
  }
  const width = props.width as number | 'auto' | undefined
  const height = props.height as number | undefined
  const { widths, dprs, maxWidth, ...urlOptions } = options ?? {}
  const strippedSrc = props.src.replace(/^\/|\/$/g, '')
  const src = buildImageUrl(strippedSrc, { ...urlOptions, width, height })
  const sizes = widths ? getSizes(widths, maxWidth ?? (typeof width === 'number' ? Math.max(width, ...widths) : Math.max(...widths))) : props.sizes
  const srcSet = getSrcSets(strippedSrc, urlOptions, width, widths, dprs)
  return <img {...props} src={src} sizes={sizes} srcSet={widths ? srcSet : props.srcSet} />
}
