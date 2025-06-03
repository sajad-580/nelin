// React & Next.js
import React, { FormEvent, useRef, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { useRouter } from 'next/router'
import ErrorComponent from 'components/shared/Error'
import { token } from 'morgan'
import { useProductContext } from 'components/Products'
import Image from 'components/shared/Image'
import { Button, Form, Input } from 'antd'
import { hidden, itemRequired, request } from 'util/util'
import { getMenu, getTables } from 'helpers/helper'
// Application
const { Item, useForm } = Form;
interface IToken {
  name: string
  token: string
}

const LoginPage = () => {
  const [form] = useForm();
  const [tokens, setTokens] = useState([])
  const router = useRouter()
  const tokenSelector = useRef(null)

  const handleSubmit = async (values) => {
    try {
      let res = await request('/auth', 'POST', values, true);
      if (res['success']) {
        let data = res['data'];
        localStorage.setItem('user_client_id', data['client_id'])
        localStorage.setItem('factor_text', data['factor_text'] ? data['factor_text'] : '')
        localStorage.setItem('username', data.username);
        let save = await request('api/branch', 'POST', {
          token: data.token[0].token,
          cronjob: data.cronjob,
          username:data.username,
          _id: 1,
          warehouse: data.warehouse ? data.warehouse : 0,
          userData: data
        });
        if (data.iterval) {
          localStorage.setItem("iterval", data.iterval);
        }
        await getTables(data.token[0].token);
        await getMenu(data.token[0].token)
        if (save['order'])
          router.push('/')
      }
    } catch (error) {

    }
  }

  return (
    <div className='container-fluid'>
      <div className='card h-screen'>
        <section className="row">
          <div className={`col-md-8 ${hidden()}`}>
            <Image src='/images/bg/bg3.jpg' className='w-100   h-screen' />
          </div>
          <div className="col-md-4">
            <div className='p-3'>
              <h3 className='mt-5'>ورود به حساب کاربری</h3>
              <Form form={form} layout='vertical' onFinish={handleSubmit}>
                <Item label="نام کاربری" name={'username'} rules={itemRequired('نام کاربری')}>
                  <Input size='large' />
                </Item>
                <Item label="کلمه عبور" name={'password'} rules={itemRequired('کلمه عبور')}>
                  <Input.Password size='large' />
                </Item>
                <Item>
                  <Button type='primary' size='large' className='w-100 mt-5' htmlType='submit'>ورود</Button>
                </Item>
              </Form>
            </div>

          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
