import { findOrder, saveOrderOffline } from "./order";
import axios, { AxiosRequestConfig } from "axios";
import basUrl from "../baseU.js";
import apiUrl from "apiUrl";
import { ToastOptions, toast } from "react-toastify";
const status_text = {
  0: "معلق",
  1: " باز ",
  2: "ویرایش ",
  3: "کنسل ",
  4: " چاپ شده ",
  5: "پرداخت  و مانده",
  6: "پرداخت  و رفته",
  7: "DIGI JET",
  10: "refund",
};
export const getTable = () => {
  return new Promise((resolve, reject) => {
    const brancId = localStorage.getItem("user_client_id");
    const url = `${apiUrl[0]}/in-branch-order/table?branch_id=${brancId}&offline=1`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getTable2 = () => {
  return new Promise((resolve, reject) => {
    const brancId = localStorage.getItem("user_client_id");
    const url = `${apiUrl[0]}/in-branch-order/table_offline?branch_id=${brancId}`;
    axios
      .get(url)
      .then((res) => {
        if (res) resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getDetail = (id) => {
  return new Promise((resolve, reject) => {
    const url = `${apiUrl[0]}/in-branch-order/table_detail2?order_id=${id}`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getRawItems = () => {
  return new Promise((resolve, reject) => {
    let token = localStorage.getItem("token");
    let id = "";
    if (token) id = token.split("%")[1];
    const url = `${apiUrl[0]}/in-branch-order/raw_items?id=${id}`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const changeStatus = (order_id, st_id) => {
  return new Promise((resolve, reject) => {
    const url = `${apiUrl[0]}/in-branch-order/table_change_st?order_id=${order_id}&st_id=${st_id}`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const changeTable = async (tbl1, tbl2) => {
  try {
    let order = await findOrder({
      offline_id: tbl1['offline_id'],
    }, 1);
    order = order['order'];
    if (order) {
      order['details']['table_id'] = tbl2['table_id'];
      order['details']['table_name'] = tbl2['table_name'];
      let res = await saveOrderOffline({
        id: order['offline_id'],
        table_id: tbl2['table_id'],
        details: order['details']
      })
      if (res["order"]) {
        let data = res["order"]['details'];
        return data;
      }
    }

  } catch (error) {
    console.log(error)
  }
};

export const requestRepeatPrint = (order_id) => {
  return new Promise((resolve, reject) => {
    const url = `${apiUrl[0]}/in-branch-order/table_print_all?order_id=${order_id}`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const requestPrintTablet = (order_id) => {
  return new Promise((resolve, reject) => {
    const url = `${apiUrl[0]}/in-branch-order/table_print_tablet?order_id=${order_id}`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getPrintLocal = (page, order_id, printer) => {
  return new Promise((resolve, reject) => {
    const url = `${basUrl}/printLocal?page=${page}&order_id=${order_id}&printer=${printer}`;
    axios
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const setQuery = (type, order_id, table_id, st_id) => {
  // set query for server
  let queryList: any = localStorage.getItem("queryList");
  if (!queryList) {
    localStorage.setItem("queryList", "[]");
    queryList = localStorage.getItem("queryList");
  }
  queryList = JSON.parse(queryList);
  const newQuery = {
    type,
    order_id: order_id || "",
    table_id: table_id || "",
    st_id: st_id || "",
    date: Date.now(),
  };
  queryList.push(newQuery);
  localStorage.setItem("queryList", JSON.stringify(queryList));
  setTimeout(() => {
    queryList = localStorage.getItem("queryList") || "[]";
    queryList = JSON.parse(queryList);
    if (type == "setStatus") {
      changeStatus(order_id, st_id);
      queryList = queryList.filter(
        (item) => item.order_id != order_id && item.st_id != st_id
      );
    } else if (type == "changeTable") {
      changeTable(order_id, table_id);
      queryList = queryList.filter(
        (item) => item.order_id != order_id && item.table_id != table_id
      );
    }
    localStorage.setItem("queryList", JSON.stringify(queryList));
  }, 5400000);
};

export const printChangeTable = (prewTable, nextTable, phone?: any) => {
  const printer = localStorage.getItem("p2") || "";
  if (!printer) return;
  const url = `${basUrl}/printChangeTable?prewTable=${prewTable}&nextTable=${nextTable}&printer=${printer}&phone=${phone}`;
  axios
    .get(url)
    .then((res) => {
      return;
    })
    .catch((err) => {
      return;
    });
};
export const getMaterial = (update?: any) => {
  return new Promise((resolve, reject) => {
    if (update == 1) {
      getAndSaveMaterial().then((r) => {
        resolve(r);
      });
    } else {
      request({ _id: 1 }, "/api/find2?model=Material").then((res) => {
        if (!res.length) {
          getAndSaveMaterial().then((r) => {
            resolve(r);
          });
        }
      });
    }
  });
};
export const getAndSaveMaterial = () => {
  return new Promise((resolve, reject) => {
    const url = `${apiUrl[0]}/in-branch-item/qty-detail`;
    axios
      .get(url)
      .then((res) => {
        if (res.data) {
          resolve(res.data);
          saveMaterial({ data: res.data });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const saveMaterial = (req): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "api/material",
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
export const saveMaterialLog = (req): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "api/material_log",
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
export const saveLog = (req): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: "api/saveLog",
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
export const request = (req, url): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "post",
      baseURL: basUrl,
      url: url,
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
export const request2 = (url: any, method?: any, data?: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: method,
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
};
export const sendAlert = (status, msg) => {
  let op: ToastOptions = {
    hideProgressBar: true,
    position: "bottom-right",
    style: {
      direction: "rtl",
      fontFamily: "IRANSansX",
    },
  };
  if (status)
    toast.success(msg, op);
  else
    toast.error(msg, op);
}
