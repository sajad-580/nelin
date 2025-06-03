import { Pagination as Pages } from "antd";

const Pagination = ({ all, page, setPage }) => {

  const onChange = (p) => {
    setPage(p);
  };
  return (
   <div className="d-flex justify-content-center mt-5">
     <Pages
      // style={{ direction: "ltr" }}
      className="text-center ma-4  ant-pagination-rtl"
      hideOnSinglePage
      pageSize={10}
      total={all}
      showSizeChanger={false}
      onChange={onChange}
      responsive
      current={parseInt(page)}
    />
   </div>
  );
};
export default Pagination;
