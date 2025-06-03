import React, { ImgHTMLAttributes } from 'react'


export default function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <>
            <img {...props} />
        </>
    )
}