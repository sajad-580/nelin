import { CloseOutlined } from "@ant-design/icons";
import { Badge, Button, Collapse, Drawer, Form, Input, Select, Space, Tag } from "antd";
import { numberFormat } from "helpers/format";
import { sendPrint, submitOrder } from "helpers/helper";
import { useRouter } from "next/router";
import randomHex from "randomhex";
import { useEffect, useState } from "react";
import { checkCartCount, findOrder, saveUserAddress } from "services/order";
import { findIndexSelect, generateTableArr, getBranchId, getNewDate, request, sendAlert } from "util/util";
import AntdSelect from "./AntdSelect";
import { useCartContext } from "./CartProvider";
import CheckboxButton from "./CheckboxButton";
import Customer from "./Customer";
import { NumberFormat } from "./NumberFormat";
import { useProductContext } from "./Products";
import ShowPrice from "./ShowPrice";
import ImageComponent from "./shared/image-component";
import AcceptPointModal from "./AcceptPointModal";

const { Item, useForm } = Form;
function Sidebar() {
    const router = useRouter();
    const [form] = useForm();
    const { openSidebar, setOpenSidebar, cart, changeCart, removeItem, cartTotal, calculateOrderPrices
        , sidebarPrice, emptyCart, updateData, cartCount, setDiscountValue, setUseDiscountCode, useDiscountCode, discountValue } = useCartContext();
    const { userData, interval, tables, discountList, selectedTable, setSelectedTable, userAccess, token, socket } = useProductContext();
    const [showOptions, setShowOptions] = useState(false);
    const [defaultData, setDefaultData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tableOption, setTableOption] = useState([]);
    const [showModal, setShowModal] = useState(false)
    const [useCredit, setUseCredit] = useState(false)
    const [formData, setFormData] = useState({})
    const [customer, setCustomer] = useState({});
    const [discountCode, setDiscountCode] = useState(null);


    const onClose = () => {
        setOpenSidebar(false);
    };
    const checkTable = async (values) => {
        try {
            if (values['table_id']) {
                let order = await findOrder({ status: 6, table_id: values['table_id'], }, 1);
                if (order["order"]) {
                    if (values['offline_id'] && values.offline_id != order["order"]['offline_id']) {
                        sendAlert(false, "میز وارد شده پر میباشد")
                        setLoading(false);
                        return false
                    } else {
                        return true;
                    }
                } else return true;
            } else {
                return true;
            }
        } catch (error) {

        }

    }
    const checkPayment = (values) => {
        if (values['payment_card'] || values['payment_pos'] || values['payment_cash']) {
            let sum =
                (values['payment_card'] ? values['payment_card'] : 0) +
                (values['payment_pos'] ? values['payment_pos'] : 0) +
                (values['payment_cash'] ? values['payment_cash'] : 0);
            if (sum != sidebarPrice['total']) {
                sendAlert(false, "مبلغ های پرداختی وارد شده با مبلغ کل برابر نمیباشند")
                setLoading(false);
                return false;
            }
        }
        return true;
    }

    const handleSubmit = async (values) => {
        try {
            if (values['customer']) {
                if ((values['customer']['type'] && values['customer']['type'] != 3) || values['customer']['name'] || values['customer']['username']) {
                    if ((!values['customer']['type'] || !values['customer']['name'] || !values['customer']['username']))
                        return sendAlert(false, 'در ثبت مشتری نام و شماره تماس و جنسیت اجباری میباشد.');
                }
            }
            if (updateData) {
                values = { ...updateData, ...values };
            }
            if (values['item_note']) {
                for (const key in cart) {
                    if (values['item_note'][key])
                        cart[key]['note'] = values['item_note'][key];
                }
            }
            values['cart'] = cart;
            values['priceDetails'] = sidebarPrice;
            values['total'] = sidebarPrice['total'];
            values['price'] = sidebarPrice['price'];
            values['status'] = updateData['_id'] ? (updateData['status'] == -1 ? -1 : (updateData['status'] == 7 ? 7 : 2)) : (values['branch_type'] == 3 ? 6 : 1);

            values['branch_type_name'] = userData['branch_type'] ? findIndexSelect(userData['branch_type'], values['branch_type'], 'value')['label'] : '';
            if (selectedTable['name']) values['table_name'] = selectedTable['name'];
            setLoading(true)
            values['offline_id'] = updateData['offline_id'] ?? randomHex(8);

            if (!await checkTable(values)) return;
            if (!checkPayment(values)) return;
            if (sidebarPrice['total'] <= 0 && !values['credit_discount']) {
                setLoading(false);
                return sendAlert(false, "مبلغ کل سفارش نمیتواند صفر باشد.");
            }
            if (updateData['_id']) {
                values['updateDate'] = getNewDate();
                setLoading(false);
                let checkAndLog = await checkCartCount(values, userData);
                values['printerCart'] = checkAndLog[0];
                if (values['log'])
                    values['log'].push(checkAndLog[1]);
                else values['log'] = [checkAndLog[1]];
            } else {
                values['date'] = getNewDate();
                values['sale_by'] = userData['user_name_and_fam'];
                values['sale_id'] = userData['user_id'];
                values['first_price'] = values['total'];
            }
            if (updateData['status'] == -1) {
                values['print_type'] = 3;
            }
            values['discount_code'] = useDiscountCode;
            values['details'] = { ...values };

            console.log(values, ' ---------------------------');
            
            let res = await submitOrder(values);
            if (res) {
                res['details']['_id'] = res['_id'];
                res['details']['status'] = res['status'];
                if (updateData['_id'])
                    res['details']['cart'] = res['details']['printerCart'];
                setTimeout(() => {
                    resetDiscountCode();
                    form.resetFields();
                    emptyCart()
                    setSelectedTable({})
                    setDefaultValues()
                    sendPrint({
                        order: res['details'],
                        isUpdate: updateData['_id'] ? true : false
                    });
                    router.push("/tables");
                    setLoading(false);
                    setUseCredit(false)
                    setFormData({})
                    setCustomer({})
                    if ((values['customer'])) {
                        if ((values['delivery'] && values['customer']['address']) || values['credit_discount'] || values['customer']['type'])
                            saveUserAddress(values['customer'], token, values['credit_discount']);
                    }
                    if (socket) {
                        socket.emit('sendTable', [2, 3, 4]);
                    }
                }, 500);
                return;
            }
            setLoading(false);
        } catch (error) {
            console.log(error)
        }
    };
    const setDefaultValues = () => {

        form.setFieldsValue({
            print_type: userData['default_print_type'] > 0 ? userData['default_print_type'] : 4,
            branch_type: userData['default_branch_type'] > 0 ? userData['default_branch_type'] : 1,
        });
        setDefaultData(true)
        interval();
    }
    useEffect(() => {
        if (userData['username'] && !defaultData) {
            setDefaultValues();
        }
    }, [userData])
    useEffect(() => {
        if (tables?.length) {
            let arr = generateTableArr(tables);
            setTableOption(arr)



            console.log(tables);
            
        }
    }, [tables])
    useEffect(() => {
        calculateOrderPrices(form.getFieldsValue())
    }, [cartTotal])
    const onValuesChange = (v, values) => {
        calculateOrderPrices(values)
    }
    useEffect(() => {
        console.log(selectedTable)
        if (selectedTable['id'])
            form.setFieldValue('table_id', selectedTable['id']);
    }, [openSidebar])
    useEffect(() => {
        if (updateData['_id']) {
            form.setFieldsValue(updateData);
            if (userData['default_print_type'])
                form.setFieldsValue({
                    print_type: userData['default_print_type'],
                });
            calculateOrderPrices(updateData)
            interval();
        }
    }, [updateData])

    useEffect(() => {
        if (cartCount <= 0) {
            form.resetFields();
            emptyCart()
            setSelectedTable({})
            setDefaultValues()
            if (!userData['username']) {
                setDefaultData(false)
            }
        }
    }, [cartCount]);
    const checkAccess = (item, minus = false) => {
        let downEdit = true;
        if (updateData['_id']) {
            downEdit = (updateData['status'] == -1 ? userAccess['down_edit_online'] : userAccess['down_edit']);
            if ([4, 5].includes(updateData['status']))
                downEdit = (userAccess["down_edit_print"] ? true : false);

            if ([0, 1, 2, 3].includes(updateData['status']))
                downEdit = userAccess["down_edit"] ? true : false
        }
        if (minus && item['old'] && item['qty'] > item['old'])
            return true;
        return !item['old'] ? true : downEdit;
    }
    const resetDiscountCode = () => {
        setDiscountCode(null);
        setUseDiscountCode(null);
        setDiscountValue(0);
        interval();
    };
    const handleDiscount = async () => {
        try {

            let user_id = customer?.['username'];
            if (!user_id) {
                sendAlert(false, "کاربر را وارد کنید.");
                return;
            }
            if (!discountCode) {
                sendAlert(false, "کد تخفیف را وارد کنید.");
                return;
            }
            let formData = form.getFieldsValue();
            let data = {
                user_id: user_id,
                code: discountCode,
                cart: {
                    product: cart,
                    transport: 0,
                    address: formData?.['customer']?.['address'] ? formData['customer']['address'] : '',
                    total: cartTotal,
                    delivery: formData['shipping_price'] ? formData['shipping_price'] : 0,
                    final: sidebarPrice['total'],
                    packaging: sidebarPrice['packaging'],
                    discount: sidebarPrice['discount'],
                    discount_id: null,
                    tax: sidebarPrice['tax']
                },
                branch_id: getBranchId(token),
            };
            let res = await request(`/check-discount`, "POST", data, true);
            // if (res["message"]) sendAlert(res["success"], res["message"]);
            if (res["success"] && res["data"]) {
                setDiscountValue(res["data"]["discount"]);
                setUseDiscountCode(res["data"]["code"]);

            } else {
                resetDiscountCode();

            }
        } catch (error) {
            console.log("error", error);
        }
    };
    useEffect(() => {
        calculateOrderPrices(form.getFieldsValue())
    }, [discountValue])
    return (
        <>
            <Drawer
                placement={"left"}
                closable={false}
                // onClose={onClose}
                open={openSidebar}
                mask={false}
                key={"left"}
                classNames={{
                    body: "p-0",
                }}
                // width={'29%'}
                styles={{
                    body: {
                        backgroundColor: "#FFFBEB",
                    },
                }}
            >
                {
                    cart?.length
                        ?
                        <Form form={form} onFinish={handleSubmit} onValuesChange={onValuesChange}>
                            <Item hidden name={'id'} initialValue={null}>
                                <Input />
                            </Item>
                            {updateData['_id'] ?
                                <Item name={'credit_discount'} className="mb-0 w-100" hidden={true}>
                                    <NumberFormat className="w-100" placeholder="مبلغ اعتبار" />
                                </Item> : ''}
                            <div className="layout">
                                <div className="header d-flex gap-2 align-items-start  rounded-2 p-3" style={{ backgroundColor: '#FEF3C7', borderColor: '#FEF3C7' }}>
                                    <CloseOutlined className="text-danger pointer" onClick={() => setOpenSidebar(false)} style={{ fontSize: 25 }} />
                                    <Customer form={form} setCustomer={setCustomer} />
                                </div>
                                <div className="content">
                                    {cart.map((item, k) => (
                                        <Collapse
                                            className="sidebar_collapse"
                                            items={[
                                                {
                                                    key: k,
                                                    label: <div className="flex justify-around py-2 ps-2 gap-2 pe-4 text-sm border-bottom border-2 collapse-title">
                                                        <div className="flex items-center  ">
                                                            <img
                                                                src="/images/cancel.png"
                                                                alt="remove"
                                                                className={`m-auto pointer ${!checkAccess(item) ? 'disabled' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!checkAccess(item)) return true;
                                                                    removeItem(item.uniq_id)
                                                                }}
                                                                style={{ width: 20, height: 20 }}
                                                            />
                                                        </div>
                                                        <div className="w-full align-middle cursor-pointer">
                                                            <div className="py-2">{item["name"]}</div>
                                                            {item["options"] && item["options"]?.length ? (
                                                                <div className="my-1">
                                                                    {item["options"].map((op) => (
                                                                        <Tag>{op["name"]}</Tag>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-center ">
                                                            <span>
                                                                <img
                                                                    src="/images/minus.png"
                                                                    alt="minus"
                                                                    className={`m-auto pointer ${!checkAccess(item, true) ? 'disabled' : ''}`}

                                                                    style={{ width: 20, height: 20 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!checkAccess(item, true)) return true;
                                                                        if (cart[k]["qty"] <= 1)
                                                                            return removeItem(item['uniq_id']);
                                                                        cart[k]["qty"] -= 1;
                                                                        changeCart(cart);
                                                                    }}
                                                                />
                                                            </span>
                                                            <span className="px-2 pb-1 text-green-00">
                                                                {item["qty"]}
                                                            </span>
                                                            <span className="cursor-pointer">
                                                                <img
                                                                    src="/images/plus.png"
                                                                    alt="minus"
                                                                    className="m-auto pointer"
                                                                    style={{ width: 20, height: 20 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        cart[k]["qty"] += 1;
                                                                        changeCart(cart);
                                                                    }}
                                                                />
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-center w-1/6">
                                                            {item["price"] / 1000}
                                                        </div>
                                                        <div className="flex items-center justify-center w-1/6">
                                                            {numberFormat(item["total"] / 1000)}
                                                        </div>
                                                    </div>,
                                                    children: <Item name={['item_note', k]} initialValue={item['note']}>
                                                        <Input.TextArea placeholder="توضیحات" />
                                                    </Item>,
                                                    style: {
                                                        marginBottom: 0,
                                                        borderRadius: 0,
                                                        border: 'none',
                                                    }
                                                }
                                            ]} />
                                    ))
                                    }
                                </div>

                                <div className="footer">
                                    <div className="flex flex-col p-4 bg-red-100 rounded-4" style={{ backgroundColor: '#FEE2E2' }}>
                                        <div className="w-100 d-flex">
                                            <Button
                                                htmlType="button"
                                                className="w-100"
                                                onClick={() => setShowOptions(e => !e)}

                                            >
                                                {showOptions ? 'بستن جزئیات' : 'نمایش جزئیات'}

                                            </Button>
                                        </div>
                                        <div className="flex flex-col" style={!showOptions ? { display: 'none' } : {}}>

                                            <div className="flex gap-2 my-1">
                                                {/* <Item name={'use_point'} className="mb-0 w-100" valuePropName="checked" initialValue={false}>
                                                    <CheckboxButton name="استفاده از امتیاز" />
                                                </Item> */}
                                                <Item name={'use_discount'} className="mb-0 w-100" >
                                                    <Select className="w-100" allowClear placeholder="انتخاب تخفیف" options={discountList} />
                                                </Item>
                                            </div>
                                            {
                                                customer && customer['credit_balance'] > 0 && !updateData['credit_discount'] ?
                                                    <>
                                                        <div className="flex gap-2 my-1">
                                                            <CheckboxButton name="استفاده از اعتبار" onChange={(e) => {
                                                                if (useCredit) return setUseCredit(false)
                                                                setShowModal(true)
                                                                setFormData(form.getFieldValue('customer'))
                                                            }} checked={useCredit} />
                                                            {
                                                                useCredit ? <Item name={'credit_discount'} className="mb-0 w-100" initialValue={null}>
                                                                    <NumberFormat className="w-100" placeholder="مبلغ اعتبار" max={customer['credit_balance'] > sidebarPrice['final_price'] ? sidebarPrice['final_price'] : customer['credit_balance']} />
                                                                </Item> : ''
                                                            }

                                                        </div>
                                                        <span>اعتبار کاربر: {numberFormat(customer['credit_balance'])} ت</span>
                                                    </>
                                                    : ''
                                            }
                                            <div className="flex items-center justify-between my-1 gap-2">
                                                <ShowPrice cartTotal={cartTotal} sidebarPrice={sidebarPrice} />
                                                <Item className="w-100 mb-0">
                                                    <Button
                                                        className="btn btn-accent w-full btn-sm text-sm"
                                                        htmlType="button"
                                                        loading={loading}
                                                        onClick={() => form.submit()}
                                                    >
                                                        ثبت
                                                    </Button>
                                                </Item>
                                            </div>
                                            <Item name={'customer_note'} className="my-1">
                                                <Input placeholder="یادداشت صندوق دار" />
                                            </Item>
                                            <div className="flex items-center justify-between gap-2">
                                                <Item name={'print_type'} className="w-full mb-0" >
                                                    <Select placeholder="انتخاب پرینت" options={userData && userData['printer_type'] ? userData['printer_type'] : []} />
                                                </Item>
                                                <Item name={'branch_type'} className="w-full mb-0" >
                                                    <Select placeholder="انتخاب نوع سالن" options={userData && userData['branch_type'] ? userData['branch_type'] : []} />
                                                </Item>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <Item name="table_id" className="w-full mb-0" >
                                                    <AntdSelect placeholder="انتخاب میز" options={tableOption} allowClear
                                                        onChange2={(e) => {
                                                            console.log(e)
                                                            if (e)
                                                                setSelectedTable({
                                                                    id: e['value'],
                                                                    name: e['label']
                                                                })
                                                            else setSelectedTable({})
                                                        }} />
                                                </Item>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <Item name={'service'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="سرویس" className="w-100" />
                                                </Item>
                                                <Item name={'payment_cash'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="پرداخت نقدی" className="w-100" />
                                                </Item>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <Item name={'payment_pos'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="پز" className="w-100" />
                                                </Item>
                                                <Item name={'payment_card'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="کارت به کارت" className="w-100" />
                                                </Item>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <Item name={'tip'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="tip" className="w-100" />
                                                </Item>
                                                <Item name={'delivery'} className="w-full mb-0" valuePropName="checked" initialValue={false}>
                                                    <CheckboxButton name="بیرون بر" />
                                                </Item>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <Item name={'packaging'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="بسته بندی" className="w-100" />
                                                </Item>
                                                <Item name={'shipping_price'} className="w-full mb-0" >
                                                    <NumberFormat placeholder="هزینه ارسال" className="w-100" />
                                                </Item>
                                            </div>
                                            <Item name={'num_people'} className="w-full mb-0" >
                                                <Input placeholder="تعداد نفرات" className="w-100" />
                                            </Item>
                                            <Item name={'note'} className="w-full mb-0" >
                                                <Input placeholder="توضیحات" className="w-100" />
                                            </Item>
                                            <Space.Compact
                                                style={{
                                                    width: '100%',
                                                }}
                                                className="mt-1"
                                            >
                                                <Input placeholder="کد تخفیف" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                                                <Button htmlType="button" onClick={handleDiscount} type="primary">ثبت کد تخفیف</Button>
                                            </Space.Compact>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                        :
                        <>

                            <CloseOutlined className="text-danger pointer p-4" onClick={() => setOpenSidebar(false)} style={{ fontSize: 25 }} />
                            <div
                                className={`flex flex-col items-center justify-center `}
                                style={{ fontSize: '1.5rem' }}
                            >
                                <ImageComponent
                                    src="/images/empty.png"
                                    alt="empty basket"
                                    layout="fixed"
                                    width={100}
                                    height={100}
                                />
                                <p>آماده سفارش بعدی</p>
                            </div>
                        </>
                }
                <AcceptPointModal
                    show={showModal}
                    setShow={setShowModal}
                    customer={customer}
                    setUseCredit={setUseCredit} />
            </Drawer>
            {
                cartCount ?
                    <div className="fixed_button d-md-none">
                        <button onClick={() => setOpenSidebar(true)} className="btn btn-success w-100 rounded-0">سبد خرید <Badge count={cartCount} /></button>
                    </div> : ''
            }
        </>
    );
}

export default Sidebar;
