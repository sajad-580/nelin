import ErrorComponent from "components/shared/Error";
import ImageComponent from "components/shared/image-component";
import IPrinter from "interfaces/printer";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Button, Col, Flex, Form, Input, Row, Select } from "antd";
import { useProductContext } from "components/Products";
import { formatPrice, roundFinalPrice } from "helpers/format";
import {
    uploadOfflineOrders
} from "helpers/offline";
import { toast } from "react-toastify";
import {
    findOrder,
    printAllOrders
} from "services/order";
import { getPersianDate, numberFormat } from "services/persian";
import { hidden, p2e, request, sendAlert } from "util/util";
import { getMenu, getTables } from "helpers/helper";
import { useCartContext } from "components/CartProvider";


const PrintersPage = () => {
    const [isError, setIsError] = useState(false);
    const [printers, setPrinters] = useState([]);
    const [printersName, setPrintersName] = useState({});
    const [printerIds, setPrinterIds] = useState<IPrinter[]>([]);
    const [pIds, setPIds] = useState([]);
    const [total, setTotal] = useState({ count: "0", total: "0" });
    const [total2, setTotal2] = useState({ count: "0", total: "0" });
    const [total3, setTotal3] = useState({ count: "0", total: "0" });
    const [total4, setTotal4] = useState({ count: "0", total: "0" });
    const [borderSize, setBorderSize] = useState("");
    const [fontSize, setFontSize] = useState("");
    const [pageWidth, setPageWidth] = useState("");
    const [com, setCom] = useState("COM4");
    const router = useRouter();
    const { setLoader, interval, token, warehouse, userData, logout, setTables } =
        useProductContext();
    const { getRawItems } = useCartContext()
    const handlePrinters = async () => {
        await request('/get-printers', 'GET')
            .then((printersArr: any) => {
                let arr = []
                printersArr.printers.forEach((p) => {
                    let printer = { name: p.name }
                    arr.push(printer)
                })
                // console.log(printersArr)
                setPrinters([...arr]);
            })
            .catch(() => setIsError(true));
    };

    useEffect(() => {
        // get all nodes from localstorage
        let pids = userData ? userData['printer_id'] : [];

        // nodes are not available? need to re-login
        // if (pids?.length) {
        //     localStorage.removeItem("token");
        //     router.push("/login");
        // }

        let pidsArr = pids;
        setPIds(pidsArr)
        let pidsObjArr = [];
        pidsArr.forEach((id: string) => {
            let name = localStorage.getItem(id);
            let item = { id, name };
            pidsObjArr.push(item);
        });
        setPrinterIds([...pidsObjArr]);
        let printer_name = userData ? userData['printer_list'] : {}
        console.log(printer_name)
        setPrintersName(printer_name);

        // get accessible printers from node server
        handlePrinters();
        orderSum();
        if (!localStorage.getItem("borderSize"))
            localStorage.setItem("borderSize", "3");
        if (!localStorage.getItem("fontSize"))
            localStorage.setItem("fontSize", "12");
        if (!localStorage.getItem("pageWidth"))
            localStorage.setItem("pageWidth", "90");

        setBorderSize(localStorage.getItem("borderSize"));
        setFontSize(localStorage.getItem("fontSize"));
        setPageWidth(localStorage.getItem("pageWidth"));

        if (localStorage.getItem("com")) setCom(localStorage.getItem("com"));
    }, [router]);
    const orderSum = () => {
        findOrder({ sum: 1 }).then((o) => {
            if (o["total"].length) setTotal(o["total"][0]);
            else setTotal({ count: "0", total: "0" });
            if (o["total2"].length) setTotal2(o["total2"][0]);
            else setTotal2({ count: "0", total: "0" });
            if (o["total3"].length) setTotal3(o["total3"][0]);
            else setTotal3({ count: "0", total: "0" });
            if (o["total4"].length) setTotal4(o["total4"][0]);
            else setTotal4({ count: "0", total: "0" });
        });
    };
    function logOut() {
        if (confirm("آیا مطمئن هستید؟")) {
            logout()
        }
    }
    const handleSendAllPrint = async () => {
        try {
            setLoader(true);
            let printers = pIds
            const prints = {};
            for (let i = 0; i < printers.length; i++) {
                const p = localStorage.getItem(printers[i]) || 0;
                if (p) {
                    prints[printers[i]] = p;
                }
            }
            let orders = await findOrder({ sort: 1 });
            if (orders["order"] && orders["order"]?.length) {
                let startDate = getPersianDate(orders["order"][0]['details']["date"], "y/m/d");
                let endDate = getPersianDate(
                    orders["order"][orders["order"].length - 1]['details']["date"],
                    "y/m/d"
                );
                let totalPrice = 0;
                const orderData = [];
                for (const iterator of orders["order"]) {
                    totalPrice += iterator['details']["total"];
                    orderData.push({
                        _id: iterator["_id"],
                        date: iterator['details']["date"],
                        total: numberFormat(iterator['details']["total"]),
                    });
                }
                const print = await printAllOrders(
                    orderData,
                    pageWidth,
                    startDate,
                    endDate,
                    borderSize,
                    fontSize,
                    numberFormat(totalPrice),
                    prints
                );
                if (print["success"]) {
                    setLoader(false);
                }
            } else {
                setLoader(false);
            }
        } catch (error) {

        }
    };
    const printerValue = (pid) => {
        let val = localStorage.getItem(pid.id);
        return val ? val : null
    }
    return (
        <div className="container-fluid">
            <Flex gap={'small'}>
                <div style={{ width: 200 }} className={`bg-no-repeat h-screen bg-cover bg-printer-texture  ${hidden()}`}></div>
                <div className="flex-1 container-fluid h-screen overflow-auto">
                    <div>
                        <div className="pb-5">
                            <Link href="/" className="float-right text-danger">
                                <span>بازگشت</span>
                            </Link>
                            {token && (
                                <div
                                    className="px-4 cursor-pointer float-left btn btn-danger"
                                    onClick={(e) => {
                                        logOut();
                                    }}
                                >
                                   
                                    <ImageComponent
                                        src="/images/logout.png"
                                        alt="logout"
                                        width={25}
                                        height={25}
                                    />
                                    <span> خروج از حساب کاربری</span>
                                </div>
                            )}
                        </div>

                        <div
                            className="alert alert-success rounded px-4 py-3 shadow-md mb-3"
                            role="alert"
                        >
                            <div className="flex">
                                <div>
                                    <p className="font-bold">تعداد کل: {total["count"]}</p>
                                    <p className="font-bold">
                                        مجموع قیمت کل:{" "}
                                        {formatPrice(roundFinalPrice(parseFloat(total["total"])))}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="alert alert-warning rounded px-4 py-3 shadow-md mb-3"
                            role="alert"
                        >
                            <div className="flex">
                                <div>
                                    <p className="font-bold">
                                        تعداد تسویه شده های ارسال نشده: {total2["count"]}
                                    </p>
                                    <p className="font-bold">
                                        مجموع تسویه شده های ارسال نشده:{" "}
                                        {formatPrice(roundFinalPrice(parseFloat(total2["total"])))}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="alert alert-info rounded px-4 py-3 shadow-md mb-3"
                            role="alert"
                        >
                            <div className="flex">
                                <div>
                                    <p className="font-bold">
                                        تعداد تسویه شده های ارسال شده: {total3["count"]}
                                    </p>
                                    <p className="font-bold">
                                        مجموع تسویه شده های ارسال شده:{" "}
                                        {formatPrice(roundFinalPrice(parseFloat(total3["total"])))}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="alert alert-primary rounded px-4 py-3 shadow-md mb-3"
                            role="alert"
                        >
                            <div className="flex">
                                <div>
                                    <p className="font-bold">
                                        تعداد سفارش های آنلاین: {total4["count"]}
                                    </p>
                                    <p className="font-bold">
                                        مجموع سفارش های آنلاین:{" "}
                                        {formatPrice(roundFinalPrice(parseFloat(total4["total"])))}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <ErrorComponent
                            isError={isError}
                            message="هیچ پرینتری در دسترس نیست"
                        />

                        <Flex gap={'middle'} className="mt-5" justify="center">
                            <span
                                className="pt-2 ml-4 cursor-pointer"
                                onClick={() => {
                                    // remove current nodes
                                    pIds.forEach((node: string) => {
                                        localStorage.removeItem(node);
                                    });
                                    // reload printers list
                                    handlePrinters();
                                }}
                            >
                                <ImageComponent
                                    src="/images/undo.png"
                                    width={24}
                                    height={24}
                                    alt="undo"
                                />
                            </span>
                            <h4 className="font-bold">
                                لیست پرینترهای تعریف شده
                            </h4>
                        </Flex>

                        <Flex gap={'middle'} className="mt-5" justify="center">
                            <span
                                className="pt-2 ml-4 cursor-pointer"
                                onClick={() => {
                                    let printers = userData ? userData['printer_id'] : [];
                                    JSON.parse(printers).forEach((node: string) => {
                                        localStorage.removeItem(node);
                                    });
                                }}
                            >
                                <ImageComponent
                                    src="/images/trash.png"
                                    width={24}
                                    height={24}
                                    alt="trash"
                                />
                            </span>
                            <h4 className="font-bold">
                                پاک کردن پرینترهای تعریف شده
                            </h4>
                        </Flex>

                        <Form className="mt-5">
                            {printerIds.map((pid, index) => {
                                return (
                                    <Flex gap={'small'}>
                                        <Form.Item
                                            label={printersName[pid.id] || pid.id}
                                            className="flex-1 items-center justify-between"
                                        >
                                            <Select
                                                placeholder="انتخاب کنید ..."
                                                onChange={(e) => {
                                                    localStorage.setItem(pid.id, e);
                                                    interval();
                                                }}
                                                options={
                                                    printers.map((printer, idx) => {
                                                        return { label: printer.name, value: printer.name };
                                                    })
                                                } value={printerValue(pid)} />
                                        </Form.Item>
                                        <Button
                                            htmlType="button"
                                            className="bg-danger text-white"
                                            onClick={() => {
                                                localStorage.removeItem(pid.id)
                                                interval();
                                            }}
                                        >
                                            خالی کردن
                                        </Button>
                                    </Flex>
                                );
                            })}
                        </Form>

                        <Form className="w-full border p-2 rounded mt-2 mb-3">
                            <div className="mt-3 mb-3">
                                <h6>تنظیمات پرینت</h6>
                                <hr />
                            </div>
                            <Form.Item label="قطر کادر (پیکسل) ( عدد پیشنهادی ۳ میباشد)">
                                <Input value={borderSize} onChange={(e) => {
                                    setBorderSize(e.target.value);
                                    localStorage.setItem(
                                        "borderSize",
                                        e.target.value ? p2e(e.target.value) : "3"
                                    );
                                }} />
                            </Form.Item>
                            <Form.Item label=" اندازه فونت (پیکسل) ( عدد پیشنهادی ۱۲ میباشد)">
                                <Input value={fontSize}
                                    onChange={(e) => {
                                        setFontSize(e.target.value);
                                        localStorage.setItem(
                                            "fontSize",
                                            e.target.value ? p2e(e.target.value) : "18"
                                        );
                                    }} />
                            </Form.Item>
                            <Form.Item label="عرض صفحه (درصد) ( عدد پیشنهادی ۹۰ میباشد)">
                                <Input value={pageWidth}
                                    onChange={(e) => {
                                        setPageWidth(e.target.value);
                                        localStorage.setItem(
                                            "pageWidth",
                                            e.target.value ? p2e(e.target.value) : "90"
                                        );
                                    }} />
                            </Form.Item>
                        </Form>
                        <div className="w-full mb-5">
                            <Row>
                                <Col md={12} lg={12} sm={24} xs={24} className="p-2">
                                    <button
                                        className="btn btn-accent w-full mt-1"
                                        onClick={(e) => {
                                            if (confirm("آیا مطمئن هستید؟")) {
                                                localStorage.clear();
                                                logout();
                                            }
                                        }}
                                    >
                                        ریست تمام تنظمیات برنامه و حذف پرینتر ها
                                    </button>
                                </Col>
                                <Col md={12} lg={12} sm={24} xs={24} className="p-2">
                                    <button
                                        className="btn btn-accent w-full mt-1"
                                        onClick={(e) => {
                                            if (confirm("آیا مطمئن هستید؟")) {
                                                setLoader(true);
                                                getMenu(token).then((res) => {
                                                    setLoader(false);
                                                    setTimeout(() => {
                                                        getRawItems();
                                                    }, 500)
                                                    router.push("/");
                                                });
                                            }
                                        }}
                                    >
                                        به روز رسانی منو
                                    </button>
                                </Col>

                                <Col md={12} lg={12} sm={24} xs={24} className="p-2">
                                    <button
                                        className="btn btn-accent w-full mt-1"
                                        onClick={(e) => {
                                            if (confirm("آیا مطمئن هستید؟")) {
                                                setLoader(true);
                                                getTables(token).then(t => {
                                                    setTables(t)
                                                })
                                            }
                                        }}
                                    >
                                        به روز رسانی میز ها
                                    </button>
                                </Col>

                                <Col md={12} lg={12} sm={24} xs={24} className="p-2">
                                    <button
                                        className="btn btn-accent w-full mt-1"
                                        onClick={(e) => {
                                            if (confirm("آیا مطمئن هستید؟")) {
                                                setLoader(true);
                                                uploadOfflineOrders(null, null, warehouse);
                                                findOrder({ status: 20 }).then((o) => {
                                                    if (o["order"].length) {
                                                        sendAlert(false, "تمامی اطلاعات   هنوز به صورت کامل به  پایگاه  داده ارسال نشده")
                                                        setLoader(false);
                                                        return;
                                                    } else {
                                                        findOrder({ remove: 1 }).then((r) => {
                                                            if (r["order"].acknowledged === true) {
                                                                request(
                                                                    "/api/find2?model=Log",
                                                                    'POST',
                                                                    { status: 0 }
                                                                ).then((res: any) => {
                                                                    if (!res?.length)
                                                                        request(
                                                                            "/api/find2?model=Log",
                                                                            'POST',
                                                                            { removeAll: 1 }
                                                                        );
                                                                });
                                                                sendAlert(true, " با موفقیت انجام شد")
                                                                setLoader(false);
                                                                return;
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        صفر کردن صندق
                                    </button>
                                </Col>
                                <Col md={12} lg={12} sm={24} xs={24} className="p-2">
                                    <button
                                        className="btn btn-accent w-full mt-1"
                                        onClick={(e) => {
                                            handleSendAllPrint();
                                        }}
                                    >
                                        پرینت صندوق
                                    </button>
                                </Col>
                                {warehouse ? (
                                    <Col md={12} lg={12} sm={24} xs={24} className="p-2">
                                        <Link href={"/materials"}>
                                            <button className="btn btn-primary w-full mt-1">
                                                {" "}
                                                ثبت ورود خروج انبار
                                            </button>
                                        </Link>
                                    </Col>
                                ) : (
                                    ""
                                )}
                            </Row>
                        </div>
                    </div>
                </div>
            </Flex >
        </div >
    );
};

export default PrintersPage;
