import { Button } from 'antd'
import React from 'react'

export default function CheckboxButton(props) {
    const { onChange, checked, name } = props;
    return (
        <Button className='w-100' type={checked ? 'primary' : 'default'} onClick={() => onChange(!checked)}> {name}</Button>
    )
}
