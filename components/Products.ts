import { createContext, useContext } from "react";

export type ProductsContent = {
  token: string;
  setToken: (token: string) => void;
  detailEditOrder: object;
  setDetailEditOrder: (detail) => void;
  tableId: string;
  setTableId: (ti) => void;
  repeatPrinting: boolean;
  setRepeatPrinting: (value: boolean) => void;
  loader?: boolean;
  setLoader?: (value: boolean) => void;
  warehouse?: boolean;
  tax: number;
  setTax: (ti) => void;
  userData: object;
  setUserData: (e) => void,
  logout: () => void,
  interval: () => void,
  tables: any,
  setTables: (e) => void,
  discountList: [],
  setDiscountList: (e) => void,
  activeKey: string,
  setActiveKey: (e) => void,
  selectedTable: object,
  setSelectedTable: (e) => void,
  userAccess: object,
  setUserAccess: (e) => void,
  getTable: () => void,
  socket: any,
};

export const ProductsStateContext = createContext<ProductsContent>({
  token: null,
  setToken: () => { },
  detailEditOrder: {},
  setDetailEditOrder: () => { },
  tableId: "",
  setTableId: () => { },
  repeatPrinting: false,
  setRepeatPrinting: () => { },
  loader: false,
  setLoader: () => { },
  warehouse: true,
  tax: 0,
  setTax: () => { },
  userData: {},
  setUserData: () => { },
  logout: () => { },
  interval: () => { },
  tables: [],
  setTables: () => { },
  discountList: [],
  setDiscountList: () => { },
  activeKey: '',
  setActiveKey: () => { },
  selectedTable: {},
  setSelectedTable: () => { },
  userAccess: {},
  setUserAccess: () => { },
  getTable: () => { },
  socket: '',
});

export const useProductContext = () => useContext(ProductsStateContext);
