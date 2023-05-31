# Cloudflare Image Resize

A React component that aims to take advantage
of [Cloudflare Image Resizing](https://developers.cloudflare.com/images/image-resizing/) without an object storage.

## Features

- Drop-in replacement for `<img />` tags
- Easily create responsive images with width and DPR breakpoints
- Control how images are resized
  with [options](https://developers.cloudflare.com/images/image-resizing/url-format/#options)
- Automatically disabled during development unless forced

## Install

```bash
npm i cloudflare-image-resize
```

## Usage

```typescript jsx
import {Image} from '@keyute/cloudflare-image-resize'

const oldImage = <img src={'/image.png'}/>

// Replace the tag to enjoy resizing benefits from Cloudflare
const image = <Image src={'/image.png'}/>

// Force cloudflare url during development
const forcedImage = <Image src={'/image.png'} force={true}/>

// Resize the image to 300px wide
const resizedImage = <Image src={'/image.png'} options={{width: 300}}/>

// Responsive image with width breakpoints: 150px, 300px, 500px (largest: max width)
const responsiveImage = <Image src={'/image.png'} options={{width: 300, widths: [150, 500]}}/>

// ... Optionally, specify a max width instead
const responsiveMaxWidthImage = <Image src={'/image.png'} options={{width: 300, widths: [150, 500], maxWidth: 400}}/>

// Responsive image for high-density displays
const responsiveDprImage = <Image src={'/image.png'} options={{width: 300, widths: [150, 500], dprs: [1, 2]}}/>
```

## Configuration

The component does no validation beyond typing. Please refer to
the [docs](https://developers.cloudflare.com/images/image-resizing/url-format/#options) to ensure what you're passing
into the options is valid.

