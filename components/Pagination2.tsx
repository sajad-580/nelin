import { Pagination as Pages } from "antd";
import React from "react";

const Pagination2 = ({ all, page, setPage, getData }) => {
  const onChange = (p) => {
    setPage(p);
    getData(p);
  };
  return (
    <Pages
      className="text-center m-4"
      hideOnSinglePage
      pageSize={1}
      total={all}
      showSizeChanger={false}
      onChange={onChange}
      responsive
      current={parseInt(page)}
    />
  );
};
export default Pagination2;
