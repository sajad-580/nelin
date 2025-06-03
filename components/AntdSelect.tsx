import React from "react";
import { Empty, Select, SelectProps } from "antd";
import { CloseOutlined } from "@ant-design/icons";

export default function AntdSelect(props: any) {
  return (
    <Select
      {...props}
      {
      ...props.onChange2 ? {
        onChange(value, option) {
          props.onChange(value)
          props.onChange2(option)
        },
      } : {}
      }
      showSearch
      optionFilterProp="children"
      notFoundContent={<Empty description="موردی یافت نشد" />}
      filterOption={(input, option) => (option?.label ?? "").toString().includes(input)}
      filterSort={(optionA, optionB) =>
        (optionA?.label ?? "").toString()
          .toLowerCase()
          .localeCompare((optionB?.label ?? "").toString().toLowerCase())
      }
    />
  );
}
