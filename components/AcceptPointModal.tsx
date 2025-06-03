import { Button, Input, Modal } from 'antd'
import React, { useState } from 'react'
import { request2, sendAlert } from 'services/table'
import { useProductContext } from './Products'

export default function AcceptPointModal({ show, setShow, customer, setUseCredit }) {
    const [code, setCode] = useState('')
    const { token, interval } = useProductContext();
    const close = () => {
        setShow(false)
        setCode('');
    }
    const handleSms = async () => {
        try {
            if (!customer['username']) return sendAlert(false, 'ابتدا کاربر را انتخاب کنید')
            let res = await request2(`/credit-sms?user=${customer['username']}`, 'get');
            // if (res['message']) sendAlert(res['success'], res['message']);
        } catch (error) {

        }
    }
    const handleAccept = async () => {
        try {
            let _token = token;
            if (token) {
                _token = token.split('%')[1];
            }
            if (!code) return sendAlert(false, 'کد تایید را وارد کنید')
            let res = await request2(`/accept-credit?user=${customer['username']}&code=${code}&token=${_token}`, 'get');
            // if (res['message']) sendAlert(res['success'], res['message']);
            if (res['success']) {
                setUseCredit(true);
                interval()
                close();
            }
        } catch (error) {

        }
    }
    return (
        <Modal title={'تایید امتیاز'} open={show} onCancel={close} footer={''} >
            <Input placeholder='کد تایید' className='mt-3' onChange={(e) =>
                setCode(e.target.value)} value={code} />
            <div className='flex gap-2 mt-3'>
                <Button type='default' className='w-full' onClick={handleSms}>ارسال اس ام اس</Button>
                <Button type='primary' className='w-full' onClick={handleAccept}>تایید</Button>
            </div>

        </Modal>
    )
}
