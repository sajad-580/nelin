import React, { useState } from "react";
import { Alert, Button, Form, Input, Modal } from "antd";
import AntdSelect from "./AntdSelect";
import { parseInputValue } from "helpers/format";
import { saveLog } from "services/table";
import { useRouter } from "next/router";
const { Item, useForm } = Form;
const SaveLog = ({ open, setOpen, items }) => {
  const router = useRouter();
  const [form] = useForm();
  const close = () => {
    setOpen(false);
    form.resetFields();
  };
  const onFinish = async (values) => {
    values["status"] = 0;
    let res = await saveLog(values);
    if (res["success"]) {
      close();
      router.push("/materials");
    }
  };
  return (
    <>
      <Modal
        title="ثبت ورود خروج انبار"
        centered
        open={open}
        onCancel={close}
        width={1000}
        footer={
          <div className="ant-modal-footer">
            <Button onClick={close}>
              <span>بستن</span>
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              <span>ثبت</span>
            </Button>
          </div>
        }
      >
        <Form form={form} layout={"vertical"} onFinish={onFinish}>
          <Item name={"item_name"} initialValue="" hidden></Item>
          <Item
            label="آیتم"
            name={"item_id"}
            rules={[{ required: true, message: "آیتم را انتخاب کنید" }]}
          >
            <AntdSelect
              options={items}
              placeholder="انتخاب کنید"
              onChange={(e, v) => {
                form.setFieldValue("item_name", v?.label ?? "");
              }}
            />
          </Item>
          <Alert
            type="success"
            message={`جهت راحتی کار شما ثبت تعداد ورود٫ خروج کیک ها را به اسلایس بزنید برای مثال جهت خروج عدد -4 چهار اسلایس را در صورت خرابی از انبار شما خارج میکند و اگر منفی نگذارید به انبار اضافه میکند برای خروج ابتدا علامت منفی سپس عدد را وارد کنید بدون فاصله دقیقا مانند نمونه بالا`}
            className="mb-3"
          />
          <Item
            label="تعداد ورود یا خروج انبار شعبه"
            name={"qty"}
            rules={[{ required: true, message: "تعداد را وارد کنید" }]}
            normalize={(e) => parseInputValue(e, true)}
          >
            <Input placeholder="تعداد را وارد کنید" />
          </Item>
          <Item
            label="توضیح"
            name={"info"}
            rules={[{ required: true, message: "توضیح را وارد کنید" }]}
          >
            <Input.TextArea rows={4} placeholder="توضیح را وارد کنید" />
          </Item>
        </Form>
      </Modal>
    </>
  );
};

export default SaveLog;
