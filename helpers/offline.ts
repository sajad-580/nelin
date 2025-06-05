import { request, saveLog, saveMaterialLog } from "./../services/table";
import Router from "next/router";
import { getRawItems } from "services/table";
import {
  checkSendAll,
  createOrderData,
  findOrder,
  saveBranch,
  saveOrderOffline,
} from "./../services/order";
import { randomBytes } from "crypto";
import axios, { AxiosRequestConfig } from "axios";

import { submitOrderOffline } from "../services/order";
import ICustomer from "interfaces/customer";
import { cartTotalPrice, formatPrice, roundFinalPrice } from "helpers/format";
import apiUrl from "apiUrl";
import { getBranchId } from "util/util";

export const requestPrintOffline = (
  order: any,
  customer: ICustomer,
  totalAmount: string,
  offline_id: string,
  factorID: string,
  useDiscount?: any,
  table_id?: string,
  print_type?: any,
  p_bill?: any,
  printer?: any,
  note?: any,
  numPeople?: any,
  service?: any,
  reprint?: any,
  tip?: any,
  taxPrice?: any,
  loviuna?: any,
  address?: any,
  delivery?: any,
  packaging?: any,
  shipping_price?: any,
  type?: any,
) => {
  let printers = localStorage.getItem("printers") || "[]";
  printers = JSON.parse(printers);
  const prns = {};
  for (let i = 0; i < printers.length; i++) {
    const p = localStorage.getItem(printers[i]) || 0;
    if (printer && printer != printers[i]) continue;
    if (p) {
      prns[printers[i]] = p;
    }
  }
  let custom_print_valuet = JSON.parse(
    localStorage.getItem("custom_print_valuet") || "[]"
  );
  let raw_items = JSON.parse(localStorage.getItem("raw_items"));
  if (!print_type) print_type = localStorage.getItem("printer_behave_default");
  let p_bar;
  if (table_id) {
    let salon = JSON.parse(localStorage.getItem("salon"));
    let tabales = JSON.parse(localStorage.getItem("tables"));
    if (salon != null)
      Object.keys(salon).forEach((k) => {
        if (tabales[k] && tabales[k][table_id]) {
          p_bar = salon[k].p_bar;
        }
      });
  }
  let phone = "";
  if (localStorage.getItem("phone")) phone = localStorage.getItem("phone");
  let borderSize = localStorage.getItem("borderSize")
    ? JSON.parse(localStorage.getItem("borderSize"))
    : 3;
  let fontSize = localStorage.getItem("fontSize")
    ? JSON.parse(localStorage.getItem("fontSize"))
    : 12;
  let pageWidth = localStorage.getItem("pageWidth")
    ? JSON.parse(localStorage.getItem("pageWidth"))
    : 90;

  submitOrderOffline(
    order,
    customer,
    totalAmount,
    prns,
    offline_id,
    custom_print_valuet,
    raw_items,
    table_id,
    factorID,
    useDiscount,
    print_type,
    p_bill,
    p_bar,
    phone,
    note,
    numPeople,
    borderSize,
    fontSize,
    pageWidth,
    service,
    reprint,
    tip,
    taxPrice,
    loviuna,
    address,
    delivery,
    packaging,
    shipping_price,
    type
  )
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
};
const getFactorID = () => {
  let factorID = localStorage.getItem("factorID");
  if (!factorID) {
    localStorage.setItem("factorID", "1");
    factorID = "1";
  } else {
    factorID = (parseInt(factorID) + 1).toString();
    localStorage.setItem("factorID", factorID);
  }
  return factorID;
};

const getNewDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  // Extract time components
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  // Create the formatted date string
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const getOptionsId = (item) => {
  let options_id = [];
  item.options.map((i) => options_id.push(i.id));
  let id =
    item.id +
    "_" +
    options_id
      .sort()
      .map((i) => i)
      .join("_");
  return id;
};
const updateOrder = (
  order,
  customer,
  totalAmount,
  orderId,
  offlineOrders,
  tableId,
  customerNote,
  filteredOrders,
  paymentTypeDefault,
  noCustomer,
  numPeople,
  useDiscount?: any,
  discount?: any,
  price?: any,
  totalAmount2?: any,
  note?: any,
  usePoint?: any,
  userPoint?: any,
  service?: any,
  payment_card?: any,
  payment_pos?: any,
  payment_cash?: any,
  status?: any,
  print_type?: any,
  username?: any,
  tip?: any,
  name_and_fam?: any,
  item_price?: any,
  taxPrice?: any,
  loviuna?: any,
  address?: any,
  delivery?: any,
  packaging?: any,
  shipping_price?: any,
) => {
  let factorID, offline_id;
  let log = [];
  let localOrders = [];
  if ((offlineOrders || []).length) {
    offlineOrders.map((item, i) => {
      if (item.id == orderId) {
        factorID = item.local_id;
        offline_id = item.id;
        delete offlineOrders[i];
        return;
      }
      localOrders.push(item);
    });
  }

  offline_id = orderId;
  findOrder({ offline_id: orderId }, 1).then((res) => {
    if (res["order"]) {
      factorID = res["order"]._id;
      let old_order = JSON.parse(res["order"].order_details);
      let _order = createOrderData(old_order);
      let update_id = [];
      let new_log = [];
      order.map((o, i) => {
        let id = getOptionsId(o.product);
        if (old_order.items[id]) {
          o["old_qty"] = old_order.items[id].qty;
          new_log.push({
            id: o.product.id,
            qty: o.old_qty,
            options: o.product.options.length
              ? "[" + o.product.options.map((i) => i.id).join(",") + "]"
              : "",
            note: o.note,
            date: getNewDate(),
            name: name_and_fam,
          });
          update_id.push(id);
        }
        if (!customer.name && old_order.detail.user_name) {
          customer = { name: old_order.detail.user_name, id: 0 };
        }
      });
      let oldLog = old_order.detail.log;
      if (oldLog && oldLog?.length) log = [...old_order.detail.log];
      if (new_log?.length) log.push(new_log);

      let newOfflineOrder = pushOfflineOrders(
        [],
        orderId,
        orderId,
        filteredOrders,
        customer,
        paymentTypeDefault,
        customerNote,
        noCustomer,
        numPeople,
        tableId,
        factorID,
        log,
        useDiscount
      );
      const detailOrderOffline = detailsOrderOffline(
        order,
        orderId,
        orderId,
        factorID,
        tableId,
        customer,
        customerNote,
        log,

        useDiscount
      );
      let cart = {};
      let raw_items = localStorage.getItem("raw_items") || "[]";
      raw_items = JSON.parse(raw_items);
      cart = createCart(order, cart, raw_items);
      // localStorage.setItem(`order-${orderId}`, JSON.stringify({ detail: detailOrderOffline, items: cart }));

      // localStorage.setItem("localOrders", JSON.stringify(localOrders));
      _order.map((item, key) => {
        let id = getOptionsId(item.product);
        if (!update_id.includes(id)) {
          log.push({
            id: item.product.id,
            qty: item.count,
            options: item.product.options.length
              ? "[" + item.product.options.map((i) => i.id).join(",") + "]"
              : "",
            note: item.note,
          });

          item["old_qty"] = item.count;
          item["remove"] = 1;
          order.push(item);
        }
      });
      let sendItem = res['order']['sendItem'];
      if (sendItem) {
        for (const item of order) {
          if (item.old_qty != item.count)
            sendItem[item['product']['unique']] = false;
        }
      }
      let new_status = res["order"].status == -1 ? -1 : status ? status : 2;
      let sendAll = checkSendAll(order, sendItem, res['order']['sendService'])

      saveOrderOffline({
        status: new_status,
        total: totalAmount2,
        discount: discount,
        table_id: tableId,
        offline_id: orderId,
        order_details: JSON.stringify({
          detail: detailOrderOffline,
          items: cart,
        }),
        order_local: JSON.stringify(newOfflineOrder),
        id: orderId,
        sms:0,
        updateDate: getNewDate(),
        note: note,
        use_point: usePoint,
        user_point: userPoint,
        service: service,
        payment_card: payment_card,
        payment_pos: payment_pos,
        payment_cash: payment_cash,
        username: username,
        tip: tip ? tip : "",
        name_and_fam: name_and_fam,
        price: item_price,
        tax: taxPrice,
        loviuna: loviuna,
        address: address,
        delivery: delivery,
        packaging: packaging,
        shipping_price: shipping_price,
        sendItem: sendItem,
        sendAll: sendAll
      }).then(() => {
        if (new_status != -1)
          requestPrintOffline(
            order,
            customer,
            totalAmount,
            orderId,
            factorID,
            discount,
            tableId,
            print_type,
            null,
            null,
            note,
            numPeople,
            service,
            null,
            tip ? tip : null,
            taxPrice,
            loviuna,
            address,
            delivery,
            packaging,
            shipping_price,
            res["order"].type
          );
      });
    }
  });
};
const detailsOrderOffline = (
  order,
  orderId,
  offline_id,
  factorID,
  tableId,
  customer,
  customerNote,
  log?: any,
  useDiscount?: any
) => {
  return {
    final_price: +cartTotalPrice(order).split(" ")[0].split(",").join(""),
    id: orderId ? orderId : offline_id,
    offline_id: offline_id,
    local_id: factorID,
    table_id: tableId,
    user_name: customer.name ? customer.name : "",
    user_number: customer.id,
    user_id: customer.id === 0 ? customer.name : customer.id,
    note: customerNote,
    date_orginal: getNewDate(),
    status_raw: 1,
    pdf_bar: "",
    pdf_customer: "",
    log: log ? log : [],
    discount_id: useDiscount ? useDiscount["id"] : 0,
  };
};
const createCart = (order, cart, raw_items) => {
  order.forEach((item) => {
    let id = getOptionsId(item.product);
    cart[id] = {
      options: JSON.stringify(item.product.options.map((i) => i.id)),
      qty: item.count,
      note: item.note ? item.note : "",
      price: raw_items[item.product.id]["last_price"],
      total_price: item.product.options.length
        ? item.product.options
          .map((i) => i.price)
          .reduce((accumulator, curr) => accumulator + curr) +
        raw_items[item.product.id]["last_price"]
        : raw_items[item.product.id]["last_price"],
    };
  });
  return cart;
};
const pushOfflineOrders = (
  offlineOrders,
  orderId,
  offline_id,
  filteredOrders,
  customer,
  paymentTypeDefault,
  customerNote,
  noCustomer,
  numPeople,
  tableId,
  factorID,
  log?: any,
  useDiscount?: any
) => {
  return {
    id: orderId ? orderId : offline_id,
    offline_id,
    cart: filteredOrders,
    user_id: customer.id === 0 ? customer.name : customer.id,
    date: Date.now(),
    payment_type: paymentTypeDefault,
    customer_note: customerNote,
    noCustomer: noCustomer,
    orderId: orderId == 0 ? "" : orderId,
    numPeople: numPeople ? numPeople : "",
    table_id: tableId,
    local_id: factorID,
    log: log ? log : [],
    sms:0,
    discount_id: useDiscount ? useDiscount["id"] : 0,
  };
};
export const submitOrderLocally = (
  order: any,
  customer: ICustomer,
  totalAmount: any,
  paymentTypeDefault: string,
  customerNote: string,
  noCustomer: Boolean,
  orderId,
  numPeople,
  tableId: string,
  detailEditOrder,
  setDetailEditOrder,
  useDiscount?: any,
  note?: any,
  userPoint?: any,
  usePoint?: any,
  service?: any,
  payment_card?: any,
  payment_pos?: any,
  payment_cash?: any,
  offline_id?: any,
  status?: any,
  flag?: any,
  online_table_id?: any,
  tip?: any,
  userDiscount?: any,
  warehouse?: any,
  pay_status?: any,
  type?: any,
  address?: any,
  delivery?: any,
  socket?: any,
  packaging?: any,
  shipping_price?: any,
  discountPercent?: any,
) => {
  return new Promise((resolve, _) => {
    let tax = localStorage.getItem("tax");
    let username = localStorage.getItem("username");
    let name_and_fam = localStorage.getItem("user_name_and_fam");
    if (!username) username = "";
    if (!name_and_fam) name_and_fam = "";
    let print_type = localStorage.getItem("printer_behave_default");
    if (flag == 1 && type < 2) {
      print_type = "بدون پرینت";
    }
    if (socket && type >= 2)
      print_type = "پرینت مشتری و آشپز";
    console.log(print_type)
    const storageOrders = localStorage.getItem("localOrders");
    let table_list = JSON.parse(localStorage.getItem("table_list"));
    if (tableId) {
      if (typeof table_list == "object") {
        if (!(tableId in table_list)) {
          tableId = "";
        }
      } else {
        tableId = "";
      }
    }
    let offlineOrders = [];
    if (storageOrders) {
      offlineOrders = JSON.parse(storageOrders);
    }
    let filteredOrders = [];
    let raw_items = localStorage.getItem("raw_items") || "[]";
    let point_free = localStorage.getItem("point_free")
      ? parseInt(localStorage.getItem("point_free"))
      : 100;
    raw_items = JSON.parse(raw_items);
    let checkPrice = 0;
    let expensive_items_index = {};
    order.forEach((item, k) => {
      let last_price = raw_items[item.product.id]["last_price"];
      let cat_id = raw_items[item.product.id]["category_id"];
      if (cat_id == 3 && last_price > checkPrice) {
        checkPrice = last_price;
        expensive_items_index["index"] = k;
        expensive_items_index["product_id"] = item.product.id;
        expensive_items_index["name"] = item.product.name;
        expensive_items_index["qty"] = 1;
        expensive_items_index["price"] = last_price;
      }
      filteredOrders.push({
        id: item.product.id,
        qty: item.count,
        options: item.product.options,
        unique: item.product.unique,
        note: item.note,
      });
    });
    let loviuna = null;
    if (
      userPoint > point_free &&
      usePoint &&
      checkPrice > 0 &&
      expensive_items_index["index"]
    ) {
      // order[expensive_items_index["index"]].product.price = 0;
      let raw_price =
        raw_items[expensive_items_index["product_id"]]["last_price"];
      totalAmount -= raw_price;
      raw_items[expensive_items_index["product_id"]]["last_price"] = 0;
      loviuna = expensive_items_index;
    }

    let discount = 0;
    let totalAmount2 = totalAmount;
    let item_price = totalAmount;
    let price = totalAmount;
    if (service) totalAmount += parseInt(service);

    if (shipping_price) totalAmount += parseInt(shipping_price);
    if (useDiscount["id"] > 0) {
      discount = JSON.parse(localStorage.getItem("discount_list_app"));
      discount = parseInt(discount[useDiscount["id"]].discount);
      discount = Math.round(parseInt(totalAmount) * (discount / 100));
      totalAmount = parseInt(totalAmount) - discount;
    } else if (userDiscount > 0) {
      discount = userDiscount;
      discount = Math.round(parseInt(totalAmount) * (discount / 100));
      totalAmount = parseInt(totalAmount) - discount;
      totalAmount2 = totalAmount;
    }

    if (discountPercent) {
      let d = Math.round(parseInt(totalAmount) * (discountPercent / 100));
      totalAmount -= d;
      discount += d;
    }
    totalAmount2 = totalAmount;

    let taxPrice = 0;
    if (tax == "1") {
      let taxPercent = parseFloat(process.env.NEXT_PUBLIC_TAX);
      taxPrice = totalAmount2 * taxPercent;
      taxPrice = taxPrice;
      totalAmount2 += taxPrice;
      totalAmount2 = roundFinalPrice(totalAmount2);
    }
    if (tip) totalAmount2 += parseInt(tip);
    if (packaging) totalAmount2 += parseInt(packaging);
    totalAmount = formatPrice(totalAmount2);

    if (orderId != 0) {
      updateOrder(
        order,
        customer,
        totalAmount,
        orderId,
        offlineOrders,
        tableId,
        customerNote,
        filteredOrders,
        paymentTypeDefault,
        noCustomer,
        numPeople,
        useDiscount,
        discount,
        price,
        totalAmount2,
        note,
        usePoint,
        userPoint,
        service,
        payment_card,
        payment_pos,
        payment_cash,
        status,
        print_type,
        username,
        tip,
        name_and_fam,
        item_price,
        taxPrice,
        loviuna,
        address,
        delivery,
        packaging,
        shipping_price,
      );
      resolve(1);
      return;
    }
    if (!offline_id) offline_id = randomBytes(8).toString("hex");
    const factorID = getFactorID();
    let newOfflineOrder = pushOfflineOrders(
      [],
      orderId,
      offline_id,
      filteredOrders,
      customer,
      paymentTypeDefault,
      customerNote,
      noCustomer,
      numPeople,
      tableId,
      factorID,
      [],
      useDiscount
    );

    const detailOrderOffline = detailsOrderOffline(
      order,
      orderId,
      offline_id,
      factorID,
      tableId,
      customer,
      customerNote,
      [],
      useDiscount
    );
    let tables = localStorage.getItem("tables") || "[]";
    tables = JSON.parse(tables);
    if (tableId) {
      Object.keys(tables).map((salon) => {
        Object.keys(tables[salon]).map((table) => {
          if (table == tableId) {
            tables[salon][table] = [];
            return tables[salon][table].push(detailOrderOffline);
          }
        });
      });
    } else {
      let checkStatusTable = "";
      Object.keys(tables["no_table"]).map((table) => {
        if (table == orderId) {
          checkStatusTable = "add";
          return (tables["no_table"][table] = [detailOrderOffline]);
        }
      });
      if (checkStatusTable == "") {
        if (Object.keys(tables["no_table"]).length == 0) {
          tables["no_table"] = {};
          tables["no_table"][offline_id] = [detailOrderOffline];
        } else {
          tables["no_table"][offline_id] = [detailOrderOffline];
        }
      }
    }
    let cart = {};

    cart = createCart(order, cart, raw_items);
    // localStorage.setItem(
    //   `order-${orderId ? orderId : offline_id}`,
    //   JSON.stringify({
    //     detail: detailOrderOffline,
    //     items: cart
    //   })
    // );
    // localStorage.setItem("tables", JSON.stringify(tables));
    // localStorage.setItem("localOrders", JSON.stringify(offlineOrders));
    const myToken = localStorage.getItem("token");
    // setTimeout(() => {
    //   uploadOfflineOrders(myToken, 1);
    // }, 5400000)
    let itemProductNew = [];
    if (orderId != 0 && detailEditOrder) {
      let newDetailEditOrder = detailEditOrder;
      order.map((item, i) => {
        const key =
          order[i].product.id +
          "_" +
          order[i].product.options.map((o) => o.id).join(",");
        if (newDetailEditOrder["items"][key]) {
          if (item.count - newDetailEditOrder["items"][key]["qty"]) {
            itemProductNew.push({
              ...item,
              count: item.count - newDetailEditOrder["items"][key]["qty"],
            });
          }
          delete newDetailEditOrder["items"][key];
        } else {
          itemProductNew.push(item);
        }
      });
    }
    let branch_type = localStorage.getItem("branch_type");

    saveOrderOffline({
      status: status ? status : branch_type && branch_type == "1" ? 6 : 1,
      total: totalAmount2,
      discount: discount,
      price: price,
      table_id: tableId,
      offline_id: offline_id,
      order_details: JSON.stringify({
        detail: detailOrderOffline,
        items: cart,
      }),
      order_local: JSON.stringify(newOfflineOrder),
      date: getNewDate(),
      revision_num: 0,
      note: note,
      use_point: usePoint,
      user_point: userPoint,
      service: service,
      payment_card: payment_card,
      payment_pos: payment_pos,
      payment_cash: payment_cash,
      flag: flag ? flag : 0,
      online_table_id: online_table_id ? online_table_id : "",
      username: username,
      tip: tip ? tip : "",
      name_and_fam: name_and_fam,
      tax: taxPrice,
      loviuna: loviuna,
      pay_status: pay_status,
      type: type,
      address: address,
      delivery: delivery,
      packaging: packaging,
      shipping_price: shipping_price,
      discountPercent: discountPercent
    }).then((r) => {
      if (r["order"].status == 6 && warehouse) {
        saveMaterialLogs(r);
      }
      requestPrintOffline(
        itemProductNew.length ? itemProductNew : order,
        customer,
        totalAmount,
        offline_id,
        r["order"]._id,
        discount,
        tableId,
        print_type,
        null,
        null,
        note,
        numPeople,
        service,
        null,
        tip ? tip : null,
        taxPrice,
        loviuna,
        address,
        delivery,
        packaging,
        shipping_price,
        type
      );
      resolve(1);
    });
  });
};

export const uploadOfflineOrders = (
  token?: string,
  indexItem?: any,
  warehouse?: any
) => {
  return new Promise((resolve, reject) => {
    let time = 60000;
    let iterval = localStorage.getItem("iterval");
    if (iterval) {
      time = parseInt(iterval);
    }
    if (warehouse) {
      sendMatrial();
      sendLogs();
    }
    saveBranchs(token);
    const interval_id = window.setInterval(function () {
      if (warehouse) sendLogs();
      saveBranchs(token, indexItem).then((res) => {
        resolve(res);
      });
    }, time);
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
    // Clear any timeout/interval up to that id
  });
};
export const saveBranchs = (token?: string, indexItem = 0) => {
  return new Promise((resolve, reject) => {
    let username = localStorage.getItem('username');
    saveBranch({ id: username }).then((res) => {
      if (!res["order"] || !res["order"].token) {
        localStorage.removeItem("token");
        Router.push("/login");
      }
      findOrder({
        status: 6,
        just_status: 6,
        limit: 1,
        skip: 0,
        sort: 1,
      }, 1).then((order) => {
        if (order["order"]) {
          var data = {
            'token': res["order"].token,
            'order': order["order"]
          };
          var config: AxiosRequestConfig = {
            method: "post",
            url: "/submit-order",
            data: data,
          };

          axios(config)
            .then(function (response) {
              if (!response || !response.data) {
                resolve(true);
                return;
              }
              if (!response.data.offline_id) {
                resolve(true);
                return;
              }

              saveOrderOffline({
                id: response.data.offline_id,
                status: 20,
              });
              //TODO: check if all offline bills submitted
              resolve(true);
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        } else {
          resolve(true);
        }
      });
    });
  });
};
export const saveRawItems = () => {
  return new Promise((resolve, reject) => {
    getRawItems().then((res) => {
      if (res) {
        localStorage.setItem("raw_items", JSON.stringify(res));
        resolve(true);
      }
    });
  });
  // if (!localStorage.getItem("raw_items"))
};

export const saveMaterialLogs = (order) => {
  order = order['order'];
  if (order['_id']) {
    let details = order["details"];
    let cart = details["cart"];
    if ((cart || []).length) {
      let qtyData = {};
      let sendData;
      cart.map((item) => {
        sendData = new Promise((resolve, reject) => {
          request({ _id: 1 }, "/api/find2?model=Material&one=1").then((m) => {
            let data = m["data"][item.id];
            console.log(item.id)
            if (data) {
              Object.keys(data).map((obj) => {
                let qty = parseFloat(data[obj]) * item.qty;
                qty = Math.round(qty * 1000) / 1000;
                if (qtyData[obj]) qtyData[obj] += qty;
                else qtyData[obj] = qty;
                qtyData[obj] = Math.round(qtyData[obj] * 1000) / 1000;
                // saveMaterialLog({ _id: obj, qty: qty, id: obj });
              });
            }
            item["options"].map((op) => {
              let data = m["data"][op.id];
              if (data) {
                Object.keys(data).map((obj) => {
                  let qty = parseFloat(data[obj]) * item.qty;
                  qty = Math.round(qty * 1000) / 1000;
                  if (qtyData[obj]) qtyData[obj] += qty;
                  else qtyData[obj] = qty;
                  qtyData[obj] = Math.round(qtyData[obj] * 1000) / 1000;
                  // saveMaterialLog({ _id: obj, qty: qty, id: obj });
                });
              }
            });
            resolve(qtyData);
          });
        });
      });
      console.log(sendData)
      sendData.then((send) => {
        console.log("final", send);
        saveMaterialLog({ data: send });
      });
    }
  }
};
export const sendMatrial = () => {
  return new Promise((resolve, reject) => {
    request({}, "/api/find2?model=MaterialLog").then((res) => {
      if (res) {
        var data = new FormData();
        data.append("data", JSON.stringify(res));
        data.append("token", localStorage.getItem("token"));

        var config: AxiosRequestConfig = {
          method: "post",
          url: "/sync-qty",
          data: data,
        };

        axios(config)
          .then(function (response) {
            if ((response.data[0] || []).length) {
              response.data[0].map((item) => {
                saveMaterialLog({ _id: item, remove: true });
              });
              resolve(res);
            }
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      }
    });
  });
};
export const sendLogs = () => {
  return new Promise((resolve, reject) => {
    request({ status: 0 }, "/api/find2?model=Log&one=1").then((res) => {
      if (res) {
        var data = new FormData();
        data.append("id", res["_id"]);
        data.append("item_id", res["item_id"]);
        data.append("qty", res["qty"]);
        data.append("info", res["info"]);
        data.append("token", localStorage.getItem("token"));

        var config: AxiosRequestConfig = {
          method: "post",
          url: apiUrl[1] + "/save_single_ingredient_log",
          data: data,
        };

        axios(config)
          .then(function (response) {
            if (response.data["status"]) {
              saveLog({ id: res["_id"], status: 1 });
              resolve(res);
            }
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      }
    });
  });
};

export const changeStatus = async (offline_id, item_id, status) => {
  let res = await findOrder({
    offline_id: offline_id
  }, 1);
  let local = JSON.parse(res['order'].order_local)
  console.log(local)
  return true;
}

// ------ new code-------

