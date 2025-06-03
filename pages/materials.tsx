import React, { useEffect, useState } from "react";
import { Button, ConfigProvider, Space, Table, Tag } from "antd";
import Pagination2 from "components/Pagination2";
import { request } from "services/table";
import { useRouter } from "next/router";
import SaveLog from "components/SaveLog";
import { useProductContext } from "components/Products";

const { Column } = Table;

const materials: React.FC = () => {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { warehouse } = useProductContext();
  const getItems = async () => {
    let res = await request({}, "/api/find2?model=Material");
    if (res?.length) {
      if (res[0]["data"] && res[0]["data"]["name"]) {
        let r = res[0]["data"]["name"];
        let arr = [];
        for (const key in r) {
          arr.push({
            label: r[key],
            value: key,
          });
        }
        setItems(arr);
      }
    }
  };
  const getData = async (p = 1) => {
    let limit = 20;
    let skip = (p - 1) * limit;
    let res = await request(
      {
        limit: limit,
        skip: skip,
        sort: -1,
      },
      "/api/find2?model=Log"
    );
    if (res?.length) {
      let count = await request(
        {
          count: 1,
        },
        "/api/find2?model=Log"
      );
      if (count) {
        let _pages =
          parseInt(count) > 0 ? Math.ceil(parseInt(count) / limit) : 0;
        setPages(_pages);
      }
      let d = [];
      let i = 0;
      for (const item of res) {
        d.push({
          key: i++,
          item: item["item_name"],
          qty: item["qty"],
          info: item["info"],
          status: item["status"] != 1 ? "در انتظار ارسال به سرور" : "ارسال شده",
        });
      }
      setData(d);
    }
  };
  useEffect(() => {
    getItems();
    getData(page);
  }, [router]);

  return (
    <section className="h-screen pt-32 pb-10">
      <ConfigProvider direction="rtl">
        {warehouse ? (
          <Button type="primary" onClick={() => setShow(true)}>
            ثبت ورود خروج انبار
          </Button>
        ) : (
          ""
        )}
        <Table dataSource={data} pagination={false}>
          <Column title="آیتم" dataIndex="item" key="item" />
          <Column title="تعداد" dataIndex="qty" key="qty" />
          <Column title="وضعیت" dataIndex="status" key="status" />
          <Column title="توضیح" dataIndex="info" key="info" />
        </Table>
        <Pagination2
          all={pages}
          page={page}
          setPage={setPage}
          getData={getData}
        />
        <SaveLog open={show} setOpen={setShow} items={items} />
      </ConfigProvider>
    </section>
  );
};

export default materials;
