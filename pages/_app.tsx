import Head from "next/head";

import apiUrl from 'apiUrl';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import PageTitle from 'components/shared/PageTitle';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import "styles/globals.scss";

import 'styles/globals.css';
import { ProductsStateContext } from "components/Products";
import { ConfigProvider, Layout } from "antd";
import HeaderComponent from "components/Header";
import { request, sendAlert } from "util/util";
const { Header, Content } = Layout;
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { saveRawItems, uploadOfflineOrders } from "helpers/offline";
import { getMaterial, getRawItems } from "services/table";
import { socketConnection } from "services/order";
import { CartProvider } from "components/CartProvider";
import { getMenu, getTables } from "helpers/helper";
import { io } from "socket.io-client";

var CronJob = require("cron").CronJob;
const socket = io(process.env.NEXT_PUBLIC_SOCKET, {
  reconnectionDelayMax: 10000,
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [token, setToken] = useState<string>(null);
  const [detailEditOrder, setDetailEditOrder] = useState({});
  const [tableId, setTableId] = useState("");
  const [repeatPrinting, setRepeatPrinting] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [warehouse, setWarehouse] = useState<boolean>(true);
  const [tax, setTax] = useState(0);
  const [audio, setAudio] = useState(false);
  const [userData, setUserData] = useState({});
  const [runSocket, setRunSocket] = useState(false);
  const [seconds, setSeconds] = useState(0)
  const [tables, setTables] = useState<[]>([]);
  const [discountList, setDiscountList] = useState<[]>([]);
  const [activeKey, setActiveKey] = useState('');
  const [selectedTable, setSelectedTable] = useState({});
  const [userAccess, setUserAccess] = useState({});

  const handleStatus = (error) => {
    if (error?.response?.data?.message)
      sendAlert(false, error.response.data.message);
  };
  const axiosConfig = () => {
    axios.defaults.baseURL = apiUrl[1];
    axios.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        handleStatus(error);
        return Promise.reject(error);
      }
    );
    axios.interceptors.response.use(
      function (response) {
        if (response.data.message)
          sendAlert(response.data.success, response.data.message);
        return response;
      },
      function (error) {
        handleStatus(error);
        return Promise.reject(error);
      }
    );
  };



  const playBellSound = async () => {
    console.log('asdasdasda')
    const audioElement = document.getElementById('audio-element') as HTMLAudioElement;
    if (audioElement)
      audioElement.play()
        .then(() => {
          console.log('Audio playback initiated.');
          setAudio(true)
        })
        .catch(error => {
          console.error('Audio playback error:', error);
          setAudio(true)
        });


  };

  const interval = () => {
    const interval_id = setInterval(() => {
      setSeconds(seconds + 1);
      clearInterval(interval_id);
    }, 100);
  };

  useEffect(() => {
    axiosConfig()
    let username = localStorage.getItem('username');
    if (!username)
      logout();
    else {
      request('/api/branch', 'POST', { id: username }).then((res) => {
        let w =
          res["order"] && res["order"].warehouse && res["order"].warehouse == 1
            ? true
            : false;
        setWarehouse(w);
        if (!(!res["order"] || !res["order"].cronjob)) {
          var job = new CronJob(
            "0 " + res["order"].cronjob + " * * * *",
            function () {
              uploadOfflineOrders(null, null, w);
            },
            null,
            true,
            "Asia/Tehran"
          );
        }
      });
    }

    var job2 = new CronJob(
      "0 0 12 * * *",
      function () {
        console.log('test')
        saveRawItems();
        if (warehouse) getMaterial(1);
      },
      null,
      true,
      "Asia/Tehran"
    );
    var job3 = new CronJob(
      "0 0 * * * *",
      function () {
        console.log('1 hours')
        getMenu(token).then((res) => {
          setTimeout(() => {
            getRawItems();
          }, 500)
        });
      },
      null,
      true,
      "Asia/Tehran"
    );

    if (warehouse) getMaterial();

  }, []);


  useEffect(() => {
    if (router.pathname === "/login") return;
    if (!runSocket) {
      socketConnection(socket, router);
      setRunSocket(true);
      console.log('runSocket')
    }
    let username = localStorage.getItem('username');
    if (!username)
      logout();
    else
      request('/api/branch', 'POST', { id: username }).then((res) => {
        let w =
          res["order"] && res["order"].warehouse && res["order"].warehouse == 1
            ? true
            : false;
        setWarehouse(w);
        if (!res["order"] || !res["order"].cronjob) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          let data = res['order']['userData']
          setToken(res['order']['token']);
          setUserData(data);
          setTax(Number(data['tax']))
          setDiscountList(data['discount_list_app'] ? data['discount_list_app'] : []);
          setUserAccess(data['access'])
        }
      });
    if (token) getTable()
  }, [router, token]);
  const getTable = async () => {
    let data: any = await request('/api/table', 'POST', {
      find: 1,
    });
    if (!data?.length) {
      data = await getTables(token);
    }
    setTables(data);
    return data;
  }
  const logout = async () => {
    try {
      let username = localStorage.getItem('username');
      let res = await request('/api/branch', 'POST', { delete: username });
      if (res['acknowledged']) {
        setToken(null);
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("factor_text");
        router.push("/login");
      } else {
        setToken(null);
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("factor_text");
        router.push("/login");
      }
    } catch (error) {

    }
  }
  return (
    <ProductsStateContext.Provider
      value={{
        token,
        setToken,
        detailEditOrder,
        setDetailEditOrder,
        tableId,
        setTableId,
        repeatPrinting,
        setRepeatPrinting,
        loader,
        setLoader,
        warehouse,
        tax,
        setTax,
        userData,
        setUserData,
        logout,
        interval,
        tables,
        setTables,
        discountList,
        setDiscountList,
        activeKey,
        setActiveKey,
        selectedTable,
        setSelectedTable,
        userAccess,
        setUserAccess,
        getTable,
        socket
      }}
    >
      <ConfigProvider direction="rtl" theme={{
        token: {
          colorPrimary: "#050F59",

        },
      }}>
        <CartProvider>
          <PageTitle />
          <Layout>
            <Header style={{ backgroundColor: '#FAF7F6 ', height: 'auto', padding: 0 }}>
              <HeaderComponent />
            </Header>
            <Content className="pt-3" style={{
              minHeight: '100vh'
            }}>
              {!audio && router.pathname !== '/login' ?
                <div className="mt-40 text-center">
                  <button onClick={() => {
                    playBellSound()
                    setTimeout(() => {
                      socket.emit('sendTable', [2, 3, 4]);
                    }, 1000)
                  }} className="btn btn-success">فعال کردن وقایع پشت صحنه </button>
                  <audio id="audio-element">
                    <source src="/audio/notif.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                :
                <Component {...pageProps} />

              }
            </Content>
          </Layout>
          <ToastContainer />

        </CartProvider>
      </ConfigProvider>
    </ProductsStateContext.Provider>
  );
}
