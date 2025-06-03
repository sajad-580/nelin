import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Modal, Switch } from "antd";
import { formatPrice } from "helpers/format";
import { useEffect, useRef, useState } from "react";
import { checkSendAll, findOrder, saveOrderOffline } from "services/order";
const OrderDetails = ({ data, setData, show, setShow }) => {
  const [status, setStatus] = useState({})
  const [seconds, setSeconds] = useState(0)
  const close = () => {
    setShow(false);
    setData({})
    setStatus({})
  }

  const type = {
    0: " سفارش در محل رستوران",
    1: " تحویل در محل (پرداخت در محل)",
    2: " تحویل در محل (پرداخت انلاین)",
    3: "مراجعه حضوری به شعبه",
  };
  const interval = () => {
    const interval_id = setInterval(() => {
      setSeconds(seconds + 1);
      clearInterval(interval_id);
    }, 100);
  };
  useEffect(() => {
    let obj = {};
    if (data) {
      let sendItem = data['sendItem'];
      obj = { ...sendItem };
      obj[-1] = data['sendService'];
      setStatus(obj)
      interval()
    }
  }, [data])
  const createNewDetails = (check, sendAll, sendItem) => {
    let details = { ...data };
    delete details['id'];
    delete details['name'];
    delete details['_id'];
    details['sendService'] = check;
    details['sendAll'] = sendAll;
    if (sendItem) details['sendItem'] = sendItem;
    return details;
  }
  const handleStatus = async (item, e) => {
    let res = await findOrder({
      offline_id: data.offline_id
    }, 1);
    let order = res['order']['details'];
    let sendItem = order['sendItem'] ?? {};
    if (item === -1) {
      let check = true;
      if (order['sendService'])
        check = false;
      let sendAll = checkSendAll(order['cart'], sendItem, check);
      let res = await saveOrderOffline({ id: data.offline_id, details: createNewDetails(check, sendAll, sendItem) });
      if (res['order']['details'])
        setStatus(e => {
          e[-1] = check;
          return e
        })
      interval()

    } else {
      let check = true;
      if (sendItem && sendItem[item])
        check = false;
      sendItem[item] = check;
      let sendAll = checkSendAll(data['cart'], sendItem, order['sendService'])
      let res = await saveOrderOffline({
        id: data.offline_id, details: createNewDetails(order['sendService'], sendAll, sendItem)

      });
      if (res['order']['details'])
        setStatus(e => {
          e[item] = check;
          return e
        })
      interval()
    }


    return true;
  }
  return (
    <Modal title={'جزئیات سفارش'} open={show} onCancel={close} footer={
      <div className="flex justify-content-end">
        <button
          className="btn btn-danger btn-sm"
          type="button"
          onClick={() => close()}
        >
          بستن
        </button>
      </div>
    } width={1000} style={{ top: 20 }}>
      <div className="table-responsive">
        <table className="table">
          <thead className="bg-gray">
            <tr>
              <th>نام</th>
              <th>قیمت</th>
              <th>تعداد</th>
              <th>مجموع</th>
              <th>توضیح</th>
              <th>تحویل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} >سرویس</td>
              <td>
                <Switch
                  onChange={(e) => handleStatus(-1, e)}
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={status[-1]}
                />
              </td>
            </tr>
            {(data['cart'] || []).length
              ? data['cart'].map((item) => (
                <tr>
                  <td>{item['full_name']}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.qty}</td>
                  <td>{formatPrice(item['total'])}</td>
                  <td>{item.note}</td>
                  <td>
                    <Switch
                      onChange={(e) => handleStatus(item['uniq_id'], e)}
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                      checked={status[item['uniq_id']]}
                    />
                  </td>
                </tr>
              ))
              : null}
            {
              data['priceDetails'] ? <>
                {data['priceDetails']['discount'] > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      تخفیف: {formatPrice(data['priceDetails']['discount'])}
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].loviuna ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      Loviuna: {data['priceDetails'].loviuna["name"]}{" "}
                      {formatPrice(data['priceDetails'].loviuna["price"])}
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].service > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      سرویس: {formatPrice(data['priceDetails'].service)}
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].tip > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <span style={{ display: "inline-flex" }}>
                        tip:{" "}
                      </span>{" "}
                      <span> {formatPrice(data['priceDetails'].tip)}</span>
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].packaging > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <span style={{ display: "inline-flex" }}>
                        بسته بندی:{" "}
                      </span>{" "}
                      <span> {formatPrice(data['priceDetails'].packaging)}</span>
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].shipping_price > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <span style={{ display: "inline-flex" }}>
                        هزینه ارسال:{" "}
                      </span>{" "}
                      <span> {formatPrice(data['priceDetails'].shipping_price)}</span>
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].tax > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <span style={{ display: "inline-flex" }}>
                        مالیات بر ارزش افزوده VAT:{" "}
                      </span>{" "}
                      <span> {formatPrice(data['priceDetails'].tax)}</span>
                    </td>
                  </tr>
                ) : null}
                {data['priceDetails'].credit_discount > 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <span style={{ display: "inline-flex" }}>
                        استفاده از اعتبار:
                      </span>
                      <span> {formatPrice(data['priceDetails'].credit_discount)}</span>
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td colSpan={6} className="text-center">
                    مجموع: {formatPrice(data['priceDetails'].total)}
                  </td>
                </tr>
              </> : ''
            }


            {data.table_id ? (
              <tr>
                <td colSpan={6}>
                  شماره میز: {data['name']}
                </td>
              </tr>
            ) : null}
            {data.num_people ? (
              <tr>
                <td colSpan={6}>
                  تعداد نفرات: {data.num_people}
                </td>
              </tr>
            ) : null}
            {data.note ? (
              <tr>
                <td colSpan={6}>
                  توضیح: {data.note}
                </td>
              </tr>
            ) : null}
            {data.customer && data.customer['username'] ? (
              <tr>
                <td colSpan={6}>
                  مشتری:{" "}
                  {data.customer['name']}
                  <br />
                  {data.customer['username']}
                </td>
              </tr>
            ) : null}
            {data.sale_by ? (
              <tr>
                <td colSpan={6}>
                  ثبت شده توسط: {data.sale_by}
                </td>
              </tr>
            ) : null}
            {data.type ? (
              <tr>
                <td colSpan={6}>
                  نوع: {type[data.type]}
                </td>
              </tr>
            ) : null}
            {data.customer && data.customer['address'] ? (
              <tr>
                <td colSpan={6}>
                  آدرس: {data.customer['address']}
                </td>
              </tr>
            ) : null}
            {data.delivery ? (
              <tr>
                <td colSpan={6}>
                  بیرون بر
                </td>
              </tr>
            ) : null}
            {data.pay_status ? (
              <tr>
                <td colSpan={6}>
                  وضعیت پرداخت:{" "}
                  {data.pay_status == 1
                    ? "پرداخت شده"
                    : "پرداخت نشده"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default OrderDetails;
