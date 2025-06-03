import { numberFormat } from 'helpers/format'
import React from 'react'

export default function ShowPrice({ sidebarPrice, cartTotal }) {
    const currency = 'ت';
    return (
        <div className="w-full">
            <div className="flex text-sm">
                <p>مجموع: </p>
                <p className="mr-2">{numberFormat(cartTotal)} {currency}</p>
            </div>
            {
                sidebarPrice['discount'] ?
                    <div className="flex text-sm">
                        <p>تخفیف: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['discount'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['tax'] ?
                    <div className="flex text-sm">
                        <p>VAT: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['tax'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['service'] ?
                    <div className="flex text-sm">
                        <p>سرویس: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['service'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['tip'] ?
                    <div className="flex text-sm">
                        <p>tip: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['tip'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['shipping_price'] ?
                    <div className="flex text-sm">
                        <p>ارسال: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['shipping_price'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['packaging'] ?
                    <div className="flex text-sm">
                        <p>بسته بندی: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['packaging'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['credit_discount'] ?
                    <div className="flex text-sm">
                        <p>استفاده از اعتبار: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['credit_discount'])} {currency}</p>
                    </div> : ''
            }
            {
                sidebarPrice['total'] || sidebarPrice['total'] === 0 ?
                    <div className="flex text-sm">
                        <p>مبلغ نهایی: </p>
                        <p className="mr-2">{numberFormat(sidebarPrice['total'], true)} {currency}</p>
                    </div> : ''
            }
        </div>
    )
}
