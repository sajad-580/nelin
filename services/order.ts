import axios, { AxiosRequestConfig } from "axios";
import { requestPrint } from "helpers/printer";
import ICustomer from "interfaces/customer";
import { IPrintOrder } from "interfaces/print-order";
import { toast } from "react-toastify";
import io from "socket.io-client";

import { sendPrint, submitOrder } from "helpers/helper";
import { getBranchId, getNewDate, request } from "util/util";
import basUrl from "../baseU.js";
import { response } from "express";

export const getCustomer = (
  token: string,
  query: string
): Promise<object[]> => {
  return new Promise((resolve, reject) => {
    var data = new FormData();

    data.append("token", token);

    var config: AxiosRequestConfig = {
      method: "post",
      url: `/check-user?q=${query}`,
      data: data,
    };

    axios(config)
      .then(function (response) {
        resolve(response.data["results"]);
      })
      .catch(function (error) {
        console.log(error)
        reject();
      });
  });
};

export const submitOrderOffline = (
  order: any,
  customer: ICustomer,
  totalAmount: string,
  printers,
  offline_id: string,
  custom_print_valuet: any,
  raw_items: any,
  table_id?: any,
  factorID?: any,
  discount?: any,
  print_type?: any,
  p_bill?: any,
  p_bar?: any,
  phone?: any,
  note?: any,
  numPeople?: any,
  borderSize?: any,
  fontSize?: any,
  pageWidth?: any,
  service?: any,
  reprint?: any,
  tip?: any,
  taxPrice?: any,
  loviuna?: any,
  address?: any,
  delivery?: any,
  packaging?: any,
  shipping_price?: any,
  type?: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "submit-order",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        order,
        customer,
        totalAmount,
        printers,
        offline_id,
        custom_print_valuet,
        raw_items,
        table_id,
        factorID,
        discount,
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
      }),
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};
export const saveOrderOffline = (req): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "api/create",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(req),
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};
export const findOrder = (req, one?): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "api/find" + (one == 1 ? "?one=1" : ""),
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(req),
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};
export const saveBranch = (req): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "api/branch",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(req),
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};

export const submitOrder22 = (
  order: any,
  token: string,
  customer: ICustomer,
  note: string,
  tableId: string,
  orderTypeDefault: string,
  paymentTypeDefault: string,
  usePoint,
  useDiscount,
  customerNote: string,
  noCustomer: Boolean,
  orderId,
  numPeople
) => {
  return new Promise((resolve, reject) => {
    let cart = [];
    order.forEach((item) => {
      cart.push({
        id: item.product.id,
        options: item.product.options,
        qty: item.count,
        note: item.note,
      });
    });
    let finalOrder = {
      cart,
      user_id: customer.id === 0 ? customer.name : customer.id,
    };

    var data = new FormData();
    data.append("token", token);
    data.append("cart", JSON.stringify(finalOrder));
    data.append("note", note);
    data.append("table_id", tableId);
    data.append("order_type_default", orderTypeDefault);
    data.append("payment_type", paymentTypeDefault);
    data.append("usePoint", usePoint);
    data.append("useDiscount", useDiscount.id);
    data.append("customer_note", customerNote);
    data.append("noCustomer", noCustomer.toString());
    data.append("order_id", orderId == 0 ? "" : orderId);
    data.append("numPeople", numPeople ? numPeople : "");

    var config: AxiosRequestConfig = {
      method: "post",
      url: "/submit-order",
      data: data,
    };

    axios(config)
      .then(function (response) {
        const printers = response.data.print_list;

        const printerBehave = localStorage.getItem("printer_behave_default");
        if (response.data.msg) {
          // alert(response.data.msg)
          toast.error(response.data.msg, {
            position: "bottom-right",
            style: { direction: "rtl", fontFamily: "IRANSansX" },
            theme: "colored",
          });
        }

        let printersArr = [];

        console.log(printers);

        if (!printers) return reject();

        Object.keys(printers).forEach((node) => {
          let printer = localStorage.getItem(node);
          let printerNode = printers[node];

          // Management of individual printers
          const custom_print_valuet = JSON.parse(
            localStorage.getItem("custom_print_valuet") || "[]"
          );
          const raw_items = JSON.parse(localStorage.getItem("raw_items"));
          if (custom_print_valuet[node] && custom_print_valuet[node].cat) {
            let PO = [];
            order.map((item, i) => {
              if (
                custom_print_valuet[node].cat.includes(
                  raw_items[item.product.id].category_id.toString()
                )
              ) {
                PO.push(i);
              }
            });
            if (PO.length == 0) {
              return;
            }
          }

          if (!printer) {
            // router.push('/printers')
          } else {
            //print behave
            if (printerBehave == "بدون پرینت") {
            }
            if (printerBehave == "پرینت آشپز") {
              if (printerNode.type == "bar_all") {
                printersArr.push({
                  id: node,
                  name: printer,
                  page: printerNode.path,
                });
              }
            }
            if (printerBehave == "پرینت مشتری و آشپز`") {
              printersArr.push({
                id: node,
                name: printer,
                page: printerNode.path,
              });
            }
          }
        });

        if (printerBehave != "بدون پرینت" && printersArr.length) {
          const printOrder: IPrintOrder = {
            printers: printersArr,
            orderId: response.data.order_id,
            billUrl: printersArr[0].page,
            totalItems: response.data.item.length,
          };
          requestPrint(printOrder)
            .then((resp) => {
              resolve(resp);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          resolve("ok");
        }
      })
      .catch(function (error) {
        console.log("catch");
        reject();
      });
  });
};

export const saveBill5 = (
  printer_id: string,
  pinter_name: string,
  pdf_url: string,
  status: string,
  orderId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "print1",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        printer_id,
        pinter_name,
        pdf_url,
        status,
        orderId,
      }),
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};

export const getTableList = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client_id = localStorage.getItem("user_client_id");
    const token = localStorage.getItem("token");

    var data = new FormData();
    data.append("token", token);
    data.append("client_id", client_id);

    const config: AxiosRequestConfig = {
      method: "post",
      url: "/table?offline=1",
      data,
    };

    axios(config)
      .then(function ({ data }) {
        resolve(data.table_list);
      })
      .catch((error) => reject(error));
  });
};

export const getOnlineOrderData = (order_id): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client_id = localStorage.getItem("user_client_id");
    const token = localStorage.getItem("token");

    var data = new FormData();
    data.append("token", token);
    data.append("client_id", client_id);
    data.append("order_id", order_id);

    const config: AxiosRequestConfig = {
      method: "post",
      url: "/get-order-data",
      data,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};

export const createOrderData = (order) => {
  let raw_items = localStorage.getItem("raw_items") || "[]";
  raw_items = JSON.parse(raw_items);

  let newOrder = [];
  Object.keys(order["items"]).map((item) => {
    let id_item = item.split("_")[0];
    let options = [];
    if (order["items"][item]["options"] != null) {
      const opts = JSON.parse(order["items"][item]["options"] || "[]");
      for (const opt of opts) {
        options.push({
          id: opt,
          name: raw_items[opt]["name"],
          price: raw_items[opt]["last_price"],
          image: "",
        });
      }
    }
    newOrder = [
      ...newOrder,
      {
        product: {
          name: `${options.length
            ? `${raw_items[id_item].name}(${options
              .map((opt) => opt.name)
              .join("-")})`
            : raw_items[id_item].name
            }`,
          baseName: raw_items[id_item].name,
          id: Number(id_item),
          price:
            (options.length
              ? options
                .map((i) => i.price)
                .reduce((accumulator, curr) => accumulator + curr) +
              raw_items[id_item].last_price
              : raw_items[id_item].last_price) * 1000,
          options: options,
          unique: `${id_item}-${options.length
            ? `${raw_items[id_item].name}(${options
              .map((opt) => opt.name)
              .join("-")})`
            : raw_items[id_item].name
            }`,
        },
        count: order["items"][item]["qty"],
        note: order["items"][item]["note"] ? order["items"][item]["note"] : "",
      },
    ];
  });
  return newOrder;
};

export const setOrderStatus = (order_id, status): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client_id = localStorage.getItem("user_client_id");
    const token = localStorage.getItem("token");

    var data = new FormData();
    data.append("token", token);
    data.append("client_id", client_id);
    data.append("order_id", order_id);
    data.append("status", status);

    const config: AxiosRequestConfig = {
      method: "post",
      url: "/set-order-status",
      data,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};
export const removeOrder = (order_id): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client_id = localStorage.getItem("user_client_id");
    const token = localStorage.getItem("token");

    var data = new FormData();
    data.append("token", token);
    data.append("client_id", client_id);
    data.append("order_id", order_id);

    const config: AxiosRequestConfig = {
      method: "post",
      url: "/remove-order",
      data,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};
export const printAllOrders = (
  orders,
  pageWidth,
  startDate,
  endDate,
  borderSize,
  fontSize,
  totalAmount,
  printers
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "print-all-order",
      // url: "api/test",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        orders,
        pageWidth,
        startDate,
        endDate,
        borderSize,
        fontSize,
        totalAmount,
        printers,
      }),
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};

export const saveUserAddress = (customer, token, credit_balance?): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client_id = localStorage.getItem("user_client_id");

    const config: AxiosRequestConfig = {
      method: "post",
      url: "/update-user-address",
      data: {
        token: getBranchId(token),
        client_id: client_id,
        customer: customer,
        credit_balance: credit_balance,
      },
    };

    axios(config)
      .then(function ({ data }) {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
};
export const checkSendAll = (cart, sendItem, sendService) => {
  let checkedCount = 0;
  for (const key in sendItem)
    if (sendItem[key])
      checkedCount++;


  if (cart?.length == checkedCount && sendService)
    return true;

  return false
}

export const socketConnection = (socket, router) => {
  const playBellSound = async (order_id) => {
    const bellSound = new Audio("/audio/notif.mp3");
    bellSound.loop = true;
    let play = bellSound.play();
    let id = toast.success(order_id, {
      autoClose: false,
      hideProgressBar: true,
      position: "bottom-right",
      style: { direction: "rtl", fontFamily: "IRANSansX" },
      onClose: () => {
        bellSound.pause();
      },
    });
  };



  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("connect", () => {
    console.log("user connect");

    if (typeof window !== "undefined") {
      let client_id = localStorage.getItem("user_client_id");
      if (client_id === null) {
        console.log("user client_id is Null");
      } else {
        socket.emit("joinRoom", client_id);
      }
    }
  });
  socket.on("disconnect", function () {
    console.log("user disconnect");
  });
  socket.off("joinRoom");
  socket.on("joinRoom", (roomInfo) => {
    console.log("joinRoom: " + roomInfo);
  });

  socket.off("receiveOrder");
  socket.on("receiveOrder", (order_id) => {
    findOrder({ offline_id: order_id }, 1).then((o) => {
      if (o["order"]) return;
      createOrder(order_id[0], 0).then((res) => {
        if (!res) return true;
        playBellSound(order_id[1]);
        if (router.asPath == "/tables") {
          console.log("redirect");
          router.push("/");
          router.push(router.asPath);
          socket.emit('sendTable', [2, 3, 4]);
        }
      });
    });
  });
  socket.off("receiveOrderUpdate");
  socket.on("receiveOrderUpdate", (order_id) => {
    findOrder({ offline_id: order_id[0] }, 1).then((o) => {
      let values = o['order'];
      values['details']['pay_status'] = 1;
      values['id'] = values['offline_id'];
      delete values['_id'];
      delete values['offline_id'];
      delete values['__v'];
      values['status'] = 7;
      values['details']['status'] = 7;
      submitOrder(values);
      router.push(router.asPath);
    })
    // createOrder(order_id[0], 1).then((res) => {
    //   if (!res) return true;
    //   playBellSound(order_id[1]);
    //   if (router.asPath == "/tables") {
    //     console.log("redirect");
    //     router.push("/");
    //     router.push(router.asPath);
    //   }
    // });
  });
  socket.off("showMsg");
  socket.on("showMsg", (message) => {
    playBellSound(message[0]);
  });

  socket.off("receiveTable");
  socket.on("receiveTable", (message) => {
    if (router.asPath == "/tables")
      router.push(router.asPath)
  });
  // socket.off('showMsg');
  // socket.on('showMsg', (message) => {
  //   console.log('msg')
  //   toast.success(message[0], {
  //     autoClose: false,
  //     hideProgressBar: true,
  //     position: 'bottom-right',
  //     style: { direction: 'rtl', fontFamily: 'IRANSansX' }
  //   });
  // })
};
const sendOrderSave = async (id) => {
  try {
    let res = await request(`/saved-order?id=${id}`, 'get', null, true);
  } catch (error) {

  }
}
const createOrder = (order_id, update) => {
  return new Promise((resolve, _) => {
    getOnlineOrderData(order_id).then((res) => {
      let response = res['data'];
      if (!response.offline_id) {
        resolve(false);
        return true;
      }
      let tableId = response.table_id;
      let note = '';
      if (tableId && update != 1) {
        findOrder(
          {
            status: 6,
            table_id: tableId,
          },
          1
        ).then((find) => {
          let online_table_id = "";
          if (find["order"]) {
            note += ` شماره میز : ${find["order"]['details']['table_name']}`;
            response['online_table_id'] = tableId;
            response['details']['online_table_id'] = tableId;
            tableId = "";
            response['details']['note'] = note;
          }
          response['table_id'] = tableId;
          submitOrder(response).then((_res) => {
            if (_res) {
              sendOrderSave(response['offline_id']);
              _res['details']['_id'] = _res['_id'];
              sendPrint({
                order: _res['details'],
                isUpdate: false,
              });
              resolve(true)
            }
          });

        });
      } else {
        submitOrder(response).then((_res) => {
          if (_res) {
            sendOrderSave(response['offline_id'])
            _res['details']['_id'] = _res['_id'];
            sendPrint({
              order: _res['details'],
              isUpdate: false
            });
            resolve(true)
          }
        })
      }
    });
  });
};
export const checkSendOrderUpdate = (order) => {
  let sendItem = order['sendItem'];
  if (sendItem) {
    for (const item of order) {
      if (item.old_qty != item.count)
        sendItem[item['product']['unique']] = false;
    }
  }
  // let sendAll = checkSendAll(values['cart'], sendItem, updateData['sendService'])
}
export const checkCartCount = async (order, userData) => {
  let _newCart = [...order['cart']];
  let oldOrder = await findOrder({ offline_id: order['offline_id'] }, 1);
  oldOrder = oldOrder['order']['details']['cart'];
  let oldCartData = {};
  for (const item of oldOrder) {
    item['date'] = getNewDate();
    item['update_by'] = userData['user_name_and_fam'];
    oldCartData[item['uniq_id']] = item;
  }
  let newCart = [];
  let newCartArr = {};
  for (const v of _newCart) {
    newCartArr[v['uniq_id']] = v;
    if (oldCartData[v['uniq_id']])
      v['old_qty'] = oldCartData[v['uniq_id']]['qty'];
    else
      v['old_qty'] = v['qty']['qty'];
    v['date'] = getNewDate();
    v['update_by'] = userData['user_name_and_fam'];
    newCart.push(v)
  }
  for (const o in oldCartData) {
    if (newCartArr[o]) continue;
    oldCartData[o]['remove'] = 1;
    newCart.push(oldCartData[o])
  }
  return [newCart, Object.values(oldCartData)];
}
