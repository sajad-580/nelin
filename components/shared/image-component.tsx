import Image from 'next/image'
import React from 'react'

const ImageComponent = ({ src, layout = 'fixed', width, height, alt }) => {
  // return <Image src={src} layout="fixed" width={width} height={height} alt={alt} />
  return <img src={src} alt={alt} style={{ width: `${width}px`, height: `${height}px` }} className='m-auto' />
}

export default ImageComponent
