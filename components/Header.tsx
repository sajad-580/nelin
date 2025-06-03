import { Badge, Flex } from 'antd'
import React, { useEffect } from 'react'
import Logo from './shared/Logo'
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useProductContext } from './Products';
import { useCartContext } from './CartProvider';

export default function HeaderComponent() {
    const router = useRouter();
    const { setOpenSidebar, cartCount } = useCartContext();
    const { selectedTable } = useProductContext();
    return (
        <div className="container-fluid border-bottom ">
            <Flex gap="small" align='center'>
                <Flex gap="middle" align='center' className=' flex-1'>
                    <Logo w={process.env.NEXT_PUBLIC_LOGO_W} h={37.5} />
                    <div>
                        <button
                            style={{ fontSize: "0.8rem" }}
                            onClick={() => router.push("/tables")}
                            className={'btn bg-gray shadow-md'}
                        >
                            <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" version="1.1" className="h-6 w-6" x={0} y={0} viewBox="0 0 64 64">
                                <g>
                                    <path xmlns="http://www.w3.org/2000/svg" d="M53.346,6.18A170.349,170.349,0,0,0,32,5,170.349,170.349,0,0,0,10.654,6.18C2.147,7.315,1,8.748,1,10v4c0,1.252,1.147,2.685,9.654,3.82,2.842.378,6.149.672,9.746.872l2.519,6.3L9.079,57.609A1,1,0,0,0,10,59h6a1,1,0,0,0,.931-.633L28,30.27V58a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V30.268l11.069,28.1A1,1,0,0,0,48,59h6a1,1,0,0,0,.921-1.391l-13.84-32.62,2.52-6.3c3.6-.2,6.9-.494,9.745-.872C61.853,16.685,63,15.252,63,14V10C63,8.748,61.853,7.315,53.346,6.18ZM32,7c16.356,0,27.008,1.708,28.837,3C59.008,11.292,48.356,13,32,13S4.992,11.292,3.163,10C4.992,8.708,15.644,7,32,7ZM15.319,57H11.511l13.41-31.609a1.013,1.013,0,0,0,.008-.763L22.6,18.8c1.508.066,3.058.114,4.64.148l.739,5.926Zm18.8-33H29.882l-.627-5.017Q30.617,19,32,19t2.744-.018ZM30,57V26h4V57Zm9.072-32.372a1.013,1.013,0,0,0,.008.763L52.489,57H48.681L36.024,24.87l.74-5.924c1.582-.034,3.132-.082,4.64-.148ZM32,17C15.054,17,4.232,15.166,3,13.862V12.114a31.329,31.329,0,0,0,7.654,1.706A170.349,170.349,0,0,0,32,15a170.349,170.349,0,0,0,21.346-1.18A31.329,31.329,0,0,0,61,12.114v1.748C59.768,15.166,48.946,17,32,17Z" fill="#000000" data-original="#000000" />
                                </g>
                            </svg>

                        </button>
                        {selectedTable['name'] ?
                            <span className='text-gray me-2'>
                                {selectedTable['name']}
                            </span> : ''
                        }

                    </div>
                </Flex>
                <div className='flex-1 d-none d-md-block d-lg-block'></div>
                <div className=' header-box rounded px-3'>
                    <Flex gap="small" align='center' justify='end'>
                        <div onClick={() => {
                            setOpenSidebar(true)
                        }}>
                            <Badge count={cartCount} showZero >
                                <img src="/images/paperbag.png" alt="printer" style={{ width: 30, height: 30 }} className="m-auto" />
                            </Badge>
                        </div>
                        <Link className="text-dark" href="/printers">
                            <Flex gap="small">
                                <div className="d-none d-md-block d-lg-block">
                                    <span className="ml-2">تنظیمات</span>
                                </div>
                                <div className="items-center flex-none" title="Printers ↗︎">
                                    <img src="/images/printer.png" alt="printer" className="m-auto" style={{ width: 30, height: 30 }} />
                                </div>
                            </Flex>
                        </Link>
                        <div className=" pointer" onClick={() => {
                            setOpenSidebar(true)
                        }}>

                            <span className="toggle-bar"></span>
                        </div>
                    </Flex>
                </div>
            </Flex>
        </div>
    )
}
