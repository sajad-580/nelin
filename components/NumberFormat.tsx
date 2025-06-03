import { InputNumber, InputNumberProps } from "antd";
import React from "react";
import { p2e } from "util/util";

export const NumberFormat = (props: InputNumberProps) => {
  return (
    <InputNumber
      parser={(e) => {
        return p2e(e.replace(/,/g, ""));
      }}
      formatter={(value) =>
        ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",").trim()
      }
      {...props}
    />
  );
};
