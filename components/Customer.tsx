import { Button, Form, Input, InputNumber, Popover, Radio, Space } from 'antd';
import React, { useEffect, useState } from 'react'
import { getCustomer } from 'services/order';
import { useCartContext } from './CartProvider';
import { useProductContext } from './Products';
import { sendAlert } from 'util/util';
import { NumberFormat } from './NumberFormat';
import { request2 } from 'services/table';
const { Item } = Form;
export default function Customer({ form, setCustomer }) {
    const [open, setOpen] = useState(false);
    const { token } = useProductContext();
    const [data, setData] = useState([]);
    const [bg, setBg] = useState([]);
    const [cardNumber, setCardNumber] = useState(null);

    const getCustomerData = async (e, research = false) => {
        try {
            let value = '';
            if (research) {
                let c = form.getFieldValue('customer');
                value = c ? c['username'] : '';
            } else {
                value = e.target.value;
            }
            const inputValue = value.trim().toLowerCase();
            if (inputValue.length != 11) return;
            let res = await getCustomer(token, inputValue);
            let _data = [];
            for (let item of res) {
                item['bg'] = item['point_balance'] &&
                    parseInt(item['point_balance']) > 10 ? 'bg-green' : '';
                _data.push(item);
            }
            setData(_data);
        } catch (error) {
            console.log(error)
        }
    };
    useEffect(() => {
        if (data?.length) setOpen(true)
    }, [data])
    const handleClick = (item) => {
        let customer = {
            username: item['username'],
            name: item['name'],
            address: item['address'],
            credit_balance: item['credit_balance'],
            type: item['type']
        };
        setCustomer(customer)
        form.setFieldsValue({
            customer: customer
        });
        setOpen(false)

    }
    const handleCardNumber = async () => {
        try {
            if (!cardNumber) return sendAlert(false, 'شماره کارت را وارد کنید')
            let res = await request2(`/find-card?num=${cardNumber}`, 'GET');
            if (res['success']) {
                let item = res['data'];
                let customer = {
                    username: item['username'],
                    name: item['name'],
                    address: item['address'],
                    credit_balance: item['credit_balance']
                };
                setCustomer(customer)
                form.setFieldsValue({
                    customer: customer
                });
                setCardNumber(null);
            }
        } catch (error) {

        }

    }
    return (
        <div className='flex-1'>
            <div className="mb-1">
                <Space.Compact
                    style={{
                        width: '100%',
                    }}
                >
                    <InputNumber className='w-100' placeholder='جستجو کاربر با شماره کارت اعتباری' onChange={(e) => setCardNumber(e)} value={cardNumber} />
                    <Button type="primary" onClick={handleCardNumber}>استعلام</Button>
                </Space.Compact>
            </div>
            <div className="row w-100">
                <div className="col-9 ps-0">
                    <Popover
                        title={
                            <>
                                {data?.length ? data.map(item => (
                                    <Button size='large'
                                        onClick={() => handleClick(item)} className={`w-100 ${item['bg']}`}>
                                        {item.name}
                                        <span style={{ fontSize: ".650rem" }}>
                                            {item.discount_percent}% -{" "}
                                            {item.point_balance} امتیاز
                                        </span>
                                    </Button>
                                )) : ""}
                            </>
                        }
                        trigger="click"
                        open={open}
                    >
                        <Item name={['customer', 'username']} className='mb-1' initialValue={''}>
                            <Input placeholder='شماره تماس' onChange={getCustomerData} />
                        </Item>
                    </Popover>
                </div>
                <div className="col-3">
                    <Button onClick={() => getCustomerData(null, true)}>استعلام</Button>
                </div>
            </div>


            <Item name={['customer', 'type']} className='mb-1' initialValue={''}>
                <Radio.Group>
                    <Radio value={'1'}>آقا</Radio>
                    <Radio value={'2'}>خانم</Radio>
                    <Radio value={'3'}>عدم تمایل</Radio>
                </Radio.Group>
            </Item>
            <Item name={['customer', 'name']} className='mb-1' initialValue={''}>
                <Input placeholder='نام و نام خانوادگی' />
            </Item>
            <Item name={['customer', 'address']} className='mb-1' initialValue={''}>
                <Input placeholder='آدرس' />
            </Item>
        </div>
    )
}
