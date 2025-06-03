import { CheckOutlined, DollarCircleFilled, DollarOutlined, RetweetOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tooltip } from 'antd';
import { numberFormat } from 'helpers/format';
import { useRouter } from 'next/router';
import { getBranchId, getTime, sendAlert } from 'util/util';
import { useCartContext } from './CartProvider';
import { useProductContext } from './Products';
import { DownIcon, PenIcon } from './shared/SvgIcon';
import { findOrder, removeOrder, saveOrderOffline } from 'services/order';
import { request, request2 } from 'services/table';
import { request as req } from "util/util";
import apiUrl from 'apiUrl';
import { mergeTable, submitOrder } from 'helpers/helper';

export default function Table({ data, tableFullSelected, setTableFullSelected, tableEmptySelected, setTableEmptySelected, tbl1,
    setTbl1,
    tbl2,
    setTbl2, setShowDetails, setDetails, setStatus, updateTables }) {
    const { activeKey, setSelectedTable, userAccess, userData, interval, socket, token } = useProductContext();
    const { emptyCart, updateOrder, printOrder } = useCartContext();
    const router = useRouter();
    const generateClass = (item) => {
        return `${tableEmptySelected &&
            tableEmptySelected['offline_id'] == item['offline_id']
            ? "border-2 border-blue"
            : tableFullSelected && tableFullSelected['offline_id'] == item['offline_id']
                ? "border-2 border-blue"
                : ""
            } ${[4, 5, 6, 20].includes(item['status'])
                ? "bg-green"
                : (item.delivery ? 'bg-indigo2' : (!item['offline_id']
                    ? "bg-neutral"
                    : (item['status'] == -1
                        ? "bg-yellow"
                        : ((item.flag == 1) ? 'bg-indigo' : "bg-red"))))
            } ${[7].includes(item['status'])
                ? "bg-green"
                : ''
            }`
    }
    const handleDoubleClick = (item) => {
        if (item['offline_id'] && activeKey != '-3') {
            if (tableFullSelected != "")
                return;
            setTableFullSelected(
                tableFullSelected
                    ? ""
                    : {
                        offline_id: item['offline_id'],
                        table_id: activeKey == "-2" ? "" : item['table_id'],
                        table_name: activeKey == "-2" ? "" : item['name'],
                    }
            );
        }
    }
    const handleClick = (item) => {
        if (!item['offline_id'] && activeKey != '-3') {
            if (tableFullSelected) {
                if (tableEmptySelected['table_id'] && tableEmptySelected != item['table_id'])
                    return;
                setTableEmptySelected(tableEmptySelected ? {} : {
                    table_id: item['id'],
                    table_name: item['name'],
                    offline_id: item['offline_id'],
                });
            } else {
                emptyCart();
                setSelectedTable({
                    id: item['id'],
                    name: item['name'],
                })
                router.push("/");
            }
        }
    }
    const handleCheck = (e, item) => {
        let check = e.currentTarget.checked;
        let id = item['offline_id'];
        if (check) {
            if (!tbl1) setTbl1(id);
            else setTbl2(id);
        } else {
            if (tbl1 == id) setTbl1("");
            if (tbl2 == id) setTbl2("");
        }
    }

    const showDetails = (item) => {
        setShowDetails(true)
        setDetails(item)
    }
    const handlePay = async (order) => {
        try {
            let branch_id = getBranchId(token);
            order['branch_id'] = branch_id;
            let res = await request2(`${apiUrl[1]}/pay-order`, 'POST', order);
            console.log(res)
        } catch (error) {

        }
    }
    const handleDropdownItems = (item) => {
        let items = [];
        if (activeKey != '-3' && item['status'] != -1) {
            if (item['status'] != 5 && !item['no_update'] && !item['discount_code']) {
                if ([4, 5, 6, 20].includes(item['status'])) {
                    if ((userAccess['down_edit_print']))
                        items.push({ key: 1, label: <span onClick={() => updateOrder(item['offline_id'])}>ویرایش</span> });
                } else
                    items.push({ key: 1, label: <span onClick={() => updateOrder(item['offline_id'])}>ویرایش</span> });
            }

            if (item['status'] != 5 && userAccess['checkout'] && item['pay_status'] != 1 && !item['discount_code'])
                items.push({
                    key: 2, label: <span onClick={() => {
                        // setStatus(item['offline_id'], 7)
                        updateOrder(item['offline_id'], 7)
                    }}>تسویه</span>
                });
            if (item['status'] == 5)
                items.push({ key: 3, label: <span onClick={() => setStatus(item['offline_id'], 6, item['flag'] == 1 ? 1 : 0)}>ترک میز</span> });
            if (userData['client_type'] == 1)
                items.push({ key: 4, label: <span onClick={() => printOrder(item['offline_id'], true, 1, null, data['p_bill'])}>چاپ مجدد</span> });

            if (userData['status'] != -1) {
                items.push({ key: 5, label: <span onClick={() => printOrder(item['offline_id'], false, 1, 'p1', data['p_bill'], true)}> صورت حساب از صندوق</span> });
                items.push({ key: 6, label: <span onClick={() => printOrder(item['offline_id'], false, 1, 'p0', data['p_bill'])}> صورت حساب با تبلت</span> });
            }
            if (![5, 6, 20].includes(item['status']))
                items.push({ key: 7, label: <span onClick={() => handleSms(item['offline_id'])}>سفارش آماده شد</span> });
            if (item['pay_status'] != 1)
                items.push({ key: 11, label: <span onClick={() => handlePay(item)}>پرداخت آنلاین</span> });

            if (item['status'] != 5 && userAccess['checkout'])
                items.push({
                    key: 8, label: <span className={item['status'] != 7 && item['pay_status'] != 1 && userData['leaving_table'] ? 'disabled' : ''} onClick={() => setStatus(item['offline_id'], 6, item['flag'] ? 1 : 0)
                    }>
                        {
                            [1, 2].includes(item['type'])
                                ? item.type == 1
                                    ? "پرداختی مشتری دریافت شد"
                                    : "به سمت مشتری ارسال شد"
                                : " ترک میز"
                        }
                    </span >,
                    className: 'bg-green'
                });

        } else if (activeKey != '-3' && item['status'] == -1) {
            items.push({
                key: 9, label: <span onClick={() => {
                    if (item['online_table_id']) {
                        let check = findOrder(
                            {
                                status: 6,
                                table_id: item['online_table_id'],
                            },
                            1
                        ).then((res) => {
                            if (res['order']) {
                                let text = `این سفارش در روی میز ${res['order']['details']['table_name']} ثبت شده است در صورت تایید با سفارش روی اون میز یکی میشود درصورتی که نمیخواید دوتا سفارش باهم دیگر مرج شوند اول اون سفارش رو تسویه و ترک میز بزنید بعد این سفارش رو تایید کنید.`;
                                if (confirm(text)) {
                                    printOrder(item['offline_id'], false, 2);
                                    sendToMerge(item['offline_id'], item['online_table_id']);
                                    setTimeout(() => {
                                        updateTables();
                                    }, 300)
                                }
                            } else {
                                printOrder(item['offline_id'], false, 2);
                                sendToMerge(item['offline_id'], item['online_table_id']);
                                setTimeout(() => {
                                    updateTables();
                                }, 300)
                            }

                        })

                    } else {
                        printOrder(item['offline_id'], false, 2)
                        setStatus(item['offline_id'], 1, item['flag'] ? 1 : 0)
                    }
                    if (socket) {
                        socket.emit('sendTable', [2, 3, 4]);
                    }
                }}> تایید سفارش</span>
            });
            items.push({
                key: 10, label: <span onClick={() => {
                    handleRemoveOrder(item['offline_id'])
                    if (socket) {
                        socket.emit('sendTable', [2, 3, 4]);
                    }
                }}> رد سفارش</span>
            });

        } else if (activeKey == '-3') {
            if (userData['status'] != -1) {
                items.push({ key: 5, label: <span onClick={() => printOrder(item['offline_id'], false, 1, 'p1', data['p_bill'])}> صورت حساب از صندوق</span> });
                items.push({ key: 6, label: <span onClick={() => printOrder(item['offline_id'], false, 1, 'p0', data['p_bill'])}> صورت حساب با تبلت</span> });
            }
        }
        return items;
    }
    const handleSms = (id) => {
        findOrder({ offline_id: id }, 1).then((r) => {
            if (r["order"]) {
                let o = r['order'];
                let d = o['details'];
                let u = d['customer'];

                if (u['username']) {
                    request({ phone: u['username'], name: u['name'], id: o['_id'] }, apiUrl[1] + '/send-sms')
                    sendAlert(true, 'پیام ارسال شد')
                }
            }
        })
    }
    const sendToMerge = (id, tableId) => {
        findOrder(
            {
                status: 6,
                table_id: tableId,
            },
            1
        ).then((res) => {
            mergeTable(id, res["order"].offline_id);
        });
    };
    const handleRemoveOrder = (id) => {
        if (window.confirm("آیا مطمئن هستید؟")) {
            removeOrder(id).then((res) => {
                if (res) {
                    findOrder({ removeOrder: 1, offline_id: id }).then((r) => {
                        if (r["order"].acknowledged === true) {
                            updateTables();
                        }
                    });
                    return;
                } else {
                    findOrder({ offline_id: id }, 1).then((r) => {
                        if (r["order"].remove_flag != 1) {
                            saveOrderOffline({
                                id: id,
                                remove_flag: 1,
                            });
                        } else {
                            findOrder({ removeOrder: 1, offline_id: id }).then((r) => {
                                if (r["order"].acknowledged === true) {
                                    updateTables();
                                }
                            });
                        }
                    });
                }
            });
        }
    };
    return (
        <div>
            <div className='row g-2 justify-content-center'>
                {
                    data['tables']?.length ?
                        data['tables'].map(item => (
                            <div className="col-md-2">
                                <div
                                    className={`card pointer shadow-lg ${generateClass(item)}`}
                                    onDoubleClick={() => handleDoubleClick(item)}
                                    onClick={() => handleClick(item)}
                                >
                                    {
                                        item['offline_id'] && item['status'] < 5 ? <div className="text-right p-2">
                                            <input
                                                type="checkbox"
                                                checked={(tbl1 == item['offline_id'] || tbl2 == item['offline_id'])}
                                                onClick={(e) => handleCheck(e, item)}
                                            />
                                            {tbl1 == item['offline_id'] ? (
                                                <span>میز اول</span>
                                            ) : tbl2 == item['offline_id'] ? (
                                                <span>میز دوم</span>
                                            ) : null}
                                        </div> : ''
                                    }
                                    <div className="d-flex flex-column">
                                        <div className="text-center border-bottom py-2">
                                            <div className="py-2 px-3 flex items-center justify-center flex-wrap gap-2">
                                                <span className="text-base">
                                                    {activeKey != "-2" && activeKey != "-3" ? item['name'] : ""}
                                                    {activeKey == "-3" ? item['table_name'] : null}
                                                    {activeKey == "-2" && item['online_table_id']
                                                        ? 69
                                                        : ""}
                                                </span>
                                                {
                                                    item['offline_id'] ?
                                                        <>
                                                            <Dropdown menu={{
                                                                items: handleDropdownItems(item)
                                                            }} trigger={['click']}>
                                                                <Button type='primary' size='small'>
                                                                    <DownIcon className="w-4 h-4" />
                                                                </Button>
                                                            </Dropdown>
                                                            {"#" + item['_id']}
                                                            {
                                                                item['status'] != 5 && activeKey != '-3' && !item['no_update'] && !item['discount_code'] ?
                                                                    <>
                                                                        {
                                                                            [4, 5, 6, 20].includes(item['status']) ? <>
                                                                                {
                                                                                    (userAccess['down_edit_print']) ? <Button danger type='primary' size='small' onClick={() => updateOrder(item['offline_id'])}>
                                                                                        <PenIcon width="16" height="16" />
                                                                                    </Button> : ''
                                                                                }
                                                                            </> : <Button danger type='primary' size='small' onClick={() => updateOrder(item['offline_id'])}>
                                                                                <PenIcon width="16" height="16" />
                                                                            </Button>
                                                                        }
                                                                    </>
                                                                    : ''
                                                            }
                                                            <Tooltip title={item.offline_id}>
                                                                <img
                                                                    src={["1", "2"].includes(item.type) || item.delivery ? "/images/delivery.png" : "/images/disconnected.png"}
                                                                    alt="connection status"
                                                                    style={{ width: 30, height: 30 }}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="نمایش جزئیات">
                                                                <img
                                                                    src="/images/eye.png"
                                                                    className='pointer'
                                                                    style={{ width: 30, height: 30 }}
                                                                    onClick={() =>
                                                                        showDetails(item)
                                                                    }
                                                                />
                                                            </Tooltip>
                                                            {item.sendAll ? <>
                                                                <Tooltip title="تحویل داده شده">
                                                                    <CheckOutlined className="text-success bold text-lg" />
                                                                </Tooltip>
                                                            </>
                                                                : ''}
                                                            {
                                                                item['pay_status'] == 1 && (
                                                                    <Tooltip title={'پرداخت شده'}>
                                                                        <DollarCircleFilled className=" bold text-lg" />
                                                                    </Tooltip>
                                                                )
                                                            }
                                                        </>
                                                    : ''
                                                }
                                            </div>
                                        </div>
                                        <div className='text-center border-bottom py-2'>
                                            {numberFormat(item['total'] * 10, true)}
                                        </div>
                                        <div className='text-center  py-2'>
                                            {item['date'] ? getTime(item['date']) : '-'}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )) : ''
                }
            </div>

        </div>
    )
}
