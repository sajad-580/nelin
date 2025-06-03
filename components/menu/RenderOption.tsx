import { Button, Dropdown, MenuProps } from "antd";
import color from "color";
import { useCartContext } from "components/CartProvider";
import { useProductContext } from "components/Products";
import { useState } from "react";


const RenderOption = ({ data, item }) => {
    const { addToCart } = useCartContext();

    const [selectedKeys, setSelectedKeys] = useState([])
    const [open, setOpen] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const { interval } = useProductContext();
    if (!data?.length) return '';
    const handleClick = () => {
        if (selectedRows?.length) {
            addToCart(item, selectedRows)
            setOpen(false)
            setSelectedKeys([])
            interval()
        }
    }
    const handleSelect = (e) => {
        if (e['key'] == '100') return true;
        setSelectedKeys(e['selectedKeys'])
        let arr = [];
        for (const key in data) {
            if (e['selectedKeys'].includes(key.toString())) {
                arr.push(data[key])
            }
        }
        setSelectedRows(arr)
        interval()
    }
    const items: MenuProps['items'] = data.map((item, key) => {
        return {
            key: key,
            label: <div className="d-flex gap-5 justify-between" >
                <span>{item['name']}</span>
                <div className="badge font-09" style={color['priceCss']}>{item['price']}</div>
            </div>
        };
    });
    items.push({
        type: 'divider'
    })
    items.push({
        key: 100,
        label: <Button onClick={handleClick} className="w-100 hover-bg-yellow" style={color['optionBtnCss']}>ثبت در سفارش</Button>
    })
    return <div onClick={(e) => {
        e.stopPropagation();
        console.log('child');
    }}>
        <Dropdown
            menu={{
                items,
                selectable: true,
                multiple: true,
                selectedKeys: selectedKeys,
                onSelect: (e) => {
                    handleSelect(e)
                },
                onDeselect: (e) => {
                    handleSelect(e)
                }
            }}
            open={open}
            onOpenChange={(e) => {
                if (!e) {
                    setSelectedKeys([])
                    interval()
                }
                setOpen(e)
            }}
            trigger={['click']}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 hover-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </Dropdown>
    </div>
}
export default RenderOption;
