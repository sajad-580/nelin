import { Tabs } from 'antd';
import baseU from 'baseU';
import OrderDetails from 'components/OrderDetails';
import Pagination from 'components/Pagination';
import { useProductContext } from 'components/Products';
import Table from 'components/Table';
import { mergeTable } from 'helpers/helper';
import { saveMaterialLogs } from 'helpers/offline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { findOrder, removeOrder, saveOrderOffline, setOrderStatus, socketConnection } from 'services/order';
import { changeTable, printChangeTable } from 'services/table';
import { io } from 'socket.io-client';
import { sendAlert } from 'util/util';

export default function tables() {
    const router = useRouter()
    const { tables, interval, activeKey, setActiveKey, warehouse, getTable, userData } = useProductContext();
    const [tableFullSelected, setTableFullSelected] = useState<any>('');
    const [tableEmptySelected, setTableEmptySelected] = useState<any>('');
    const [newTables, setNewTables] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [tbl1, setTbl1] = useState("");
    const [tbl2, setTbl2] = useState("");
    const [details, setDetails] = useState({});
    const [showDetails, setShowDetails] = useState(false);

    const updateTables = async (_page = 1, _data?: any) => {
        let table: any;
        if (_data)
            table = [..._data];
        else
            table = await getTable();
        let res = await findOrder({
            status: 6,
        })
        if ((res["order"] || []).length) {
            for (const key in table) {
                if (table[key]['_id'] == -2) table[key]['tables'] = [];
                for (const item of res["order"]) {
                    item['details']['_id'] = item['_id'];
                    item['details']['status'] = item['status'];
                    if (!item['table_id']) {
                        if (table[key]['_id'] == -2)
                            table[key]['tables'].push(item['details']);
                        continue;
                    }
                    let _tables = table[key]['tables'];
                    for (const k in _tables) {
                        if (_tables[k]['id'] == item['table_id']) {
                            _tables[k] = { ..._tables[k], ...item['details'] };
                            break;
                        }
                    }
                    table[key]['tables'] = _tables;
                }
            }
        }
        let limit = 10;
        let skip = 0;

        if (page) skip = ((_page ? _page : page) - 1) * limit;
        findOrder({
            status: 0,
            limit: limit,
            skip: skip,
        }).then((res) => {
            if ((res["order"] || []).length) {
                for (const key in table) {
                    if (table[key]['_id'] == -3) table[key]['tables'] = [];
                    for (const item of res["order"]) {
                        item['details']['_id'] = item['_id'];
                        item['details']['status'] = item['status'];
                        if ([6, 20].includes(item['status'])) {
                            if (table[key]['_id'] == -3)
                                table[key]['tables'].push(item['details']);
                        }
                    }
                }
            }
        });
        findOrder({
            status: 0,
            count: 1,
        }).then((c) => {
            let _pages = c["order"] > 0 ? Math.ceil(c["order"] / limit) : 0;
            setPages(_pages);
        });
        setNewTables(table)
        interval()
    }
    useEffect(() => {
        updateTables();
        if (!activeKey && tables?.length) setActiveKey(tables[0]['_id']);
    }, [router])
    useEffect(() => {
        updateTables(page);
    }, [page])
    useEffect(() => {
        if (!showDetails)
            updateTables();
    }, [showDetails])
    const setStatus = (order_id, st_id, online?: any) => {
        saveOrderOffline({
            id: order_id,
            status: st_id,
        }).then((res) => {
            if (warehouse && st_id == 6) saveMaterialLogs(res);
            updateTables();
            if (online == 1) {
                setOrderStatus(order_id, st_id);
            }
        });
    };
    useEffect(() => {

        if (!tableFullSelected || !tableEmptySelected) return;
        changeTable(tableFullSelected, tableEmptySelected)
            .then(async (res) => {
                printChangeTable(tableFullSelected["table_name"], tableEmptySelected["table_name"], userData['phone']);
                sendAlert(true, "عملیات موفقیت امیز بود .");
                let _tables = await getTable();
                updateTables(1, _tables);
                interval();
            })
            .catch((err) => {
                console.log('err')
            })
            .finally(() => {
                setTableEmptySelected("");
                setTableFullSelected("");
            });
    }, [tableFullSelected, tableEmptySelected])
    const mergeTables = async (tbl1, tbl2) => {
        let res: any = await mergeTable(tbl1, tbl2);
        if (res) {
            setTbl1("");
            setTbl2("");
            sendAlert(true, 'میز اول روی میز دوم ادغام گردید');
            let _tables = await getTable();
            updateTables(1, _tables);
        }
    }

    return (
        <div className='container-fluid'>
            <div
                className="w-full"
                style={{ justifyContent: "center", display: "flex" }}
            >
                <div className="" style={{ width: "200px" }}>
                    <button
                        className="btn btn-accent w-full btn-sm text-sm"
                        onClick={() => mergeTables(tbl1, tbl2)}
                        disabled={tbl1 && tbl2 ? false : true}
                    >
                        ادغام میز
                    </button>
                </div>
            </div>
            <Tabs
                activeKey={activeKey}
                onChange={(e) => setActiveKey(e)}
                className=''
                type="card"
                size={'large'}
                items={newTables?.length ? newTables.map(item => {
                    return {
                        key: item['_id'],
                        label: item['name'],
                        children: <Table data={item} tableFullSelected={tableFullSelected} setTableFullSelected={setTableFullSelected}
                            tableEmptySelected={tableEmptySelected} setTableEmptySelected={setTableEmptySelected}
                            tbl1={tbl1}
                            setTbl1={setTbl1}
                            tbl2={tbl2}
                            setTbl2={setTbl2}
                            setShowDetails={setShowDetails}
                            setDetails={setDetails}
                            setStatus={setStatus}
                            updateTables={updateTables}
                        />
                    };
                }) : []}
            />
            {
                activeKey == '-3' ? <Pagination all={pages} page={page} setPage={setPage} /> : ""
            }
            <OrderDetails data={details} setData={setDetails}
                show={showDetails} setShow={setShowDetails} />
        </div>
    )
}
